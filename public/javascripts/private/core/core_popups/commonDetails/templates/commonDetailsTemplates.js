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
 * @file Template strings relating to the common popup components (shared by multiple other popup windows).
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the common metadata template.
 */
export const metadataTemplate = `
<!-- metadata details -->
<div class="col-sm text-center">
    <span class="cs-metadata">
        Details for <b><a id="debug-link" title="Show in console" class="cs-hyperlink">{{nodeUid}}</a></b>,
        created on <b>{{createdDate}}</b>,
        created by <b>{{createdUser}}</b>
    </span>
</div>
`;

export const commonTemplate = `
<!-- normal properties section -->
<div id="normal-properties-section" class="row">
    <div id class="col-sm">
        <span class="badge badge-warning" data-toggle="collapse" data-target="#normal-properties" title="Click to expand/collapse this section">Properties</span>
        <div id="normal-properties" class="{{normalPropertyClasses}}">
            <div id="existing-normal-properties">
                <table id="existing-normal-properties-table" class="table">
                    <thead>
                        <tr>
                            <td>Property name</td>
                            <td>Property value</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody id="existing-normal-properties-table-body"></tbody>
                </table>
            </div>
            <div id="add-normal-property">
                <span id="add-property-button" class="badge badge-primary">Add a new property</span>
            </div>
        </div>
    </div>
</div>
<hr class="my-1"/>

{{#if insertRelations}}
<!-- relations section -->
<div id="relations-section" class="row">
    <div class="col-sm">
        <span class="badge badge-warning" data-toggle="collapse" data-target="#relations" title="Click to expand/collapse this section">Relations</span>
        <div id="relations" class="{{relationClasses}}">
            {{#if hasRelations}}
                <table id="relations-table" class="table">
                    <thead>
                        <tr>
                            <td>Relation name</td>
                            <td>Direction</td>
                            <td>Related node</td>
                            <td>Hide</td>
                        </tr>
                    </thead>
                    <tbody id="relations-table-body"></tbody>
                </table>
            {{else}}
                <span>No relationships to or from this node</span>
            {{/if}}
        </div>
    </div>
</div>
<hr class="my-1"/>
{{/if}}

<!-- text properties section -->
<div id="text-properties-section" class="row">
    <div class="col-sm">
        <span class="badge badge-warning" data-toggle="collapse" data-target="#text-properties" title="Click to expand/collapse this section">Text</span>
        <div id="text-properties" class="{{textPropertyClasses}}">
            <div id="existing-text-properties"></div>
            <div id="add-text-property">
                Click here to add a text property
                <span id="add-text-property" class="badge badge-primary">Add text</span>
            </div>
        </div>
    </div>
</div>
<hr class="my-1"/>

<!-- json properties section -->
<div id="json-properties-section" class="row">
    <div class="col-sm">
        <span class="badge badge-warning" data-toggle="collapse" data-target="#json-properties" title="Click to expand/collapse this section">Json</span>
        <div id="json-properties" class="{{jsonPropertyClasses}}"></div>
    </div>
</div>
<hr class="my-1"/>
`;

/**
 * @type {string}   the common normal property template - generated for each normal property.
 */
export const normalPropertyTemplate = `
<tr id="property-{{convertedPropName}}">
    <td>
        <input id="input-existing-prop-name-{{convertedPropName}}" type="text" value="{{propName}}">
    </td>
    <td>
        <input id="input-existing-prop-val-{{convertedPropName}}" type="text" value="{{propVal}}">
    </td>
    <td>
        <img id="delete-existing-prop-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-delete.svg" alt="Delete this property" title="Delete this property">
        <img id="convert-existing-prop-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-convert.svg" alt="Convert this property" title="Convert this property from {{propType}}">
    </td>
</tr>
`;

/**
 * @type {string}   the common text property template - generated for each text property
 */
export const textPropertyTemplate = `
<div id="text-property-{{convertedPropName}}">
    <label for="input-text-prop-name-{{convertedPropName}}">Text property name: </label>
    <input id="input-text-prop-name-{{convertedPropName}}" type="text" value="{{propName}}">
    <img id="delete-text-property-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-delete.svg" alt="Delete this text property" title="Delete this text property">
    <img id="convert-text-property-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-convert.svg" alt="convert this text property" title="convert this text property">
    <span class="badge badge-warning" data-toggle="collapse" data-target="#text-detail-{{convertedPropName}}" title="Click to expand/collapse the text details">show/hide</span><div>
    <div class="row">
        <div class="col-sm">
            <div id="text-detail-{{convertedPropName}}" class="{{textDetailClasses}}">
                <div id="text-editor-{{convertedPropName}}" class="cs-editor-text">{{{propVal}}}</div>
            </div>
        </div>
    </div>
</div>`;

/**
 * @type {string}   the common json property template - generated for each json property
 */
export const jsonPropertyTemplate = `
<div id="json-property-{{convertedPropName}}">
    <label for="input-json-prop-name-{{convertedPropName}}">Json property name: </label>
    <input id="input-json-prop-name-{{convertedPropName}}" type="text" value="{{propName}}">
    <img id="delete-json-property-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-delete.svg" alt="Delete this json property" title="Delete this json property">
    <img id="convert-json-property-{{convertedPropName}}" class="cs-button" src="./images/cs/icon-convert.svg" alt="Convert this json property" title="Convert this json property">
    <pre id="json-renderer-{{convertedPropName}}">{{propVal}}</pre>
    <textarea id="input-json-prop-val-{{convertedPropName}}" class="d-none cs-settings">{{propVal}}</textarea>
</div>
`;

export const relationTemplate = `
<tr>
    <td>{{linkName}}</td>
    <td>{{direction}}</td>
    <td>{{relatedNode}}</td>
    <td>
        <input id="link-{{linkUid}}" type="checkbox" {{disabled}} {{checked}} title="{{linkTitle}}">
    </td>
</tr>
`;