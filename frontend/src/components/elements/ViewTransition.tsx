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

import React, { FC, useEffect, useReducer, useRef } from 'react';
import styles from './viewtransition.scss';

export enum Transition {
    FromRight, FromLeft
}

export interface Content {
    component: FC;
    transition?: Transition;
}

export interface Container {
    content: Content;
    position: Position;
    key: number;
}

export interface IViewTransitionProps {
    content: Content;
    onStart?: () => void;
    onEndTransition?: () => void;
}

enum ContentActionType {
    Add,
    Remove
}

interface IContentAction {
    type: ContentActionType;
    payload: Content;
}

interface IViewTransitionState {
    containers: Container[];
    nextKey: number;
}

enum TransitionAction {
    Increment, Decrement
}

enum Position {
    Center, Right, Left
}

interface IContainerProps {
    content: FC;
    position: Position;
}

const contentsReducer = (state: IViewTransitionState, action: IContentAction): IViewTransitionState => {
    switch (action.type) {
        case ContentActionType.Add:
            const containers = action.payload.transition === undefined && state.containers.length > 0 ?
                state.containers.slice(0,state.containers.length-1) :
                [...state.containers];
            containers.push({
                content: {...action.payload},
                position: getStartPosition(action.payload.transition),
                key: state.nextKey
            });
            return { containers, nextKey: state.nextKey + 1 };
        case ContentActionType.Remove:
            const idx = state.containers.findIndex(c => c.content.component === action.payload.component);
            if (idx !== -1) {
                state.containers.splice(idx, 1);
                return { containers: [...state.containers], nextKey: state.nextKey };
            }
            break;
        default:
            break;
    }
    return state;
}

const transitionReducer = (state: number, action: TransitionAction) => {
    switch (action) {
        case TransitionAction.Increment:
            return state + 1;
        case TransitionAction.Decrement:
            return state - 1;
        default:
            return state;
    }
}

const getContainerClassName = (position: Position) => {
    let className = styles.content;

    switch (position) {
        case Position.Right:
            className += ' ' + styles.right;
            break;
        case Position.Left:
            className += ' ' + styles.left;
            break;
    }
    return className;
}

const getStartPosition = (transition?: Transition): Position => {
    switch(transition) {
        case Transition.FromRight:
            return Position.Right;
        case Transition.FromLeft:
            return Position.Left;
        default:
            return Position.Center;
    }
}

const getEndPosition = (transition?: Transition): Position => {
    switch (transition) {
        case Transition.FromRight:
            return Position.Left;
        case Transition.FromLeft:
            return Position.Right;
        default:
            return Position.Center;
    }
}

const ContentContainer = (props: IContainerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const initClassName = getContainerClassName(props.position);

    useEffect(() => {
        if (ref.current) {
            const className = getContainerClassName(props.position);
            ref.current.className = className;
        }
    }, [props.position]);

    return <div ref={ref} className={initClassName}><props.content /></div>
}

const ViewTransition:FC<IViewTransitionProps> = (props) => {
    const [state, dispatchContent] = useReducer(contentsReducer, props.content, (initialContent: Content) => {
        const container: Container = {
            content: {...initialContent},
            position: Position.Center,
            key: 0
        };
        return { containers: [container], nextKey: 1 };
    });

    const [transitionCount, dispatchTransitionCount] = useReducer(transitionReducer, 0);

    useEffect(() => {
        if (props.content.component !== state.containers[state.containers.length-1].content.component) {
            dispatchContent({ type: ContentActionType.Add, payload: props.content });
        }
    }, [props.content]);

    useEffect(() => {
        const curr = state.containers[state.containers.length - 1];

        if (curr.position !== Position.Center && curr.content.transition !== undefined) {
            const prev = state.containers.length > 1 ? state.containers[state.containers.length - 2] : null;

            if (props.onStart) {
                props.onStart();
            }

            window.scroll({left: 0, top: 0, behavior: "smooth"});

            window.setTimeout(() => {
                curr.position = Position.Center;
                if (prev) {
                    prev.position = getEndPosition(curr.content.transition);
                }
                dispatchTransitionCount(TransitionAction.Increment);

                window.setTimeout(() => {
                    if (prev) {
                        dispatchContent({ type: ContentActionType.Remove, payload: prev.content })
                    }
                    dispatchTransitionCount(TransitionAction.Decrement);

                    if (props.onEndTransition) {
                        props.onEndTransition();
                    }
                }, 200);
            }, 10);
        }
    }, [state]);

    return <div className={styles.wrapper}>
        {state.containers.map(c => <ContentContainer position={c.position} content={c.content.component} key={c.key} />)}
    </div>;
}

export default ViewTransition;