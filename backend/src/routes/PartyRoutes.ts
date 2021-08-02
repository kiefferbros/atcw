/**
 * Copyright (C) 2021  Kieffer Bros., LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import router from './Router';
import { Request, Response } from 'express';
import HttpStatus from '../payloads/HttpStatus';
import Party, { IParty, PartyCodeLength, PartySizeMax, PartyStatusCode } from '../models/Party';
import Player, { IPlayer, PlayerNameCharMax, PlayerStatusCode } from '../models/Player';
import { ICreatePartyRequest, IJoinPartyRequest, IJoinPartyResponse, IPartyStatusResponse, IPlayerStatus } from '../payloads/PartyPayloads';
import * as services from '../services';
import { IAccessTokenPayload, IPronouns } from '../payloads/PlayerPayloads';
import { Types } from 'mongoose';
import Story from '../models/Story';
import { check } from 'express-validator';
import sanitize from 'mongo-sanitize';

class PartyLimitError extends Error { }
class DuplicateNameError extends Error { }
class NotFoundError extends Error { }

/**
 * Creates a party with an initial player
 * @route POST /api/party/create
 * @group Party
 * @param {CreatePartyRequest} body.Body - Request body
 * @returns {JoinPartyResponse} 200 - Successfully created and joined party
 * @returns {Error}  default - Unexpected error
 */
router.post('/party/create', [
    check('playerName').trim().isLength({ min: 1, max: PlayerNameCharMax }).customSanitizer(sanitize),
    check('pronouns.first').trim().isLength({ min: 1 }).customSanitizer(sanitize),
    check('pronouns.second').trim().isLength({ min: 1 }).customSanitizer(sanitize)
], async (req: Request, res: Response) => {
    const body = req.body as ICreatePartyRequest;

    try {
        const partyCode = await services.generateCode(PartyCodeLength, async (testCode:string) => {
            const otherParty = await Party.findOne({ code: testCode });
            return otherParty == null;
        });

        const party = await Party.create({
            code: partyCode
        });

        const payload = await joinParty(party, body.playerName, body.pronouns);
        res.json(payload);
    } catch (err:any) {
        res.sendStatus(HttpStatus.InternalServerError);
    }
});

/**
 * Joint a party
 * @route POST /api/party/join
 * @group Party
 * @param {JoinPartyRequest} body.Body - Request body
 * @returns {JoinPartyResponse} 200 - Successfully joined party
 * @returns {Error}  404 - Party not found
 * @returns {Error}  460 - Name is already used in party
 * @returns {Error}  461 - Party is full
 * @returns {Error}  default - Unexpected error
 */
router.post('/party/join', [
    check('partyCode').trim().isLength({ min: PartyCodeLength, max: PartyCodeLength }).customSanitizer(sanitize),
    check('partyId').trim().escape(),
    check('playerName').trim().isLength({ min: 1, max: PlayerNameCharMax }).customSanitizer(sanitize),
    check('pronouns.first').trim().isLength({ min: 1 }).customSanitizer(sanitize),
    check('pronouns.second').trim().isLength({ min: 1 }).customSanitizer(sanitize),
],
async (req: Request, res: Response) => {
    const body = req.body as IJoinPartyRequest;

    const authPlayer: IPlayer|undefined = res.locals.player;

    try {
        const party = body.partyId ? await Party.findById(body.partyId) : await Party.findOne({ code: body.partyCode });
        if (party) {

            const activePlayers = await Player.find({
                party: party._id,
                status: { $ne: PlayerStatusCode.Left }
            });

            if (authPlayer && authPlayer.name === body.playerName && activePlayers.findIndex(p => authPlayer._id.equals(p._id)) !== -1) {
                // rejoin
                const token = await services.jwt.sign({
                    player: authPlayer._id.toString()
                });

                const payload: IJoinPartyResponse = {
                    accessToken: token,
                    partyCode: party.code,
                    partyId: party._id.toString()
                };

                res.json(payload);
            } else if (activePlayers.length < PartySizeMax) {
                const otherPlayer = activePlayers.find(p => p.name === body.playerName);

                if (!otherPlayer) {
                    const payload = await joinParty(party, body.playerName, body.pronouns);
                    res.json(payload);
                } else {
                    throw new DuplicateNameError();
                }
            } else {
                throw new PartyLimitError();
            }
        } else {
            throw new NotFoundError();
        }
    } catch (err: any) {
        switch (true) {
            case err instanceof DuplicateNameError:
                res.sendStatus(HttpStatus.NameNotAvailable);
                break;
            case err instanceof PartyLimitError:
                res.sendStatus(HttpStatus.PartyFull);
                break;
            case err instanceof NotFoundError:
                res.sendStatus(HttpStatus.NotFound);
                break;
            default:
                res.sendStatus(HttpStatus.InternalServerError);
                break;
        }
    }
});

/**
 * Get status of party
 * @route GET /api/party/status
 * @group Party
 * @returns {PartyStatusResponse} 200 - {PartyStatusResponse}
 * @returns {Error} 401 - Not authorized
 * @returns {Error} 404 - Player or party not found
 * @returns {Error} 500 - Internal Server Error
 */
router.get('/party/status', async (req: Request, res: Response) => {
    try {
        const player: IPlayer = res.locals.player;
        const party: IParty = res.locals.party;

        if (player && party) {
            const players = await Player.find({ $and: [
                { party: party._id },
                {
                    $or: [
                        { $and: [{ 
                            round: { $eq: party.round } },
                            { status: { $ne: party.status === PartyStatusCode.InLobby ? PlayerStatusCode.Left : -1 } }
                        ]},
                        { status: { $ne: PlayerStatusCode.Left } }
                    ]
                }
            ]});

            const payload:IPartyStatusResponse = {
                code: party.status,
                round: party.round,
                playerIndex: players.findIndex(p => p._id.equals(player._id)),
                players: players.map<IPlayerStatus>(player => { 
                    return { name: player.name, code: player.status }
                })
            }

            res.json(payload);
        } else {
            res.sendStatus(HttpStatus.NotFound);
        }

    } catch (err:any) {
        res.sendStatus(HttpStatus.InternalServerError);
    }
});

const joinParty = async (party: IParty, name: string, pronouns: IPronouns): Promise<IJoinPartyResponse> => {
    const playerData = {
        party: party._id,
        name: name,
        pronouns: pronouns
    }

    const player = await Player.create(playerData);

    // double check party limit
    const activePlayers = await Player.find({
        _id: { $ne: player._id },
        party: party._id,
        status: { $ne: PlayerStatusCode.Left }
    });
    
    if (activePlayers.length >= PartySizeMax) {
        Player.deleteOne({ _id: player._id }).exec();
        throw new PartyLimitError();
    }

    const otherPlayer = activePlayers.find(p => p.name === name);
    if (otherPlayer) {
        Player.deleteOne({ _id: player._id }).exec();
        throw new DuplicateNameError();
    }

    const partyId = party._id.toString();
    const playerId = player._id.toString();
    const tokenPayload:IAccessTokenPayload = {
        player: playerId
    }

    const token = await services.jwt.sign(tokenPayload);
    const payload: IJoinPartyResponse = {
        accessToken: token,
        partyCode: party.code,
        partyId: partyId
    };

    return payload;
};

export const deleteParty = async (partyId:Types.ObjectId): Promise<void> => {
    try {
        const promises: Promise<any>[] = [];
        promises.push(Party.deleteOne({_id: partyId}).exec());
        promises.push(Player.deleteMany({ party: partyId }).exec());
        promises.push(Story.deleteMany({ party: partyId }).exec());
        await Promise.all(promises);
    } catch (err:any) {
        console.log(err.message);
    }
};
