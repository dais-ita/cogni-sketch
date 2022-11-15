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
 * @file Functions defining the 'project' aspects of the application (not the core data representation of a project).
 *
 * @author Dave Braines
 **/

import {getPalette, getProject, setProject} from "/javascripts/private/state.js";

import {
    getSelectedValue,
    registerChangeEvent,
    registerClickEvent,
    setChecked
} from "/javascripts/private/util/dom.js";
import {
    clearSessionCanvasSelectionLinks,
    clearSessionCanvasSelectionNodes,
    getSessionAutoSave,
    getSessionDebug,
    getSessionHasUnsavedChanges,
    getSessionInitialPaletteName,
    getSessionIsAdmin,
    getSessionProjectNames,
    getSessionShowHiddenNodes,
    getSessionUserName,
    ignoreChangesFor,
    setSessionAutoSave,
    setSessionDebug,
    setSessionHasUnsavedChanges,
    setSessionProjectNames,
    setSessionShowHiddenNodes
} from "/javascripts/private/csData/csDataSession.js";
import {coreImport as coreNodeImport} from "/javascripts/private/csData/csDataNode.js";
import {coreImport as coreLinkImport} from "/javascripts/private/csData/csDataLink.js";
import {
    drawEmptyNode,
    drawFullNode,
    drawLinkWhole,
    drawSpecialNode,
    hideNodeAndLinks,
    showOrHideNodeOrLink
} from "/javascripts/private/core/graphics.js";
import {refreshNode} from "/javascripts/interface/data.js";
import {openPopup as openPermissionsPopup} from "/javascripts/private/core/core_popups/permissions/permissionsPopup.js";
import {nodeListValidity, projectValidity} from "/javascripts/private/core/validity.js";
import {sendProjectLoadEvent, switchToCanvasPane} from "/javascripts/private/ui/tabs.js";
import {httpGet, httpPostJson} from "/javascripts/interface/http.js";
import {reportMemoryUsage} from "/javascripts/private/util/log.js";
import {
    error,
    showToast,
    userConfirm,
    userPrompt,
    warn
} from "/javascripts/private/util/log.js";
import {getCurrentViewBox, resetViewBox} from "/javascripts/private/util/coords.js";
import {clearPanes, reportStats} from "/javascripts/private/ui/ui.js";
import {drawProjectOnCanvas} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {loadPalette, loadPaletteFrom, savePaletteFrom} from "/javascripts/private/ui/palette/types.js";
import {openProjectImport} from "/javascripts/private/core/core_popups/import/importPopup.js";
import {openProjectExport} from "/javascripts/private/core/core_popups/export/exportPopup.js";
import {openUpload} from "/javascripts/private/core/core_popups/upload/uploadPopup.js";
import {playback, saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {createNewProject, recreateProject} from "/javascripts/private/wrapper/wrapper.js";
import {localize} from "/javascripts/private/util/internationalization.js";
import {settings} from "/javascripts/private/core/core_settings.js";

const URL_LIST = '/project/list/';
const URL_LIST_PROPS = '/project/listProposals/';
const URL_DEL_PROP = '/project/deleteProposal/';
const URL_LOAD = '/project/get/';
const URL_SAVE = '/project/save/';
const URL_DELETE = '/project/delete/';

const URL_SAVED_USER = './images/cs/icon-user-good.png';
const URL_UNSAVED_USER = './images/cs/icon-user-unsaved-changes.png';

const ELEM_USER_ICON = 'cs-user-icon';
const ELEM_LIST = 'cs-project-list';
const ELEM_CREATE_NEW = 'cs-create-new-project';
const ELEM_IMPORT = 'cs-import-project';
const ELEM_EXPORT = 'cs-export-project';
const ELEM_RELOAD = 'cs-reload-project';
const ELEM_SAVE = 'cs-save-project';
const ELEM_SAVE_AS = 'cs-save-project-as';
const ELEM_DELETE = 'cs-delete-project';
const ELEM_PERMS = 'cs-project-permissions';
const ELEM_RESET_CANVAS = 'cs-project-reset-canvas';
const ELEM_UPLOAD = 'cs-upload-files';
const ELEM_PLAYBACK = 'cs-playback';
const ELEM_AUTO_SAVE = 'cs-auto-save-mode';
const ELEM_DEBUG = 'cs-debug-mode';
const ELEM_SHOW_HIDDEN = 'cs-show-hidden';

const MSG_UNSAVED = 'If you change project any unsaved changes will be lost.  Are you sure you want to change?';

export function initialise() {
    registerEventHandlers();
    initialiseMenus();
}

function initialiseMenus() {
    setChecked(ELEM_AUTO_SAVE, getSessionAutoSave());
    setChecked(ELEM_DEBUG, getSessionDebug());
    setChecked(ELEM_SHOW_HIDDEN, getSessionShowHiddenNodes());
}

export function listProjects(quiet, selProjName) {
    httpGet(URL_LIST, callbackList, { 'selProjName': selProjName }, quiet);
}

export function listProjectProposals() {
    let proj = getProject();

    if (proj) {
        httpGet(`${URL_LIST_PROPS}${proj.getName()}/`, callbackListProps);
    }
}

export function deleteProjectProposal(propName) {
    let proj = getProject();

    if (proj) {
       httpGet(`${URL_DEL_PROP}${proj.getName()}/${propName}`, callbackDelProp);
    }
}

function callbackDelProp() {
    //Nothing is needed
}

function loadProjectFrom(project) {
    clearSessionCanvasSelectionNodes();
    clearSessionCanvasSelectionLinks();

    ignoreChangesFor(function() {
        if (project.getPalette()) {
            loadPaletteFrom(project.getPalette());
        } else {
            if (project.getPaletteName()) {
                loadPalette(project.getPaletteName());
            }
        }

        drawProjectOnCanvas(project);
        clearHasUnsavedChanges(project);
        reportStats();
        reportMemoryUsage();
    });
}

function callbackList(projNames, params, quiet) {
    setSessionProjectNames(projNames);

    if (projNames.length === 0) {
        /* No projects defined, so load the default palette */
        loadPalette('default');
    } else {
        if (!quiet) {
            let e = document.getElementById(ELEM_LIST);

            for (let i = e.options.length; i >= 0; i--) {
                e.options.remove(i);
            }

            let projNames = getSessionProjectNames();

            for (let projName of projNames) {
                if (isValidProjectName(projName)) {
                    let o = document.createElement('option');
                    o.text = projName;

                    if (getProject()) {
                        if (getProject().getName() === projName) {
                            o.selected = true;
                        }
                    }
                    e.add(o);
                }
            }

            if (params.selProjName) {
                e.value = params.selProjName;
            }

            csEventChangedProject(quiet);
        }
    }
}

function callbackListProps(response) {
    if (response && response.length > 0) {
        for (let thisProp of response) {
            addToCanvas(thisProp.contents, thisProp.contents.user, thisProp.contents.server_ts);

            deleteProjectProposal(thisProp.filename.replace('_edits.json', ''));
        }
    }
}

function addToCanvas(proposal, userName, ts) {
    nodeListValidity(proposal.objects);

    addNodesToCanvas(proposal.objects, userName, ts);
    addLinksToCanvas(proposal.links, userName, ts);
}

function addNodesToCanvas(nodeList, userName, ts) {
    for (let obj of nodeList) {
        obj.user = userName;
        obj.created = ts;

        let newObj = coreNodeImport(obj);

        if (newObj) {
            if (newObj.isEmpty()) {
                drawEmptyNode(newObj);
            } else if (newObj.isFull()) {
                drawFullNode(newObj);
            } else if (newObj.isSpecial()) {
                drawSpecialNode(newObj);
            } else {
                error(`Unexpected mode '${newObj.getTypeName()}' for node ${newObj.getUid()}`);
            }

            refreshNode(newObj);

            if (newObj.isHidden()) {
                hideNodeAndLinks(newObj);
            }
        }
    }
}

function addLinksToCanvas(linkList, userName, ts) {
    for (let link of linkList) {
        link.user = userName;
        link.created = ts;

        let newLink = coreLinkImport(link);

        if (newLink) {
            let srcNode = newLink.getSourceNode();
            let tgtNode = newLink.getTargetNode();

            if (srcNode && tgtNode) {
                drawLinkWhole(newLink, srcNode, tgtNode);
            } else {
                console.error(`Cannot create link ${newLink.getUid()} as the source or target node was not found`);
                console.error(link);
                console.error(srcNode);
                console.error(tgtNode);
            }
        }
    }
}

function callbackLoad(rawProject) {
    let oldProjName;

    if (getProject()) {
        oldProjName = getProject().getName();
    }

    projectValidity(rawProject);
    let thisProject = recreateProject(rawProject);
    setProject(thisProject);

    loadProjectFrom(thisProject);
    sendProjectLoadEvent(thisProject);
    switchToCanvasPane();

    if (oldProjName) {
        if (oldProjName !== thisProject.getName()) {
            saveActionMisc('project:changeProject', null, { "oldName": oldProjName, "newName": thisProject.getName() });
        }
    }

    showToast(`Project <b>${thisProject.getName()}</b> has been loaded`);
}

function registerEventHandlers() {
    registerChangeEvent(ELEM_LIST, actionChangedList);
    registerChangeEvent(ELEM_DEBUG, actionFlipDebugMode);
    registerChangeEvent(ELEM_AUTO_SAVE, actionFlipAutoSaveMode);
    registerClickEvent(ELEM_CREATE_NEW, actionCreateNew);
    registerClickEvent(ELEM_IMPORT, actionImport);
    registerClickEvent(ELEM_EXPORT, actionExport);
    registerClickEvent(ELEM_RELOAD, actionReload);
    registerClickEvent(ELEM_SAVE, actionSave);
    registerClickEvent(ELEM_SAVE_AS, actionSaveAs);
    registerClickEvent(ELEM_DELETE, actionDelete);
    registerClickEvent(ELEM_PERMS, actionPermissions);
    registerClickEvent(ELEM_RESET_CANVAS, actionResetCanvasPosition);
    registerClickEvent(ELEM_UPLOAD, actionUpload);
    registerClickEvent(ELEM_PLAYBACK, actionPlayback);
    registerChangeEvent(ELEM_SHOW_HIDDEN, actionFlipHiddenMode);
}

function actionChangedList() {
    csEventChangedProject();
}

function actionFlipDebugMode() {
    setSessionDebug(!getSessionDebug());

    saveActionMisc('cs:flipDebug', null, { "finalState": getSessionDebug() });

    if (getSessionDebug()) {
        showToast(localize('messages.ui.debug.enabled'));
    } else {
        showToast(localize('messages.ui.debug.disabled'));
    }
}

function actionFlipAutoSaveMode() {
    setSessionAutoSave(!getSessionAutoSave());

    saveActionMisc('cs:flipAutoSave', null, { "finalState": getSessionAutoSave()});

    if (getSessionAutoSave()) {
        //As well as enabling auto save, save the current project if there are unsaved changes
        if (getSessionHasUnsavedChanges()) {
            save();
        }

        showToast('AutoSave enabled');
    } else {
        showToast('AutoSave disabled');
    }
}

function actionFlipHiddenMode() {
    setSessionShowHiddenNodes(!getSessionShowHiddenNodes());

    saveActionMisc('project:flipHiddenMode', null, { "finalState": getSessionShowHiddenNodes()});

    for (let thisNode of getProject().listNodes()) {
        if (thisNode.isHidden()) {
            showOrHideNodeOrLink(thisNode);

            for (let thisLink of thisNode.listAllLinks()) {
                showOrHideNodeOrLink(thisLink);
            }
        }
    }

    if (getSessionShowHiddenNodes()) {
        showToast('Hidden nodes are being shown');
    } else {
        showToast('Hidden nodes are not being shown');
    }
}

function actionCreateNew() {
    let projName = getNewProjectName('my new project');

    if (projName) {
        let paletteName = getSessionInitialPaletteName();

        clearPanes();
        let thisProject = createNewProject(projName, paletteName, getCurrentViewBox());
        setProject(thisProject);
        saveActionMisc('project:create', null, { "name": thisProject.getName() });
        save(true);
        listProjects(false, projName);
        showToast(`Project <b>${projName}</b> has been created`);
    }
}

function actionImport() {
    saveActionMisc('project:openImport');
    openProjectImport();
}

function actionExport() {
    openProjectExport(JSON.stringify(getProject().export(), null, 1));
    saveActionMisc('project:openExport');
}

function actionReload() {
    loadSelected();
    saveActionMisc('project:reload');
}

function actionSave() {
    saveActionMisc('project:save');
    save();
}

function actionSaveAs() {
    saveAs(getProject().getName());
}

function actionDelete() {
    deleteProject();
}

function actionPermissions() {
    if (getProject().isReadOnly()) {
        //TODO: Should permissions be viewable even if the project is shared as read only?
        error('Cannot show permissions - project is read only', null, null, true);
    } else {
        if (settings && settings.permissions && settings.permissions.projectPermissions) {
            openPermissionsPopup();
        } else {
            error('Project permissions are not currently enabled', null, null, true);
        }
    }
}

function actionResetCanvasPosition() {
    if (userConfirm('This will reset the canvas position and zoom to the starting setting.  Are you sure?')) {
        saveActionMisc('project:resetCanvasPosition');
        resetViewBox();
    }
}

function actionUpload() {
    if (getProject().isReadOnly()) {
        error('Cannot upload files - project is read only', null, null, true);
    } else {
        openUpload();
    }
}

function actionPlayback() {
//    canvas.clear();
    playback();
}

function csEventChangedProject(quiet) {
    let e = document.getElementById(ELEM_LIST);
    let doChange;

    if (getSessionHasUnsavedChanges()) {
        doChange = userConfirm(MSG_UNSAVED);
    } else {
        //No unsaved changes
        doChange = true;
    }

    if (doChange) {
        let sel = e.options[e.selectedIndex];

        if (sel) {
            loadSelected(quiet);
        }
    } else {
        //The change was declined.  Need to reselect the original project
        for (let i = 0; i < e.options.length; i++) {
            if (e.options[i].value === getProject().getName()) {
                e.value = getProject().getName();
            }
        }
    }
}

/**
 * Prompt the user for a project name, specifying a default.
 *
 * @param {string} initialName      the suggested project name to be shown to the user.
 * @return {string}
 */
function getNewProjectName(initialName) {
    let result;

    //Refresh the list of all projects to help avoid accidental overwrite
    listProjects(true);

    if (!initialName) {
        initialName = getProject().getName();
    }

    let projName = userPrompt('What is the new name for this project', initialName);
    let okToSave = false;

    if (projName) {
        if (isValidProjectName(projName, true)) {
            let projNames = getSessionProjectNames();
            let alreadyExists = false;
            let exactMatch = false;

            for (let thisProjName of projNames) {
                if (thisProjName.trim().toLowerCase() === projName.trim().toLowerCase()) {
                    alreadyExists = true;

                    if (thisProjName === projName) {
                        exactMatch = true;
                    }
                }
            }

            if (alreadyExists) {
                if (exactMatch) {
                    okToSave = userConfirm(`Project "${projName}" already exists.  Do you want to overwrite it?`);
                } else {
                    showToast('Cannot save project as a project with the same name but different upper/lower case already exists');
                    okToSave = false;
                }
            } else {
                okToSave = true;
            }
        } else {
            showToast(`${projName} is not valid, please try again`);
        }
    }

    if (okToSave) {
        result = projName;
    }

    return result;
}

function loadSelected(quiet) {
    let projName = getSelectedValue(ELEM_LIST);
    let url;

    clearPanes();

    if (isSharedProjectName(projName)) {
        let ownerName = extractUserNameFrom(projName);
        let sharedProjName = extractSharedProjectNameFrom(projName);
        url = URL_LOAD + sharedProjName + '?owner=' + ownerName;
    } else {
        url = URL_LOAD + projName;
    }

    httpGet(url, callbackLoad, quiet);
}

function isSharedProjectName(projName) {
    return projName && projName.startsWith('*SHARED');
}

function extractUserNameFrom(projName) {
    let trimmed = projName.replace('*SHARED by ', '');
    let parts = trimmed.split(':');

    return parts[0].trim();
}

function extractSharedProjectNameFrom(projName) {
    let trimmed = projName.replace('*SHARED by ', '');
    let parts = trimmed.split(':');
    let spn = parts[1].split('[');

    return spn[0].trim();
}

export function save(quiet) {
    prepareForSave();

    httpPostJson(URL_SAVE, callbackSave, getProject().export(), { "name": getProject().getName() }, quiet );

    if (getPalette()) {
        savePaletteFrom(getPalette(), quiet);
    }

    //TODO: Make this generic so any new function can register an interest
    //ce.pluginSaveProject(quiet);
}

function prepareForSave() {
    fixLegacyIssues();
//    stashForSave();
}

function fixLegacyIssues() {
    //A hook prior to project save which can be used to fix any issues that occur with older "legacy" projects
    let legacyImage = 0;

    for (let obj of getProject().listNodes()) {
        if (obj.rawData) {
            if (obj.rawData.startsWith('./images')) {
                //Fix the issue with old image paths.  Prior to v264 these were ./images/* but have
                //been migrated to ./image/* (singular rather than plural)
                obj.rawData = obj.rawData.replace('./images/', './image/');

                ++legacyImage;
            }
        }
    }

    if (legacyImage > 0) {
        showToast(`${legacyImage} legacy image urls were updated`);
    }
}

function callbackSave(response, params, quiet) {
    if (!quiet) {
        showToast(`Project <b>${params.name}</b> has been successfully saved`);
    } else {
        //TODO: Switch this to debug before release
        warn('Project has been autoSaved');
    }

    clearHasUnsavedChanges();
}

function deleteProject() {
    if (getProject().isReadOnly()) {
        error('Cannot delete - project is read only', null, null, true);
        saveActionMisc('project:delete(failed)', null, { "error": 'Project is read only' });
    } else {
        let pn = getProject().getName();
        let okToDelete = userConfirm('Are you sure you want to delete the project \'' + pn + '\'?');

        if (okToDelete) {
            saveActionMisc('project:delete');
            httpPostJson(URL_DELETE, callbackDelete, getProject().export(), { 'name': pn });
        }
    }
}

function callbackDelete(response, params) {
    showToast(`'Project <b>${params.name}</b> has been successfully deleted'`);

    clearHasUnsavedChanges();
    listProjects();
}

export function importProjectFrom(project, quiet) {
    clearPanes();

    httpPostJson(URL_SAVE, callbackImport, project, { 'name': project.project }, quiet );

    //TODO: Make this generic so any new function can register an interest
    //ce.pluginSaveProject(quiet);
}

function callbackImport(projObj, params, quiet) {
    if (!quiet) {
        showToast(`Project <b>${params.name}</b> has been successfully imported`);
    }

    listProjects(false, projObj.project);
    projectValidity(projObj);
    let thisProject = recreateProject(projObj);
    setProject(thisProject);
    loadProjectFrom(thisProject);

    switchToCanvasPane();
}

function saveAs(initialName) {
    let projName = getNewProjectName(initialName);

    if (projName) {
        getProject().setName(projName);
        saveActionMisc('project:saveAs', null, { "oldName": initialName, "newName": projName });
        save();
        listProjects(false, projName);
    }
}

function isValidProjectName(projName, createMode) {
    let isValid = !projName.startsWith('.') && (projName !== 'null') && (projName.trim() !== '');

    if (createMode) {
        isValid = isValid && (projName.indexOf(':') === -1) && (projName.indexOf('[') === -1);
    } else {

    }

    return isValid;
}

function clearHasUnsavedChanges() {
    let un = getSessionUserName();

    if (getSessionIsAdmin()) {
        un += ' [admin]';
    }

    //Update the user icon to show the status
    $('#' + ELEM_USER_ICON)
        .attr('src', URL_SAVED_USER)
        .attr('title', `Logged in as ${un}`);

    setSessionHasUnsavedChanges(false);
}

export function setHasUnsavedChanges() {
    let un = getSessionUserName();

    if (getSessionIsAdmin()) {
        un += ' [admin]';
    }

    //Update the user icon to show the status
    $('#' + ELEM_USER_ICON)
        .attr('src', URL_UNSAVED_USER)
        .attr('title', `Logged in as ${un} (unsaved changes)`);

    setSessionHasUnsavedChanges(true);
}
