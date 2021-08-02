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

import { INavProps } from '../NavProps';
import React from 'react';
import Header from './Header';
import { api, text }from '../../services';
import Button from '../elements/Button';
import IconLibrary from '../elements/IconLibrary';
import Modal from '../views/Modal';
import { CancelActionType, ICancelReducerProps } from '../../hooks/useCancelReducer';

export interface IHeaderProps {
    rightButton?: React.ReactNode;
};

const PartyHeader = (props:IHeaderProps&INavProps&ICancelReducerProps) => {
    const leaveButton = <Button
        label={text.get('leave')}
        type="tertiary"
        iconLeft={<IconLibrary icon="arrowLeft" className="tertiary" />}
        onClick={() => {
            props.dispatchCancel({ type: CancelActionType.CancelAll });
            props.nav.presentModal(modalProps => {
                return <Modal
                    message={text.get('leave_message')}
                    primaryButton={{
                        onClick: () => {
                            api.leaveParty();
                            props.nav.popTo('StartView');
                        },
                        label: text.get('leave'),
                        type: 'destructive',
                    }}
                    secondaryButton={{
                        label: text.get('cancel'),
                        type: 'secondary',
                    }}
                    dismiss={modalProps.dismiss}
                />;
            });
        }}
    />

    return <Header leftButton={leaveButton} rightButton={props.rightButton} />;
}

export default PartyHeader;