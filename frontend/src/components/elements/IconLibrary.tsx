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
import styles from './iconlibrary.scss';

export interface IIconProps {
    icon: IconName;
    className: string;
}

type IconName = 'checkmark' | 'ex' | 'alert' | 'caretDown' | 'arrowLeft' | 'arrowRight' | 'processing' | 'copy' | 'feedback' | 'sponsor' | 'code' | 'chevronRight';

const iconMap = new Map<IconName, (className: string) => JSX.Element>([
    ['checkmark', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Checkmark</title>
                <path d="M3 12.6L9 18L21.5 5.49998" stroke="black" />
            </svg>
        );
    }],
    ['ex', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Ex</title>
                <path d="M6 18L18 6" stroke="black"/>
                <path d="M6 6L18 18" stroke="black"/>
            </svg>
        );
    }],
    ['alert', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Arrow Right</title>
                <path d="M19 11.75L11.5 4.25L11.5 19.25L19 11.75ZM19 11.75L3.75 11.75" stroke="black" />
            </svg>
        );
    }],
    ['arrowRight', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Arrow Right</title>
                <path d="M19 11.75L11.5 4.25L11.5 19.25L19 11.75ZM19 11.75L3.75 11.75" stroke="black" />
            </svg>
        );
    }],
    ['arrowLeft', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Arrow Left</title>
                <path d="M3.75 11.75L11.25 19.25L11.25 4.25L3.75 11.75ZM3.75 11.75L19 11.75" stroke="black" />
            </svg>
        );
    }],
    ['caretDown', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Caret Down</title>
                <path d="M19 8H4L11.5 15.5L19 8Z" stroke="black" />
            </svg>
        );
    }],
    ['processing', (className: string) => {
        return (
        <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Pie</title>
            <circle cx="12" cy="12" r="8" stroke="black"/>
            <path d="M12 4.5V12H20" stroke="black"/>
        </svg>
        );
    }],
    ['copy', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Copy</title>
                <path d="M6 4H13L15 6V16H6V4Z" stroke="black"/>
                <path d="M9 7H16L18 9V19H9V7Z" stroke="black"/>
            </svg>
        );
    }],
    ['feedback', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Feedback</title>
                <path d="M18 6L18 15L12.5 15L8.5 18.5L8.5 15L6 15L6 6L18 6Z" stroke="black"/>
            </svg>
        );
    }],
    ['sponsor', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Sponsor</title>
                <path d="M5 9L12 4M5 9V16M5 9L9.5 12.5M12 4L19 9M12 4V10.5M19 9V16M19 9L14.5 12.5M12 14.5L14.5 12.5M12 14.5L9.5 12.5M12 14.5V21M5 16L12 21M5 16L9.5 12.5M12 21L19 16M19 16L14.5 12.5M14.5 12.5L12 10.5M12 10.5L9.5 12.5" stroke="black"/>
            </svg>
        );
    }],
    ['code', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Code</title>
                <path d="M8 7L3 12L8 17" stroke="black"/>
                <path d="M16 7L21 12L16 17" stroke="black"/>
                <path d="M10 17L14 7" stroke="black"/>
            </svg>
        );
    }],
    ['chevronRight', (className: string) => {
        return (
            <svg className={styles[className]} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Chevron Right</title>
                <path d="M8 5L15 11.5L8 18" stroke="black"/>
            </svg>
        );
    }]
]);

const IconLibrary = (props: IIconProps): JSX.Element => {
    const icon = iconMap.get(props.icon);
    return icon ? icon(props.className) : <div></div>;
}

export default IconLibrary;