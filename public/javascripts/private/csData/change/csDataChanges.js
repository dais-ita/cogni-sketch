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
 * @file Defines the core change tracking capability, with functions for each atom event.  Enables undo/redo of all
 * events.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {
    getSessionIsIgnoringChanges,
    getSessionAutoSave,
    getSessionProjectSaveActions,
    getSessionLastAction,
    setSessionLastAction,
} from "/javascripts/private/csData/csDataSession.js";
import {
    debug,
    debugCallback,
    error,
    warn
} from "/javascripts/private/util/log.js";
import {save as saveProject} from "/javascripts/private/ui/project/project.js";
import {httpPostJson} from "/javascripts/private/util/http.js";
import {setHasUnsavedChanges} from "/javascripts/private/ui/project/project.js";
import {savePaletteFrom} from "/javascripts/private/ui/palette/types.js";

const CREATE_EMPTY = 'createEmpty';
const CREATE_FULL = 'createFull';
const CREATE_SPECIAL = 'createSpecial';
const START_LINK = 'startLink';
const FINISH_LINK = 'finishLink';
const UPDATE_EMPTY = 'updateToEmpty';
const UPDATE_FULL = 'updateToFull';
const UPDATE_SPECIAL = 'updateToSpecial';
const UPDATE_NODE = 'updateNode';
const UPDATE_NODE_LABEL = 'updateNodeLabel';
const UPDATE_NODE_TYPE = 'updateNodeType';
const UPDATE_NODE_PROP = 'updateNodeProperty';
const ADD_NODE_PROP = 'addNodeProperty';
const DEL_NODE_PROP = 'deleteNodeProperty';
const UPDATE_LINK_LABEL = 'updateLinkLabel';
const DELETE_NODE = 'deleteNode';
const DELETE_LINK = 'deleteLink';
const MOVE_NODE = 'moveNode';

const URL_SAVE_ACTION = '/project/saveAction/';

const TYPE_NAME = 'change';

/* These events cause autoSave if enabled */
let AUTO_SAVE_EVENTS = [ CREATE_EMPTY, CREATE_FULL, FINISH_LINK, UPDATE_FULL, UPDATE_NODE, DELETE_NODE, DELETE_LINK, MOVE_NODE ];

let change = {
    "actionStack": [],
    "undoStack": []
};

// function undo() {
//     debug('change.undo');
//
//     if (change.actionStack.length > 0) {
//         undoLastAction();
//     } else {
//         showToast('There is nothing to undo...');
//     }
// }

// function redo() {
//     debug('change.redo');
//
//     if (change.undoStack.length > 0) {
//         redoLastAction();
//     } else {
//         showToast('There is nothing to redo...');
//     }
// }

export function saveActionCreateEmpty(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(CREATE_EMPTY, [ node ], null, null, { "type": node.getTypeName() });
    }
}

export function saveActionCreateFull(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(CREATE_FULL, [ node ],null, null, { "type": node.getTypeName() });
    }
}

export function saveActionCreateSpecial(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(CREATE_SPECIAL, [ node ], null, null, { "type": node.getTypeName() });
    }
}

export function saveActionUpdateEmpty(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_EMPTY, [ node ], null, null, { "type": node.getTypeName() });
    }
}

export function saveActionUpdateFull(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_FULL, [ node], null, null, { "type": node.getTypeName() } );
    }
}

export function saveActionUpdateSpecial(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_SPECIAL, [ node ], null, null, { "type": node.getTypeName() });
    }
}

export function saveActionUpdateNodeType(node, oldType) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_NODE_TYPE, [ node ], oldType);
    }
}

export function saveActionUpdateNodeLabel(node, oldLabel) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_NODE_LABEL, [ node ], oldLabel);
    }
}

export function saveActionChangedNode(node, propName, oldPropVal) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_NODE, [ node ], oldPropVal, propName);
    }
}

export function saveActionUpdateNodeProperty(node, propName, oldPropVal) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_NODE_PROP, [ node ], oldPropVal, propName);
    }
}

export function saveActionAddNodeProperty(node, propName) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(ADD_NODE_PROP, [ node ], propName);
    }
}

export function saveActionDeleteNodeProperty(node, propName) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(DEL_NODE_PROP, [ node ], propName);
    }
}

export function saveActionUpdateLinkLabel(link, oldLabel) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(UPDATE_LINK_LABEL, null, oldLabel);
    }
}

export function saveActionStartLink(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(START_LINK, [ node ]);
    }
}

export function saveActionFinishLink(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(FINISH_LINK, [ node ]);
    }
}

export function saveActionDeleteNode(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(DELETE_NODE, [ node ]);
    }
}

export function saveActionDeleteLink(node) {
    if (!getSessionIsIgnoringChanges()) {
        return saveAction(DELETE_LINK, [ node ]);
    }
}

export function saveActionMoveNodes(nodes, startPos) {
    if (!getSessionIsIgnoringChanges()) {
        let nodeIdList = [];

        nodes.forEach(function(value) { nodeIdList.push(value.getUid()); });

        return saveAction(MOVE_NODE, nodes, startPos, null,{ "nodes": nodeIdList });
    }
}

export function saveActionPan() {
    if (!getSessionIsIgnoringChanges()) {
        saveAction('pan');
        setSessionLastAction('pan');   // Zoom and pan actions are only logged on the next action
    }
}

export function saveActionZoom() {
    if (!getSessionIsIgnoringChanges()) {
        saveAction('zoom');
        setSessionLastAction('zoom');   // Zoom and pan actions are only logged on the next action
    }
}

export function saveActionMisc(name, nodeOrNodes, extraInfo) {
    if (!getSessionIsIgnoringChanges()) {
        let nodeList;

        if (nodeOrNodes) {
            if (Array.isArray(nodeOrNodes)) {
                nodeList = nodeOrNodes;
            } else {
                nodeList = [ nodeOrNodes ];
            }
        }

        return saveAction(name, nodeList, null, null, extraInfo);
    }
}

function saveAction(name, nodes, oldVal, propName, extraInfo) {
    let action;
    let project = getProject();
    let proceed = true;

    if (project) {
        let lastAction = getSessionLastAction();

        if ((name === 'pan') || (name === 'zoom')) {
            //Only proceed if switched from pan to zoom or vice-versa
            proceed = (lastAction !== name);
        }

        if (proceed) {
            let extraText;

            if (extraInfo) {
                extraText = ` - ${JSON.stringify(extraInfo)}`;
            } else {
                extraText = '';
            }

            if (lastAction === 'pan') {
                action = doSaveAction(project.getName(), 'canvas:pan');
            }

            if (lastAction === 'zoom') {
                action = doSaveAction(project.getName(), 'canvas:zoom');
            }

            if ((name !== 'pan') && (name !== 'zoom')) {
                action = doSaveAction(project.getName(), name, nodes, oldVal, propName, extraInfo, extraText);
            }
        // } else {
        //     console.log(`Ignoring ${name} action`);
        }

        setSessionLastAction(name);
    }

    return action;
}

function doSaveAction(projectName, name, nodes, oldVal, propName, extraInfo, extraText='') {
    //TODO: Remove this before release
//    warn(`saveAction: ${name}${extraText}`);

    let action = {
        "time": new Date(),
        "project": projectName
    };

    if (name) {
        action.name = name;
    }

    if (nodes) {
        action.nodes = [];

        for (let node of nodes) {
            action.nodes.push({
                "node": node.getUid(),      //TODO: Should this be the whole node or just the uid?
                "pos": { "x": node.getPos().x, "y": node.getPos().y }
            });
        }
    }

    if (propName) {
        action.propName = propName;
    }

    if (extraInfo) {
        action.extraInfo = extraInfo;
    }

    if (action.name === MOVE_NODE) {
        if (oldVal) {
            action.startPos = { "x": oldVal.nodeX, "y": oldVal.nodeY };
        }
    } else if (action.name === UPDATE_NODE) {
        action.previousLabel = oldVal;
        //TODO: Need to also store all the other node contents here (name/value pairs etc)
    }

    change.actionStack.push(action);
    markAsUnsaved(name);

//    console.log(action);
    setSessionLastAction('');

    if (getSessionProjectSaveActions()) {
        httpPostJson(URL_SAVE_ACTION + projectName, callbackSaveAction, action);
    } else {
        debug('Action not saved');
    }

    return action;
}

function callbackSaveAction() {
    debugCallback(TYPE_NAME, 'saveAction');
    //Nothing needs to be done... just logging an action
}

export function undoLastAction() {
    let last = change.actionStack[change.actionStack.length - 1];
    last.date = Date();

    if (last.name === CREATE_EMPTY) {
        undoCreateEmpty(last);
    } else if (last.name === CREATE_FULL) {
        undoCreateFull(last);
    } else if (last.name === DELETE_NODE) {
        undoDeleteNode(last);
    } else if (last.name === START_LINK) {
        undoStartLink(last);
    } else if (last.name === FINISH_LINK) {
        undoFinishLink(last);
    } else if (last.name === DELETE_LINK) {
        undoDeleteLink(last);
    } else {
        error(`Unknown action '${last.name}' - don't know how to undo...`);
    }

    change.actionStack.splice(change.actionStack.length - 1);
    change.undoStack.push(last);
}

export function redoLastAction() {
    let last = change.undoStack[change.undoStack.length - 1];
    last.date = Date();

    if (last.name === CREATE_EMPTY) {
        redoCreateEmpty(last);
        //No need to put anything on the action stack as this is already done when creating
    } else if (CREATE_FULL) {
        redoCreateFull(last);
        //No need to put anything on the action stack as this is already done when creating
    } else if (DELETE_NODE) {
        redoDeleteNode(last);
        //No need to put anything on the action stack as this is already done when deleting
    } else if (START_LINK) {
        redoStartLink(last);
        //No need to put anything on the action stack as this is already done when creating
    } else if (FINISH_LINK) {
        redoFinishLink(last);
        //No need to put anything on the action stack as this is already done when creating
    } else if (DELETE_LINK) {
        redoDeleteLink(last);
        //No need to put anything on the action stack as this is already done when deleting
    } else {
        error(`Unknown action '${last.name}' - don't know how to redo...`);
        change.actionStack.push(last);
    }

    change.undoStack.splice(change.undoStack.length - 1);
}

export function undoCreateEmpty(action) {
    debug('change.undoCreateEmpty');

    markAsUnsaved('undoCreateEmpty');

    deleteNode(action.node, false);
}

export function undoCreateFull(action) {
    debug('change.undoCreateFull');

    markAsUnsaved('undoCreateFull');

    deleteNode(action.node, false);
}

export function undoDeleteNode(action) {
    debug('change.undoDeleteNode');

    markAsUnsaved('undoDeleteNode');

    //TODO: Complete this
}

export function redoCreateEmpty(action) {
    debug('change.redoCreateEmpty');

    markAsUnsaved('redoCreateEmpty');

    //TODO: Complete this
}

export function redoCreateFull(action) {
    debug('change.redoCreateFull');

    markAsUnsaved('redoCreateFull');

    //TODO: Complete this
}

export function redoDeleteNode(action) {
    debug('change.redoDeleteNode');

    markAsUnsaved('redoDeleteNode');

    deleteNode(action.node, true);
}

export function undoStartLink(action) {
    debug('change.undoStartLink');

    markAsUnsaved('undoStartLink');

    //TODO: Complete this
}

export function undoFinishLink(action) {
    debug('change.undoFinishLink');

    markAsUnsaved('undoFinishLink');

    //TODO: Complete this
}

export function undoDeleteLink(action) {
    debug('change.undoDeleteLink');

    markAsUnsaved('undoDeleteLink');

//    nh.link.doCreate(action.node, false)
}

export function redoStartLink(action) {
    debug('change.redoStartLink');

    markAsUnsaved('redoStartLink');

    //TODO: Complete this
}

export function redoFinishLink(action) {
    debug('change.redoFinishLink');

    markAsUnsaved('redoFinishLink');

    //TODO: Complete this
}

export function redoDeleteLink(action) {
    debug('change.redoDeleteLink');

    markAsUnsaved('redoDeleteLink');

    //TODO: Complete this
}

export function deleteNode(node) {
    debug('change.deleteNode');

    //TODO: Implement this
    setHasUnsavedChanges();
}

export function recreateLink() {
    debug('change.recreateLink');

    //TODO: Implement this
    setHasUnsavedChanges();
}

export function markAsUnsaved(src) {
    debug(`change.markAsUnsaved('${src}')`);

    if (AUTO_SAVE_EVENTS.indexOf(src) > -1) {
        if (getSessionAutoSave()) {
            //Auto save is on, so instead of marking as unsaved just save instead
            saveProject(true);
            savePaletteFrom(getPalette(), true);
        } else {
            //Auto save is off so mark as unsaved
            setHasUnsavedChanges();
        }
    }
}

export function playback() {
    //TODO: reimplement this
}
