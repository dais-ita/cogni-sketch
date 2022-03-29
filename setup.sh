#
# MIT License
#
# Copyright (c) 2022 International Business Machines
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
# Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
# WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
# OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
# OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# create the folders needed to store data for this Cogni-sketch environment:
echo "creating data folders"
mkdir -p ./data                         # this is where all user created data (projects, files, images) will be created
mkdir -p ./data/cache                   # this is where queries to external services will be cached for reuse
mkdir -p ./data/functions               # this is where the list of valid functions will be defined
mkdir -p ./data/permissions             # this is where access-control details for shared projects are stored
mkdir -p ./data/saves                   # this is where projects will be saved
mkdir -p ./data/saves/admin             # the starting admin user folder
mkdir -p ./data/saves/admin/_palettes   # the starting admin user palettes folder
mkdir -p ./data/users                   # this is where this list of valid users and encrypted passwords are stored

# create the folder to store any optional plugins for this Cogni-sketch environment:
echo "creating plugin folder"
mkdir -p ./plugins           # this is where all plugin code will be copied or cloned.  Specific instructions for each
                            # plugin are provided in the plugin README file.

# copy example files to correct locations:
echo "copying example files"
cp ./examples/example_creds.js ./creds.js
cp ./examples/example_plugins/example_plugins.js ./plugins.js
cp ./examples/example_functions/example_functions.json ./data/functions/functions.json
cp ./examples/example_project_permissions.json ./data/permissions/project_permissions.json
cp ./examples/example_users.json ./data/users/users.json
cp ./examples/example_palettes/* ./data/saves/admin/_palettes/
cp -r ./examples/example_projects/* ./data/saves/admin/

echo "setup.sh - complete"
