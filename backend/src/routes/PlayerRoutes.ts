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
import {Request, Response} from 'express';
import Player, { IPlayer, PlayerStatusCode } from '../models/Player';
import HttpStatus from '../payloads/HttpStatus';
import { IPronouns } from '../payloads/PlayerPayloads';
import { IParty, PartyStatusCode } from '../models/Party';
import { deleteParty } from './PartyRoutes';
import { checkRound } from './RoundRoutes';
import { check } from 'express-validator';
import sanitize from 'mongo-sanitize';

router.route('/player/pronouns')
    /**
     * Get player pronouns
     * @route GET /api/player/pronouns
     * @group Player
     * @returns {Pronouns} 200 - Pronoun ids
     * @returns {Error}  401 - Unauthorized
     * @returns {Error}  404 - Player not found
     */
    .get((req: Request, res: Response) => {
        const player: IPlayer = res.locals.player;
        if (player) {
            res.json(player.pronouns);
        } else {
            res.sendStatus(HttpStatus.NotFound);
        }
    })

    /**
     * Set player pronouns
     * @route PUT /api/player/pronouns
     * @group Player
     * @params {Pronouns} body.body - Pronoun ids
     * @returns {string} 200 - Success
     * @returns {Error}  401 - Unauthorized
     * @returns {Error}  400 - Bad request
     * @returns {Error}  404 - Player not found
     * @returns {Error}  500 - Internal server error
     */
    .put([
        check('first').trim().isLength({ min: 1 }).customSanitizer(sanitize),
        check('second').trim().isLength({ min: 1 }).customSanitizer(sanitize),
    ], async (req: Request, res: Response) => {

        let status: HttpStatus = HttpStatus.NotFound;
        const player: IPlayer = res.locals.player;

        if (player) {
            status = HttpStatus.BadRequest;
            const payload = req.body as IPronouns;

            status = HttpStatus.OK;
            player.pronouns = payload;

            try {
                await player.save();
            } catch (err: any) {
                status = HttpStatus.InternalServerError;
            }
        }

        res.sendStatus(status);
    });

/**
 * Leave party
 * @route POST /api/player/leave
 * @group Player
 * @returns {[string]} 200 - Player successfully left
 * @returns {Error}  401 - Unauthorized
 * @returns {Error}  404 - Player not found
 * @returns {Error}  500 - Internal server error
 */
router.post('/player/leave', async (req: Request, res: Response) => {
    const player: IPlayer = res.locals.player;
    const party: IParty = res.locals.party;
    
    if (player) {
        player.status = PlayerStatusCode.Left;

        try {
            await player.save();
            
            const activeCount = await Player.countDocuments({
                party: party._id,
                status: { $ne: PlayerStatusCode.Left }
            });

            if (activeCount === 0) {
                deleteParty(party._id);
            } else if (party.status === PartyStatusCode.Playing) {
                checkRound(party._id);
            }

            res.sendStatus(HttpStatus.OK);
        } catch (err:any) {
            res.sendStatus(HttpStatus.InternalServerError);
        }
    } else {
        res.sendStatus(HttpStatus.NotFound);
    }
});