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
 * @file Functions defining and executing all of the hook points into the user defined actions.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {
    saveActionCreateEmpty,
    saveActionCreateFull,
    saveActionCreateSpecial, saveActionMisc,
    saveActionUpdateEmpty,
    saveActionUpdateFull
} from "/javascripts/private/csData/change/csDataChanges.js";
import {getNodeUsingSvg} from "/javascripts/private/csData/csDataNode.js";
import {
    debug,
    error
} from "/javascripts/private/util/log.js";
import {computeCoordsFor} from "/javascripts/private/util/coords.js";
import {
    drawEmptyNode,
    drawFullNode,
    drawLinkEnd,
    drawLinkStart,
    drawLinkWhole,
    drawNodeIcon,
    drawSpecialNode,
    populateNodeLabel,
    putHtmlAsDetail,
    removeLink,
    removeNodeAndLinksFromCanvas,
    switchNodeToEmpty,
    switchNodeToFull
} from "./graphics.js";
import {handle} from "/javascripts/private/core/core_panes/canvas/dragdrop/dragdrop.js";
import {
    isUrl,
    textToHtml
} from "../util/misc.js";
import {
    firstAddEmptyCallbackFor,
    firstAddExistingCallbackFor,
    firstAddFullCallbackFor,
    firstAddSpecialCallbackFor,
    firstCanHandleCallbackFor,
    firstLabelTextCallbackFor,
    firstNodeIconCallbackFor,
    firstRefreshCallbackFor,
    firstSwitchToPopulatedCallbackFor
} from "/javascripts/private/util/callback/cbType.js";
import {
    createEmptyNode,
    createFullNode,
    createLink,
    createPartialLink,
    createSpecialNode
} from "./model.js";
import {
    clearCurrentLink,
    clearTargetNode,
    getCurrentLink,
    setCurrentLink
} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";

const EVENT_HANDLE = 'canHandle';
const EVENT_ICON = 'nodeIcon';
const EVENT_LABEL = 'labelText';
const EVENT_ADD_EMPTY = 'addEmpty';
const EVENT_ADD_FULL = 'addFull';
const EVENT_ADD_SPEC = 'addSpecial';
const EVENT_ADD_EXIST = 'addExisting';
const EVENT_SWITCH = 'switchToPopulated';
const EVENT_REFRESH = 'refresh';

function report(msg) {
    /* convenient function to allow easy switching between warn and debug */
    debug(msg);
}

export function doCanHandle(nodeType, payload) {
    let options = handle;
    let result = options['CANNOT'];

    if (nodeType) {
        let thisCb = firstCanHandleCallbackFor(nodeType.getId());

        if (thisCb) {
            report(`Custom canHandle detected for ${nodeType.getId()}`);

            let context = {
                "name": EVENT_HANDLE,
                "type": nodeType,
                "payload": payload,
                "options": options
            };

            try {
                /* call the callback function with the single context parameter */
                result = thisCb(context);
                //TODO: Should 'normal' and 'pure' be done here too?
            } catch(e) {
                error(`Error in canHandle processing for ${nodeType.getId()}`, e);
            }
        } else {
            /* see whether this node type can handle the payload in raw form and after html is removed */
            let normalResult = defaultCanHandle(nodeType.getSettings(), payload.richText, options);
            let pureResult = defaultCanHandle(nodeType.getSettings(), payload.plainText, options);

            /* choose the best result of the pair and use that */
            if (pureResult > normalResult) {
                result = pureResult;
            } else {
                result = normalResult;
            }
        }
    }

    return result;
}

/**
 * Calculate the default option for whether this drop/paste event can be handled.
 *
 * @param {csRawSettings} settings      The settings for this palette item.
 * @param {string} payload              The drop/paste payload.
 * @param {object} options              The options for possible return values.
 * @return {*}
 */
function defaultCanHandle(settings, payload, options) {
    let result;

    if (settings.defaultCanHandle) {
        result = options[settings.defaultCanHandle];
    } else {
        result = options['CANNOT'];
    }

    if (payload) {
        let lcp = payload.toLowerCase();
        let prefList = settings.getDropPrefixes();
        let extList = settings.getDropExtensions();
        let partList = settings.getDropPartials();

        if (prefList) {
            for (let thisPref of prefList) {
                if (lcp.startsWith(thisPref)) {
                    result = options['DEFINITELY'];
                }
            }
        }

        if (extList) {
            for (let thisExt of extList) {
                if (lcp.endsWith('.' + thisExt)) {
                    result = options['DEFINITELY'];
                }
            }
        }

        if (partList) {
            for (let thisPart of partList) {
                if (lcp.indexOf(thisPart) > -1) {
                    result = options['DEFINITELY'];
                }
            }
        }
    }

    return result;
}

export function doAddEmptyNode(e, nodeType, label) {
    let thisCb = firstAddEmptyCallbackFor(nodeType.getId());
    let coords = computeCoordsFor(e);
    let newNode = createEmptyNode(nodeType, coords);

    newNode.setLabel(label);
    saveActionCreateEmpty(newNode);
    drawEmptyNode(newNode);

    if (newNode.isExpandedAsCustom()) {
        if (thisCb) {
            report(`Custom addEmpty detected for ${nodeType.getId()}`);

            let context = {
                "name": EVENT_ADD_EMPTY,
                "event": e,
                "node": newNode
            };

            /* call the callback function with the single context parameter */
            thisCb(context);
        } else {
            report(`Normal addEmpty detected for ${nodeType.getId()}`);
        }
    } else {
        let tableDetail = computePropertiesTable(newNode);
        putHtmlAsDetail(newNode, tableDetail);
    }

    drawNodeIcon(newNode);
    populateNodeLabel(newNode);

    return newNode;
}

export function doRefreshNode(tgtNode) {
    let thisCb = firstRefreshCallbackFor(tgtNode.getTypeName());

    if (tgtNode.isExpandedAsTable()) {
        // expanded as table
        let tableDetail = computePropertiesTable(tgtNode);

        putHtmlAsDetail(tgtNode, tableDetail);
    } else {
        // expanded as custom
        if (thisCb) {
            report(`Custom refresh detected for ${tgtNode.getUid()}`);

            let context = {
                "name": EVENT_REFRESH,
                "node": tgtNode
            };

            /* call the callback function with the single context parameter */
            thisCb(context);
        } else {
            report(`Normal refresh detected for ${tgtNode.getUid()}`);

            let layout;

            if (tgtNode.getType()) {
                layout = tgtNode.getType().getLayout();
            }

            if (layout) {
                putHtmlAsDetail(tgtNode, computeLayout(tgtNode, layout));
            }
        }
    }

    drawNodeIcon(tgtNode);
    populateNodeLabel(tgtNode);
}

function computeLayout(tgtNode, layoutText) {
    let nodeVariables = { "uid": tgtNode.getUid(), "label": tgtNode.getLabel(), "properties": tgtNode.listPropertyValues()};
    let html = populateTemplate(layoutText, nodeVariables);

    return `<div class="cs-fo-template">${html}</div>`;
}

const populateTemplate = function(template, variables){
    let result = '';

    try {
        result = Function('return `' + template + '`;').call(variables);
    } catch(e) {
        console.error('Error applying template');
        console.error(template);
        console.error(variables);
        result = '<div style="display:inline-block"><div class="alert-danger">(template error)</div></div>';
    }

    return result;
}

export function doAddFullNode(e, nodeType, label, payload, existingProperties) {
    let thisCb = firstAddFullCallbackFor(nodeType.getId());
    let coords = computeCoordsFor(e);
    let newNode = createFullNode(nodeType, coords);

    newNode.setLabel(label);

    if (existingProperties) {
        for (let [key, val] of Object.entries(existingProperties)) {
            newNode.setPropertyNamed(key, val.value, val.type);
        }
    }

    saveActionCreateFull(newNode);
    drawFullNode(newNode);

    if (newNode.isExpandedAsCustom()) {
        if (thisCb) {
            report(`Custom addFull detected for ${nodeType.getId()}`);

            let context = {
                "name": EVENT_ADD_FULL,
                "event": e,
                "node": newNode,
                "payload": payload
            };

            /* call the callback function with the single context parameter */
            thisCb(context);
        } else {
            report(`Normal addFull detected for ${nodeType.getId()}`);

            let layout = nodeType.getLayout();

            if (layout) {
                putHtmlAsDetail(newNode, computeLayout(newNode, layout));
            }
        }
    } else {
        let tableDetail = computePropertiesTable(newNode);
        putHtmlAsDetail(newNode, tableDetail);
    }

    drawNodeIcon(newNode);
    populateNodeLabel(newNode);

    return newNode;
}

// function hasDetail(tgtNode) {
//     let detail = ss.getSvgDetailFrom(tgtNode, true);
//
//     return !!detail;
// }

export function doAddSpecialNode(e, nodeType, label) {
    let thisCb = firstAddSpecialCallbackFor(nodeType.getId());
    let coords = computeCoordsFor(e);
    let newNode = createSpecialNode(nodeType, coords);

    newNode.setLabel(label);
    saveActionCreateSpecial(newNode);
    drawSpecialNode(newNode);

    if (thisCb) {
        report(`Custom addSpecial detected for ${nodeType.getId()}`);

        let context = {
            "name": EVENT_ADD_SPEC,
            "event": e,
            "node": newNode
        };

        /* call the callback function with the single context parameter */
        thisCb(context);
    } else {
        report(`Normal addSpecial detected for ${nodeType.getId()}`);

        /* nothing special needed */
    }

    drawNodeIcon(newNode);
    populateNodeLabel(newNode);

    return newNode;
}

export function doAddExistingNode(tgtNode) {
    let thisCb = firstAddExistingCallbackFor(tgtNode.getTypeName());

    /* first save the node */
    getProject().addNode(tgtNode);

    if (tgtNode.isEmpty()) {
        drawEmptyNode(tgtNode);
    } else if (tgtNode.isFull()) {
        drawFullNode(tgtNode);
    } else if (tgtNode.isSpecial()) {
        drawSpecialNode(tgtNode);
    } else {
        error(`Unexpected mode '${tgtNode.getTypeName()}' for node ${tgtNode.getUid()}`);
    }

    if (tgtNode.isExpandedAsCustom()) {
        if (thisCb) {
            report(`Custom addExistingNode detected for ${tgtNode.getUid()} (${tgtNode.getTypeName()})`);

            let context = {
                "name": EVENT_ADD_EXIST,
                "node": tgtNode
            };

            /* call the callback function with the single context parameter */
            thisCb(context);
        } else {
            report(`Normal addExistingNode detected for ${tgtNode.getUid()} (${tgtNode.getTypeName()})`);

            let layout = tgtNode.getType().getLayout();

            if (layout) {
                putHtmlAsDetail(tgtNode, computeLayout(tgtNode, layout));
            }
        }
    } else {
        let tableDetail = computePropertiesTable(tgtNode);
        putHtmlAsDetail(tgtNode, tableDetail);
    }

    drawNodeIcon(tgtNode);
    populateNodeLabel(tgtNode);

    return tgtNode;
}

export function doSwitchToEmptyNode(tgtNode) {
    tgtNode.switchToEmpty();
    switchNodeToEmpty(tgtNode);

    drawNodeIcon(tgtNode);
    populateNodeLabel(tgtNode);
    putHtmlAsDetail(tgtNode, '');

    saveActionUpdateEmpty(tgtNode);
}

export function doSwitchToPopulatedNode(tgtNode, payload) {
    let thisCb = firstSwitchToPopulatedCallbackFor(tgtNode.getTypeName());

    tgtNode.switchToFull();
    switchNodeToFull(tgtNode);

    if (tgtNode.isExpandedAsCustom()) {
        if (thisCb) {
            report(`Custom switchToPopulate detected for ${tgtNode.getTypeName()}`);

            let context = {
                "name": EVENT_SWITCH,
                "node": tgtNode,
                "payload": payload
            }

            /* call the callback function with the single context parameter */
            thisCb(context);
        }
    } else {
        let tableDetail = computePropertiesTable(tgtNode);
        putHtmlAsDetail(tgtNode, tableDetail);
    }

    drawNodeIcon(tgtNode);
    populateNodeLabel(tgtNode);

    saveActionUpdateFull(tgtNode);
}

export function doLabelTextNode(tgtNode) {
    let labelText;
    let thisCb = firstLabelTextCallbackFor(tgtNode.getTypeName());

    if (thisCb) {
        report(`Custom labelText detected for ${tgtNode.getTypeName()}`);

        let context = {
            "name": EVENT_LABEL,
            "node": tgtNode
        }

        labelText = thisCb(context);
    } else {
        report(`Normal labelText detected for ${tgtNode.getTypeName()}`);

        labelText = tgtNode.getLabel();
    }

    return tgtNode.getFullLabel(labelText);  /* return the full label, which may include an appended type */
}

export function doNodeIcon(tgtNode) {
    let nodeIcon;
    let thisCb = firstNodeIconCallbackFor(tgtNode.getTypeName());

    if (thisCb) {
        report(`Custom nodeIcon detected for ${tgtNode.getTypeName()}`);

        let context = {
            "name": EVENT_ICON,
            "node": tgtNode
        }

        nodeIcon = thisCb(context);
    } else {
        report(`Normal nodeIcon detected for ${tgtNode.getTypeName()}`);

        nodeIcon = tgtNode.getIcon();
    }

    return nodeIcon;
}

export function doStartLink(svgObj) {
    let srcNode = getNodeUsingSvg(svgObj);
    let newLink;

    if (srcNode) {
        newLink = createPartialLink(srcNode);
        setCurrentLink(newLink);

        drawLinkStart(newLink, srcNode);
        saveActionMisc('canvas:startPartialLink', srcNode,{
            "linkId": newLink.id,
            "srcNodeId": srcNode.id
        });
    } else {
        error(`'No source node found for ${svgObj.getAttribute('id')}'`);
    }

    return newLink;
}

//TODO: Make this a registrable hook
export function doAddExistingLink(tgtLink, srcNode, tgtNode) {
    let currLink = getCurrentLink();

    if (tgtLink === currLink) {
        /* this is a drag/drop link and will already be created */
        getProject().finishPartialLink(tgtLink, srcNode, tgtNode);

        drawLinkEnd(tgtLink, srcNode, tgtNode);
    } else {
        /* this is a new link */
        getProject().addFullLink(tgtLink, srcNode, tgtNode);

        drawLinkWhole(tgtLink, srcNode, tgtNode);
    }

    clearCurrentLink();
    clearTargetNode();
}

//TODO: Make this a registrable hook
export function doCreateLink(srcNode, tgtNode, linkData) {
    let newLink = createLink(srcNode, tgtNode, linkData);

    getProject().addFullLink(newLink, srcNode, tgtNode);
    drawLinkWhole(newLink, srcNode, tgtNode);

    return newLink;
}

//TODO: Make this a registrable hook
export function doDeleteNode(tgtNode) {
    removeNodeAndLinksFromCanvas(tgtNode);
    getProject().deleteNode(tgtNode);
}

//TODO: Make this a registrable hook
export function doDeleteLink(tgtLink) {
    getProject().deleteLink(tgtLink);
    removeLink(tgtLink);
}

export function computePropertiesTable(tgtNode) {
    let html = '';

    for (let [propName, val] of (Object.entries(tgtNode.listProperties()))) {
        let propPart;
        let propVal;

        if (val) {
            if (val.type === 'json') {
                propVal = textToHtml(JSON.stringify(val.value, null, 2));
            } else {
                propVal = val.value;
            }
        }

        if (isUrl(propVal)) {
            propPart = `<a href="${propVal}" target="_blank">link</a>`;
        } else {
            propPart = propVal;
        }

        html += `<tr class="cs-table"><td class="cs-table">${propName}</td><td>${propPart}</td></tr>`;
    }

    if (html) {
        html = `<table class="cs-table cs-node-content">${html}</table>`;
    }

    return html;
}
