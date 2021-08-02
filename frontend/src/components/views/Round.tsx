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

import React, { useEffect, useState } from 'react';
import styles from './view.scss';
import roundStyles from './round.scss';
import {api, text} from '../../services';
import PartyHeader from '../sections/PartyHeader';
import { INavProps } from '../NavProps';
import PlayerList from '../sections/PlayerList';
import axios from 'axios';
import Debug from '../../util/Debug';
import { IPronouns, PartyStatusCode } from '../../services/api_client';
import ViewTransition, { Content, Transition } from '../elements/ViewTransition';
import RoundFormContainer, { IFormQuestion } from '../containers/RoundFormContainer';
import useGameState, { GameState } from '../../hooks/useGameState';
import { questions } from '../../util/StoryUtil';
import ResponseWaiting from '../sections/ResponseWaiting';
import useCancelReducer, { CancelActionType } from '../../hooks/useCancelReducer';

const RoundView = (props:INavProps) => {
    const [partyStatus, gameState, players] = useGameState(props.nav);
    const dispatchCancel = useCancelReducer(props.nav);

    const [formPronouns, setFormPronouns] = useState<readonly IPronouns[]>([]);
    const [formIndex, setFormIndex] = useState(-1);

    const [error, setError] = useState(false);

    const loadForm = async () => {
        setError(false);

        const source = api.cancelTokenSource();
        dispatchCancel({ type: CancelActionType.AddSource, payload:source });

        try {
            const payload = await api.getStoryForm(source.token);
            setFormPronouns(payload.pronouns);
            setFormIndex(payload.startIndex);
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('cancelled form request');
            } else {
                Debug.log(err.message);
                setError(true);
            }
        } finally {
            dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
        }
    };

    const [stepperContent, setStepperContent] = useState<Content>({
        component: () => <ResponseWaiting
            message={text.get('gameplay/waiting_for_start')}
            error={error}
            errorMessage={text.get('error/form_failed')}
            onRetryClick={loadForm}
        />
    });

    useEffect(() => {
        if (gameState === GameState.Waiting || gameState === GameState.InLobby) {
            props.nav.popTo('LobbyView');
        }
    }, [gameState]);

    useEffect(() => {
        if (partyStatus?.code === PartyStatusCode.Playing && gameState !== GameState.Waiting && formPronouns.length === 0) {
            loadForm();
        }
    }, [partyStatus]);

    useEffect(() => {
        if (formIndex === questions.length) {
            // do nothing. effect will pop the view stack for us.
        } if (formIndex >= 0 && formIndex < questions.length && formPronouns) {
            const question = questions[formIndex];
            const pronouns = formPronouns[formIndex];

            setStepperContent({
                component: () => <RoundFormContainer
                    nav={props.nav}
                    question={question}
                    pronouns={pronouns}
                    index={formIndex}
                    onSuccess={index => {
                        setFormIndex(index + 1);
                    }}
                    dispatchCancel={dispatchCancel}
                />,
                transition: Transition.FromRight
            });
        }
    }, [formIndex, formPronouns]);

    return <div className={styles.viewArea}>
        <PartyHeader nav={props.nav} dispatchCancel={dispatchCancel} />

        <div className={styles.layoutArea}>
            <div className={roundStyles.formArea}><ViewTransition content={stepperContent}/></div>
            <PlayerList
                nav={props.nav}
                players={players}
                showInvite={false}
            />
        </div>

    </div>;
}

export default RoundView;