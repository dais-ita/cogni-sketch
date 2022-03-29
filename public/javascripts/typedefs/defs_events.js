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
 * @file Contains only typedefs, specifically those relating to the internal event processing system.
 *
 * @author Dave Braines
 **/

/**
 * csContext - the standard application context object.
 *
 * @typedef csContext
 * @type {object}
 * @property {string} name          the name of this application canvas event.
 * @property {Event} [event]        a standard DOM event, provided for add full/empty/special events.
 * @property {csNode} node          the node that this event relates to.
 * @property {csType} type          the palette type that corresponds to this node.
 * @property {string} [payload]     the payload for the event.  Is absent for addEmpty and addExisting events.
 * @property {string[]} [options]   a list of possible response options, for canHandle events only.
 */

/**
 * csPaletteEvent - the universal event object for a palette change.
 *
 * @typedef csPaletteEvent
 * @type {object}
 * @property {csPalette} palette        The palette that is the subject of this event.
 * @property {string} change            The identifier for the type of change.
 * @property {string} [previousValue]   Any previous value that applied before this change was applied.
 * @property {string} [id]              Any id or value for the new value for this change.
 */

/**
 * csProjectEvent - the universal event object for a project change.
 *
 * @typedef csProjectEvent
 * @type {object}
 * @property {csProject} project        The project that is the subject of this event.
 * @property {string} change            The identifier for the type of change.
 * @property {string} [previousValue]   Any previous value that applied before this change was applied.
 * @property {string} [id]              Any id or value for the new value for this change.
 */

/**
 * csTypeEvent - the universal event object for a type change.
 *
 * @typedef csTypeEvent
 * @type {object}
 * @property {csType} type                      The type that is the subject of this event.
 * @property {string} change                    The identifier for the type of change.
 * @property {string|object} [previousValue]    Any previous value that applied before this change was applied.
 * @property {string} [id]                      Any id or value for the new value for this change.
 */

/**
 * csLinkEvent - the universal event object for a link change.
 *
 * @typedef csLinkEvent
 * @type {object}
 * @property {csLink} link          - the link that is the subject of this event.
 * @property {string} change        - the identifier for the type of change.
 * @property {*} [previousValue]    - the previous value before this change was applied.
 * @property {string} [id]          - any id or value for the new value for this change.
 */

/**
 * csNodeEvent - the universal event object for a node change.
 *
 * @typedef csNodeEvent
 * @type {object}
 * @property {csNode} node          - the node that is the subject of this event.
 * @property {string} change        - the identifier for the type of change.
 * @property {*} [previousValue]    - the previous value before this change was applied.
 * @property {string} [id]          - any id or value for the new value for this change.
 */
