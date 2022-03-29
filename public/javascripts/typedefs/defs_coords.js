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
 * @file Contains only typedefs, specifically those relating to any aspects of the spatial coordinate system.
 *
 * There are multiple coordinate systems in use and where relevant these are explicitly defined in the functions below.
 *
 *      Node coordinates        As defined on the nodes (and links) in the project.  These are abstract absolute values
 *                              that are relative to each other and can be rendered in any space.
 *      ViewBox coordinates     Computed within the canvas, based on the current pan and zoom location.
 *                              All absolute coordinates (nodes and links) are translated into ViewBox coordinates
 *                              in order to be rendered on the canvas.
 *      Absolute coordinates    Rarely used, but these are the coordinates of the cursor on the screen or within the
 *                              canvas and are used to compute offsets for rendering new nodes or computing zoom/pan
 *                              actions based on the mouse position.
 *
 * @author Dave Braines
 **/

/**
 * csCoordinates - a simple coordinate object to represent x,y positions.  These can be in any coordinate system.
 *
 * @typedef csCoordinates
 * @type {object}
 * @property {number} x             the x coordinate.
 * @property {number} y             the y coordinate.
 *
 */

/**
 * csLineCoordinates - a simple coordinate object to represent x,y positions extended with offset and bender for link lines.
 *
 * @typedef csLineCoordinates
 * @type {object}
 * @property {number} x             the x coordinate.
 * @property {number} y             the y coordinate.
 * @property {number} offset        the relative position (from 0 to 1) of the anchor.
 * @property {number} bender        the integer amount of the bend for the link line.
 *
 */

/**
 * csZoomCoords - the extent for a viewBox.
 * All variable values are in the dimensions of the viewBox rather than absolute.
 *
 * @typedef csZoomCoords
 * @type {object}
 * @property {number} newWidth      the minimum position in the X dimension, i.e. 'left'.
 * @property {number} newHeight     the maximum position in the X dimension, i.e. 'right'.
 * @property {number} leftPos       the minimum position in the X dimension, i.e. 'top'.
 * @property {number} topPos        the maximum position in the X dimension, i.e. 'bottom'.
 */

/**
 * csViewBox - the standard object for a viewBox.  This is always in the ViewBox coordinate system.
 *
 * @typedef csViewBox
 * @type {object}
 * @property {number} left          the left position of the viewBox.
 * @property {number} top           the top position of the viewBox.
 * @property {number} width         the width value for the viewBox.
 * @property {number} height        the height value for the viewBox.
 * @property {number} zoomFactor    the zoomFactor applied for the above coordinates to be valid.
 */

/**
 * csExtent - the extent for a viewBox.
 * All variable values are in the absolute dimensions of the nodes on the canvas.
 *
 * @typedef csExtent
 * @type {object}
 * @property {number} xMin          the minimum position in the X dimension, i.e. 'left'.
 * @property {number} xMax          the maximum position in the X dimension, i.e. 'right'.
 * @property {number} yMin          the minimum position in the X dimension, i.e. 'top'.
 * @property {number} yMax          the maximum position in the X dimension, i.e. 'bottom'.
 */

/**
 * csDimensions - the standard object for a set of dimensions. These can be in any coordinate system.
 *
 * @typedef csDimensions
 * @type {object}
 * @property {number} left          the left position.
 * @property {number} top           the top position.
 * @property {number} width         the width value.
 * @property {number} height        the height value.
 */

/**
 * csRectangle - the standard object for a dimensions of a rectangle. These can be in any coordinate system.
 *
 * @typedef csRectangle
 * @type {object}
 * @property {number} x1            the left position.
 * @property {number} x2            the right position.
 * @property {number} y1            the top position.
 * @property {number} y2            the bottom position.
 */

/**
 * csRectangleSelect - the standard object for the rectangle selection.
 *
 * @typedef csRectangleSelect
 * @type {object}
 * @property {SVGRectElement} svg   the rectangle SVG element.
 * @property {number} origX         the starting X position (origin) of the rectangle.
 * @property {number} origY         the starting Y position (origin) of the rectangle.
 */
