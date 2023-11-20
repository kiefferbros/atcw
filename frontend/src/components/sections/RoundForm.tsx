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

import React, { useState } from 'react';
import styles from './header.scss';
import Button from '../elements/Button';
import IconLibrary from '../elements/IconLibrary';
import TextArea from '../elements/TextArea';

export interface IRoundFormProps {
    inputLabel: string;
    inputName: string;
    buttonLabel: string;
    validate: (inputValue: string) => boolean;
    onSubmit: (inputValue: string) => void;
    processing: boolean;
};

const RoundForm = (props:IRoundFormProps) => {
    const [inputValue, setInputValue] = useState('');
    const [valid, setValid] = useState(props.validate(inputValue));

    return <form>
        <TextArea
            name={props.inputName}
            label={props.inputLabel}
            onChange={value => {
                value = value.trim();
                setInputValue(value);
                setValid(props.validate(value));
            }}
            arrestFocus={true}
            largeLabel={true}
        />
        <div className={styles.buttonArea}>
            <Button
                label={props.buttonLabel}
                type="primary"
                iconRight={<IconLibrary icon={props.processing ? 'processing' : 'arrowRight'} className="primary"/>}
                active={props.processing}
                onClick={() => props.onSubmit(inputValue)}
                disabled={!valid}
            />
        </div>
    </form>
}

export default RoundForm;