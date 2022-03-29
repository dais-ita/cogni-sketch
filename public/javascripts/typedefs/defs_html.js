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
 * @file Contains only typedefs.  These are related to html rendering/processing and templates.
 *
 * @author Dave Braines
 **/

/**
 * csTemplateConfig - the configuration for the rendering of html, including any number of html specific variables as
 * well as standard properties for event registration and modal focus etc.
 *
 * @typedef csTemplateConfig
 * @type {object}
 * @property {boolean} [outer=false]        if specified generate html into the outerHTML of the parent element,
 *                                          otherwise generate to innerHTML (the default behaviour).
 * @property {string} [modalFocus]          the element id for any element that should have focus after the popup is
 *                                          shown.
 * @property {object} [html]                any name value pairs that will be used by handlebars to replace template
 *                                          variables.
 * @property {csEventRegister[]} [events]   an object with element names as keys.  These contain objects that specify
 *                                          the event name and callback function that would be registered.
 */

/**
 * csEventRegister - a simple structure to convey dom events that need to be registered as part of the template
 * generation process.
 *
 * @typedef csEventRegister
 * @type {object}
 * @property {string} elemId            the dom element id to register the event against.
 * @property {string} event             the name of the event to register.
 * @property {function} function        the callback function to be registered.
 */

/**
 * csCellWrapper - a simple object wrapper for a table cell element, returning the row, cell and inner element within
 * the cell.
 *
 * @typedef csCellWrapper
 * @type {object}
 * @property {HTMLTableRowElement} row      the row element
 * @property {HTMLTableCellElement} cell    the cell element within the row
 * @property {HTMLElement} [element]        the optional DOM element within the cell
 */

/**
 * csEventObject - a simple object defining events to be registered, with the key being the event name and the value being the
 * callback function.
 *
 * @typedef csEventObject
 * @type {object}
 */
//TODO: Complete this
