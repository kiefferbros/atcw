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

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PartyStatusCode } from '../src/models/Party';
import HttpStatus from '../src/payloads/HttpStatus';
import { IJoinPartyRequest, IPartyStatusResponse } from '../src/payloads/PartyPayloads';
import { IPronouns } from '../src/payloads/PlayerPayloads';
import { IEntryRequest } from '../src/payloads/RoundPayloads';
import { createParty, playerNames, waitForPartyStatus, API_URL, httpsAgent } from './support/SpecGlobals';

describe('Player', () => {
    describe('GET /api/v1/player/pronouns', () => {
        let res: AxiosResponse<IPronouns>;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,1));
                res = await axios.get<IPronouns>(
                    API_URL + '/player/pronouns',
                    players[0].config
                );
            } catch (err:any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Body', () => {
            expect(res.data).toBeTruthy;
        });

        it('First', () => {
            expect(res.data.first).toBeTruthy;
        });

        it('Second', () => {
            expect(res.data.second).toBeTruthy;
        });
    });

    describe('PUT /api/v1/player/pronouns', () => {
        let putRes: AxiosResponse;
        let getRes: AxiosResponse<IPronouns>;
        beforeAll(async () => {
            const payload: IPronouns = { first: 'masc', second: 'fem' };
            try {
                const players = await createParty(playerNames.slice(0, 1));
                putRes = await axios.put(
                    API_URL + '/player/pronouns',
                    payload,
                    players[0].config
                );

                getRes = await axios.get<IPronouns>(
                    API_URL + '/player/pronouns',
                    players[0].config
                );
            } catch (err:any) {
                putRes = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(putRes.status).toBe(HttpStatus.OK);
        });

        it('First', () => {
            expect(getRes.data.first).toBe('masc');
        });

        it('Second', () => {
            expect(getRes.data.second).toBe('fem');
        });
    });

    describe('POST /api/v1/player/leave', () => {
        let res: AxiosResponse;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,8));
                const promises: Promise<any>[] = [];
                while (players.length > 4)
                {
                    const player = players[players.length - 1];
                    promises.push(axios.post(
                        API_URL + '/player/leave',
                        {},
                        player.config
                    ));
                    players.pop();
                }
                const reses = await Promise.all(promises);
                res = reses[reses.length - 1]
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('POST /api/v1/player/leave (auto-delete party)', () => {
        let res: AxiosResponse;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 1));
                await axios.post(API_URL + '/player/leave', {}, players[0].config);
                await new Promise((resolve) => setTimeout(resolve, 10));
                
                const joinBody: IJoinPartyRequest = {
                    partyCode: players[0].response.data.partyCode,
                    partyId: players[0].response.data.partyId,
                    playerName: 'Toby',
                    pronouns: { first: 'fem', second: 'fem' }
                };
                res = await axios.post(
                    API_URL + '/party/join',
                    joinBody,
                    { httpsAgent: httpsAgent }
                );

            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.NotFound);
        });
    });

    describe('POST /api/v1/player/leave (auto-end round)', () => {
        let res: AxiosResponse<IPartyStatusResponse>;
        const entryCount = 10;
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,2));

                // p1 start round
                await axios.post(API_URL + '/round/start', {entryCount}, players[0].config);
                await waitForPartyStatus(PartyStatusCode.Playing, players[0].config);

                // p1 enter all entries
                for (let i = 0; i < entryCount; i++) {
                    const entryBody: IEntryRequest = {
                        index: i,
                        text: `${players[0].name}'s entry at ${i}`
                    }
                    await axios.post(API_URL + '/round/entry', entryBody, players[0].config);
                }

                // p2 leave
                await axios.post(API_URL + '/player/leave', {}, players[1].config);
                await new Promise((resolve) => setTimeout(resolve, 500));
                
                // check status
                res = await axios.get<IPartyStatusResponse>(API_URL + '/party/status', players[0].config);
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Party State', () => {
            expect(res.data.code).toBe(PartyStatusCode.InLobby);
        });
    });
});