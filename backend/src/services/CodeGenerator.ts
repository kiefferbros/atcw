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

const defaultCharSet:string = 'BCDFGHJKLMNPQRSTWXZ';

const generateCode = async (length: number, allowed?:(test:string)=>Promise<boolean>|boolean, charSet?: string) : Promise<string> => {
    let code:string = '';

    charSet = charSet ?? defaultCharSet;

    for (let i = 0; i < length; i++)
    {
        code += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }

    if (allowed && !(await allowed(code)))
    {
        code = await generateCode(length, allowed, charSet);
    }

    return code;
}

export default generateCode;