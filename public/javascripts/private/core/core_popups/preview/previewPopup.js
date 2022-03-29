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
 * @file Functions relating to the core preview popup window.
 * @author Dave Braines
 **/

import {mainTemplate} from "./templates/previewTemplates.js";
import {closePopup as actionClosePopup, popupFrom} from "/javascripts/private/core/core_popups/generalPopup.js";
import {showToast} from "/javascripts/private/util/log.js";
import {isChecked, setChecked} from "/javascripts/private/util/dom.js";
import {getPalette} from "../../../../interface/data.js";

const ELEM_INCLUDE_ALL = 'cb_all';
const ELEM_BUTTON_SUBMIT = 'button-submit';
const ELEM_BUTTON_CANCEL = 'button-cancel';

const JSON_OPTIONS = {
    'collapsed': true,
    'withQuotes': true,
    'withLinks': true
};

/**
 * Create the configuration for this preview details popup window.
 *
 * @param {csNode} originalNode
 * @param {csPreviewResponse} previewResponse
 * @param {csLayoutConfig} layoutConfig
 * @param {function} cb
 * @param {csPreviewItem[]} previewItems
 * @return {csTemplateConfig}               the standard template config object for generating html.
 */
function calculateFunctionConfig(originalNode, previewResponse, layoutConfig, cb, previewItems) {
    /* add the standard message */
    previewResponse.messages.push('Select all the ones you want to create on the canvas\'');

    let config = {
        'html': {
            'errorText': previewResponse.errors.join('<br/>'),
            'messageText': previewResponse.messages.join('<br/>'),
            'items': previewItems
        },
        'events': []
    };

    config.events.push({
        'elemId': ELEM_INCLUDE_ALL,
        'event': 'click',
        'function': function() { actionChangedIncludeAll(previewItems) }
    });

    config.events.push({
        'elemId': ELEM_BUTTON_SUBMIT,
        'event': 'click',
        'function': function() { actionCommitToCanvas(originalNode, layoutConfig, cb, previewItems); }
    });

    config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': actionClosePopup });

    return config;
}

function extractItemsFrom(previewResponse) {
    let result = [];

    for (let nodeItem of previewResponse.nodes) {
        let labelText = '';
        let dataObj = '';

        if (nodeItem.nodeData && nodeItem.nodeData.data) {
            labelText = nodeItem.nodeData.data.label;
        }

        if (nodeItem.nodeData && nodeItem.nodeData.data) {
            dataObj = nodeItem.nodeData.data.properties;
        }

        let matchedType = true;
        let thisType = getPalette().getItemById(nodeItem.type);

        if (!thisType) {
            thisType = getPalette().getDefaultItem();
            matchedType = false;
        }

        let isJson = false;

        if (typeof dataObj === 'object') {
            isJson = true
        }

        result.push({
            'linkName': nodeItem.link,
            'typeName': nodeItem.type,
            'type': thisType,
            'matchedType': matchedType,
            'label': labelText || 'summary',
            'isJson': isJson,
            'data': dataObj
        });
    }

    return result;
}

export function openPopup(originalNode, previewResponse, layoutConfig, cb) {
    if (originalNode) {
        let previewItems = extractItemsFrom(previewResponse);
        let config = calculateFunctionConfig(originalNode, previewResponse, layoutConfig, cb, previewItems);

        popupFrom('preview', mainTemplate, config);

        let ctr = 0;
        for (let item of previewItems) {
            if (item.isJson) {
                let jvId = `json-renderer_${ctr++}`;

                $(`#${jvId}`).jsonViewer(item.data, JSON_OPTIONS);
            }
        }
    } else {
        showToast('Cannot create any nodes or links as the original node was not specified');
    }
}

function actionChangedIncludeAll(previewItems) {
    let targetState = false;

    if (isChecked(ELEM_INCLUDE_ALL)) {
        targetState = true;
    }

    for (let i = 0; i < previewItems.length; i++) {
        setChecked(`cb_${i}`, targetState);
    }
}

function actionCommitToCanvas(originalNode, initialConfig, cb, previewItems) {
    let selectedNodes = [];
    let pairCtr = 0;

    for (let item of previewItems) {
        if (isChecked(`cb_${pairCtr++}`)) {
            selectedNodes.push(item);
        }
    }

    actionClosePopup();

    /* call the callback */
    cb(originalNode, selectedNodes, initialConfig);
}
