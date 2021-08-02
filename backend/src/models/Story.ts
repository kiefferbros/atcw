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
import { pronounsNestedSchema } from './Player';
import { IEntry } from '../payloads/RoundPayloads';

export const EntryCharMax: number = 1024;
export const EntryCountMax: number = 64;

export interface IStory extends Document {
    party: Types.ObjectId;
    player: Types.ObjectId;
    round: number;
    pronouns: IPronouns;
    entries: IEntry[];
    form: Types.ObjectId[]; // player id of the story this player will write too
}

const entryScheme: Schema = new Schema({
    text: {
        type: Schema.Types.String,
        default: ''
    },
    authorIndex: {
        type: Schema.Types.Number,
        default: -1
    }
});

const storySchema: Schema = new Schema({
    player: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }, 
    party: {
        type: Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },
    round: {
        type: Schema.Types.Number,
        required: true,
        min: 1
    },
    pronouns: pronounsNestedSchema,
    entries: {
        type: [entryScheme],
        required: true,
        default: []
    },
    form: {
        type: [Schema.Types.ObjectId],
        ref: 'Player',
        required: true
    }
});

const Story: Model<IStory> = model('Story', storySchema);
export default Story;