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
 * @file Functions relating to the core link popup window.
 * @author Dave Braines
 **/

import {mainTemplate} from "./templates/linkDetailsTemplates.js";
import {
    saveActionMisc,
    saveActionUpdateLinkLabel
} from "/javascripts/private/csData/change/csDataChanges.js";
import {refreshLink} from "/javascripts/private/core/graphics.js";
import {
    getElemValById,
    getSelectedValue,
    showElement,
    hideElement
} from "/javascripts/private/util/dom.js";
import {getUniqueSemanticLinkLabelsFor} from "/javascripts/private/util/model/schema.js";
import {getUniqueTextLinkLabels} from "/javascripts/private/util/model/schema.js";
import {mergeArrays} from "/javascripts/private/util/misc.js";
import {
    closePopup as actionClosePopup,
    popupFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {
    checkPropertiesValid,
    insertCommonSection,
    insertMetaDataSection,
    savePropertiesAndRelations
} from "../commonDetails/commonDetails.js";
import {error} from "/javascripts/private/util/log.js";
import {getProject} from "/javascripts/private/state.js";

const ELEM_METADATA_SECTION = 'metadata-section';
const ELEM_SUMMARY_TEXT = 'summary-text';
const ELEM_COMMON_SECTION = 'common-section';
const ELEM_EXISTING = 'input-existing-label';
const ELEM_NEW_SECTION = 'new-section';
const ELEM_NEW = 'input-new-label';
const ELEM_BUTTON_SAVE = 'button-save';
const ELEM_BUTTON_CANCEL = 'button-cancel';
const ELEM_BI = 'bidirectional';

let NEW_LABEL_ITEM = '(create new label)';

/**
 * Build the html for this popup window and open it.
 *
 * @param {csLink} tgtLink      the link that is the focus of this popup window.
 */
export function openPopup(tgtLink) {
    let config = calculateLinkConfig(tgtLink, true);

    saveActionMisc('canvas:editLink', null, { "linkId": tgtLink.id });

    popupFrom(tgtLink, mainTemplate, config);

    /* Now that the main popup form has been created the dynamic sections can be inserted */
    insertMetaDataSection(tgtLink, ELEM_METADATA_SECTION);
    populateSummaryText(tgtLink);
    insertCommonSection(tgtLink, ELEM_COMMON_SECTION, true);
}

function populateSummaryText(tgtLink) {
    let elem = document.getElementById(ELEM_SUMMARY_TEXT);

    if (elem) {
        let srcNode = tgtLink.getSourceNode();
        let tgtNode = tgtLink.getTargetNode();
        let srcLabel;
        let tgtLabel;
        let biText;

        if (srcNode) {
            srcLabel = srcNode.getLabel() || '(no label)';
        } else {
            srcLabel = '???';
        }

        if (tgtNode) {
            tgtLabel = tgtNode.getLabel() || '(no label)';
        } else {
            tgtLabel = '???';
        }

        let elemBi = document.getElementById(ELEM_BI);

        if (elemBi && elemBi.checked) {
            biText = ' (and vice-versa)';
        } else {
            biText = '';
        }

        elem.innerHTML = `${srcLabel} ${getFormLabel() || '[is related to]'} ${tgtLabel}${biText}`;
    }
}

/**
 * Create the configuration for this node details popup window.
 *
 * @param {csLink} tgtLink      the link that is the subject of this popup window.
 * @param {boolean} noLinks     whether to suppress the relations section.
 * @return {csTemplateConfig}   the template configuration.
 */
function calculateLinkConfig(tgtLink, noLinks) {
    let config;
    let modalElemName;
    let newClasses = '';
    let biText;

    if (tgtLink.getLabel()) {
        modalElemName = ELEM_EXISTING;
        newClasses = 'd-none';
    } else {
        modalElemName = ELEM_NEW;
    }

    if (tgtLink.isBidirectional()) {
        biText = 'checked';
    } else {
        biText = '';
    }

    config = {
        'modalFocus': modalElemName,
        'html': {
            'linkLabel': tgtLink.getLabel(),
            'newClasses': newClasses,
            'labelNames': configLabelNameList(tgtLink),
            'biChecked': biText
        },
        'events': []
    };

    config.events.push({ 'elemId': ELEM_EXISTING, 'event': 'change', 'function': function() { actionChangedExistingLink(tgtLink); } });
    config.events.push({ 'elemId': ELEM_NEW, 'event': 'keyup', 'function': function() { actionChangedNewLink(tgtLink); } });
    config.events.push({ 'elemId': ELEM_BUTTON_SAVE, 'event': 'click', 'function': function() { actionSavePopup(tgtLink); } });
    config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': actionClosePopup });
    config.events.push({ 'elemId': ELEM_BI, 'event': 'change', 'function': function() { actionChangedBi(tgtLink); } });

    return config;
}

/**
 * Compute the list of all possible label names, and compare with the current label to see which should be selected.
 *
 * @param {csLink} tgtLink      the link that is the subject of this popup window.
 * @return {object[]}           the list of possible labels.
 */
function configLabelNameList(tgtLink) {
    let labelList = [];
    let currentLabel = tgtLink.getLabel();

    let semanticLabels = getUniqueSemanticLinkLabelsFor(tgtLink);
    let textLabels = getUniqueTextLinkLabels();
    textLabels.push(NEW_LABEL_ITEM);

    let allLabels = mergeArrays(semanticLabels, textLabels, true);

    for (let thisLabel of allLabels) {
        let selText = '';

        if (thisLabel === currentLabel) {
            selText = 'selected';
        }

        labelList.push({ 'label': thisLabel, 'selected': selText });
    }

    return labelList;
}

/**
 * Check any properties are valid and then save the changes by updating the label and saving any properties.
 *
 * @param {csLink} tgtLink      the link that is the subject of this popup window.
 */
function actionSavePopup(tgtLink) {
    if (getProject().isReadOnly()) {
        error('Cannot save link - project is read only', null, null, true);
    } else {
        if (checkPropertiesValid()) {
            let oldLabel = tgtLink.getLabel();

            tgtLink.setLabel(getFormLabel());

            if (tgtLink.getLabel() !== oldLabel) {
                saveActionUpdateLinkLabel(tgtLink, oldLabel);
            }

            saveBidirectional(tgtLink);
            savePropertiesAndRelations(tgtLink);
            refreshLink(tgtLink);

            actionClosePopup();
        }
    }
}

function getFormLabel() {
    let result;

    if (isNewLabel()) {
        result = getElemValById(ELEM_NEW);
    } else {
        result = getSelectedValue(ELEM_EXISTING);
    }

    return result;
}

function saveBidirectional(tgtLink) {
    let elem = document.getElementById(ELEM_BI);

    if (elem) {
        if (tgtLink.isBidirectional() !== elem.checked) {
            saveActionMisc('link:changedBidirectional', null, { "linkId": tgtLink.id });
        }

        tgtLink.setBidirectional(elem.checked);
    }
}

/**
 * The existing link list has been changed.  Show or hide the "new label" fields accordingly.
 */
function actionChangedExistingLink(tgtLink) {
    if (isNewLabel()) {
        showElement(ELEM_NEW_SECTION);
    } else {
        hideElement(ELEM_NEW_SECTION);
    }

    populateSummaryText(tgtLink);
}

/**
 * The new link field has been changed.  Update the summary text.
 */
function actionChangedNewLink(tgtLink) {
    populateSummaryText(tgtLink);
}

/**
 * The bidirectional checkbox has been changed.  Update the summary text.
 */
function actionChangedBi(tgtLink) {
    populateSummaryText(tgtLink);
}

/**
 * Returns true if the form is in "new label" mode, rather than having an existing label selected.
 *
 * @return {boolean}        whether the form is in "new label" mode.
 */
function isNewLabel() {
    let lab = getSelectedValue(ELEM_EXISTING);

    return (lab === NEW_LABEL_ITEM);
}
