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
import styles from './helpcta.scss';
import * as services from '../../services';
import { INavProps } from '../NavProps';
import HelpUsView from '../views/HelpUs';

const HelpCTA = (props:INavProps) => {
    return <div className={styles.helpCTA} onClick={() => props.nav.push('HelpUsView', () => <HelpUsView nav={props.nav} useNavEffect={props.useNavEffect} />)}>
        <p>{services.text.get('help_us_cta')}</p>
    </div>;
}

export default HelpCTA;