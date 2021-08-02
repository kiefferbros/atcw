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

import { PronounForm } from '../services/PronounService';
import {text, pronouns} from '../services';
import { IStory } from 'services/api_client';
import { capitalize } from './TextUtil';
import { IEntry } from 'services/api_client/Types';
import questionData from '../data/questions.json';
import { IFormQuestion } from '../components/containers/RoundFormContainer';
import Debug from './Debug';

export const questions = questionData as readonly IFormQuestion[];
export const StoryEntryCount = questions.length;

const formatMatch = /\*[^\d]*\d+[^\*]*\*/g;
const optMatch = /[^\d]*/
const formMatch = /(subj|obj|pos|pospr|refl)/;
const endPunctMatch = new RegExp(`[${text.get('end_punctuation')}]$`);

export interface IFormattedStory {
    title: string;
    body: readonly string[];
}

const entryText = (entries: readonly IEntry[], index: number, stories?: readonly IStory[]): string => {
    if (entries[index].text.length) {
        return entries[index].text;
    }

    if (stories) {
        const missingFormat = text.get(questions[index].missingKey);
        if (missingFormat) {
            return missingFormat.replace(
                /\*p\*/g,
                stories[entries[index].authorIndex].playerName
            );
        }

        Debug.log(`Missing format text for key ${questions[index].missingKey} is not defined!`);
        return stories[entries[index].authorIndex].playerName;
    }

    return entries[index].text;
}

export const formatStories = (stories: readonly IStory[]): IFormattedStory[] => {
    return stories.map(story => formatStory(story, stories));
}

export const formatStory = (story: IStory, stories?: readonly IStory[]): IFormattedStory => {
    const title = text.get('lobby/story_title').replace(/\*p\*/g, story.playerName);
    const body = text.get('lobby/story_format').split('\n');

    for (let i = 0; i < body.length; i++) {
        body[i] = body[i].replace(formatMatch, m => {
            const numberMatch = m.match(/\d+/);
            if (numberMatch) {
                const num: number = parseInt(numberMatch[0], 10);

                const formOpt = m.match(formMatch);
                if (formOpt) {
                    const form = formOpt[0] as PronounForm;
                    const opts = m.match(optMatch);
                    const capOpt = opts && opts[0].includes('C');
                    const nameOpt = opts && opts[0].includes('N');

                    let pronounId: string;
                    let noneName: string;

                    if (num === 1) {
                        pronounId = story.pronouns.first;
                        noneName = nameOpt ?
                            entryText(story.entries, 0, stories) :
                            text.get('gameplay/person_one');
                    } else {
                        pronounId = story.pronouns.second;
                        noneName = nameOpt ?
                            entryText(story.entries, 1, stories) :
                            text.get('gameplay/person_two');
                    }

                    const replacement = pronouns.getString(pronounId, form, noneName);
                    return capOpt ? capitalize(replacement) : replacement;
                }

                const entry = entryText(story.entries, num - 1, stories);
                const punctOpt = m.charAt(m.length - 2) === '.';
                if (punctOpt && !entry.match(endPunctMatch)) {
                    return entry + '.';
                }
                return entry;
            }
            return '';
        });
    }

    return { title, body };
}