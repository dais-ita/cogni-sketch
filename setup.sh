# create the folders needed to store data for this Cogni-sketch environment:
mkdir -p /data              # this is where all user created data (projects, files, images) will be created
mkdir -p /data/cache        # this is where queries to external services will be cached for reuse
mkdir -p /data/functions    # this is where the list of valid functions will be defined
mkdir -p /data/permissions  # this is where access-control details for shared projects are stored
mkdir -p /data/saves        # this is where projects will be saved
mkdir -p /data/users        # this is where this list of valid users and encrypted passwords are stored

# create the folder to store any optional plugins for this Cogni-sketch environment:
mkdir -p /plugins           # this is where all plugin code will be copied or cloned.  Specific instructions for each
                            # plugin are provided in the plugin README file.

# copy example files to correct locations:
cp /examples/example_creds.js /creds.js
cp /examples/example_plugins/example_plugins.js /plugins.js
cp /examples/example_functions/example_functions.js /data/functions/functions.json
cp /examples/example_project_permissions.json /data/permissions/project_permissions.json
cp /examples/example_users.json /data/users/users.json
