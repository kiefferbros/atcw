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

import { CancelToken } from "axios";
import { api, pronouns } from "./";
import { IPronouns } from "./api_client";

const firstPronounKey = 'firstPronoun';
const secondPronounKey = 'secondPronoun';

type Primitive = string | number | boolean;

export default class PreferencesService {
    private _firstPronoun: string;
    private _secondPronoun: string;

    private _temp = new Map<string, any>();

    constructor() {
        this._firstPronoun = localStorage.getItem(firstPronounKey)?.toLowerCase() ?? pronouns.ids[0];
        this._secondPronoun = localStorage.getItem(secondPronounKey)?.toLowerCase() ?? pronouns.ids[1];
    }

    public getPronouns(): IPronouns {
        return { first: this._firstPronoun, second: this._secondPronoun } ;
    }

    /**
     * Attempts to set the player pronouns on the server. If successful, the pronoun
     * will be stored in local storage. In unsuccessful, an error will be thrown.
     * @param {string} first - pronoun of first person
     * @param {string} second - pronoun of second person
     */
    public async setPronouns(first: string, second: string, cancelToken?:CancelToken): Promise<void> {
        await api.setPronouns({ first, second }, cancelToken);
        localStorage.setItem(firstPronounKey, first);
        localStorage.setItem(secondPronounKey, second);
        this._firstPronoun = first;
        this._secondPronoun = second;
    }

    public get<T extends Primitive>(key: string): T | undefined {
        const strValue = localStorage.getItem(key);
        return strValue ? strValue as T : undefined;
    }

    public set<T extends Primitive>(key: string, value: T): void {
        localStorage.setItem(key, value.toString());
    }

    public remove(key: string) {
        localStorage.removeItem(key);
    }

    public getTemp<T>(key: string): T | undefined {
        const value = this._temp.get(key);
        return value ? value as T : undefined;
    }

    public setTemp(key: string, value: any): void {
        this._temp.set(key, value);
    }

    public removeTemp(key: string) {
        this._temp.delete(key);
    }
}
