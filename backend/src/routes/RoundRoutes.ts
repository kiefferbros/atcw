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
import Party, { IParty, PartyStatusCode } from '../models/Party';
import Story, { EntryCharMax, EntryCountMax, IStory } from '../models/Story';
import { LeanDocument, Types } from 'mongoose';
import { IEntryRequest, IFormResponse, IResultsResponse, IEntry, IStartRoundRequest } from '../payloads/RoundPayloads';
import { IPronouns } from '../payloads/PlayerPayloads';
import { check } from 'express-validator';
import sanitize from 'mongo-sanitize';

const graceInterval = 3000;
const tokenMap = new Map<string, ICancelPair>();

/**
 * Start a round
 * @route POST /api/round/start
 * @group Round
 * @returns {string} 200 - Success
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Player or party not found
 * @returns {Error} 409 - Conflict: party is not in a state that a round can be started
 * @returns {Error} 463 - Too Few Player: party does not have enough players to start round
 * @returns {Error} 500 - Internal server error
 */
router.post('/round/start', [
    check('entryCount').toInt()
], async (req: Request, res: Response) => {
    let responseCode = HttpStatus.NotFound;

    const player: IPlayer = req.res?.locals.player;
    const party: IParty = req.res?.locals.party;
    if (player && party) {
        responseCode = HttpStatus.Conflict;

        if (party.status == PartyStatusCode.InLobby) {
            try {
                responseCode = HttpStatus.TooFewPlayers;

                const playerCount = await Player.countDocuments({
                    party: party._id,
                    status: PlayerStatusCode.InLobby
                });

                if (playerCount > 1) {
                    party.status = PartyStatusCode.Starting;
                    party.round++;

                    await party.save();

                    responseCode = HttpStatus.OK;
                    
                    const body = req.body as IStartRoundRequest;
                    const entryCount = Math.min(Math.max(body.entryCount || 1, 1), EntryCountMax);
                    setTimeout(buildStories, graceInterval, party._id, entryCount);
                }

            } catch (err:any) {
                responseCode = HttpStatus.InternalServerError;
            }
        }
    }
    res.sendStatus(responseCode);
});


/**
 * Get a pronoun form for the active round
 * @route GET /api/round/form
 * @group Round
 * @returns {string} 200 - Success
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Player or party or story not found
 * @returns {Error} 409 - Conflict: party is not in a state that a form can be retrieved
 * @returns {Error} 500 - Internal server error
 */
router.get('/round/form', async (req: Request, res: Response) => {

    const player: IPlayer = req.res?.locals.player;
    const party: IParty = req.res?.locals.party;
    if (player && party) {
        if (party.status === PartyStatusCode.Playing || party.status === PartyStatusCode.Ending) {
            try {
                const playerStory = await Story.findOne({
                    party: party._id,
                    player: player._id,
                    round: party.round
                });

                if (playerStory)
                {
                    const formStories = await Story.find({
                        party: party._id,
                        player: { $in: playerStory.form },
                        round: party.round
                    });

                    const pronouns:IPronouns[] = [];

                    let entryIndex = 0;
                    playerStory.form.forEach((e, i) => {
                        const story = formStories.find(s => s.player.equals(e));

                        if (!story) {
                            throw new Error('Unable to find a story for every form entry');
                        }

                        if (story.entries[i].text.length > 0) {
                            entryIndex = i + 1;
                        }

                        pronouns.push(story.pronouns);
                    });

                    const payload: IFormResponse = {
                        pronouns: pronouns,
                        startIndex: entryIndex
                    };

                    res.json(payload);
                } else {
                    res.status(HttpStatus.NotFound);
                }
            } catch (err:any) {
                res.sendStatus(HttpStatus.InternalServerError);
            }

        } else {
            res.sendStatus(HttpStatus.Conflict);
        }
    } else {
        res.sendStatus(HttpStatus.NotFound);
    }
});

/**
 * Post a story entry
 * @route POST /api/round/entry
 * @group Round
 * @returns {string} 200 - Success
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Player or party not found
 * @returns {Error} 409 - Conflict: party is not in a state that an entry can be submitted
 * @returns {Error} 462 - Entry Already Exists: an entry already exist at the index
 * @returns {Error} 500 - Internal server error
 */
router.post('/round/entry', [
    check('index').toInt(),
    check('text').trim().isLength({ min: 1, max: EntryCharMax }).customSanitizer(sanitize)
], async (req: Request, res: Response) => {
    let statusCode = HttpStatus.NotFound;

    const player: IPlayer = req.res?.locals.player;
    const party: IParty = req.res?.locals.party;

    if (player && party) {
        statusCode = HttpStatus.Conflict;

        if (party.status === PartyStatusCode.Playing || party.status === PartyStatusCode.Ending) {
            try {
                statusCode = HttpStatus.NotFound;

                const playerStory = await Story.findOne({
                    party: party._id,
                    player: player._id,
                    round: party.round
                });

                const body = req.body as IEntryRequest;

                if (playerStory && body.index >= 0 && body.index < playerStory.entries.length) {
                    const entryStory = await Story.findOne({
                        party: party._id,
                        player: playerStory.form[body.index],
                        round: party.round
                    });

                    if (entryStory) {
                        statusCode = HttpStatus.EntryAlreadyExists;

                        if (entryStory.entries[body.index].text.length === 0) {
                            entryStory.entries[body.index].text = body.text;
                            entryStory.markModified(`entries.${body.index}.text`);
                            await entryStory.save();

                            const storiesInForm = await Story.find({
                                party: party._id,
                                player: { $in: playerStory.form },
                                round: party.round
                            });

                            const formStories = playerStory.form.map(pId => storiesInForm.find(s => s.player.equals(pId)));

                            const playerDone = formStories.every((s, i) => s?.entries[i].text.length ?? 0 > 0);
                            if (playerDone) {
                                player.status = PlayerStatusCode.Done;
                                await player.save();
                                
                                if (party.status === PartyStatusCode.Playing) {
                                    checkRound(party._id);
                                }
                            }

                            statusCode = HttpStatus.OK;
                        }
                    }
                }
            } catch (err: any) {
                statusCode = HttpStatus.InternalServerError;
            }
        }
    }
    res.sendStatus(statusCode);
});

/**
 * End a round
 * @route POST /api/round/end
 * @group Round
 * @returns {string} 200 - Success
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Player or party not found
 * @returns {Error} 409 - Conflict: party is not in a state that a round can be ended
 * @returns {Error} 500 - Internal server error
 */
router.post('/round/end', async (req: Request, res: Response) => {
    let responseCode = HttpStatus.NotFound;

    const player: IPlayer = req.res?.locals.player;
    const party: IParty = req.res?.locals.party;
    if (player && party) {
        responseCode = HttpStatus.Conflict;

        if (party.status === PartyStatusCode.Playing && player.status === PlayerStatusCode.Done) {
            try {
                party.status = PartyStatusCode.Ending;
                await party.save();

                responseCode = HttpStatus.OK;

                setTimeout(tryEndRound, graceInterval, party._id);
            } catch (err: any) {
                responseCode = HttpStatus.InternalServerError;
            }
        }
    }
    res.sendStatus(responseCode);
});

/**
 * Get current round stories
 * @route GET /api/round/results
 * @group Round
 * @returns {ResultsResponse} 200 - Stories from current round
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 404 - Player or party not found
 * @returns {Error} 409 - Conflict: party is not in a state that a round stories can be retrieved
 * @returns {Error} 500 - Internal server error
 */
router.get('/round/results', async (req: Request, res: Response) => {
    const player: IPlayer = req.res?.locals.player;
    const party: IParty = req.res?.locals.party;
    if (player && party) {

        if (party.status === PartyStatusCode.InLobby && party.round > 0) {
            try {
                const stories = await Story.find({
                   party: party._id,
                   round: party.round
                });

                const playerIds = stories.map(s => s.player);
                const storyPlayers = await Player.find({
                    _id: { $in: playerIds },
                    party: party._id
                }).sort({ joined: 1 });

                if (storyPlayers.length !== stories.length) {
                    throw new Error(`Stories and players do not have equal lengths ${stories.length} != ${storyPlayers.length}`);
                }

                stories.sort((a, b) => storyPlayers.findIndex(p => a.player.equals(p._id)) - storyPlayers.findIndex(p => b.player.equals(p._id)));

                const results:IResultsResponse = { 
                    round: party.round,
                    stories: stories.map((s, i) => ({
                        playerName: storyPlayers[i].name,
                        pronouns: s.pronouns,
                        entries: s.entries
                    }))
                };

                res.json(results);
            } catch (err: any) {
                res.sendStatus(HttpStatus.InternalServerError);
            }
        } else {
            res.sendStatus(HttpStatus.Conflict);
        }
    } else {
        res.sendStatus(HttpStatus.NotFound);
    }
});

const buildStories = async (partyId:Types.ObjectId, entryCount: number) : Promise<void> => {
    try {
        const party = await Party.findById(partyId);
        if (party && party.status == PartyStatusCode.Starting) {
            const players = await Player.find({ 
                party: party._id, 
                status: { $ne: PlayerStatusCode.Left } 
            }).sort({ joined: 1 });

            const shuffleIdxs: number[] = shuffle(players.map((p, i) => i));

            const storyData: LeanDocument<IStory>[] = [];
            for (let i = 0; i < players.length; ++i) {
                const form: Types.ObjectId[] = [];
                const entries: IEntry[] = [];
                
                for (let j = 0; j < entryCount; j++) {
                    entries.push({ text: '', authorIndex: -1} );
                    form.push(players[shuffleIdxs[(i + j) % players.length]]._id);
                }

                storyData.push({
                    player: players[i]._id,
                    party: party._id,
                    round: party.round,
                    pronouns: { ...players[i].pronouns },
                    entries: entries,
                    form: form
                });
            }
            
            // we should be able to calculate these in the first pass, but my puny brain cannot figure it out
            for (let i = 0; i < players.length; ++i) {
                const authStory = storyData[i];
                for (let j = 0; j < entryCount; j++) {
                    const toId = authStory.form[j];
                    const toStoryIdx = storyData.findIndex(s => s.player.equals(toId));
                    if (toStoryIdx !== -1) {
                        storyData[toStoryIdx].entries[j].authorIndex = i;
                    } else {
                        throw new Error('Missing story to set entry author.');
                    }
                }
            }

            await Promise.all(storyData.map(m => Story.create(m)));

            const savePromises: Promise<IPlayer>[] = [];
            for (const player of players) {
                player.status = PlayerStatusCode.Playing;
                player.round = party.round;

                savePromises.push(player.save());
            }
            await Promise.all(savePromises);

            party.status = PartyStatusCode.Playing;
            await party.save();
        }
    } catch (err:any) {
        console.log('Error building round: ' + err.message);
    }
}

export const checkRound = async (partyId: Types.ObjectId): Promise<void> => {
    const key = partyId.toString();
    let pair = tokenMap.get(key);

    if (pair) {
        pair.token.cancel();
        await pair.promise;
    }

    const token = new CancelToken();
    pair = {
        promise: tryCheckRound(partyId, token).catch((reason:any) => {
            // pass
        }).finally(() => {
            if (tokenMap.get(key)?.token === token) {
                tokenMap.delete(key);
            }
        }),
        token: token
    };
    tokenMap.set(key, pair);
}

const tryCheckRound = async (partyId: Types.ObjectId, cancelToken: CancelToken): Promise<void> => {
    const party = await Party.findById(partyId);
    cancelToken.throwIfCancelled();

    if (party && party.status === PartyStatusCode.Playing) {
        const activePlayers = await Player.find({
            party: party._id,
            round: party.round,
            status: { $in: [PlayerStatusCode.Playing, PlayerStatusCode.Done] }
        });

        cancelToken.throwIfCancelled();

        if (party.status === PartyStatusCode.Playing && activePlayers.every(p => p.status === PlayerStatusCode.Done)) {
            party.status = PartyStatusCode.Ending;
            await party.save();
            await endRound(party, activePlayers);
        }
    }
}

const tryEndRound = async (partyId: Types.ObjectId): Promise<void> => {
    const party = await Party.findById(partyId);
    if (party && party.status === PartyStatusCode.Ending) {
        const activePlayers = await Player.find({
            party: party._id,
            round: party.round,
            status: { $in: [PlayerStatusCode.Playing, PlayerStatusCode.Done] }
        });
        await endRound(party, activePlayers);
    }
};

const endRound = async (party: IParty, activePlayers: IPlayer[]): Promise<void> => {
    const savePromises: Promise<any>[] = [];
    party.status = PartyStatusCode.InLobby;
    savePromises.push(party.save());

    for (const p of activePlayers) {
        p.status = PlayerStatusCode.InLobby;
        savePromises.push(p.save());
    }

    await Promise.all(savePromises);
};

const shuffle = <T>(array: T[]): T[] => {
    let currentIndex:number = array.length, randomIndex;
    let temporaryValue:T;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

interface ICancelPair {
    promise: Promise<any>;
    token: CancelToken;
}

class CancelToken {
    private _cancelled: boolean = false;


    public cancel(): void {
        this._cancelled = true;
    }

    public throwIfCancelled(): void {
        if (this._cancelled) {
            throw new Error("Token Cancelled");
        }
    }
}