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

import React, { useEffect, useReducer, useState } from 'react';
import Button from '../elements/Button';
import TextInput from '../elements/TextInput';
import IconLibrary from '../elements/IconLibrary';
import styles from './view.scss';
import Header from '../sections/Header';
import { api, prefs, text } from '../../services';
import Debug from '../../util/Debug';
import { INavProps } from '../NavProps';
import LobbyView from './Lobby';
import axios from 'axios';
import useCancelReducer, { CancelActionType } from '../../hooks/useCancelReducer';
import ErrorModal from './ErrorModal';
import KnifeImage1 from '../../assets/images/knife.svg';

const CreatePartyView = (props:INavProps) => {
    const [playerName, setPlayerName] = useState(prefs.get<string>('playerName') ?? '');
    const dispatchCancel = useCancelReducer(props.nav);
    const [processing, setProcessing] = useState(false);

    const validate = () => {
        return playerName.length > 0 && playerName.length <= 128;
    };
    const [valid, validReducer] = useReducer(_ => validate(), validate());
    useEffect(validReducer, [playerName]);

    const submitHandler = async () => {
        const source = api.cancelTokenSource();
        dispatchCancel({ type: CancelActionType.AddSource, payload: source });
        setProcessing(true);
        props.nav.retainInteractionBlocker();

        try {
            const payload = await api.createParty(playerName, prefs.getPronouns(), source.token);
            await api.nextStatus();
            prefs.set('partyCode', payload.partyCode);
            props.nav.push('LobbyView', () => <LobbyView nav={props.nav} />)
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('cancelled creating party');
            } else {
                Debug.log('error creating party: ' + err.message);
                props.nav.presentModal(modalProps => {
                    return <ErrorModal
                        messageKey='error/create_party_fail'
                        dismiss={modalProps.dismiss}
                    />;
                });
            }
            setProcessing(false);
        } finally {
            props.nav.releaseInteractionBlocker();
            dispatchCancel({type: CancelActionType.RemoveSource, payload: source});
            prefs.set('playerName', playerName);
        }
    };

    const leftButton = <Button
        label={text.get('back')}
        type="tertiary"
        iconLeft={<IconLibrary icon="arrowLeft" className="tertiary"/>}
        onClick={() => {
            dispatchCancel({type:CancelActionType.CancelAll});
            props.nav.pop();
        }}
    />

    return <div className={styles.viewArea}>
        <Header leftButton={leftButton} />

        <div className={styles.layoutArea}>
            <form style={{backgroundColor: "var(--background-color)"}}>
                <img src={KnifeImage1} alt="knife" width="102" height="151" />
                <h1>{text.get('start_a_new_party')}</h1>
                <TextInput
                    name="player-name"
                    label={text.get('your_name')}
                    initialValue={playerName}
                    onChange={value => setPlayerName(value.trim())}
                />
                <div className={styles.buttonArea}>
                    <Button
                        label={text.get('start')}
                        type="primary"
                        iconRight={<IconLibrary icon={processing ? "processing" : "arrowRight"} className="primary" />}
                        onClick={submitHandler}
                        disabled={!valid}
                        active={processing}
                    />
                </div>
            </form>
        </div>
    </div>;
}

export default CreatePartyView;