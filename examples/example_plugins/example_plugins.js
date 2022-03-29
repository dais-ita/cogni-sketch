/**
 * @file This is the list of all plugins to be included in this application.
 *
 * @author Dave Braines

 * Plugins provide additional templates beyond the core application, for example one or more of: new palette types,
 * functions, panes or popups.
 *
 * The plugin structure is as follows:
 *  {string} name               The unique name of the plugin
 *  {object[]} [imports]        A list of any imports (from NodeJS modules that are required to be processed to
 *                              start up to ensure they are made available to the client for usage.  These must
 *                              correlate to modules specified in the package.json file for the plugin.
 *                              Each entry is an object that specifies two properties:
 *                                  root - the relative path to be exposed.
 *                                  path - the location within the plugin structure which will be exposed.
 *  {object[]} [routes]         A list of any server side capabilities that are defined by this plugin and which
 *                              will be made available as server HTTP services for this plugin.  These must
 *                              correlate to server javascript files provided within the plugin folder structure.
 *                              Each entry is an object that specifies two properties:
 *                                  root - the relative path to be exposed.
 *                                  path - the location within the plugin structure which will be exposed.
 *  {string[]} [scripts]        A list of javascript files that will be loaded automatically as the page is loaded,
 *                              these are relative paths inside the plugin folder structure.
 *  {string[]} [panes]          A list of the names of any panes that are provided by this plugin.  This should
 *                              correspond to files within the plugin folder structure that define each pane.
 *                              e.g. "new_pane" corresponds to /panes/new_pane/new_pane.js
 *  {string[]} [actions]        A list of the names of any actions that are provided by this plugin (i.e. new
 *                              palette types with special actions defined).  This should correspond to files within
 *                              the plugin folder structure that define each action.
 *                              e.g. "new_action" corresponds to /actions/new_action.js
 *  {string[]} [functions]      A list of the names of any functions that are provided by this plugin (i.e. new
 *                              function items with special code defined).  This should correspond to files within
 *                              the plugin folder structure that define each function.
 *                              e.g. "new_function" corresponds to /functions/new_function.js
 *  {string[]} [stylesheets]    A list of css stylesheet files that will be loaded automatically as the page
 *                              is loaded.
 *  {object} [creds]            A list of any server-side credentials that are needed for this plugin.  These can be
 *                              any name-value pair within the object, and care should be taken not to commit these
 *                              into any repositories.  They are available only to the server and cannot be accessed
 *                              via HTTP requests from the client (e.g. "list plugins").
 *  {object} [client_creds]     A list of any client-side credentials that are needed for this plugin.  These can be
 *                              any name-value pair within the object, and care should be taken not to commit these
 *                              into any repositories.  They are provided to the client encrypted within the cookie
 *                              and can be decrypted and accessed by any client code running within the application.
 **/

/** Module exports */
module.exports = {
    "core": {
        "panes": [ 'canvas', 'table', 'admin', 'help' ],
        "actions": [ 'email', 'file', 'image', 'text', 'video', 'web', 'json' ],
        "functions": [ ]
    },
    "paneOrder": [ 'canvas', 'table', 'admin', 'help' ],
    "plugins": [ ]
};
