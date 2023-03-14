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
 * @file Defines the core settings for the client side of the application. These default values apply to all users of
 * the server for this application. Each property is described briefly in line below.
 *
 * @author Dave Braines
 **/

export const settings = {
  /* general application settings */
  "general": {
    /* the name of the default palette */
    "initialPaletteName": 'default',    //TODO: Get this value from settings.js
    /* the name of the current project.  If not specified the alphabetic first project is loaded */
    "currentProject": null,
    /* the list of all supported property types and how they are handled */
    "propertyTypes": {
      "normal": { "handler": 'text', "description": 'Can contain any text.' },
      "date": { "handler": 'text', "parent": "normal", "description": 'Can contain any valid date.  Is listed as a normal property.' },
      "json": { "handler": 'json', "description": 'Can contain any valid JSON.  Is listed as a JSON property.' },
      "long text": { "handler": 'long text', "description": 'Can contain any text data.  Is listed as a rich text property with an editor.'  },
      "text": { "handler": 'text', "parent": 'normal', "description": 'Can contain any text data.  Is listed as a normal property.'  },
      "url": { "handler": 'text', "parent": 'normal', "description": 'Can contain any valid url.  Is listed as a normal property.'  }
    }
  },
  /* global permission flags, to enable/disable certain application functions */
  "permissions": {
    "editSchema": true,
    "projectPermissions": true
  },
  /* project specific setting */
  "project": {
    /* whether individual actions are saved separately to the project */
    "saveActions": true,
    /* the default value for 'autoSave' - can also be toggled via the main application menu by each user */
    "autoSave": true,
    /* the default value for 'debug' - can also be toggled via the main application menu by each user */
    "debug": false,
    /* whether projects should be checked for errors or inconsistencies and have these fixed on project load */
    "cleanOnLoad": true,
    // whether live checking for proposals is enabled (via polling in this version)
    "checkForProposals": false,
    // the frequency (in milliseconds) of polling for proposals
    "proposalPollFrequency": 2000
  },
  /* settings related to the canvas and layout of nodes and links */
  "canvas": {
    /* The relative size for nodes on the canvas */
    "defaultNodeSize": 1,
    /* whether nodes are hidden if marked as hidden.  If set to true this means that nodes will always appear */
    "showHiddenNodes": false,
    /* the delay (in milliseconds) before a node click is processed */
    "doubleClickDelay": 200,
    /* layout information for the canvas */
    "layout": {
      /* whether a simple bounding box at the initial zoom extent is drawn */
      "boundingBox": false,
      /* the initial zoom extent for a new project */
      "initialZoom": 1,
      /* the zoom increment that is used when zooming with mouse/trackpad */
      "zoomFactor": 0.99,
      /* the zoom increment that is used when zooming with shortcut keys */
      "keyZoomFactor": 0.8,
      /* the pan ratio that is used when panning with mouse/trackpad */
      "panFactor": 0.01,
      /* the pan ratio that is used when panning with shortcut keys */
      "keyPanFactor": 0.1,
      /* the 'nudge' ratio that is used when moving selected nodes with shortcut keys */
      "nudgeFactor": 0.01,
      /* the default with of node and link labels when rendered on the canvas */
      "labelWidth": '500px',
      /* the radius of the link anchors (the small circle rendered on each link) */
      "labelAnchorRadius": '5px',
      /* radius and offset details for 'empty' nodes - these are slightly larger than other node modes */
      "empty": {
        "radius": 24,
        "iconSize": 30,
        "iconOffset": 15,
        "labelOffset": 25
      },
      /* radius and offset details for 'mini' nodes, which correspond to 'full' nodes on the canvas */
      "mini": {
        "radius": 16,
        "iconSize": 24,
        "iconOffset": 12,
        "labelOffset": 20
      },
      /*
       * radius and offset details for 'tiny' nodes, which correspond to 'special' nodes on the canvas, usually used
       * to control embedded templates and for other decorative reasons.
      */
      "tiny": {
        "radius": 16,
        "iconSize": 24,
        "iconOffset": 12,
        "labelOffset": 15
      }
    },
    /* When duplicating nodes and links the newly created nodes and links will be rendered offset by these amounts */
    "duplicateOffset": {
      "x": 100,
      "y": 100
    }
  },
  /* search configuration details */
  "search": {
    /* whether 'deep search' is enabled by default.  Can also be changed by each user from the search menu */
    "deepSearch": false,
    /* whether the search is case sensitive by default.  Can also be changed by each user from the search menu */
    "caseSensitive": false
  },
  /* type popup configuration details */
  "typePopup": {
    /* the list of colors that appear in the type popup window */
    "colors": [
      { "text": 'red', "value": '#C62828' },
      { "text": 'green', "value": '#2E7D32' },
      { "text": 'blue', "value": '#311B92' },
      { "text": 'orange', "value": '#F39C12' },
      { "text": 'grey', "value": '#CACFD2' },
      { "text": '*custom', "custom": true }
    ],
  }
};
