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

import express from 'express';
import { Server } from 'http';
import { urlencoded, json } from 'body-parser';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import cors from 'cors';
import {corsOptions} from './support/cors';
import apiRouter from "./routes"
import { swaggerOptions } from './support/swagger';

// Setup
// -----
const port = process.env.PORT || 8000;
const app = express();

app.use(cors(corsOptions));
app.use(urlencoded({ extended: true }));
app.use(json())

app.use('/api/v1', apiRouter);

export const serverPromise = new Promise<Server>(async (resolve, reject) => {
	try {
		const userFile: string = process.env.MONGO_USERNAME_FILE ?? './../secrets/mongo-user';
		const passFile: string = process.env.MONGO_PASSWORD_FILE ?? './../secrets/mongo-pass';
		const dbURL: string = process.env.MONGO_URL ?? 'mongodb://localhost:27017/database';

		const userStr = (await fs.readFile(userFile)).toString();
		const passwordStr = (await fs.readFile(passFile)).toString();

		await mongoose.connect(dbURL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			poolSize: 5,
			auth: {
				user: userStr,
				password: passwordStr
			}
		});

		// Swagger Documentation
		// ---------------------
		if (process.env.NODE_ENV === 'development') {
			const swagger = (await import('express-swagger-generator')).default;
			const swaggerMiddleware = swagger(app);
			swaggerMiddleware(swaggerOptions);
		}

		const server: Server =  app.listen(port, () => {
			console.log('App listening on port: ' + port);
		});

		resolve(server);
	} catch (err: any) {
		reject(err);
	}
});
