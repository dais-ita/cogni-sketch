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
 * @file Functions defining the 'types' section of the palette.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject,
    setPalette
} from "/javascripts/private/state.js";
import {redrawExistingNodes} from "/javascripts/private/core/graphics.js";
import {create as createPalette} from "/javascripts/private/wrapper/wPalette.js";
import {
    httpGet,
    httpPostJson
} from "/javascripts/private/util/http.js";
import {
    error,
    showToast,
    userConfirm,
    userPrompt
} from "/javascripts/private/util/log.js";
import {
    destroy,
    getElemById,
    getSelectedText,
    registerChangeEvent,
    registerClickEvent,
    registerKeyupEvent,
    registerEvents as doRegisterEvents,
    removeClasses,
    setValue
} from "/javascripts/private/util/dom.js";
import {openPaletteExport} from "/javascripts/private/core/core_popups/export/exportPopup.js";
import {openPopup as openSectionPopup} from "/javascripts/private/core/core_popups/section/sectionPopup.js";
import {openPaletteImport} from "/javascripts/private/core/core_popups/import/importPopup.js";
import {openPopup as openTypePopup} from "/javascripts/private/core/core_popups/typePopup.js";
import {
    getSessionInitialPaletteName,
    isDefaultPalette,
    paletteExists, setSessionPaletteNames,
    setSessionSortedPalette
} from "/javascripts/private/csData/csDataSession.js";
import {sendPaletteChangedEvent} from "/javascripts/private/ui/tabs.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const DEFAULT_PALETTE_NAME = 'my new palette';

const URL_LOAD = '/palette/get/';
const URL_SAVE = '/palette/save/';
const URL_LIST = '/palette/list/';
const URL_DELETE = '/palette/delete/';

const ELEM_PAL_OUTER = 'cs-palette-outer';
const ELEM_PAL_ACCORDION = 'cs-acc-palette';
const ELEM_PAL_ADD_SECTION = 'cs-add-palette-section';
const ELEM_PAL_ADD_ITEM = 'cs-add-palette-item';
const ELEM_PAL_LIST = 'cs-palette-list';
const ELEM_PAL_CREATE_NEW = 'cs-create-new-palette';
const ELEM_PAL_IMPORT = 'cs-import-palette';
const ELEM_PAL_EXPORT = 'cs-export-palette';
const ELEM_PAL_RELOAD = 'cs-reload-palette';
const ELEM_PAL_SAVE = 'cs-save-palette';
const ELEM_PAL_SAVE_AS = 'cs-save-palette-as';
const ELEM_PAL_DELETE = 'cs-delete-palette';
const ELEM_SEARCH_TEXT = 'cs-search-palette-text';
const ELEM_CS_MENU = 'cs-nav-application';

const MSG_CANNOT_MODIFY_DEFAULT = 'The default palette cannot be modified';

export function initialise() {
    initPalette(true);

    registerEventHandlers();
}

function registerEventHandlers() {
    registerClickEvent(ELEM_PAL_ADD_SECTION, actionAddSection);
    registerClickEvent(ELEM_PAL_ADD_ITEM, actionAddItem);
    registerClickEvent(ELEM_PAL_LIST, actionClickedList);
    registerChangeEvent(ELEM_PAL_LIST, actionChangedList);
    registerClickEvent(ELEM_PAL_CREATE_NEW, actionCreateNew);
    registerClickEvent(ELEM_PAL_IMPORT, actionImport);
    registerClickEvent(ELEM_PAL_EXPORT, actionExport);
    registerClickEvent(ELEM_PAL_RELOAD, actionReload);
    registerClickEvent(ELEM_PAL_SAVE, actionSave);
    registerClickEvent(ELEM_PAL_SAVE_AS, actionSaveAs);
    registerClickEvent(ELEM_PAL_DELETE, actionDelete);
    registerKeyupEvent(ELEM_SEARCH_TEXT, actionSearch);
}

function initPalette(redraw, tgtNode) {
    if (getPalette()) {
        let palArray = getPalette().listItems();

        if (redraw) {
            //Remove all palette sections and items
            let div = document.getElementById(ELEM_PAL_ACCORDION);
            div.innerHTML = '';

            //Destroy the existing accordion
            destroy(ELEM_PAL_ACCORDION);
        }

        updatePaletteListSelection();

        palArray.sort(function(a, b) {
            return a.getPosition() - b.getPosition();
        });

        setSessionSortedPalette(palArray);

        addToPalette(getPalette().getSections(), palArray);
    }

    let expSecIdx = -1;

    if (getPalette()) {
        expSecIdx = getPalette().getSectionIndexFor(tgtNode);
    }

    if (expSecIdx === -1) {
        expSecIdx = 0;
    }

    $('#' + ELEM_PAL_ACCORDION).accordion({ "collapsible": true, "heightStyle": "content", "active": expSecIdx });

    ensureVisible(tgtNode);
}

function ensureVisible(tgtNode) {
    if (tgtNode) {
        let elem = document.getElementById(`cs-palette-item-${tgtNode.getId()}`);

        if (elem) {
            elem.scrollIntoView(false);
        }
    }
}

export function listPalettes() {
    httpGet(URL_LIST, callbackList);
}

function callbackList(paletteNames) {
    setSessionPaletteNames(paletteNames);

    populatePaletteList(paletteNames);
}

function actionSearch() {
    let palette = document.querySelectorAll('[id^="palette_"]');
    let match, input, filter, txtValue, li;

    //TODO: Clean this up

//    event.stopPropagation();

    input = document.getElementById(ELEM_SEARCH_TEXT);
    filter = input.value.toUpperCase();

    saveActionMisc('palette:filterPalette', null, { "palette": getPalette().getName(), "text": filter });

    for (let i = palette.length-1; i >= 0; i--) {
        let found = false;

        li = palette[i].getElementsByTagName('li');

        for (let j = 0; j < li.length; j++) {
            txtValue = li[j].textContent || li[j].innerText;

            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[j].style.display = '';
                $('#' + ELEM_PAL_ACCORDION).accordion('option', 'active', i);
                match = 1;
                found = true;
            } else {
                li[j].style.display = 'none';
            }
        }

        //Hide any empty sections
        let hdrId = palette[i].getAttribute('aria-labelledby');
        let hdrElem = document.getElementById(hdrId);

        if (hdrElem) {
            if (!found) {
                hdrElem.style.display = 'none';
            } else {
                hdrElem.style.display = '';
            }
        }
    }

    if (match !== 1) {$('#' + ELEM_PAL_ACCORDION).accordion('option', 'active', false)}
    if (filter === '') {$('#' + ELEM_PAL_ACCORDION).accordion('option', 'active', 0)}
}

function actionAddSection() {
    if (getPalette().isReadOnly()) {
        error('Cannot add section - palette is read only', null, null, true);
    } else {
        saveActionMisc('palette:startAddSection', null, { "palette": getPalette().getName() });

        if (!isDefaultPalette()) {
            openSectionPopup();
        } else {
            showToast(MSG_CANNOT_MODIFY_DEFAULT);
        }
    }
}

function actionAddItem() {
    if (getPalette().isReadOnly()) {
        error('Cannot add item - palette is read only', null, null, true);
    } else {
        if (!isDefaultPalette()) {
            openTypePopup();
        } else {
            showToast(MSG_CANNOT_MODIFY_DEFAULT);
        }
    }
}

function actionClickedList(event) {
    //Stop event propagation to prevent the context menu from collapsing
    event.stopPropagation();
}

function actionChangedList() {
    let oldPalName;
    let newPalName = getSelectedText(ELEM_PAL_LIST);

    if (getPalette()) {
        oldPalName = getPalette().getName();
    }

    loadPalette(newPalName);
    saveActionMisc('palette:changePalette', null, { "oldName": oldPalName, "newName": newPalName });

//    closePopupMenu();
}

function actionSave() {
    if (!isDefaultPalette()) {
        saveActionMisc('palette:save', null, { "palette": getPalette().getName() });
        httpPostJson(URL_SAVE, callbackSave, getPalette().export(), { "name": getPalette().getName() } );
    }
}

function actionSaveAs(event, initialName) {
    let paletteName = getNewPaletteName(initialName);

    if (paletteName) {
        let oldName = getPalette().getName();
        getPalette().setName(paletteName);
        getProject().setPalette(getPalette());

        saveActionMisc('palette:saveAs', null, { "oldPalette": oldName, "newPalette": paletteName });
        httpPostJson(URL_SAVE, callbackSave, getPalette().export(), { "name": getPalette().getName() });
    }
}

function actionCreateNew() {
    let paletteName = getNewPaletteName(DEFAULT_PALETTE_NAME);

    if (paletteName) {
        let newPalette = { "name": paletteName, "isNew": true };

        httpPostJson(URL_SAVE, callbackCreate, newPalette, { "name": paletteName });
        listPalettes();
    }
}

function callbackCreate(rawPalette, params, quiet) {
    let palette = createPalette(rawPalette);

    sendPaletteChangedEvent({ "palette": palette, "change": "create" });
    saveActionMisc('palette:createNewPalette', null, { "oldName": getPalette().getName(), "newName": palette.getName() });

    if (getProject()) {
        getProject().setPalette(palette);
    } else {
        setPalette(palette);
    }

    renderPalette();

    if (!quiet) {
        showToast(`Palette <b>${palette.getName()}</b> has been successfully created`);
    }

    listPalettes();
    initPalette(true);
}

function actionImport() {
    openPaletteImport();
    saveActionMisc('palette:openImport', null, { "palette": getPalette().getName() });
}

function actionExport() {
    openPaletteExport(JSON.stringify(getPalette().export(), null, 1));
    saveActionMisc('palette:openExport', null, { "palette": getPalette().getName() });
}

function actionReload() {
    loadPalette(getPalette().getName(), getPalette().getOwner());
    saveActionMisc('palette:reloadPalette', null, { "palette": getPalette().getName() });
}

function actionDelete() {
    if (getPalette().isReadOnly()) {
        error('Cannot delete - palette is read only', null, null, true);
    } else {
        let pn = getPalette().getName();
        let okToDelete = userConfirm(`'Are you sure you want to delete the palette '${pn}'?'`);

        if (okToDelete) {
            saveActionMisc('palette:delete', null, { "paletteName": pn });
            httpPostJson(URL_DELETE, callbackDelete, getPalette().export(), { "palette": getPalette().getName() });
        }
    }
}

function callbackDelete(resp, params) {
    if (!resp.errors || resp.errors.length === 0) {
        showToast(`Palette <b>${params.palette}</b> has been successfully deleted`);

        loadPalette(getSessionInitialPaletteName());
        listPalettes();
    } else {
        showToast(resp.errors.join(', '));
    }
}

function closePopupMenu() {
    removeClasses(getElemById(ELEM_CS_MENU), [ 'show' ]);
}

export function loadPalette(paletteName, paletteOwner) {
    let url = URL_LOAD + paletteName;

    if (paletteOwner) {
        url += `?owner=${paletteOwner}`;
    }

    httpGet(url, callbackLoad);
}

function callbackLoad(rawPalette) {
    let palette = createPalette(rawPalette);
    sendPaletteChangedEvent({ "palette": palette, "change": "load" });

    if (getProject()) {
        getProject().setPalette(palette);
        relinkExistingNodes();
    } else {
        setPalette(palette);
    }

    loadPaletteFrom(palette);
    renderPalette();
}

function relinkExistingNodes() {
    for (let tgtNode of getProject().listNodes()) {
        let newType = getPalette().getItemById(tgtNode.getTypeName());

        tgtNode._relinkType(newType);
    }
}

export function loadPaletteFrom(thisPalette) {
    initPalette(true);

    showToast(`Palette <b>${thisPalette.getName()}</b> has been loaded`);
}

export function createNewSection(sec) {
    getPalette().addSection(sec);

    initPalette(true);
}

function renderPalette() {
    initPalette(true);
    redrawExistingNodes();
}

export function savePaletteFrom(palette, quiet) {
    if (!isDefaultPalette(palette)) {
        httpPostJson(URL_SAVE, callbackSave, palette.export(), { name: palette.getName() }, quiet);
    }
}

export function importPaletteFrom(rawPalette) {
    let okToSave;

    if (paletteExists(rawPalette.name)) {
        okToSave = userConfirm('Palette \'' + rawPalette.name + '\' already exists.  Do you want to overwrite it?');
    } else {
        okToSave = true;
    }

    if (okToSave) {
        httpPostJson(URL_SAVE, callbackImport, rawPalette, { name: rawPalette.name });
    }
}

function updatePaletteListSelection() {
    let owner = getPalette().getOwner();
    let tgtName;

    if (owner) {
        //If this is a shared palette then it needs to be added to the palette list
        tgtName = '*' + getPalette().getName();
        let e = document.getElementById(ELEM_PAL_LIST);
        let ignore = false;

        for (let c of e.childNodes) {
            if (c.innerHTML === tgtName) {
                ignore = true;
            }
        }

        if (!ignore) {
            let o = document.createElement('option');

            o.text = tgtName;
            e.add(o);
        }
    } else {
        tgtName = getPalette().getName();
    }

    setValue(ELEM_PAL_LIST, tgtName)
}

/**
 * Prompt the user for a palette name.
 *
 * @param initialName   a starting candidate name.
 * @return {string}     the new palette name.
 */
export function getNewPaletteName(initialName) {
    let result;

    //Refresh the list of all palettes to help avoid accidental overwrite
    listPalettes();

    if (!initialName) {
        initialName = getPalette().getName();
    }

    let paletteName = userPrompt('What is the new name for this palette', initialName);
    let okToSave = false;

    if (paletteName) {
        if (isValidPaletteName(paletteName)) {
            okToSave = checkForReplace(paletteName);
        } else {
            showToast(`${paletteName} is not valid, please try again`);
        }
    }

    if (okToSave) {
        result = paletteName;
    }

    return result;
}

function checkForReplace(paletteName) {
    let okToSave;

    if (paletteExists(paletteName)) {
        okToSave = userConfirm(`Palette "${paletteName}" already exists.  Do you want to overwrite it?`);
    } else {
        okToSave = true;
    }

    return okToSave;
}

function isValidPaletteName(paletteName) {
    return !paletteName.startsWith('.') && (paletteName !== 'null') && (paletteName.trim() !== '');
}

function populatePaletteList(paletteNames) {
    let e = document.getElementById(ELEM_PAL_LIST);
    let tgtPalName;

    if (getPalette()) {
        tgtPalName = getPalette().getName();
    }

    if (!tgtPalName) {
        tgtPalName = getSessionInitialPaletteName();
    }

    for (let i = e.options.length; i >= 0; i--) {
        e.options.remove(i);
    }

    for (let thisPaletteName of paletteNames) {
        let o = document.createElement('option');

        o.text = thisPaletteName;

        if (thisPaletteName === tgtPalName) {
            o.selected = true;
        }

        e.add(o);
    }
}

function addToPalette(palSections, palArray) {
    if (palSections) {
        for (let thisSection of palSections) {
            addPaletteSection(thisSection, palArray);
        }
    }
}

function addPaletteSection(section, palArray) {
    let outer = document.getElementById(ELEM_PAL_OUTER);
    let accDiv = document.getElementById(ELEM_PAL_ACCORDION);
    let hdr = document.createElement('DIV');
    let hdrText = document.createElement('DIV');
    let bdy1 = document.createElement('DIV');
    let bdy2 = document.createElement('DIV');
    let ul = document.createElement('UL');

    hdrText.style.display = 'inline-block';
    hdrText.textContent = section.label;

    accDiv.appendChild(hdr);
    hdr.appendChild(hdrText);

    if (section.label !== 'core_types') {
        let hdrImgDiv = document.createElement('DIV');
        let hdrImg = document.createElement('IMG');

        hdrImgDiv.style.display = 'inline-block';
        hdrImgDiv.style.float = 'right';
        hdrImg.setAttribute('src', '/images/cs/icon-edit.svg');
        hdrImg.setAttribute('title', 'Edit this section');
        hdrImg.setAttribute('width', '20px');

        hdr.appendChild(hdrImgDiv);
        hdrImgDiv.appendChild(hdrImg);

        doRegisterEvents(hdrImg, { "click": function(e) { openPaletteSection(e, section.name); } });
    }

    bdy1.id = 'palette_' + section.name;
    bdy2.id = 'palette_inner_' + section.name;

    bdy1.classList.add('p-0');
    bdy2.classList.add('cs-scroll');
    bdy2.classList.add('p-0');

    accDiv.appendChild(bdy1);
    bdy1.appendChild(bdy2);
    bdy2.appendChild(ul);
    ul.className = 'cs-palette-ul';

    outer.style.height = (window.innerHeight / 2) + 'px';
    bdy1.style.height = (window.innerHeight / 2) + 'px';

    for (let thisItem of palArray) {
        if (thisItem.isInSection(section.name)) {
            addPaletteItem(thisItem, ul);
        }
    }
}

function openPaletteSection(event, id) {
    //Stop the underlying section from expanding/collapsing
    event.stopPropagation();

    saveActionMisc('palette:startEditSection', null, { "palette": getPalette().getName(), "name": id });

    openSectionPopup(id);
}

function addPaletteItem(item, ul) {
    let li = document.createElement('li');

    li.setAttribute('id', `cs-palette-item-${item.getId()}`);

    if (item.getIcon()['color']) {
        li.className = `cs-node-${item.getIcon()['color']} cs-palette-li`;
    } else {
        li.className = 'cs-palette-li';
        li.style.fill = item.getCustomColor();
        li.style.backgroundColor = item.getCustomColor();
    }
    li.setAttribute('draggable', 'true');
    registerEvents(li, item);

    let oImg = document.createElement('img');
    oImg.setAttribute('src', item.getIcon().icon);
    oImg.setAttribute('alt', item.getIcon().iconAlt);
    oImg.setAttribute('draggable', 'false');
    oImg.className = 'cs-palette-icon';

    li.appendChild(oImg);
    li.appendChild(document.createTextNode(item.getLabel()));

    ul.appendChild(li);
}

function registerEvents(elem, tgtType) {
    doRegisterEvents(elem, {
        "dragstart": function(event) { return dragstartPalette(event, tgtType.getId()); },
        "dblclick": function(event) { return openPaletteItem(event, tgtType.getId()); }
    });
}

function openPaletteItem(event, typeName) {
    let nodeType = getPalette().getItemById(typeName);

    if (nodeType) {
        openTypePopup(nodeType);
    } else {
        showToast(`Cannot find palette item configuration for <b>${typeName}</b>`);
    }
}

function dragstartPalette(event, id) {
    event.dataTransfer.setData('text/plain', id);
}

export function renameSection(oldName, newName) {
    for (let ps of getPalette().getSections()) {
        if (ps.name === oldName) {
            ps.name = newName;
        }

        if (ps.label === oldName) {
            ps.label = newName;
        }
    }

    for (let item of getPalette().listItems()) {
        if (item.getSection() === oldName) {
            item.setSection(newName);
        }
    }

    initPalette(true);
}

export function createSampleItem(color, iconUrl, iconAlt, label) {
    let li = document.createElement('div');

    li.className = 'cs-palette-li';

    if (color.name) {
        li.className += ' ' + 'cs-node-' + color.name;
    } else {
        li.style.backgroundColor = color.hex;
    }

    let oImg = document.createElement('img');
    oImg.setAttribute('src', iconUrl);
    oImg.setAttribute('alt', iconAlt);
    oImg.setAttribute('draggable', 'false');
    oImg.className = 'cs-palette-icon';

    li.appendChild(oImg);
    li.appendChild(document.createTextNode(label));

    li.style.display = 'inline';

    return li;
}

export function refresh(nodeType) {
    initPalette(true, nodeType);
}

export function refreshItem() {
    //TODO: Implement this properly - for now, just redraw the whole palette
    refresh();
}

function callbackSave(palette, params, quiet) {
    if (palette) {
        if (!quiet) {
            showToast(`Palette <b>${params.name}</b> has been successfully saved`);
        }

        listPalettes();
    } else {
        //TODO: Improve error handling - there might be other reasons why this was not saved
        showToast('Not saved.  ' + MSG_CANNOT_MODIFY_DEFAULT);
    }
}

function callbackImport(palette, params, quiet) {
    if (palette) {
        if (getProject()) {
            let impPalette = createPalette(palette);
            getProject().setPalette(impPalette);
            sendPaletteChangedEvent({ "palette": impPalette, "change": "import" });
        } else {
            setPalette(palette);
        }

        renderPalette(palette);

        if (!quiet) {
            showToast(`Palette <b>${params.name}</b> has been successfully imported`);
        }

        listPalettes();
        initPalette(true);
    } else {
        //TODO: Improve error handling - there might be other reasons why this was not saved
        showToast('Not imported.  ' + MSG_CANNOT_MODIFY_DEFAULT);
    }
}
