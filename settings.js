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
 * @file The main settings for this application.
 *
 * This is executed only when the application is started.
 *
 * @author Dave Braines
 **/

/** Module exports */
module.exports = {
    // Set this to switch on debugging for the server (see core_settings.js for the client debug flag)
    "debug": false,

    // The codepage for files and data processed by the server
    "codepage": "utf-8",

    // The locale to use for internationalized messages
    "locale": "en",

    // The text to be used in the browser page title
    "pageTitle": "Cogni-sketch",

    // Whether this is a live (production) environment
    "live": false,

    // The name of the environment - will be prepended to the browser page title if live=false
    "environment": "local",

    // For each defined environment, the tcp port that the Cogni-Sketch web server is listening on
    "ports": {
        "live": 80,
        "dev": process.env.PORT || 5010
    },

    // Security related settings
    "security": {
        // The number of SALT rounds to use for bcrypt password encryption
      "salt_rounds": 10,
      "min_password_length": 5
    },

    // The folder within this application where general (non-user specific) data will be saved.
    // You must create this manually.
    "general_folder": "/data/general/",

    // The folder within this application where data (e.g. projects, palettes, functions) will be saved.
    // You must create this manually.
    "persist_folder": "/data/saves/",

    // The relative name of the folder where all palettes for a user are saved.
    "palette_folder": "_palettes",

    // The maximum size of HTTP POST body data that will be accepted by the server, e.g. for saving images or files.
    "request_body_size_limit": "100mb",

    // The name of the default palette
    "default_palette": "default",

    // Whether to backup the project every time it is saved
    "backup_projects": true
};
