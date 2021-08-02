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
import { PartyCodeLength, PartyStatusCode } from '../src/models/Party';
import { PlayerStatusCode } from '../src/models/Player';
import { IJoinPartyRequest, IJoinPartyResponse, IPartyStatusResponse } from '../src/payloads/PartyPayloads';
import HttpStatus from '../src/payloads/HttpStatus';
import { createParty, playerNames, waitForPartyStatus, IResponseRef, API_URL, httpsAgent } from './support/SpecGlobals';

const itActsLikeAJoin = (ref: IResponseRef<IJoinPartyResponse>) => {
    it('HTTP Status', () => {
        expect(ref.response?.status).toBe(HttpStatus.OK);
    });

    it('Body', () => {
        expect(ref.response?.data).toBeTruthy();
    });

    it('Access Token', () => {
        expect(ref.response?.data.accessToken).toBeTruthy();
    });

    it('Party Code', () => {
        expect(ref.response?.data.partyCode).toBeTruthy();
        expect(ref.response?.data.partyCode.length).toBe(PartyCodeLength);
    });

    it('Party Id', () => {
        expect(ref.response?.data.partyId).toBeTruthy();
    });
}

const itActsLikeAStatus = (ref: IResponseRef<IPartyStatusResponse>, playerCount: number) => {
    it('HTTP Status', () => {
        expect(ref.response?.status).toBe(HttpStatus.OK);
    });

    it('Body', () => {
        expect(ref.response?.data).toBeTruthy();
    });

    it('State', () => {
        expect(Object.values(PartyStatusCode)).toContain(ref.response?.data.code ?? (-1 as PartyStatusCode));
    });

    it('Round', () => {
        expect(ref.response?.data.round).toBeGreaterThanOrEqual(0);
    });

    it('Players', () => {
        const playerStateValues = Object.values(PlayerStatusCode);
        expect(ref.response?.data.players?.length).toBe(playerCount);
        expect(ref.response?.data.players.every(p => p.name && p.name.length > 0)).toBeTrue();
        expect(ref.response?.data.players.every(p => playerStateValues.includes(p.code))).toBeTrue();
    });
}

describe('Party', () => {

    describe('POST /party/create', () => {
        const ref: IResponseRef<IJoinPartyResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,1));
                ref.response = players[0].response;
            } catch (err:any) {
                ref.response = err.response;
            }
        });

        itActsLikeAJoin(ref);
    });

    describe('POST /party/join', () => {
        const ref: IResponseRef<IJoinPartyResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,2));
                ref.response = players[1].response;
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAJoin(ref);
    });

    describe('POST /party/join (rejoin)', () => {
        const ref: IResponseRef<IJoinPartyResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,2));

                const joinBody: IJoinPartyRequest = {
                    partyCode: players[1].response.data.partyCode,
                    partyId: players[1].response.data.partyId,
                    playerName: players[1].name,
                    pronouns: { first: 'neut1', second: 'neut1' }
                };

                ref.response = await axios.post<IJoinPartyResponse>(
                    API_URL + '/party/join',
                    joinBody,
                    players[1].config
                );
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAJoin(ref);
    });

    describe('POST /party/join (rejoin mismatched name)', () => {
        let res: AxiosResponse<IJoinPartyResponse>
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 2));

                const joinBody: IJoinPartyRequest = {
                    partyCode: players[1].response.data.partyCode,
                    partyId: players[1].response.data.partyId,
                    playerName: players[0].name,
                    pronouns: { first: 'neut1', second: 'neut1' }
                };

                res = await axios.post<IJoinPartyResponse>(
                    API_URL + '/party/join',
                    joinBody,
                    players[1].config
                );
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.NameNotAvailable);
        });
    });

    describe('POST /party/join (dup name)', () => {
        let res: AxiosResponse<IJoinPartyResponse>
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 2));

                const joinBody: IJoinPartyRequest = {
                    partyCode: players[1].response.data.partyCode,
                    partyId: players[1].response.data.partyId,
                    playerName: players[1].name,
                    pronouns: { first: 'neut1', second: 'neut1' }
                };

                res = await axios.post<IJoinPartyResponse>(
                    API_URL + '/party/join',
                    joinBody,
                    { httpsAgent: httpsAgent }
                );
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.NameNotAvailable);
        });
    });

    describe('POST /party/join (party limit)', () => {
        let res: AxiosResponse;

        beforeAll(async () => {
            try {
                const players = await createParty(playerNames);
                res = players[players.length - 1].response;
            } catch (err: any) {
                res = err.response;
            }
        });

        it('HTTP Status', () => {
            expect(res.status).toBe(HttpStatus.PartyFull);
        });
    });

    describe('GET /party/status', () => {
        const ref: IResponseRef<IPartyStatusResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0,8));
                ref.response = await axios.get<IPartyStatusResponse>(
                    API_URL + '/party/status',
                    players[0].config
                );
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAStatus(ref, 8);
    });

    describe('GET /party/status (join during round)', () => {
        const ref: IResponseRef<IPartyStatusResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 2));

                // p1 start round
                await axios.post(API_URL + '/round/start', {entryCount: 8}, players[0].config);
                await waitForPartyStatus(PartyStatusCode.Playing, players[0].config);

                // p3 join
                const joinBody3: IJoinPartyRequest = {
                    partyCode: players[0].response.data.partyCode,
                    partyId: players[0].response.data.partyId,
                    playerName: 'Andy',
                    pronouns: { first: 'neut1', second: 'neut2' }
                };
                const joinRes3 = await axios.post(
                    API_URL + '/party/join',
                    joinBody3,
                    { httpsAgent: httpsAgent }
                );

                const p3Config: AxiosRequestConfig = {
                    httpsAgent: httpsAgent,
                    headers: {
                        Authorization: 'Bearer ' + joinRes3.data.accessToken
                    }
                }

                ref.response = await axios.get<IPartyStatusResponse>(API_URL + '/party/status', p3Config);
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAStatus(ref, 3);
    });

    describe('GET /party/status (during round)', () => {
        const ref: IResponseRef<IPartyStatusResponse> = {};
        beforeAll(async () => {
            try {
                const players = await createParty(playerNames.slice(0, 2));

                // p1 start round
                await axios.post(API_URL + '/round/start', {entryCount: 8}, players[0].config);
                await waitForPartyStatus(PartyStatusCode.Playing, players[0].config);

                // p3 join
                const joinBody3: IJoinPartyRequest = {
                    partyCode: players[0].response.data.partyCode,
                    partyId: players[0].response.data.partyId,
                    playerName: 'Andy',
                    pronouns: { first: 'neut1', second: 'neut2' }
                };
                await axios.post(API_URL + '/party/join', joinBody3, { httpsAgent: httpsAgent });

                ref.response = await axios.get<IPartyStatusResponse>(API_URL + '/party/status', players[0].config);
            } catch (err: any) {
                ref.response = err.response;
            }
        });

        itActsLikeAStatus(ref, 3);
    });
});