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
 * @file Defines the core help pane.
 *
 * @author Dave Braines
 **/

import {getPlugins} from "/javascripts/private/csData/csDataComponents.js";
import {helpTemplate} from "./templates/helpTemplate.js";
import {registerClickEvent} from "/javascripts/private/util/dom.js";
import {switchToPane} from "/javascripts/private/ui/tabs.js";
import {getSessionVersion} from "/javascripts/private/csData/csDataSession.js";
import {getPaneElement} from "/javascripts/private/ui/tabs.js";
import {
    getElement,
    createHtmlUsing
} from "/javascripts/private/util/dom.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * The standard definition for this pane.
 *
 * @type {csPaneDefinition}
 */
export const config = {
    "paneName": 'Help',
    "callbacks": {
        "initialise": cbInitialise,
        "render": cbRender
    }
};

const ELEM_SHOW_HELP = 'cs-show-help';
const ELEM_SHOW_VERSION = 'cs-show-version';
const ELEM_VERSIONS = 'cs-help-versions';

const LINKS = {
    "cs-help-link-001": 'mailto:dave_braines@uk.ibm.com',
    "cs-help-link-002": 'https://youtu.be/KmaheXO6D9M',
    "cs-help-link-003": 'https://youtu.be/wAzjZeG3jWc',
    "cs-help-link-004": 'https://youtu.be/G0XGj_Dcvfw',
    "cs-help-link-005": 'https://youtu.be/FH0ff6S2-NY',
    "cs-help-link-006": 'https://youtu.be/kZ3YE6bxGJM',
    "cs-help-link-007": 'https://youtu.be/Hi7uXXqTJg8',
    "cs-help-link-008": 'https://youtu.be/jNGE737n3RA',
    "cs-help-link-009": 'https://youtu.be/i6PudsmgRaw',
    "cs-help-link-010": 'https://www.google.co.uk/maps/place/New+York,+NY,+USA/@40.6974034,-74.1197635,11z/data=!3m1!4b1!4m5!3m4!1s0x89c24fa5d33f083b:0xc80b8f06e177fe62!8m2!3d40.7127753!4d-74.0059728',
    "cs-help-link-011": 'https://youtu.be/kZ3YE6bxGJM',
    "cs-help-link-012": 'https://twitter.com/Interior/status/1359210208090853377',
    "cs-help-link-013": 'https://github.ibm.com/dave-braines/cogni-sketch'
}

/**
 * @type {boolean}      when true, any attempt to switch to the help pane will scroll to the versions section.
 */
let scrollToVersions = false;

/**
 * Called when the pane is first loaded.  Register events elsewhere in menus that switch to the help pane.
 */
function cbInitialise() {
    registerClickEvent(ELEM_SHOW_HELP, actionShowHelp);
    registerClickEvent(ELEM_SHOW_VERSION, actionShowVersions);
}

/**
 * Called when the pane is rendered.  Load the help page content from the template into the pane.
 */
function cbRender() {
    let elem = getPaneElement(config.paneName);

    if (elem) {
        createHtmlUsing(elem, helpTemplate, createConfigForHelpPane());

        /* if the request was to see the version info then this will ensure the scroll to that element occurs */
        doScroll();
    }
}

/**
 * Create the configuration for this help pane, including all the plugin version.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function createConfigForHelpPane() {
    let config = {
        "html": {
            "applicationVersion": getSessionVersion(),
            "plugins": []
        },
        "events": []
    };

    for (let plugin of getPlugins()) {
        let link = '';
        let version = '';

        if (plugin.package) {
            version = plugin.package.version;

            if (plugin.package.repository && plugin.package.repository.url) {
                link = plugin.package.repository.url;
            }
        }

        config.html.plugins.push({
            "name": plugin.name,
            "link": link,
            "version": version
        });
    }

    for (let [elemId, url] of Object.entries(LINKS)) {
        config.events.push({ "elemId": elemId, 'event': 'click', 'function': function() { actionOpenLink(url); } });
    }

    return config;
}

function actionOpenLink(url) {
    saveActionMisc('help:openLink', null, { "url": url });

    window.open(url, '_blank').focus();
}

/**
 * If the scroll flag is set then attempt to scroll to the version element (if the page is already loaded).
 */
function doScroll() {
    if (scrollToVersions) {
        let eVersions = getElement(ELEM_VERSIONS);

        if (eVersions) {
            eVersions.scrollIntoView(true);
        }
    }
}

/**
 * The help pane has been requested, so switch to it.  The version location was not requested.
 */
function actionShowHelp() {
    saveActionMisc('cs:showHelp');

    switchToPane(config.paneName);
    scrollToVersions = false;
}

/**
 * The version section within the help pane has been requested, so switch to it and set the version flag.
 */
function actionShowVersions() {
    saveActionMisc('cs:showVersions');

    switchToPane(config.paneName);
    scrollToVersions = true;
    doScroll();
}
