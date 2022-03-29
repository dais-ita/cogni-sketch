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
 * @file Contains only typedefs, specifically those relating to drag/drop and paste event processing.
 *
 * @author Dave Braines
 **/

/**
 * csDrag - a simple structure to convey any objects that are currently being dragged, their position and the
 * x/y offset values.  Used when computing how to draw nodes and links on the canvas.
 *
 * If more than one object is being dragged, the one whose position is listed in this structure is the one under
 * the mouse/cursor - i.e. the one actually being dragged.
 *
 * @typedef csDrag
 * @type {object}
 * @property {number} nodeX         the x position for the node being dragged.
 * @property {number} nodeY         the y position for the node being dragged.
 * @property {number} x             the x offset for the final drag location relative to the starting point.
 * @property {number} y             the y offset for the final drag location relative to the starting point.
 */

/**
 * csPayload - the payload object for drag/drop and paste events.
 *
 * @typedef csPayload
 * @type {object}
 * @property {string} plainText         the plain text version of the payload.
 * @property {string} [richText]        the optional rich text version of the payload.
 */

/**
 * csDropConfidence - predefined set of 'confidences' which nodes can express when deciding which node can best handle
 * the payload that has been dropped or pasted onto the canvas.
 *
 * @typedef csDropConfidence
 * @type {object}
 * @property {number} CANNOT        should be used by node types that cannot accept the content.
 * @property {number} BY_DEFAULT    used when a node type can accept any content.
 * @property {number} WEAKLY        used when a node type can accept content but other node types may be more exact.
 * @property {number} DEFINITELY    used when a node type is an ideal or exact match for the content.
 */

/**
 * csMatchedType - the best matching palette item and confidence for a given payload.
 *
 * @typedef csMatchedType
 * @type {object}
 * @property {csType} nodeType          the best matched type for the payload
 * @property {number} status            the confidence rating for the match.
 */

/**
 * csPasteItemDictionary - a simple object to capture all of the formats that are available for pasted content.
 *
 * @typedef csPasteItemDictionary
 * @type {object}
 * @property {DataTransferItem} * - all entries in this dictionary contain the operating system paste item.
 */
