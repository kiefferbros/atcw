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
import { prefs, api, text } from '../../services';
import Debug from '../../util/Debug';
import { INavProps } from '../NavProps';
import LobbyView from './Lobby';
import axios, { CancelTokenSource } from 'axios';
import ErrorModal from './ErrorModal';
import { HttpStatus } from '../../services/api_client';
import CheeseImage1 from '../../assets/images/cheese.svg';
import useCancelReducer, { CancelActionType } from '../../hooks/useCancelReducer';

export interface IJoinPartyProps {
    inviteCode?: string;
}

const JoinPartyView = (props: IJoinPartyProps&INavProps) => {
    const [playerName, setPlayerName] = useState(prefs.get<string>('playerName') ?? '');
    const [partyCode, setPartyCode] = useState(props.inviteCode ??prefs.get<string>('partyCode') ?? '');
    const dispatchCancel = useCancelReducer(props.nav);
    const [processing, setProcessing] = useState(false);
    const [partyCodeMessage, setPartyCodeMessage] = useState('');
    const [badPartyCode, setBadPartyCode] = useState('');
    const [partyInputFocus, setPartyInputFocus] = useState(false);
    const [nameMessage, setNameMessage] = useState('');
    const [badName, setBadName] = useState('');
    const [nameInputFocus, setNameInputFocus] = useState(false);


    const validate = () => {
        return playerName.length > 0 && playerName.length <= 128 && partyCode.length === 6;
    };
    const [valid, validReducer] = useReducer(_ => validate(), validate());
    useEffect(validReducer, [playerName, partyCode]);

    const submitHandler = async () => {
        const source = api.cancelTokenSource();
        dispatchCancel({ type: CancelActionType.AddSource, payload: source });
        setProcessing(true);
        props.nav.retainInteractionBlocker();

        try {
            await api.joinParty(playerName, prefs.getPronouns(), partyCode, undefined, source.token);
            await api.nextStatus();
            props.nav.push('LobbyView', () => <LobbyView nav={props.nav} />)
        } catch (err: any) {
            let errMsg = 'error/generic_fail';
            if (axios.isCancel(err)) {
                Debug.log('cancelled joining party');
                errMsg = '';
            } else if (axios.isAxiosError(err) && err.response) {
                switch (err.response.status) {
                    case HttpStatus.NotFound:
                        errMsg = '';
                        setPartyCodeMessage(text.get('error/join_party/code_fail'));
                        setBadPartyCode(partyCode);
                        setPartyInputFocus(true);
                        break;
                    case HttpStatus.NameNotAvailable:
                        errMsg = '';
                        setNameMessage(text.get('error/join_party/name_fail'));
                        setBadName(playerName);
                        setNameInputFocus(true);
                        break;
                    case HttpStatus.PartyFull:
                        errMsg = 'error/join_party/party_full';
                        break;
                }
            }

            if (errMsg) {
                props.nav.presentModal(modalProps => {
                    return <ErrorModal
                        messageKey={errMsg}
                        dismiss={modalProps.dismiss}
                    />;
                });
            }
            setProcessing(false);
        } finally {
            props.nav.releaseInteractionBlocker();
            dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
            prefs.set('playerName', playerName);
            prefs.set('partyCode', partyCode);
        }
    };

    // Clear error state on the party code input when value gets changed
    useEffect(() => {
        if (partyCodeMessage && partyCode !== badPartyCode) {
            setPartyCodeMessage('');
        }
    }, [partyCode]);

    // Clear error state on the name input when value gets changed
    useEffect(() => {
        if (nameMessage && playerName !== badName) {
            setNameMessage('');
        }
    }, [playerName]);

    const leftButton = <Button
        label={text.get('back')}
        type="tertiary"
        iconLeft={<IconLibrary icon="arrowLeft" className="tertiary"/>}
        onClick={() => {
            dispatchCancel({type: CancelActionType.CancelAll});
            props.nav.pop();
        }}
    />

    return <div className={styles.viewArea}>
        <Header leftButton={leftButton} />

        <div className={styles.layoutArea} style={{backgroundColor: "var(--background-color)"}}>
            <img src={CheeseImage1} alt="cheese" width="63" height="75" />
            <h1>{text.get('join_a_party')}</h1>
            <form>
                <TextInput
                    name="party-code"
                    label={text.get('party_code')}
                    initialValue={partyCode}
                    onChange={setPartyCode}
                    maxChars={6}
                    helpText={partyCodeMessage}
                    error={partyCodeMessage.length>0}
                    arrestFocus={partyInputFocus}
                />
                <TextInput
                    name="player-name"
                    label={text.get('your_name')}
                    initialValue={playerName}
                    onChange={value => setPlayerName(value.trim())}
                    helpText={nameMessage}
                    error={nameMessage.length>0}
                    arrestFocus={nameInputFocus}
                />
                <div className={styles.buttonArea}>
                    <Button
                        label={text.get('join')}
                        type="primary"
                        iconRight={<IconLibrary icon={processing ? 'processing' : 'arrowRight'} className="primary" />}
                        onClick={submitHandler}
                        disabled={!valid}
                        active={processing}
                    />
                </div>
            </form>
        </div>
    </div>;
}

export default JoinPartyView;