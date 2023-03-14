# Cogni-sketch
Welcome to Cogni-sketch - a graphical information and knowledge drawing environment to
support [Human-Agent Knowledge Fusion (HAKF)](https://arxiv.org/pdf/2010.12327.pdf)
between human users and machine agents.

This code and the research behind it has been sponsored by the
[DAIS ITA](https://dais-legacy.org/) (Distributed Analytics and Information Science
International Technology Alliance) research program:

`This research was sponsored by the U.S. Army Research Laboratory and the U.K. Ministry of
Defence under Agreement Number W911NF-16-3-0001. The views and conclusions contained in this
document are those of the authors and should not be interpreted as representing the official
policies, either expressed or implied, of the U.S. Army Research Laboratory, the U.S.
Government, the U.K. Ministry of Defence or the U.K. Government. The U.S. and U.K. Governments
are authorized to reproduce and distribute reprints for Government purposes notwithstanding
any copyright notation hereon.`

To learn more about the environment you can refer to various short videos on YouTube,
e.g. [this introductory video](https://www.youtube.com/watch?v=KmaheXO6D9M)

# Installation
These instructions assume that you have [git](https://git-scm.com/),
[nodeJS and npm](https://nodejs.org/en/) installed, and have used npm to install
[pm2](https://pm2.keymetrics.io/docs/usage/quick-start/) or similar.  The installation has been tested on Mac-OS, Linux and Windows.

To run your own copy of the Cogni-sketch environment clone from the repository

```
git clone https://github.com/dais-ita/cogni-sketch.git
```

...and then install required modules in the usual way:

```
npm install
```

Next run setup.sh to create the required folders to store data for this Cogni-sketch
environment and copy various example files into the correct locations.

```
./setup.sh
```

Finally, edit the `creds.js` file that has been copied into the root folder and specify a
secret key that will be used by express to encrypt cookie values.

You may also wish to add plugins to provide additional actions, functions, pane or popups.
You can do this by following the instructions for each plugin and cloning into the `/plugins`
folder and creating a corresponding entry in `plugins.js` and `data/function/functions.json`
if any functions are added as part of a plugin.

A number of standard plugins can be found in the
[DAIS ITA github organisation](https://github.com/dais-ita), with repository names starting
`cogni-sketch-contrib-`.  Each has individual installation and setup instructions.

You may wish to regularly backup the `/data` folder and all sub-folders since this is where 
all of your user data will be created as you use the Cogni-sketch environment. If you later
copy this folder to a new Cogni-sketch environment then you will have successfully migrated
all user content.

## Creating users
User credentials are encrypted and stored in `/data/users/users.json`, but through simple
extensions of the `passport` module you can extend to other forms and/or integration with
3rd party identity providers.

Running `setup.sh` as described previously defines a single `admin` user with a default
password of `password`.  You can use this default user to login and should change the
password immediately.

The 'Admin' pane appears for any user that is defined as an administrator, including the
default `admin` user. Here you can change existing passwords, lock users or create additional
users as needed.

Don't forget when creating new users you should choose 'Initialise user' to copy the palettes and
projects defined in the `/examples/example_palettes` and `/examples/example_projects` folders.

If you don't initialise the user then when that user logs in they will have no projects and no palettes and will receive an error message until one or more are created.

If you change or add to these folders then your changes will be included with any future
'Initialise user' actions that you perform.

You are now ready to start the application. In an environment where availability is important
it is useful to use a tool such as pm2 to run the application. You can run the server in
`live` or `dev` mode, and the port on which the application will run can be specified in
`/settings.js`.  For example to run the application in dev mode use:
```
pm2 start bin/www_local
```

Alternatively you can simply start with `npm start`.

## Testing
After the application is started, navigate in a browser to the server name and port on which
it is running.  Currently, only Google Chrome is tested.

e.g.

```
http://localhost:5010
```

You should see a prompt to login, so login with the credentials (userid and password) of one
of the  users you have defined.  You should login successfully and see a palette and canvas.
If you specified  any example projects, or copied projects from any other sources, you will
see these listed and the alphabetically lowest project will be loaded by default.

Check that the palette and function contents are as expected for that user, and test the
creation  of a new project and various items on the canvas to ensure that folders and
permissions have been set correctly.


## Examples of use
Start researching a topic, e.g. in your browser. On finding an interesting piece of content,
simply select and drag/drop it onto the Cogni-sketch canvas pane.  This works with text, web
pages, images, html fragments, videos (from youtube.com), tweets (from twitter.com), and
locations (from google maps). Automatic detection of the content type occurs, with the
relevant palette type being used to create a new node with that content on the canvas.

You can also drag and drop types from the left-hand palette to create new empty nodes of that
type on your canvas.

Any node can be edited (double click), and to draw a link between nodes start a drag from the
first node whilst holding the shift key, finishing the drag event on the target node.  Links
between nodes can be labelled by double-clicking on the anchor (small square) at the midpoint
of the link, and if the link anchor is dragged whilst the shift key is held then the anchor
can be moved along the link line, or the linkn can be bent.  Nodes and/or links can be
deleted using the delete key.

Throughout the cogni-sketch environment menus are indicated by small triangle icons and the
main menus are the overall Cogni-sketch menu, the palette menu and the project menu.  You can
create new projects from the project menu, and switch between projects easily.

Projects are persisted as graph data in JSON files in the `data/saves/` folder, in a specific
sub-folder with the name of that project.  Any images pasted from clipboard are saved into
`/images`, actions (for undo/redo) into `/actions/`, and the graph itself into
`ObjectModel.json`.  Sharing `ObjectModel.json` (or the whole project folder) with someone
will allow them to edit a separate copy of your graph and you can easily export your project
from the project menu in the Cogni-sketch environment.

## Collaboration
There are two main modes for collaboration in the cogni-sketch environment:
* read-only project sharing
* dynamic injection of graph changes via API

### Read-only project sharing
For read-only project sharing the implementation is very simple.  Any user can grant permissions (currently limited
to read-only access) to any other user in the system.  This is achieved via the `Project
permissions...` menu item on the project drop down menu.

![project menu](./images/project_menu.png)

This will open the project permissions popup window where you can add or remove user permissions
for the current project.  Note that if you instead receive an error message stating that `Project
permissions are not currently enabled` then you must edit the `projectPermissions` flag in
`/public/javascripts/private/core/core_settings.json` and set it to `true`.  The user must then
refresh their browser to be able to set project permissions.

![project permissions](./images/project_permissions.png)

In the example above you can see that the owner of this project has already added `user_01` as
a collaborator with 'read' permissions, and is about to add 'user_02' with the same.

Note that in the current implementation the list of users appear as a simple dropdown list.
This will not scale to very large volumes of users, and will expose the usernames to any user
so be aware of any security implications for this. Migration to a role-based access control
mechanism with standardised views for granting access could be applied in the future if needed.

In addition to adding users, you can also use the red trashcan icon to delete any individual
user permission.  Changes are only committed when the `Save changes` button is clicked, and on
the server-side all permission data is stored in the file named
`\data\permissions\project_permissions.json` which contains a simple array of project-to-user
permission entries.

In a future version additional permission types will be added, to allow granting of 'write'
permissions to projects once the mechanisms to successfully implement this are designed.

Once the owner of a project has updated and saved the user permissions, any users who have
been granted access can refresh their browser to then see shared projects listed in their
project dropdown menu.

![shared project list](./images/shared_project_list.png)

The entries in the list show that a project is shared and by whom.  Selecting such a project
will allow exploration of the nodes and links and any associated properties, but no changes
can be saved to the project because it is shared in read only mode.  Reloading the project
will show any recent updates made by the project owner, and in a future version it will be
possible to subscribe to live project changes as they are made by the project owner.

Note that the palette will also be opened in read-only mode and indicated with a '*' to show
that it is shared.  This is important because the shared project may contain custom palette
nodes which could otherwise not be rendered unless the palette was also shared.

### Dynamic injection of graph changes via API
The cogni-sketch server exposes a simple REST API to allow the injection of 'proposals' to
any project.  These contain proposed changes to the knowledge graph and can be accepted or
rejected by the project owner. The reason for this approach is that the owner of the shared
project may wish to retain control or oversight of all incoming proposed changes, or they may
wish to trust their collaborators and simply accept all automatically.  The API for accepting
requests is complete, and a simple user interface mode for auto-accepting all proposals is
also available, but the detailed design for a simple user interface to allow proposal review
and acceptance or rejection has not yet been implemented.  An analogy is a real-time version of
`track changes` mode in MS-Word, with changes perhaps listed in an extra narrow column to the
right of the canvas with the ability to quickly preview them before making a decision.

In order to submit a proposal to the cogni-sketch server you can HTTP POST to the following
url:

http://{username}:{password}@{hostname}/project/propose/{projectname}?owner={ownername}

where:
* `{username}` = the name of the user posting the proposal
* `{password}` = the password for the user posting the proposal
* `{hostname}` = the name (and optionally port) of the server, e.g. localhost:5010
* `{projectname}` = the name of the project to update
* `{ownername}` = the name of the user that owns the project to be updated

This means that any number of users can post proposals to any number of projects using
the same simple API.  For this initial version simple http authentication is used, but
a token based method will be considered for future implementation if this proposal
API remains as mechanism to support collaboration.

In the `core_settings.json` file in `\public\javascripts\private\core\` there is a property
named `checkForProposals` which is set to false by default.  With this setting you will see
no effect for any number of proposals that are posted into the system via the API.  If you
can this property to true, refresh the browser, and navigate to the target project for the
owner that the proposals apply to then you will see the project dynamically updated in real
time as the proposals are posted into the system.  Note that the changes may be happening
outside of your visible canvas and you may need to pan/zoom to see them happening.  Note
also that the `proposalPollFrequency` property can also be used to specify the number of
milliseconds between each time that the system is checked for new proposals.

The JSON below gives an example of two nodes and a single link, with various label and data
properties being specified along with positional information (x, y coordinates).

```
{
  "objects": [
    {
      "uid": "proposal_obj_001",
      "type": "header",
      "mode": "empty",
      "expanded": 1,
      "selected": false,
      "showType": false,
      "hide": false,
      "pos": {
        "x": 100,
        "y": 100
      },
      "linkRefs": [],
      "data": {
        "properties": {},
        "label": "A new header"
      }
    },
    {
      "uid": "proposal_obj_002",
      "type": "text",
      "mode": "full",
      "expanded": 1,
      "selected": false,
      "showType": false,
      "hide": false,
      "pos": {
        "x": 500,
        "y": 300
      },
      "linkRefs": [
        "proposal_link_001"
      ],
      "data": {
        "properties": {
          "text": {
            "type": "text",
            "value": "This is my test text node"
          }
        }
      }
    }
  ],
  "links": [
    {
      "uid": "proposal_link_001",
      "selected": false,
      "data": {
        "properties": {},
        "label": "test link"
      },
      "anchorPos": 0.5,
      "bender": 0,
      "bidirectional": false,
      "sourceRef": "proposal_obj_001",
      "targetRef": "proposal_obj_002"
    }
  ]
}
```

You can use a simple HTTP tool such as curl to test this in your environment, for example:

```
curl -H "Content-Type: application/json" -X POST -d '{"objects": [{"uid":"proposal_obj_001", "type": "header", "mode": "empty", "expanded": 1, "selected": false, "showType": false, "hide": false, "pos": {"x": 100, "y": 100}, "linkRefs": [], "data": {"properties": {}, "label": "A new header"}},{"uid": "proposal_obj_002", "type": "text", "mode": "full", "expanded": 1, "selected": false, "showType": false, "hide": false, "pos": {"x": 500, "y": 300},"linkRefs": ["proposal_link_001"],"data":{"properties":{"text": {"type": "text", "value": "This is my test text node"}}}}], "links": [{"uid": "proposal_link_001", "selected": false, "data": {"properties": {}, "label": "test link"}, "anchorPos": 0.5, "bender": 0, "bidirectional": false, "sourceRef": "proposal_obj_001","targetRef": "proposal_obj_002"}]}' "http://admin:password@localhost:5010/project/propose/testproject?owner=user_01"
```

Note that in the current implementation it is not possible to also upload images or files
via this proposal API, but this will be supported in a future version.  A workaround for now
would be to directly upload the file or image binary via the existing HTTP POST APIs but
without them being treated as proposals.  This means they would be immediately accepted into
the specified project, but would not appear as nodes on the canvas until corresponding nodes
were submitted via the proposal API to reference their URLs.
