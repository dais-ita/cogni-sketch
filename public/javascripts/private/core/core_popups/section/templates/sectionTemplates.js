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
 * @file Template strings relating to the section popup window.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the main template for this popup window.
 */
export const mainTemplate = `
<div id="popup-form" class="modal cs-modal-overflow py-0 px-2">
    <div id="popup-info" class="alert-info my-3 p-2">{{infoMessage}}</div>
    <label for="section-name">Section name:</label>
    <input id="section-name" type="text" value="{{sectionName}}">
{{#if isEditing}}
    <img id="button-delete" class="cs-button" src="./images/cs/icon-delete.svg" alt="Delete this section" title="Delete this section">
{{/if}}
    <button id="button-save" class="button btn btn-block btn-secondary cs-btn-default">Save Changes</button>
    <button id="button-cancel" class="button btn btn-block btn-secondary cs-btn-close">Cancel</button>
</div>
`;
