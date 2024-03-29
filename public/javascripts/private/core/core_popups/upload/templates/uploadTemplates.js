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
 * @file Template strings relating to the upload popup window.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the main template for this popup window.
 */
export const mainTemplate = `
<div id="{{formName}}" class="modal cs-modal-overflow py-0 px-2">
    <form enctype="multipart/form-data" action="/file/upload" method="POST">
        <div class="input-group">
            <div class=" my-3">
                <input id="input-chooser" type="file" class="custom-file-input" multiple="">
            </div>
            <label class="custom-file-label" for="input-chooser">Choose file</label>
        </div>
    </form>
    <div id="popup-info-upload" class="alert-info my-3 p-2 d-none"></div>
    <button id="button-upload-submit" class="button btn btn-block btn-secondary">Upload</button>
    <button id="button-upload-cancel" class="button btn btn-block btn-secondary cs-btn-close">Close</button>
</div>
`;