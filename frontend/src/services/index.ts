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

import APIClient from './api_client';
import TextService from './TextService';
import strings from '../data/strings/en.json';
import PronounService from './PronounService';
import pronounData from '../data/strings/pronouns-en.json';
import PreferencesService from './PreferencesService';

export const api = new APIClient(`${window.location.protocol}//${window.location.host}/services/api/v1`, 30000, 1000);
export const text = new TextService(strings);
export const pronouns = new PronounService(pronounData)
export const prefs = new PreferencesService();