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
 * @file Functions for different graphical renderings on the canvas.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {
    add as addToSs,
    get as getFromSs,
    getSvgDetailFrom,
    getSvgGroupFrom,
    getSvgIconImageFrom,
    getSvgIconFrom,
    getSvgLabelFrom,
    getSvgLinkGroupFrom,
    getSvgLinkLineFrom
} from "/javascripts/private/csData/svgstore.js";
import {
    getHeight,
    getWidth
} from "/javascripts/private/csData/csDataCanvas.js";

import {
    debug,
    error,
    show,
    warn
} from "/javascripts/private/util/log.js";
import {textToHtml} from "/javascripts/private/util/misc.js";
import {getCanvasElement} from "../core/core_panes/canvas/canvas.js";
import {
    doLabelTextNode,
    doNodeIcon,
    doRefreshNode
} from "/javascripts/private/core/hooks.js";
import {computeAnchorpointFor} from "/javascripts/private/util/coords.js";
import {
    clearCurrentLink,
    clearTargetNode} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";
import {
    getSessionCanvasLayout,
    getSessionShowHiddenNodes
} from "/javascripts/private/csData/csDataSession.js";
import {
    svgLinkAnchor,
    svgLinkGroup,
    svgLinkLabel,
    svgLinkLine,
    svgNodeGroup,
    svgNodeIconCircle,
    svgNodeIconImage,
    svgNodeLabel,
    svgSimpleForeignObject,
    svgSimpleGroup,
    svgSimpleLine,
    svgSimpleRectangle
} from "./svg.js";
import {isNode} from "/javascripts/private/util/data.js";

const CSS_NODE_NORMAL = 'cs-node-normal';
const CSS_NODE_SELECTED = 'cs-node-selected';
//const CSS_NODE_UNKNOWN = 'cs-node-unknown';
const CSS_LABEL_NORMAL = 'cs-label-normal';
const CSS_LABEL_SIZE2 = 'cs-label-size-2';
const CSS_LABEL_SIZE3 = 'cs-label-size-3';
const CSS_LINK_BASIC = 'cs-link';
const CSS_LINK_NORMAL = 'cs-link-normal';
const CSS_LINK_SEMANTIC = 'cs-link-semantic';
const CSS_LINK_LABEL_NORMAL = 'cs-link-label-normal';
const CSS_LINK_LABEL_SEMANTIC = 'cs-link-label-semantic';
const CSS_FO_TEXT = 'cs-fo-text-content';
const CSS_FO_LINK = 'cs-fo-link';
const CSS_FO_IMAGE = 'cs-fo-image';

const LAY_KEY_EMPTY = 'empty';
const LAY_KEY_FULL = 'mini';
const LAY_KEY_SPECIAL = 'tiny';

const URL_ICON_ERROR = './images/palette/icon-error.svg';

const DEF_IMG_WIDTH = '500px';

function registerNode(uid, svgGrp, svgIcon, svgIconImage, svgLabel) {
    addToSs(uid, {
        "group": svgGrp,
        "icon": svgIcon,
        "iconImage": svgIconImage,
        "label": svgLabel
    });
}

function registerLink(uid, svgGrp, svgLine, svgLabel, svgAnchor) {
    addToSs(uid, {
        "group": svgGrp,
        "line": svgLine,
        "label": svgLabel,
        "anchor": svgAnchor
    });
}

export function redrawExistingNodes() {
    if (getProject()) {
        for (let thisNode of getProject().listNodes()) {
            refreshNode(thisNode);
        }
    }
}

export function drawEmptyNode(tgtNode) {
    let layout = getSessionCanvasLayout();

    return renderNode(tgtNode, layout[LAY_KEY_EMPTY]);
}

export function drawFullNode(tgtNode) {
    let layout = getSessionCanvasLayout();
    let tgtLayout;

    if (tgtNode.isExpanded()) {
        tgtLayout = layout[LAY_KEY_FULL];
    } else {
        tgtLayout = layout[LAY_KEY_EMPTY];
    }

    return renderNode(tgtNode, tgtLayout);
}

export function drawSpecialNode(tgtNode) {
    let layout = getSessionCanvasLayout();

    return renderNode(tgtNode, layout[LAY_KEY_SPECIAL]);
}

function renderNode(tgtNode, layout) {
    let eCanvas = getCanvasElement();
    let iconUrl = computeIconUrl(tgtNode.getType());
    let customColor = tgtNode.getType().getCustomColor();
    let nodeClasses = computeNodeClasses(tgtNode);
    let labelClasses = computeLabelClasses(tgtNode);

    let sGrp = svgNodeGroup(eCanvas, tgtNode.getUid());
    let sIcon = svgNodeIconCircle(sGrp, tgtNode, layout, nodeClasses, customColor);
    let sIconImage = svgNodeIconImage(sGrp, tgtNode, layout, iconUrl);
    let sLabel = svgNodeLabel(sGrp, tgtNode, layout, tgtNode.getLabel(), labelClasses);   // The label text is set later

    registerNode(tgtNode.getUid(), sGrp, sIcon, sIconImage, sLabel);

    return sGrp;
}

function computeNodeClasses(tgtNode) {
    let classText;
    let nodeType = tgtNode.getType();
    let extraClasses;
    let nodeColor;

    if (nodeType) {
        extraClasses = nodeType.getSettings().getNodeClasses();
        nodeColor = nodeType.getIcon()['color'];
    }

    if (tgtNode.isSelected()) {
        classText = CSS_NODE_SELECTED;
    } else {
        classText = CSS_NODE_NORMAL;
    }

    if (nodeColor) {
        classText += ` cs-node-${nodeColor}`;
    }

    if (extraClasses) {
        for (let thisClass of extraClasses) {
            classText += ` ${thisClass}`;
        }
    }

    return classText;
}

function computeLabelClasses(tgtNode) {
    let classText = computeLabelClass(tgtNode);
    let extraClasses;

    if (tgtNode.getType()) {
        extraClasses = tgtNode.getType().getSettings().getLabelClasses();
    }

    if (extraClasses) {
        for (let thisClass of extraClasses) {
            classText += ` ${thisClass}`;
        }
    }

    return classText;
}

function computeIconUrl(nodeType) {
    let iconUrl;

    if (nodeType) {
        iconUrl = nodeType.getIcon().icon;
    } else {
        iconUrl = URL_ICON_ERROR;
    }

    return iconUrl;
}

export function drawNodeIcon(tgtNode) {
    let svgIconImage = getSvgIconImageFrom(tgtNode, true);
    let svgIcon = getSvgIconFrom(tgtNode, true);

    if (svgIcon) {
        let customColor;

        if (tgtNode.getType()) {
            customColor = tgtNode.getType().getCustomColor();
        }

        svgIcon.classList = computeNodeClasses(tgtNode);

        if (customColor) {
            svgIcon.setAttribute('fill', customColor);
        }
    }

    if (svgIconImage) {
        let nodeIcon = doNodeIcon(tgtNode);

        svgIconImage.classList.remove(...svgIconImage.classList);
        svgIconImage.classList.add('cs-image-normal');

        if (nodeIcon) {
            svgIconImage.setAttribute('href', nodeIcon['icon']);
            svgIconImage.setAttribute('alt', nodeIcon['iconAlt']);
        } else {
            debug(`No icon found for ${tgtNode.getTypeName()} ${tgtNode.getUid()}`);
        }
    }
}

export function populateNodeLabel(tgtNode) {
    let labElem = getSvgLabelFrom(tgtNode, true);

    if (labElem) {
        let labelText = doLabelTextNode(tgtNode);
        let classText = computeLabelClasses(tgtNode);

        labElem.innerHTML = `<div class="${classText}">${textToHtml(labelText)}</div>`;
    }
}

export function populateLinkLabel(tgtLink) {
    let labElem = getSvgLabelFrom(tgtLink, true);

    if (labElem) {
        let labelText = tgtLink.getLabel();
        let classText = computeLinkLabelClasses(tgtLink);

        labElem.innerHTML = `<div class="${classText}">${labelText}</div>`;
    }
}

function showOrHideArrowheads(tgtLink) {
    let labLine = getSvgLinkLineFrom(tgtLink, true);

    if (tgtLink.isBidirectional()) {
        //Ensure the start arrowhead is shown
        labLine.setAttribute('marker-start', 'url(#arrowhead_bi)');
    } else {
        //Ensure the start arrowhead is removed
        labLine.setAttribute('marker-start', '');
    }
}

function updateColor(tgtLink) {
    let customColor = tgtLink.getPropertyNamed('color', true);

    if (customColor) {
        let labLine = getSvgLinkLineFrom(tgtLink);

        labLine.setAttribute('stroke', customColor);
    }
}

export function switchNodeToEmpty(tgtNode) {
    let layouts = getSessionCanvasLayout();

    redrawNode(tgtNode, layouts[LAY_KEY_EMPTY]);
}

export function switchNodeToFull(tgtNode) {
    let layouts = getSessionCanvasLayout();

    redrawNode(tgtNode, layouts[LAY_KEY_FULL]);
}

export function computeIconSize(tgtNode, layout) {
    let nodeSize = tgtNode.getNodeSize();

    return layout['iconSize'] * nodeSize;
}

export function computeIconOffset(tgtNode, layout) {
    let nodeSize = tgtNode.getNodeSize();

    return layout['iconOffset'] * nodeSize;
}

export function computeLabelOffset(tgtNode, layout) {
    let nodeSize = tgtNode.getNodeSize();

    //TODO: Improve on this temporary situation
    if (nodeSize > 1) {
        nodeSize = nodeSize * 0.85;
    }

    return layout['labelOffset'] * nodeSize;
}

export function computeRadius(tgtNode, layout) {
    let nodeSize = tgtNode.getNodeSize();

    return layout['radius'] * nodeSize;
}

function computeLabelClass(tgtNode) {
    let nodeSize = tgtNode.getNodeSize();
    let result;

    if (nodeSize === 1) {
        result = CSS_LABEL_NORMAL;
    } else if (nodeSize === 2) {
        result = CSS_LABEL_SIZE2;
    } else {
        result = CSS_LABEL_SIZE3;
    }

    return result;
}

export function collapseOrExpandNode(tgtNode) {
    if (tgtNode.isExpanded()) {
        if (tgtNode.isExpandedAsCustom()) {
            expandNodeAsTable(tgtNode);
        } else {
            collapseNode(tgtNode);
        }
    } else {
        expandNodeAsCustom(tgtNode);
    }
}

export function collapseNode(tgtNode) {
    let layouts = getSessionCanvasLayout();

    tgtNode.collapse();

    redrawNode(tgtNode, layouts[LAY_KEY_EMPTY]);
    hideDetailFor(tgtNode);
}

function redrawNode(tgtNode, layout) {
    let tgtIcon = getSvgIconFrom(tgtNode, true);
    let tgtIconImage = getSvgIconImageFrom(tgtNode, true);
    let tgtLabel = getSvgLabelFrom(tgtNode, true);

    if (tgtIcon) {
        tgtIcon.setAttribute('r', computeRadius(tgtNode, layout));
    }

    if (tgtIconImage) {
        tgtIconImage.setAttribute('width', computeIconSize(tgtNode, layout));
        tgtIconImage.setAttribute('height', computeIconSize(tgtNode, layout));
        tgtIconImage.setAttribute('x', (tgtNode.getPos().x - computeIconOffset(tgtNode, layout)).toString());
        tgtIconImage.setAttribute('y', (tgtNode.getPos().y - computeIconOffset(tgtNode, layout)).toString());
    }

    if (tgtLabel) {
        tgtLabel.setAttribute('x', (tgtNode.getPos().x + computeLabelOffset(tgtNode, layout)).toString());
        tgtLabel.setAttribute('y', (tgtNode.getPos().y - computeLabelOffset(tgtNode, layout)).toString());
    }
}

export function expandNodeAsCustom(tgtNode) {
    let layouts = getSessionCanvasLayout();

    tgtNode.expandAsCustom();
    drawExpandedNode(tgtNode, layouts[LAY_KEY_FULL]);
}

export function expandNodeAsTable(tgtNode) {
    let layouts = getSessionCanvasLayout();

    tgtNode.expandAsTable();
    drawExpandedNode(tgtNode, layouts[LAY_KEY_FULL]);
}

function drawExpandedNode(tgtNode, layout) {
    refreshNode(tgtNode);

    if (hasNoDetail(tgtNode)) {
        //There is no content so collapse the node again
        warn('Not expanding because node has no content');
        collapseNode(tgtNode);
    } else {
        redrawNode(tgtNode, layout);
        showDetailFor(tgtNode);
    }
}

function hasNoDetail(tgtNode) {
    let result = true;
    let detail = getSvgDetailFrom(tgtNode, true);

    if (detail.children && detail.children.length > 0) {
        let firstChild = detail.children[0];
        if (firstChild && firstChild.children && firstChild.children.length > 0) {
            result = false;
        }
    }

    return result;
}

function hideDetailFor(tgtNode) {
    let svgDetail = getSvgDetailFrom(tgtNode, true);

    if (svgDetail) {
        svgDetail.style.display = 'none';
    }
}

function showDetailFor(tgtNode) {
    let svgDetail = getSvgDetailFrom(tgtNode, true);

    if (svgDetail) {
        svgDetail.style.display = 'inline';
    }
}

export function hideNodeAndLinks(tgtNode) {
    let showHidden = getSessionShowHiddenNodes();

    if (!showHidden) {
        showOrHideNodeOrLink(tgtNode);

        for (let thisLink of tgtNode.listAllLinks()) {
            showOrHideNodeOrLink(thisLink);
        }
    }
}

export function refreshNode(tgtNode) {
    doRefreshNode(tgtNode);
}

export function refreshLink(tgtLink) {
    populateLinkLabel(tgtLink);
    showOrHideArrowheads(tgtLink);
    updateColor(tgtLink);
}

export function drawLinkWhole(tgtLink, srcNode, tgtNode) {
    if (tgtNode) {
        let eCanvas = getCanvasElement();
        let layout = getSessionCanvasLayout();
        let labelText = tgtLink.getLabel();
        let cssClass = computeLinkClasses(tgtLink);

        let sGrp = svgLinkGroup(eCanvas, tgtLink.getUid());
        let sLine = svgLinkLine(sGrp, tgtLink.getUid(), srcNode, tgtNode, tgtLink.getBender(), cssClass, true, tgtLink.isBidirectional(), tgtLink.getPropertyNamed('color'));

        finishLink(tgtLink, srcNode, tgtNode, labelText, layout, sGrp, sLine);
    } else {
        error(`Incomplete link on creation (no target node) for ${tgtLink.getUid()}`);
    }
}

function finishLink(tgtLink, srcNode, tgtNode, labelText, layout, sGrp, sLine) {
    let classes = computeLinkLabelClasses(tgtLink);
    let anchorPos = computeAnchorpointFor(tgtLink, sLine);
    let sLabel = svgLinkLabel(sGrp, tgtLink.getUid(), anchorPos, layout, labelText, classes);
    let sAnchor = svgLinkAnchor(sGrp, tgtLink.getUid(), anchorPos, layout);
    let linkLine = getSvgLinkLineFrom(tgtLink, true);

    if (linkLine) {
        linkLine.setAttribute('marker-end', 'url(#arrowhead)')
    }

    /* Move nodes to front (to hide the link line) */
    bringNodeToFront(srcNode);
    bringNodeToFront(tgtNode);

    registerLink(tgtLink.getUid(), sGrp, sLine, sLabel, sAnchor);

    if (tgtLink.isHidden() || srcNode.isHidden() || tgtNode.isHidden()) {
        showOrHideNodeOrLink(tgtLink);
    }
}

function computeLinkClasses(tgtLink) {
    let cssClass;

    if (tgtLink.isSemantic()) {
        cssClass = `${CSS_LINK_BASIC} ${CSS_LINK_SEMANTIC}`;
    } else {
        let customColor = tgtLink.getPropertyNamed('color');

        if (customColor) {
            cssClass = CSS_LINK_BASIC;
        } else {
            cssClass = `${CSS_LINK_BASIC} ${CSS_LINK_NORMAL}`;
        }
    }

    return cssClass;
}

function computeLinkLabelClasses(tgtLink) {
    let cssClass;

    if (tgtLink.isSemantic()) {
        cssClass = CSS_LINK_LABEL_SEMANTIC;
    } else {
        cssClass = CSS_LINK_LABEL_NORMAL;
    }

    return cssClass;
}

export function drawLinkStart(rawLink, srcNode) {
    let eCanvas = getCanvasElement();

    let svgGroup = svgLinkGroup(eCanvas, rawLink.id);
    let svgLine = svgLinkLine(svgGroup, rawLink.id, srcNode, srcNode, rawLink.getBender(), CSS_LINK_BASIC + ' ' + CSS_LINK_NORMAL);

    registerLink(rawLink.id, svgGroup, svgLine);

    bringNodeToFront(srcNode);
}

export function drawLinkEnd(tgtLink, srcNode, tgtNode) {
    if (tgtNode) {
        let sGrp = getSvgLinkGroupFrom(tgtLink, false);
        let sLine = getSvgLinkLineFrom(tgtLink, false);
        let sLineInner = getSvgLinkLineFrom(tgtLink, true);

        if (sLine) {
            let layout = getSessionCanvasLayout();
            let labelText = tgtLink.getLabel();

            sLineInner.setAttribute('x2', tgtNode.getPos().x);
            sLineInner.setAttribute('y2', tgtNode.getPos().y);

            finishLink(tgtLink, srcNode, tgtNode, labelText, layout, sGrp, sLine);
        }
    } else {
        error(`Incomplete link on completion (no target node) for ${tgtLink.getUid()}`);
    }
}

export function removeLink(tgtLink) {
    d3.select('#' + tgtLink.getUid()).remove();

    clearCurrentLink();
    clearTargetNode();
}

function bringNodeToFront(tgtNode) {
    bringElementToFront(getSvgIconFrom(tgtNode, true));
    bringElementToFront(getSvgIconImageFrom(tgtNode, true));
}

function bringElementToFront(elem) {
    if (elem) {
        if (elem.parentNode) {
            if (elem.parentNode.parentNode) {
                elem.parentNode.parentNode.appendChild(elem.parentNode);
            }
            elem.parentNode.appendChild(elem);
        }
    }
}

export function showOrHideNodeOrLink(tgtNodeOrLink) {
    if (tgtNodeOrLink) {
        let svgGroup = getSvgGroupFrom(tgtNodeOrLink, true);

        if (svgGroup) {
            if (isNode(tgtNodeOrLink)) {
                if ((!tgtNodeOrLink.isHidden()) || getSessionShowHiddenNodes()) {
                    svgGroup.style.display = 'block';
                } else {
                    svgGroup.style.display = 'none';
                }
            } else {
                if (tgtNodeOrLink.isHidden() || tgtNodeOrLink.getSourceNode().isHidden() || tgtNodeOrLink.getTargetNode().isHidden()) {
                    if (getSessionShowHiddenNodes()) {
                        svgGroup.style.display = 'block';
                    } else {
                        svgGroup.style.display = 'none';
                    }
                } else {
                    svgGroup.style.display = 'block';
                }
            }
        } else {
            error(`Graphics for node or link ${tgtNodeOrLink.getUid()} could not be found`);
            show(tgtNodeOrLink);
        }
    }
}

function standardPreamble(tgtNode, width) {
    return {
        "svgGroup": getSvgGroupFrom(tgtNode, false),
        "width": width || tgtNode.getType().getSettings().getDefaultImageWidth(),
        "coords": tgtNode.getPos()
    }
}

function storeSvgDetail(tgtNode, elem) {
    let svgObj = getFromSs(tgtNode.getUid());

    if (svgObj) {
        svgObj['detail'] = elem;
    }
}

/**
 * Create html and add it to define this image.
 *
 * @param {csNode} tgtNode          the node to which this detail will be added.
 * @param {string} url              the url for the image that will be inserted into the detail.
 * @param {string} [title]          the optional title (alt text) for this image.
 * @param {number} [width]          the optional width in pixels for the detail.
 */
export function putImageAsDetail(tgtNode, url, title, width) {
    if (url) {
        let defWidth = computeWidth(tgtNode, width);
        let html = `<img src="${url}" width="${defWidth}" alt="${title||''}"/>`;

        addRawForeignObjectDetails(tgtNode, html, CSS_FO_IMAGE, width, 'image');
        bringNodeToFront(tgtNode);
    }
}

export function putTextAsDetail(tgtNode, text, width, allowClicks) {
    if (typeof text === 'string') {
        let tgtText;

        if (isHtml(text)) {
            tgtText = text;
        } else {
            tgtText = textToHtml(text);
        }

        addRawForeignObjectDetails(tgtNode, tgtText, CSS_FO_TEXT, width, 'text', allowClicks);
        bringNodeToFront(tgtNode);
    } else {
        if (text) {
            error(`Text was ignored for node ${tgtNode.getUid()} as it was an object`);
            show(text);
        }
    }
}

function isHtml(text) {
    //TODO: Improve (and relocate) this test
    let result = false;

    if (text) {
        result = text.startsWith('<') && text.endsWith('>');
    }

    return result;
}

export function putLinkAsDetail(tgtNode, url, text, width) {
    let html = `<a href="${url}" target="_blank">${text||url}</a>`;

    addRawForeignObjectDetails(tgtNode, html, CSS_FO_LINK, width, 'link');
    bringNodeToFront(tgtNode);
}

export function putHtmlAsDetail(tgtNode, html, width, cssClasses, allowClicks) {
    addRawForeignObjectDetails(tgtNode, html, (cssClasses || ''), width, 'html', allowClicks);
    bringNodeToFront(tgtNode);
}

export function putScript(scriptUrl) {
    if (scriptUrl) {
        let newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = scriptUrl;
        document.head.appendChild(newScript);
    }
}

export function removeNodeAndLinksFromCanvas(tgtNode) {
    let deletions = [];

    //First delete the links
    for (let thisLink of tgtNode.listAllLinks()) {
        deletions.push(thisLink);
    }

    for (let thisLink of deletions) {
        removeLink(thisLink);
        getProject().deleteLink(thisLink);
    }

    //Delete from canvas
    d3.select('#' + tgtNode.getUid()).remove();
}

function addRawForeignObjectDetails(tgtNode, content, cssClasses, width, contentType, allowClicks) {
    let svgDetail = getSvgDetailFrom(tgtNode, true);
    let defWidth = computeWidth(tgtNode, width);
    let html;

    if (cssClasses) {
        html = `<div id="${contentType}_${tgtNode.getUid()}" style="width:${defWidth}" class="${cssClasses}">${content}</div>`;
    } else {
        html = `<div id="${contentType}_${tgtNode.getUid()}" style="width:${defWidth}">${content}</div>`
    }

    if (svgDetail) {
        /* Exists already so just create new context and set the width*/
        svgDetail.setAttribute('width', defWidth);
        svgDetail.innerHTML = html;
        cleanChildren(svgDetail, defWidth);
    } else {
        let result = standardPreamble(tgtNode, defWidth);

        if (result['svgGroup']) {
            let newFo = svgSimpleForeignObject(result['svgGroup'], tgtNode, result['coords'], result['width'], html, allowClicks);
            cleanChildren(newFo._groups[0][0], defWidth);
            storeSvgDetail(tgtNode, newFo);
        }
    }
}

function computeWidth(tgtNode, width) {
    let defWidth = width;

    if (!width && tgtNode) {
        defWidth = tgtNode.getPropertyNamed('width');

        if (!defWidth) {
            if (tgtNode.getType()) {
                defWidth = tgtNode.getType().getSettings().getDefaultWidth()
            }
        }

        if (!defWidth) {
            if (tgtNode && tgtNode.getType()) {
                defWidth = tgtNode.getType().getSettings().getDefaultImageWidth() || DEF_IMG_WIDTH;
            } else {
                defWidth = DEF_IMG_WIDTH;
            }
        }

        if (!defWidth.trim().toLowerCase().endsWith('px')) {
            defWidth = `${defWidth}px`;
        }
    }

    return defWidth;
}

function cleanChildren(elem, maxWidth) {
    let maxWidthNum;

    if ((typeof maxWidth === 'string') && (maxWidth.endsWith('px'))) {
        maxWidthNum = parseInt(maxWidth.replace('px', ''));
    } else {
        maxWidthNum = parseInt(maxWidth);
    }

    cleanProcessingForAll(elem, maxWidthNum);
    cleanProcessingForPre(elem);
    cleanProcessingForA(elem);

    /* now recurse to the child nodes */
    for (let childElem of elem.childNodes) {
        cleanChildren(childElem, maxWidthNum)
    }
}

/**
 * Clean processing for all elements of any type - add a specific class to ensure they are formatted correctly, and
 * remove all other classes to prevent unwanted behaviour.
 *
 * @param {HTMLElement} elem                the element to be cleaned.
 * @param {number} maxWidth                 the maximum width to be allowed for image elements.
 */
function cleanProcessingForAll(elem, maxWidth) {
    let nonCsClasses = [];

    if (elem.getAttribute) {
        if (elem.nodeName === 'IMG') {
            let rawElemWidth = elem.getAttribute('width');
            if (rawElemWidth) {
                let realWidth = elem.offsetWidth;
                let realHeight = elem.offsetHeight;

                if (realWidth > maxWidth) {
                    let ratio = maxWidth / realWidth;

                    let widthAttr = `${maxWidth}px`;
                    let heightAttr = `${(realHeight*ratio)}px`;

                    elem.setAttribute('width', widthAttr);
                    elem.setAttribute('height', heightAttr);
                }
            }
        }
    }

    if (elem.classList) {
        for (let className of elem.classList.values()) {
            //TODO: a cleaner way needed to handle the twitter and quill classes
            if (className && !className.startsWith('cs-') && !className.startsWith('twitter-') && !className.startsWith('ql-')) {
                nonCsClasses.push(className);
            }
        }
    }

    for (let className of nonCsClasses) {
        elem.classList.remove(className);
    }
}

/**
 * Clean processing for all 'PRE' elements - add a specific class to ensure they are formatted correctly and don't
 * break other css styling such as drop down menus elsewhere in the layout.
 *
 * @param {HTMLElement} elem   the element to be cleaned.  Only processed if it is of type 'PRE'
 */
function cleanProcessingForPre(elem) {
    if (elem.nodeName === 'PRE') {
        elem.classList.add('cs-pre');
    }
}

/**
 * Clean processing for all 'A' elements - add a specific class to ensure pointer events are on so that clicks can be
 * handled, and set a target so that clicking the link opens in a new tab.
 *
 * @param {HTMLElement} elem   the element to be cleaned.  Only processed if it is of type 'A'
 */
function cleanProcessingForA(elem) {
    if (elem.nodeName === 'A') {
        elem.classList.add('cs-allow-clicks');
        elem.setAttribute('target', '_blank');
    }
}

export function drawInitialBoundingBox() {
    let x1 = 0;
    let y1 = 0;
    let x2 = getWidth();
    let y2 = getHeight();
    let group = svgSimpleGroup(getCanvasElement());

    svgSimpleLine(group, { "x1": x1, "y1": y1, "x2": x1, "y2": y2 });
    svgSimpleLine(group, { "x1": x2, "y1": y1, "x2": x2, "y2": y2 });
    svgSimpleLine(group, { "x1": x1, "y1": y1, "x2": x2, "y2": y1 });
    svgSimpleLine(group, { "x1": x1, "y1": y2, "x2": x2, "y2": y2 });
}

export function drawRectangle(id, pos, classes) {
    let eCanvas = getCanvasElement();

    return svgSimpleRectangle(eCanvas, id, pos, classes);
}

/**
 * Return a html fragment that represents the specified node visually, as if it were rendered on the canvas.
 *
 * @param {csNode} tgtNode      the node to be rendered
 * @param {string} [elemId]     the id to be used for the clickable link element
 * @returns {string}            the generated html
 */
export function htmlIconForNode(tgtNode, elemId) {
    let layout = getSessionCanvasLayout();
    let c = computeRadius(tgtNode, layout.mini) * 2;
    let icon = tgtNode.getIcon();
    let idPart = '';
    if (elemId) {
        idPart = `id="${elemId}"`;
    }

    return `
<div class="cs-timeline-node">
  <div class="cs-timeline-icon cs-node-${icon.color}" style="width: ${c}px; height: ${c}px;">
    <a ${idPart} title="${tgtNode.getTypeName()} - click to view on canvas">
        <img class="cs-timeline-image" src="${icon.icon}" alt="${icon.iconAlt}" width="${computeIconSize(tgtNode, layout.mini)}px"/>
    </a>
  </div>
  <div class="cs-timeline-label">${tgtNode.getLabel()}</div>
</div>
`;
}
