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

import React, { useEffect, useState } from 'react';
import Button from '../elements/Button';
import {api, text, pronouns, prefs} from '../../services';
import Select, { ISelectOption } from '../elements/Select';
import styles from '../views/drawer.scss';
import { INavProps } from '../NavProps';
import ErrorModal from '../views/ErrorModal';
import { capitalize } from '../../util/TextUtil';
import axios, { CancelTokenSource } from 'axios';
import Debug from '../../util/Debug';
import IconLibrary from '../elements/IconLibrary';
import { IModalProps } from '../Navigation';
import { NoPronoun } from '../../services/PronounService';

const PronounOptions = (props: INavProps & IModalProps) => {
    const currentPronouns = prefs.getPronouns();
    const [first, setFirst] = useState(currentPronouns.first);
    const [second, setSecond] = useState(currentPronouns.second);
    const [processing, setProcessing] = useState(false);

    const options: ISelectOption[] = pronouns.ids.map(id => {
        const subj = capitalize(pronouns.getString(id, 'subj'));
        const obj = capitalize(pronouns.getString(id, 'obj'));
        return {value: id, label: `${subj} / ${obj}`};
    });

    options.push({ value: NoPronoun, label: text.get('pronoun_drawer/no_pronoun') });

    const putPronouns = async () => {
        setProcessing(true);
        props.nav.retainInteractionBlocker();
        try {
            await prefs.setPronouns(first, second);
            props.dismiss();
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log('cancelled put pronouns request');
            } else {
                props.nav.presentModal(modalProps => {
                    return <ErrorModal
                        messageKey='error/set_pronouns_fail'
                        dismiss={modalProps.dismiss} />
                });
            }
            setProcessing(false);
        } finally {
            props.nav.releaseInteractionBlocker();
        }
    };

    return <div>
        <h1>{text.get('pronoun_drawer/title')}</h1>
        <p>{text.get('pronoun_drawer/description')}</p>

        <Select
            label={text.get('pronoun_drawer/person_one_label')}
            options={options} id="select-pronoun-one"
            selectedValue={first}
            onChange={setFirst}
            disabled={processing}
        />

        <Select
            label={text.get('pronoun_drawer/person_two_label')}
            options={options} id="select-pronoun-two"
            selectedValue={second}
            onChange={setSecond}
        />

        <div className={styles.buttonArea}>
            <Button
                label={text.get('pronoun_drawer/done_button')}
                type='primary'
                iconRight={processing ? <IconLibrary icon="processing" className="primary" /> : undefined}
                active={processing}
                onClick={putPronouns}
            />
        </div>
    </div>;
}

export default PronounOptions;