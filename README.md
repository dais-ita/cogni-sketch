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
