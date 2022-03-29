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
 * @file Miscellaneous utility and helper functions.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";

export const URL_SAVE_FILE = '/file/save';
export const URL_SAVE_TEXT_FILE = '/file/saveText';
export const URL_SAVE_IMAGE = '/image/save';
export const URL_DOWNLOAD = '/file/download';

export function convertArrayBufferToBase64(buffer) {
    let result = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        result += String.fromCharCode( bytes[ i ] );
    }

    return window.btoa(result);
}

export function textToHtml(text) {
    let result = text;

    if (result) {
        result = result.replace(/(?:\r\n|\r|\n)/g, '<br>');
        result = result.replaceAll(' ', '&nbsp;');
    } else {
        result = '';
    }

    return result;
}

export function renameProperty(tgtObject, oldKey, newKey) {
    if (oldKey !== newKey) {
        Object.defineProperty(tgtObject, newKey,
            Object.getOwnPropertyDescriptor(tgtObject, oldKey)
        );

        delete tgtObject[oldKey];
    }
}

export function isValidPaletteJson(obj) {
    let keys = Object.keys(obj);

    return keys.indexOf('sections') > -1;
}

export function isValidProjectJson(obj) {
    let keys = Object.keys(obj);

    return keys.indexOf('project') > -1;
}

export function fileDownloadUrlFor(filename) {
    return `./file/get/${getProject().getName()}/${filename}`;
}

/**
 * Returns true if the specified value is a url string.
 *
 * @param value             the value to be checked.
 * @returns {boolean}       whether the value is a url string.
 */
export function isUrl(value) {
    let result = false;

    if (value) {
        value = value.toString();

        let words = value.split(' ');

        if (words.length === 1) {
            if (value.startsWith('http://') || value.startsWith('https://')) {
                result = true;
            }
        }
    }

    return result;
}

/**
 * Use a DOM element to strip any html markup from the specified text.  Returns only the 'innerText' of the
 * specified text, or the same text if no html or invalid html is specified.
 *
 * @param {string} originalText     the text to be processed.
 * @returns {string}                the text after html stripping is complete.
 */
export function stripHtml(originalText) {
    let elem = document.createElement('DIV');
    elem.innerHTML = originalText;

    return elem.innerText;
}

/**
 * Merge (and de-duplicate) the two arrays into a new array, and optionally sort the results.
 *
 * @param {string[]} list1          the first array to merge.
 * @param {string[]} list2          the second array to merge.
 * @param {boolean} [sort=false]    whether to sort the result.
 * @returns {string[]}              the merged and de-duplicated result.
 */
export function mergeArrays(list1, list2, sort) {
    let newList = [];

    for (let thisItem of list1) {
        if (newList.indexOf(thisItem) === -1) {
            newList.push(thisItem);
        }
    }

    for (let thisItem of list2) {
        if (newList.indexOf(thisItem) === -1) {
            newList.push(thisItem);
        }
    }

    if (sort) {
        newList.sort();
    }

    return newList;
}
