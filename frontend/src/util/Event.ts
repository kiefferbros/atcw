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

export interface IEvent<T, R = void> {
    addListener(listener: (arg: T) => R): void;
    removeListener(listener: (arg: T) => R): void;
}

export class Event<T, R = void> implements IEvent<T, R> {
    private _listeners = new Set<(arg: T) => R>();

    public addListener(listener: (arg: T) => R): void {
        this._listeners.add(listener);
    }

    public removeListener(listener: (arg: T) => R): void {
        this._listeners.delete(listener);
    }

    public dispatch(arg: T): R {
        const clone = new Set<(arg: T) => R>(this._listeners);
        let results: any;
        clone.forEach(listener => results = listener(arg));
        return results;
    }
}