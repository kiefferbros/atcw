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

import {CorsOptions} from 'cors';

const corsWhitelist: string[] = [
    process.env.HOST ? `https://${process.env.HOST}` : "https://localhost:4443",
    "https://127.0.0.1:4443",
];

export const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, origin?: string[]) => void) => {
        const error: Error | null = origin && corsWhitelist.indexOf(origin) === -1 ?
            new Error("Not valid origin. " + origin) :
            null;
        callback(error, corsWhitelist);
    },
    methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Access-Control-Allow-Origin', 'Content-type', 'Accept', 'X-Custom-Header', 'Authorization']
}