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

import React, { useState } from "react";
import {text, api} from '../../services';
import Drawer from '../views/Drawer';
import PronounOptions from '../contentBlocks/PronounOptions';
import styles from '../views/view.scss';
import Button from "../elements/Button";
import IconLibrary from '../elements/IconLibrary';
import PlayerList from "../sections/PlayerList";
import Modal from '../views/Modal';
import { INavProps } from "../NavProps";
import { GameState } from "../../hooks/useGameState";
import { IPlayerListItemProps } from "../sections/PlayerListItem";
import ErrorModal from "../views/ErrorModal";
import axios from "axios";
import Debug from "../../util/Debug";
import { HttpStatus } from "../../services/api_client";
import { CancelActionType, ICancelReducerProps } from "../../hooks/useCancelReducer";
import { StoryEntryCount } from "../../util/StoryUtil";

export interface INextRoundProps {
    gameState: GameState;
    players: readonly IPlayerListItemProps[];
}

export default (props: INavProps & INextRoundProps & ICancelReducerProps)=> {
    const [processing, setProcessing] = useState(false);

    const submitHandler = async () => {
        const source = api.cancelTokenSource();
        props.dispatchCancel({ type: CancelActionType.AddSource, payload: source });
        setProcessing(true);
        props.nav.retainInteractionBlocker();

        try {
            await api.startRound(StoryEntryCount, source.token);
            await api.nextStatus();
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('cancelled starting round request');
            } else {
                Debug.log('error starting party: ' + err.message);
                let errMsg = 'error/generic_fail';

                if (axios.isAxiosError(err) && err?.response?.status === HttpStatus.TooFewPlayers) {
                    errMsg = 'error/too_few_players';
                }

                props.nav.presentModal(modalProps => {
                    return <ErrorModal
                        messageKey={errMsg}
                        dismiss={modalProps.dismiss}
                    />;
                });
            }
            setProcessing(false);
        } finally {
            props.dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
            props.nav.releaseInteractionBlocker();
        }
    };

    return <div>
        <h2>{text.get('party_code')}</h2>
        <p className={styles.headline}>{api.partyCode}</p>
        <div className={styles.buttonArea}>
            <Button
                label={text.get('choose_story_pronouns')}
                type="secondary"
                onClick={() => props.nav.presentModal(modalProps => {
                    return <Drawer
                        drawerContent={animatedDismiss => <PronounOptions nav={props.nav} dismiss={animatedDismiss} />}
                        dismiss={modalProps.dismiss}
                    />;
                })}
            />
            <Button
                label={text.get('start_round')}
                type="primary"
                iconRight={<IconLibrary
                    icon={processing ? "processing" : "arrowRight"}
                    className="primary"
                />}
                disabled={props.gameState === GameState.Unknown || props.players.length < 2}
                onClick={() => props.nav.presentModal(modalProps => {
                    return <Modal
                        message={text.get('ready_modal/message')}
                        primaryButton={{
                            onClick: () => { submitHandler() },
                            label: text.get('ready_modal/start_button'),
                            type: 'primary',
                        }}
                        secondaryButton={{
                            label: text.get('cancel'),
                            type: 'secondary',
                        }}
                        dismiss={modalProps.dismiss} />;
                })}
            />
        </div>
        <PlayerList
            nav={props.nav}
            players={props.players}
            showInvite={true}
        />
    </div>;
}