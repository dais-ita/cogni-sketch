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
 * @file Functions defining the 'files' section of the palette.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {httpGet} from "/javascripts/private/util/http.js";
import {
    debug,
    debugCallback
} from "/javascripts/private/util/log.js";
import {registerOtherEvent} from "/javascripts/private/util/dom.js";

const TYPE_NAME = 'palette.files';
const DEFAULT_IMAGE = './javascripts/private/core/core_types/file/images/icon-file.svg';

const URL_LIST_FILES = '/file/list/';

const ELEM_LIST_FILES = 'cs-list-files';
const ELEM_BTN_FILES = 'cs-btn-files';
const ELEM_LIST_NO_FILES = 'cs-list-no-files';

export function initialise() {
    //Remove all file sections and items
    let e = document.getElementById(ELEM_LIST_FILES);

    if (e) {
        e.innerHTML = '';
    }

    listFiles();
}

export function listFiles() {
    let proj = getProject();
    let pn = proj.getName();

    if (pn) {
        let url = URL_LIST_FILES + pn;

        if (proj.getOwner()) {
            url += `?owner=${proj.getOwner()}`;
        }

        httpGet(url, callbackListFiles);
    }
}

function callbackListFiles(fileArray) {
    debugCallback(TYPE_NAME, 'listFiles');

    renderFileList(fileArray);
}

function renderFileList(fileArray) {
    if (fileArray.length > 0) {
        clearFiles();
        addToFiles(fileArray);
        showFiles();
    } else {
        showNoFiles();
    }

    $('#' + ELEM_BTN_FILES).html('Files (' + fileArray.length + ')');
}

function showFiles() {
    let eF = $('#' + ELEM_LIST_FILES);
    let eN = $('#' + ELEM_LIST_NO_FILES);

    /* Show functions */
    eF.addClass('d-block');
    eF.removeClass('d-none');

    /* Hide no functions */
    eN.addClass('d-none');
    eN.removeClass('d-block');
}

function showNoFiles() {
    let eF = $('#' + ELEM_LIST_FILES);
    let eN = $('#' + ELEM_LIST_NO_FILES);

    /* Hide functions */
    eF.addClass('d-none');
    eF.removeClass('d-block');

    /* Show no functions */
    eN.addClass('d-block');
    eN.removeClass('d-none');
}

function dragstartFile(event, id) {
    debug('dragstartFile');

    event.dataTransfer.setData('text/plain', id);
}

function clearFiles() {
    let div = document.getElementById(ELEM_LIST_FILES);

    div.innerHTML = '';
}

function addToFiles(fileArray) {
    let div = document.getElementById(ELEM_LIST_FILES);
    let ul = document.createElement('UL');

    div.appendChild(ul);
    ul.className = 'cs-palette-ul';

    for (let thisFile of fileArray) {
        let icon = getIconDetailsFor(thisFile);
        let thisItem = {
            'icon': icon.url,
            'iconAlt': icon.alt,
            'id': icon.id,
            'label': thisFile,
            'nodeColor': 'blue'
        };

        addFileItem(thisItem, ul);
    }
}

//TODO: Move this to the file core_type?
export function getIconDetailsFor(fn) {
    const lfn = fn.trim().toLowerCase();
    let result = { 'id': 'file:' + fn };
    let imgFolder = './javascripts/private/core/core_types/file/images/';

    if (lfn.endsWith('.csv')) {
        result.url = imgFolder + 'icon-file-csv.svg';
        result.alt = 'file-csv';
    } else if (lfn.endsWith('.doc') || lfn.endsWith('.docx')) {
        result.url = imgFolder + 'icon-file-doc.svg';
        result.alt = 'file-doc';
    } else if (lfn.endsWith('.html')) {
        result.url = imgFolder + 'icon-file-html.svg';
        result.alt = 'file-html';
    } else if (lfn.endsWith('.json')) {
        result.url = imgFolder + 'icon-file-json.svg';
        result.alt = 'file-json';
    } else if (lfn.endsWith('.mov')) {
        result.url = imgFolder + 'icon-file-mov.svg';
        result.alt = 'file-mov';
    } else if (lfn.endsWith('.mp3')) {
        result.url = imgFolder + 'icon-file-mp3.svg';
        result.alt = 'file-mp3';
    } else if (lfn.endsWith('.mp4')) {
        result.url = imgFolder + 'icon-file-mp4.svg';
        result.alt = 'file-mp4';
    } else if (lfn.endsWith('.pdf')) {
        result.url = imgFolder + 'icon-file-pdf.svg';
        result.alt = 'file-pdf';
    } else if (lfn.endsWith('.ppt') || lfn.endsWith('.pptx')) {
        result.url = imgFolder + 'icon-file-ppt.svg';
        result.alt = 'file-ppt';
    } else if (lfn.endsWith('.txt')) {
        result.url = imgFolder + 'icon-file-txt.svg';
        result.alt = 'file-txt';
    } else if ((lfn.endsWith('.xls')) || (lfn.endsWith('.xlsx')) || (lfn.endsWith('.xlsm'))) {
        result.url = imgFolder + 'icon-file-xls.svg';
        result.alt = 'file-xls';
    } else {
        result.url = imgFolder + 'icon-file.svg';
        result.alt = 'file';
    }

    return result;
}

function addFileItem(item, ul) {
    let li = document.createElement('li');
    let elemId = `file_${item.id}`;

    li.id = elemId;
    li.className = 'cs-node-' + item.nodeColor + ' cs-file-li';
    li.setAttribute('draggable', 'true');

    let oImg = document.createElement('img');
    oImg.setAttribute('src', item.icon);
    oImg.setAttribute('onerror', `this.src="${DEFAULT_IMAGE}"`);
    oImg.setAttribute('alt', item.iconAlt);
    oImg.setAttribute('title', item.label);
    oImg.setAttribute('draggable', 'false');
    oImg.className = 'cs-file-icon';

    let oLab = document.createElement('span');
    oLab.innerHTML = item['label'];
    oLab.className = 'cs-file-label';

    li.appendChild(oImg);
    li.appendChild(oLab);

    ul.appendChild(li);

    registerOtherEvent(elemId, "dragstart", function(event) { return dragstartFile(event, item.id); });
}
