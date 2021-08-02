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

export enum PartyStatusCode {
    InLobby,
    Starting,
    Playing,
    Ending
}

export enum PlayerStatusCode {
    InLobby,
    Playing,
    Done,
    Left
}

export interface IJoinResponse {
    accessToken: string;
    partyCode: string;
    partyId: string;
}

export interface IPartyStatus {
    code: PartyStatusCode;
    round: number;
    playerIndex: number;
    players: readonly IPlayerStatus[];
}

export const statusChanged = (a: IPartyStatus | undefined, b: IPartyStatus | undefined):boolean => {
    if ((a === undefined) !== (b === undefined)) {
        return true;
    }

    return (
        a !== undefined && b !== undefined && (
            a.code !== b.code ||
            a.round !== b.round ||
            a.players.length !== b.players.length ||
            !a.players.every((ai, i) => {
                return ai.code === b.players[i].code &&
                    ai.name === b.players[i].name;
            })
        )
    );
}

export interface IPlayerStatus {
    name: string;
    code: PlayerStatusCode;
}

export interface IPronouns {
    first: string;
    second: string;
}

export interface IStoryForm {
    pronouns: readonly IPronouns[];
    startIndex: number;
}

export interface IResultsResponse {
    round: number;
    stories: readonly IStory[];
}

export interface IStory {
    playerName: string;
    pronouns: IPronouns;
    entries: readonly IEntry[];
}

export interface IEntry {
    text: string;
    authorIndex: number;
}

export interface ICreatePartyRequest {
    playerName: string;
    pronouns: IPronouns;
}

export interface IJoinPartyRequest {
    partyCode: string
    partyId?: string
    playerName: string;
    pronouns: IPronouns;
}

export interface IStartRoundRequest {
    entryCount: number;
}

export interface IEntryRequest {
    index: number;
    text: string;
}

export enum HttpStatus {
    OK = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    RequestTimeout = 408,
    Conflict = 409,
    NameNotAvailable = 460,
    PartyFull = 461,
    EntryAlreadyExists = 462,
    TooFewPlayers = 463,
    InternalServerError = 500,
    NotImplemented = 501,
};