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
import Button from '../elements/Button';
import styles from './view.scss';
import PartyHeader from '../sections/PartyHeader';
import { text, api, prefs } from '../../services';
import { INavProps, ViewName } from '../NavProps';
import AboutView from './About';
import RoundView from './Round';
import useGameState, { GameState } from '../../hooks/useGameState';
import useCancelReducer, { CancelActionType } from '../../hooks/useCancelReducer';
import TabPanel from '../elements/TabPanel';
import NextRound from '../contentBlocks/NextRound';
import axios from 'axios';
import ResultsWaiting from '../contentBlocks/ResultsWaiting';
import { IPartyStatus, PartyStatusCode } from '../../services/api_client';
import Debug from '../../util/Debug';
import Results from '../contentBlocks/Results';
import HelpCTA from '../sections/HelpCTA';
import { formatStories, IFormattedStory } from '../../util/StoryUtil';
import { INavigator } from '../Navigation';
import { IPlayerListItemProps } from 'components/sections/PlayerListItem';


const useLobbyState = (nav: INavigator<ViewName>): [IPartyStatus | undefined, GameState, readonly IPlayerListItemProps[]] => {
    const [partyStatus, gameState, players] = useGameState(nav);

    useEffect(() => {
        let clearTabPref = false;
        if (gameState === GameState.Playing) {
            clearTabPref = true;
            nav.push('RoundView', () => <RoundView nav={nav} />);
        }

        return () => {
            if (clearTabPref) {
                prefs.removeTemp('lobbyTab');
            }
        };
    }, [gameState]);

    return [partyStatus, gameState, players];
}

const LobbyView = (props:INavProps) => {
    const [partyStatus, gameState, players] = useLobbyState(props.nav);

    const dispatchCancel = useCancelReducer(props.nav);
    const [tabIndex, setTabIndex] = useState(
        partyStatus && partyStatus.round > 0 ?
            (gameState === GameState.Waiting ? 0 : (prefs.getTemp<number>('lobbyTab') ?? 0)) : 1
    );

    const [results, setResults] = useState<(readonly IFormattedStory[])>([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultsError, setResultsError] = useState(false);

    const loadResults = async () => {
        setResultsError(false);

        const source = api.cancelTokenSource();
        dispatchCancel({ type: CancelActionType.AddSource, payload: source });

        setLoadingResults(true);

        try {
            const payload = await api.getResults(source.token);
            setResults(formatStories(payload.stories));
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('Results request cancelled.');
            } else {
                Debug.log(err.message);
                setResultsError(true);
            }
        } finally {
            dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
            setLoadingResults(false);
        }
    };

    useEffect(() => {
        if (partyStatus && partyStatus.code === PartyStatusCode.InLobby && partyStatus?.round > 0 &&
            results.length === 0 && !loadingResults
        ) {
            loadResults();
        }
    }, [gameState, partyStatus, loadingResults]);

    const rightButton = <Button
        label={text.get('about')}
        type="tertiary"
        onClick={() => {
            props.nav.push('AboutView', () => <AboutView nav={props.nav} useNavEffect={useLobbyState} />);
        }}
    />

    return <div className={styles.viewArea}>
        <PartyHeader nav={props.nav} rightButton={rightButton} dispatchCancel={dispatchCancel} />

        <div className={styles.layoutArea}>
            {partyStatus && partyStatus.round > 0 && <TabPanel
                tabs={[
                    {
                        label: text.get('lobby/results'),
                    },
                    {
                        label: text.get('lobby/next_round'),
                        disabled: gameState===GameState.Waiting
                    }
                ]}
                onSelect={idx => {
                    prefs.setTemp('lobbyTab', idx);
                    setTabIndex(idx);
                }}
                initialSelectedIndex={tabIndex}
            />}

            {partyStatus && tabIndex === 0 && gameState === GameState.Waiting && <ResultsWaiting
                nav={props.nav} partyStatus={partyStatus}
                players={players}
                dispatchCancel={dispatchCancel}
            />}
            {partyStatus && tabIndex === 0 && gameState === GameState.InLobby && <Results
                nav={props.nav}
                stories={results}
                error={resultsError}
                onRetryClick={loadResults}
                useNavEffect={useLobbyState}
            />}
            {partyStatus && tabIndex === 1 && <NextRound
                nav={props.nav} gameState={gameState}
                players={players}
                dispatchCancel={dispatchCancel}
            />}
            {partyStatus && partyStatus.round > 0 && <HelpCTA nav={props.nav} useNavEffect={useLobbyState}/>}
        </div>
    </div>;
}

export default LobbyView;