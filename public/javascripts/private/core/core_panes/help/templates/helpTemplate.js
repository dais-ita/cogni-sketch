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
 * @file Template strings relating to the help pane.
 *
 * @author Dave Braines
 **/

/**
 * @type {string}   the help metadata template.
 */
export const helpTemplate = `
<div class="container-fluid">

  <!-- Row (plain): Welcome -->
  <div id="cs-help-plugins" class="row p-1">

    <!-- Intro -->
    <div class="col-sm col-sm-12">
      <p class="h2">Welcome to Cogni-Sketch</p>
      
      <p class="cs-help-main">
        This is an experimental web-based application to enable the easy construction of complex knowledge graphs
        through simple activities.  Bringing together human actions and machine capabilities (e.g. information
        processing or extraction) to collaboratively build rich knowledge graphs.
      </p>

      <p class="cs-help-main">
        Please email any questions, or report any feedback/bugs to
        <a id="cs-help-link-001" class="cs-dynamic-link">dave_braines@uk.ibm.com</a>
        or raise them as issues on the GitHub repository below.
      </p>
    </div>

    <!-- Github -->
    <div class="col-sm col-sm-12">
      <span class="h4">Github repository</span>
      <p class="cs-help-main">
        If you want to run your own version, or help with development, report bugs and so on, please use this GitHub
        repository:
        <a id="cs-help-link-013" class="cs-dynamic-link">https://github.ibm.com/dave-braines/cogni-sketch</a>
        (This is a private repo for IBM employees only at this stage, but please request access if you are an IBMer.
        Eventually this code will be open sourced)
      </p>
    </div>
  </div>

  <!-- Row (section): Getting started -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-basics" aria-expanded="false" aria-controls="cs-help-collapse-basics">
        Getting started
      </button>

      <div class="collapse p-1" id="cs-help-collapse-basics">
        <p class="cs-help-main">
          Cogni-Sketch is designed to bring together information resources from existing sources as well as allowing
          you to create your own new knowledge.  Currently, it is not designed to work in a touchscreen only
          environment.
        </p>

        <ul class="cs-help-main">
          <li>You can create/load/save projects from the project drop down menu in the top navigation.</li>
          <li>You can switch palettes from the Cogni-Sketch menu (if needed)</li>
          <li>
            You can extend your palette by creating sections and items, and optionally providing semantic information
          </li>
          <li>You can drag palette items from the palette and drop then onto the canvas</li>
          <li>
            You can drag/drop or copy/paste material from outside this application (e.g. text, images, urls etc)
            <ul>
              <li>Drop onto the canvas and the "best" matching palette item will be chosen to handle that content</li>
              <li>Or drop onto an empty node to use that specific palette type</li>
              <li>
                <span class="cs-help-bold">Tweets</span>:
                Login to Twitter, navigate to a specific tweet and drag that url from that browser tab and drop onto
                the Cogni-Sketch canvas
              </li>
              <li>
                <span class="cs-help-bold">YouTube</span>:
                Navigate to a specific YouTube video and drag/drop that url onto the canvas
              </li>
              <li>
                <span class="cs-help-bold">Text</span> or <span class="cs-help-bold">Html</span>:
                Select a subset of a page content and drag/drop that content onto the Cogni-Sketch canvas
              </li>
              <li>
                <span class="cs-help-bold">Google Maps</span>:
                Search for a specific place and drag/drop the Google Maps url onto the canvas
              </li>
            </ul>
          </li>
          <li>
            You can move, pan and zoom using the usual mouse controls and specific shortcut keys.
            Hold the shift key while moving to pan the canvas.
          </li>
          <li>To create a link between nodes hold the shift key and draw a line between the nodes</li>
          <li>To draw a selection rectangle move the mouse while holding down the left mouse button</li>
          <li>Double click on a node to edit the attributes of that node.  You can add name/value attributes as needed</li>
          <li>Links can be edited too, allowing a label and any number of attributes</li>
          <li>Functions can be dragged from the palette and dropped onto a node or the canvas</li>
          <li>Double click any function to see help about how to use it</li>
          <li>Auto-save is on by default but can be disabled via the project menu</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Row (section): Keyboard shortcuts -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-shortcuts" aria-expanded="false" aria-controls="cs-help-collapse-shortcuts">
        Keyboard shortcuts
      </button>

      <div class="collapse p-1" id="cs-help-collapse-shortcuts">
        <p class="cs-help-main">
          There are a number of keyboard shortcuts that you can use:
        </p>
        
        <table class="table cs-help-main">
          <thead>
            <tr>
              <th scope=""col">Key</th>
              <th scope=""col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                arrow keys:
                <span class="cs-help-bold">left</span>,
                <span class="cs-help-bold">right</span>,
                <span class="cs-help-bold">up</span>,
                <span class="cs-help-bold">down</span>
              </td>
              <td>Pan (move) the canvas</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">-</span>', Ctrl+'<span class="cs-help-bold">=</span>'</td>
              <td>Zoom out / zoom in</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">e</span>'</td>
              <td>Zoom to the full extent, i.e. so that all nodes are visible</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">o</span>'</td>
              <td>Reset to the original extent, i.e. the initial position and zoom when the project was created</td>
            </tr>
            <tr>
              <td><span class="cs-help-bold">Backspace</span> or <span class="cs-help-bold">delete</span></td>
              <td>Delete all selected nodes and links from the canvas</td>
            </tr>
            <tr>
              <td><span class="cs-help-bold">Shift</span></td>
              <td>To draw a link between nodes, or to move the canvas with the mouse</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">s</span>'</td>
              <td>Save the project and palette</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">a</span>'</td>
              <td>Select all nodes and links</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">d</span>'</td>
              <td>Duplicate all selected nodes and links</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">r</span>'</td>
              <td>Reload the page</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">f</span>'</td>
              <td>Move the cursor to the search field to find entities on the canvas</td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">h</span>'</td>
              <td>
                  Hide (or show) any nodes that are directly related to the selected links, but ony if they have no other
                  relationships.  Think of this as a simple collapse/expand function for nodes.
              </td>
            </tr>
            <tr>
              <td>Ctrl+'<span class="cs-help-bold">l</span>'</td>
              <td>
                Select all linked nodes - the nodes directly linked with incoming or outgoing links to any selected node.
              </td>
            </tr>
            <tr>
              <td><span class="cs-help-bold">Escape</span></td>
              <td>Close any open popup window</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Row (section): Videos -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-videos" aria-expanded="false" aria-controls="cs-help-collapse-videos">
        Demonstration videos
      </button>

      <div class="collapse p-1" id="cs-help-collapse-videos">
        <p class="cs-help-main">
          There are a series of YouTube videos listed below which show the basics.
          Note that the earlier ones have a slightly different interface but the basic principles are the same.
        </p>

        <ul class="cs-help-main">
          <li>
            There is a rough YouTube video showing the basics
            <a id="cs-help-link-002" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            And a second YouTube video showing functions and files capabilities
            <a id="cs-help-link-003" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            A third YouTube video showing semantics within the palette
            <a id="cs-help-link-004" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            A fourth YouTube video showing the chat capabilities
            <a id="cs-help-link-005" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            And a video of a recent presentation given at AAAI-FSS, showing live webcam, object detection and complex
            event processing <a id="cs-help-link-006" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            A video showing some simple text and image processing capabilities available through functions
            <a id="cs-help-link-007" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            A video introducing the early storytelling mode
            <a id="cs-help-link-008" class="badge badge-primary text-white">here</a>
          </li>
          <li>
            Finally, a video showing an example for sense-making and intelligence analysis
            <a id="cs-help-link-009" class="badge badge-primary text-white">here</a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Row (section): FAQs -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-faqs" aria-expanded="false" aria-controls="cs-help-collapse-faqs">
        Frequently Asked Questions (FAQs)
      </button>

      <div class="collapse p-1" id="cs-help-collapse-faqs">
        <p class="cs-help-main">
          The questions and answers below may be helpful in understanding how to use Cogni-Sketch
        </p>
        
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope=""col">Question</th>
              <th scope=""col">Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                My items are not appearing where I drop them on the canvas?
              </td>
              <td>
                This can happen on rare occasions and will be fixed.  For now simply select the "reset canvas
                position" item on the project menu to resolve this issue (or press Ctrl+e to zoom to the original
                canvas extent).
              </td>
            </tr>
            <tr>
              <td>
                My canvas is quite messy now.  How can I tidy it up?
              </td>
              <td>
                <ul>
                  <li>
                    Select one or more nodes and press the space key to cycle through the display modes for those
                    nodes. Nodes can either be
                    <span class="cs-help-bold">collapsed</span> (everything is hidden),
                    <span class="cs-help-bold">expanded</span> as default (the original detail is shown,
                    e.g. an image, some text, or a tweet), or
                    <span class="cs-help-bold">expanded as table</span> where all of the properties for the node
                    are listed in a table.
                  </li>
                  <li>
                    You can hide nodes on the canvas.  Double-click on the node to open the node editor and check the
                    "hide" checkbox.  The node will then be hidden on your canvas.  You can also use the "Show hidden
                    nodes" item on the project menu to show (or hide) hidden nodes when needed.
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>
                I edited a text node and the original formatting got removed?
              </td>
              <td>
                The rich text editor is not able to handle all types of html/css formatting so if you edit a text
                node after copying external rich text content onto the canvas then sometimes some of the formatting
                will be removed.  This will be fixed in the future either through the use of a better editor or by
                providing a "html edit" mode as an alternative.
              </td>
            </tr>
            <tr>
              <td>
                I keep adding the same new properties to nodes. Can't I have them created automatically?
              </td>
              <td>
                Yes, just edit the node type and define any common properties and their types in the "properties"
                section.  Any new nodes of this type that you create will automatically have empty properties of
                the correct types created for you.
              </td>
            </tr>
            <tr>
              <td>
                How can I create a picture of something like a tweet in a story frame?
              </td>
              <td>
                Use your operating system screen capture function (e.g., Cmd+Shift+4 on Mac-OS) to capture the
                part of the screen that you want to reference. Then press Ctrl+v to paste this onto the canvas,
                creating a new image node which can then be selected in the story frame from the media dropdown list.
              </td>
            </tr>
            <tr>
              <td>
                How can I move the label on a link?
              </td>
              <td>
                Hold down the shift key whilst dragging the link "anchor" (the small circle that starts at the center
                of the link).  You can move the anchor (and therefore the label) along then length of the link link or
                by dragging the anchor away from the line you can create a bend on the link.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Row (section): Plugins -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-plugins" aria-expanded="false" aria-controls="cs-help-collapse-plugins">
        Core palette item types
      </button>

      <div class="collapse p-1" id="cs-help-collapse-plugins">
        <p class="cs-help-main">
          Listed below are the core palette item types:
        </p>
          <table class="table">
            <thead>
                <tr>
                    <th scope="col">Plugin</th>
                    <th scope="col">Capability</th>
                    <th scope="col">Description</th>
                </tr>
            </thead>
            <tbody>
            <tr>
              <td rowspan="5"><span class="cs-help-bold">Core</span></td>
              <td>
                <img src="/javascripts/private/core/core_panes/help/content/images/item_text.png" width="150px" alt="The Text palette item">
              </td>
              <td>
                <p class="cs-help-main">
                  A simple node that can contain any text content.  Can be created manually, with the text types
                  into the popup node details window, or text can be pasted or dropped onto the canvas or an empty
                  text node.  Rich text (e.g. html) is preserved, including links, but editing the text may remove
                  some formatting as the editor is not a full html editor.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/javascripts/private/core/core_panes/help/content/images/item_file.png" width="150px" alt="The File palette item">
              </td>
              <td>
                <p class="cs-help-main">
                  A simple node to represent a file of any type (e.g. PDF, MS-Word, anything).  Files are also
                  uploaded to the server and stored within your project, and listed in the files section of the
                  palette.  You can create file nodes on the canvas by dropping/copying from your operating system,
                  e.g. "Finder" on Mac-OS, or by using the "File upload" menu item to upload into your files section.
                  Once in the files section any file can be dragged and dropped onto the canvas for processing or
                  linking in to your graph.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/javascripts/private/core/core_panes/help/content/images/item_image.png" width="150px" alt="The Image palette item">
              </td>
              <td>
                <p class="cs-help-main">
                  A simple node to represent an image.  These can be created by dropping/pasting image urls, or
                  image files from your operating system.  They can also be pasted from your clipboard, e.g. because
                  you used the clipboard to screen grab something.  All files are stored on the server and accessed
                  within the canvas as local urls.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/javascripts/private/core/core_panes/help/content/images/item_video.png" width="150px" alt="The Video palette item">
              </td>
              <td>
                <p class="cs-help-main">
                  A simple icon to render an embedded playable video when a suitable url from a video provider
                  is used. Simply paste or drop that url onto the canvas, or onto an empty video node and the video
                  node will be rendered with a playable embedded video that can be used in situ.  Currently, only
                  YouTube urls are supported, but new providers can be added by editing the settings for the video
                  palette item.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/javascripts/private/core/core_panes/help/content/images/item_web.png" width="150px" alt="The Web palette item">
              </td>
              <td>
                <p class="cs-help-main">
                  A simple node that can contain any valid url.  Can be created by pasting or dropping urls onto
                  the canvas or an empty web node.  Note that other palette items (tweet, location, video, image, etc.)
                  may also process urls, so if you paste/drop onto the canvas you may be a different palette item
                  chosen.  To guarantee a web page node drag out an empty web page node and copy/drop the url onto that
                  instead.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Row (section): Versions -->
  <div id="cs-help-plugins" class="row p-1">
    <div class="col-sm col-sm-12">
      <button class="badge-pill badge-primary cs-nlp-wide b-1 dropdown-toggle" type="button" data-toggle="collapse" data-target="#cs-help-collapse-versions" aria-expanded="false" aria-controls="cs-help-collapse-versions">
        Versions
      </button>

      <div class="collapse show p-1" id="cs-help-collapse-versions">
        <a id="cs-help-versions"/>
        <div>
          <p class="cs-help-main">
            The core Cogni-Sketch version is <span class="cs-help-bold">{{applicationVersion}}</span>
          </p>

          <p class="cs-help-main">
            The following plugins are installed:
          </p>

          <ul class="cs-help-main">
          {{#each plugins}}
            <li>
              <a href="{{link}}">{{name}}</a> - {{version}}
            </li>
          {{/each}}
          </ul>
        </div>
      </div>
    </div>
  </div>

  <br/><br/>
</div>
`;
