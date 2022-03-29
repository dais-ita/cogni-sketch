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
 * @file Public interface functions relating to placing of nodes,links or other material on the canvas and other panes.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    collapseNode as doCollapseNode,
    htmlIconForNode as doHtmlIconForNode,
    putHtmlAsDetail as doPutHtmlAsDetail,
    putImageAsDetail as doPutImageAsDetail,
    putLinkAsDetail as doPutLinkAsDetail,
    putScript as doPutScript,
    putTextAsDetail as doPutTextAsDetail
} from "/javascripts/private/core/graphics.js";
import {
    computeRadialPosFrom as doComputeRadialPosFrom,
    getCanvasPosFromNodePos
} from "/javascripts/private/util/coords.js";

/**
 * Return html that represents the specified node visually, as if it were rendered on the canvas.
 *
 * @param {csNode} tgtNode      the node to be rendered.
 * @param {string} [elemId]     the id to be used for the clickable link element.
 * @returns {string}            the generated html.
 */
export function htmlIconForNode(tgtNode, elemId) {
    return doHtmlIconForNode(tgtNode, elemId);
}

/**
 * Put the specified html as the detail for the specified node on the canvas.
 * Use this when you wish to render detailed templates (as html) as the details for any node.
 *
 * @param {csNode} tgtNode          the node to which this detail will be added.
 * @param {string} html             the html that will be inserted into the detail.
 * @param {number} [width]          the optional width in pixels for the detail.
 * @param {string[]} [cssClasses]   an optional list of css classes to be used.
 * @param {boolean} [allowClicks]   whether to prevent disabling of pointer events.
 */
export function putHtml(tgtNode, html, width, cssClasses, allowClicks) {
    doPutHtmlAsDetail(tgtNode, html, width, cssClasses, allowClicks);
}

/**
 * Put the specified image url as an image in the detail for the specified node on the canvas.
 * Use this when you wish to render a simple image as the details for any node.
 *
 * @param {csNode} tgtNode          the node to which this detail will be added.
 * @param {string} url              the url for the image that will be inserted into the detail.
 * @param {string} [title]          the optional title (alt text) for this image.
 * @param {number} [width]          the optional width in pixels for the detail.
 */
export function putImage(tgtNode, url, title, width) {
    doPutImageAsDetail(tgtNode, url, title, width);
}

/**
 * Put the specified hyperlink as the detail for the specified node on the canvas.
 * Use this when you wish to render a single hyperlink as the details for any node.
 *
 * @param {csNode} tgtNode          the node to which this detail will be added.
 * @param {string} url              the url for the link that will be inserted into the detail.
 * @param {string} text             the text for the link that will be inserted into the detail.
 * @param {number} [width]          the optional width in pixels for the detail.
 */
export function putLink(tgtNode, url, text, width) {
    doPutLinkAsDetail(tgtNode, url, text, width);
}

/**
 * Put the specified text in the detail for the specified node.
 * Use this when you wish to render a body of text (including html) as the details for any node.
 *
 * @param {csNode} tgtNode                  the node to which this detail will be added.
 * @param {string} text                     the text that will be inserted into the detail.
 * @param {number} [width]                  the optional width in pixels for the detail.
 * @param {boolean} [allowClicks=false]     whether clicks are allowed for embedded links.
 */
export function putText(tgtNode, text, width, allowClicks) {
    doPutTextAsDetail(tgtNode, text, width, allowClicks);
}

/**
 * Add the specified script url to the document body, thereby including that script.
 * Use this when you need to provide additional javascript (locally or remotely) to process the templates you have
 * provided.
 *
 * @param {string} scriptUrl    the url for the script that is to be added.
 */
export function putScript(scriptUrl) {
    doPutScript(scriptUrl);
}

/**
 * Collapse the specified node on the canvas.
 * Silently ignored if the node is already collapsed, or cannot be collapsed.
 *
 * @param {csNode} tgtNode      the node to be collapsed.
 */
export function collapseNode(tgtNode) {
    return doCollapseNode(tgtNode);
}

/**
 * Compute a radial position for a new node relative to the specified target node.  Usually, this function is called
 * a number of times sequence, incrementing the position parameter for each case, thereby locating multiple nodes
 * radially around the original node (tgtNode).
 *
 * @param {csNode} tgtNode      the original target node from which the radial location will be calculated.
 * @param {number} position     the position number for the node in question (from 0 to slices).
 * @param {number} slices       the number of radial slices - should match the anticipated number of nodes for a
 *                              complete circle of nodes around the target node.
 * @param {number} [radius]     the optional radius (in pixels) of the circle of which the radial positions are
 *                              calculated.
 * @returns {csCoordinates}     an object containing the x and y location on the canvas.
 */
export function computeRadialPosFrom(tgtNode, position, slices, radius) {
    return doComputeRadialPosFrom(tgtNode, position, slices, radius);
}

/**
 * Compute the actual canvas position (in the ViewBox coordinate system) from the specified node position (in the
 * Node coordinate system).
 *
 * @param {csCoordinates} nodePos       an object containing the raw x,y coordinates for a node.
 * @param {number} [offsetX=0]          an optional offset in X position.
 * @param {number} [offsetY=0]          an optional offset in Y position.
 * @returns {csCoordinates}             the calculated actual position on the canvas.
 */
export function getPosFromNode(nodePos, offsetX, offsetY) {
    return getCanvasPosFromNodePos(nodePos, offsetX, offsetY);
}
