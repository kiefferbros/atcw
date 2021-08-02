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
import * as services from '../../services';
import styles from '../views/drawer.scss';
import IconLibrary from '../elements/IconLibrary';
import { IModalProps } from '../Navigation';
import { copyToClipboard } from '../../util/TextUtil';

const InviteInfo = (props: IModalProps) => {
    const [activeButtonID, setActiveButtonID] = useState(0);
    const partyCode:string = services.api.partyCode ? services.api.partyCode : 'No code ¯\_(ツ)_/¯';
    const inviteURL: string = `${window.location.protocol}//${window.location.host}?invite=${partyCode}`;

    const copyIcon = <IconLibrary icon="copy" className="secondary" />;
    const checkmarkIcon = <IconLibrary icon="checkmark" className="secondary" />;

    const bLabel = services.text.get('invite_drawer/copy_button');
    const bLabelActivated = services.text.get('copy_button_copied');


    return <div>
        <div className={styles.drawerSection}>
            <h1>{services.text.get('invite_drawer/title')}</h1>
            <p>{services.text.get('invite_drawer/description')}</p>
        </div>

        <div className={styles.drawerSection}>
            <h2>{services.text.get('party_code')}</h2>
            <div className={styles.buttonLineItem}>
                <p className={styles.headline}>{partyCode}</p>
                <Button
                    label={activeButtonID === 1 ? bLabelActivated : bLabel}
                    type="secondary"
                    iconRight={activeButtonID === 1 ? checkmarkIcon : copyIcon}
                    onClick={() => {
                        copyToClipboard(partyCode);
                        setActiveButtonID(1);
                    }}
                />
            </div>
        </div>

        <div className={styles.drawerSection}>
            <h2>{services.text.get('invite_link')}</h2>
            <div className={styles.buttonLineItem}>
                <p className={styles.smallFont}>{inviteURL}</p>
                <Button
                    label={activeButtonID === 2 ? bLabelActivated : bLabel}
                    type="secondary"
                    iconRight={activeButtonID === 2 ? checkmarkIcon : copyIcon}
                    onClick={() => {
                        copyToClipboard(inviteURL);
                        setActiveButtonID(2);
                    }}
                />
            </div>
        </div>

        <div className={styles.buttonArea}>
            <Button
                label={services.text.get('invite_drawer/done_button')}
                type="primary"
                onClick={props.dismiss}
            />
        </div>
    </div>;
}

export default InviteInfo;