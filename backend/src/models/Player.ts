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

import { model, Schema, Model, Document, Types } from 'mongoose';
import { IPronouns } from '../payloads/PlayerPayloads';

export const PlayerNameCharMax: number = 128;

export enum PlayerStatusCode {
    InLobby,
    Playing,
    Done,
    Left
}

export interface IPlayer extends Document {
    name: string;
    party: Types.ObjectId;
    pronouns: IPronouns;
    status: PlayerStatusCode;
    round: number;
    joined: Date;
}

export const pronounsNestedSchema = {
    first: {
        type: Schema.Types.String,
        minlength: 1,
        required: true,
    },
    second: {
        type: Schema.Types.String,
        minlength: 1,
        required: true,
    }
};

const playerSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        minlength: 1,
        default: 'Player'
    },
    party: {
        type: Schema.Types.ObjectId,
        required: true
    },
    pronouns: pronounsNestedSchema,
    status: {
        type: Schema.Types.Number,
        required: true,
        default: PlayerStatusCode.InLobby
    },
    round: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    },
    joined: {
        type: Schema.Types.Date,
        default: new Date()
    }
});

const Player: Model<IPlayer> = model('Player', playerSchema);
export default Player;