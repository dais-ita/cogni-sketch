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
 * @file Contains only typedefs, specifically those relating to the wrapped and raw main instantiated objects
 * within the system:
 *      csPalette and csRawPalette, csRawSection
 *      csProject and csRawProject, csRawProjectGeneral
 *      csType and csRawType, csRawSchema, csRawSettings, csRawLayout, csRawProperty
 *          csTypeSchema
 *          csTypeSettings
 *      csNode and csRawNode, csRawData, csRawPropVal, csIcon
 *      csLink and csRawLink (sharing csRawData and csRawPropVal)
 *
 * @author Dave Braines
 **/

/**
 * csPalette - the universal object for a palette.
 *
 * @typedef csPalette
 * @type {object}
 * @property {string} csType                                The type for this object, always set to 'palette'.
 * @property {string} id                                    The unique id for this palette.
 * @property {function(): string} getName                   The name for this palette.
 * @property {function(string)} setName                     Set the specified name for this palette.
 * @property {function(): string } getOwner                 The name of the owner (the user that created this palette).
 * @property {function(): boolean} isReadOnly               Indicates whether this palette is read only.
 * @property {function(): csRawSection} getSections         Get all of the sections in this palette.
 * @property {function(string) } addSection                 Add a section with the specified name to this palette.
 * @property {function(string) } deleteSection              Remove the specified section from this palette.
 * @property {function(string): csType} getItemById         The palette type with the specified id.
 * @property {function(): csType} getDefaultItem            The default palette item.
 * @property {function(): boolean} isDefault                Indicates whether this is the default palette.
 * @property {function(): csType[]} listItems               The list of all type items defined in this palette.
 * @property {(function(csType))} addItem                   Add the specified item to this palette.
 * @property {(function(csType, string))} renameItem        Rename the specified item in this palette.
 * @property {(function(csType))} deleteItem                Delete the specified item from this palette.
 * @property {function(): object} getExtras                 Get the list of any 'extra' data stored on this palette.
 * @property {function(csNode): number} getSectionIndexFor  Get the index (position) of the specified node in a section.
 * @property {function(): object} _                         Private functions.
 */

/**
 * csProject - the universal object for a project.
 *
 * @typedef csProject
 * @type {object}
 * @property {string} csType                                        The type for this object, always set to 'project'.
 * @property {string} id                                            The unique id for this project.
 * @property {function(): string} getName                           The name for this project.
 * @property {function(string)} setName                             Set the specified name for this project.
 * @property {function(): csPalette} getPalette                     Return the palette for this project.
 * @property {function(): string} getPaletteName                    Return the name of the palette for this project.
 * @property {function(csPalette)} setPalette                       Set the specified palette for this project.
 * @property {function(): object} getOwner                          The owner of the project.
 *                                                                  (if it is a shared project).
 * @property {function(): boolean} isReadOnly                       Whether this project is read only.
 * @property {function(string): csNode} getNodeById                 The node with the specified id.
 * @property {function(): csNode[]} listNodes                       The list of all nodes defined in this project.
 * @property {function(string): csNode[]} listNodesByLabel          The list of all nodes defined in this project that
 *                                                                  have the specified label.
 * @property {function(csType): csNode[]} listNodesByType           The list of all nodes defined in this project that
 *                                                                  are of the specified type.
 * @property {function(csNode)} addNode                             Add the specified node to this project.
 * @property {function(csNode)} deleteNode                          Delete the specified node to this project.
 * @property {function(string): csLink} getLinkById                 Return a link using the specified id.
 * @property {function(): csLink[]} listLinks                       The list of all links defined in this project.
 * @property {function(): csLink, csNode} startPartialLink          Create a partial link.
 * @property {function(csLink, csNode, csNode)} finishPartialLink   Complete the specified link using the two nodes.
 * @property {function(csLink, csNode, csNode)} addFullLink         Add the specified link to this project.
 * @property {function(csLink)} deleteLink                          Delete the specified link and remove from this
 *                                                                  project.
 * @property {function(): object} getGeneral                        Get the general data for this project.
 * @property {function(): csProjectGeneral} general                 General functions.
 * @property {function(): object} getExtras                         Get the list of any 'extra' data stored on this
 *                                                                  project.
 * @property {function(): object} _                                 Private functions.
 */

/**
 * csProjectGeneral - the universal object for the general functions of a project.
 *
 * @typedef csProjectGeneral
 * @type {object}
 * @property {function(): csViewBox} getViewBox                 Get the viewBox for this project.
 * @property {function(csViewBox)} setViewBox                   Set the viewBox for this project.
 * @property {function(): csCoordinates} getViewBoxMidpoint     Get the viewBox midpoint for this project.
 * @property {function(): number} takeUid                       Return the next available uid and increment the value.
 */

/**
 * csType - the universal object for a (palette item) type.
 *
 * @typedef csType
 * @type {object}
 * @property {string} csType                            The type for this object, always set to 'paletteType'.
 * @property {string} id                                The unique id for this palette item.
 * @property {function(): string} getId                 The id for this palette item.
 * @property {function(): number} getPosition           The position of this palette item in the palette.
 * @property {function(): csRawSection} getSection      The name of the section that contains this palette item.
 * @property {function(string)} setSection              Set the name of the section that contains this palette item.
 * @property {function(string): boolean} isInSection    Whether this palette item is in the named section.
 * @property {function(): boolean} getLabel             The label for this palette item.
 * @property {function(): csIcon} getIcon               The icon for this palette item.
 * @property {function(csIcon)} setIcon                 Set the icon for this palette item.
 * @property {function(): boolean} hasNormalColor       Whether this palette item has a normal color.
 * @property {function(): string} getNormalColor        The normal color (name) for this palette item.
 * @property {function(string)} setNormalColor          Set the normal color (name) for this palette item.
 * @property {function()} removeNormalColor             Remove the normal color (name) for this palette item.
 * @property {function(): boolean} hasCustomColor       Whether this palette item has a custom color.
 * @property {function(): string} getCustomColor        The custom color (hex color code) for this palette item.
 * @property {function(string)} setCustomColor          Set the custom color (hex color code) for this palette item.
 * @property {function()} removeCustomColor             Remove the custom color (hex color code) for this palette item.
 * @property {function(): boolean} hasSchema            Whether this palette item has schema data.
 * @property {function(): csRawSchema} getSchema        The schema object for this palette item.
 * @property {function(csRawSchema)} setSchema          Set the schema object for this palette item.
 * @property {function()} removeSchema                  Remove the schema object for this palette item.
 * @property {csTypeSchema} schema                      Schema details for this palette item.
 * @property {function(): csRawSettings} getSettings    The settings object for this palette item.
 * @property {function(csRawSettings)} setSettings      Set the settings object for this palette item.
 * @property {csTypeSettings} settings                  User defined settings for this palette item.
 * @property {function(): csRawLayout} getLayout        The layout object for this palette item.
 * @property {function(csRawLayout)} setLayout          Set the layout object for this palette item.
 * @property {function(): object} _                     Private functions.
 */

/**
 * csTypeSchema - the universal object for the schema details for a (palette item) type.
 *
 * @typedef csTypeSchema
 * @type {object}
 * @property {function(): string} getTypeName               The schema type name associated with this palette item.
 * @property {function(string)} setTypeName                 Set the schema type name associated with this palette item.
 * @property {function(): boolean} hasParents               Whether this palette item has parents.
 * @property {function(): csRawSchema[]} getParents         The list of parents for this palette item.
 * @property {function(csRawSchema[])} setParents           Set the list of parents for this palette item.
 * @property {function()} removeParents                     Remove the list of parents for this palette item.
 * @property {function(): boolean} hasProperties            Whether this palette item has properties.
 * @property {function(): csRawProperty[]} getProperties    The list of properties for this palette item.
 * @property {function(csRawProperty[])} setProperties      Set the list of properties for this palette item.
 * @property {function()} removeProperties                  Remove the list of properties for this palette item.
 */

/**
 * csTypeSettings - the universal object for the settings details for a (palette item) type.
 *
 * @typedef csTypeSettings
 * @type {object}
 * @property {function()} getDefaultWidth                   The default width for any nodes of this type.
 * @property {function()} getDefaultImageWidth              The default image width of any nodes of this type.
 * @property {function()} getNodeClasses                    The css classes to be used for any nodes of this type.
 * @property {function()} getLabelClasses                   The css classes to be used for the label for any nodes
 *                                                          of this type.
 * @property {function()} getDefaultToHidden                Whether nodes of this type default to hidden.
 * @property {function()} getDefaultShowType                Whether nodes of this type default to showing the type name
 *                                                          in the label.
 * @property {function()} getCanChangeTypeAfterCreation     Whether nodes of this type can have their type name changed
 *                                                          after creation.
 * @property {function()} getDropExtensions                 A list of filename extensions used to determine whether
 *                                                          any files dropped onto the canvas match this palette item.
 * @property {function()} getDropPrefixes                   A list of possible prefixes used to determine whether any
 *                                                          pasted or dropped items on the canvas match to this palette
 *                                                          item.
 * @property {function()} getDropPartials                   A list of possible strings used to determine whether any
 *                                                          pasted or dropped items on the canvas match to this palette
 *                                                          item.
 * @property {function()} getNodeSize                       The default node size for any nodes of this type.
 */

/**
 * csNode - the universal object for a node.
 *
 * @typedef csNode
 * @type {object}
 * @property {string} csType    - the type for this object, always set to 'node'.
 * @property {string} id        - the unique id for this node.
 * @property {function} getUid
 * @property {function} getCreatedTimestamp
 * @property {function} getCreatedUser
 * @property {function} getType
 * @property {function} getTypeName
 * @property {function} isEmpty
 * @property {function} isFull
 * @property {function} isSpecial
 * @property {function} isExpanded
 * @property {function} isExpandedAsTable
 * @property {function} isExpandedAsCustom
 * @property {function} isSelected
 * @property {function} isHidden
 * @property {function} getPos
 * @property {function} setPos
 * @property {function} getLabel
 * @property {function} getFullLabel
 * @property {function} setLabel
 * @property {function} getIcon
 * @property {function} getNodeSize
 * @property {string[]} _errors - private list of errors
 */

/**
 * csNodeOld - the universal object for a node.
 *
 * @typedef csNodeOld
 * @type {object}
 * @property {function(): boolean} getShowType                      Whether the node label shows the type name.
 * @property {function(boolean)} setShowType                        Set the show type flag.
 * @property {function(): object} getData                           Get the data stored on this node.
 * @property {function({string}): string} hasPropertyNamed          Whether the named property exists on this node.
 * @property {function({string}): string} getPropertyNamed          Get the value for the specified property.
 * @property {function({string}): csRawPropVal} getTypeAndValueForPropertyNamed
 *                                                                  Get the type+value for the specified property.
 * @property {function({string}): string} getTypeForPropertyNamed   Get the type for the specified property.
 * @function {setNormalPropertyNamed}
 * @function {setTextPropertyNamed}
 * @function {setJsonPropertyNamed}
 * @function {setPropertyNamed}
 * @property {function({string})} removePropertyNamed               Remove the specified property.
 * @property {function({string, string})} changePropertyType        Change the type of the specified property.
 * @property {function(): boolean} hasProperties                    Whether this link has properties.
 * @property {function(): object} listProperties                    The list of all properties for this node.
 * @property {function(): object} listPropertyValues                The list of all property values (not including
 *                                                                  types) for this node.
 * @property {function(csLink)} addLink                             Add the specified link to this node.
 * @property {function(csLink)} deleteLink                          Delete the specified link from this node.
 * @property {function(): csLink[]} listAllLinks                    List all of the links for this node.
 * @property {function(): csLink[]} listOutgoingLinks               List the outgoing links for this node.
 * @property {function(): csLink[]} listIncomingLinks               List the incoming links for this node.
 * @property {function(): csLink[]} listBidirectionalLinks          List the bidirectional links for this node.
 * @property {function(csNode): boolean} isLinkedTo                 Whether this node is linked to the specified node.
 * @property {function(csType)} switchType                          Switch the (palette item) type for this node.
 * @property {function()} removeType                                Remove the existing type and replace with the
 *                                                                  default type for the palette.
 * @property {function()} expandAsTable                             Expand the node to 'table' mode.
 * @property {function()} expandAsCustom                            Expand the node to 'custom' mode.
 * @property {function()} collapse                                  Collapse the node.
 * @property {function()} expandOrCollapse                          Flip the expand/collapse mode of this node, cycling
 *                                                                  through the table/custom expanded states.
 * @property {function()} switchToEmpty                             Set the mode of this node to 'empty'.
 * @property {function()} switchToFull                              Set the mode of this node to 'full'.
 * @property {function()} select                                    Select this node.
 * @property {function()} deselect                                  Deselect this node.
 * @property {function()} selectOrDeselect                          Invert the selection of this node

 * @property {function()} show                                      Set the node to not hidden.
 * @property {function()} hide                                      Set the node to hidden.
 * @property {function()} showOrHide                                Invert the hidden status of this node.
 * @property {function(): object} _                                 Private functions.
 */

/**
 * csLink - the universal object for a link.
 *
 * @typedef csLink
 * @type {object}
 * @property {string} csType                                        The type for this object, always set to 'link'.
 * @property {string} id                                            The unique id for this link.
 * @property {function(): string} getUid                            The unique id for this link.
 * @property {function(): number} getCreatedTimestamp               The creation timestamp (milliseconds since epoch).
 * @property {function(): string} getCreatedUser                    The username that created this link.
 * @property {function(): string} getLabel                          The label for this link.
 * @property {function({string})} setLabel                          Set the label for this link.
 * @property {function(): number} getAnchorPos                      Get the position of the anchor on the link line.
 * @property {function({number})} setAnchorPos                      Set the position of the anchor on the link line.
 * @property {function(): number} getBender                         Get the amount of bend on the link line.
 * @property {function({number})} setBender                         Set the amount of bend on the link line.
 * @property {function(): boolean} isBidirectional                  Whether the link is bidirectional.
 * @property {function(): boolean} setBidirectional                 Set whether the link is bidirectional.
 * @property {function(): object} getData                           Get the data stored on this link.
 * @property {function({string}): string} hasPropertyNamed          Whether the named property exists on this link.
 * @property {function({string}): string} getPropertyNamed          Get the value for the specified property.
 * @property {function({string}): csRawPropVal} getTypeAndValueForPropertyNamed
 *                                                                  Get the type+value for the specified property.
 * @property {function({string}): string} getTypeForPropertyNamed   Get the type for the specified property.
 * @property {function(string, string)} setNormalPropertyNamed      Set the normal value for the specified property.
 * @function {function(string, string)} setTextPropertyNamed        Set the text value for the specified property.
 * @property {function(string, object)} setJsonPropertyNamed        Set the json value for the specified property.
 * @property {function(string, string, string)} setPropertyNamed    Set the value and type for the specified property.
 * @property {function({string})} removePropertyNamed               Remove the specified property.
 * @property {function({string, string})} changePropertyType        Change the type of the specified property.
 * @property {function(): boolean} hasProperties                    Whether this link has properties.
 * @property {function(): object} listProperties                    The list of all properties for this link.
 * @property {function(): object} listPropertyValues                The list of all property values (not including
 *                                                                  types) for this link.
 * @property {function(): boolean} isSelected                       Whether the link is selected.
 * @property {function(): boolean} isHidden                         Whether the link is hidden.
 * @property {function(): boolean} isSemantic                       Whether the link is semantic.
 * @property {function(): csNode} getSourceNode                     The source node for this link.
 * @property {function(): csNode} getTargetNode                     The target node for this link.
 * @property {function({csNode}): csNode} getOtherNode              The other node for this link (the one that isn't
 *                                                                  the node passed in).
 * @property {function()} deleteLink                                Delete this link.
 * @property {function()} select                                    Select this link.
 * @property {function()} deselect                                  Deselect this link.
 * @property {function()} selectOrDeselect                          Flip the selection state of this link.
 * @property {string[]} _errors - private list of errors
 * @property {function} _completeLinks - private function
 */

/**
 * csData - the universal object for an internal data object (shared by csNode and csLink).
 *
 * @typedef csData
 * @type {object}
 * @property {string} csType                                        The type for this object, always set to 'data'.
 * @property {string} id                                            The unique id for this data object.
 * @property {function(): string} getLabel                          The label for this link.
 * @property {function({string})} setLabel                          Set the label for this link.
 * @property {function(): object} getData                           Get the data stored on this link.
 * @property {function({string}): string} hasPropertyNamed          Whether the named property exists on this link.
 * @property {function({string}): string} getPropertyNamed          Get the value for the specified property.
 * @property {function({string}): csRawPropVal} getTypeAndValueForPropertyNamed
 *                                                                  Get the type+value for the specified property.
 * @property {function({string}): string} getTypeForPropertyNamed   Get the type for the specified property.
 * @property {function(string, string)} setNormalPropertyNamed      Set the normal value for the specified property.
 * @function {function(string, string)} setTextPropertyNamed        Set the text value for the specified property.
 * @property {function(string, object)} setJsonPropertyNamed        Set the json value for the specified property.
 * @property {function(string, string, string)} setPropertyNamed    Set the value and type for the specified property.
 * @property {function({string})} removePropertyNamed               Remove the specified property.
 * @property {function({string, string})} changePropertyType        Change the type of the specified property.
 * @property {function(): boolean} hasProperties                    Whether this link has properties.
 * @property {function(): object} listProperties                    The list of all properties for this link.
 * @property {function(): object} listPropertyValues                The list of all property values (not including
 */

/**
 * csRawPalette - the serialization object (raw form) for a palette.
 *
 * @typedef csRawPalette
 * @type {object}
 * @property {string} name                  The name of this palette.
 * @property {number} server_ts             The creation timestamp (milliseconds since epoch).
 * @property {string} owner                 The owner (username) of this palette if it is not local.
 * @property {boolean} readOnly             Whether the palette is read only, i.e. not local.
 * @property {csRawSection[]} sections      The list of all sections within the palette.
 * @property {object} items                 The list of all items within the palette.
 * @property {object} extras                The optional name-value pairs of extra persisted data in this palette.
 */

/**
 * csRawSection - the serialization object (raw form) for a section withing a palette.
 *
 * @typedef csRawSection
 * @type {object}
 * @property {string} name                  The name of this section.
 * @property {string} label                 The label to be used for this section.
 */

/**
 * csRawProject - the serialization object (raw form) for a project.
 *
 * @typedef csRawProject
 * @type {object}
 * @property {string} project               The name of this project.
 * @property {number} server_ts             The creation timestamp (milliseconds since epoch).
 * @property {string} owner                 The owner (username) of this project if it is not local.
 * @property {boolean} readOnly             Whether the project is read only, i.e. not local.
 * @property {string} paletteName           The name of the palette being used for this project.
 * @property {csRawPalette} palette         The palette being used by this project.
 *                                          (This is removed before serialization and only the palette name is used)
 * @property {csProjectGeneral} general     Specific general information relating to this project.
 * @property {object} nodes                 The dictionary of all nodes in this project.
 * @property {object} links                 The dictionary of all links in this project.
 * @property {object} extras                The optional name-value pairs of extra persisted data in this palette.
 */

/**
 * csRawProjectGeneral - general information for a project.
 *
 * @typedef csProjectGeneral
 * @type {object}
 * @property {csViewBox} viewBox            The current viewBox for the canvas of this project.
 * @property {number} uid                   The next available uid for nodes or links on this project.
 */

/**
 * csRawType - the serialization object (raw form) for a palette type.
 *
 * @typedef csRawType
 * @type {object}
 * @property {string} id                    The unique id for this palette type.
 * @property {string} icon                  The url for the icon.
 * @property {string} iconAlt               The alt text for the icon.
 * @property {string} label                 The label for this palette type.
 * @property {number} position              The position of this palette type in the palette section.
 * @property {string} section               The name of the section that contains this palette type.
 * @property {object} schema                Any schema data for this palette type.
 * @property {object} settings              Any settings data for this palette type.
 * @property {object} layout                Any layout data for this palette type.
 * @property {string} nodeColor             The color of this palette item.
 * @property {string} customColor           If specified, the custom color for this palette item.
 */

/**
 * csRawSchema - the serialization object (raw form) for the schema on a palette type.
 *
 * @typedef csRawSchema
 * @type {object}
 */
//TODO: Complete this

/**
 * csRawSettings - the serialization object (raw form) for the settings on a palette type.
 *
 * @typedef csRawSettings
 * @type {object}
 * @property {string} defaultCanHandle - the default 'canHandle' value for drop/paste events.
 * @property {string} defaultWidth - the default width value for the main content area of nodes.
 * @property {string} defaultShowType - the default 'showType' value, determines if the node label shows the node type.
 * @property {string} defaultImageWidth - the default width to be used for images.
 * @property {string} nodeClasses - any CSS classes to be used when rendering the node.
 * @property {string} labelClasses - any CSS classes to be used when rendering the label.
 * @property {string} defaultToHidden - whether any created nodes are defaulted to hidden status.
 * @property {string} canChangeTypeAfterCreation - whether any nodes that are created of this type can have their type
 * changed in the future.
 * @property {string} dropExtensions - a list of file extensions that can be defined for drop events.
 * @property {string} dropPrefixes - a list of name prefixes that can be defined for drop events.
 * @property {string} dropPartials - a list of name fragments that can be defined for drop events.
 */
//TODO: Complete this

/**
 * csRawLayout - the serialization object (raw form) for the layout on a palette type.
 *
 * @typedef csRawLayout
 * @type {object}
 */
//TODO: Complete this

/**
 * csRawProperty - the serialization object (raw form) for the layout on a palette type.
 *
 * @typedef csRawProperty
 * @type {object}
 */
//TODO: Complete this

/**
 * csRawNode - the serialization object (raw form) for a node.
 *
 * @typedef csRawNode
 * @type {object}
 * @property {string} uid                   The unique id for this node.
 * @property {Date} created                 The creation timestamp (milliseconds since epoch).
 * @property {string} user                  The name of the user who created this node.
 * @property {string} type                  The name of the palette item (type) which this node is.
 * @property {string} mode                  The mode for this node.
 *                                          Must be one of MODE_EMPTY, MODE_FULL, MODE_SPECIAL
 * @property {number} expanded              The expand/collapse state for this node.
 *                                          Must be one of EXPANDED_COLLAPSED, EXPANDED_TABLE, EXPANDED_CUSTOM
 * @property {boolean} selected             Whether this node is selected.
 * @property {boolean} showType             Whether this node shows the type as part of the label.
 * @property {boolean} hide                 Whether this node is hidden.
 * @property {csCoordinates} pos            The coordinates for this node.
 * @property {string[]} linkRefs            The list of all link ids that are referenced by this node.
 * @property {csRawData} data               The data object for this node.
 */

/**
 * csRawLink - the serialization object (raw form) for a link.
 *
 * @typedef csRawLink
 * @type {object}
 * @property {string} uid                   The unique id for this link.
 * @property {Date} created                 The creation timestamp (milliseconds since epoch).
 * @property {string} user                  The name of the user who created this link.
 * @property {boolean} selected             Whether this link is selected.
 * @property {boolean} hide                 Whether this link is hidden.
 * @property {csRawData} data               The data object for this link.
 * @property {number} anchorPos             The position of the anchor (between 0 and 1) on the link line.
 * @property {number} bender                The amount of bend on the link line.
 * @property {boolean} bidirectional        Whether this link is bidirectional (default is false).
 * @property {string} sourceRef             The node id for the source (starting) node of this link.
 * @property {string} targetRef             The node id for the target (ending) node of this link.
 */

/**
 * csRawData - the serialization object (raw form) for the data (properties and label) of a node.
 *
 * @typedef csRawData
 * @type {object}
 * @property {string} label - the label for this node.
 * @property {Object.<string, csRawPropVal>} properties - the data object for this node.
 */

/**
 * csRawPropVal - the serialization object (raw form) for a property value on a node.
 *
 * @typedef csRawPropVal
 * @type {object}
 * @property {string} type                  The property type (see core_settings.js general:types).
 * @property {object} value                 The property value.
 */

/**
 * csIcon - simple object to convey the url and alt text for an icon.
 *
 * @typedef csIcon
 * @type {object}
 * @property {string} icon      The url for the icon.
 * @property {string} iconAlt   The alt text for the icon.
 */
