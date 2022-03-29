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
 * @file Template strings relating to the table pane.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the table metadata template.
 */

export const tableTemplate = `
<!-- controls section -->
<div class="row">
{{#if showContext}}
    <div class="col-1 text-right>
        <label for="cs-table-context-select">Context: </label>
    </div>
    <div class="col-1>
        <select id="cs-table-context-select" class="form-control-sm">
        {{#each contexts}}
           <option value="{{this.name}}" {{#if this.selected}}selected{{/if}}>{{this.name}} ({{this.count}} nodes)</option>
        {{/each}} 
        </select>
    </div>
{{/if}}
    <div class="col-1 text-right">
        <label for="cs-table-filter-select" class="col-form-label-sm">Filter: </label>
    </div>
    <div class="col-2">
        <select id="cs-table-filter-select" class="form-control-sm">
        {{#each typeCounts}}
           <option value="{{@key}}" {{#if this.selected}}selected{{/if}}>{{@key}} ({{this.count}} nodes)</option>
        {{/each}} 
        </select>
    </div>

    <div class="col-1 text-right">
        <label for="cs-table-plain-text" class="col-form-label-sm">Plain text </label>
    </div>
    <div class="col-1">
        <input id="cs-table-plain-text" type="checkbox" class="form-control-sm" {{#if checkedPlainText}}checked{{/if}}/>
    </div>

{{#if checkedPlainText}}
    <div class="col-2 text-right">
        <label for="cs-table-max-length-check" class="col-form-label-sm">Maximum length? </label>
    </div>
    <div class="col-1">
        <input id="cs-table-max-length-check" type="checkbox" class="form-control-sm" {{#if checkedMaxLength}}checked{{/if}}/>
    </div>
    
    {{#if checkedMaxLength}}
    <div class="col-1 text-right">
        <input id="cs-table-max-length" type="text" class="form-control-sm" value="{{maxLength}}" size="5"/>
    </div>
    <div class="col-1">
        <label for="cs-table-max-length" class="col-form-label-sm"> characters</label>
    </div>
    {{/if}}
{{/if}}
</div>

<hr/>

<!-- Main table -->
<div>
    {{#each nodes}}
    <div class="row">
        <!-- icon and node details -->
        <div class="col-3">
            <div class="row">
                <div class="col-1">{{@key}}</div>
                <div class="col-2">
                    <div class="cs-table-node">
                        <div class="cs-table-icon {{nodeClass}}">
                            <a id="node-{{uid}}" class="cs-dynamic-link" title="{{typeName}} - click to view on canvas">
                                <img class="cs-table-image" src="{{icon.icon}}" alt="{{icon.iconAlt}}">
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="cs-table-label">{{label}}</div>
                </div>
            </div>
            <div class="row">
                <div class="col-1"></div>
                <div class="col-10">
                    <div class="cs-metadata">{{created}}, {{user}}</div>
                </div>
            </div>
        </div>
                
        <!-- data and relations -->
        <div class="col-8">
            <!-- properties -->
            {{#if hasProperties}}
            <div>
                <span class="badge badge-warning" data-toggle="collapse" data-target="#properties-{{uid}}" title="Click to expand/collapse this section">Properties</span>
                <div id="properties-{{uid}}" class="collapse show">
                    <table class="table-bordered">
                        <tr>
                            <td><div class="cs-table-header">Name</div></td>
                            <td><div class="cs-table-header">Value</div></td>
                        </tr>
                    {{#each data}}
                        <tr>
                            <td class="cs-table-cell">{{propName}}</td>
                        {{#if isUrl}}
                            <td class="cs-table-cell">
                                <a id="{{elemId}}" class="cs-dynamic-link" title="Click to open this link">{{propVal}}</a>
                            </td>
                        {{else}}
                            <td class="cs-table-cell">{{{propVal}}}</td>
                        {{/if}}
                        </tr>
                    {{/each}}
                    </table>
                </div>
            </div>
            {{/if}}

            <!-- relations -->
            {{#if hasRelations}}
            <div>
                <span class="badge badge-warning" data-toggle="collapse" data-target="#relations-{{uid}}" title="Click to expand/collapse this section">Relations</span>
                <div id="relations-{{uid}}" class="collapse show">
                    <table class="table-bordered">
                        <tr>
                            <td><div class="cs-table-header">Source</div></td>
                            <td><div class="cs-table-header">Link</div></td>
                            <td><div class="cs-table-header">Target</div></td>
                            {{#if hasRelationProperties}}
                                <td><div class="cs-table-header">Properties</div></td>
                            {{/if}}
                        </tr>
                    {{#each relations}}
                        {{#if inward}}
                        <tr>
                            <td>
                                <div class="cs-table-cell">
                                    <a id="link-{{uid}}-{{otherUid}}" class="cs-dynamic-link" title="Click to find on canvas">
                                        {{otherNode}}
                                    </a>
                                </div>
                            </td>
                            <td>
                                <div class="cs-table-cell">
                                    <a id="link-{{uid}}" class="cs-dynamic-link" title="outgoing link - click to find on canvas">
                                        {{label}}
                                    </a>
                                </div>
                            </td>
                            <td>
                                <div class="cs-table-cell">
                                    {{thisNode}}
                                </div>
                            {{#if bidirectional}}
                                <i>(and vice-versa)</i>
                            {{/if}}                            
                            </td>
                            {{#if ../hasRelationProperties}}
                                <td>
                                    <div class="cs-table-cell">
                                    {{#if propList}}
                                        <ul>
                                        {{#each propList}}
                                            <li><b>{{@key}}</b>: {{this.value}} [{{this.type}}]</li>
                                        {{/each}}
                                        </ul>
                                    {{/if}}
                                    </div>
                                </td>
                            {{/if}}
                        </tr>
                        {{/if}}
                        {{#if outward}}
                        <tr>
                            <td>
                                <div class="cs-table-cell">
                                    {{thisNode}}
                                </div>
                            </td>
                            <td>
                                <div class="cs-table-cell">
                                    <a id="link-{{uid}}" class="cs-dynamic-link" title="outgoing link - click to find on canvas">
                                        {{label}}
                                    </a>
                                </div>
                            </td>
                            <td>
                                <div class="cs-table-cell">
                                    <a id="link-{{uid}}-{{otherUid}}" class="cs-dynamic-link" title="Click to find on canvas">
                                        {{otherNode}}
                                    </a>
                                {{#if bidirectional}}
                                    <i>(and vice-versa)</i>
                                {{/if}}                            
                                </div>
                            </td>
                            {{#if ../hasRelationProperties}}
                                <td>
                                    <div class="cs-table-cell">
                                    {{#if propList}}
                                        <ul>
                                        {{#each propList}}
                                            <li><b>{{@key}}</b>: {{this.value}} [{{this.type}}]</li>
                                        {{/each}}
                                        </ul>
                                    </div>
                                    {{/if}}
                                </td>
                            {{/if}}
                        </tr>
                        {{/if}}
                    {{/each}}
                    </table>
                </div>
            </div>
            {{/if}}
        </div>
    </div>
    <hr/>
    {{/each}}
</div>

`;