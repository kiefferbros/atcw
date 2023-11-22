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

import React, { useEffect, useRef } from 'react';
import Debug from '../../util/Debug';
import styles from './textarea.scss';

export interface ITextAreaProps {
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
    largeLabel?: boolean;
};

const TextArea = (props:ITextAreaProps) => {
    const textArea = useRef<HTMLTextAreaElement>(null);
    const [value, setState] = React.useState(props.initialValue ?? '');
    const largeLabel = props.largeLabel;

    const handleInputValue = (inputValue: string) => {
        if (textArea.current) {
            textArea.current.style.height = 1 + 'px';
            textArea.current.style.height = textArea.current.scrollHeight + 'px';
        }

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
        {largeLabel && <label className={styles.input__largeLabel} htmlFor={props.name}>{props.label}</label>}
        <textarea
            ref={textArea}
            className={styles.input__input}
            name={props.name}
            id={props.name}
            onFocus={() => { if (props.onFocus) props.onFocus() }}
            onChange={e => handleInputValue(e.target.value)}
            value={value}
            maxLength={props.maxChars}
            minLength={props.minChars}
        >
        </textarea>
        {!largeLabel &&<label className={styles.input__label} htmlFor={props.name}>{props.label}</label>}
        <p className={styles.input__helperText}>{props.helpText}</p>
    </div>;
}

export default TextArea;