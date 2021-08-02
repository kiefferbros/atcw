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
import Button, { ButtonType } from '../elements/Button';
import styles from './modal.scss';
import FocusBackdrop from '../elements/FocusBackdrop'

export interface IModalButtonProps {
    onClick?: () => void;
    label: string;
    type: ButtonType;
}

export interface IModalProps {
    message: string;
    primaryButton: IModalButtonProps;
    secondaryButton?: IModalButtonProps;
    dismiss: () => void;
}

const Modal = (props: IModalProps) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    const animatedDismiss = () => {
        if (open) {
            setOpen(false);
            setTimeout(props.dismiss, 200) // 0.2s css transition duration
        }
    };

    const className = styles.modal + (open ? ' ' + styles.open : '');

    return <div className={styles.modalArea}>
        <FocusBackdrop open={open} />
        <div className={className}>
            <h1>{props.message}</h1>
            <div className={styles.buttonArea}>
                {props.secondaryButton && <Button
                    label={props.secondaryButton.label}
                    onClick={() => {
                        if (open && props.secondaryButton?.onClick) {
                            props.secondaryButton.onClick();
                        }
                        animatedDismiss();
                    }}
                    type={props.secondaryButton.type}
                />}
                <Button
                    label={props.primaryButton.label}
                    onClick={() => {
                        if (open && props.primaryButton.onClick) {
                            props.primaryButton.onClick();
                        }
                        animatedDismiss();
                    }}
                    type={props.primaryButton.type}
                />
            </div>
        </div>
    </div>;
}

export default Modal;