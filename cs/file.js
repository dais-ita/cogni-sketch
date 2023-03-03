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
 * @file A collection of server-side functions relating to the processing of files.
 *
 * @author Dave Braines
 **/

const fs = require('fs-extra');
const path = require('path');
const csp = require('./cs_private');
const sec = require('./security');
const settings = require('../settings');
const log = require('./log');

const PARAM_IMAGE = 'image';
const PARAM_FILE = 'file';
const PARAM_FILES = 'files[]';
const PARAM_FILENAME = 'fileName';
const PARAM_FOLDER = 'folder';

/**
 * Get the fully qualified file name for the file in this request.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The fully qualified local filename.
 */
function getFileFilename(req) {
    return getFileFilenameFor(req, csp.getParameter(req, PARAM_FILE));
}

/**
 * Get the fully qualified file name for the specified file name parameter.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} fName        The plain file name to use.
 * @return {string}             The fully qualified local file name.
 */
function getFileFilenameFor(req, fName) {
    let userPath = csp.getUserOrOwnerPath(req);

    return path.join(userPath, csp.projectName(req), 'files', fName);
}

/**
 * Get the fully qualified file name for the image in this request.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The fully qualified local filename.
 */
function getImageFilename(req) {
    let userPath = csp.getUserOrOwnerPath(req);
    let imageFolder = path.join(userPath, csp.projectName(req), 'images');

    createFolderIfMissing(imageFolder);

    return path.join(imageFolder, csp.getParameter(req, PARAM_IMAGE));
}

/**
 * Save the (JSON) contents of this request POST body as an action file, using the current date timestamp as the
 * filename and in the 'actions' folder.
 *
 * @param {e.Request} req       The http request object.
 */
function saveAction(req) {
    let obj = req.body;
    obj.server_ts = Date.now();
    let actionsFolder = path.join(csp.getProjectPath(req), 'actions')

    try {
        createFolderIfMissing(actionsFolder);

        let fileName = path.join(actionsFolder, `${obj.server_ts}_${random(0, 9)}.json`);

        fs.writeFile(fileName, JSON.stringify(obj, null, 1), function(err) {
            if (err) {
                log.error('messages.file.save_file_error', { "fileName": fileName }, err);
            }
        });
    } catch(e) {
        // ignore the error
    }
}

function createFolderIfMissing(folder) {
    if (!fs.existsSync(folder)){
        try {
            fs.mkdirSync(folder);
        } catch (err) {
            log.error('messages.file.create_folder_error', { "folderName": folder });
        }
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Indicates whether the logged in user is authorised, either because they are an admin user or because they have
 * read permission to the shared project.
 *
 * @param {e.Request} req       The http request object.
 * @return {boolean}        Whether the logged in user is authorised.
 */
function isAuthorised(req) {
    //TODO: Relocate this?  All 3 should be in one place...
    //TODO: Make the 'read' permission dynamic
    return sec.isAdmin(req) || csp.isSharedAccessAuthorised(req, 'read');
}

/**
 * Count the number of files in the actions folder for the specified project and return this result.
 *
 * @param {e.Request} req       The http request object.
 * @return {number}             The number of action files in the folder.
 */
function countActions(req) {
    let result;

    if (csp.isLocalProject(req)) {
        result = countLocalProjectActions(req);
    } else {
        if (isAuthorised(req)) {
            result = countSharedProjectActions(req);
        } else {
            //TODO: Return a not-authorised error here
            result = -1;
        }
    }

    return result;
}

/**
 * List the actions in the actions folder for the specified project and return this result as an array of action
 * objects sorted by the timestamp property, descending
 *
 * @param {e.Request} req       The http request object.
 * @return {object[]}           The list of all action objects from the folder.
 */
function listActions(req) {
    let result;

    if (csp.isLocalProject(req)) {
        result = listLocalProjectActions(req);
    } else {
        if (isAuthorised(req)) {
            result = listSharedProjectActions(req, csp.ownerName(req));
        } else {
            //TODO: Return a not-authorised error here
            result = [];
        }
    }

    result.sort(function(a, b) {
        return a - b;
    });

    return result;
}

/**
 * Count the number of files in the local actions folder for the specified project and return this result.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The number of action files in the folder.
 */
function countLocalProjectActions(req) {
    const fn = path.join(csp.getProjectPath(req), 'actions');

    createFolderIfMissing(fn);

    return doCountActions(fn);
}

/**
 * Count the number of files in the shared actions folder for the specified project and return this result.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The number of action files in the folder.
 */
function countSharedProjectActions(req) {
    const fn = path.join(csp.getProjectPath(req, undefined, csp.ownerName(req)), 'actions');

    createFolderIfMissing(fn);

    return doCountActions(fn);
}

/**
 * Count the number of files in the specified folder.
 *
 * @param {string} fn           The fully qualified folder name to be counted.
 * @return {object}             The number of action files in the folder.
 */
function doCountActions(fn) {
    let result;
    let fList;

    try {
        fList = fs.readdirSync(fn);
        let lastAction = fList[fList.length - 1];
        let delta;

        if (lastAction) {
            lastAction = parseInt(lastAction.replace('.json', ''));

            let lastDate = new Date(lastAction);
            delta = Math.round((new Date() - lastDate) / 1000);  // Compute delta server-side for consistent time
        }

        result = { "count": fList.length, "lastAction": lastAction, "delta": delta };
    } catch (e) {
        // the actions folder can validly not exist
//        log.warn('messages.action.read_error', { "fileName": fn , "type": 'count' });
        result = { "count": 0 };
    }

    return result;
}

/**
 * List the file names in the local actions folder for the specified project and return this result.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The list of action files in the folder.
 */
function listLocalProjectActions(req) {
    const fn = path.join(csp.getProjectPath(req), 'actions');

    createFolderIfMissing(fn);

    return doListActions(fn);
}

/**
 * List the file names in the shared actions folder for the specified project and return this result.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The list of action files in the folder.
 */
function listSharedProjectActions(req) {
    const fullPath = path.join(csp.getProjectPath(req, undefined, csp.ownerName(req)), 'actions');

    createFolderIfMissing(fullPath);

    return doListActions(fullPath);
}

/**
 * List the file names in the specified folder.
 *
 * @param {string} fullPath     The fully qualified folder name to be counted.
 * @return {object}             The number of action files in the folder.
 */
function doListActions(fullPath) {
    let actionList = [];
    let fList;

    try {
        fList = fs.readdirSync(fullPath);

        for (let fn of fList) {
            const fc = fs.readFileSync(path.join(fullPath, fn), settings.codepage);

            try {
                actionList.push(JSON.parse(fc));
            } catch(e) {
                console.log(`JSON parse error for: ${fn}`);
            }
        }
    } catch (e) {
        log.error('messages.action.read_error', { "fileName": fullPath, "type": 'list' }, e);
    }

    return actionList;
}

/**
 * Remove all of the files in the specified actions folder.
 *
 * @return {object}             The number of action files in the folder.
 */
function clearActions(req) {
    let result;

    if (csp.isLocalProject(req)) {
        result = clearLocalProjectActions(req);
    } else {
        if (isAuthorised(req)) {
            result = clearSharedProjectActions(req, csp.ownerName(req));
        } else {
            //TODO: Return a not-authorised error here
            result = [];
        }
    }

    return result;
}

/**
 * Remove all of the files in the specified local actions folder.
 *
 * @return {object}             The number of action files in the folder.
 */
function clearLocalProjectActions(req) {
    const fn = path.join(csp.getProjectPath(req), 'actions');

    createFolderIfMissing(fn);

    return doClearActions(fn);
}

/**
 * Remove all of the files in the specified shared actions folder.
 *
 * @return {object}             The number of action files in the folder.
 */
function clearSharedProjectActions(req) {
    const fullPath = path.join(csp.getProjectPath(req, undefined, csp.ownerName(req)), 'actions');

    createFolderIfMissing(fullPath);

    return doClearActions(fullPath);
}

/**
 * Remove all of the files in the specified actions folder.
 *
 * @param {string} fullPath     The fully qualified folder name from which the action files will be deleted.
 * @return {object}             The number of action files in the folder.
 */
function doClearActions(fullPath) {
    let removedList = [];
    const fList = fs.readdirSync(fullPath);

    for (let fn of fList) {
        let fullFn = path.join(fullPath, fn);

        try {
            fs.unlinkSync(fullFn);
        } catch (e) {
            log.error('messages.action.delete_error', { "fileName": fullPath}, e);
        }

        removedList.push(fullFn);
    }

    return removedList;
}

/**
 * Upload one or more files to the active project files folder.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The list of all file names that have been uploaded
 */
function uploadFile(req) {
    let result = {
        "message": '',
        "filenames": [],
        "errors": []
    };

    if (!req.files) {
        result.message = log.localize('messages.file.no_files');
    } else {
        let list = req.files[PARAM_FILES];

        if (Array.isArray(list)) {
            for (let thisFile of list) {
                saveUploadedFile(req, thisFile, result);
            }
        } else {
            saveUploadedFile(req, list, result);
        }

        result.message = log.localize('messages.file.uploaded', { "count": result.filenames.length });

        if (result.errors.length > 0) {
            result.message += log.localize('messages.file.failed', { "count": result.errors.length });
        }
    }

    return result;
}

/**
 * Upload one or more icon files to the generic palette icons folder.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The list of all file names that have been uploaded
 */
function uploadIcon(req) {
    let result = {
        "message": '',
        "filenames": [],
        "errors": []
    };

    if (!req.files) {
        result.message = log.localize('messages.file.no_files');
    } else {
        let list = req.files[PARAM_FILES];

        if (Array.isArray(list)) {
            for (let thisFile of list) {
                saveUploadedIconFile(req, thisFile, result);
            }
        } else {
            saveUploadedIconFile(req, list, result);
        }

        result.message = log.localize('messages.file.uploaded', { "count": result.filenames.length });

        if (result.errors.length > 0) {
            result.message += log.localize('messages.file.failed', { "count": result.errors.length });
        }
    }

    return result;
}

/**
 * Return a list of all the filenames for the specified project.
 *
 * @param {e.Request} req       The http request object.
 * @return {string[]}           The list of all filenames for the project.
 */
function listAllFiles(req) {
    let result = [];
    let authorised = false;

    if (!csp.isLocalProject(req)) {
        if (isAuthorised(req)) {
            authorised = true;
        }
    } else {
        authorised = true;
    }

    if (authorised) {
        const filePath = path.join(csp.getProjectPath(req, undefined, csp.ownerName(req)), 'files');

        createFolderIfMissing(filePath);
        try {
            const fList = fs.readdirSync(filePath);

            for (let fn of fList) {
                const stat = fs.statSync(path.join(filePath, fn));

                if (stat && stat.isDirectory()) {
                    //TODO: Handle sub-folders when needed
                } else {
                    if (!csp.isExcluded(fn)) {
                        result.push(fn);
                    }
                }
            }
        } catch (e) {
            // The files folder does not exist.  Ignore the error
        }
    }

    return result;
}

/**
 * Save the binary content of the specified file object to a file within the 'files' folder of the specified project
 * which is provided in the POST body.
 *
 * @param {e.Request} req       The http request object.
 * @param {File} file           The binary contents of the file to be saved.
 * @param {object} result       An existing result object to which the name of the saved file is added.
 */
function saveUploadedFile(req, file, result) {
    let projName = req.body.project;
    let projFolder = csp.getProjectPath(req, projName);
    let filesFolder = path.join(projFolder, 'files')

    createFolderIfMissing(filesFolder);

    let fileName = path.join(filesFolder, file.name);

    log.debug('messages.file.saved_file', { "fileName": fileName });

    try {
        fs.writeFileSync(fileName, file.data, 'base64');
        result.filenames.push(file.name);
    } catch (e) {
        log.error('messages.file.save_file_error', { "fileName": fileName}, e);
        result.errors.push(file.name);
    }
}

/**
 * Save the binary content of the specified icon file object to a file within the global 'palette' icon folder.
 *
 * @param {e.Request} req       The http request object.
 * @param {File} file           The binary contents of the file to be saved.
 * @param {object} result       An existing result object to which the name of the saved file is added.
 */
function saveUploadedIconFile(req, file, result) {
    let filesFolder = path.join(csp.getRootPath(), 'public', 'images', 'palette');

    let fileName = path.join(filesFolder, file.name);

    log.debug('messages.file.saved_file', { "fileName": fileName });

    try {
        fs.writeFileSync(fileName, file.data, 'base64');
        result.filenames.push(file.name);
    } catch (e) {
        log.error('messages.file.save_file_error', { "fileName": fileName}, e);
        result.errors.push(file.name);
    }
}

/**
 * Save the binary content of the POST body data property to an image file within the 'images' folder of the specified
 * project using the POST data imageName property.
 *
 * @param {e.Request} req       The http request object.
 */
function saveCopyOfImage(req) {
    let obj = req.body;
    let projName = req.body.project;
    let projFolder = csp.getProjectPath(req, projName);
    let imagesFolder = path.join(projFolder, 'images');

    createFolderIfMissing(imagesFolder);

    let fileName = path.join(imagesFolder, obj.imageName);

    //TODO: This is virtually identical to saveDirectFile, but with different target folder and peropty names
    //TODO: Pass in the result object like for saveUploadedFile() method

    log.debug('messages.file.saved_image', { "fileName": fileName });

    fs.writeFile(fileName, obj.data, 'base64', function(err) {
        if (err) {
            log.error('messages.file.save_image_error', { "fileName": fileName }, err);
        }
    });
}

/**
 * Save the binary content of the POST body data property to a file within the 'files' folder of the specified project
 * using the POST data fileName property.
 *
 * @param {e.Request} req       The http request object.
 */
function saveDirectFile(req) {
    let obj = req.body;
    let projName = req.body.project;
    let projFolder = csp.getProjectPath(req, projName);
    let filesFolder = path.join(projFolder, 'files')

    createFolderIfMissing(filesFolder);

    let fileName = path.join(filesFolder, obj.fileName);

    log.debug('messages.file.saved_image', { "fileName": fileName });

    //TODO: Pass in the result object like for saveUploadedFile() method

    fs.writeFile(fileName, obj.data, 'base64', function(err) {
        if (err) {
            log.error('messages.file.save_image_error', { "fileName": fileName }, err);
        }
    });
}

/**
 * Save the (text) contents of this request POST body as a file to the location specified in the folder and
 * file url query parameters.
 *
 * @param {e.Request} req       The http request object.
 */
function saveTextFile(req) {
    let content = req.body;

    let projFolder = path.join(csp.getProjectPath(req), 'files');

    createFolderIfMissing(projFolder);

    let fileName = req.query[PARAM_FILENAME];
    let folder = req.query[PARAM_FOLDER] || '';

    //TODO: Add test for blank filename here

    fs.writeFile(path.join(projFolder, folder, fileName), content, function(err) {
        if (err) {
            log.error('messages.file.save_file_error', { "fileName": fileName }, err);
        }
    });
}

/** Module exports */
module.exports = Object.freeze({
    "getFileFilenameFor": getFileFilenameFor,
    "getFileFilename": getFileFilename,
    "getImageFilename": getImageFilename,
    "saveDirectFile": saveDirectFile,
    "saveTextFile": saveTextFile,
    "saveImage": saveCopyOfImage,
    "saveAction": saveAction,
    "countActions": countActions,
    "listActions": listActions,
    "clearActions": clearActions,
    "upload": uploadFile,
    "uploadIcon": uploadIcon,
    "listAllFiles": listAllFiles
});
