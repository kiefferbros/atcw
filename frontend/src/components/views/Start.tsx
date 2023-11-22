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
import Button from '../elements/Button';
import styles from './view.scss';
import * as services from '../../services';
import Header from '../sections/Header';
import AboutView from './About';
import JoinPartyView from './JoinParty';
import CreatePartyView from './CreateParty';
import { INavProps } from '../NavProps';
import TitleImage1 from '../../assets/images/knife-cheese-hand.svg';

const StartView = (props: INavProps) => {

    const rightButton = <Button
        label={services.text.get('about')}
        type="tertiary"
        onClick={() => props.nav.push('AboutView', () => <AboutView nav={props.nav}/>)}
    />

    return <div className={styles.viewArea}>
        <Header rightButton={rightButton} />

        <div className={styles.layoutArea} style={{backgroundColor: "var(--background-color)"}}>
            <img src={TitleImage1} alt="knife, cheese, and hand" width="109" height="235" />
            <h1 className={styles.headline}>{services.text.get('game_title')}</h1>
            <div className={styles.buttonArea}>
                <Button
                    label={services.text.get('join_a_party')}
                    type="primary"
                    onClick={() => props.nav.push('JoinPartyView', () => {
                        return <JoinPartyView nav={props.nav} />;
                    })}
                />
                <Button
                    label={services.text.get('start_a_new_party')}
                    type="secondary"
                    onClick={() => props.nav.push('CreatePartyView', () => {
                        return <CreatePartyView nav={props.nav}/>;
                    })}
                />
            </div>
        </div>
    </div>;
}

export default StartView;