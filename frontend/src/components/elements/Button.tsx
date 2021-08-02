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

import React from 'react';
import styles from './button.scss';

export interface IButtonProperties {
    label: string;
    type: ButtonType;
    disabled?: boolean;
    onClick?: () => void;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    active?: boolean
};

export type ButtonType = 'primary'|'secondary'|'tertiary'|'destructive';

const Button = (props:IButtonProperties) => {
    let className = styles.button + ' ' + styles[props.type];
    if (props.active) {
        className += ' ' + styles.active;
    }

    const invokeOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!props.active && props.onClick) {
            props.onClick();
        }
    }

    return <div>
        <button className={className} disabled={props.disabled} onClick={e => invokeOnClick(e)}>{props.iconLeft}<span className={styles.textSpan}>{props.label}</span>{props.iconRight}</button>
    </div>;
}

export default Button;