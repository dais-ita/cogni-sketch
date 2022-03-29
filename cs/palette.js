/**
 * MIT License
 *
 * Copyright (c) 2022 International Business Machines
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @file A collection of server-side functions relating to the processing of palette types.
 *
 * @author Dave Braines
 **/

//TODO: Share the typedef for standard csPalette object from the client

const fs = require('fs-extra');
const path = require('path');
const csp = require('./cs_private');
const log = require('./log');
const csr = require('./response');
const settings = require('../settings');

const EXAMPLE_PALETTE = path.join(csp.getRootPath(), 'examples', 'example_palettes', 'default.json');

const DEFAULT_NAME = settings.default_palette;

/**
 * List all of the palette names for the specified user.  The palette name is simply the file name with the .json
 * suffix removed.
 *
 * @param {e.Request} req - the http request object.
 * @param {string} userName - the name of the user who owns the palettes.
 * @param {boolean} [quiet] - whether to report an error if the foler is not found
 * @return {string[]}
 */
function listPalettes(req, userName, quiet) {
    const palPath = csp.getPalettePath(req, userName);
    let files;
    let palList = [];

    try {
        files = fs.readdirSync(palPath);

        if (files) {
            for (let file of files) {
                if (!csp.isExcluded(file)) {
                    if (file.endsWith('.json')) {
                        palList.push(file.replace('.json', ''));
                    }
                }
            }
        }
    } catch (e) {
        if (!quiet) {
            log.warn('messages.palette.list_error', { "palPath": palPath });
        }
    }

    return palList;
}

/**
 * Return the palette object for the palette and user named in the request.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The corresponding palette object.
 */
function readPalette(req) {
    return readPaletteNamed(req, csp.paletteName(req), csp.ownerName(req));
}

/**
 * Open the file for the specified palette and owner, and if permissions allow, instantiate and return the palette
 * object.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} palName      The palette name being sought.
 * @param {string} [owner]      The optional owner name of the palette.
 * @return {object}             The corresponding palette object.
 */
function readPaletteNamed(req, palName, owner) {
    let fileName = path.join(csp.getPalettePath(req, owner), `${palName}.json`);
    let fileContents;
    let paletteObj;
    let done = false;

    try {
        fileContents = fs.readFileSync(fileName, settings.codepage);

        try {
            paletteObj = JSON.parse(fileContents);

            //TODO: Extend permissions to support conditional (rather than blanket) palette sharing

            // If the palette is owned by another user, ensure that it has the owner added and is marked as read-only.
            if (owner) {
                paletteObj.owner = owner;
                paletteObj.readOnly = true;
            }

            done = true;
        } catch(e) {
            log.warn('messages.palette.parse_error', { "palettePath": palName, "fileName": fileName });
        }
    } catch (e) {
        log.warn('messages.palette.read_error', { "palettePath": palName, "fileName": fileName });
    }

    if (!done) {
        //Something failed, so load the default palette instead
        fileName = path.join(csp.getPalettePath(req), `${DEFAULT_NAME}.json`);
        //TODO: Should try/catch here too, even for the default palette;
        fileContents = fs.readFileSync(fileName, settings.codepage);
        paletteObj = JSON.parse(fileContents);
    }

    return paletteObj;
}

/**
 * Save the request body object as a palette, using a filename that corresponds to the palette name.
 * The default palette cannot be edited and therefore cannot be saved.
 *
 * The server timestamp property is updated on the palette before it is saved.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The palette object that has been saved.
 */
function savePalette(req) {
    let obj = req.body;

    if (obj.name !== DEFAULT_NAME) {
        const fileName = `${obj.name}.json`;
        const fullFileName = path.join(csp.getPalettePath(req), fileName);

        obj.server_ts = Date.now();

        // If the palette is marked as new then load the default palette as the contents since a new palette is empty
        if (obj.isNew) {
            const defPaletteC = fs.readFileSync(EXAMPLE_PALETTE, settings.codepage);
            let defPal = JSON.parse(defPaletteC);

            defPal.name = obj.name;

            obj = defPal;
        }

        // First try to delete the palette - in case it exists already with a different case
        try {
            fs.unlinkSync(fullFileName);
        } catch (e) {
            // Can be ignored - the file may not exist
        }

        fs.writeFile(fullFileName, JSON.stringify(obj, null, 1), function(err) {
            if (err) {
                log.error('messages.palette.write_error', { "fileName": fileName }, err);
            }
        });
    } else {
        log.warn('messages.palette.no_mod_default');
        obj = undefined;
    }

    return obj;
}

/**
 * Delete the palette specified in this request.
 *
 * @param {e.Request} req       The http request object.
 * @return {{nodes: [], messages: [], originalNodeId: *, errors: []}|{status: string}}
 */
function deletePalette(req) {
    //TODO: Make this a http delete action rather than passing the project name in the request body?
    const palFolder = csp.getPalettePath(req);
    let obj = req.body;
    let resp;

    if (obj.name !== DEFAULT_NAME) {
        const fileName = `${obj.name}.json`;
        const fullFileName = path.join(palFolder, fileName);

        fs.unlinkSync(fullFileName);

        resp = csp.JSON_SUCCESS;
    } else {
        // The default palette cannot be deleted
        resp = csr.createResponseContainer(null);

        let msgText = log.warn('messages.palette.no_del_default');
        csr.addResponseError(resp, msgText);
    }

    return resp;
}

/** Module exports */
module.exports = Object.freeze({
    "listAll": listPalettes,
    "read": readPalette,
    "readPaletteNamed": readPaletteNamed,
    "save": savePalette,
    "delete": deletePalette
});
