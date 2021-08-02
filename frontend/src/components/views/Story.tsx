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
import Button from '../elements/Button';
import styles from './view.scss';
import { text } from '../../services';
import IconLibrary from '../elements/IconLibrary';
import Header from '../sections/Header';
import { INavProps } from '../NavProps';
import { IFormattedStory } from '../../util/StoryUtil';
import { copyToClipboard } from '../../util/TextUtil';

export interface IStoryProps {
    story: IFormattedStory;
}

const StoryView = (props:IStoryProps&INavProps) => {
    const [copied, setCopied] = useState(false);

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
            <h1>{props.story.title}</h1>
            <article className={styles.story}>{props.story.body.map((e, i) => <span key={i}>{e}<br /><br /></span>)}</article>

            <div className={styles.buttonArea}>
                <Button
                    label={text.get(copied ? 'copy_button_copied' : 'lobby/copy_this_story')}
                    type={'secondary'}
                    iconRight={<IconLibrary icon={copied ? 'checkmark' : 'copy'} className="secondary" />}
                    onClick={() => {
                        copyToClipboard(props.story.title + '\n\n' + props.story.body.join('\n\n'));
                        setCopied(true);
                    }}
                />
            </div>
        </div>

    </div>;
}

export default StoryView;