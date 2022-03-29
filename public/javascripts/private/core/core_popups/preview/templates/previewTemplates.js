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
 * @file Template strings relating to the preview popup window.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the main template for the preview popup window.
 */
export const mainTemplate = `
<div id="popup-form" class="modal cs-modal-overflow py-0 px-2 show" aria-modal="true" role="dialog">
{{#if errorText}}
    <div id="popup-warning" class="alert-info my-3 p-2">
        {{{errorText}}}
    </div>
{{/if}}

    <div id="popup-info" class="alert-info my-3 p-2">
        {{{messageText}}}
    </div>

    <table class="table table-striped">
        <thead>
            <tr>
                <td>
                    <input id="cb_all" type="checkbox">
                </td>
                <td>
                    <label>link</label>
                </td>
                <td>
                    <label>type</label>
                </td>
                <td>
                    <label>label</label>
                </td>
                <td>
                    <label>data</label>
                </td>
            </tr>
        </thead>
        <tbody>
        {{#each items}}
            <tr>
                <td>
                    <input id="cb_{{@index}}" type="checkbox">
                </td>
                <td>
                    <span id="link_{{@index}}">{{linkName}}</span>
                </td>
                <td>
                {{#if matchedType}}
                    <span id="type_{{@index}}" class="text-success">{{typeName}}</span>
                {{else}}
                    <span id="type_{{@index}}" class="text-danger">{{typeName}}</span>
                {{/if}}
                </td>
                <td>
                    <span id="label_{{@index}}">{{label}}</span>
                </td>
                <td>
                {{#if isJson}}
                    <pre id="json-renderer_{{@index}}" class="json-document">{{data}}</pre>
                {{else}}
                    <span id="data_{{@index}}">{{data}}</span>
                {{/if}}
                </td>
            </tr>
        {{/each}}
        </tbody>
    </table>

    <button id="button-submit" class="button btn btn-block btn-secondary cs-btn-default">Save to canvas</button>
    <button id="button-cancel" class="button btn btn-block btn-secondary cs-btn-close">Cancel</button>
</div>
`;
