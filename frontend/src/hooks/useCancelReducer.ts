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

import { CancelTokenSource } from 'axios';
import { INavigator } from '../components/Navigation';
import React, { useEffect, useReducer, useState } from 'react';
import Debug from '../util/Debug';
import { ViewName } from '../components/NavProps';

export enum CancelActionType {
    AddSource,
    RemoveSource,
    CancelAll,
}

export interface ICancelAction {
    type: CancelActionType;
    payload?: CancelTokenSource;
}

export interface ICancelReducerProps {
    dispatchCancel: React.Dispatch<ICancelAction>;
}

const cancelReducer = (state: Set<CancelTokenSource>, action: ICancelAction) => {
    switch (action.type) {
        case CancelActionType.AddSource:
            if (action.payload) {
                const newState = new Set<CancelTokenSource>(state);
                newState.add(action.payload);
                return newState;
            }
            return state;
        case CancelActionType.RemoveSource:
            if (action.payload) {
                if (state.delete(action.payload)) {
                    return new Set<CancelTokenSource>(state);
                }
            }
            return state;
        case CancelActionType.CancelAll:
            if (state.size > 0) {
                state.forEach(c => c.cancel());
                state.clear();
                return new Set<CancelTokenSource>();
            }
            return state;
        default:
            return state;
    }
}

export default (nav: INavigator<ViewName>): React.Dispatch<ICancelAction> => {
    const [cancelSet, dispatchCancelAction] = useReducer(cancelReducer, new Set<CancelTokenSource>());

    useEffect(() => () => {
        if (cancelSet.size > 0) {
            Debug.log('Cancel all tokens on \'dismount\'.');
        }
        dispatchCancelAction({ type: CancelActionType.CancelAll });
    }, []);

    return dispatchCancelAction;
}