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

import React, { useEffect } from 'react';
import styles from './text-input.scss';

export interface ITextInputProps {
    name: string;
    label: string;
    placeholder?: string;
    disabled?: boolean;
    maxChars?: number;
    minChars?: number;
    onChange?: (value:string) => void;
    helpText?: string;
    error?: boolean;
    initialValue?: string;
    onFocus?: () => void;
    arrestFocus?: boolean;
};

const TextInput = (props:ITextInputProps) => {
    const [value, setState] = React.useState(props.initialValue ?? '');

    const handleInputValue = (inputValue: string) => {
        setState(inputValue);
        if (props.onChange) {
            props.onChange(inputValue);
        }
    }

    useEffect(() => {
        if (props.arrestFocus && props.name) {
            setTimeout(() => document.getElementById(props.name)?.focus(), 10);
        }
    }, [props.arrestFocus]);

    let className = styles.input;
    if (value !== undefined && value !== '') {
        className += ' ' + styles.laden;
    }
    if (props.error) {
        className += ' ' + styles.error;
    }

    return <div className={className}>
        <input
            className={styles.input__input}
            type="text"
            name={props.name}
            id={props.name}
            onFocus={() => { if (props.onFocus) props.onFocus() }}
            onChange={e => handleInputValue(e.target.value)}
            value={value}
            maxLength={props.maxChars}
            minLength={props.minChars}>
        </input>
        <label className={styles.input__label} htmlFor={props.name}>{props.label}</label>
        <p className={styles.input__helperText}>{props.helpText}</p>
    </div>;
}

export default TextInput;