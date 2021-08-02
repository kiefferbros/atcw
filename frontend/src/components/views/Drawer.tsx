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

import FocusBackdrop from '../elements/FocusBackdrop';
import React, { useEffect, useState } from 'react';
import styles from './drawer.scss';
import { IModalProps } from '../Navigation';


export interface IDrawerProps {
    drawerContent: (dismiss: ()=>void) => JSX.Element;
}

const Drawer = (props: IDrawerProps&IModalProps) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    const className = styles.drawer + (open ? ' ' + styles.open : '');

    const animatedDismiss = () => {
        if (open) {
            setOpen(false);
            setTimeout(props.dismiss, 200); // 0.2s css transition time
        }
    };

    return <div className={styles.drawerArea}>
        <FocusBackdrop open={open} onClick={animatedDismiss} />
        <div className={className}>
            {props.drawerContent(animatedDismiss)}
        </div>
    </div>;
}

export default Drawer;