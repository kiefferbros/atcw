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

import jwt from 'jsonwebtoken';
import fs from 'fs/promises'

export default class JWTService {
    private _secret:string = '';

    private async _getSecret(): Promise<string> {
        if (this._secret.length === 0) {
            const secretFile: string = process.env.MONGO_USERNAME_FILE ?? "./../secrets/jwt-secret";
            this._secret = (await fs.readFile(secretFile)).toString();
        }
        return this._secret;
    }

    public async sign(data:any) : Promise<string> {
        const secret = await this._getSecret();
        return new Promise((resolve, reject) => {
            jwt.sign(data, this._secret, (err:Error|null, token:string|undefined) => {
                if (token && !err) {
                    resolve(token)
                } else {
                    reject(err);
                }
            });
        });
    }

    public async verify<T extends object = any>(token: string): Promise<T | undefined> {
        const secret = await this._getSecret();
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err:Error|null, decoded: object|undefined) => {
                if (!err) {
                    resolve(decoded as T);
                } else {
                    reject(err);
                }
            });
        });
    }
}