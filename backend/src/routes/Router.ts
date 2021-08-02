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

import { Router, Request, Response, NextFunction } from 'express';
import Party from '../models/Party';
import Player, { PlayerStatusCode } from '../models/Player';
import HttpStatus from '../payloads/HttpStatus';
import { IAccessTokenPayload } from '../payloads/PlayerPayloads';
import * as services from '../services';

const router = Router();

const noAuthPaths:Set<string> = new Set(['/', '/party/create']);
const optionalAuthPaths:Set<string> = new Set(['/party/join']);

// authorization middleware
router.use(async (req: Request, res: Response, next: NextFunction) => {
    let authorized = true;

    if (!noAuthPaths.has(req.path)) {
        authorized = false;

        const authHeader = req.header('Authorization');
        const bearerStr = 'Bearer ';
        if (authHeader && authHeader.startsWith(bearerStr)) {
            var token = authHeader.substring(bearerStr.length);
            if (token.length > 0) {
                try {
                    const tokenPayload = await services.jwt.verify<IAccessTokenPayload>(token);
                    if (tokenPayload) {
                        const player = await Player.findById(tokenPayload.player);
                        if (player && player.status != PlayerStatusCode.Left) {
                            const party = await Party.findById(player.party);
                            if (party && party.expiration.getDate() < Date.now()) {
                                authorized = true;
                                res.locals.player = player;
                                res.locals.party = party;
                            }
                        }
                    }
                } catch (err:any) {}
            }
        }
    }

    if (authorized || optionalAuthPaths.has(req.path)) {
        next();
    } else {
        res.sendStatus(HttpStatus.Unauthorized);
    }
});

router.get('/', (req: Request, res: Response) => {
    res.send("You've found an API.")
});

export default router;