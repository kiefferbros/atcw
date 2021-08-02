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
import { text } from '../../services';
import IconLibrary from '../elements/IconLibrary';
import Header from '../sections/Header';
import HelpCTA from '../sections/HelpCTA';
import { INavProps } from '../NavProps';
import { formatStory } from '../../util/StoryUtil';
import { IEntry } from '../../services/api_client/Types';

const blank: IEntry = { text: '___', authorIndex: -1 };

const templateStory = formatStory({
    playerName: 'Dirk Karks',
    pronouns: { first: 'fem', second: 'masc' },
    entries: [blank, blank, blank, blank, blank, blank, blank, blank]
})


const AboutView = (props:INavProps) => {
    if (props.useNavEffect) {
        props.useNavEffect(props.nav);
    }

    const leftButton = <Button
        label={text.get('back')}
        type="tertiary"
        iconLeft={<IconLibrary icon="arrowLeft" className="tertiary"/>}
        onClick={props.nav.pop}
    />

    return <div className={styles.viewArea}>
        <Header leftButton={leftButton} />

        <div className={styles.layoutArea}>
            <h1>{text.get('how_to_play_heading')}</h1>
            <p>{text.get('how_to_play_content')}</p>
            <p>{templateStory.body.join(' ')}</p>
            <h1>{text.get('about_heading')}</h1>
            <p>{text.get('about_content')}<a href="https://kiefferbros.com">kiefferbros.com</a></p>
            <h1>{text.get('license_heading')}</h1>
            <p>{text.get('license_content')}<a href="https://www.gnu.org/licenses/agpl-3.0.en.html">https://www.gnu.org/licenses/agpl-3.0.en.html</a></p>
            <HelpCTA nav={props.nav} useNavEffect={props.useNavEffect} />
        </div>

    </div>;
}

export default AboutView;