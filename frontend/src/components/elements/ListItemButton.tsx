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
import styles from './listitembutton.scss';

export interface IButtonProps {
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
};

const Button: FC<IButtonProps> = (props) => {
    const invokeOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (props.onClick) {
            props.onClick();
        }
    }

    return <button className={styles.button} disabled={props.disabled} onClick={e => invokeOnClick(e)}>
        <span className={styles.listItemButton__label}>{props.label}</span>
        {props.icon}
    </button>;
}

export default Button;