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

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { PartyStatusCode } from "../../src/models/Party";
import { ICreatePartyRequest, IJoinPartyRequest, IJoinPartyResponse, IPartyStatusResponse } from "../../src/payloads/PartyPayloads";
import { deleteParty } from "../../src/routes/PartyRoutes";
import { Types } from 'mongoose';
import https from 'https';
import fs from 'fs';

const _openParties: string[] = [];

export const playerNames = [
    'Kermit', 'Miss Piggy', 'Fozzy', 'Animal', 'Gonzo', 'Rizzo', 'Sam Eagle',
    'Ringo', 'Paul', 'George', 'John',
    'Calvin', 'Hobbs', 'Tom', 'Jerry', 'Aretha', 'Marvin', 'Frank', 'Ron', 'Heromine',
    'Harry', 'Dumbledore', 'Toadstool', 'Princess Peach', 'Mario',
];

export const waitForPartyStatus = async (partyState: PartyStatusCode, config: AxiosRequestConfig): Promise<void> => {
    while (true) {
        const res = await axios.get<IPartyStatusResponse>(API_URL + '/party/status', config);
        if (res.data.code === partyState) {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
};

export interface ISpecPlayer {
    name: string;
    response: AxiosResponse<IJoinPartyResponse>;
    config: AxiosRequestConfig;
}

export interface IResponseRef<T> {
    response?: AxiosResponse<T>;
}

const port = process.env.PORT ?? 8000;
export const API_URL = `http://localhost:${port}/api/v1`;

export const httpsAgent = new https.Agent({ 
    keepAlive: true, 
    requestCert: true,
    ca: fs.readFileSync(process.env.SSL_CERT_FILE ?? './../secrets/selfsigned.crt')
});

export const createParty = async (names: string[]): Promise<ISpecPlayer[]> => {
    if (names.length === 0) {
        throw new Error("Must have at least one player");
    }
    
    const configs: ISpecPlayer[]  = []

    // p1 create
    const createBody: ICreatePartyRequest = {
        playerName: names[0],
        pronouns: { first: 'neut1', second: 'neut1' }
    };

    const createRes = await axios.post<IJoinPartyResponse>(
        API_URL + '/party/create',
        createBody,
        { httpsAgent: httpsAgent }
    );

    configs.push({
        name: names[0],
        response: createRes,
        config: {
            httpsAgent: httpsAgent,
            headers: {
                Authorization: 'Bearer ' + createRes.data.accessToken
            }
        }
    });

    _openParties.push(createRes.data.partyId);

    const joinPromises: Promise<AxiosResponse<IJoinPartyResponse>>[] = [];
    for (let i = 1; i < names.length; i++) {
        // p[i] join
        const joinBody: IJoinPartyRequest = {
            partyCode: createRes.data.partyCode,
            partyId: createRes.data.partyId,
            playerName: names[i],
            pronouns: { first: 'neut1', second: 'neut1' }
        };

        joinPromises.push(axios.post<IJoinPartyResponse>(
            API_URL + '/party/join',
            joinBody,
            { httpsAgent: httpsAgent }
        ));
    }

    const joinReses = await Promise.all(joinPromises);
    joinReses.forEach((r, i) => configs.push({
        name: names[i+1],
        response: r,
        config: {
            httpsAgent: httpsAgent,
            headers: {
                Authorization: 'Bearer ' + r.data.accessToken
            }
        }
    }));

    return configs;
};

export const deleteOpenParties = async (): Promise<void> => {
    const promises: Promise<void>[] = [];
    for (const partyId of _openParties) {
        promises.push(deleteParty( Types.ObjectId.createFromHexString(partyId) ));
    }
    await Promise.all(promises);
}
