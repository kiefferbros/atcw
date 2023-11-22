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
import * as services from '../../services';
import { INavProps } from "../NavProps";
import { HttpStatus, IPronouns } from "../../services/api_client";
import { PronounForm } from '../../services/PronounService';
import { capitalize } from '../../util/TextUtil';
import axios from "axios";
import RoundForm from "../sections/RoundForm";
import Debug from "../../util/Debug";
import ErrorModal from "../views/ErrorModal";
import { CancelActionType, ICancelReducerProps } from "../../hooks/useCancelReducer";

export interface IFormQuestion {
    labelKey: string;
    inputName: string;
    missingKey: string;
    firstForm?: PronounForm;
    secondForm?: PronounForm;
}

const EntryCharMax: number = 1024;

const firstMatch = /\*1\*/g;
const secondMatch = /\*2\*/g;

export interface IRoundFormContainerProps {
    question: IFormQuestion;
    pronouns: IPronouns;
    index: number;
    onSuccess: (index: number) => void;
}

const getPronounString = (pronounId: string, pronounForm:PronounForm|undefined, noneName: string): string|undefined => {
    return pronounForm ? services.pronouns.getString(pronounId, pronounForm, noneName) : undefined;
}

export default (props: IRoundFormContainerProps&INavProps&ICancelReducerProps) => {
    const [processing, setProcessing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const first = getPronounString(
        props.pronouns.first,
        props.question.firstForm,
        services.text.get('gameplay/person_one')
    );
    const second = getPronounString(
        props.pronouns.second,
        props.question.secondForm,
        services.text.get('gameplay/person_two')
    );

    let inputLabel = services.text.get(props.question.labelKey);
    if (first) {
        const idx = inputLabel.search(firstMatch);
        if (idx !== -1) {
            inputLabel = inputLabel.replace(firstMatch, idx === 0 ? capitalize(first) : first);
        }
    }

    if (second) {
        const idx = inputLabel.search(secondMatch);
        if (idx !== -1) {
            inputLabel = inputLabel.replace(secondMatch, idx === 0 ? capitalize(second) : second);
        }
    }

    const submitHandler = async (inputValue:string) => {
        const source = services.api.cancelTokenSource();
        props.dispatchCancel({ type: CancelActionType.AddSource, payload: source });
        props.nav.retainInteractionBlocker();

        setProcessing(true);

        try {
            await services.api.postStoryEntry(inputValue, props.index, source.token);
            setSubmitted(true);
            props.onSuccess(props.index);
        } catch (err: any) {
            if (axios.isCancel(err)) {
                Debug.log(`Post entry ${props.index} was cancelled.`);
            } else {
                Debug.log(err.message);
                if (axios.isAxiosError(err) && err.response?.status === HttpStatus.EntryAlreadyExists) {
                    // entry already exists; move onto next
                    setSubmitted(true);
                    props.onSuccess(props.index);
                } else {
                    props.nav.presentModal(modalProps => <ErrorModal dismiss={modalProps.dismiss} />);
                }
            }
            setProcessing(false);
        } finally {
            props.dispatchCancel({ type: CancelActionType.RemoveSource, payload: source });
            props.nav.releaseInteractionBlocker();
        }
    };

    return <RoundForm
        inputLabel={inputLabel}
        inputName={props.question.inputName}
        buttonLabel={services.text.get(props.index === 7 ? 'gameplay/finish' : 'gameplay/next')}
        validate={inputValue => {
            return inputValue.length > 0 && inputValue.length <= EntryCharMax;
        }}
        onSubmit={submitHandler}
        processing={submitted || processing}
    />
}
