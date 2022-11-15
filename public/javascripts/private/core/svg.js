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
 * @file Functions for the creation of SVG elements on the canvas.
 *
 * @author Dave Braines
 **/

import {
    delayedNodeClick,
    nodeDblClick,
    nodeDragEnded,
    nodeDragged,
    nodeDragStarted,
    nodeDrop,
    nodeMouseout,
    nodeMouseover
} from "../core/core_panes/canvas/events/node.js";
import {
    delayedLinkClick,
    linkAnchorDragEnded,
    linkAnchorDragged,
    linkDblClick
} from "../core/core_panes/canvas/events/link.js";
import {textToHtml} from "../util/misc.js";
import {computePathBetween} from "../util/coords.js";
import {
    computeIconOffset,
    computeIconSize,
    computeLabelOffset,
    computeRadius
} from "./graphics.js";

export function svgNodeGroup(parent, uid) {
    return parent
        .append('g')
        .attr('id', uid);
}

export function svgNodeIconCircle(parent, tgtNode, layout, classes, customColor) {
    let elem = parent
        .append('circle')
        .attr('id', tgtNode.getUid())
        .attr('class', classes)
        .attr('cx', tgtNode.getPos().x)
        .attr('cy', tgtNode.getPos().y)
        .attr('r', computeRadius(tgtNode, layout));

    if (customColor) {
        elem.attr('fill', customColor);
    }

    return appendEventHandlers(elem);
}

export function svgNodeIconImage(parent, tgtNode, layout, iconUrl) {
    let elem = parent
        .append('image')
        .attr('id', tgtNode.getUid())
        .attr('href', iconUrl)
        .attr('onerror', 'this.onerror=null; this.setAttribute("href", "/images/palette/icon-error.svg");')
        .attr('x', tgtNode.getPos().x - computeIconOffset(tgtNode, layout))
        .attr('y', tgtNode.getPos().y - computeIconOffset(tgtNode, layout))
        .attr('width', computeIconSize(tgtNode, layout))
        .attr('height', computeIconSize(tgtNode, layout));

    //TODO: A better solution (new group for icon+image?) that means the events don't need to be added twice
    return appendEventHandlers(elem);
}

function appendEventHandlers(elem) {
    return elem
        .on('click', function(e) { delayedNodeClick(e, this); })
        .on('dblclick', function(e) { nodeDblClick(e, this); })
        .on('mouseover', function(e) { nodeMouseover(e, this); })
        .on('mouseout', function(e) { nodeMouseout(e, this); })
        .on('drop', function(e) { nodeDrop(e, this); })
        .call(d3.drag()
            .on('start', function(e) { nodeDragStarted(e, this); })
            .on('drag', function(e) { nodeDragged(e, this); })
            .on('end', function(e) { nodeDragEnded(e, this); })
        );
}

export function svgNodeLabel(parent, tgtNode, layout, labelText, classes) {
    let xPos = tgtNode.getPos().x + computeLabelOffset(tgtNode, layout);
    let yPos = tgtNode.getPos().y - computeLabelOffset(tgtNode, layout);

    return svgGeneralLabel(parent, tgtNode.getUid(), xPos, yPos, layout, labelText, classes);
}

function svgGeneralLabel(parent, uid, xPos, yPos, layout, labelText, cssClass) {
    return parent
        .append('foreignObject')
        .attr('id', uid)
        .attr('class', 'cs-avoid-clicks')
        .attr('x', xPos)
        .attr('y', yPos)
        .html(`<div class="${cssClass}">${textToHtml(labelText)}</div>`);
}

export function svgLinkGroup(parent, uid) {
    return parent
        .append('g')
        .attr('id', uid);
}

export function svgLinkLine(parent, uid, srcNode, tgtNode, bender, cssClass, arrowHead, doubleHeaded, customColor) {
    let pathText = computePathBetween(srcNode, bender, tgtNode);

    let line = parent
        .append('path')
        .attr('id', uid)
        .attr('d', pathText)
        .attr('class', cssClass)
        .attr('pointer-events', 'auto');

    if (customColor) {
        line.attr('stroke', customColor);
    }

    if (arrowHead) {
        line.attr('marker-end', 'url(#arrowhead)');

        if (doubleHeaded) {
            line.attr('marker-start', 'url(#arrowhead_bi)');
        }
    }

    return line;
}

export function svgLinkLabel(parent, uid, pos, layout, labelText, classes) {
    return svgGeneralLabel(parent, uid, pos['x'], pos['y'], layout, labelText, classes);
}

export function svgLinkAnchor(parent, uid, pos, layout) {
    return parent
        .append('circle')
        .attr('id', uid)
        .attr('cx', pos['x'])
        .attr('cy', pos['y'])
        .attr('r', layout['labelAnchorRadius'])
        .attr('class', 'cs-link-label-anchor')
        .on('click', function(e) { delayedLinkClick(e, this); })
        .on('dblclick', function(e) { linkDblClick(e, this); })
        .call(d3.drag()
            .on('drag', function(e) { linkAnchorDragged(e, this); })
            .on('end', function(e) { linkAnchorDragEnded(e, this); })
        );
}

export function svgSimpleGroup(parent) {
    return parent.append('g');
}

export function svgSimpleLine(parent, pos) {
    return parent
        .append('line')
        .attr('x1', pos['x1'])
        .attr('y1', pos['y1'])
        .attr('x2', pos['x2'])
        .attr('y2', pos['y2'])
        .attr('class', 'cs-link cs-link-normal');
}

export function svgSimpleForeignObject(parent, tgtNode, pos, width, html, allowClicks) {
    let elem = parent
        .append('foreignObject')
        .attr('id', tgtNode.getUid())
        .attr('x', pos['x'])
        .attr('y', pos['y'])
        .attr('width', width)
        .html(html);

    if (!allowClicks) {
        elem.attr('class', 'cs-avoid-clicks');
    }

    return elem;
}

export function svgSimpleRectangle(parent, id, pos, classes) {
    return parent
        .append('rect')
        .attr('id', id)
        .attr('x', pos['x'])
        .attr('y', pos['y'])
        .attr('width', pos['width'])
        .attr('height', pos['height'])
        .attr('class', classes);
}
