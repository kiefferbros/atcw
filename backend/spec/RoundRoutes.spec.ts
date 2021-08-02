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

import axios, { AxiosResponse } from 'axios';
import { PartyStatusCode } from '../src/models/Party';
import Story, { IStory } from '../src/models/Story';
import HttpStatus from '../src/payloads/HttpStatus';
import { IPartyStatusResponse } from '../src/payloads/PartyPayloads';
import { IEntryRequest, IFormResponse, IResultsResponse, IStartRoundRequest } from '../src/payloads/RoundPayloads';
import { createParty, IResponseRef, ISpecPlayer, playerNames, waitForPartyStatus, API_URL } from './support/SpecGlobals';

const createPartyAndStartRound = async (names:string[], entryCount: number): Promise<ISpecPlayer[]> => {
    if (names.length < 2) {
        throw new Error('There must be at least two players');
    }

    const players = await createParty(names);
    await axios.post(API_URL + '/round/start', { entryCount }, players[0].config);
    await waitForPartyStatus(PartyStatusCode.Playing, players[0].config);

    return players;
}

const playRound = async (players: ISpecPlayer[], entryCount: number): Promise<AxiosResponse[]> => {
    if (players.length < 2) {
        throw new Error('There must be at least two players');
    }
    const entryPromises: Promise<AxiosResponse>[] = []
    for (let i = 0; i < entryCount; i++) {

        for (const player of players) {
            const payload: IEntryRequest = {
                index: i,
                text: `${player.name}'s entry at ${i}`
            };

            entryPromises.push(axios.post(
                API_URL + '/round/entry',
                payload,
                player.config
            ));
        }
    }

    const entryReses = await Promise.all(entryPromises);

    await waitForPartyStatus(PartyStatusCode.InLobby, players[0].config);

    return entryReses;
}

const resultsDefinition = (playerCount: number) => { 
    const ref: IResponseRef<IResultsResponse> = {};
    const entryCount = 8;
    beforeAll(async () => {
        try {
            const players = await createPartyAndStartRound(playerNames.slice(0, playerCount), entryCount);
            await playRound(players, entryCount);

            ref.response = await axios.get<IResultsResponse>(API_URL + '/round/results', players[0].config);
        } catch (err: any) {
            ref.response = err.response;
        }
    });

    itActsLikeAResultsResponse(ref, playerCount, entryCount);
};

const itActsLikeAResultsResponse = (ref: IResponseRef<IResultsResponse>, playerCount: number, entryCount: number) => {
    it('HTTP Status', () => {
        expect(ref.response?.status).toBe(HttpStatus.OK);
    });

    it('Body', () => {
        expect(ref.response?.data).toBeTruthy();
        
    });

    it('Round', () => {
        expect(ref.response?.data.round).toBeGreaterThan(0);
    });

    it('Stories', () => {
        expect(Array.isArray(ref.response?.data.stories)).toBeTrue();
    });

    it('Player Name', () => {
        expect(ref.response?.data.stories.every(story => story.playerName)).toBeTrue();
    });

    it('Pronouns', () => {
        expect(ref.response?.data.stories.every(story => story.pronouns?.first && story.pronouns?.second)).toBeTrue();
    });

    it('Entries', () => {
        expect(ref.response?.data.stories.every(story => story.entries?.length == entryCount)).toBeTrue();
        expect(ref.response?.data.stories.every(story => story.entries.every(e => e.authorIndex >= 0 && e.authorIndex < playerCount))).toBeTrue();
    });
}

describe('Round', () => {
    describe('POST /round/start', () => {
        let res: AxiosResponse;
        let stories: IStory[];
        const playerCount = 12;
        const entryCount = 8;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, playerCount));
                res = await axios.post(API_URL + '/round/start', {entryCount}, players[0].config);

                await waitForPartyStatus(PartyStatusCode.Playing, players[0].config);

                stories = await Story.find({
                    round: 1,
                    party: players[0].response.data.partyId
                });
            } catch (err:any) {
                res = err.response;
            }
        });

        it("HTTP Status", () => {
            expect(res.status).toBe(HttpStatus.OK);
        });

        it("Stories", () => {
            expect(stories.length).toEqual(playerCount);
        });

        it("Entry Author Indices", () => {
            expect(stories.every((authStory, i) => {
                for (let j = 0; j < entryCount; j++) {
                    const toId = authStory.form[j];
                    const toStoryIdx = stories.findIndex(s => s.player.equals(toId));
                    if (toStoryIdx === -1 || stories[toStoryIdx].entries[j].authorIndex !== i) {
                        return false;
                    }
                }
                return true;
            })).toBeTrue();
        });
    });

    describe('POST /round/start (too few players)', () => {
        let res: AxiosResponse;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 1));
                res = await axios.post(API_URL + '/round/start', {entryCount: 8}, players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it("Status", () => {
            expect(res.status).toBe(HttpStatus.TooFewPlayers);
        });
    });

    describe('POST /round/start (in round)', () => {
        let res: AxiosResponse;
        const entryCount = 10;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, 2), entryCount);
                res = await axios.post(API_URL + '/round/start', {entryCount}, players[1].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it("Status", () => {
            expect(res.status).toBe(HttpStatus.Conflict);
        });
    });

    describe('GET /round/form', () => {
        let res: AxiosResponse<IFormResponse>;
        const entryCount = 6;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, 2), entryCount);
                res = await axios.get<IFormResponse>(API_URL + '/round/form', players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Body', () => {
            expect(res.data).toBeTruthy();
        });

        it('Pronouns', () => {
            expect(Array.isArray(res.data.pronouns)).toBeTrue();
            expect(res.data.pronouns.length).toBe(entryCount);
            expect(res.data.pronouns.every(ps => ps?.first && ps?.second)).toBeTrue();
        });
    });

    describe('GET /round/form (too early)', () => {
        let res: AxiosResponse<IFormResponse>;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 2));
                await axios.post(API_URL + '/round/start', {}, players[0].config);
                // don't wait for playing state
                res = await axios.get<IFormResponse>(API_URL + '/round/form', players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it("Status", () => {
            expect(res.status).toBe(HttpStatus.Conflict);
        });
    });

    describe('POST /round/entry', () => {
        let res: AxiosResponse;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, 2), 8);

                const payload: IEntryRequest = {
                    index: 0,
                    text: `${players[0].name}'s entry at ${0}`
                };

                res = await axios.post(
                    API_URL + '/round/entry',
                    payload,
                    players[0].config
                );
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('POST /round/entry (all)', () => {
        let entryReses: AxiosResponse[];
        let statusRes: AxiosResponse<IPartyStatusResponse>;
        const names = playerNames.slice(0, 12);
        const entryCount = 9;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(names, entryCount);
                entryReses = await playRound(players, entryCount);
            } catch (err: any) {
                statusRes = err.response;
            }
        });

        it('Entry HTTP Statuses', () => {
            expect(entryReses?.length).toBe(names.length * entryCount);
            expect(entryReses?.every(r => r.status === HttpStatus.OK)).toBeTrue();
        });
    });

    describe('POST /round/entry (late)', () => {
        let res: AxiosResponse;
        const entryCount = 5;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, 2), entryCount);
                await playRound(players, entryCount);

                const payload: IEntryRequest = {
                    index: 0,
                    text: `${players[1].name}'s late entry at ${0}`
                };
                res = await axios.post(API_URL + '/round/entry', payload, players[1].config);

            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.Conflict);
        });
    });

    describe('POST /round/end', () => {
        let res: AxiosResponse;
        const entryCount = 7;
        beforeAll(async () => {
            try {

                const players = await createPartyAndStartRound(playerNames.slice(0, 2), entryCount);

                const entryPromises: Promise<any>[] = []
                for (let i = 0; i < entryCount; i++) {
                    // all p1 entries
                    entryPromises.push(axios.post(API_URL + '/round/entry', {
                        index: i,
                        text: `${players[0].name}'s entry at ${i}`
                    }, players[0].config));

                    // some of p2 entries
                    if (i < 4) {
                        entryPromises.push(axios.post(API_URL + '/round/entry', {
                            index: i,
                            text: `${players[1].name}'s entry at ${i}`
                        }, players[1].config));
                    }
                }

                await Promise.all(entryPromises);

                // p1 end round
                res = await axios.post(API_URL + '/round/end', {}, players[0].config);

                await waitForPartyStatus(PartyStatusCode.InLobby, players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });
        
        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('POST /round/end (too late)', () => {
        let res: AxiosResponse;
        const entryCount = 8;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, 2), entryCount);
                await playRound(players, entryCount);

                // p1 end round
                res = await axios.post(API_URL + '/round/end', {}, players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.Conflict);
        });
    });

    describe('GET /round/results (2 players)', () => resultsDefinition(2));
    describe('GET /round/results (4 players)', () => resultsDefinition(4));
    describe('GET /round/results (12 players)', () => resultsDefinition(12));

    describe('GET /round/results (early leave)', () => {
        const ref: IResponseRef<IResultsResponse> = {};
        const playerCount = 2;
        const entryCount = 9;
        beforeAll(async () => {
            try {
                const players = await createPartyAndStartRound(playerNames.slice(0, playerCount), entryCount);


                const entryPromises: Promise<any>[] = []
                for (let i = 0; i < entryCount; i++) {
                    // all p1 entries
                    entryPromises.push(axios.post(API_URL + '/round/entry', {
                        index: i,
                        text: `${players[0].name}'s entry at ${i}`
                    }, players[0].config));

                    // some of p2 entries
                    if (i < 4) {
                        entryPromises.push(axios.post(API_URL + '/round/entry', {
                            index: i,
                            text: `${players[1].name}'s entry at ${i}`
                        }, players[1].config));
                    }
                }
                await Promise.all(entryPromises);

                // p2 leave
                await axios.post(API_URL + '/player/leave', {}, players[1].config);
                await waitForPartyStatus(PartyStatusCode.InLobby, players[0].config);

                ref.response = await axios.get<IResultsResponse>(API_URL + '/round/results', players[0].config);
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAResultsResponse(ref, playerCount, entryCount);
    });
});