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

import FocusTrap from 'focus-trap-react';
import React, { FC, FunctionComponent, useEffect, useState } from 'react';
import ViewTransition, { Transition } from './elements/ViewTransition';
import {Event} from '../util/Event';
import styles from './navigation.scss';

export interface INavigator<T extends string = string> {
    /**
     * Pushes a view function to the top of the stack and displays it
     */
    push: (name: T, view: FC) => void;
    /**
     * Pops the top view function from the stack and displays
     * the view below it if one exists
     * @throws error if attempting to pop an empty stack
     */
    pop: () => void;
    /**
     * Attempts to find a view by name from the top to the bottom
     * and pops every view function above that from the view stack.
     * @returns True if a view with the name was found and was popped to
     */
    popTo: (name: T) => boolean;
    /**
     * replaces the top view function
     */
    replaceTop: (name: T, view: FC) => void;

    /**
     * @returns array of view names
     */
    viewNames: () => readonly T[];

    /**
     * @returns array of view names
     */
    topViewName: () => T|undefined;

    /**
     * presents a modal view in front of the top view
     * a dismiss function is passed to the modal view function
     */
    presentModal: (view: FC<IModalProps>, dismissOnNav?: boolean) => void;

    /**
     * Increments interaction blockers
     */
    retainInteractionBlocker: () => void;

    /**
     * Decrements interaction blockers
     */
    releaseInteractionBlocker: () => void;
}

export interface IModalProps {
    dismiss: () => void;
}

interface IViewEntry<T extends string = string> {
    name: T;
    component: FC;
    transition?: Transition;
}

interface IModalViewEntry<T extends string = string> {
    view: FC<IModalProps>;
    dismiss: () => void;
    dismissOnNav: boolean;
}

const nullView = { name: '', component: () => <div></div> };

export default class Navigation<T extends string = string> {

    private _navigator: INavigator<T> = {
        push: (name: T, view: FC): void => {
            const viewEntry = { name, component: view, transition: Transition.FromRight };
            this._viewStack.push(viewEntry);
            this._onTopChange.dispatch(viewEntry);
            this._dismissNavModals();
        },
        pop: (): void => {
            if (this._viewStack.length === 0) {
                throw new Error('Tried to pop with no views.');
            }

            this._viewStack.pop();

            if (this._topViewEntry) {
                this._topViewEntry.transition = Transition.FromLeft;
            }

            this._onTopChange.dispatch(this._topViewEntry);
            this._dismissNavModals();
        },
        popTo: (name: T): boolean => {
            if (this._topViewEntry && this._topViewEntry.name !== name) {
                for (let i = this._viewStack.length - 1; i >= 0; i--) {
                    if (this._viewStack[i].name === name) {
                        this._viewStack.splice(i + 1, this._viewStack.length - (i+1));

                        if (this._topViewEntry) {
                            this._topViewEntry.transition = Transition.FromLeft;
                        }

                        this._onTopChange.dispatch(this._topViewEntry);
                        this._dismissNavModals();
                        return true;
                    }
                }
            }
            return false;
        },
        replaceTop: (name: T, view: FC): void => {
            const viewEntry = { name, component: view };
            if (this._viewStack.length === 0) {
                this._viewStack.push(viewEntry);
            } else {
                this._viewStack[this._viewStack.length - 1] = viewEntry;
            }
            this._onTopChange.dispatch(viewEntry);
            this._dismissNavModals();
        },
        viewNames: () => {
            return this._viewStack.map(v => v.name);
        },
        topViewName: () => {
            return this._viewStack.length > 0 ? this._viewStack[this._viewStack.length - 1].name : undefined;
        },
        presentModal: (view: FC<IModalProps>, dismissOnNav?: boolean): void => {
            const stack = this._modalStack;
            const onChange = this._onModalChange;

            this._modalStack.push({
                view,
                dismiss: () => {
                    const idx = stack.findIndex(e => e.view === view);
                    if (idx !== -1) {
                        stack.splice(idx, 1);
                        onChange.dispatch([...stack]);
                    }
                },
                dismissOnNav: dismissOnNav ?? true
            });
            this._onModalChange.dispatch([...stack])
        },
        retainInteractionBlocker: () => {
            const oldCount = this._blockerCount;
            this._blockerCount++;
            if (oldCount === 0) {
                this._onBlockingChange.dispatch(true);
            }
        },
        releaseInteractionBlocker: () => {
            if (this._blockerCount > 0) {
                this._blockerCount--;
                if (this._blockerCount === 0) {
                    this._onBlockingChange.dispatch(false);
                }
            }
        },
    }

    private _viewStack:IViewEntry<T>[] = [];
    private _modalStack: IModalViewEntry[] = [];
    private _blockerCount: number = 0;

    private _onTopChange = new Event<IViewEntry|null>();
    private _onModalChange = new Event<readonly IModalViewEntry[]>();
    private _onBlockingChange = new Event<boolean>();

    private _container: FunctionComponent|null = null;

    public get navigator(): INavigator<T> {
        return this._navigator;
    }

    private get _topViewEntry(): IViewEntry | null {
        return this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : null;
    }

    private _dismissNavModals(): void {
        let dismissCount = 0;
        for (let i = this._modalStack.length - 1; i >= 0; --i) {
            if (this._modalStack[i].dismissOnNav) {
                this._modalStack.splice(i, 1);
                dismissCount++;
            }
        }

        if (dismissCount > 0) {
            this._onModalChange.dispatch([...this._modalStack]);
        }
    }

    public get container(): FunctionComponent {

        if (!this._container) {
            const onTopChange = this._onTopChange;
            const onModalChange = this._onModalChange;
            const onBlockingChange = this._onBlockingChange;
            const initialTopView = this._topViewEntry;
            const initialModalStack: readonly IModalViewEntry[] = [...this._modalStack];
            const initialBlocking = this._blockerCount > 0;
            const retainBlocker = this._navigator.retainInteractionBlocker;
            const releaseBlocker = this._navigator.releaseInteractionBlocker;

            this._container = () => {
                const [blocking, setBlocking] = useState(initialBlocking);
                const [topView, setTopView] = useState<IViewEntry|null>(initialTopView);
                const [modalViews, setModalViews] = useState<readonly IModalViewEntry[]>(initialModalStack);

                useEffect(() => {
                    onTopChange.addListener(setTopView);
                    onModalChange.addListener(setModalViews);
                    onBlockingChange.addListener(setBlocking);

                    return () => {
                        onTopChange.removeListener(setTopView);
                        onModalChange.removeListener(setModalViews);
                        onBlockingChange.removeListener(setBlocking);
                    };
                }, []);

                const topBlocker = styles.blocker + ' ' + styles.top;
                return (
                    <div>
                        {topView !== null && <ViewTransition
                            content={topView}
                            onStart={retainBlocker}
                            onEndTransition={releaseBlocker}
                        />}
                        {modalViews.map((e, i) => <FocusTrap key={i} ><div className={styles.blocker}><e.view dismiss={e.dismiss} /></div></FocusTrap>)}
                        {blocking && <FocusTrap><div
                            className={topBlocker}
                            onKeyDownCapture={e => e.preventDefault()}
                            onKeyUpCapture={e => e.preventDefault()}
                        ><button style={{opacity:0}} /></div></FocusTrap>}
                    </div>
                );
            };
        }

        return this._container;
    }
}
