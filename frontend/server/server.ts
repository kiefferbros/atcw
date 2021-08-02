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

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import proxy from 'express-http-proxy';

const apiTarget = process.env.BACKEND_PROXY_TARGET ?? 'http://localhost:8000';

const httpsPort = process.env.HTTPS_PORT ?? 4443;
const httpPort = process.env.HTTP_PORT ?? 8080;

const host = process.env.HOST ?? `localhost:${httpsPort}`;

const app = express();

// reverse proxy api
app.use('/services', proxy(apiTarget));

// redirect to https
app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }
    res.redirect('https://' + host + req.url);
});

if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');
    const devMiddleware = require('webpack-dev-middleware');
    const hotMiddleware = require('webpack-hot-middleware');
    const config = require('./../webpack.config.js');
    const compiler = webpack(config);

    app.use(
        devMiddleware(compiler, {
            publicPath: config.output.publicPath,
        })
    );

    app.use(hotMiddleware(compiler));
} else {
    const publicDir = path.join(__dirname, 'public');
    const htmlFile = path.join(publicDir, '/index.html');

    app.use(express.static(publicDir));

    app.get('/', (req: Request, res: Response) => {
        res.sendFile(htmlFile);
    });
}

const sslKey = fs.readFileSync(process.env.SSL_KEY_FILE ?? './../secrets/selfsigned.key');
const sslCert = fs.readFileSync(process.env.SSL_CERT_FILE ?? './../secrets/selfsigned.crt');

https.createServer({ key: sslKey, cert: sslCert }, app).listen(httpsPort, () => {
    console.log('Https server listening on port: ' + httpsPort);
});


http.createServer(app).listen(httpPort, () => {
    console.log('Http server listening on port: ' + httpPort);
});