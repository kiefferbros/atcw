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

import React from 'react';
import { prefs } from '../services';
import Navigation from './Navigation';
import { ViewName } from './NavProps';
import JoinPartyView from './views/JoinParty';
import StartView from './views/Start';

const navigation = new Navigation<ViewName>();
const nav = navigation.navigator;
nav.push('StartView', () => <StartView nav={nav} />);

const inviteCode = prefs.get<string>('invite');
if (inviteCode) {
    prefs.remove('invite');
    nav.push('JoinPartyView', () => <JoinPartyView nav={nav} inviteCode={inviteCode} />);
}

const Game = () => {
    return <navigation.container />;
};

export default Game;