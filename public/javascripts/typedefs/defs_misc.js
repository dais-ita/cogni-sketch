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
 * @file Contains only typedefs.  These are miscellaneous and don't fit any of the main groupings.
 *
 * @author Dave Braines
 **/

/**
 * csMemory - a structure to represent the memory usage of the browser.
 *
 * @typedef csMemory
 * @type {object}
 * @property {number} jsHeapSizeLimit           the javascript heap size limit.
 * @property {number} totalJSHeapSize           the total javascript heap size.
 * @property {number} usedJSHeapSize            the used javascript heap size.
 */
//TODO: I should not have to define this...

/**
 * SaveImageParams - parameter object used when saving an image to the server.
 *
 * @typedef SaveImageParams
 * @type {object}
 * @property {csCoordinates} nodePos        the position of the image node on the canvas
 * @property {string} imageUrl              the url of the image on the server
 * @property {string} label                 the label to be used when this image is created on the canvas
 * @property {csType} palItem               the palette item that defines the type to be created on the canvas
 * @property {object} existingProps         a list of existing properties to be added to the image on the canvas
 *
 */
//TODO: Rename this to have the cs prefix
