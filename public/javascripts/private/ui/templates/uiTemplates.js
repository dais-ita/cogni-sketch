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
 * @file Template strings relating to the general user interface.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   template for the tab link (as rendered within the tab ribbon).
 */
export const tabLinkTemplate = `
<li id="csLink{{paneName}}" class="nav-item" data-pos="{{pos}}">
    <div class="cs-tab">
        <a class="nav-link h-100" href="#cs-tab-{{paneName}}">{{paneName}}</a>
    {{#if closeable}}
        <img id="close-tab-{{paneName}}" class="cs-mini-icon" src="./images/cs/icon-close.svg" alt="Close this tab" title="Close this tab">
    {{/if}}
    </div>
</li>
`;

/**
 * @type {string}   template for the pane container element for a tab.
 */
export const paneContainerTemplate = `
<div id="cs-tab-{{paneName}}" data-pos="{{pos}}">
    <div class="cs-scroll" id="cs-main-{{paneName}}"></div>
</div>`;
