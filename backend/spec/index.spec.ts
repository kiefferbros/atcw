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

import { Server } from 'http';
import axios, { AxiosResponse } from 'axios';
import {API_URL, deleteOpenParties, httpsAgent} from './support/SpecGlobals';

describe("API", () => {
    let server: Server;
    const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        server = await (await import('../src/Server')).serverPromise;
    });

    afterAll(async () => {
        if (server) {
            try {
                await deleteOpenParties();
            } finally {
                server.close();
            }
        }
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    describe("GET /api/", () => {
        let res: AxiosResponse;
        beforeAll(async () => {
            try {
                res = await axios.get(API_URL, { httpsAgent: httpsAgent});
            } catch (err: any) {
                res = err.response;
            }
        });

        it("Status 200", () => {
            expect(res.status).toBe(200);
        });

        it("Body", () => {
            expect(res.data).toBe("You've found an API.");
        });
    });

    require("./PartyRoutes.spec");
    require("./PlayerRoutes.spec");
    require("./RoundRoutes.spec");
});