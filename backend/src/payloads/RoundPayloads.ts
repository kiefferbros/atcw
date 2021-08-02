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

import { IPronouns } from "./PlayerPayloads";

/**
 * @typedef StartRoundRequest
 * @property {number} entryCount.required - number of entries per story
 */
export interface IStartRoundRequest {
    entryCount: number;
}

/**
 * @typedef FormResponse
 * @property {[Pronouns]} pronouns - lists of 8 pronoun pairs
 * @property {number} entryIndex - index of first incomplete entry for player. entry index of 8 implies a complete form
 */
export interface IFormResponse {
    pronouns: IPronouns[];
    startIndex: number;
}

/**
 * @typedef EntryRequest
 * @property {number} entryIndex - index of entry
 * @property {string} text - text of entry
 */
export interface IEntryRequest {
    index: number;
    text: string;
}

/**
 * @typedef ResultsResponse
 * @property {number} round - round number
 * @property {[ResultsStory]} stories - list of stories
 */
export interface IResultsResponse {
    round: number;
    stories: IResultsStory[];
}

/**
 * @typedef ResultsStory
 * @property {string} playerName - name of player
 * @property {Pronouns} pronouns - pronoun ids
 * @property {[Entry]} entries - list of 8 entires
 */
export interface IResultsStory {
    playerName: string;
    pronouns: IPronouns;
    entries: IEntry[];
}

/**
 * @typedef Entry
 * @property {string} text - text of entry
 * @property {number} authorIndex - index of author in the results response stories array
 */
export interface IEntry {
    text: string;
    authorIndex: number;
}