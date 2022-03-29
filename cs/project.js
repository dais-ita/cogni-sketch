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
 * @file A collection of server-side functions relating to the processing of project objects.
 *
 * @author Dave Braines
 **/

//TODO: Share the typedef for standard csProject object from the client

const path = require('path');
const fs = require('fs-extra');
const JSZip = require('jszip');
const csp = require('./cs_private');
const security = require('./security');
const log = require('./log');
const palette = require('./palette');
const settings = require('../settings');

const EX_PAL_FN = path.join(csp.getRootPath(), 'examples', 'example_palettes');
const EX_PROJ_FN = path.join(csp.getRootPath(), 'examples', 'example_projects');
const PERM_FN = path.join(csp.getRootPath(), 'data', 'permissions', 'project_permissions.json');

const PARAM_PROP_NAME = 'propName';

/**
 * List all of the projects for the logged in user (default) or the owner user name if specified.
 *
 * The permissions file is also checked, and any shared projects that area available to the logged in user
 * are also returned.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} [userName]   The optional 'owner' user name for the projects.
 * @return {object[]}           The list of all relevant projects.
 */
function listProjects(req, userName) {
    let userPath;
    let files;
    let projList = [];

    if (userName) {
        userPath = csp.getOwnerPath(userName);
    } else {
        userPath = csp.getUserPath(req);
    }

    try {
        files = fs.readdirSync(userPath);

        if (files) {
            for (let file of files) {
                if (fs.lstatSync(path.join(userPath, file)).isDirectory()) {
                    if (file !== settings.palette_folder) {
                        projList.push(file);
                    }
                }
            }
        }

        let thisUserName = csp.userName(req);

        const fc = fs.readFileSync(PERM_FN, settings.codepage);
        let perms = JSON.parse(fc);

        if (perms) {
            for (let projPerm of perms) {
                if (projPerm.granted === thisUserName) {
                    projList.push(`*SHARED by ${projPerm.owner} : ${projPerm.project} [ ${projPerm.permissions} ]`);
                }
            }
        }
    } catch (e) {
        log.warn('messages.project.read_error', { "fileName": userPath });
    }

    return projList;
}

/**
 * List all proposals (requests for updates to be made to a users project by someone else) for the logged in user
 * and the specified project.
 *
 * @param {e.Request} req       The http request object.
 * @return {object[]}           The list of relevant proposals.
 */
function listProposals(req) {
    const propPath = path.join(csp.getProjectPath(req), 'proposals');
    let files;
    let propList = [];

    try {
        files = fs.readdirSync(propPath);

        if (files) {
            for (let propFn of files) {
                if (!csp.isExcluded(propFn)) {
                    const fn = path.join(csp.getProjectPath(req), 'proposals', propFn);
                    const fc = fs.readFileSync(fn, settings.codepage);

                    propList.push({ "filename": propFn, "contents": JSON.parse(fc)});
                }
            }
        }
    } catch (e) {
        log.warn('messages.project.read_proposals_error', { "fileName": propPath });
    }

    return propList;
}

/**
 * Read the specified project from the project file.  If the project is not local then check for suitable read
 * permission for the logged in user before proceeding.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The project object.
 */
function readProject(req) {
    let result;

    if (csp.isLocalProject(req)) {
        result = readLocalProject(req);
    } else {
        if (csp.isSharedAccessAuthorised(req, 'read')) {
            result = readSharedProject(req, csp.ownerName(req));
        } else {
            result = {
                "error": log.error('messages.security.access_prevented', {
                    "type": 'project',
                    "name": csp.projectName(req),
                    "userName": csp.userName(req)
                })};
        }
    }

    return result;
}

/**
 * Read the specified local project from the file location.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The loaded project object from file.
 */
function readLocalProject(req) {
    const fn = path.join(csp.getProjectPath(req), 'ObjectModel.json');
    let projObj = readProjectFromFile(fn);

    if (projObj && projObj.paletteName) {
        let palObj = palette.readPaletteNamed(req, projObj.paletteName);

        if (palObj) {
            projObj.palette = palObj;
        }
    }

    return projObj;
}

function readProjectFromFile(fileName) {
    let projObj;

    try {
        const fc = fs.readFileSync(fileName, settings.codepage);

        try {
            projObj = JSON.parse(fc);
        } catch (e) {
            log.warn('messages.project.parse_error', { "fileName": fileName });
        }
    } catch(e) {
        log.warn('messages.project.read_error', { "fileName": fileName });
    }

    return projObj;
}

/**
 * Read the specified shared project from the file location.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} ownerName    The name of the owner for this shared project.
 * @return {object}             The loaded project object from file.
 */
function readSharedProject(req, ownerName) {
    const fn = path.join(csp.getProjectPath(req, undefined, ownerName), 'ObjectModel.json');
    let projObj = readProjectFromFile(fn);

    if (projObj && projObj.paletteName) {
        let palObj = palette.readPaletteNamed(req, projObj.paletteName, ownerName);

        if (palObj) {
            projObj.palette = palObj;
        }
    }

    updateUrls(projObj, ownerName);

    // set the owner property and readonly status on the returned project
    projObj.owner = ownerName;
    projObj.readOnly = true;

    return projObj;
}

/**
 * When a project is shared, each of the urls for images and files must be updated in this read-only version to
 * ensure that the owner name is appended to the urls.  This will ensure that permissions can be checked and that
 * the correct images and files can be located.
 *
 * @param {object} projObj      The shared project object that has been loaded.
 * @param {string} ownerName        The owner user name.
 */
function updateUrls(projObj, ownerName) {
    //TODO: Implement this in a better way

    for (let node of Object.values(projObj.nodes)) {
        if (node.data.properties) {
            for (let [key, propVal] of Object.entries(node.data.properties)) {
                if (propVal && (typeof propVal === 'string') && propVal.startsWith('./image')) {
                    node.data.properties[key] = `${propVal}?owner=${ownerName}`;
                }
                if (propVal && (typeof propVal === 'string') && propVal.startsWith('./file/get')) {
                    node.data.properties[key] = `${propVal}?owner=${ownerName}`;
                }
            }
        }
    }
}

/**
 * Save the specified project object to the correct file location.  If backups are being saved then each time the
 * project is saved a timestamped-backup of the file will also be created.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The project object that has been saved.
 */
function saveProject(req) {
    let obj = req.body;
    const projFolder = path.join(csp.getUserPath(req), obj.project);
    const fileName = path.join(projFolder, 'ObjectModel.json');

    // Set the server timestamp to the time now, to indicate when it was saved
    obj.server_ts = Date.now();

    createProjectIfNeeded(projFolder);

    try {
        fs.writeFileSync(fileName, JSON.stringify(obj, null, 1));
    } catch(e) {
        log.error('messages.project.write_error', { "fileName": fileName }, e);
    }

    if (settings.backup_projects) {
        let newFileName = path.join(projFolder, 'backups', `${Date.now()}_ObjectModel.json`);

        try {
            fs.copyFileSync(fileName, newFileName);
        } catch(e) {
            log.error('messages.project.write_error', { "fileName": newFileName }, e);
        }
    }

    return obj;
}

/**
 * Create a set of proposed changes for a project and save them into the owning users proposals folder for that project.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The project object from which updates were proposed.
 */
function proposeUpdates(req) {
    let obj = req.body;
    obj.server_ts = Date.now();
    obj.user = csp.userName(req);

    //TODO: The actual proposals need to be written here

    const propFolder = path.join(csp.getOwnerPath(csp.ownerName(req)), csp.projectName(req), 'proposals');
    const fileName = path.join(propFolder, `${obj.user}_${obj.server_ts}_edits.json`);

    if (!fs.existsSync(propFolder)) {
        fs.mkdirSync(propFolder);
    }

    try {
        fs.writeFileSync(fileName, JSON.stringify(obj, null, 1));
    } catch(e) {
        log.error('messages.project.write_proposals_error', { "fileName": fileName });
    }

    return obj;
}

/**
 * Delete the project specified in the request by deleting the project file and folder and all sub-folders.
 * The name of the project to be deleted is specified in the body of the POST request.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The result of the project deletion.
 */
function deleteProject(req) {
    const projFolder = path.join(csp.getUserPath(req), req.body.project);
    //TODO: Make this a http delete action rather than passing the project name in the request body?

    //TODO: Make this a simple recursive delete rather than replying on specific named folders
    emptyFilesAndRmdir(path.join(projFolder, 'actions'));
    emptyFilesAndRmdir(path.join(projFolder, 'backups'));
    emptyFilesAndRmdir(path.join(projFolder, 'images'));
    emptyFilesAndRmdir(path.join(projFolder, 'files'));
    emptyFilesAndRmdir(projFolder);

    //TODO: Return any errors here
    return csp.JSON_SUCCESS;
}

/**
 * Delete the project proposal specified in the request by simply deleting the corresponding file.
 *
 * @param {e.Request} req       The http request object.
 * @return {object}             The result of the project deletion.
 */
function deleteProposal(req) {
    const propName = path.join(csp.getUserPath(req), csp.projectName(req), 'proposals', `${req.params[PARAM_PROP_NAME]}_edits.json`);
    //TODO: Make this a http delete action?

    if (fs.existsSync(propName)) {
        fs.unlinkSync(propName);
    }

    //TODO: Return any errors here
    return csp.JSON_SUCCESS;
}

/**
 * Export the specified project, by creating a zip file of the project folder, the project file and all sub-folders
 * and returning this to the user desktop in the response.
 *
 * @param {e.Request} req       The http request object.
 * @param {e.Response} res      The http response object.
 */
function exportProject(req, res) {
    compressProjectFolder(req, res);
}

/**
 * Compress the specified project folder and return the zip file binary in the standard http response object.
 *
 * @param {e.Request} req       The http request object.
 * @param {e.Response} res      The http response object.
 */
function compressProjectFolder(req, res) {
    let projName = csp.projectName(req);
    let owner = csp.ownerName(req);
    let dlName;
    let projFolder;
    let canContinue;

    if (owner) {
        projFolder = csp.getProjectPath(req, undefined, owner);
        dlName = `CS_export_${owner}_${projName}.zip`;

        canContinue = security.isAdmin(req);
    } else {
        projFolder = csp.getProjectPath(req);
        dlName = `CS_export_${projName}.zip`;
        canContinue = true;
    }

    if (canContinue) {
        let zip = new JSZip();
        let allFiles = [];

        zip.folder(projName);

        addAllFiles(zip, projName, projFolder, allFiles);

        res.setHeader('Content-Type', 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip');
        res.setHeader('Content-Disposition', `attachment; filename=${dlName}`);

        zip
            .generateNodeStream({ "type": 'nodebuffer', "streamFiles": true })
            .pipe(res)
            .on('finish', function () {
                res.end();
            });
    } else {
        res.send
    }
}

/**
 * Add all files found in the specified folder to the zip file.
 *
 * @param {object} zip          The binary zip object to which each file is added.
 * @param {string} root         The root folder from which the files are being added.
 * @param {string} folder        The specified sub-folder which is being processed in this request.
 * @param {object} result       The existing result object that can be updated with progress.
 */
function addAllFiles(zip, root, folder, result) {
    let fList = fs.readdirSync(folder);

    if (fList.length === 0) {
        //No files so just add the folder
        zip.folder(root);
    } else {
        for (let fn of fList) {
            const file = path.resolve(folder, fn);
            const stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                const subFolder = path.join(root, fn);
                const fullSubFolder = path.join(folder, fn);

                addAllFiles(zip, subFolder, fullSubFolder, result);
            } else {
                const relFn = path.join(root, fn);
                const fullFn = path.join(folder, fn);
                const fd = fs.readFileSync(fullFn);

                zip.file(relFn, fd);
            }
        }
    }
}

/**
 * Create the parent folder and sub-folders for a new project if they don't already exist.
 *
 * @param {string} projFolder       The fully qualified name for the folder and sub-folders to be created.
 */
function createProjectIfNeeded(projFolder) {
    //TODO: Some error reporting needed here
    if (!fs.existsSync(projFolder)){
        fs.mkdirSync(projFolder);
        fs.mkdirSync(path.join(projFolder, 'actions'));
        fs.mkdirSync(path.join(projFolder, 'backups'));
        fs.mkdirSync(path.join(projFolder, 'images'));
        fs.mkdirSync(path.join(projFolder, 'files'));
    }
}

/**
 * Empty the contents of the specified folder and then remove it.
 *
 * @param {string} dir      The fully qualified name for the folder to be emptied and removed.
 */
function emptyFilesAndRmdir(dir) {
    //TODO: Some error reporting needed here
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            const curPath = path.join(dir, file);

            fs.unlinkSync(curPath);
        });

        fs.rmdirSync(dir);
    }
}

/**
 * Initialise a newly created user by copying existing example palettes and projects into their data folder.
 *
 * @param {string} userName     The user name of the user that is being initialised.
 * @return {object}             The simple response objet, containing a count of all copied palettes and projects.
 */
function initialiseFor(userName) {
    let result = {
        "paletteCount": 0,
        "projectCount": 0
    };

    let userPath = csp.getOwnerPath(userName);
    let palPath = path.join(userPath, '_palettes');

    //Create the main saves folder if it doesn't already exist
    if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath);
    }

    //Create the palettes folder if it doesn't already exist
    if (!fs.existsSync(palPath)) {
        fs.mkdirSync(palPath);
    }

    initialisePalettes(result, palPath);
    initialiseProjects(result, userPath);

    return result;
}

/**
 * Initialise a newly created user by copying the example palettes from their default folder.
 * Also increment the paletteCount on the existing response object.
 *
 * @param {object} result       The existing result object that will be returned to the user.
 * @param {string} palPath      The fully qualified palette path where the example palettes should be copied.
 */
function initialisePalettes(result, palPath) {
    let fList = fs.readdirSync(EX_PAL_FN);

    for (let fn of fList) {
        let srcFn = path.join(EX_PAL_FN, fn);
        let tgtFn = path.join(palPath, fn);

        fs.copySync(srcFn, tgtFn);
        ++result.paletteCount;
    }
}

/**
 * Initialise a newly created user by copying the example projects from their default folder.
 * Also increment the projectCount on the existing response object.
 *
 * @param {object} result       The existing result object that will be returned to the user.
 * @param {string} projPath     The fully qualified project path where the example projects should be copied.
 */
function initialiseProjects(result, projPath) {
    let fList = fs.readdirSync(EX_PROJ_FN);

    for (let fn of fList) {
        let srcFn = path.join(EX_PROJ_FN, fn);
        let tgtFn = path.join(projPath, fn);

        fs.copySync(srcFn, tgtFn);
        ++result.projectCount;
    }
}

/** Module exports */
module.exports = Object.freeze({
    "listAll": listProjects,
    "listProposals": listProposals,
    "deleteProposal": deleteProposal,
    "read": readProject,
    "save": saveProject,
    "readFromFile": readProjectFromFile,
    "propose": proposeUpdates,
    "export": exportProject,
    "delete": deleteProject,
    "initialiseFor": initialiseFor
});
