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
 * @file Contains only typedefs, specifically those relating to the plugin architecture, specifically:
 *      plugins - csPlugin, csPackage, csScript, csPluginResponse
 *      panes - csPane, csPaneDefinition, csPaneCallbacks
 *          (plus callbacks of csCbPaneInitialise, csCbPaneRender, csCbPaneClear, csCbPaneClose)
 *      scripts
 *      callbacks
 *
 * @author Dave Braines
 **/

/**
 * csPlugin - a standard structure for the definition of any plugin (pane, action, function) within the application.
 *
 * @typedef csPlugin
 * @type {object}
 * @property {string} name              the name of the plugin.  Must be unique across all plugins.
 * @property {csPackage} package        details of the package for this plugin (taken from package.json for the plugin).
 * @property {string[]} [stylesheets]   a list of stylesheet urls (absolute or relative) which need to be loaded.
 * @property {string[]} [panes]         a list of pane script urls which need to be loaded.
 * @property {string[]} [actions]       a list of action script urls which need to be loaded.
 * @property {string[]} [functions]     a list of function script urls which need to be loaded.
 * @property {string[]} [scripts]       a list of additional javascript urls which need to be loaded.
 */

/**
 * csPackage - a standard structure for the plugin package.
 *
 * @typedef csPackage
 * @type {object}
 * @property {string} repository        the repository for this plugin.
 */

/**
 * csScript - a simple structure for defining a javascript resource that needs to be loaded.
 *
 * @typedef csScript
 * @type {object}
 * @property {string} pluginName    the name of the plugin that requires this script.
 * @property {HTMLElement} script   the html 'script' dom element with the url of the script that is needed.
 */

/**
 * csPluginResponse - the standard server response structure for listing all plugins.
 *
 * @typedef csPluginResponse
 * @type {object}
 * @property {boolean} isAdmin      whether the logged in user is an administrator.
 * @property {boolean} debug        whether the server is in debug mode.
 * @property {string} version       the version of this application (from package.json).
 * @property {object} core          an object containing the lists of core panes, functions and actions.
 * @property {string[]} paneOrder   an array of pane names, indicating the order in which they should be rendered.
 * @property {csPlugin[]} plugins   the list of plugins for this application.
 */

/**
 * csPane - a user interface pane within the system.  Imported as a module.
 *
 * @typedef csPane
 * @type {object}
 * @property {object} config        the configuration details for this pane.
 */

/**
 * csPaneDefinition - a structure to represent the definition of a pane for inclusion in the application
 * (as a standard or plugin pane).
 *
 * @typedef csPaneDefinition
 * @type {object}
 * @property {string} paneName                  the name of this pane.  Will be used on the tab and must be unique.
 * @property {string} [tabLinkTemplate]         the template html to be used when rendering the tab in the ribbon.
 * @property {string} [paneContainerTemplate]   the template html to be used when rendering the pane in the container.
 * @property {boolean} [hidden=false]           the pane will be initially hidden if this is set to true.
 * @property {boolean} [closeable=false]        the tab will be rendered with a close icon if this is set to true.
 * @property {csPaneCallbacks} callbacks        the list of functions to be called back for each application event.
 */

/**
 * csPaneCallbacks - a structure to represent the callbacks that can be registered for any pane.
 *
 * @typedef csPaneCallbacks
 * @type {object}
 * @property {csCbPaneInitialise} [initialise]      the function to call when the initialise event is sent.
 * @property {csCbPaneRender} [render]              the function to call when the render event is sent.
 * @property {csCbPaneClear} [clear]                the function to call when the clear event is sent.
 * @property {csCbPaneClose} [close]                the function to call when the close event is sent.
 */

/**
 * csCbPaneInitialise - callback for pane initialisation.
 *
 * @callback csCbPaneInitialise
 */

/**
 * csCbPaneRender - callback for pane rendering.
 *
 * @callback csCbPaneRender
 */

/**
 * csCbPaneClear - callback for pane clearing.
 *
 * @callback csCbPaneClear
 */

/**
 * csCbPaneClose - callback for pane closing.
 *
 * @callback csCbPaneClose
 */
