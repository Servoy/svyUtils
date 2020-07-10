/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"64919A4A-85DA-449A-8AF0-666051FEAA20",variableType:-4}
 */
var CORE_COMPONENTS = {
	FORMCOMPONENT: "servoycore-formcomponent"
}

/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} name
 * @param {String} formcomponent
 * 
 * @return {JSWebComponent}
 * @public 
 * 
 * @properties={typeid:24,uuid:"3A7F05EA-A4D7-4103-BD95-61CB3867CB5D"}
 */
function newFormcomponent(layoutContainer, index, name, formcomponent) {
	var formcomp = layoutContainer.newWebComponent(name, CORE_COMPONENTS.FORMCOMPONENT, index);
	formcomp.name = name;
	formcomp.setJSONProperty("containedForm", formcomponent);
	return formcomp;
}