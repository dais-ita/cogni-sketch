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
 * @file Functions defining the general user interface of the application.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {initialise as initialiseWindow} from "/javascripts/private/ui/window/events.js";
import {
    clearSearchResult,
    initialise as initialiseSearch
} from "/javascripts/private/ui/search.js";
import {
    initialise as initialiseUser
} from "/javascripts/private/ui/user.js";
import {initialise as initialiseTabs} from "/javascripts/private/ui/tabs.js";
import {initialise as initialiseTypes} from "/javascripts/private/ui/palette/types.js";
import {initialise as initialiseProject} from "/javascripts/private/ui/project/project.js";
import {getPanes} from "/javascripts/private/csData/csDataComponents.js";
import {resetZoomPan} from "/javascripts/private/core/core_panes/canvas/panzoom.js";
import {
    getHeight,
    getLeft,
    getTop,
    getWidth,
    getZoomFactor
} from "/javascripts/private/csData/csDataCanvas.js";
import {getCurrentViewBox} from "/javascripts/private/util/coords.js";
import {initialise as d3Initialise} from "/javascripts/private/core/d3.js";
import {initialise as keyboardInitialise} from "/javascripts/private/ui/window/keyboard.js";
import {executeFunctionAfterDelay} from "../util/timing.js";
import {listProjectProposals} from "/javascripts/private/ui/project/project.js";
import {settings} from "/javascripts/private/core/core_settings.js";

export function initialise() {
    initToasts();
    initialiseWindow();
    initialiseSearch();
    initialiseUser();
    initialiseTabs();
    initialiseTypes();
    initialiseProject();
    keyboardInitialise();
    d3Initialise();

    /* panes (in /core_panes/ folder or plugins) are initialised as part of their dynamic load */
}

function initToasts() {
    $('.toast').toast();
}

export function reportFunctionExecution(funcName) {
    let elem = document.getElementById('csStats');

    elem.innerHTML = `Function ${funcName} is being executed...`;
}

export function reportStats(extraText) {
    let elem = document.getElementById('csStats');

    if (elem) {
        let statsMessage;

        if (getProject()) {
            statsMessage = `${getProject().listNodes().length} nodes and ${getProject().listLinks().length} links`;
//            statsMessage += ' <span id="csStatsExport" class="cs-hyperlink">export</span>';
        } else {
            statsMessage = 'No project loaded'
        }

        statsMessage += `${extraText||''}`;

        elem.innerHTML = statsMessage;

        // let linkElem = document.getElementById('csStatsExport');
        //
        // if (linkElem) {
        //     linkElem.addEventListener("click", actionStatsClick);
        // }
    }
}

// function actionStatsClick() {
//     let resultText = '';
//     let datesText = '';
//     let sortedNodes;
//     let buckets = [];
//     let allTypes = {};
//     let minTs, maxTs;
//
//     if (getProject()) {
//         sortedNodes = getProject().listNodes().sort((a, b) => a.getCreatedTimestamp() - b.getCreatedTimestamp());
//
//         let ctr = 0;
//         let bucketId = 1;
//         let thisBucket = { 'id': bucketId, 'nodes': [], 'types': {} };
//
//         for (let thisNode of sortedNodes) {
//             datesText += `${new Date(thisNode.getCreatedTimestamp())}\n`;
//
//             if (!minTs) {
//                 minTs = thisNode.getCreatedTimestamp();
//             }
//
//             maxTs = thisNode.getCreatedTimestamp()
//
//             if (++ctr === 10) {
//                 ctr = 0;
//                 thisBucket = { 'id': ++bucketId, 'nodes': [], 'types': {} };
//                 buckets.push(thisBucket);
//             }
//
//             let nodeType = thisNode.getTypeName();
//
//             if (Object.keys(allTypes).indexOf(nodeType) === -1) {
//                 allTypes[nodeType] = 1;
//             } else {
//                 ++allTypes[nodeType];
//             }
//
//             thisBucket.nodes.push(thisNode);
//
//             if (Object.keys(thisBucket.types).indexOf(nodeType) === -1) {
//                 thisBucket.types[nodeType] = 1;
//             } else {
//                 ++thisBucket.types[nodeType];
//             }
//         }
//
//         let rowText = 'bucket_id';
//
//         for (let thisType of Object.keys(allTypes)) {
//             rowText += `,${thisType}`;
//         }
//
//         resultText += rowText + ',total\n';
//
//         for (let thisBucket of buckets) {
//             let total = 0;
//             rowText = `${thisBucket.id}`;
//
//             for (let thisType of Object.keys(allTypes)) {
//                 let thisCount = thisBucket.types[thisType] || 0;
//
//                 rowText += `,${thisCount}`;
//
//                 total += thisCount;
//             }
//
//             resultText += rowText + `,${total}\n`;
//         }
//     }
//
//     console.warn('statsClick');
//     console.warn(sortedNodes);
//     console.warn(allTypes);
//     console.warn(buckets);
//     console.warn(resultText);
//     console.warn(datesText);
//     console.warn(minTs);
//     console.warn(maxTs);
//     console.warn(new Date(minTs));
//     console.warn(new Date(maxTs));
// }

export function reportDebugStats(e) {
    let l = getLeft();
    let t = getTop();
    let w = getWidth();
    let h = getHeight();
    let z = getZoomFactor();
    let vb = getCurrentViewBox();
    let fText = `, l=${l} ,t=${t}, w=${w}, h=${h}, z=${z.toFixed(2)} [${vb.left} ${vb.top} ${vb.width} ${vb.height}]`;
    let mText;

    if (e) {
        mText = `m=(${e.x.toFixed(0)}, ${e.y.toFixed(0)})`;
    } else {
        mText = '';
    }

    reportStats(` | ${mText}${fText}`);
}

export function finishedLoad() {
    /* ensure the document body has focus, to prevent the first click being lost */
    document.body.focus();
    let e = document.getElementById('cs-main-Canvas');
    e.dispatchEvent(new Event('click'));

    startProposalPolling();
}

function startProposalPolling() {
    //TODO: Replace this with websockets
    if (settings.project.checkForProposals) {
        listProjectProposals();

        executeFunctionAfterDelay(startProposalPolling, settings.project.proposalPollFrequency)
    }
}

export function clearPanes() {
    let allPanes = getPanes();

    resetZoomPan();
    clearSearchResult();

    for (let pane of Object.values(allPanes)) {
        if (pane.config && pane.config.callbacks && pane.config.callbacks.clear) {
            pane.config.callbacks.clear();
        }
    }
}
