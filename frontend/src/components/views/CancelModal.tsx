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
import Modal from './Modal';
import {text} from '../../services';
import { IModalProps } from '../Navigation';

export interface IErrorModalProps {
    messageKey?: string;
}

const ErrorModal = (props: IErrorModalProps & IModalProps) => {
    return <Modal
        message={text.get(props.messageKey ?? 'error/generic_fail' )}
        primaryButton={{
            label: text.get('error/button/ok'),
            type: 'primary'
        }}
        dismiss={props.dismiss}
    />;
}

export default ErrorModal;