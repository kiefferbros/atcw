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
import Button from '../elements/Button';
import styles from './player-list.scss';
import PlayerListItem, { IPlayerListItemProps } from './PlayerListItem';
import { INavProps } from '../NavProps';
import Drawer from '../views/Drawer';
import InviteInfo from '../contentBlocks/InviteInfo';

export interface IPlayerListProps extends INavProps {
    players?: readonly IPlayerListItemProps[];
    showInvite: boolean;
}

const PlayerList = (props: IPlayerListProps) => {

    return <div className={styles.playerList}>
        <div className={styles.titleArea}>
            <h2>Players</h2>
            {props.showInvite && <Button
                label="Invite"
                type="tertiary"
                onClick={() => props.nav.presentModal(modalProps => {
                    return <Drawer
                        drawerContent={animatedDismiss => <InviteInfo dismiss={animatedDismiss} />}
                        dismiss={modalProps.dismiss}
                    />;
                })}
            />}
        </div>

        <ul>
            {props.players?.map(player => <PlayerListItem {...player} key={player.number} />)}
        </ul>

    </div>;
}

export default PlayerList;