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
 * @file Functions relating to the core type popup window.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {getSessionTypePopupColors} from "/javascripts/private/csData/csDataSession.js";
import {httpGet} from "/javascripts/interface/http.js";
import {
    error,
    showToast,
    userConfirm,
    warn
} from "/javascripts/interface/log.js";
import {
    addClasses,
    addOptions,
    createBr,
    createCheckbox,
    createColorChooser,
    createDiv,
    createForm,
    createHr,
    createOption,
    createPara,
    createSelect,
    createSpan,
    createTable,
    createTableLinkCell,
//    createTablePlainTextCell,
    createTableRow,
    createTableSelectCell,
    createTableTextFieldCell,
    createTextField,
    disable,
    enable,
    getElemById,
    getElemValById,
    getSelectedText,
    getSelectedValue,
    getSelectedValues,
    hide,
    isChecked,
    registerEvents,
    setChecked,
    setModalFocus,
    setValue,
    show
} from "/javascripts/private/util/dom.js";
import {createNewType} from "/javascripts/private/wrapper/wrapper.js";
import {
    computeAllChildTypesFor,
    computeAllParentTypesForObjectType,
//    computeAllPropertiesFor,
    listAllTypeNames
} from "/javascripts/private/util/model/schema.js";
import {
    closePopup,
    createCancelButton,
    createInfoArea,
    createSaveButton,
    FORM_NAME,
    getModalObject,
    MSG_NO_CHANGES,
    MSG_SAVED_CHANGES,
    showPopup
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {
    createSampleItem,
    refresh as refreshPaletteType,
    refreshItem
} from "/javascripts/private/ui/palette/types.js";

import {refresh as refreshCanvas} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {settings} from "/javascripts/private/core/core_settings.js";

let FIELD_NAME = 'item-name';
let FIELD_SECTION = 'section';
let FIELD_ENABLE_SCHEMA = 'enable-schema';
let FIELD_SCHEMA = 'div-schema';
let FIELD_TYPE_NAME = 'type-name';
let FIELD_PARENTS = 'parents';
let FIELD_INH_PARENTS = 'inherited-parents';
let FIELD_CHILDREN = 'children';
//let FIELD_PROP_DOMAIN = 'prop-domain-';
let FIELD_PROP_NAME = 'prop-name-';
//let FIELD_PROP_RANGE = 'prop-range-';
let FIELD_PROP_TYPE = 'prop-type-';
//let FIELD_NEW_PROP_DOMAIN = 'prop-new-domain';
let FIELD_NEW_PROP_NAME = 'prop-new-name';
//let FIELD_NEW_PROP_RANGE = 'prop-new-range';
let FIELD_NEW_PROP_TYPE = 'prop-new-type';
let FIELD_DELETE = 'delete';
let FIELD_COLOR = 'standard-colors';
let FIELD_CUSTOM_COLOR = 'custom-color';
let FIELD_CUSTOM_TIP = 'custom-tip';
let FIELD_ICON = 'icon';
let FIELD_SAMPLE = 'sample';
//let FIELD_PROPS_INH = 'props-inherited';
let FIELD_PROPS_DOM = 'props-domain';
let FIELD_PROPS_NEW = 'props-new';

let LABEL_NAME = 'Item name:';
let LABEL_SECTION = 'Section:';
let LABEL_ENABLE_SCHEMA = 'Enable schema: ';
let LABEL_TYPE_NAME = 'Type:';
let LABEL_PARENTS = 'Direct parents:';
let LABEL_INH_PARENTS = 'Inherited parents:';
let LABEL_CHILDREN = 'Children:';
let LABEL_PROP_DELETE = 'delete';
let LABEL_PROP_INHERITED = 'inherited';
let LABEL_COLOR = 'Color:';
let LABEL_ICON = 'Icon:';

let EVENTS_SCHEMA = { 'change': changedSchemaCheckbox };
let EVENTS_TYPE = { 'keyup': changedSchemaTypeName, 'change': checkSchemaTypeName };
let EVENTS_NAME = { 'keyup': checkName, 'change': changedName };
let EVENTS_PARENTS = { 'change': changedSchemaParent };
let EVENTS_COLOR = { 'change': changedNamedColor };
let EVENTS_CUSTOM = { 'change': changedCustomColor };
let EVENTS_ICON = { 'change': changedIcon };

let MSG_INFO_CREATE = 'Palette configuration for new item';
let MSG_REMOVE_SCHEMA = 'If you save these changes all schema information will be removed.  Are you sure?';
//let MSG_NOT_CORE = 'Core items cannot be edited';
let MSG_EMPTY_TYPENAME = 'Type name cannot be empty. Please correct before proceeding.';
let MSG_EMPTY_NAME = 'Item name cannot be empty. Please correct before proceeding.';
let MSG_FIX_ERRORS = 'Please fix the errors before saving';
let MSG_NONE = 'none';
let MSG_CUSTOM_TIP = '<-- Click to set the custom color';

//let PROP_HEADERS = [ 'Domain', 'Name', 'Range', '' ];
let PROP_HEADERS = [ 'Name', 'Type', '' ];

const URL_LIST_ICONS = '/file/listIcons';

let propFields;
let emptyNameError = false;
let duplicateNameError = false;
let emptyTypeNameError = false;
let duplicateTypeNameError = false;
let duplicatePropertyNameError = false;

export function openPopup(nodeType) {
    initialise();

    if (nodeType) {
        openInEditMode(nodeType);
    } else {
        openInCreateMode();
    }
}

function initialise() {
    //TODO: Convert to error object
    emptyNameError = false;
    duplicateNameError = false;
    emptyTypeNameError = false;
    duplicateTypeNameError = false;
    duplicatePropertyNameError = false;
}

function openInCreateMode() {
    propFields = {};

    saveActionMisc('palette:startAddItem', null, { "palette": getPalette().getName() });

    buildPopup();
    showPopup('new', 'popup-form', false);
}

function openInEditMode(nodeType) {
    propFields = {};

    saveActionMisc('palette:startEditItem', null, { "palette": getPalette().getName(), "name": nodeType.getId() });

    buildPopup(nodeType);
    showPopup(nodeType, 'popup-form', false);
}

function hasError() {
    return emptyNameError || duplicateNameError || emptyTypeNameError || duplicateTypeNameError || duplicatePropertyNameError;
}

function isCreating() {
    return getModalObject() === 'new';
}

function savePopup() {
    if (getPalette().isReadOnly()) {
        error('Cannot save changes - palette is read only', null, null, true);
    } else {
//    checkSchemaTypeName();
        if (settings.permissions.editSchema) {
            checkName();
        }

        if (hasError()) {
            showToast(MSG_FIX_ERRORS);
        } else {
            let nodeType;

            if (isCreating()) {
                let newName = getElemValById(FIELD_NAME).trim();

                nodeType = createNewType(newName);
            } else {
                nodeType = getModalObject();
            }

            let changed = saveNormalChanges(nodeType);

            changed = saveSettings(nodeType) || changed;
            changed = saveLayout(nodeType) || changed;

            if (settings.permissions.editSchema && isSchemaSelected()) {
                changed = saveSchemaChanges(nodeType) || changed;
            }

            if (!changed) {
                showToast(MSG_NO_CHANGES);
            } else {
                showToast(MSG_SAVED_CHANGES);
                refreshItem();
                refreshCanvas();
            }

            //TODO: Catch errors here
            getPalette().addItem(nodeType);
            refreshPaletteType(nodeType);

            if (isCreating()) {
                saveActionMisc('palette:endAddItem', null, { "palette": getPalette().getName(), "name": getElemValById(FIELD_NAME).trim() });
            } else {
                saveActionMisc('palette:endEditItem', null, {"palette": getPalette().getName(), "name": getElemValById(FIELD_NAME).trim() });
            }

            closePopup(true);
        }
    }
}

function isSchemaSelected() {
    let answer = false;
    let e = getElemById(FIELD_ENABLE_SCHEMA, true);

    if (e) {
        answer = e.checked;
    }

    return answer;
}

function saveNormalChanges(nodeType) {
    let changed;

    changed = saveName(nodeType);
//    changed = saveLabel(nodeType) || changed;
    changed = saveSection(nodeType) || changed;
    changed = saveIcon(nodeType) || changed;
    changed = saveColor(nodeType) || changed;

    return changed;
}

function saveSettings(nodeType) {
    let changed = false;
    let settText = getElemValById('settingsText');
    let settJson;

    try {
        settJson = JSON.parse(settText);
    } catch(e) {
        showToast('Something went wrong saving the settings.  The changes have been ignored.');
    }

    if (settJson) {
        if (settJson !== nodeType.getSettings().export()) {
            nodeType.getSettings().replaceWith(settJson);
            changed = true;
        }
    }

    return changed;
}

function saveLayout(nodeType) {
    let changed = false;
    let layoutText = getElemValById('layoutText');

    if (layoutText) {
        if (layoutText !== nodeType.getLayout()) {
            nodeType.setLayout(layoutText);
            changed = true;
        }
    }

    return changed;
}

function saveSchemaChanges(nodeType) {
    let changed = false;
    let hasSchema = getElemById(FIELD_ENABLE_SCHEMA).checked;

    if (nodeType.hasSchema() && !hasSchema) {
        //The schema is being removed - check with the user
        let proceed = userConfirm(MSG_REMOVE_SCHEMA);

        if (proceed) {
            nodeType.removeSchema();
            changed = true;
        }
    } else {
        if (!nodeType.hasSchema()) {
            nodeType.createSchema();
        }

        changed = saveSchemaTypeName(nodeType);
        changed = saveSchemaParents(nodeType) || changed;
        changed = saveSchemaProperties(nodeType) || changed;
    }

    return changed;
}

function saveName(nodeType) {
    let changed = false;

    let oldName = nodeType.getId();
    let newName = getElemValById(FIELD_NAME);

    if (newName !== oldName) {
        changed = recordChange('name', [ oldName, newName ]);

        //The name has changed so this must be renamed in the palette too
        getPalette().renameItem(nodeType, newName);
    }

    return changed;
}

//function saveLabel(nodeType) {
//    let changed = false;
//
//    //Currently label is just an exact copy of "name"
//    let newName = getElemValById(FIELD_NAME);
//
//    if (newName !== nodeType.getLabel()) {
//        changed = recordChange('Label changed', [nodeType.getLabel(), newName]);
//        nodeType.setLabel(newName);
//    }
//
//    return changed;
//}

function saveSection(nodeType) {
    let changed = false;

    let newSection = getSelectedValue(FIELD_SECTION);

    if (newSection !== nodeType.getSection()) {
        changed = recordChange('section', [ nodeType.getSection(), newSection ]);
        nodeType.setSection(newSection);
    }

    return changed;
}

function saveIcon(nodeType) {
    let changed = false;

    let newIcon = getSelectedValue(FIELD_ICON);

    if (newIcon !== nodeType.getIcon()['icon']) {
        changed = recordChange('icon', [ nodeType.getIcon()['icon'], newIcon ]);
        nodeType.setIcon({ 'icon': newIcon });
    }

    let newName = getElemValById(FIELD_NAME);
    let newIconAlt = calculateAltText(newName);

    if (newIconAlt !== nodeType.getIcon().iconAlt) {
        changed = recordChange('iconAlt', [ nodeType.getIcon().iconAlt, newIconAlt ]);
        nodeType.setIcon({ 'iconAlt': newIconAlt });
    }

    return changed;
}

function saveColor(nodeType) {
    let changed = false;

    let colorName = getSelectedText(FIELD_COLOR);
    let cd = getColorDetailsForName(colorName);
    let color = {};

    if (cd['custom']) {
        color.hex = getElemValById(FIELD_CUSTOM_COLOR);
    } else {
        delete color.hex;
        color.name = cd['text'];
    }

    if (color.name) {
        if (color.name !== nodeType.getNormalColor()) {
            changed = recordChange('color.name', [ nodeType.getNormalColor(), color.name ]);
            nodeType.setNormalColor(color.name);
            nodeType.removeCustomColor();
        }
    } else {
        if (color.hex !== nodeType.getCustomColor()) {
            changed = recordChange('color.hex', [ nodeType.getCustomColor(), color.hex ]);
            nodeType.setCustomColor(color.hex);
            nodeType.removeNormalColor();
        }
    }

    return changed;
}

function saveSchemaTypeName(nodeType) {
    let changed = false;

    let newTypeName = getElemValById(FIELD_TYPE_NAME);
    let existingTypeName;

    if (newTypeName) {
        if (nodeType.hasSchema()) {
            existingTypeName = nodeType.getSchema().getTypeName();
        }

        if (newTypeName !== existingTypeName) {
            changed = recordChange('schema(type)', [existingTypeName, newTypeName]);
            nodeType.getSchema().setTypeName(newTypeName);
        }
    }

    return changed;
}

function saveSchemaParents(nodeType) {
    let changed = false;

    let parentTypes = getSelectedValues(FIELD_PARENTS);

    if (parentTypes.length === 0) {
        //No parents so remove from schema
        if (nodeType.hasSchema()) {
            if (nodeType.getSchema().hasParents()) {
                changed = recordChange('parents(removed)', [ nodeType.getSchema().getParents(), null ]);
            }

            nodeType.getSchema().removeParents();
        }
    } else {
        //Some parents
        let newParents = [];

        //First copy the parents that need to be kept
        for (let parent of nodeType.getSchema().getParents()) {
            if (parentTypes.indexOf(parent) > -1) {
                newParents.push(parent);
            } else {
                changed = recordChange('parent(removed)', [ parent, null ] );
            }
        }

        //Now see if there are new parents
        for (let parent of parentTypes) {
            if (newParents.indexOf(parent) === -1) {
                newParents.push(parent);
                changed = recordChange('parent(added)', [ null, parent ]);
            }
        }

        nodeType.getSchema().setParents(newParents);
    }

    return changed;
}

function saveSchemaProperties(nodeType) {
    let changed = false;

    let newProps = computeNewProperties();

    if (newProps && (Object.entries(newProps).length > 0)) {
        if (nodeType.getSchema().hasProperties()) {
            nodeType.getSchema().setProperties(newProps);
            changed = recordChange('schema(new)', [ newProps, null ]);
        } else {
            let finalProps = {};
            let currentProps = nodeType.getSchema().getProperties() || {};

            for (let [name, newProp] of Object.entries(newProps)) {
                let currentProp = currentProps[name];

                if (currentProp) {
                    if (newProp.range !== currentProp.range) {
                        changed = recordChange('property(range)', [currentProp.range, newProp.range], name);
                    }

                    finalProps[name] = newProp;
                } else {
                    //Does not exist, so just add it
                    finalProps[name] = newProp;
                    changed = recordChange('property(added)', [ newProp, null ], name);
                }
            }

            for (let [name, oldProp] of Object.entries(currentProps)) {
                if (!finalProps[name]) {
                    changed = recordChange('Property(removed)', [ oldProp, null], name);
                }
            }

            nodeType.getSchema().setProperties(finalProps);
        }
    } else {
        //No new properties
        if (nodeType.getSchema().hasProperties()) {
            changed = recordChange('Properties(removed all)', [ nodeType.getSchema().getProperties(), null], name);
            nodeType.getSchema().removeProperties();
        }
    }

    return changed;
}

function recordChange(propName, obj, extraInfo) {
    if (!isCreating()) {
        let actionName = `palette:editItem:changed:${propName}`;

        if (extraInfo) {
            actionName += '(extraInfo)';
        }


        saveActionMisc(actionName, null, { "palette": getPalette().getName(), "property": propName, "oldValue": obj[0], "newValue": obj[1] });
    }

    return true;
}

function computeNewProperties() {
    let newProps = {};
    let newTypeName = getElemValById(FIELD_TYPE_NAME);

    for (let propField of Object.values(propFields)) {
        let propDomain = newTypeName;
        let propName = getElemValById(propField[2].id);
        let propType = getElemValById(propField[3].id);

        if (propDomain === newTypeName) {
            if (propName) {
                newProps[propName] = {
                    "domain": propDomain,
                    "type": propType};
            }
        }
    }

    return newProps;
}

function updateProperties() {
    // let newTypeName = getElemValById(FIELD_TYPE_NAME);
    //
    // for (let propField of Object.values(propFields)) {
    //     let linkProp = propField[5];
    //
    //     if (!linkProp || linkProp.innerHTML !== LABEL_PROP_INHERITED) {
    //         setValue(propField[2].id, newTypeName);
    //     }
    // }
}

function changedSchemaCheckbox() {
    if (settings && settings.permissions && settings.permissions.editSchema) {
        if (isChecked(FIELD_ENABLE_SCHEMA)) {
            changedName();
            showSchemaSection();
        } else {
            hideSchemaSection();
        }
    }
}

function changedSchemaTypeName() {
    updateProperties();
}

function checkSchemaTypeName() {
    if (!isCreating()) {
        let typeName = getElemValById(FIELD_TYPE_NAME).trim();

        checkIfDuplicateTypeName(typeName);
        checkIfEmptyTypeName(typeName);
    }
}

function checkIfDuplicateName(nameInField) {
    let existingTypes = getPalette().listItems();

    if (nameHasChanged(nameInField)) {
        for (let thisType of existingTypes) {
            if (thisType.getId().trim().toLowerCase() === nameInField.trim().toLowerCase()) {
                showToast(`Another palette item is already called <b>${nameInField}</b>. Please correct before proceeding.`);
                duplicateNameError = true;
                getElemById(FIELD_NAME).focus();
            }
        }
    }
}

function nameHasChanged(nameInField) {
    let result = true;
    let nodeType = getModalObject();

    if (nodeType && (nodeType !== 'new')) {
        result = (nodeType.getId().toLowerCase() !== nameInField.trim().toLowerCase());
    }

    return result;
}

function checkIfEmptyName(name) {
    if (name) {
        emptyNameError = false;
    } else {
        showToast(MSG_EMPTY_NAME);
        emptyNameError = true;
        getElemById(FIELD_NAME).focus();
    }
}

function checkIfDuplicateTypeName(typeName) {
    if (!isCreating()) {
        let thisNodeType = getModalObject();

        if (thisNodeType.hasSchema()) {
            if (thisNodeType.getSchema().getTypeName() !== typeName) {
                let isDuplicate = false;

                for (let nodeType of getPalette().listItems()) {
                    if (nodeType.hasSchema() && (nodeType.getSchema().getTypeName() === typeName)) {
                        isDuplicate = true;
                    }
                }

                if (isDuplicate) {
                    showToast(`Another node already defines the schema type name <b>${typeName}</b>. Please correct before proceeding.`);
                    duplicateTypeNameError = true;
                    getElemById(FIELD_TYPE_NAME).focus();
                } else {
                    duplicateTypeNameError = false;
                }
            }
        }
    }
}

function checkIfEmptyTypeName(typeName) {
    if (typeName) {
        emptyTypeNameError = false;
    } else {
        showToast(MSG_EMPTY_TYPENAME);
        emptyTypeNameError = true;
        getElemById(FIELD_TYPE_NAME).focus();
    }
}

function deleteSchemaProperty(propKeyName) {
    if (propFields[propKeyName]) {
        let row = propFields[propKeyName][0];
        let name = propFields[propKeyName][2].value;

        row.remove();
        delete propFields[propKeyName];

        showToast(`Property <b>${name}</b> has been deleted`);
    } else {
        showToast(`Property <b>${name}</b> could not be found and was not deleted`);
    }
}

function changedSchemaParent(event, pNodeType) {
    let type = pNodeType;

    if (!type && !isCreating()) {
        type = getModalObject();
    }

    if (type) {
        let selParents = getSelectedValues(FIELD_PARENTS);

//        recalculateParentProperties(selParents);
        recalculateEnabledParents(selParents, type);
        recalculateInheritedParents(selParents);
    }
}

function changedSchemaPropertyName(event, propKeyName) {
    let changedPropName = getElemValById(propFields[propKeyName][3].id);

    if (changedPropName) {
        if (isDuplicatePropertyName(propKeyName, changedPropName)) {
            showToast(`Cannot have duplicate property name <b>%${changedPropName}</b>. Please correct before proceeding.`);
            propFields[propKeyName][3].focus();
            duplicatePropertyNameError = true;
        } else {
            duplicatePropertyNameError = false;
        }
    }
}

function deleteItem() {
    if (getPalette().isReadOnly()) {
        error('Cannot delete item - palette is read only', null, null, true);
    } else {
        let type = getModalObject();

        if (type.getSection() === 'core') {
            showToast('Core palette items cannot be deleted.');
        } else {
            let objList = getProject().listNodesByType(type);
            let msgText;

            if (objList.length === 0) {
                msgText = 'If you delete this item all details will be lost.  Are you sure?';
            } else {
                msgText = `If you delete this item all details will be lost and ${objList.length} object(s) will lose their type.  Are you sure?`;
            }

            let proceed = userConfirm(msgText);

            if (proceed) {
                if (type) {
                    getPalette().deleteItem(type);

                    for (let thisObj of getProject().listNodes()) {
                        let palType = thisObj.getType();

                        if (palType === type) {
                            thisObj.removeType();
                        }
                    }
                } else {
                    warn(`Item could not be deleted`);
                }

                saveActionMisc('palette:deleteItem', null, { "palette": getPalette().getName(), "name": type.getId() });

                closePopup(true);
                refreshPaletteType();
                refreshCanvas();
            }
        }
    }
}

function changedName() {
    let name = getElemValById(FIELD_NAME);

    updateSample();

    if (name) {
        setValue(FIELD_TYPE_NAME, name);
        updateProperties();
    }
}

function checkName() {
    let name = getElemValById(FIELD_NAME).trim();

    checkIfDuplicateName(name);
    checkIfEmptyName(name);

    updateSample();

    if (name) {
        setValue(FIELD_TYPE_NAME, name);
        updateProperties();
    }
}

function enableOrDisableCustomColor() {
    let selColor = getSelectedValue(FIELD_COLOR);

    let cd = getColorDetailsForValue(selColor);

    if (cd['custom']) {
        enable(FIELD_CUSTOM_COLOR);
        show(FIELD_CUSTOM_TIP);
    } else {
        disable(FIELD_CUSTOM_COLOR);
        setValue(FIELD_CUSTOM_COLOR, cd['value']);
        hide(FIELD_CUSTOM_TIP);
    }
}

function changedNamedColor() {
    enableOrDisableCustomColor();
    updateSample();
}

function changedCustomColor() {
    updateSample();
}

function changedIcon() {
    updateSample();
}

function updateSample() {
    let colorName = getSelectedText(FIELD_COLOR);
    let iconUrl = getSelectedValue(FIELD_ICON);
    let label = getElemValById(FIELD_NAME);
    let iconAlt = calculateAltText(label);
    let color = {};
    let cd = getColorDetailsForName(colorName);

    if (label.length > 20) {
        label = label.substring(0, 20) + '...';
    }

    if (cd['custom']) {
        color.hex = getElemValById(FIELD_CUSTOM_COLOR);
    } else {
        color.name = cd['text'];
    }

    let li = createSampleItem(color, iconUrl, iconAlt, label);

    let s = getElemById(FIELD_SAMPLE);

    if (s.childNodes && s.childNodes.length > 0) {
        s.removeChild(s.childNodes[0]);
    }

    s.appendChild(li);
}

function calculateAltText(label) {
    return 'icon-' + label.split(' ').join('-');
}

function getColorDetailsForName(colorName) {
    return getColorDetailsFor('text', colorName);
}

function getColorDetailsForValue(colorVal) {
    return getColorDetailsFor('value', colorVal);
}

function getColorDetailsFor(propName, propVal) {
    let colors = getSessionTypePopupColors();
    let cd;
    let customCd;

    for (let c of colors) {
        if (c[propName] === propVal) {
            cd = c;
        }
        if (c.custom) {
            customCd = c;
        }
    }

    if (!cd) {
        customCd.custom = true;
        cd = customCd;
    }

    return cd;
}

function isDuplicatePropertyName(propKeyName, changedPropName) {
    let isDuplicate = false;

    for (let [name, val] of Object.entries(propFields)) {
        if (name !== propKeyName) {
            let thisPropName = getElemValById(val[3].id);

            if (thisPropName === changedPropName) {
                isDuplicate = true;
            }
        }
    }

    return isDuplicate;
}

function showSchemaSection(nodeType) {
    show(FIELD_SCHEMA);
    setChecked(FIELD_ENABLE_SCHEMA, true);

    if (!getElemValById(FIELD_TYPE_NAME)) {
        if (nodeType.hasSchema()) {
            if (nodeType.getId() !== nodeType.getSchema().getTypeName()) {
                setValue(FIELD_TYPE_NAME, nodeType.getSchema().getTypeName());
            } else {
                setValue(FIELD_TYPE_NAME, getElemValById(FIELD_NAME));
            }
        }
    }

    updateProperties();
}

function hideSchemaSection() {
    hide(FIELD_SCHEMA);
    setChecked(FIELD_ENABLE_SCHEMA, false);
    setValue(FIELD_TYPE_NAME, '');
}

function buildPopup(nodeType) {
    let f = createForm(FORM_NAME);

    if (nodeType) {
        createInfoArea(f, `Palette configuration for item: <b>${nodeType.getId()}</b>`);
    } else {
        createInfoArea(f, MSG_INFO_CREATE);
    }

    buildMainSection(f, nodeType);
    buildSettingsSection(f, nodeType);
    buildLayoutSection(f, nodeType);

    if (settings.permissions.editSchema) {
        buildSchemaSection(f, nodeType);
    }

    buildButtons(f);

    if (nodeType && settings.permissions.editSchema) {
        initialiseSchemaFields(nodeType);
        changedSchemaParent(null, nodeType);
    }

    enableOrDisableCustomColor();
}

function buildMainSection(parent, nodeType) {
    let itemName;
    let sectionName;

    if (nodeType) {
        itemName = nodeType.getId();
    } else {
        itemName = '';
    }

    sectionName = calculateSectionName(nodeType);

    let n = createTextField(parent, FIELD_NAME, LABEL_NAME, itemName);
    registerEvents(n, EVENTS_NAME);
    setModalFocus(FORM_NAME, FIELD_NAME);

    let sec = createSelect(parent, FIELD_SECTION, LABEL_SECTION);
    addSectionOptions(sec, sectionName);

    if (!isCreating()) {
        if (nodeType) {
            let delElem = document.createElement('SPAN');
            delElem.innerHTML = `&nbsp;&nbsp;&nbsp;<img id="${FIELD_DELETE}" class="cs-button" src="./images/cs/icon-delete.svg" alt="Delete this palette item" title="Delete this palette item">`;

            parent.appendChild(delElem);
            delElem.addEventListener('click', function() { deleteItem(); });
        }
    }

    createBr(parent);

    buildColorFields(parent, nodeType);
    buildIconFields(parent);
    let samp = createDiv(parent, FIELD_SAMPLE);
    samp.style.display = 'inline';

    createBr(parent);
}

function calculateSectionName(nodeType) {
    let sectionName;

    if (nodeType) {
        sectionName = nodeType.getSection();
    } else {
        sectionName = '';
        for (let i of $('.ui-state-active')) {
            if (i.parentElement.id === 'cs-acc-palette') {
                sectionName = i.innerText;
            }
        }
    }

    return sectionName;
}

function buildColorFields(parent, nodeType) {
    let dd = createSelect(parent, FIELD_COLOR, LABEL_COLOR, false, EVENTS_COLOR);
    let thisColor = addColorOptions(dd, nodeType);
    let colorVal;

    if (thisColor.value === '(custom)') {
        colorVal = thisColor.hex;
    } else {
        colorVal = thisColor.value;
    }

    let cc = createColorChooser(parent, FIELD_CUSTOM_COLOR, '', colorVal, true);
    registerEvents(cc, EVENTS_CUSTOM);
    createSpan(parent, FIELD_CUSTOM_TIP, MSG_CUSTOM_TIP);
    hide(FIELD_CUSTOM_TIP);

    createBr(parent);
}

function buildIconFields(parent) {
    createSelect(parent, FIELD_ICON, LABEL_ICON, false, EVENTS_ICON);
    requestAndPopulateIcons();
}

function requestAndPopulateIcons() {
    httpGet(URL_LIST_ICONS, callbackListIcons);
}

function callbackListIcons(rawArray) {
    let dd = /** @type {HTMLSelectElement} */ document.getElementById(FIELD_ICON);
    let nodeType;
    let iconArray = [];

    if (!isCreating()) {
        nodeType = getModalObject();
    }

    for (let icon of rawArray) {
        let iconObj = { 'text': icon, 'value': './images/palette/' + icon };

        if (nodeType) {
            let icon = nodeType.getIcon();

            if (iconObj.value === icon.icon) {
                iconObj.selected = true;
            }
        }

        iconArray.push(iconObj);
    }

    addOptions(dd, iconArray);

    updateSample();
}

function addColorOptions(ddElem, nodeType) {
    let myColors = [];
    let currentColor;
    let tgtNodeColor;
    let customColor = false;

    let colors = getSessionTypePopupColors();

    if (nodeType) {
        tgtNodeColor = nodeType.getNormalColor();
    } else {
        //TODO: Make this dynamic
        tgtNodeColor = 'green';
    }

    for (let c of colors) {
        let newC = { 'text': c.text, 'value': c.value };

        if (c.text === tgtNodeColor) {
            newC.selected = true;
            currentColor = newC;
        }

        if (c.custom) {
            newC.value = '(custom)';

            if (nodeType && nodeType.hasCustomColor()) {
                newC.hex = nodeType.getCustomColor();
                newC.selected = true;
            }

            customColor = newC;
        }

        myColors.push(newC);
    }

    myColors.sort(function(a, b) {
        let x = a.text.toLowerCase();
        let y = b.text.toLowerCase();

        if (x === '*custom') {return 1;}
        if (y === '*custom') {return -1;}
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
    });

    addOptions(ddElem, myColors);

    return currentColor || customColor;
}

function addSectionOptions(secElem, secName) {
    let sections = [];

    for (let sec of getPalette().getSections()) {
        let newSec = { "text": sec.name, "value": sec.name };

        if (sec.name === secName) {
            newSec.selected = true;
        }

        sections.push(newSec);
    }

    addOptions(secElem, sections);
}

function buildSchemaSection(parent, nodeType) {
    let newElem = document.createElement('DIV');

    newElem.innerHTML = `
<div class="container">
    <div class="row">
        <div class="col-sm">
            <span class="badge badge-warning" data-toggle="collapse" data-target="#typeSchema" title="Click to expand/collapse this section">Schema</span>
            <div id="typeSchema" class="collapse"/>
        </div>
    </div>
</div>
<hr class="my-1"/>`;

    parent.appendChild(newElem);

    let schemaDetails = document.getElementById('typeSchema');
    buildEnableSchemaCheckbox(schemaDetails);

    let d = createDiv(schemaDetails, FIELD_SCHEMA);

    let dOld = createDiv(d, 'div-schema-old');
    createHr(dOld);
    buildSchemaTypeName(dOld);
    createBr(dOld);
    buildSchemaParents(dOld);
    createBr(dOld);
    buildSchemaChildren(dOld);
    createBr(dOld);

    addClasses(dOld, ['d-none']);

    buildSchemaProperties(d, nodeType);
    // createHr(d);
}

function buildEnableSchemaCheckbox(parent) {
    if (settings && settings.permissions && settings.permissions.editSchema) {
        createCheckbox(parent, FIELD_ENABLE_SCHEMA, LABEL_ENABLE_SCHEMA, false, EVENTS_SCHEMA);
    } else {
        createSpan(parent, 'cs-type-not-allowed', 'You do not have permission to create/edit schema data');
    }
}

function buildSchemaTypeName(parent) {
    let e = createTextField(parent, FIELD_TYPE_NAME, LABEL_TYPE_NAME, '', false);

    registerEvents(e, EVENTS_TYPE);
}

function buildSchemaParents(parent) {
    let pe = createSelect(parent, FIELD_PARENTS, LABEL_PARENTS, true);
    registerEvents(pe, EVENTS_PARENTS);

    createBr(parent);

    createSpan(parent, FIELD_INH_PARENTS, '', LABEL_INH_PARENTS);
}

function buildSchemaChildren(parent) {
    createSpan(parent, FIELD_CHILDREN, '', LABEL_CHILDREN);
}

// function recalculateParentProperties(selParents) {
//     let inhParents = [];
//
//     for (let i of selParents) {
//         if (i) {
//             computeAllParentTypesForObjectType(i, inhParents, true);
//         }
//     }
//
//     inhParents.sort();
//
//     let ip = getElemById(FIELD_PROPS_INH);
//     let it;
//
//     if (ip) {
//         it = ip.children[0];
//
//         if (it) {
//             it.remove();
//         }
//
//         it = createTable(ip, null, PROP_HEADERS);
//         let allTypes = listAllTypeNames();
//
//         for (let parent of inhParents) {
//             for (let thisNodeType of getPalette().listItems()) {
//                 if (thisNodeType.hasSchema() && (thisNodeType.getSchema().getTypeName() === parent)) {
//                     if (thisNodeType.getSchema().getProperties()) {
//                         for (let [propName, propVal] of Object.entries(thisNodeType.getSchema().getProperties())) {
//                             buildExistingPropertyRow(it, thisNodeType.getSchema().getTypeName(), propVal.domain, propName, propVal.range, null, allTypes, true);
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

function recalculateEnabledParents(selParents, nodeType) {
    let inhParents = [];

    for (let i of selParents) {
        if (i) {
            computeAllParentTypesForObjectType(i, inhParents, false);
        }
    }

    let ep = getElemById(FIELD_PARENTS);

    for (let opt of ep.options) {
        if (inhParents.indexOf(opt.value) > -1) {
            opt.disabled = true;
            opt.selected = false;
        } else {
            if (nodeType.hasSchema()) {
                opt.disabled = (opt.value === nodeType.getSchema().getTypeName());
            }
        }
    }
}

function recalculateInheritedParents(selParents) {
    let inhParents = [];

    for (let i of selParents) {
        if (i) {
            computeAllParentTypesForObjectType(i, inhParents, true);
        }
    }

    inhParents.sort();

    let inhParText;

    if (inhParents.length > 0) {
        inhParText = inhParents.join();
    } else {
        inhParText = '(none)';
    }

    setValue(FIELD_INH_PARENTS, inhParText);
}

function listAllBasicTypeNames() {
    //TODO: Replace this with a live lookup to settings.general.propertyTypes when more types are selected
    return [ 'normal', 'long text', 'json' ];
}

function buildSchemaProperties(parent, nodeType) {
//    let allTypes = listAllTypeNames();
    let allTypes = listAllBasicTypeNames();
    let pos = 1;
    // let inheritedProperties = {};
    let existingProperties = {};

    if (nodeType && nodeType.hasSchema()) {
//        let allProps = computeAllPropertiesFor(nodeType.getSchema());
        existingProperties = nodeType.getSchema().getProperties();

        // if (allProps) {
        //     for (let [name, val] of Object.entries(allProps)) {
        //         if (isInherited(nodeType, val)) {
        //             inheritedProperties[name] = val;
        //         } else {
        //             existingProperties[name] = val;
        //         }
        //     }
        // }
    }

    // createHr(parent);
    // createPara(parent, '', '<b>Inherited properties</b>');
//    let ip = createDiv(parent, FIELD_PROPS_INH);
//    let it = createTable(ip, null, PROP_HEADERS);

    // for (let [name, prop] of Object.entries(inheritedProperties)) {
    //     buildExistingPropertyRow(it, nodeType.getSchema().getTypeName(), prop.domain, name, prop.range, null, allTypes, true);
    // }

    if (existingProperties && (Object.keys(existingProperties).length > 0)) {
//        createHr(parent);
        createPara(parent, '', '<b>Defined properties</b>');
        let dp = createDiv(parent, FIELD_PROPS_DOM);
        let dt = createTable(dp, null, PROP_HEADERS);

        for (let [name, prop] of Object.entries(existingProperties)) {
            buildExistingPropertyRow(dt, name, prop.domain, name, prop.type, pos++, allTypes, false);
        }
    }

//    createHr(parent);
    createPara(parent, '', '<b>New properties</b>');
    let np = createDiv(parent, FIELD_PROPS_NEW);
    let nt = createTable(np, null, PROP_HEADERS);

    let typeName = getElemValById(FIELD_TYPE_NAME);

    buildNewPropertyRow(nt, typeName, pos++, allTypes);
}

// function isInherited(typeName, prop) {
//     return (prop.domain !== typeName.getSchema().getTypeName());
// }

function buildExistingPropertyRow(parent, type, domain, name, range, pos, allTypes, inherited) {
    let r = createTableRow(parent);

//    let pd = createTablePlainTextCell(r, FIELD_PROP_DOMAIN + name, domain);
    let pn = createTableTextFieldCell(r, FIELD_PROP_NAME + name, name, inherited);

    registerEvents(pn.element, { "change": function(){ return changedSchemaPropertyName(null, propKeyName(pos)); } });

//    let pr = createTableSelectCell(r, FIELD_PROP_RANGE + name, allTypes, range, inherited);
    let pt = createTableSelectCell(r, FIELD_PROP_TYPE + name, listAllBasicTypeNames());

    pt.element.value = range;

    let px;

    if (inherited) {
        px = createTableLinkCell(r, '', null, LABEL_PROP_INHERITED);
    } else {
        px = createTableLinkCell(r, '', function(){ return deleteSchemaProperty(propKeyName(pos)); }, LABEL_PROP_DELETE);
        addClasses(px.element, [ 'badge', 'badge-danger', 'text-white' ] );
    }

    if (pos) {
        propFields[propKeyName(pos)] = [ pn.row, pn.cell, pn.element ];
        propFields[propKeyName(pos)].push(pt.element);
        propFields[propKeyName(pos)].push(px.element);
    }
}

function propKeyName(pos) {
    return 'prop_' + pos;
}

function buildNewPropertyRow(parent, type, pos, allTypes) {
    let r = createTableRow(parent);

//    let pd = createTablePlainTextCell(r, FIELD_NEW_PROP_DOMAIN, type);
    let pn = createTableTextFieldCell(r, FIELD_NEW_PROP_NAME, '', false);
//    let pr = createTableSelectCell(r, FIELD_NEW_PROP_RANGE, allTypes, false, false);
    let pt = createTableSelectCell(r, FIELD_NEW_PROP_TYPE, allTypes, false, false);

    propFields[propKeyName(pos)] = [ pn.row, pn.cell, pn.element ];
//    propFields[propKeyName(pos)].push(pn.element);
    propFields[propKeyName(pos)].push(pt.element);
}

function buildButtons(f) {
    createSaveButton(f, savePopup);
    createCancelButton(f, null, actionClosePopup);
}

function actionClosePopup() {
    saveActionMisc('palette:cancelTypePopup', null, { "palette": getPalette().getName() });

    closePopup(true);
}

function initialiseSchemaFields(nodeType) {
    initialiseSchemaSection(nodeType);
    initialiseSchemaParents(nodeType);
    initialiseSchemaChildren(nodeType);
}

function initialiseSchemaSection(nodeType) {
    if (settings && settings.permissions && settings.permissions.editSchema) {
        if (nodeType.hasSchema()) {
            showSchemaSection(nodeType);
        } else {
            hideSchemaSection();
        }
    }
}

function initialiseSchemaParents(nodeType) {
    let p = /** @type {HTMLOptGroupElement} */ document.getElementById(FIELD_PARENTS);
    let parentNames = listAllTypeNames();

    for (let parName of parentNames) {
        let sel = false;
        let dis = false;

        if (nodeType.hasSchema()) {
            if (nodeType.getSchema().getTypeName() === parName) {
                dis = true;
            }

            let sParents = nodeType.getSchema().getParents();
            if (sParents && (sParents.indexOf(parName) > -1)) {
                sel = true;
            }
        }

        createOption(p, parName, parName, sel, dis);
    }
}

function initialiseSchemaChildren(nodeType) {
    if (nodeType.hasSchema()) {
        let children = computeAllChildTypesFor(nodeType.getSchema(), false);
        setValue(FIELD_CHILDREN, children.join() || MSG_NONE);
    } else {
        setValue(FIELD_CHILDREN, MSG_NONE);
    }
}

function buildSettingsSection(parent, tgtType) {
    let newElem = document.createElement('DIV');
    let settings;

    if (tgtType) {
        settings = JSON.stringify(tgtType.getSettings().export(), null, 2);
    } else {
        settings = '{}';
    }

    newElem.innerHTML = `
<div class="container">
    <div class="row">
        <div class="col-sm">
            <span class="badge badge-warning" data-toggle="collapse" data-target="#typeSettings" title="Click to expand/collapse this section">Settings</span>
            <div id="typeSettings" class="collapse">
                <textarea id="settingsText" class="cs-settings">${settings}</textarea>
            </div>
        </div>
    </div>
</div>
<hr class="my-1"/>`;

    parent.appendChild(newElem);
}

function buildLayoutSection(parent, tgtType) {
    let newElem = document.createElement('DIV');
    let layout;

    if (tgtType) {
        layout = tgtType.getLayout();
    } else {
        layout = '';
    }

    newElem.innerHTML = `
<div class="container">
    <div class="row">
        <div class="col-sm">
            <span class="badge badge-warning" data-toggle="collapse" data-target="#typeLayout" title="Click to expand/collapse this section">Layout</span>
            <div id="typeLayout" class="collapse">
                <textarea id="layoutText" class="cs-layout">${layout}</textarea>
            </div>
        </div>
    </div>
</div>
<hr class="my-1"/>`;

    parent.appendChild(newElem);
}

// function buildPropertiesSection(parent, tgtType) {
//     let newElem = document.createElement('DIV');
//     let layout;
//
//     if (tgtType) {
//         layout = tgtType.getProperties();
//     } else {
//         layout = '';
//     }
//
//     newElem.innerHTML = `
// <div class="container">
//     <div class="row">
//         <div class="col-sm">
//             <span class="badge badge-warning" data-toggle="collapse" data-target="#typeLayout" title="Click to expand/collapse this section">Layout</span>
//             <div id="typeLayout" class="collapse">
//                 <textarea id="layoutText" class="cs-layout">${layout}</textarea>
//             </div>
//         </div>
//     </div>
// </div>
// <hr class="my-1"/>`;
//
//     parent.appendChild(newElem);
// }
