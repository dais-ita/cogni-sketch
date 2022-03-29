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
 * @file Template strings relating to the link details popup window.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the main template for this popup window.
 */
export const mainTemplate = `
<div id="popup-form" class="modal cs-modal-overflow py-0 px-2">
    <!-- metadata section -->
    <div id="metadata-section" class="row">
        <!-- This is populated by a call for the metadata content to commonDetails.js -->
    </div>
    <hr class="my-1"/>
    
    <!-- summary section -->
    <div class="row">
        <div class="col-sm">
            <span class="badge badge-warning" data-toggle="collapse" data-target="#node-main" title="Click to expand/collapse this section">Summary</span>
            <div id="node-main" class="collapse show">
                <div class="row">
                    <div id="summary-text" class="col-sm text-center"></div>
                </div>
            </div>
        </div>
    </div>
    <hr class="my-1"/>

    <!-- main section -->
    <div class="row">
        <div class="col-sm">
            <span class="badge badge-warning" data-toggle="collapse" data-target="#node-main" title="Click to expand/collapse this section">Main</span>
            <div id="node-main" class="collapse show">
                <div class="row">
                    <div class="col-sm text-center alert alert-info">Specify a new label, or choose an existing label from the list.</div>
                </div>
                <div class="form-group row my-1">
                    <div class="col-sm-3 text-right">
                        <label for="input-existing-label" class="col-form-label-sm">Existing label</label>
                    </div>
                    <div class="col-sm-5">
                        <select id="input-existing-label" class="form-control-sm">
                            {{#each labelNames}}
                                <option value="{{label}}" {{selected}}>{{label}}</option>
                            {{/each}}
                        </select>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-check form-check-inline my-0">
                            <input id="bidirectional" type="checkbox" class="form-check-input" {{biChecked}}>
                            <label for="bidirectional" class="col-form-check-label col-form-label-sm p-0 m-0">bi-directional?</label>
                        </div>
                    </div>
                </div>
                
                <div id="new-section" class="form-group row my-1 {{newClasses}}">
                    <div class="col-sm-3 text-right">
                        <label for="input-new-label" class="col-form-label-sm">New label</label>
                    </div>
                    <div class="col-sm-7">
                        <input id="input-new-label" class="form-control-sm" type="text" value="{{labelText}}">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <hr class="my-1"/>

    <!-- common section -->
    <div id = "common-section">
        <!-- This is populated by a call for the common content to commonDetails.js -->
    </div>
    
    <!-- buttons -->
    <div class="row">
        <button id="button-save" class="button btn btn-block btn-secondary cs-btn-default">Save Changes</button>
        <button id="button-cancel" class="button btn btn-block btn-secondary cs-btn-close">Cancel</button>
    </div>
</div>
`;