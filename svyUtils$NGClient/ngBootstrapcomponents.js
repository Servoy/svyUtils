/**
 * @public 
 * 
 * @properties={typeid:35,uuid:"20E29824-DCB3-4AD5-AD04-D8E44B454765",variableType:-4}
 */
var BTS_COMPONENTS = {
	LABEL : "bootstrapcomponents-label",
	TEXTBOX : "bootstrapcomponents-typeahead",
	TYPEAHEAD : "bootstrapcomponents-typeahead",
	TABLESSPANEL : "bootstrapcomponents-tablesspanel",
	SELECT : "bootstrapcomponents-select",
	BUTTON: "bootstrapcomponents-button",
	CHOICEGROUP: "bootstrapcomponents-choicegroup"
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} text
 * 
 * @return {JSWebComponent}
 * @public 
 * 
 * @properties={typeid:24,uuid:"B80B9BB4-A2B6-4F89-B895-71D228512182"}
 */
function newButton(layoutContainer, index, name, text) {
	var label = layoutContainer.newWebComponent(name, BTS_COMPONENTS.BUTTON, index);
	label.name = name;
	label.setJSONProperty("text", text);
	return label;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} text
 * @param {String} [styleclass]
 * 
 * @return {JSWebComponent}
 * @public 
 * 
 * @properties={typeid:24,uuid:"3B547DE7-DFB7-4482-B44C-1284212B6F43"}
 */
function newLabel(layoutContainer, index, name, text, styleclass) {
	var label = layoutContainer.newWebComponent(name, BTS_COMPONENTS.LABEL, index);
	label.name = name;
	label.setJSONProperty("text", text);
	if(styleclass) {
		label.setJSONProperty("styleClass",styleclass);
	}
	return label;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} dataprovider
 * @param {String} valuelist
 * 
 * @return {JSWebComponent}
 * @public 
 *
 * @properties={typeid:24,uuid:"848555BE-F786-4268-BB8E-9A80A432BEC5"}
 */
function newTypeahead(layoutContainer, index, name, dataprovider, valuelist) {
	var field = layoutContainer.newWebComponent(name, BTS_COMPONENTS.TYPEAHEAD, index);
	field.name = name;
	field.setJSONProperty('dataProviderID',dataprovider);
	field.setJSONProperty('valuelistID',valuelist);
	return field;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} dataprovider
 * @param {String} valuelist
 * 
 * @return {JSWebComponent}
 * @public 
 *
 * @properties={typeid:24,uuid:"4F04D55B-D13A-4387-B4A1-5A3B0958BD29"}
 */
function newSelect(layoutContainer, index, name, dataprovider, valuelist) {
	var field = layoutContainer.newWebComponent(name, BTS_COMPONENTS.SELECT, index);
	field.name = name;
	field.setJSONProperty('dataProviderID',dataprovider);
	field.setJSONProperty('valuelistID',valuelist);
	return field;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} dataprovider
 * 
 * @return {JSWebComponent}
 * @public 
 *
 * @properties={typeid:24,uuid:"E4F82717-9E65-4168-BC31-38BE5DEB7776"}
 */
function newTextbox(layoutContainer, index, name, dataprovider) {
	var field = layoutContainer.newWebComponent(name, BTS_COMPONENTS.TEXTBOX, index);
	field.name = name;
	field.setJSONProperty('dataProviderID',dataprovider);
	return field;
}


/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} containedForm
 * 
 * @return {JSWebComponent}
 * @public 
 *
 * @properties={typeid:24,uuid:"C9C9B8AC-7604-421F-80D5-16809898D80B"}
 */
function newTablesspanel(layoutContainer, index, name, containedForm) {
	var tab = layoutContainer.newWebComponent(name, BTS_COMPONENTS.TABLESSPANEL, index);
	tab.setJSONProperty('containedForm',containedForm);
	return tab;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} dataprovider
 * @param {String} valuelist
 * @param {String} inputType
 * 
 * @return {JSWebComponent}
 * @public 
 *
 * @properties={typeid:24,uuid:"0FD4A0B7-3672-4223-ABF8-53AA69C8AE4A"}
 */
function newChoiceGroup(layoutContainer, index, name, dataprovider, valuelist, inputType) {
	var field = layoutContainer.newWebComponent(name, BTS_COMPONENTS.CHOICEGROUP, index);
	field.name = name;
	field.setJSONProperty('dataProviderID',dataprovider);
	field.setJSONProperty('valuelistID',valuelist);
	field.setJSONProperty('inputType', inputType);
	return field;
}