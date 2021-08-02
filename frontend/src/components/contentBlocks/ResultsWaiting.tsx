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

import React, { useState } from 'react';
import { api } from '../../services'
import {text} from '../../services';
import PlayerList from "../sections/PlayerList";
import { INavProps } from "../NavProps";
import { IPlayerListItemProps } from "../sections/PlayerListItem";
import { IPartyStatus, PartyStatusCode, PlayerStatusCode } from "../../services/api_client";
import styles from '../views/view.scss';
import Button from "../elements/Button";
import IconLibrary from "../elements/IconLibrary";
import Modal from "../views/Modal";
import Debug from "../../util/Debug";
import { CancelActionType, ICancelReducerProps } from "../../hooks/useCancelReducer";
import axios from 'axios';
import ErrorModal from '../views/ErrorModal';

export interface IWaitingProps {
    partyStatus?: IPartyStatus;
    players: readonly IPlayerListItemProps[];
}

export default (props: INavProps & IWaitingProps & ICancelReducerProps)=> {
    const [processing, setProcessing] = useState(false);

    const playerState = props.partyStatus?.players[props.partyStatus.playerIndex].code;
    const isObserving = props.partyStatus?.code !== PartyStatusCode.InLobby && playerState === PlayerStatusCode.InLobby;

    const endRound = async () => {
        const source = api.cancelTokenSource();
        props.dispatchCancel({ type: CancelActionType.AddSource, payload: source });

        setProcessing(true);
        props.nav.retainInteractionBlocker();

        try {
            await api.endRound(source.token);
            await api.nextStatus();
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('cancel end round request');
            } else {
                Debug.log('error ending round ' + err.message);
                props.nav.presentModal(modalProps => {
                    return <ErrorModal
                        messageKey={'error/end_round_fail'}
                        dismiss={modalProps.dismiss}
                    />
                });
            }
            setProcessing(false);
        } finally {
            props.dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
            props.nav.releaseInteractionBlocker();
        }
    };

    return <div>
        <h2>{text.get(isObserving ? 'lobby/waiting_observing' : 'lobby/waiting_done')}</h2>
        <PlayerList
            nav={props.nav}
            players={props.players}
            showInvite={true}
        />
        {!isObserving && <div>
            <div className={styles.buttonArea}>
                <Button
                    label={text.get('lobby/end_round_early')}
                    type={'secondary'}
                    iconRight={<IconLibrary icon={processing ? 'processing' : 'alert'} className="secondary" />}
                    onClick={() => props.nav.presentModal(modalProps => <Modal
                        message={text.get('lobby/end_round_message')}
                        primaryButton={{
                            label: text.get('lobby/end_round_confirm'),
                            type: 'primary',
                            onClick: endRound
                        }}
                        secondaryButton={{
                            label: text.get('cancel'),
                            type: 'secondary'
                        }}
                        dismiss={modalProps.dismiss}
                    />)}
                    active={processing}
                />
            </div>
        </div>}
    </div>;
}