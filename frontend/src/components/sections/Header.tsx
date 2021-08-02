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
import styles from './header.scss';

export interface IHeaderProps {
    leftButton?: React.ReactNode;
    rightButton?: React.ReactNode;
};

const Header = (props:IHeaderProps) => {
    return <div className={styles.header}>
        <div className={styles.leftButton}>
            {props.leftButton}
        </div>
        <div className={styles.rightButton}>
            {props.rightButton}
        </div>
    </div>;
};

export default Header;