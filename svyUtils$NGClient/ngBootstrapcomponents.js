/**
 * @public 
 * 
 * @properties={typeid:35,uuid:"20E29824-DCB3-4AD5-AD04-D8E44B454765",variableType:-4}
 */
var BTS_COMPONENTS = {
	LABEL : "bootstrapcomponents-label",
	TEXTBOX : "bootstrapcomponents-typeahead",
	TYPEAHEAD : "bootstrapcomponents-typeahead",
	TABLESSPANEL : "bootstrapcomponents-tablesspanel"
}


/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} text
 * 
 * @public 
 * 
 * @properties={typeid:24,uuid:"3B547DE7-DFB7-4482-B44C-1284212B6F43"}
 */
function newLabel(layoutContainer, index, name, text) {
	var label = layoutContainer.newWebComponent(name, BTS_COMPONENTS.LABEL, index);
	label.name = name;
	label.setJSONProperty("text", text);
	return label;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"848555BE-F786-4268-BB8E-9A80A432BEC5"}
 */
function newTypeahead(layoutContainer, index, name) {
	var field = layoutContainer.newWebComponent(name, BTS_COMPONENTS.TYPEAHEAD, index);
	field.name = name;
	return field;
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} containedForm
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"C9C9B8AC-7604-421F-80D5-16809898D80B"}
 */
function newTablesspanel(layoutContainer, index, name, containedForm) {
	var tab = layoutContainer.newWebComponent(name, BTS_COMPONENTS.TABLESSPANEL, index);
	tab.setJSONProperty('containedForm',containedForm);
	return tab;
}
