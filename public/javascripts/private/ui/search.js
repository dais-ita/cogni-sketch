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
 * @file Functions defining the 'search' section.
 *
 * @author Dave Braines
 **/

import {
    getProject,
    getSessionValue,
    removeSessionValue,
    setSessionValue
} from "/javascripts/private/state.js";
import {debug} from "/javascripts/private/util/log.js";
import {
    registerChangeEvent,
    registerClickEvent,
    registerKeyupEvent,
    registerSubmitEvent,
    setFocus as doSetFocus
} from "/javascripts/private/util/dom.js";
import {get as getFromSs} from "/javascripts/private/csData/svgstore.js";
import {findOnCanvas} from "/javascripts/private/core/core_panes/canvas/select.js";
import {delayFunction} from "/javascripts/private/util/timing.js";
import {localize} from "/javascripts/private/util/internationalization.js";
import {stripHtml} from "/javascripts/private/util/misc.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {
    isFile,
    isImage,
    isText,
    isVideo,
    isWeb
} from "/javascripts/private/util/data.js";

//TODO: Node/link not deselected after search

const ELEM_FORM = 'cs-search-form';
const ELEM_SEARCH_TEXT = 'cs-search-text';
const ELEM_PREVIOUS = 'cs-search-previous';
const ELEM_NEXT = 'cs-search-next';
const ELEM_CASE = 'cs-case-sensitive';
const ELEM_DEEP = 'cs-deep-search';
const ELEM_MSG = 'cs-search-results-message';

const SESSION_GROUP = 'search';
const KEY_CASE_SENSITIVE = 'caseSensitive';
const KEY_DEEP_SEARCH = 'deepSearch';
const KEY_COUNT = 'count';
const KEY_CURRENT_ITEM = 'currentItem';
const KEY_MATCHES = 'matches';
const KEY_TERM = 'term';
const KEY_ORIGINAL_TERM = 'originalTerm';

const MS_DELAY = 500;

export function initialise() {
    setInitialValues();
    registerEventHandlers();
}

/** The user can specify default values for search settings in config.settings.search and these are copied
 * across to session variables on initialisation.  The corresponding menu item checkboxes are updated accordingly too.
 */
function setInitialValues() {
    setCaseSensitive(getSessionValue(SESSION_GROUP, KEY_CASE_SENSITIVE)||false);
    setDeepSearch(getSessionValue(SESSION_GROUP, KEY_DEEP_SEARCH)||false);

    $('#' + ELEM_CASE).prop('checked', getCaseSensitive());
    $('#' + ELEM_DEEP).prop('checked', getDeepSearch());
}

/** Convenience method for getting session 'caseSensitive' value
 *
 * @returns {boolean} whether search is case sensitive
 */
function getCaseSensitive() {
    return getSessionValue(SESSION_GROUP, KEY_CASE_SENSITIVE);
}

/** Convenience method for setting session 'caseSensitive' value
 *
 * @param val the value to be set
 */
function setCaseSensitive(val) {
    setSessionValue(SESSION_GROUP, KEY_CASE_SENSITIVE, val);
}

/** Convenience method for getting session 'deepSearch' value.
 * deepSearch means that properties within objects will be searched as well as node and link labels.
 *
 * @returns {boolean} whether search is deep
 */
function getDeepSearch() {
    return getSessionValue(SESSION_GROUP, KEY_DEEP_SEARCH);
}

/** Convenience method for setting session 'deepSearch' value
 *
 * @param val - the value to be set
 */
function setDeepSearch(val) {
    setSessionValue(SESSION_GROUP, KEY_DEEP_SEARCH, val);
}

/** Convenience method for getting the count for the last search.
 *
 * @returns {number} the number of search matches returned
 */
function getCount() {
    return getSessionValue(SESSION_GROUP, KEY_COUNT);
}

function setCount(val) {
    setSessionValue(SESSION_GROUP, KEY_COUNT, val);
}

/** Convenience method for getting the index of the currently selected search match.
 *
 * @returns {number} the index of the currently selected item
 */
function getCurrentItem() {
    return getSessionValue(SESSION_GROUP, KEY_CURRENT_ITEM);
}

function setCurrentItem(val) {
    setSessionValue(SESSION_GROUP, KEY_CURRENT_ITEM, val);
}

/** Convenience method for getting the list of matches for the last search.
 *
 * @returns {array} the list of matches for the last search
 */
function getMatches() {
    return getSessionValue(SESSION_GROUP, KEY_MATCHES);
}

function setMatches(val) {
    setSessionValue(SESSION_GROUP, KEY_MATCHES, val);
}

function getCurrentMatch() {
    let currItem = parseInt(getSessionValue(SESSION_GROUP, KEY_CURRENT_ITEM));

    return getNodeMatches()[currItem];
}

function getTerm() {
    return getSessionValue(SESSION_GROUP, KEY_TERM);
}

function setTerm(val) {
    setSessionValue(SESSION_GROUP, KEY_TERM, val);
}

function getOriginalTerm() {
    return getSessionValue(SESSION_GROUP, KEY_ORIGINAL_TERM);
}

function setOriginalTerm(val) {
    setSessionValue(SESSION_GROUP, KEY_ORIGINAL_TERM, val);
}

export function clearSearchResult() {
    removeSessionValue(SESSION_GROUP, KEY_COUNT);
    removeSessionValue(SESSION_GROUP, KEY_CURRENT_ITEM);
    removeSessionValue(SESSION_GROUP, KEY_MATCHES);
    removeSessionValue(SESSION_GROUP, KEY_TERM);
    removeSessionValue(SESSION_GROUP, KEY_ORIGINAL_TERM);
}

function registerEventHandlers() {
    registerKeyupEvent(ELEM_SEARCH_TEXT, delayedSearch());
    registerClickEvent(ELEM_PREVIOUS, actionSearchPrevious);
    registerClickEvent(ELEM_NEXT, actionSearchNext);
    registerChangeEvent(ELEM_CASE, actionFlippedCaseSensitive);
    registerChangeEvent(ELEM_DEEP, actionFlippedDeepSearch);
    registerSubmitEvent(ELEM_FORM, actionSuppressSubmit);
}

function delayedSearch() {
    return delayFunction(function (event) { actionSearchCanvas(event); }, MS_DELAY);
}

export function setFocus() {
    doSetFocus(ELEM_SEARCH_TEXT);
}

function actionSearchCanvas(event) {
    let elem = document.getElementById(ELEM_SEARCH_TEXT);    //TODO: consistency
    let origTerm = '';

    // if (event) {
    //     preventDefaultAndStopPropagation(event);
    // }

    if (elem) {
        origTerm = elem.value.trim();
    }

    let terms;

    if (origTerm.length > 1) {
        if (event && event.key === 'Enter') {
            highlightNext();
        } else {
            updateSummaryWithSearching();

            if (getCaseSensitive()) {
                terms = origTerm;
            } else {
                terms = origTerm.toLowerCase();
            }

            searchCurrentProject(terms, origTerm);
        }
    } else {
        clearAllMatches();
        clearSearchResult();

        if (origTerm.length === 0) {
            /* Ensure the summary is cleared */
            updateSummary();
        } else {
            updateSummaryWithMinNeeded();
        }
    }
}

function clearAllMatches() {
    clearMatches(getProject().listNodes());
    clearMatches(getProject().listLinks());
}

function clearMatches(nodes) {
    for (let node of Object.values(nodes)) {
        let svg = getFromSs(node.getUid());

        if (svg) {
            if (svg.label) {
                let labelElem = svg.label._groups[0][0].children[0];    //TODO: A cleaner way...

                if (labelElem.innerHTML.indexOf('<') > -1) {
                    //TODO: use strip html instead
                    labelElem.innerText = labelElem.innerText;  /* This clears any inner "mark" highlights */
                }
            }

            if (svg.detail) {
                let detailElem = svg.detail._groups[0][0].children[0];

                if (isText(node)) {
                    if (detailElem.innerHTML.indexOf('<') > -1) {
                        //TODO: use strip html instead
                        detailElem.innerText = detailElem.innerText;  /* This clears any inner "mark" highlights */
                    }
                    //TODO: This should be delegated to types
                } else if (isWeb(node)) {
                    //Ignore web types
                } else if (isImage(node)) {
                    //Ignore image types
                } else if (isVideo(node)) {
                    //Ignore video types
                } else if (node.getTypeName() === 'tweet') {
                    //Ignore tweet types
                } else if (isFile(node)) {
                    //Ignore file types
                } else {
                    debug(`Need to handle type ${node.getTypeName()}`);
                }
            }
        }
    }
}

function actionSearchPrevious() {
    highlightPrevious();
}

function actionSearchNext() {
    highlightNext();
}

function actionFlippedCaseSensitive() {
    flipAndSearch(KEY_CASE_SENSITIVE, 'search:flipCaseSensitive');
}

function actionFlippedDeepSearch() {
    flipAndSearch(KEY_DEEP_SEARCH, 'search:flipDeepSearch');
}

function flipAndSearch(key, actionLabel) {
    let newValue = !getSessionValue(SESSION_GROUP, key);

    setSessionValue(SESSION_GROUP, key, newValue);
    saveActionMisc(actionLabel, null, { "finalState": newValue });

    actionSearchCanvas();
}

function actionSuppressSubmit(event) {
    /* Stop the form submit refreshing the browser page */
    event.preventDefault();
}

function highlightNext(suppressAction) {
    let count = getCount();

    if (!suppressAction) {
        saveActionMisc('search:next');
    }

    if (count > 0) {
        if (getCurrentItem() === (count - 1)) {
            setCurrentItem(0);
        } else {
            setCurrentItem(getCurrentItem() + 1);
        }

        highlightNode();
    }
}

function highlightPrevious() {
    let count = getCount();

    saveActionMisc('search:previous');

    if (count > 0) {
        if (getCurrentItem() === 0) {
            setCurrentItem(count);
        }

        setCurrentItem(getCurrentItem() - 1);
        highlightNode();
    }
}

function highlightNode() {
    let tgtNode = getCurrentMatch();

    if (tgtNode) {
        updateSummary();

        findOnCanvas(tgtNode.match);
    }
}

function updateSummary() {
    let e = document.getElementById(ELEM_MSG);
    //TODO: Needs to be internationalized

    if (e) {
        let count = getCount();

        if (count > -1) {
            let mt;
            let cs;

            if (count === 1) {
                mt = 'match';
            } else {
                mt = 'matches';
            }

            if (getCaseSensitive()) {
                cs = ' (case sensitive)';
            } else {
                cs = ' (ignore case)'
            }

            let msgText = count + ' ' + mt + ' for "' + getOriginalTerm() + '"' + cs;

            if (getCurrentItem() > -1) {
                let match = getCurrentMatch();

                if (match) {
                    msgText += ', showing item ' + (getCurrentItem() + 1);

                    if (match.deepMatch) {
                        msgText += ' deep matched on property "' + match.property + '"';
                    }
                }
            }

            e.innerHTML = msgText;

            showResults();
        } else {
            e.innerHTML = '';
            hideResults();
        }
    }
}

function showResults() {
    let e = $('#' + ELEM_MSG);

    e.removeClass('d-none');
    e.addClass('d-flex');
}

function hideResults() {
    let e = $('#' + ELEM_MSG);

    e.removeClass('d-flex');
    e.addClass('d-none');
}

function updateSummaryWithSearching() {
    let msg = localize('messages.ui.search.in_progress');

    updateSummaryWith(`<i>${msg}</i>`);
}

function updateSummaryWithMinNeeded() {
    let msg = localize('messages.ui.search.minimum_needed');

    updateSummaryWith(`<i>${msg}</i>`);
}

function updateSummaryWith(msg) {
    let e = document.getElementById(ELEM_MSG);

    if (e) {
        e.innerHTML = msg;
        showResults();
    }
}

function searchCurrentProject(term, origTerm) {
    setMatches([]);
    setTerm(term);
    setOriginalTerm(origTerm);

    saveActionMisc('search:search', null, { "term": term });

    if (term === '') {
        setCount(-1);
        setCurrentItem(-1);
    } else {
        searchNodes();
        searchLinks();

        setCount(countNodeMatches());
        setCurrentItem(-1);
    }

    updateSummary();
    highlightMatches(getOriginalTerm());
    highlightNext(true);
}

function getNodeMatches(pureNode) {
    let nodes = [];
    let result = [];

    for (let node of getMatches()) {
        if (nodes.indexOf(node.match) === -1) {
            nodes.push(node.match);
            if (pureNode) {
                result.push(node.match);
            } else {
                result.push(node);
            }
        }
    }

    return result;
}

function countNodeMatches() {
    return getNodeMatches(true).length;
}

function searchNodes() {
    for (let node of getProject().listNodes()) {
        checkLabelData(node, 'node');
//        checkData(node, 'text', 'node');
        checkProperties(node, 'node');
    }
}

function searchLinks() {
    for (let link of getProject().listLinks()) {
        checkLabelData(link, 'link');
        checkProperties(link, 'link');
    }
}

function checkLabelData(obj, type) {
    checkValue(obj, obj.getLabel(), 'label', type);
}

function checkValue(obj, val, prop, type) {
    if (val) {
        let tgtVal;

        if (getCaseSensitive()) {
            tgtVal = val;
        } else {
            tgtVal = val.toLowerCase();
        }

        tgtVal = stripHtml(tgtVal);

        tryMatch(obj, tgtVal, prop, type, false);
    }

}

function checkProperties(obj, type) {
    if (getDeepSearch()) {
        for (let [key, val] of Object.entries(obj.listProperties())) {
            let propVal;

            if (val) {
                propVal = val.value;
            }

            checkValue(obj, propVal, key, type);
        }
    }
}

function tryMatch(obj, propVal, propName, type, deep) {
    if (propVal.indexOf(getTerm()) > -1) {
        getMatches().push( { "match": obj, "type": type, "property": propName, "deepMatch": deep } );
    }
}

function highlightMatches(term) {
    clearAllMatches(); //First clear all node matches (node and links)

    //Now highlight matches
    for (let match of getMatches()) {
        if (match.property === 'label') {
            highlightLabel(match.match, term);
        } else {
            highlightDetail(match.match, term);
        }
    }
}

function highlightLabel(match, term) {
    let svg = getFromSs(match.getUid());

    if (svg) {
        let labelElem = svg.label._groups[0][0].children[0];

        highlightInElement(labelElem, term);
    }
}

function highlightDetail(match, term) {
    highlightCustomDetail(match, term);
    highlightTableDetail(match, term);
}

function highlightTableDetail(match, term) {
    //TODO: Implement highlighting of table details
}

function highlightCustomDetail(match, term) {
    let svg = getFromSs(match.getUid());

    if (svg) {
        if (svg.detail) {
            let detailElem = svg.detail._groups[0][0].children[0];

            //TODO: Ths should be delegated to each type
            if (isText(match)) {
                highlightInElement(detailElem, term);
            } else if (isWeb(match)) {
                //Ignore web types
            } else if (isImage(match)) {
                //Ignore image types
            } else if (isVideo(match)) {
                //Ignore video types
            } else if (match.getTypeName() === 'tweet') {
                //Ignore video types
            } else {
                debug(`Need to handle ${match.getTypeName()}`);
            }
        }
    }
}

function highlightInElement(elem, term) {
    if (term) {
        let st = term;
        let et = elem.innerHTML;

        if (!getCaseSensitive()) {
            st = st.toLowerCase();
            et = et.toLowerCase();
        }

        if (et.indexOf(st) > -1) {
            let src = '\(' + term + ')';
            let tgt = '<span class="cs-mark-searchMatch">$1</span>';
            let re;

            if (getCaseSensitive()) {
                re = new RegExp(src, 'gi', 'i');
            } else {
                re = new RegExp(src,'gi');
            }

            elem.innerHTML = elem.innerText.replace(re, tgt);
        }
    }
}
