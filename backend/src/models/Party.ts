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

import { model, Types, Schema, Model, Document } from 'mongoose';

export const PartySizeMax: number = 24;
export const PartyCodeLength: number = 6;

export enum PartyStatusCode {
    InLobby,
    Starting,
    Playing,
    Ending
};

export interface IParty extends Document {
    code: string;
    expiration: Date;
    round: number;
    status: PartyStatusCode;
}

const PartySchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        minlength: PartyCodeLength,
        maxlength: PartyCodeLength,
        unique: true
    },
    expiration: {
        type: Date,
        required: true,
        default: new Date(Date.now() + 8.64e7) // now plus 24 hrs
    },
    players: {
        type: [Schema.Types.ObjectId],
        ref: 'Player',
        required: true,
        default: [],
        validate: [
            (val: string[]) => {
                return val.length <= 24;
            },
            '{PATH} exceeds the limit of 24'
        ]
    },
    status: {
        type: Number,
        required: true,
        default: PartyStatusCode.InLobby
    },
    round: {
        type: Number,
        required: true,
        default: 0
    }
});

const Party: Model<IParty> = model('Party', PartySchema);
export default Party;