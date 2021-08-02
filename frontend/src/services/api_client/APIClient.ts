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

import axios, { AxiosError, AxiosRequestConfig, CancelToken, CancelTokenSource } from 'axios';
import { ICreatePartyRequest, IEntryRequest, IStoryForm, IJoinPartyRequest,
    IJoinResponse, IPartyStatus, IPronouns, IStory, statusChanged, HttpStatus, IResultsResponse } from './Types';
import {IEvent, Event} from '../../util/Event';
import Debug from '../../util/Debug';

const accessTokenKey: string = 'accesToken';

export default class APIClient {
    private _baseURL:string;
    private _accessToken:string|null;
    private _timeout:number;
    private _statusInterval:number;
    private _partyCode:string|null;

    private _onStatus = new Event<IPartyStatus | AxiosError>();
    private _intervalHandle: any;

    private _cachedStatus:IPartyStatus|undefined;

    constructor (serviceUrl:string, timeout:number, statusInterval:number)
    {
        this._baseURL = serviceUrl;
        this._accessToken = localStorage.getItem(accessTokenKey);
        this._partyCode = null;

        this._timeout = timeout;
        this._statusInterval = statusInterval;
        this._intervalHandle = null;
        this._cachedStatus = undefined;
    }

    public shutdown(): void {
        Debug.log('shutdown api service.');
        this._endSession();
    }

    private _startSession(sessionData:IJoinResponse): void {
        localStorage.setItem(accessTokenKey, sessionData.accessToken);
        this._accessToken = sessionData.accessToken;
        this._partyCode = sessionData.partyCode;

        this._partyStatusPulse();
        this._intervalHandle = setInterval(this._partyStatusPulse.bind(this), this._statusInterval);
    }

    private _endSession(): void {
        localStorage.removeItem(accessTokenKey);
        this._accessToken = null;
        this._partyCode = null;
        this._cachedStatus = undefined;
        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = null;
        }
    }

    private async _partyStatusPulse(): Promise<void> {
        if (this._accessToken) {
            try {
                const status = await this._partyStatus();
                if (statusChanged(this._cachedStatus, status)) {
                    this._cachedStatus = status;
                    this._onStatus.dispatch(status);
                }
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.code !== 'ECONNABORTED' && err.response?.status !== HttpStatus.RequestTimeout) {
                    this._onStatus.dispatch(err);
                }
            }
        }
    }

    private _requestConfig(cancelToken?: CancelToken, timeout?: number): AxiosRequestConfig {
        return {
            headers: this._accessToken ? {
                Authorization: 'Bearer ' + this._accessToken
            } : undefined,
            timeout: timeout ?? this._timeout,
            cancelToken
        }
    }

    public cancelTokenSource(): CancelTokenSource {
        return axios.CancelToken.source();
    }

    public get partyCode():string {
        return this._partyCode ?? '';
    }

    public get cachedStatus(): IPartyStatus|undefined {
        return this._cachedStatus;
    }

    public get onStatus(): IEvent<IPartyStatus | AxiosError, void> {
        return this._onStatus;
    }

    public nextStatus(): Promise<IPartyStatus | AxiosError> {
        const promise = new Promise<IPartyStatus | AxiosError>((resolve, reject) => {
            const handler = (payload: IPartyStatus | AxiosError) => {
                this._onStatus.removeListener(handler);
                resolve(payload);
            };
            this._onStatus.addListener(handler);
        });
        return promise;
    }

    // Party Routes
    // ------------

    /**
     * Create and join a party
     * @param {string} playerName - name of player to join the created party
     * @param {IPronouns} pronouns - pronouns for player
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     * @returns {Promise<IJoinResponse>} - A join response
     */
    public async createParty(playerName: string, pronouns: IPronouns, cancelToken?: CancelToken): Promise<IJoinResponse> {
        localStorage.removeItem(accessTokenKey);
        this._accessToken = null;

        const payload: ICreatePartyRequest = {
            playerName,
            pronouns
        };

        const res = await axios.post<IJoinResponse>(`${this._baseURL}/party/create`, payload, {
            timeout: this._timeout,
            cancelToken
        });

        this._startSession(res.data);

        return res.data;
    }

    /**
     * Join a party
     * @param {string} playerName - name of player to join the created party
     * @param {IPronouns} pronouns - pronouns for player
     * @param {IPronouns} partyCode - party code for party to join
     * @param {IPronouns} partyCode - (optional) full party id for party to join
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     * @returns {Promise<IJoinResponse>} - A join response
     */
    public async joinParty(playerName: string, pronouns: IPronouns, partyCode: string, partyId?: string, cancelToken?: CancelToken): Promise<IJoinResponse> {

        const payload: IJoinPartyRequest = {
            partyCode,
            partyId,
            playerName,
            pronouns
        };

        const res = await axios.post<IJoinResponse>(`${this._baseURL}/party/join`, payload, this._requestConfig(cancelToken));

        this._startSession(res.data);

        return res.data;
    }

    private async _partyStatus(cancelToken?:CancelToken) : Promise<IPartyStatus> {
        const res = await axios.get<IPartyStatus>(
            `${this._baseURL}/party/status`,
            this._requestConfig(cancelToken, this._statusInterval)
        );

        return res.data;
    }

    // Player Routes
    // -------------

    /**
     * Leave a party
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     */
    public async leaveParty(cancelToken?: CancelToken): Promise<void> {
        await axios.post(`${this._baseURL}/player/leave`, {}, this._requestConfig(cancelToken));

        this._endSession();
    }

    /**
     * Get player pronoun ids on the api server
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     * @returns {Promise<IPronouns>} - pronoun ids stored on the api server
     */
    public async getPronouns(cancelToken?: CancelToken): Promise<IPronouns> {
        const res = await axios.get<IPronouns>(`${this._baseURL}/player/pronouns`, this._requestConfig(cancelToken));
        return res.data;
    }

    /**
     * Set player pronoun ids on the api server
     * @param {CancelToken} pronouns - pronoun ids for the player to be set on the api server
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     */
    public async setPronouns(pronouns:IPronouns, cancelToken?: CancelToken): Promise<void> {
        await axios.put(`${this._baseURL}/player/pronouns`, pronouns, this._requestConfig(cancelToken));
    }

    // round routes
    // ------------

    /**
     * Start round
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     */
    public async startRound(entryCount: number, cancelToken?: CancelToken): Promise<void> {
        await axios.post(`${this._baseURL}/round/start`, {entryCount}, this._requestConfig(cancelToken));
    }

    /**
     * End round
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     */
    public async endRound(cancelToken?: CancelToken): Promise<void> {
        await axios.post(`${this._baseURL}/round/end`, {}, this._requestConfig(cancelToken));
    }

    /**
     * Get a story form for a player for an active round
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     * @returns {Promise<IStoryForm>} - a form response containing pronoun ids for each story entry
     */
    public async getStoryForm(cancelToken?: CancelToken): Promise<IStoryForm> {
        const res = await axios.get<IStoryForm>(`${this._baseURL}/round/form`, this._requestConfig(cancelToken));

        return res.data;
    }

    /**
     * Post a new entry from the story form
     * @param {string} text - entry text
     * @param {number} index - the index of the entry [0-7]
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     */
    public async postStoryEntry(text:string, index:number, cancelToken?: CancelToken): Promise<void> {
        const payload:IEntryRequest = {
            index,
            text
        };

        await axios.post(`${this._baseURL}/round/entry`, payload, this._requestConfig(cancelToken));
    }

    /**
     * Get all the stories for a completed round
     * @param {CancelToken} cancelToken - (optional) cancellation token for api request
     * @returns {Promise<IResultsResponse} - an array of stories
     */
    public async getResults(cancelToken?: CancelToken): Promise<IResultsResponse> {
        const res = await axios.get<IResultsResponse>(`${this._baseURL}/round/results`, this._requestConfig(cancelToken));
        return res.data;
    }
}
