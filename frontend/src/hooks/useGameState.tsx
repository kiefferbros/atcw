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

import React, { useState, useEffect } from "react";
import { INavigator } from "../components/Navigation";
import { ViewName } from "../components/NavProps";
import { IPlayerListItemProps } from "../components/sections/PlayerListItem";
import { api } from '../services';
import { IPartyStatus, PartyStatusCode, PlayerStatusCode } from "../services/api_client";
import axios, { AxiosError } from "axios";
import ErrorModal from "../components/views/ErrorModal";
import Debug from "../util/Debug";

export enum GameState {
    Unknown,
    InLobby,
    Playing,
    Waiting,
}

const getGameState = (status: IPartyStatus | undefined): GameState => {
    let gameState = GameState.Unknown;
    if (status && status.playerIndex >= 0 && status.playerIndex < status.players.length) {
        const playerState = status.players[status.playerIndex].code;
        gameState = GameState.InLobby;
        if (status.code !== PartyStatusCode.InLobby && status.code !== PartyStatusCode.Ending) {
            return status.code === PartyStatusCode.Starting || playerState === PlayerStatusCode.Playing ? GameState.Playing : GameState.Waiting;
        }
    }
    return gameState;
};

const getPlayers = (status: IPartyStatus | undefined, gameState: GameState): readonly IPlayerListItemProps[] => {
    if (status) {
        const inLobbyIsObserving = status.code !== PartyStatusCode.Starting && (gameState === GameState.Playing || gameState === GameState.Waiting);
        return status.players.map((p, i) => {
            return {
                number: (i + 1),
                name: p.name,
                status: p.code,
                isPlayer: i === status.playerIndex,
                inLobbyIsObserving
            };
        })
    }

    return [];
};

export default (nav: INavigator<ViewName>): [IPartyStatus|undefined, GameState, readonly IPlayerListItemProps[]] => {
    const cachedStatus = api.cachedStatus;
    const initialGameState = getGameState(cachedStatus);
    const [gameState, setGameState] = useState(initialGameState);
    const [partyStatus, setPartyStatus] = useState(cachedStatus)
    const [players, setPlayers] = useState(getPlayers(cachedStatus, initialGameState));

    useEffect(() => {
        const statusHandler = (payload: IPartyStatus|AxiosError) => {
            if (axios.isAxiosError(payload)) {
                Debug.log(payload.message);
                nav.presentModal(modalProps => <ErrorModal dismiss={ modalProps.dismiss } />);
                api.leaveParty();
                nav.popTo('StartView');
            } else {
                const newGameState = getGameState(payload);
                setGameState(newGameState);
                setPartyStatus(payload);
                setPlayers(getPlayers(payload, newGameState));
            }
        };

        api.onStatus.addListener(statusHandler);

        return () => {
            api.onStatus.removeListener(statusHandler);
        };
    }, []);

    return [partyStatus, gameState, players];
}