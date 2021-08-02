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
import SelectOption from './SelectOption';
import IconLibrary from '../elements/IconLibrary';
import { renderToString } from 'react-dom/server'
import styles from './select.scss';
import exp from 'constants';

export interface ISelectOption {
    label: string;
    value: string;
}

export interface ISelectProps {
    options: ISelectOption[];
    label: string;
    id: string;
    onChange?: (value:string) => void;
    disabled?: boolean;
    selectedValue?: string;
};

const Select = (props:ISelectProps) => {
    const carret = encodeURIComponent(renderToString(<IconLibrary icon="caretDown" className="secondary"/>))

    return <div className={styles.selectArea}>
        <label htmlFor={props.id}>{props.label}</label>
        <select
            name={props.id}
            className={styles.selectArea__select}
            style={{backgroundImage: 'url("data:image/svg+xml;utf8,' + carret + '")'}}
            onChange={e => {if (props.onChange) props.onChange(e.target.value)}}>
            {props.options.map(o => <SelectOption label={o.label} value={o.value} selected={o.value === props.selectedValue} key={o.label} />)}
        </select>
    </div>;
}

export default Select;