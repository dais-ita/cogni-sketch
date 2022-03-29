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
 * @file Template strings relating to the admin pane.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   template for the pane container element for the admin tab.
 */
export const adminTemplate = `
<div class="container">
  <div id="cs-users-row" class="row p-1">
    <div class="container">

      <!-- Users -->
      <div id="cs-admin-row-users" class="row p-1"></div>
    </div>
  </div>
</div>
`;

export const usersTemplate = `
<div class="col-sm col-sm-12">
  <button class="badge-pill badge-secondary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-collapse-users" aria-expanded="true" aria-controls="collapseCharts">
    Users (<span id="cs-users-count"></span>)
   </button>

  <div class="collapse show p-1" id="cs-collapse-users">
    <div id="cs-users-list" class="container">
        
    <!-- main actions -->
    <div class="row p-1">
      <span class="dropdown">
        <button class="badge-pill dropdown-toggle" type="button" id="cs-users-main-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <a title="Choose an option">Main options</a>
        </button>
                
        <div class="dropdown-menu" aria-labelledby="cs-users-main-menu">
          <span id="cs-users-refresh-list" class="dropdown-item">Refresh list</span>
          <span id="cs-users-create-user" class="dropdown-item">Create new user</span>
        </div>
      </span>
    </div>
            
    <!-- user list -->
    <div class="row p-1">
      <div class="col-sm-12">
        <table class="table table-hover table-condensed">
          <thead class="cs-table-header">
            <tr>
              <td>#</td>
              <td>Username</td>
              <td>Status</td>
              <td># Palettes</td>
              <td># Projects</td>
              <td>Project</td>
              <td># Actions</td>
              <td>Options</td>
            </tr>
          </thead>
        <tbody>
        {{#each users}}
          {{#if this.currentUser}}
            <tr class="table-success">
          {{else}}
            {{#if this.disabled}}
              <tr class="table-secondary">
            {{else}}
              {{#if this.isAdmin}}
                <tr class="table-primary">
              {{else}}
                <tr>
              {{/if}}
            {{/if}}
          {{/if}}
            <td>{{@index}}</td>
            <td>{{this.name}}</td>
            <td>
              <img id="cs-user-status-{{this.name}}" class="cs-user-status" src="/images/cs/icon-status-offline.svg">
              {{this.status}}
            </td>
            <td>{{this.paletteCount}}</td>
            <td>{{this.projectCount}}</td>
            <td>
              <select id="cs-users-project-list-{{this.name}}" class="form-select" aria-label="Project">
                {{#each this.projects}}
                  <option>{{this}}</option>
                {{/each}}
              </select>
            </td>
            <td><div id="cs-users-project-action-count-{{this.name}}">0</div></td>
            <td>
              <span class="dropdown">
                <button class="badge-pill dropdown-toggle" type="button" id="cs-users-project-options-{{this.name}}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <a title="Choose an option">Options</a>
                </button>
                                    
                <div class="dropdown-menu" aria-labelledby="cs-users-project-options-{{this.name}}">
                  {{#if this.notInitialised}}
                    <span id="cs-users-initialise-user-{{this.name}}" class="dropdown-item">Initialise user</span>
                  {{/if}}
                  <span id="cs-users-change-password-{{this.name}}" class="dropdown-item">Change password</span>
                  <span id="cs-users-project-refresh-{{this.name}}" class="dropdown-item">Refresh</span>
                  <span id="cs-users-project-show-details-{{this.name}}" class="dropdown-item">Show details</span>
                  <span id="cs-users-project-clear-actions-{{this.name}}" class="dropdown-item">Clear actions</span>
                  {{#if this.disabled}}
                    <span id="cs-users-enable-user-{{this.name}}" class="dropdown-item">Enable</span>
                  {{else}}
                    <span id="cs-users-disable-user-{{this.name}}" class="dropdown-item">Disable</span>
                  {{/if}}
                  {{#if this.isAdmin}}
                    <span id="cs-users-revoke-admin-{{this.name}}" class="dropdown-item">Revoke admin</span>
                  {{else}}
                    <span id="cs-users-grant-admin-{{this.name}}" class="dropdown-item">Grant admin</span>
                  {{/if}}
                  <span id="cs-users-project-export-{{this.name}}" class="dropdown-item">Export project</span>
                </div>
              </span>
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>    
  </div>
</div>
        
<!-- details -->
<div class="row p-1">
  <div class="col-sm-12">
    <hr/>
    <canvas id="frequencyChart" class="d-flex" width="400" height="200"></canvas>
    <div id="cs-users-details"></div>
  </div>
</div>
`;
