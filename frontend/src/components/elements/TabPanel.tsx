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

import React, { useState, useEffect } from 'react';
import TabButton, { ITabButtonPublicProperties } from './TabButton';
import styles from '../views/view.scss';

export interface IPanelProperties {
    tabs: ITabButtonPublicProperties[];
    onSelect?: (index: number) => void;
    initialSelectedIndex?: number;
};

const TabPanel = (props: IPanelProperties) => {
    const [selectedIndex, setSelectedIndex] = useState(
        props.initialSelectedIndex ? Math.max(Math.min(props.initialSelectedIndex, props.tabs.length), 0) : 0
    );

    return <div className={styles.tabPanel}>{props.tabs.map((buttonProps, i) => <TabButton
        key={buttonProps.label}
        label={buttonProps.label}
        selected={i===selectedIndex}
        disabled={buttonProps.disabled}
        onClick={() => {
            setSelectedIndex(i);
            if (props.onSelect) {
                props.onSelect(i);
            }
        }}
    />)}</div>;
}

export default TabPanel;