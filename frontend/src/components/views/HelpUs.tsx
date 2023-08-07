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
import IconLibrary from '../elements/IconLibrary';
import Header from '../sections/Header';
import { INavProps } from '../NavProps';

const HelpUsView = (props:INavProps) => {
    if (props.useNavEffect) {
        props.useNavEffect(props.nav);
    }

    const leftButton = <Button
        label={services.text.get('back')}
        type="tertiary"
        iconLeft={<IconLibrary icon="arrowLeft" className="tertiary"/>}
        onClick={props.nav.pop}
    />

    return <div className={styles.viewArea}>
        <Header leftButton={leftButton} />

        <div className={styles.layoutArea}>
            <h1 className={styles.headline}>{services.text.get('help_us/title')}</h1>

            <div className={styles.layoutSection}>
                <h1>{services.text.get('help_us/feedback/title')}</h1>
                <p>{services.text.get('help_us/feedback/description')}</p>
                <div className={styles.buttonArea}>
                    <Button
                        label={services.text.get('help_us/feedback/button')}
                        type="primary"
                        iconRight={<IconLibrary icon="feedback" className="primary"/>}
                        onClick={() => window.location.href = "mailto:hello@kiefferbros.com"}
                    />
                </div>
            </div>

            <div className={styles.layoutSection}>
                <h1>{services.text.get('help_us/sponsor/title')}</h1>
                <p>{services.text.get('help_us/sponsor/description')}</p>
                <div className={styles.buttonArea}>
                    <Button
                        label={services.text.get('help_us/sponsor/button')}
                        type="secondary"
                        iconRight={<IconLibrary icon="sponsor" className="secondary"/>}
                        onClick={() => window.open('https://buy.stripe.com/9AQ03BedL1Jd4qAfZ0', '_blank')}
                    />
                </div>
            </div>

            <div className={styles.layoutSection}>
                <h1>{services.text.get('help_us/code/title')}</h1>
                <p>{services.text.get('help_us/code/description')}</p>
                <div className={styles.buttonArea}>
                    <Button
                        label={services.text.get('help_us/code/button')}
                        type="secondary"
                        iconRight={<IconLibrary icon="code" className="secondary"/>}
                        onClick={() => window.open('https://github.com/kiefferbros/atcw', '_blank')}
                    />
                </div>
            </div>
        </div>

    </div>;
}

export default HelpUsView;