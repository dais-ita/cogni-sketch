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
 * @file Provides persistence and accessor functions for all of the SVG items created on the canvas.
 *
 * @author Dave Braines
 **/

//TODO: Migrate to a new pattern for accessing svg items.
let svgStore = {};

export function get(uid) {
    return svgStore[uid];
}

export function add(key, obj) {
    svgStore[key] = obj;
}

/**
 * Look up D3 svg group
 *
 * @param {*} d3Obj empty node
 * @param {boolean} inner Switch to access inner properties to get svg details
 */
export function getSvgGroupFrom(d3Obj, inner) {
    return getSvgFrom(d3Obj, inner, 'group');
}

/**
 * Look up D3 svg icon details
 *
 * @param {*} d3Obj                         empty node
 * @param {boolean} [inner=false]           switch to access inner properties to get svg details
 * @returns {SVGImageElement|HTMLElement}    the svg icon element
 */
export function getSvgIconFrom(d3Obj, inner) {
    return getSvgFrom(d3Obj, inner, 'icon');
}

/**
 * Look up D3 svg details
 *
 * @param {*} d3Obj empty node
 * @param {boolean} inner Switch to access inner properties to get svg details
 * @return {SVGElement}         the svg element that contains the node details.
 */
export function getSvgDetailFrom(d3Obj, inner) {
    return getSvgFrom(d3Obj, inner, 'detail');
}

/**
 *
 * @param d3Obj
 * @param inner
 * @return {SVGTextElement|HTMLElement}     the svg element for this label
 */
export function getSvgLabelFrom(d3Obj, inner) {
    return getSvgFrom(d3Obj, inner, 'label');
}

/**
 * Look up D3 svg iconImage details
 *
 * @param {*} d3Obj                             empty node
 * @param {boolean} inner                       switch to access inner properties to get svg details
 * @return {SVGImageElement|HTMLElement}         the svg image for this icon.
 */
export function getSvgIconImageFrom(d3Obj, inner) {
    return getSvgFrom(d3Obj, inner, 'iconImage');
}

export function getSvgLinkGroupFrom(link, inner) {
    return getSvgFrom(link, inner, 'group');
}

/**
 * Return the svg line that represents the link.
 *
 * @param {csLink} link             the link for which the line should be returned.
 * @param {boolean} [inner=false]   whether to return the d3 selection or the inner SVG element.
 * @return {SVGLineElement|HTMLElement}
 */
export function getSvgLinkLineFrom(link, inner) {
    return getSvgFrom(link, inner, 'line');
}

/**
 *
 * @param link
 * @param inner
 * @return {SVGTextElement|HTMLElement}     the svg element for the link label.
 */
export function getSvgLinkLabelFrom(link, inner) {
    return getSvgFrom(link, inner, 'label');
}

/**
 *
 * @param link
 * @param inner
 * @return {SVGCircleElement|HTMLElement}   the svg element for the link anchor.
 */
export function getSvgLinkLabelAnchorFrom(link, inner) {
    return getSvgFrom(link, inner, 'anchor');
}

/**
 * Look up D3 svg details for a given property
 *
 * @param {Object} d3Obj empty node
 * @param {boolean} inner Switch to access inner properties to get svg details
 * @param {String} propName D3 Object property name the we are getting the data for such as group, icon, iconImage, line, label or anchor.
 * @returns {SVGElement|HTMLElement} svg object for given property
 */
function getSvgFrom(d3Obj, inner, propName) {
    let result;

    if (d3Obj) {
        let matchedD3Obj = svgStore[d3Obj.getUid()];
        let matchedSvg;

        if (matchedD3Obj) {
            matchedSvg = matchedD3Obj[propName];

            if (matchedSvg) {
                if (inner) {
                    result = matchedSvg._groups[0][0];
                } else {
                    result = matchedSvg;
                }
            }
        }
    }

    return result;
}
