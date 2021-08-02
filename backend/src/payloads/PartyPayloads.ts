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

import { PartyStatusCode } from "../models/Party";
import { PlayerStatusCode } from "../models/Player";
import { IPronouns } from "./PlayerPayloads";

/**
 * @typedef CreatePartyRequest
 * @property {string} playerName.required - id of player
 * @property {Pronouns} pronouns.required - pronoun ids
 */
export interface ICreatePartyRequest {
    playerName: string;
    pronouns: IPronouns;
}

/**
 * @typedef JoinPartyRequest
 * @property {string} partyCode.required - code of party to join
 * @property {string} partyId - id of party to join
 * @property {string} playerName.required - name of player
 * @property {Pronouns} pronouns.required - pronoun ids
 */
export interface IJoinPartyRequest {
    partyCode: string
    partyId?: string
    playerName: string;
    pronouns: IPronouns;
}

/**
 * @typedef JoinPartyResponse
 * @property {string} accessToken.required - access token used for subsequent api calls
 * @property {string} partyCode.required - code of party joined
 * @property {string} partyId.required - id of party joined
 */
export interface IJoinPartyResponse {
    accessToken: string;
    partyCode: string;
    partyId: string;
}

/**
 * @typedef PartyStatusResponse
 * @param {number} code.required - Status of party (0 InLobby, 1 Starting, 2 Playing, 3 Ending)
 * @param {number} round.required - Round that the party is on. 0 means no round has been started.
 * @param {number} playerIndex.required - Index of the current player in the players array
 * @param {[PlayerStatus]} players.required - List of players
 */
export interface IPartyStatusResponse {
    code: PartyStatusCode;
    round: number;
    playerIndex: number;
    players: IPlayerStatus[];
}

/**
 * @typedef PlayerStatus
 * @param {string} name.required - Name of player
 * @param {number} code.required - Status of player (0 InLobby, 1 Playing, 2 Done, 3 Left)
 */
export interface IPlayerStatus {
    name: string;
    code: PlayerStatusCode;
}
