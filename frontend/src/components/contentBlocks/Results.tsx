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

import React, { useState } from "react";
import { text} from '../../services';
import styles from '../views/view.scss';
import Button from "../elements/Button";
import IconLibrary from "../elements/IconLibrary";
import ListItemButton from "../elements/ListItemButton";
import { INavProps } from "../NavProps";
import StoryView from "../views/Story";
import ResponseWaiting from "../sections/ResponseWaiting";
import { IFormattedStory } from "../../util/StoryUtil";
import { copyToClipboard } from "../../util/TextUtil";

export interface IResultsProps {
    stories: readonly IFormattedStory[];
    error: boolean;
    onRetryClick: () => void;
}

export default (props: IResultsProps&INavProps)=> {
    const [copied, setCopied] = useState(false);

    return <div>
        {props.stories.length === 0 && <ResponseWaiting
            message={text.get('lobby/waiting_for_results')}
            error={props.error}
            errorMessage={text.get('error/results_fail')}
            onRetryClick={props.onRetryClick}
        />}
        {props.stories.length > 0 && <div>
            <div className={styles.listArea}>
                {props.stories.map(s => <ListItemButton
                    key={s.title}
                    label={text.get('lobby/story_button_label').replace(/\*title\*/, s.title)}
                    icon={<IconLibrary icon="chevronRight" className="secondary" />}
                    onClick={() => props.nav.push('StoryView', () => <StoryView nav={props.nav} useNavEffect={props.useNavEffect} story={s} />)}
                />)}
            </div>
            <div className={styles.buttonArea}>
                <Button
                    label={text.get(copied ? 'copy_button_copied' : 'lobby/copy_all_stories')}
                    type={'secondary'}
                    iconRight={<IconLibrary icon={copied ? 'checkmark' : 'copy'} className="secondary" />}
                    onClick={() => {
                        const texts = props.stories.map(s => s.title + '\n\n' + s.body.join('\n\n'));
                        copyToClipboard(texts.join('\n\n\n'));
                        setCopied(true);
                    }}
                />
            </div>
        </div>}
    </div>;
}