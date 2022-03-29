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
 * @file Functions defining the schema implementation for palette item types, for example inheritance and
 * domain/range definitions on link types.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {isText} from "/javascripts/private/util/data.js";

// export function setLinkSemantics(thisLink) {
//     if (thisLink.getLabel()) {
//         if (thisLink.isSemantic()) {
//             thisLink.setIsSemantic(getUniqueSemanticLinkLabelsFor(thisLink).indexOf(thisLink.getLabel()) > -1);
//         }
//     }
// }

export function getUniqueSemanticLinkLabelsFor(link) {
    let srcObj = link.getSourceNode();
    let tgtObj = link.getTargetNode();

    let allProps = computeAllValidPropertiesBetween(srcObj, tgtObj);

    return Object.keys(allProps);
}

export function computeAllValidPropertiesBetween(srcObj, tgtObj) {
    let allSchemas = {};
    let maxProps = {};
    let allProps = {};
    let srcTypeNames = computeAllParentTypesFor(srcObj, true);
    let tgtTypeNames = computeAllParentTypesFor(tgtObj, true);

    //Find the schema for the source object
    for (let nodeType of getPalette().listItems()) {
        if (nodeType.hasSchema()) {
            if (srcTypeNames.indexOf(nodeType.getSchema().getTypeName()) > -1) {
                allSchemas[nodeType.getSchema().getTypeName()] = nodeType.getSchema();
            }
        }
    }

    //Get all properties with source object as subject
    for (let val of Object.values(allSchemas)) {
        addProperties(val, maxProps);
        addParentProperties(val, maxProps, allSchemas);
    }

    //Identify properties with relevant target
    for (let [name, val] of Object.entries(maxProps)) {
        if (isAttribute(val)) {
            if (matchesAttribute(tgtObj)) {
                allProps[name] = val;
            }
        } else {
            if (tgtTypeNames.indexOf(val.range) > -1) {
                allProps[name] = val;
            }
        }
    }

    return allProps;
}

function computeAllParentTypesFor(obj, includeSelf) {
    let parents = [];

    if (obj.type) {
        computeAllParentTypesForObjectType(obj.type, parents, includeSelf);
    }

    return parents;
}

export function computeAllChildTypesFor(obj, includeSelf) {
    let children = [];

    computeAllChildTypesForObjectType(obj.type, children, includeSelf);

    return children.sort();
}

function computeAllChildTypesForObjectType(typeName, children, includeSelf) {
    for (let nodeType of getPalette().listItems()) {
        if (nodeType.hasSchema() && nodeType.getSchema().hasParents()) {
            if (nodeType.getSchema().getParents().indexOf(typeName) > -1) {
                addIfUnique(children, nodeType.getSchema().getTypeName());
            }
        }
    }

    if (includeSelf) {
        if (children.indexOf(typeName) === -1) {
            children.push(typeName);
        }
    }
}

function addIfUnique(array, object) {
    if (array.indexOf(object) === -1) {
        array.push(object);
    }
}

export function computeAllParentTypesForObjectType(typeName, parents, includeSelf) {
    let nodeType = getPalette().getItemById(typeName);

    if (nodeType.hasSchema()) {
        //TODO: Test and fix this
        for (let parentTypeName of nodeType.getSchema().getParents()) {
            computeAllParentTypesForObjectType(parentTypeName, parents, true);
        }

        if (includeSelf) {
            if (parents.indexOf(typeName) === -1) {
                parents.push(typeName);
            }
        }
    }
}

function addProperties(schema, allProps) {
    if (schema.properties) {
        for (let [name, val] of Object.entries(schema.properties)) {
            val.domain = schema.type;
            allProps[name] = val;
        }
    }
}

function addParentProperties(s, allProps, allSchemas) {
    if (s.parents) {
        for (let i = 0; i < s.parents.length; i++) {
            let parent = s.parents[i];
            let ps = allSchemas[parent];

            if (ps) {
                if (ps.properties) {
                    for (let [name, val] of Object.entries(ps.properties)) {
                        val.domain = parent;
                        allProps[name] = val;
                    }
                }

                addParentProperties(ps, allProps, allSchemas);
            }
        }
    }
}

export function isAttribute(prop) {
    return prop.range === '';
}

export function matchesAttribute(tgtNode) {
    //TODO: Make this more dynamic
    return isText(tgtNode);
}

export function computeAllPropertiesFor(schema) {
    let allProps = {};

    if (schema) {
        let allSchemas = {};

        allProps = schema.properties || {};

        for (let val of Object.values(allProps)) {
            val.domain = schema.type;
        }

        for (let nodeType of getPalette().listItems()) {
            if (nodeType.hasSchema()) {
                allSchemas[nodeType.getSchema().getTypeName()] = nodeType.getSchema();
            }
        }

        addParentProperties(schema, allProps, allSchemas);
    }

    return allProps;
}

export function listAllTypeNames() {
    let typeNames = [];

    for (let nodeType of getPalette().listItems()) {
        if (nodeType.hasSchema()) {
            let thisName = nodeType.getSchema().getTypeName();

            if (typeNames.indexOf(thisName) === -1) {
                typeNames.push(thisName);
            }
        }
    }

    typeNames.push('');

    return typeNames.sort();
}

export function getUniqueTextLinkLabels() {
    let result = [];
    let allProps = listSchemaLinks();

    for (let link of getProject().listLinks()) {
        if (link.getLabel()) {
            if (result.indexOf(link.getLabel()) === -1) {
                if (!allProps[link.getLabel()]) {
                    result.push(link.getLabel());
                }
            }
        }
    }

    return result;
}

function listSchemaLinks() {
    let result = {};

    for (let nodeType of getPalette().listItems()) {
        if (nodeType.hasSchema()) {
            if (nodeType.getSchema().getProperties()) {
                for (let [name, prop] of Object.entries(nodeType.getSchema().getProperties())) {
                    result[name] = prop;
                }
            }
        }
    }

    return result;
}
