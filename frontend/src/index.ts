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

import * as services from './services';

const urlParams = new URLSearchParams(window.location.search);
const inviteCode = urlParams.get('invite');
if (inviteCode) {
    services.prefs.set('invite', inviteCode);
    services.prefs.set('partyCode', inviteCode);
    // redirects
    window.location.search = '';
} else {
    import(/* webpackChunkName: "App" */'./components/App').then((module) => {
        const renderApp = module.default;
        renderApp();
    });


    if (module.hot) {
        module.hot.dispose(data => {
            services.api.shutdown();
        });
        module.hot.accept();
    }
}

