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

import IconLibrary from '../elements/IconLibrary';
import React, { FC } from 'react';
import styles from './player-list.scss';
import { text } from '../../services';

export enum PlayerStatusCode {
    InLobby,
    Playing,
    Done,
    Left
};

export interface IPlayerListItemProps {
    name: string;
    status: PlayerStatusCode;
    number: number;
    isPlayer: boolean;
    inLobbyIsObserving: boolean;
};

const PlayerListItem: FC<IPlayerListItemProps> = (props) => {

    let className = styles.playerListItem;
    const observing = props.inLobbyIsObserving && props.status === PlayerStatusCode.InLobby;
    if (props.status === PlayerStatusCode.Done || props.status === PlayerStatusCode.Left || observing) {
        className += ' ' + styles.active;
    }

    const playerName = props.isPlayer ? props.name + ' ' + text.get('player_list/you') : props.name;
    const iconName = observing ? "eyes" : props.status === PlayerStatusCode.Done ? 'checkmark' : 'ex'

    return <li className={className} key={props.name}>
        <span className={styles.listNumber}>{props.number}.</span><span className={styles.statusIcon}><IconLibrary icon={iconName} className="tertiary" /></span> {playerName}
    </li>;
}

export default PlayerListItem;