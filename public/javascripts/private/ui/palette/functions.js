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
 * @file Functions defining the 'functions' section of the palette.
 *
 * @author Dave Braines
 **/

import {addSessionValue} from "/javascripts/private/state.js";
import {registerOtherEvent} from "/javascripts/private/util/dom.js";
import {openPopup as openFunctionPopup} from "/javascripts/private/core/core_popups/functionDetails/functionPopup.js";
import {httpGet} from "/javascripts/private/util/http.js";
import {getSessionDebug} from "/javascripts/private/csData/csDataSession.js";

const URL_LIST = '/function/list/';

const ELEM_ACC_FUNCTIONS = 'cs-acc-functions';
const ELEM_ACC_NO_FUNCTIONS = 'cs-acc-no-functions';
const ELEM_BTN_FUNCTIONS = 'cs-btn-functions';

export function listFunctions() {
    httpGet(URL_LIST, cbListFunctions);
}

function cbListFunctions(funcList) {
    let fsArray = [];

    //Remove all function sections and items
    let div = document.getElementById('cs-acc-functions');
    div.innerHTML = '';

    let eAcc = $('#' + ELEM_ACC_FUNCTIONS);

    //Check if the accordion exists (i.e. was it created previously)
    if (eAcc.data('ui-accordion')) {
        //Destroy the existing accordion
        eAcc.accordion('destroy');
    }

    if (funcList) {
        for (let thisFunc of Object.values(funcList)) {
            if (thisFunc['isDebug']) {
                if (getSessionDebug()) {
                    fsArray.push(thisFunc);
                }
            } else {
                fsArray.push(thisFunc);
            }
        }
    }

    fsArray.sort(function(a, b) {
        return a.position - b.position;
    });

    let fc = 0;

    if (fsArray.length > 0) {
        fc = addToFunctions(fsArray);

        $('#cs-acc-functions').accordion({collapsible: true, heightStyle: 'content'});
        showFunctions();
    } else {
        showNoFunctions();
    }

    $('#' + ELEM_BTN_FUNCTIONS).html('Functions (' + fc + ')');
}

function showFunctions() {
    let eF = $('#' + ELEM_ACC_FUNCTIONS);
    let eN = $('#' + ELEM_ACC_NO_FUNCTIONS);

    /* Show functions */
    eF.addClass('d-block');
    eF.removeClass('d-none');

    /* Hide no functions */
    eN.addClass('d-none');
    eN.removeClass('d-block');
}

function showNoFunctions() {
    let eF = $('#' + ELEM_ACC_FUNCTIONS);
    let eN = $('#' + ELEM_ACC_NO_FUNCTIONS);

    /* Hide functions */
    eF.addClass('d-none');
    eF.removeClass('d-block');

    /* Show no functions */
    eN.addClass('d-block');
    eN.removeClass('d-none');
}

function addToFunctions(fsArray) {
    let fc = 0;

    for (let i = 0; i < fsArray.length; i++) {
        let thisFs = fsArray[i];

        fc += addFunctionSection(thisFs);
    }

    return fc;
}

function addFunctionSection(fs) {
    let div = document.getElementById('cs-acc-functions');
    let hdr = document.createElement('div');
    let bdy1 = document.createElement('div');
    let bdy2 = document.createElement('div');
    let fc = 0;

    bdy1.classList.add('p-0');
    bdy2.classList.add('cs-scroll');
    bdy2.classList.add('p-0');

    div.appendChild(hdr);
    div.appendChild(bdy1);
    bdy1.appendChild(bdy2);

    bdy1.style.height = (window.innerHeight / 2) + 'px';

    hdr.textContent = fs.label;
    bdy1.id = 'func_' + fs.id;
    bdy2.id = 'func_inner_' + fs.id;

    if (fs.html) {
        //Simple html list rendering, with the html taken from the config item
        bdy2.innerHTML = '<div>' + fs.html + '</div>';
    } else {
        if (fs.items) {
            let ul = document.createElement('ul');

            bdy2.appendChild(ul);
            ul.className = 'cs-palette-ul';

            for (let i=0; i < fs.items.length; i++) {
                let thisItem = fs.items[i];

                addFunctionItem(thisItem, ul);
                ++fc;
            }
        }
    }

    if (fs.settings && fs.settings.init) {
        fs.settings.init();     //Execute this functions init() method
    }

    return fc;
}

function addFunctionItem(item, ul) {
    let li = document.createElement('li');
    let elemId = `function_${item.id}`;

    li.id = elemId;
    li.className = 'cs-node-' + item.nodeColor + ' cs-function-li';
    li.setAttribute('draggable', 'true');

    let oImg = document.createElement('img');
    oImg.setAttribute('src', item.icon);
    oImg.setAttribute('alt', item.iconAlt);
    oImg.setAttribute('draggable', 'false');
    oImg.className = 'cs-function-icon';

    li.appendChild(oImg);
    li.appendChild(document.createTextNode(item.label));

    ul.appendChild(li);

    registerOtherEvent(elemId, 'dragstart', function(event) { return dragstartFunction(event, item.id); });
    registerOtherEvent(elemId, 'dblclick', function(event) { return dblclickFunction(event, item.id); });

    addSessionValue('general', 'allFunctions', item.id, item);
}

function dragstartFunction(event, id) {
    event.dataTransfer.setData('text/plain', 'function:' + id);
}

function dblclickFunction(event, id) {
    openFunctionPopup(id);
}
