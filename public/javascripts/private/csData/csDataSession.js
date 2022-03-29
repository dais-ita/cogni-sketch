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
 * @file Provides easy access to data stored in the session object.  Commonly used variables are grouped together
 * and each has accessor functions.
 *
 * @author Dave Braines
 **/

//TODO: Consider moving some of these groups off to other locations (e.g. selections to a new selection object)

import {
    getPalette,
    getSessionValue,
    getSetting,
    removeSessionValue,
    setSessionValue
} from "/javascripts/private/state.js";

/* Predefined generic application session values */
const GROUP_CS = '_cs';
const KEY_VERSION = 'version';
const KEY_USER_NAME = 'userName';
const KEY_USER_ADMIN = 'isAdmin';
const KEY_UNSAVED_CHANGES = 'unsavedChanges';
const KEY_IGNORE_CHANGES = 'ignoreChanges';
const KEY_MODAL_OBJECT = 'modalObject';
const KEY_MODAL_OBJECT_2 = 'secondModalObject';
const KEY_PROJECT_NAMES = 'projectNames';
const KEY_SORTED_PALETTE = 'sortedPalette';
const KEY_PALETTE_NAMES = 'paletteNames';

/* Predefined project session values */
const GROUP_PROJECT = 'project';
const KEY_DEBUG = 'debug';
const KEY_AUTO_SAVE = 'autoSave';
const KEY_LAST_ACTION = 'lastAction';

/* Predefined canvas session values */
const GROUP_CANVAS = 'canvas';
const KEY_SHOW_HIDDEN = 'showHiddenNodes';
const KEY_LAYOUT = 'layout';
const KEY_DUPLICATE_OFFSET = 'duplicateOffset';
const KEY_DC_DELAY = 'doubleClickDelay';

/* Predefined selection session values */
const GROUP_SELECTION = 'selection';
const KEY_SELECTED_NODES = 'selectedNodes';
const KEY_SELECTED_LINKS = 'selectedLinks';
const KEY_RECTANGLE_SELECT = 'rectangleSelect';

/* Predefined drag session values */
const GROUP_DRAG = 'drag';
const KEY_IS_DRAGGING = 'isDragging';

/* Predefined drawing session values */
const GROUP_DRAW = 'drawing';
const KEY_CURRENT_DRAG = 'currentDrag';
const KEY_CURRENT_LINK = 'currentLink';
const KEY_TARGET_OBJECT = 'targetObject';

/* Predefined popup values */
const GROUP_POPUP = 'typePopup';
const KEY_COLORS = 'colors';

/**
 * For the duration of the specified function ignore changes.
 *
 * @param {function} func       the function to be executed whilst ignoring changes.
 */
export function ignoreChangesFor(func) {
    setSessionIsIgnoringChanges(true);

    try {
        func();
    } catch(e) {
        throw(e);
    } finally {
        setSessionIsIgnoringChanges(false);
    }
}

/**
 * Get the current version of this application.
 *
 * @returns {string}            the current version.
 */
export function getSessionVersion() {
    return getSessionValue(GROUP_CS, KEY_VERSION);
}

/**
 * Set the current version of this application.
 *
 * @param {string} val          the version to be set.
 */
export function setSessionVersion(val) {
   setSessionValue(GROUP_CS, KEY_VERSION, val);
}

/**
 * Get the debug status for this application.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {boolean}           whether debug mode is enabled.
 */
export function getSessionDebug() {
    let val = getSessionValue(GROUP_PROJECT, KEY_DEBUG);

    if (val === undefined) {
        val = getSetting(GROUP_PROJECT, KEY_DEBUG);
        setSessionValue(GROUP_PROJECT, KEY_DEBUG, val);
    }

    return val;
}

/**
 * Set the debug status for this application.
 * In debug mode the application will report information to the developer console.
 *
 * @param {boolean} val         the debug mode to be set.
 */
export function setSessionDebug(val) {
    setSessionValue(GROUP_PROJECT, KEY_DEBUG, val);
}

/**
 * Get the autoSave status for this application.
 * In autoSave mode the project is saved automatically after every change.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {boolean}           whether autoSave mode is enabled.
 */
export function getSessionAutoSave() {
    let val = getSessionValue(GROUP_PROJECT, KEY_AUTO_SAVE);

    if (val === undefined) {
        val = getSetting(GROUP_PROJECT, KEY_AUTO_SAVE);
        setSessionValue(GROUP_PROJECT, KEY_AUTO_SAVE, val);
    }

    return val;
}

/**
 * Set the autoSave status for this application.
 *
 * @param {boolean} val         the autoSave mode to be set.
 */
export function setSessionAutoSave(val) {
    setSessionValue(GROUP_PROJECT, KEY_AUTO_SAVE, val);
}

/**
 * Get the last action for this project.
 * This is to allow pan/zoom events to be logged as actions only when they are finished, i.e. a new action of a
 * different kind occurs, otherwise many identical actions can be logged which is inefficient.
 *
 * @returns {string}            the name of the last action.
 */
export function getSessionLastAction() {
    return getSessionValue(GROUP_PROJECT, KEY_LAST_ACTION);
}

/**
 * Set the last action for this project.
 *
 * @param {string} val         the name of the last action.
 */
export function setSessionLastAction(val) {
    setSessionValue(GROUP_PROJECT, KEY_LAST_ACTION, val);
}

/**
 * Get the showHiddenNodes status for this application.
 * When showHiddenNodes is set to true all nodes are always shown on the canvas.  When set to false the user
 * is able to use the 'hidden' status to show or hide nodes.
 *
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {boolean}           whether autoSave mode is enabled.
 */
export function getSessionShowHiddenNodes() {
    let val = getSessionValue(GROUP_CANVAS, KEY_SHOW_HIDDEN);

    if (val === undefined) {
        val = getSetting(GROUP_CANVAS, KEY_SHOW_HIDDEN);
        setSessionValue(GROUP_CANVAS, KEY_SHOW_HIDDEN, val);
    }

    return val;
}

/**
 * Set the showHiddenNodes status for this application.
 *
 * @param {boolean} val         the showHiddenNodes mode to be set.
 */
export function setSessionShowHiddenNodes(val) {
    setSessionValue(GROUP_CANVAS, KEY_SHOW_HIDDEN, val);
}

/**
 * Get the name of the currently logged in user.
 *
 * @returns {string}           the name of the currently logged in user.
 */
export function getSessionUserName() {
    return getSessionValue(GROUP_CS, KEY_USER_NAME);
}

/**
 * Set the name of the currently logged in user.
 *
 * @param {string} val         the name to be used.
 */
export function setSessionUserName(val) {
    setSessionValue(GROUP_CS, KEY_USER_NAME, val);
}

/**
 * Get the 'isAdmin' flag for the currently logged in user.
 *
 * @returns {boolean}           whether the currently logged in user is an administrator.
 */
export function getSessionIsAdmin() {
    return getSessionValue(GROUP_CS, KEY_USER_ADMIN);
}

/**
 * Set the isAdmin flag for the currently logged in user.
 *
 * @param {boolean} val         whether this is an admin user.
 */
export function setSessionIsAdmin(val) {
    setSessionValue(GROUP_CS, KEY_USER_ADMIN, val);
}

/**
 * Get the modal object that is the focus of any popup window.
 * This will be the object on which the modal window is focused, for example a csType, csNode or csLink instance.
 *
 * @returns {*}                 the modal object (if any).
 */
export function getSessionModalObject() {
    return getSessionValue(GROUP_CS, KEY_MODAL_OBJECT);
}

/**
 * Get the second modal object that is the focus of any secondary popup window.
 * This will be the object on which the second modal window is focused.
 *
 * @returns {*}                 the modal object (if any).
 */
export function getSessionSecondModalObject() {
    return getSessionValue(GROUP_CS, KEY_MODAL_OBJECT_2);
}

/**
 * Set the modal object for a popup window.
 *
 * @returns {*} val             the modal object to be set.
 */
export function setSessionModalObject(val) {
    setSessionValue(GROUP_CS, KEY_MODAL_OBJECT, val);
}

/**
 * Set the modal object for a popup window.
 *
 * @returns {*} val             the modal object to be set.
 */
export function setSessionSecondModalObject(val) {
    setSessionValue(GROUP_CS, KEY_MODAL_OBJECT_2, val);
}

/**
 * Clear the session modal object.
 * Usually because the modal window has been closed.
 */
export function clearSessionModalObject() {
    removeSessionValue(GROUP_CS, KEY_MODAL_OBJECT);
}

/**
 * Clear the session second modal object.
 * Usually because the second modal window has been closed.
 */
export function clearSessionSecondModalObject() {
    removeSessionValue(GROUP_CS, KEY_MODAL_OBJECT_2);
}

/**
 * Indicates whether there are unsaved changes in the project.
 *
 * @returns {boolean}           whether there are unsaved changes.
 */
export function getSessionHasUnsavedChanges() {
    return getSessionValue(GROUP_CS, KEY_UNSAVED_CHANGES);
}

/**
 * Set the status of unsaved changes for the project
 *
 * @param {boolean} val          whether there are unsaved changes.
 */
export function setSessionHasUnsavedChanges(val) {
    setSessionValue(GROUP_CS, KEY_UNSAVED_CHANGES, val);
}

/**
 * Indicates whether changes are currently being ignored.
 * See the function ignoreChangesFor to see how this can be used.
 *
 * @returns {boolean}           whether changes are being ignored.
 */
export function getSessionIsIgnoringChanges() {
    return getSessionValue(GROUP_CS, KEY_IGNORE_CHANGES);
}

/**
 * Sets whether changes are currently being ignored.
 *
 * @returns {boolean}           whether changes are being ignored.
 */
function setSessionIsIgnoringChanges(val) {
    setSessionValue(GROUP_CS, KEY_IGNORE_CHANGES, val);
}

/**
 * Get the list of current project names for the logged in user.
 *
 * @returns {string[]}          the list of current project names.
 */
export function getSessionProjectNames() {
    return getSessionValue(GROUP_CS, KEY_PROJECT_NAMES);
}

/**
 * set the list of current project names for the logged in user.
 *
 * @param {string[]} val        the list of current project names.
 */
export function setSessionProjectNames(val) {
    return setSessionValue(GROUP_CS, KEY_PROJECT_NAMES, val);
}

/**
 * Get the sorted list of palette items for the logged in user.
 *
 * @returns {csType[]}          the sorted list of palette items.
 */
export function getSessionSortedPalette() {
    return getSessionValue(GROUP_CS, KEY_SORTED_PALETTE);
}

/**
 * Set the sorted list of palette items for the logged in user.
 *
 * @param {csType[]} val        the sorted list of palette items.
 */
export function setSessionSortedPalette(val) {
    return setSessionValue(GROUP_CS, KEY_SORTED_PALETTE, val);
}

/**
 * Get the list of palette item names for the logged in user.
 *
 * @returns {string[]}          the list of palette item names.
 */
export function getSessionPaletteNames() {
    return getSessionValue(GROUP_CS, KEY_PALETTE_NAMES);
}

/**
 * Set the list of palette item names for the logged in user.
 *
 * @param {string[]} val        the list of palette item names.
 */
export function setSessionPaletteNames(val) {
    return setSessionValue(GROUP_CS, KEY_PALETTE_NAMES, val);
}

/**
 * Indicates whether dragging (or nodes and links) is currently in progress.
 *
 * @returns {boolean}           whether dragging is currently in progress.
 */
export function getSessionIsDragging() {
    return getSessionValue(GROUP_DRAG, KEY_IS_DRAGGING);
}

/**
 * Set whether dragging (or nodes and links) is currently in progress.
 *
 * @param {boolean} val         whether dragging is currently in progress.
 */
export function setSessionIsDragging(val) {
    return setSessionValue(GROUP_DRAG, KEY_IS_DRAGGING, val);
}

/**
 * Get the drag object that captures details about the node being dragged and the offset.
 *
 * @returns {csDrag}            the drag object.
 */
export function getSessionCurrentDrag() {
    return getSessionValue(GROUP_DRAW, KEY_CURRENT_DRAG);
}

/**
 * Store the drag object that captures details about the node being dragged and the offset.
 *
 * @param {csDrag} val         the drag object.
 */
export function setSessionCurrentDrag(val) {
    return setSessionValue(GROUP_DRAW, KEY_CURRENT_DRAG, val);
}

/**
 * Get the current link, i.e. any link that is currently being drawn and may either be cancelled, or may be completed
 * if the draw action terminates on a valid node.
 *
 * @returns {csLink}            the link (if any) that is currently being drawn.
 */
export function getSessionCurrentLink() {
    return getSessionValue(GROUP_DRAW, KEY_CURRENT_LINK);
}

/**
 * Set the current link, i.e. the link that is currently being drawn and may either be cancelled, or may be completed
 * if the draw action terminates on a valid node.
 *
 * @param {csLink} val          the link that is currently being drawn.
 */
export function setSessionCurrentLink(val) {
    return setSessionValue(GROUP_DRAW, KEY_CURRENT_LINK, val);
}

/**
 * Remove the current link.
 */
export function removeSessionCurrentLink() {
    return removeSessionValue(GROUP_DRAW, KEY_CURRENT_LINK);
}

/**
 * Get the target node, i.e. any node that is passed over by the mouse pointer whilst a link is being created
 * (dragged).  The node is set or cleared depending on whether the mouse pointer is over a node, and this will
 * be used to determine whether a valid link can be drawn when the drag action is complete.
 *
 * @returns {csNode}            the node under the mouse pointer.
 */
export function getSessionTargetObject() {
    return getSessionValue(GROUP_DRAW, KEY_TARGET_OBJECT);
}

/**
 * Get the target node, i.e. any node that is passed over by the mouse pointer whilst a link is being created
 * (dragged).  The node is set or cleared depending on whether the mouse pointer is over a node, and this will
 * be used to determine whether a valid link can be drawn when the drag action is complete.
 *
 * @param {csNode} val          the node under the mouse pointer.
 */
export function setSessionTargetObject(val) {
    return setSessionValue(GROUP_DRAW, KEY_TARGET_OBJECT, val);
}

/**
 * Remove the target node.
 */
export function removeSessionTargetObject() {
    return removeSessionValue(GROUP_DRAW, KEY_TARGET_OBJECT);
}

/**
 * Get the list of selected nodes and links on the canvas.
 *
 * @returns {csSelectionList}       the list of selected nodes and links.
 */
export function getSessionCanvasSelections() {
    let selNodes = getSessionValue(GROUP_SELECTION, KEY_SELECTED_NODES);
    let selLinks = getSessionValue(GROUP_SELECTION, KEY_SELECTED_LINKS);

    return {
        'nodes': selNodes || [],
        'links': selLinks || []
    };
}

/**
 * Add the specified node to the canvas selection.
 *
 * @param {csNode} node         the node to be added.
 */
export function addSessionCanvasSelectionNode(node) {
    addSessionCanvasSelectedItem(node, KEY_SELECTED_NODES);
}

/**
 * Add the specified link to the canvas selection.
 *
 * @param {csLink} link             the link to be added.
 */
export function addSessionCanvasSelectionLink(link) {
    addSessionCanvasSelectedItem(link, KEY_SELECTED_LINKS);
}

/**
 * Add the specified node or link to the specified canvas selection list if it is not already present.
 *
 * @param {csNode|csLink} item      the node or link to be added.
 * @param {string} key              the collection to use (node or link).
 */
function addSessionCanvasSelectedItem(item, key) {
    let list = getSessionValue(GROUP_SELECTION, key) || [];

    if (list.indexOf(item) === -1) {
        list.push(item)
    }

    setSessionValue(GROUP_SELECTION, key, list);
}

/**
 * Remove the specified node from the canvas selection.
 *
 * @param {csNode} node             the node to be removed.
 */
export function removeSessionCanvasSelectionNode(node) {
    removeSessionCanvasSelectedItem(node, KEY_SELECTED_NODES);
}

/**
 * Remove the specified link from the canvas selection.
 *
 * @param {csLink} link             the link to be removed.
 */
export function removeSessionCanvasSelectionLink(link) {
    removeSessionCanvasSelectedItem(link, KEY_SELECTED_LINKS);
}

/**
 * Remove the specified node or link from the specified canvas selection list if it is present.
 *
 * @param {csNode|csLink} item          the node or link to be removed.
 * @param {string} key                  the collection to use (node or link).
 */
function removeSessionCanvasSelectedItem(item, key) {
    let list = getSessionValue(GROUP_SELECTION, key) || [];
    let index = list.indexOf(item);

    if (index > -1) {
        list.splice(index, 1);
    }

    setSessionValue(GROUP_SELECTION, key, list);
}

/**
 * Clear the list of nodes selected on the canvas.
 */
export function clearSessionCanvasSelectionNodes() {
    clearSessionCanvasSelection(KEY_SELECTED_NODES);
}

/**
 * Clear the list of links selected on the canvas.
 */
export function clearSessionCanvasSelectionLinks() {
    clearSessionCanvasSelection(KEY_SELECTED_LINKS);
}

/**
 * Clear the specified list of nodes or links selected on the canvas.
 */
function clearSessionCanvasSelection(key) {
    removeSessionValue(GROUP_SELECTION, key);
}

/**
 * Get the details of the selection rectangle (if any) currently being drawn to select nodes and links.
 *
 * @returns {csRectangleSelect}             details of the selection rectangle.
 */
export function getSessionRectangleSelect() {
    return getSessionValue(GROUP_SELECTION, KEY_RECTANGLE_SELECT);
}

/**
 * Store the details of the selection rectangle currently being drawn to select nodes and links.
 *
 * @param {csRectangleSelect} val           details of the selection rectangle.
 */
export function setSessionRectangleSelect(val) {
    setSessionValue(GROUP_SELECTION, KEY_RECTANGLE_SELECT, val);
}

/**
 * Clear the selection rectangle that was being drawn to select nodes and links.
 */
export function clearSessionRectangleSelect() {
    removeSessionValue(GROUP_SELECTION, KEY_RECTANGLE_SELECT);
}

/**
 * Indicates whether there is an active selection rectangle on the canvas.
 *
 * @returns {boolean}       whether there is an active selection rectangle.
 */
export function getSessionRectangleSelectIsActive() {
    return !!getSessionRectangleSelect();
}

/**
 * Get the layout object for nodes on the canvas.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {object}    the layout for nodes on the canvas.
 */
export function getSessionCanvasLayout() {
    let val = getSessionValue(GROUP_CANVAS, KEY_LAYOUT);

    if (val === undefined) {
        val = getSetting(GROUP_CANVAS, KEY_LAYOUT);
        setSessionValue(GROUP_CANVAS, KEY_LAYOUT, val);
    }

    return val;
}

/**
 * Get the duplicate offset for nodes on the canvas.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {object}    the duplicate offset for nodes on the canvas.
 */
export function getSessionCanvasDuplicateOffset() {
    let val = getSessionValue(GROUP_CANVAS, KEY_DUPLICATE_OFFSET);

    if (val === undefined) {
        val = getSetting(GROUP_CANVAS, KEY_DUPLICATE_OFFSET);
        setSessionValue(GROUP_CANVAS, KEY_DUPLICATE_OFFSET, val);
    }

    return val;
}

/**
 * Get the double click delay for nodes on the canvas.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {number}    the double click delay for nodes on the canvas.
 */
export function getSessionCanvasDoubleClickDelay() {
    let val = getSessionValue(GROUP_CANVAS, KEY_DC_DELAY);

    if (val === undefined) {
        val = getSetting(GROUP_CANVAS, KEY_DC_DELAY);
        setSessionValue(GROUP_CANVAS, KEY_DC_DELAY, val);
    }

    return val;
}

/**
 * Get the list of colors for the type popup.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {object}    the list of colors for the type popup.
 */
export function getSessionTypePopupColors() {
    let val = getSessionValue(GROUP_POPUP, KEY_COLORS);

    if (val === undefined) {
        val = getSetting(GROUP_POPUP, KEY_COLORS);
        setSessionValue(GROUP_POPUP, KEY_COLORS, val);
    }

    return val;
}

/**
 * Get the project 'save actions' setting.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {object}    the project 'save actions' setting.
 */
export function getSessionProjectSaveActions() {
    return getSetting('project', 'saveActions');
}

/**
 * Get the project 'clean on load' setting.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {object}    the project 'clean on load' setting.
 */
export function getSessionProjectCleanOnLoad() {
    return getSetting('project', 'cleanOnLoad');
}

/**
 * Get the name of the initial (default) palette.
 * Default value is initially retrieved from core_settings.js
 *
 * @returns {string}    the initial palette name.
 */
export function getSessionInitialPaletteName() {
    return getSetting('general', 'initialPaletteName');
}

/**
 * Returns true if the specified palette is also the default palette.  If no palette is specified then
 * the current palette is checked instead.
 *
 * @param {csPalette} [tgtPalette]  the optional palette to check if default.
 * @returns {boolean}               whether the palette in question is the default palette.
 */
export function isDefaultPalette(tgtPalette) {
    let defName = getSessionInitialPaletteName();
    let result;

    if (tgtPalette) {
        result = (tgtPalette.getName() === defName);
    } else {
        result = (getPalette().getName() === defName);
    }

    return result;
}

/**
 * Returns true if a palette with the specified name already exists.
 * If no name is specified returns true if any palette is specified for the current project (should always be true).
 *
 * @param {string} [paletteName]    the optional name of the palette to check.
 * @returns {boolean}               whether a palette with the specified name already exists.
 */
export function paletteExists(paletteName) {
    if (paletteName) {
        let palNames = getSessionPaletteNames();

        if (palNames) {
            let lcPaletteName = paletteName.toLowerCase();
            let lcPalNames = [];

            for (let palName of palNames) {
                lcPalNames.push(palName.toLowerCase());
            }

            return (lcPalNames.indexOf(lcPaletteName) > -1);
        } else {
            return false;
        }
    } else {
        return !!getPalette();
    }
}
