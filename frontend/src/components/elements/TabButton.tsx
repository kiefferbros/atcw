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

import React, { FC } from 'react';
import styles from './tabs.scss';

export interface ITabButtonPublicProperties {
    label: string;
    disabled?: boolean;
};

export interface ITabButtonProperties extends ITabButtonPublicProperties{
    selected: boolean;
    onClick: () => void;
};

const Button: FC<ITabButtonProperties> = (props) => {
    let className = styles.button;
    if (props.selected) {
        className += ' ' + styles.active;
    }

    const invokeOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!props.selected && props.onClick) {
            props.onClick();
        }
    }

    return <button className={className} disabled={props.disabled} onClick={e => invokeOnClick(e)}>
        <span className={styles.label}>{props.label}</span>
    </button>;
}

export default Button;