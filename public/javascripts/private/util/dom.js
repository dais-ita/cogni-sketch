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
 * @file Helper functions for creating or accessing DOM elements.
 *
 * @author Dave Braines
 **/

import {warn} from "/javascripts/private/util/log.js";

const FORM_CLASSES = [ 'modal', 'cs-modal-overflow', 'py-0', 'px-2' ];
const BUTTON_CLASSES = [ 'button', 'btn', 'btn-block', 'btn-secondary' ];
const TABLE_CLASSES = [ 'table' ];
const BTN_CLASS_DEFAULT = 'cs-btn-default';
const BTN_CLASS_CLOSE = 'cs-btn-close';

/**
 * Get the dom element for the specified id.
 *
 * @param {string} elemId       the id for the element.
 * @returns {HTMLElement}       the dom element (if found).
 */
export function getElement(elemId) {
    let result = document.getElementById(elemId);

    if (!result) {
        warn(`Element '${elemId}' was not found`);
    }

    return result;
}

/**
 * Iterate through each of the event registration details, registering the event with the specified dom element.
 *
 * @param {csEventRegister[]} events      the definition of all events to be registered.
 */
export function registerConfigEvents(events) {
    for (let eventDetails of events) {
        let elem = getElement(eventDetails.elemId);

        if (elem) {
            elem.addEventListener(eventDetails.event, eventDetails.function);
        }
    }
}

/**
 * Make the dom element with the specified id visible.
 *
 * @param {string} elemName     the id of the dom element.
 */
export function showElement(elemName) {
    let elem = getElement(elemName);

    if (elem) {
        elem.classList.add('d-flex');
        elem.classList.remove('d-none');
    }
}

/**
 * Expand the collapsible element with the specified id.
 *
 * @param {string} elemName     the id of the dom element.
 */
export function expandCollapsible(elemName) {
    let elem = getElement(elemName);

    if (elem) {
        //TODO: aria-expanded needed
        elem.classList.add('show');
    }
}

/**
 * Collapse the collapsible element with the specified id.
 *
 * @param {string} elemName     the id of the dom element.
 */
export function collapseCollapsible(elemName) {
    let elem = getElement(elemName);

    if (elem) {
        //TODO: aria-expanded needed
        elem.classList.remove('show');
    }
}

/**
 * Make the dom element with the specified id invisible.
 *
 * @param {string} elemName     the id of the dom element.
 */
export function hideElement(elemName) {
    let elem = getElement(elemName);

    if (elem) {
        elem.classList.add('d-none');
        elem.classList.remove('d-flex');
    }
}

/**
 * Generate html (using handlebars) by applying the specified config to the specified template.  Apply this html to
 * the parent, and register any events defined in the config.
 *
 * @param {HTMLElement} parent          the parent dom element within which to insert the generated html.
 * @param {string} template             the template to be used for handlebars generation.
 * @param {csTemplateConfig} config     the template configuration.
 */
export function createHtmlUsing(parent, template, config) {
    let compiled = Handlebars.compile(template, config.html);

    if (config.outer) {
        parent.outerHTML = compiled(config.html);
    } else {
        parent.innerHTML = compiled(config.html);
    }

    if (config.events) {
        registerConfigEvents(config.events);
    }
}

/**
 * Generate html (using handlebars) by applying the specified config to the specified template.  Apply this html to
 * the parent, and register any events defined in the config.
 *
 * @param {HTMLElement} parent          the parent dom element within which to append the generated html.
 * @param {string} template             the template to be used for handlebars generation.
 * @param {csTemplateConfig} config     the template configuration.
 */
export function appendHtmlUsing(parent, template, config) {
    let compiled = Handlebars.compile(template, config.html);
    let newElem = document.createElement('DIV');

    parent.appendChild(newElem);
    newElem.outerHTML = compiled(config.html);

    if (config.events) {
        registerConfigEvents(config.events);
    }
}

/**
 * Create a new DOM element, set the id (if specified), and append to the parent element.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} tagName          the valid DOM tag name
 * @param {string} [id]             the optional id to be used for the new DOM element
 * @returns {HTMLElement}           the newly created DOM element
 */
function createAndAppend(parent, tagName, id) {
    let e = document.createElement(tagName);

    if (id) {
        e.setAttribute('id', id);
    }

    parent.appendChild(e);

    return e;
}

/**
 * Create a new label element.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} labelText        the text for this label
 * @returns {HTMLLabelElement}      the newly created label element
 */
function createLabel(parent, labelText) {
    let e = /** @type {HTMLLabelElement} */ createAndAppend(parent, 'label');

    e.innerText = labelText;

    return e;
}

/**
 * Create a new label element and link it to the specified element.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} id               the id of the DOM element to which this label applies
 * @param {string} labelText        the text of the label
 * @returns {HTMLLabelElement}      the newly created label element
 */
function createLabelFor(parent, id, labelText) {
    let e;

    if (labelText) {
        e = createLabel(parent, labelText);

        e.setAttribute('for', id);
    }

    return e;
}

/**
 * Create and initialise an input dom element.
 *
 * @param {HTMLElement} parent          the DOM element that will be the parent
 * @param {string} [id]                 the optional id to be used for the new DOM element
 * @param {string} tagName              the element type name, must be a valid DOM tag name
 * @param {string} [label]              the optional label for this input element
 * @param {string} [value]              the optional value for this input element
 * @param {boolean} [setFocus=false]    whether the input element has focus
 * @param {boolean} [disabled= false]   whether the input element is disabled
 * @returns {HTMLInputElement}          the newly created input element
 */
function createInput(parent, id, tagName, label, value, setFocus, disabled) {
    createLabelFor(parent, id, label);

    let e = document.createElement('input');
    e.setAttribute('id', id);
    e.setAttribute('type', tagName);
    e.setAttribute('value', value);

    if (setFocus) {
        e.focus();
    }

    if (disabled) {
        e.setAttribute('disabled', 'true');
    }

    parent.appendChild(e);

    return e;
}

/**
 * Create and append the thead element and children for any specified headers.
 *
 * @param {HTMLTableElement} parent         the table element to which the header will be added
 * @param {string||HTMLElement[]} headers   any header labels or DOM elements
 */
function makeTableHeader(parent, headers) {
    if (headers && (headers.length > 0)) {
        let th = createTableHeader(parent);
        let tr = createTableRow(th);

        for (let thisHeader of headers) {
            let td = createTableCell(tr);

            if (typeof thisHeader === 'string') {
                createLabel(td, thisHeader);
            } else {
                td.appendChild(thisHeader);
            }
        }
    }
}

/**
 * Create a new table header cell (thead) element.
 *
 * @param {HTMLTableElement} parent         the table element that will be the parent
 * @returns {HTMLTableHeaderCellElement}    the newly created table header cell element
 */
function createTableHeader(parent) {
    return /** @type {HTMLTableHeaderCellElement} */ createAndAppend(parent, 'thead');
}

/**
 * Create a new table row (tr) element.
 *
 * @param {HTMLTableHeaderCellElement} parent      the table element that will be the parent
 * @returns {HTMLTableRowElement}                  the newly created table row element
 */
export function createTableRow(parent) {
    return /** @type {HTMLTableRowElement} */ createAndAppend(parent, 'tr');
}

/**
 * Create a new table cell (td) element.
 *
 * @param {HTMLTableRowElement} parent      the table row element that will be the parent
 * @returns {HTMLTableCellElement}          the newly created table cell element
 */
function createTableCell(parent) {
    return /** @type {HTMLTableCellElement} */ createAndAppend(parent, 'td');
}

/**
 * Add css classes to the specified DOM element.
 *
 * @param {HTMLElement} e           the DOM element
 * @param {string[]} classNames     the list of css class names to be added
 */
export function addClasses(e, classNames) {
    if (classNames) {
        for (let thisClass of classNames) {
            e.classList.add(thisClass);
        }
    }
}

/**
 * Register events for the specified element.
 *
 * @param {HTMLElement} elem        the element against which the events will be registered
 * @param {csEventObject} events      the dictionary of events to be registered, key is event name, value is callback
 */
export function registerEvents(elem, events) {
    if (events) {
        for (let [event, func] of Object.entries(events)) {
            elem.addEventListener(event, func)
        }
    }
}

export function getElemById(id, silent) {
    let e = document.getElementById(id);

    if (!e && !silent) {
        warn(`Could not find element: ${id}`);
    }

    return e;
}

export function getFirstElemByClass(cn, silent) {
    let e = document.getElementsByClassName(cn);
    let result;

    if (e.length === 0) {
        if (!silent) {
            warn(`Could not find element with class name: ${cn}`);
        }
    } else {
        if (e.length > 1) {
            warn(`More than one element found with class name: ${cn}`);
        }

        result = e[0];
    }

    return result;
}

export function getAllElemsByClass(cn) {
    return document.getElementsByClassName(cn);
}

/**
 *
 * @param elemName
 * @param silent
 * @return {string}     the value of the specified field.
 */
export function getElemValById(elemName, silent) {
    let e = getElemById(elemName, silent);
    let v;

    if (e) {
        if (e.tagName === 'INPUT') {
            v = e.value;
        } else if (e.tagName === 'SPAN') {
            v = e.innerHTML;
        } else if (e.tagName === 'DIV') {
            v = e.innerHTML;
        } else if (e.tagName === 'A') {
            v = e.innerHTML;
        } else if (e.tagName === 'SELECT') {
            v = getSelectedValue(elemName, silent);
        } else if (e.tagName === 'TEXTAREA') {
            v = e.value;
        } else {
            warn('Getting value for unsupported field type: ${e.tagName} (${elemName})');
            v = e.value;
        }
    }

    return v;
}

/**
 *
 * @param elemName
 * @param silent
 * @return {string}     the selected value.
 */
export function getSelectedValue(elemName, silent) {
    let e = getElemById(elemName, silent);
    let v;

    if (e) {
        if (e.selectedIndex > -1) {
            v = e.options[e.selectedIndex].value;
        }
    }

    return v;
}

export function getSelectedText(elemName, silent) {
    let e = getElemById(elemName, silent);
    let v;

    if (e) {
        if (e.selectedIndex > -1) {
            v = e.options[e.selectedIndex].text;
        }
    }

    return v;
}

export function getSelectedValues(elemName, silent) {
    let e = getElemById(elemName, silent);
    let v = [];

    if (e) {
        if (e.selectedOptions.length > 0) {
            for (let thisOpt of e.selectedOptions) {

                v.push(thisOpt.value);
            }
        }
    }

    return v;
}

export function removeElement(elemName) {
    let e = getElemById(elemName, true);

    if (e) {
        e.remove();
    }
}

export function removeRowForElement(elemName) {
    let e = getElemById(elemName);
    let done = false;

    if (e) {
        if (e.parentNode) {
            if (e.parentNode.parentNode) {
                e.parentNode.parentNode.remove();
                done = true;
            }
        }
    }

    if (!done) {
        warn(`Error deleting element row: ${elemName}`);
    }
}

export function removeClasses(elem, classList) {
    let currentClasses = elem.className.split(' ');
    let newClasses = [];

    for (let cc of currentClasses) {
        if (classList.indexOf(cc) === -1) {
            newClasses.push(cc);
        }
    }

    elem.className = newClasses.join(' ');
}

export function setFocus(elemName) {
    let e = getElemById(elemName);

    if (e) {
        e.focus();
    }
}

export function enable(elemName, cascade) {
    let e = getElemById(elemName);

    if (e) {
        e.disabled = false;

        if (cascade) {
            for (let i = 0; i < e.children.length; i++) {
                e.children[i].disabled = false;
            }
        }
    }
}

export function disable(elemName, cascade) {
    let e = getElemById(elemName);

    if (e) {
        e.disabled = true;

        if (cascade) {
            for (let i = 0; i < e.children.length; i++) {
                e.children[i].disabled = true;
            }
        }
    }
}

export function show(elemName, mode) {
    let e = getElemById(elemName);

    if (e) {
        e.style.display = mode || 'inline';
    }
}

export function hide(elemName) {
    let e = getElemById(elemName);

    if (e) {
        e.style.display = 'none';
    }
}

export function setValue(elemName, val) {
    let e = getElemById(elemName);

    if (e) {
        if (e.tagName === 'INPUT') {
            e.value = val;
        } else if (e.tagName === 'SPAN') {
            e.innerHTML = val;
        } else if (e.tagName === 'DIV') {
            e.innerHTML = val;
        } else if (e.tagName === 'SELECT') {
            e.value = val;
        } else if (e.tagName === 'A') {
            e.innerHTML = val;
        } else {
            warn(`Setting value for unsupported field type: ${e.tagName} (${elemName})`);
        }
    }
}

export function setChecked(elemName, val) {
    let e = getElemById(elemName);

    if (e) {
        e.checked = val;
    }
}

export function isChecked(elemName) {
    let checked = false;
    let e = getElemById(elemName);

    if (e) {
        checked = e.checked;
    }

    return checked;
}

export function setModalFocus(formName, elemName) {
    $('#' + formName).on('shown.bs.modal', function () {
        setFocus(elemName);
    });
}

export function destroy(elemName) {
    $('#' + elemName).accordion('destroy');
}

/**
 * Create a new form element and append to the document body (note that this actually creates a div rather than a
 * form), deleting any existing element with the same id.
 *
 * @param {string} id              the id of the new DOM element
 * @param {string[]} [classes]     any additional css class names to be used
 * @returns {HTMLDivElement}       the newly created DOM element
 */
export function createForm(id, classes=[]) {
    let e;

    if (id) {
        /* If the form already exists remove it */
        removeElement(id);      //TODO: Remove this as it is unintuitive (and inconsistent with other functions)

        e = document.createElement('div');
        e.setAttribute('id', id);
        addClasses(e, FORM_CLASSES.concat(classes));
        document.body.appendChild(e);
    } else {
        warn('No id specified when creating new form');
    }

    return e;
}

/**
 * Create a new form element from the specified html text.
 *
 * @param {string} id               the id of the new DOM element
 * @param {string} htmlText         the html text to be used as innerHTML
 * @returns {HTMLDivElement}       the newly created DOM element
 */
export function createFormFromHtml(id, htmlText) {
    let e;

    /* If the form already exists remove it */
    if (id) {
        removeElement(id);      //TODO: Remove this as it is unintuitive (and inconsistent with other functions)
    }

    e = document.createElement('div');
    document.body.appendChild(e);
    e.innerHTML = htmlText;

    return e;
}

/**
 * Create a new div element.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} [id]             the optional id to be used for the new div element
 * @returns {HTMLDivElement}        the newly created div element
 */
export function createDiv(parent, id) {
    return /** @type {HTMLDivElement} */ createAndAppend(parent, 'div', id);
}

/**
 * Create a new paragraph element and populate with any specified html.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} [id]             the optional id to be used for the new paragraph element
 * @param {string} [html]           the optional html templates for the paragraph
 * @returns {HTMLParagraphElement}  the newly created paragraph element
 */
export function createPara(parent, id, html) {
    let e = /** @type {HTMLParagraphElement} */ createAndAppend(parent, 'p', id);

    if (html) {
        e.innerHTML = html;
    }

    return e;
}

/**
 * Create a new BR element.
 *
 * @param {HTMLElement} parent     the DOM element that will be the parent
 * @returns {HTMLBRElement}        the newly created BR element
 */
export function createBr(parent) {
    return /** @type {HTMLBRElement} */ createAndAppend(parent, 'br');
}

/**
 * Create a new HR element.
 *
 * @param {HTMLElement} parent     the DOM element that will be the parent
 * @returns {HTMLHRElement}        the newly created HR element
 */
export function createHr(parent) {
    return /** @type {HTMLHRElement} */ createAndAppend(parent, 'hr');
}

/**
 * Create a new pre element.
 *
 * @param {HTMLElement} parent     the DOM element that will be the parent
 * @param {string} [id]            the optional id to be used for the new pre element
 * @returns {HTMLPreElement}       the newly created pre element
 */
export function createPre(parent, id) {
    return /** @type {HTMLPreElement} */ createAndAppend(parent, 'pre', id);
}

/**
 * Create a new span element.
 *
 * @param {HTMLElement} parent      the DOM element that will be the parent
 * @param {string} [id]             the optional id to be used for the new span element
 * @param {string} [html]           the contents of this span
 * @param {string} [label]          the label text for this span
 * @returns {HTMLSpanElement}       the newly created span element
 */
export function createSpan(parent, id, html, label) {
    createLabelFor(parent, id, label);

    let e = /** @type {HTMLSpanElement} */ createAndAppend(parent, 'span', id);
    e.innerHTML = html;

    return e;
}

/**
 * Create a new list item element.
 *
 * @param {HTMLElement} parent     the DOM element that will be the parent
 * @param {string} [id]            the optional id to be used for the new list item element
 * @param {string} text            the text for this list item
 * @returns {HTMLLIElement}        the newly created list item element
 */
export function createListItem(parent, id, text) {
    let e = /** @type {HTMLLIElement} */ createAndAppend(parent, 'li', id);

    e.innerText = text;

    return e;
}

/**
 * Create a new option element and append to the specified parent opt group.
 *
 * @param {HTMLOptGroupElement|HTMLSelectElement}   parent  the opt group element that will be parent
 * @param {string} text                             the text of the option
 * @param {string} [value=text]                     the value of the option (text will be used if no value specified)
 * @param {boolean} [selected=false]                whether the option should be selected
 * @param {boolean} [disabled=false]                whether the option should be disabled
 * @returns {HTMLElement}                           the newly created option element
 */
export function createOption(parent, text, value, selected, disabled) {
    let e = createAndAppend(parent, 'option');

    e.text = text;
    e.setAttribute('value', value || text);

    if (selected) {
        e.setAttribute('selected', 'true');
    }

    if (disabled) {
        e.setAttribute('disabled', 'true');
    }

    return e;
}

/**
 * Create a new button DOM element.
 *
 * @param {HTMLElement} parent          the DOM element that will be the parent
 * @param {string} [id]                 the optional id to be used for the new button element
 * @param {string} labelText            the button text
 * @param {function} [cbClick]          the optional callback for the click event
 * @param {boolean} [isDefault=false]   whether this is the default button
 * @param {boolean} [isClose=false]     whether this is the close button
 * @returns {HTMLElement}               the newly created button element
 */
export function createButton(parent, id, labelText, cbClick, isDefault, isClose) {
    let e = createAndAppend(parent, 'button', id);

    e.innerText = labelText;
    e.addEventListener('click', cbClick);

    addClasses(e, BUTTON_CLASSES);

    if (isDefault) {
        addClasses(e,[ BTN_CLASS_DEFAULT ]);
    }

    if (isClose) {
        addClasses(e, [ BTN_CLASS_CLOSE ]);
    }

    return e;
}

/**
 * Create a new text input element.
 *
 * @param {HTMLElement} parent      the parent DOM element
 * @param {string} id               the id for this new text input element
 * @param {string} [label]          the optional label for this new text input element
 * @param {string} [value]          the optional value for this new text input element
 * @param {boolean} [setFocus]      whether the new text input has focus
 * @param {boolean} [disabled]      whether the new text input is disabled
 * @returns {HTMLInputElement}      the newly created text input element
 */
export function createTextField(parent, id, label, value, setFocus, disabled) {
    return createInput(parent, id, 'text', label, value, setFocus, disabled);
}

/**
 * Create a new link (a) element.
 *
 * @param {HTMLElement} parent          the parent DOM element
 * @param {string} [id]                 the optional id for this new link element
 * @param {function} [cbClick]          the onclick callback for this new link element
 * @param {string} text                 the text for this new link element
 * @returns {HTMLLinkElement}           the newly created link element
 */
export function createLink(parent, id, cbClick, text) {
    let e = createAndAppend(parent, 'a', id);

    e.addEventListener('click', cbClick);
    e.innerText = text;

    return /** @type {HTMLLinkElement} */ e;
}

/**
 * Create a new checkbox input element.
 *
 * @param {HTMLElement} parent      the parent DOM element
 * @param {string} id               the id for this new checkbox input element
 * @param {string} [label]          the optional label for this new checkbox input element
 * @param {boolean} [checked]       whether the new checkbox input element has focus
 * @param {csEventObject} [events]    an event structure to be used for registering events
 * @returns {HTMLInputElement}      the newly created checkbox input element
 */
export function createCheckbox(parent, id, label, checked, events) {
    let e = createInput(parent, id, 'checkbox', label);

    if (checked) {
        e.checked = true;
    }

    registerEvents(e, events);

    return /** @type {HTMLInputElement} */ e;
}

/**
 * Create a new select (drop down) element.
 *
 * @param {HTMLElement} parent      the parent DOM element
 * @param {string} id               the id for this new dropdown element
 * @param {string} [label]          the label for this new dropdown element
 * @param {boolean} [multi=false]   whether the dropdown is multi-select
 * @param {csEventObject} [events]    an event structure to be used for registering events
 * @returns {HTMLSelectElement}
 */
export function createSelect(parent, id, label, multi, events) {
    createLabelFor(parent, id, label);

    let e = document.createElement('select');
    e.setAttribute('id', id);

    registerEvents(e, events);

    if (multi) {
        e.setAttribute('multiple', 'multiple');
    }

    parent.appendChild(e);

    return /** @type {HTMLSelectElement} */ e;
}

/**
 * Create a new textarea element.
 *
 * @param {HTMLElement} parent      the parent DOM element
 * @param {string} id               the id for this new textarea element
 * @param {string} [label]          the optional label for this new textarea element
 * @param {string} [value]          the optional value for this new textarea element
 * @param {boolean} [setFocus]      whether the new checkbox input element has focus
 * @param {string[]} [classes]      any additional css class names to be used
 * @returns {HTMLTextAreaElement}   the newly created checkbox input element
 */
export function createTextArea(parent, id, label, value, setFocus, classes) {
    createLabelFor(parent, id, label);

    let e = createAndAppend(parent, 'textarea', id);
    e.setAttribute('value', value);
    e.value = value;

    if (setFocus) {
        e.focus();
    }

    addClasses(e, classes);

    return /** @type {HTMLTextAreaElement} */ e;
}

/**
 * Create a new color (standard color chooser) input element.
 *
 * @param {HTMLElement} parent          the parent DOM element
 * @param {string} id                   the id for this new color input element
 * @param {string} [label]              the optional label for this new color input element
 * @param {string} [value]              the optional value for this new color input element
 * @param {boolean} [disabled=false]    whether the color input element is disabled
 * @returns {HTMLInputElement}
 */
export function createColorChooser(parent, id, label, value, disabled) {
    return /** @type {HTMLInputElement} */ createInput(parent, id, 'color', label, value, false, disabled);
}

/**
 * Create a new table element, with a thead element plus children if headers are specified.
 *
 * @param {HTMLElement} parent              the DOM element that will be the parent
 * @param {string} [id]                     the optional id to be used for the new button element
 * @param {string|HTMLElement[]} headers    any header labels or DOM elements
 * @param {string[]} classes                any additional css class names to be used
 * @returns {HTMLTableElement}              the newly created table element
 */
export function createTable(parent, id, headers, classes) {
    let e = /** @type {HTMLTableElement} */ createAndAppend(parent, 'table', id);

    addClasses(e, TABLE_CLASSES);

    if (classes) {
        addClasses(e, classes);
    }

    makeTableHeader(e, headers);

    return e;
}

/**
 * Create a new table body element.
 *
 * @param {HTMLTableElement} parent         the table element that will be the parent
 * @returns {HTMLTableSectionElement}       the newly created table body element
 */
export function createTableBody(parent) {
    return /** @type {HTMLTableSectionElement} */ createAndAppend(parent,'tbody');
}

/**
 * Create a new text input element within a new table cell element.
 *
 * @param {HTMLTableRowElement} parent      the table element that will be the parent
 * @param {string} [id]                     the optional id for the text input element
 * @param {string} [value]                  the optional value for the text input element
 * @param {boolean} [disabled=false]        indicates whether the text input element is disabled
 * @returns {csCellWrapper}                   the table cell wrapper object
 */
export function createTableTextFieldCell(parent, id, value, disabled) {
    let td = createTableCell(parent);
    let e = createTextField(td, id, '', value, false, disabled);

    return {
        'row': parent,
        'cell': td,
        'element': e
    };
}

/**
 * Create a new table cell element with no inner templates.
 *
 * @param {HTMLTableRowElement} parent      the table row element that will be the parent
 * @returns {csCellWrapper}                   the table cell wrapper object, with the element set to null
 */
export function createTableEmptyCell(parent) {
    return {
        'row': parent,
        'cell': createTableCell(parent),
        'element': null
    };
}

/**
 * Create a new span element within a new table cell element.
 *
 * @param {HTMLTableRowElement} parent      the table row element that will be the parent
 * @param {string} [id]                     the optional id for the span element
 * @param {string} [value]                  the optional value for the span element
 * @returns {csCellWrapper}                   the table cell wrapper object
 */
export function createTablePlainTextCell(parent, id, value) {
    let td = createTableCell(parent);
    let e = createSpan(td, id, value);

    return {
        'row': parent,
        'cell': td,
        'element': e
    };
}

/**
 * Create a new select (dropdown) element within a new table cell element.
 *
 * @param {HTMLTableRowElement} parent      the table row element that will be the parent
 * @param {string} [id]                     the optional id for the select element
 * @param {string[]} [values]               the optional list of values for the select element
 * @param {boolean} [selected=false]        indicates whether the text element is selected
 * @param {boolean} [disabled=false]        indicates whether the text element is disabled
 * @returns {csCellWrapper}                   the table cell wrapper object
 */
export function createTableSelectCell(parent, id, values, selected, disabled) {
    let td = createTableCell(parent);
    let e = /** @type {HTMLSelectElement} */ createSelect(td, id, '', false, null);

    if (disabled) {
        e.setAttribute('disabled', 'true');
    }

    for (let thisVal of values) {
        let sel = (thisVal === selected);

        createOption(e, thisVal, thisVal, sel);
    }

    return {
        'row': parent,
        'cell': td,
        'element': e
    };
}

/**
 * Create a new link element within a new table cell element.
 *
 * @param {HTMLTableRowElement} parent      the table row element that will be the parent
 * @param {string} [id]                     the optional id for the link element
 * @param {function} [cbClick]              the onclick callback for the link element
 * @param {string} text                     the text for the link element
 * @returns {csCellWrapper}                   the table cell wrapper object
 */
export function createTableLinkCell(parent, id, cbClick, text) {
    let td = createTableCell(parent);
    let e = createLink(td, id, cbClick, text);

    return {
        'row': parent,
        'cell': td,
        'element': e
    };
}

/**
 * Add an option element to the select element for each item in the specified list.
 *
 * @param {HTMLSelectElement} listElem      the select element to which the options will be added
 * @param {Object[]} items                  the list of item objects to drive the additions
 */
export function addOptions(listElem, items) {
    for (let item of items) {
        createOption(listElem, item.text, item.value, item.selected, item.disabled);
    }
}

const EVENT_CLICK = 'click';
const EVENT_CHANGE = 'change';
const EVENT_KEYUP = 'keyup';
const EVENT_SUBMIT = 'submit';

export function registerClickEvent(elemName, action) {
    registerEvent(elemName, EVENT_CLICK, action);
}

export function registerChangeEvent(elemName, action) {
    registerEvent(elemName, EVENT_CHANGE, action);
}

export function registerKeyupEvent(elemName, action) {
    registerEvent(elemName, EVENT_KEYUP, action);
}

export function registerSubmitEvent(elemName, action) {
    registerEvent(elemName, EVENT_SUBMIT, action);
}

export function registerOtherEvent(elemName, eventName, action) {
    registerEvent(elemName, eventName, action);
}

function registerEvent(elemName, event, action) {
    let e = document.getElementById(elemName);

    if (e) {
        e.addEventListener(event, action);
    } else {
        warn(`Element ${elemName} not found when registering ${event} event`);
    }
}