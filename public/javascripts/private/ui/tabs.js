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
 * @file Functions defining the 'tabs' section, the initialisation of tabs and panes, and the ability to switch
 * between panes.
 *
 * @author Dave Braines
 **/

import {
    getPane,
    getPanes
} from "/javascripts/private/csData/csDataComponents.js";
import {
    paneContainerTemplate,
    tabLinkTemplate
} from "./templates/uiTemplates.js";
import {error} from "/javascripts/private/util/log.js";
import {
    createHtmlUsing,
    getElement
} from "/javascripts/private/util/dom.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const ELEM_NAVBAR = 'csNavbar';
const ELEM_TABS = 'cs-tabs';
const ELEM_TABS_LIST = 'cs-tabs-list';
const ELEM_TABS_CONTENT = 'cs-tabs-content';

const TAB_HEIGHT_OFFSET = 15;
const TAB_NAME_DEFAULT = 'canvas';

/**
 * Initialise the jQuery tab container by registering the activate function (which is triggered whenever a
 * tab is selected by the user).
 */
export function initialise() {
    //TODO: Normalise this code
    $(function () {
        $(`#${ELEM_TABS}`).tabs({
            activate: function( e, ui ) {
                let tabName = ui.newTab[0].innerText;

                activatePane(tabName);
            }
        });
    });
}

/**
 * Add the specified tab based on the supplied config.  This is called when the page loads and each pane module is
 * initialised.  Each tab/pane requires two elements: the tab in the ribbon (the "tab"), and the pane in the container
 * (the "pane").  Each pane can specify custom html for either of these, otherwise the default html fragments are used.
 *
 * @param {csPaneDefinition} config     the user defined configuration for the pane represented by this tab.
 * @param {number} pos                  the position of the tab within the tab ribbon.
 */
export function addTabFromConfig(config, pos) {
    let htmlConfig = createConfigForTab(config, pos);
    let tabTemplate = config.tabLinkTemplate || tabLinkTemplate;
    let paneTemplate = config.paneContainerTemplate || paneContainerTemplate;

    addTabToRibbon(tabTemplate, htmlConfig);
    addPaneToContainer(paneTemplate, htmlConfig);

    refreshTabsAfterAddition();
}

/**
 * Create the html config object that will drive the handlebars html generation for this tab.
 *
 * @param {csPaneDefinition} config     the user defined configuration for the pane represented by this tab.
 * @param {number} pos                  the position of the tab in the tab ribbon.
 * @return {csTemplateConfig}           the template configuration.
 */
function createConfigForTab(config, pos) {
    let htmlConfig = {
        "outer": true,
        "html": {
            "paneName": config.paneName,
            "closeable": config.closeable,
            "pos": pos
        },
        "events": []
    };

    if (config.closeable) {
        /* the pane is closeable, so create an event to call when the close link is clicked */
        let closeFunc;

        if (config.callbacks && config.callbacks.close) {
            /* there is a custom close event defined for the pane.  Call that, followed be the default. */
            closeFunc = function() {
                config.callbacks.close();
                defaultCloseTab((config.paneName));
            };
        } else {
            /* there is no custom close event defined for the pane, call only the default */
            closeFunc = function() { defaultCloseTab((config.paneName)); };
        }

        htmlConfig.events.push({
            "elemId": `close-tab-${config.paneName}`,
            "event": 'click',
            "function": closeFunc
        });
    }

    return htmlConfig;
}

/**
 * Create a new list item element from the template html, using the specified config, and append this to the
 * tab ribbon element.
 *
 * @param {string} template                 the html template to be used for adding this tab.
 * @param {csTemplateConfig} htmlConfig     the template configuration for this tab.
 */
function addTabToRibbon(template, htmlConfig) {
    let elemTabList = getElement(ELEM_TABS_LIST);

    if (elemTabList) {
        let newElem = document.createElement('LI');
        elemTabList.appendChild(newElem);

        createHtmlUsing(newElem, template, htmlConfig);
    }
}

/**
 * Create a new div element from the template html, using the specified config, and append this to the pane
 * container element.
 *
 * @param {string} template                 the html template to be used for adding this pane.
 * @param {csTemplateConfig} htmlConfig     the template configuration for this pane.
 */
function addPaneToContainer(template, htmlConfig) {
    let elemTabContent = getElement(ELEM_TABS_CONTENT);

    if (elemTabContent) {
        let newElem = document.createElement('DIV');
        elemTabContent.appendChild(newElem);

        createHtmlUsing(newElem, template, htmlConfig);
    }
}

/**
 * After a tab has been added ensure that the tabs are sorted, the specific jQuery code to refresh the tabs is called,
 * and the default pane is brought to the front.
 */
function refreshTabsAfterAddition() {
    sortLinks(ELEM_TABS_LIST);
    sortLinks(ELEM_TABS_CONTENT);

    $('#' + ELEM_TABS).tabs('refresh');

    switchToCanvasPane();
}

/**
 * Sort the child nodes of the specified element, based on the value of the data-pos attribute.
 *
 * @param {string} parentId       the id of the parent dom element within which the children will be sorted.
 */
function sortLinks(parentId) {
    let parent = document.getElementById(parentId);
    let result = [];

    for (let childElem of parent.childNodes) {
        if ((childElem.nodeName === 'LI') || (childElem.nodeName === 'DIV')) {
            result.push(childElem);
        }
    }

    /* sort the elements based on the data-pos attribute, ascending */
    result.sort(function(a, b) {
        let aPos = parseInt(a.getAttribute('data-pos'));
        let bPos = parseInt(b.getAttribute('data-pos'));

        return aPos === bPos
            ? 0
            : (aPos > bPos ? 1 : -1);
    });

    /* append each child back into the parent to achieve the sort */
    /* they are already children, but the appendChild will move them */
    for (let childElem of result) {
        parent.appendChild(childElem);
    }
}

/**
 * Switch to the specified pane.  By switching the tab to be focused, and showing the corresponding pane content.
 *
 * @param {string} paneName     the name of the pane to be shown.
 */
export function switchToPane(paneName) {
    let pane = getPane(paneName);

    if (pane && pane.config) {
        showTab(pane.config.paneName);
        switchToTab(`cs-tab-${pane.config.paneName}`);
    }
}

/**
 * Switch to the canvas pane which is the default pane for this application.
 */
export function switchToCanvasPane() {
    /* the canvas pane may not yet be loaded, so check first */
    if (getPanes()[TAB_NAME_DEFAULT]) {
        switchToPane(TAB_NAME_DEFAULT);
    }
}

/**
 * Send the project load event to any panes that have registered a callback.
 *
 * @param {csProject} project    the project that has been loaded.
 */
export function sendProjectLoadEvent(project) {
    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.projectLoaded) {
            pane.config.callbacks.projectLoaded(project);
        }
    }
}

/**
 * Send the node changed event to any panes that have registered a callback.
 *
 * @param {csNodeEvent} ev      the node event for this change.
 */
export function sendNodeChangedEvent(ev) {
    if (ev && !ev.node) {
        error('Undefined node detected for event', ev);
    }

    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.nodeChanged) {
            pane.config.callbacks.nodeChanged(ev);
        }
    }
}

/**
 * Send the link changed event to any panes that have registered a callback.
 *
 * @param {csLinkEvent} ev      the link event for this change.
 */
export function sendLinkChangedEvent(ev) {
    if (ev && !ev.link) {
        error('Undefined link detected for event', ev);
    }

    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.linkChanged) {
            pane.config.callbacks.linkChanged(ev);
        }
    }
}

/**
 * Send the type changed event to any panes that have registered a callback.
 *
 * @param {csTypeEvent} ev      the type event for this change.
 */
export function sendTypeChangedEvent(ev) {
    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.typeChanged) {
            pane.config.callbacks.typeChanged(ev);
        }
    }
}

/**
 * Send the project changed event to any panes that have registered a callback.
 *
 * @param {csProjectEvent} ev       the project event for this change.
 */
export function sendProjectChangedEvent(ev) {
    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.projectChanged) {
            pane.config.callbacks.projectChanged(ev);
        }
    }
}

/**
 * Send the palette changed event to any panes that have registered a callback.
 *
 * @param {csPaletteEvent} ev       the palette event for this change.
 */
export function sendPaletteChangedEvent(ev) {
    for (let pane of Object.values(getPanes())) {
        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.paletteChanged) {
            pane.config.callbacks.paletteChanged(ev);
        }
    }
}

/**
 * The default function to be called whenever a tab is closed.  Simply hide the tab.
 * This is always called when a tab is closed, but any user defined function (specified in the pane config) will be
 * executed first.
 *
 * @param {string} paneName     the name of the pane which is being closed.
 */
function defaultCloseTab(paneName) {
    hideTab(paneName);
}

/**
 * Hide the tab for the specified pane name.  Simply set the display to none and then switch focus to the canvas pane.
 *
 * @param {string} paneName     the name of the pane for which the tab is to be hidden.
 */
export function hideTab(paneName) {
    let elem = document.getElementById(`csLink${paneName}`);

    if (elem) {
        elem.style.display = 'none';
    }

    switchToCanvasPane();
}

/**
 * Show the tab for the specified pane name.  Simply set the display to inline to make it visible.
 * Note - you must call switchToPane if you wish the tab to also be switched to, and therefore take focus.
 *
 * @param {string} paneName     the name of the pane for which the tab is to be shown.
 */
export function showTab(paneName) {
    let elem = document.getElementById(`csLink${paneName}`);

    if (elem) {
        elem.style.display = 'inline';
    }
}

/**
 * Iterate through each of the tabs, seeking the tab with the specified element id, noting the position.
 * When found, notify the tab container that the tab at this position is the active tab.
 *
 * @param {string} tabElemId    the dom element id for the tab that is to be activated.
 */
function switchToTab(tabElemId) {
    let tabPos = 0;

    for (let tab of $('#' + ELEM_TABS_CONTENT).tabs().children()) {
        if (tab.id) {
            if (tab.id === tabElemId) {
                $('#' + ELEM_TABS).tabs('option', 'active', tabPos);
            }

            tabPos++;
        }
    }
}

/**
 * Return the 'name' of the active tab element.
 *
 * @return {string}    the name of the active tab.
 */
export function activeTabName() {
    let result;
    let elems = $('ul.ui-tabs-nav li.ui-tabs-active');

    if (elems.length === 1) {
        //To get the pure tab name remove the link prefix part
        result = elems[0].id.replace('csLink', '');
    }

    return result;
}

/**
 * To ensure that scroll bars are created correctly (for those panes that require them), ensure that the actual height
 * of the specified pane element is set.
 *
 * @param {string} paneName       the name of the pane that is to have the maximum height set.
 */
export function maximisePaneHeight(paneName) {
    let paneElem = $(`#cs-main-${paneName}`);

    if (paneElem) {
        let paneHeight = window.innerHeight - ($('#' + ELEM_NAVBAR).outerHeight() + $('#' + ELEM_TABS_LIST).outerHeight() + TAB_HEIGHT_OFFSET);

        paneElem.height(paneHeight);
    } else {
        error('Tab element ${elemName} was not found');
    }
}

/**
 * This function is called whenever the tab is activated, e.g. by the user clicking on it, or via the switchToPane
 * function.  Call the 'render' callback for this pane if it is set.
 *
 * @param {string} paneName     the name of the pane that has been activated (shown).
 */
export function activatePane(paneName) {
    let pane = getPane(paneName);

    saveActionMisc('cs:changePane', null, { "paneName": paneName });

    if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.render) {
        pane.config.callbacks.render();
    }
}

/**
 * Return the pane element.  The contents of the pane can be created inside this.
 *
 * @param {string} paneName     the name of the pane who's element should be returned.
 * @return {HTMLDivElement}     the pane element for the specified pane.
 */
export function getPaneElement(paneName) {
    return /** @type HTMLDivElement */ document.getElementById(`cs-main-${paneName}`);
}
