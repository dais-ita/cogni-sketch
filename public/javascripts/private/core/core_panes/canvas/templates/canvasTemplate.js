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
 * @file Template strings relating to the canvas pane.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   template for the pane container element for the canvas tab.
 */
export const paneContainerTemplate = `
<div id="cs-tab-{{paneName}}" data-pos="{{pos}}" class="p-0 m-0 cs-tab-canvas">
    <svg class="cs-canvas-svg" id="cs-main-{{paneName}}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="arrowhead" viewBox="0 0 10 10"
                refX="35" refY="5"
                markerWidth="10" markerHeight="10"
                orient="auto">
                <polygon points="0 0, 10 5, 0 10" fill="#000"/>
            </marker>
            <marker id="arrowhead_bi" viewBox="0 0 10 10"
                refX="-25" refY="5"
                markerWidth="10" markerHeight="10"
                orient="auto"
                markerUnits="strokeWidth">
                <polygon points="10 10, 0 5, 10 0" fill="#000"/>
            </marker>
        </defs>
    </svg>
</div>
`;
