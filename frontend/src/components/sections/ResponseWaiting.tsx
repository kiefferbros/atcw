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

import Button from '../elements/Button';
import React from 'react';
import { text } from '../../services';

export interface IResponseWaitingProps {
    message: string;
    error: boolean;
    errorMessage: string;
    onRetryClick: () => void;
}

export default (props: IResponseWaitingProps) => {
    return <div>
        {!props.error && <h2>{props.message}</h2>}
        {props.error && <div>
            <h1>{props.errorMessage}</h1>
            <Button
                label={text.get('error/button/retry')}
                type={'primary'}
                onClick={props.onRetryClick}
            />
        </div>}
    </div>;
}