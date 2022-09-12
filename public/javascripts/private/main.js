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
 * @file The main entry point into the applications.  These functions ensure that the application is rendered
 * correctly and that all user defined extensions (defined in plugins) are included and loaded.
 *
 * @author Dave Braines
 **/

import {
    getActions,
    getFunctions,
    getPanes,
    setPlugins
} from "/javascripts/private/csData/csDataComponents.js";
import {
    debug,
    error,
    warn
} from "/javascripts/private/util/log.js";
import {httpGet} from "/javascripts/private/util/http.js";
import {
    finishedLoad,
    initialise as initialiseUi
} from "/javascripts/private/ui/ui.js";
import {listProjects} from "/javascripts/private/ui/project/project.js";
import {
    addTabFromConfig,
    hideTab,
    initialise as initialiseTabs,
    maximisePaneHeight
} from "/javascripts/private/ui/tabs.js";
import {getFromCookie} from "/javascripts/private/csData/csDataCookie.js";

import {listPalettes} from "/javascripts/private/ui/palette/types.js";
import {listFunctions} from "/javascripts/private/ui/palette/functions.js";
import {
    getSessionDebug,
    getSessionIsAdmin,
    setSessionDebug,
    setSessionIsAdmin,
    setSessionUserName,
    setSessionVersion
} from "/javascripts/private/csData/csDataSession.js";
import {
    initialise as internationalizeInit,
    localize
} from "/javascripts/private/util/internationalization.js";

import {eventSetProperty} from "/javascripts/private/core/core_panes/canvas/events/triggered.js";

const COOKIE_USERNAME = 'userName';

/* the url that is used to request all plugin details for this application */
const URL_PLUGIN_LIST = '/plugin/list/';

/* these counters are used to track the status of the various dynamic components.  They are set to the required
 * value and decreased each time a component is loaded.  When they all reach zero then all dynamic components are
 * loaded and the application requests can be made.
 */
let actionCount = 0;
let functionCount = 0;
let paneCount = 0;
let scriptOrderedList;

/**
 * Call the initialise function when the window has loaded.
 */
window.onload = function() {
    initialise(getSessionDebug());

    //TODO: Add more events here when defined
    document.eventSetProperty = eventSetProperty;
};

/**
 * Initialise the application.
 *
 * This is the only method directly called when the page is loaded, and only needs to be called at first initialisation,
 * with the reset method being used during operations such as loading different projects.
 *
 * A summary of the initialisation sequence is:
 *      initialise() - called from window.onload
 *      afterInternationalisation() - called when internationalisation libraries are loaded
 *      afterAllDynamicImports() - called when all plugins have been loaded
 */
function initialise(debug) {
    internationalizeInit(afterInternationalisation, debug);
}

/**
 * The loading of the internationalisation scripts has completed, meaning that the various error/warning/debug messages
 * are now available, so proceed with the rest of the initialisation and import the dynamic content (panes, actions
 * and functions).
 */
function afterInternationalisation() {
    initialiseUi();

    doDynamicImports();
}

/**
 * This is called only when all dynamic imports (panes, actions and functions) have been loaded.  The application is
 * now ready, so initialise the tabs and list all of the overall components (projects, palettes and functions).
 */
function afterAllDynamicImports() {
    initialiseTabs();
    listProjects();
    listPalettes();
    listFunctions();
    finishedLoad();
}

/**
 * Every time a component (action, function or pane) is loaded this method is called to check whether all have been
 * loaded, only calling afterAllDynamicImports once everything is fully loaded.
 */
function testForAllComponentsLoaded() {
    let aDone = allActionModulesLoaded();
    let fDone = allFunctionModulesLoaded();
    let pDone = allPanesLoaded();

    if (aDone && fDone && pDone) {
        afterAllDynamicImports();
    }
}

/**
 * Request the list of plugins from the server, passing the result to a callback.
 */
function doDynamicImports() {
    httpGet(URL_PLUGIN_LIST, cbLoadPlugins);
}

/**
 * The list of plugins is returned from the server.  Set various session properties and process each of the plugins,
 * loading extra resources as needed.
 *
 * @param {csPluginResponse} response     the list of plugins from the server.
 */
function cbLoadPlugins(response) {
    setSessionProperties(response);
    processPlugins(response);
}

/**
 * Store the session information:
 *      user name - retrieved from the cookie.
 *      admin - retrieved from the plugin response (indicates if this is an admin user).
 *      debug - retrieved from the plugin response.
 *      version - retrieved from the plugin response.
 * Note that the debug is initially set based on the server debug mode, but can be overridden separately on the client,
 * initially by setting a value in settings.js, and also by changing the 'debug' checkbox in the application menu.
 * All of these only affect the client debug status - the server debug is maintained separately.
 *
 * @param {csPluginResponse} response     the list of plugins from the server.
 */
function setSessionProperties(response) {
    setSessionUserName(getFromCookie(COOKIE_USERNAME));
    setSessionIsAdmin(response.isAdmin);
    setSessionDebug(response.debug); /* the client debug can be set separately to the server debug */
    setSessionVersion(response.version);
}

/**
 * Process each of the plugins in the list of plugins from the server and store each within the session storage.
 * Each plugin may define one or more panes, actions or functions and may require scripts or stylesheets to be loaded.
 * Prior to processing any of the dynamic plugins, ensure that the standard plugins are loaded (although all requests
 * are asynchronous so the plugins will be processed in any order).
 *
 * @param {csPluginResponse} response     the list of plugins from the server.
 */
function processPlugins(response) {
    setPlugins(response.plugins);

    loadStandardComponents(response.paneOrder, response.core);
    loadDynamicComponents(response);
}

/**
 * Load the standard components (panes, actions, functions) with the panes being listed in the specified order.
 *
 * @param {string[]} paneOrder      the list of all (core and plugin) pane names that defines the order they
 *                                  should be listed in.
 * @param {object} coreLists        the list of all standard components.
 */
function loadStandardComponents(paneOrder, coreLists) {
    loadStandardPanes(paneOrder, coreLists.panes);
    loadStandardActions(coreLists.actions);
    loadStandardFunctions(coreLists.functions);
}

/**
 * Iterate through each of the standard 'actions' (palette items) and load the required file from the predefined
 * location.  Pass in the list of actions in the session storage so that the newly loaded action can be added to it.
 *
 * @param {string[]} actionList       the list of all standard action names.
 */
function loadStandardActions(actionList) {
    for (let actionName of actionList) {
        loadActionModule(actionName, `/javascripts/private/core/core_types/${actionName}/actions/${actionName}.js`, getActions());
    }
}

/**
 * Load the 'action' (palette item) module from the specified path, and store the result in the specified storage.
 * Report any errors and increment the counter whether successful or not.
 *
 * @param {string} moduleName       the name of the action module to be loaded.
 * @param {string} jsFileName       the full javascript filename that will be imported.
 * @param {Module[]} storage        the storage within which to store the successfully loaded module.
 */
function loadActionModule(moduleName, jsFileName, storage) {
    if (!storage[moduleName]) {
        actionCount++;
        import(jsFileName)
            .then(module => {
                if (!storage[moduleName]) {
                    storage[moduleName] = module;

                    loadedActionModule(moduleName);
                }
            })
            .catch(err => {
                /* the module failed to load.  Report the error and set the module to undefined. */
                error(localize('messages.actions.load_error', { "moduleName": moduleName }), err);

                storage[moduleName] = undefined;
                testForAllComponentsLoaded();   /* this may be the last component to be loaded - check */
            });
    }
}

/**
 * The action module has been successfully loaded.  Test whether all components are now loaded.
 *
 * @param {string} moduleName       the name of the action module that was successfully loaded.
 */
function loadedActionModule(moduleName) {
    debug(localize('messages.actions.loaded_module', { "moduleName": moduleName }));

    testForAllComponentsLoaded(); /* this may be the last component to be loaded - check */
}

/**
 * Iterate through each of the standard 'functions' (palette functions) and load the required file from the predefined
 * location.  Pass in the list of functions in the session storage so that the newly loaded function can be added to it.
 *
 * @param {string[]} functionList           the list of all standard function names.
 */
function loadStandardFunctions(functionList) {
    for (let functionName of functionList) {
        loadFunctionModule(functionName, `/javascripts/private/core/core_functions/${functionName}/${functionName}.js`, getFunctions());
    }
}

/**
 * Load the 'function' (palette function) module from the specified path, and store the result in the specified storage.
 * Report any errors and increment the counter whether successful or not.
 *
 * @param {string} moduleName       the name of the function module to be loaded.
 * @param {string} jsFileName       the full javascript filename that will be imported.
 * @param {Module[]} storage        the storage within which to store the successfully loaded module.
 */
function loadFunctionModule(moduleName, jsFileName, storage) {
    if (!storage[moduleName]) {
        ++functionCount;
        import(jsFileName)
            .then(module => {
                if (!storage[moduleName]) {
                    storage[moduleName] = module;

                    loadedFunctionModule(moduleName);
                }
            })
            .catch(err => {
                /* the module failed to load.  Report the error and set the module to undefined. */
                error(localize('messages.functions.load_error', { "moduleName": moduleName }), err);

                storage[moduleName] = undefined;
                testForAllComponentsLoaded();   /* this may be the last component to be loaded - check */
            });
    }
}

/**
 * The function module has been successfully loaded.  Test whether all components are now loaded.
 *
 * @param {string} moduleName       the name of the function module that was successfully loaded.
 */
function loadedFunctionModule(moduleName) {
    debug(localize('messages.functions.loaded_module', { "moduleName": moduleName }));

    testForAllComponentsLoaded();   /* this may be the last component to be loaded - check */
}

/**
 * Iterate through each of the standard 'panes' and load the required file from the predefined location.  Pass in the
 * list of panes in the session storage so that the newly loaded pane can be added to it.

 * @param {string[]} paneOrder      the list of all (core and plugin) pane names that defines the order they
 *                                  should be listed in.
 * @param {string[]} paneList       the list of all standard pane names.
 */
function loadStandardPanes(paneOrder, paneList) {
    for (let pane of paneList) {
        loadStandardPane(pane, paneOrder);
    }
}

/**
 * Load this standard pane, at the position indicated by the location of the pane name within the paneOrder list.
 *
 * @param {string} paneName         the name of the pane being loaded.
 * @param {string[]} paneOrder      the list of pane names that defines the order they should be listed in.
 */
function loadStandardPane(paneName, paneOrder) {
    let pos = paneOrder.indexOf(paneName);

    loadPaneModule(paneName, `/javascripts/private/core/core_panes/${paneName}/${paneName}.js`, getPanes(), pos);
}

/**
 * Load the 'pane' module from the specified path, and store the result in the specified storage.
 * Report any errors and increment the counter whether successful or not.
 * This will also add the tab to the user interface, call the initialise method (if present), maximise the
 * pane height and hide the tab, depending on the settings specified for the pane.
 *
 * @param {string} moduleName       the name of the pane module to be loaded.
 * @param {string} jsFileName       the full javascript filename that will be imported.
 * @param {Module[]} storage        the storage within which to store the successfully loaded module.
 * @param {number} pos              the position of the tab within the tab ribbon.
 */
function loadPaneModule(moduleName, jsFileName, storage, pos) {
    if (!storage[moduleName]) {
        ++paneCount;
        import(jsFileName)
            .then(module => {
                if (!storage[moduleName]) {
                    storage[moduleName] = module;

                    if (pos === -1) {
                        warn(localize('messages.panes.no_position', { "paneName": moduleName }));
                    }

                    if (module.config) {
                        if (!module.config.adminOnly || getSessionIsAdmin()) {
                            addTabFromConfig(module.config, pos);
                            if (module.config.hidden) {
                                hideTab(module.config.paneName);
                            }

                            maximisePaneHeight(module.config.paneName);

                            if (module.config.callbacks && module.config.callbacks.initialise) {
                                module.config.callbacks.initialise();
                            }
                        }
                    }

                    loadedPaneModule(moduleName);
                }
            })
            .catch(err => {
                /* the module failed to load.  Report the error and set the module to undefined. */
                error(localize('messages.panes.not_loaded', { "paneName": moduleName }), err);

                storage[moduleName] = undefined;
                testForAllComponentsLoaded();   /* this may be the last component to be loaded - check */
            });
    }
}

/**
 * The pane module has been successfully loaded.  Test whether all components are now loaded.
 *
 * @param {string} moduleName       the name of the pane module that was successfully loaded.
 */
function loadedPaneModule(moduleName) {
    debug(localize('messages.panes.loaded', { "paneName": moduleName }));

    testForAllComponentsLoaded();   /* this may be the last component to be loaded - check */
}

/**
 * Load the dynamic components (panes, actions, functions) with the panes being listed in the specified order.
 * These plugins are defined as a result of the response from the server and there can be any number of these.
 * For each plugin there may be one or more of the following that need to be loaded:
 *     Panes
 *     Actions
 *     Functions
 *     Stylesheets
 *     (Scripts) - these are handled at the end of all plugin processing since they may have dependencies that
 *     require them to be loaded in a specific order.
 *
 * @param {csPluginResponse} response      the list of dynamic plugins from the server.
 */
function loadDynamicComponents(response) {
    for (let plugin of response.plugins) {
        loadPluginStylesheets(plugin);
        loadPluginPanes(plugin, response.paneOrder);
        loadPluginActions(plugin);
        loadPluginFunctions(plugin);
    }

    specialScriptProcessing(response);
}

/**
 * If the plugin defines any stylesheets (css files) then add each of these to the document head, with the relevant
 * absolute or relative path specified.  By adding these in this way the browser will load the css resources in the
 * usual way.  Comments are also added to show which stylesheets were loaded for each plugin.
 *
 * @param {csPlugin} plugin     the plugin that is being processed.
 */
function loadPluginStylesheets(plugin) {
    if (plugin.stylesheets) {
        /* First add a comment to the page head */
        let commentText = localize('messages.plugins.stylesheet_imports', { "pluginName": plugin.name })
        let comment = document.createComment(commentText);
        document.head.appendChild(comment);

        /* Then iterate through each of the stylesheets */
        for (let style of plugin.stylesheets) {
            let link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';

            if (style.startsWith('/')) {
                /* Absolute path - imported external library via npm */
                link.href = style;
            } else {
                /* Relative path - user defined stylesheet located within plugin */
                link.href = `/plugins/${plugin.name}/stylesheets/${style}`;
            }

            document.head.appendChild(link);
        }
    }
}

/**
 *
 * @param {csPlugin} plugin         the plugin that is being processed.
 * @param {string[]} paneOrder      the list of pane names that defines the order they should be listed in.
 */
function loadPluginPanes(plugin, paneOrder) {
    if (plugin.panes) {
        for (let pane of plugin.panes) {
            let jsPaneFn = `/plugins/${plugin.name}/panes/${pane}/${pane}.js`;
            let pos = paneOrder.indexOf(pane);

            loadPaneModule(pane, jsPaneFn, getPanes(), pos);
        }
    }
}

/**
 * If the plugin defines any actions then load (import) the specified script file in the usual way.
 *
 * @param {csPlugin} plugin     the plugin that is being processed.
 */
function loadPluginActions(plugin) {
    if (plugin.actions) {
        for (let action of plugin.actions) {
            let jsActionFn = `/plugins/${plugin.name}/actions/${action}.js`;

            loadActionModule(action, jsActionFn, getActions());
        }
    }
}

/**
 * If the plugin defines any functions then load (import) the specified script file in the usual way.
 *
 * @param {csPlugin} plugin     the plugin that is being processed.
 */
function loadPluginFunctions(plugin) {
    if (plugin.functions) {
        for (let fn of plugin.functions) {
            let jsFunctionFn = `/plugins/${plugin.name}/functions/${fn}.js`;

            loadFunctionModule(fn, jsFunctionFn, getFunctions());
        }
    }
}

/**
 * External or additional javascript files (i.e. not standard pane/action/function javascript) is loaded in sequence
 * and is therefore processed separately after all dynamic modules have been requested.  This is because some scripts
 * may have dependencies on other and therefore the order or loading is important.
 *
 * This means that the plugins are iterated through again, identifying any scripts for each plugin, and loading these
 * as encountered, to ensure the correct order is preserved.
 *
 * @param {csPluginResponse} response     the list of plugins from the server.
 */
function specialScriptProcessing(response) {
    let scriptList = [];

    for (let plugin of response.plugins) {
        if (plugin.scripts) {
            loadPluginScripts(plugin, scriptList);
        }
    }

    if (scriptList.length > 0) {
        processScriptList(scriptList);
    }
}

/**
 * Create a sequence of scripts to be loaded, with the processing of the next script in the list triggered by the
 * 'onload' event of the previous script.  This means that all required scripts are loaded in order and synchronously,
 * i.e. only after the previous script is loaded.
 *
 * @param {csPlugin} plugin             the plugin that is currently being processed.
 * @param {csScript[]} scriptList       the list of all scripts that need to be loaded.
 */
function loadPluginScripts(plugin, scriptList) {
    /* Scripts must be loaded in the correct order and in some cases previous scripts must have completed
    loading before the next is loaded (e.g. Coco-SSD and Tensorflow).  So all plugins are processed,
    building a list of scripts that must be loaded, in the order they are encountered in the plugin config.
    These are then loaded synchronously using the script.onload event. */
    if (plugin.scripts) {
        for (let js of plugin.scripts) {
            let script = document.createElement('SCRIPT');

            script.onload = function () {
                loadNextScript();
            };
            script.src = js;

            scriptList.push({ "pluginName": plugin.name, "script": script });
        }
    }
}

/**
 * Start the sequential loading of scripts by setting the local variable to the full list and requesting the
 * processing of the first item.
 *
 * @param {csScript[]} scriptList       the list of all scripts that need to be loaded.
 */
function processScriptList(scriptList) {
    scriptOrderedList = scriptList;

    loadScripts();
}

/**
 * Triggered when the previous script in the list has been loaded.  If there are more scripts to process then
 * continue with the processing.
 */
function loadNextScript() {
    if (scriptOrderedList.length > 0) {
        loadScripts();
    }
}

/**
 * If the list is not empty, get the first item in the list, remove it from the list, append the dom script element
 * (and a comment with the name of the plugin requesting the script) and append it to the document head so that the
 * browser loads the script in the usual way.
 *
 * The 'onload' event will be called upon successful completion after which the process will be repeated.
 */
function loadScripts() {
    if (scriptOrderedList.length > 0) {
        let thisScript = scriptOrderedList[0];

        scriptOrderedList.shift();

        let commentText = localize('messages.plugins.javascript_imports', { "pluginName": thisScript.pluginName })
        let comment = document.createComment(commentText);
        document.head.appendChild(comment);
        document.head.appendChild(thisScript.script);

        /* See earlier comment - this will recursively load all of the scripts in the list, synchronously.  Using the
        'onload' event specified previously. */
    }
}

/**
 * Returns true only when the number of successfully loaded actions equals the number of actions that need to be loaded.
 * (i.e. when all required actions have been loaded).
 *
 * @return {boolean}    whether all required actions have been loaded.
 */
function allActionModulesLoaded() {
    return (actionCount === Object.keys(getActions()).length);
}

/**
 * Returns true only when the number of successfully loaded functions equals the number of functions that need to be
 * loaded.  (i.e. when all required functions have been loaded).
 *
 * @return {boolean}    whether all required functions have been loaded.
 */
function allFunctionModulesLoaded() {
    return (functionCount === Object.keys(getFunctions()).length);
}

/**
 * Returns true only when the number of successfully loaded panes equals the number of panes that need to be loaded.
 * (i.e. when all required panes have been loaded).
 *
 * @return {boolean}    whether all required panes have been loaded.
 */
function allPanesLoaded() {
    return (paneCount === Object.keys(getPanes()).length);
}
