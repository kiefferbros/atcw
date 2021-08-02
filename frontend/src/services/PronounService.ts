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

export type PronounForm = 'subj'|'obj'|'pos'|'pospr'|'refl'

export type PronounForms = {
    [key in PronounForm]: string;
};

export type PronounFormMap = {
    [key: string]: PronounForms;
};

export const NoPronoun = 'none';

export default class PronounService {

    private _map = new Map<string, PronounForms>();
    private _ids:string[] = [];

    constructor(map: PronounFormMap) {
        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                this._map.set(key, map[key]);
                this._ids.push(key);
            }
        }
    }

    public getString(pronounId: string, form: PronounForm, noneName?: string): string {

        if (pronounId === NoPronoun) {
            if (noneName) {
                return form === 'pos' || form === 'pospr' ? noneName + '\'s' : noneName;
            }
            return '';
        }

        const forms = this._map.get(pronounId);
        return forms ? forms[form] : '';
    }

    public get ids(): readonly string[] {
        return this._ids;
    }
}