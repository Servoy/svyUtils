/**
 * @param {String} name
 * 
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"A565B3BF-0754-48E7-8786-A46E8E1DFC85"}
 */
function getUserProperty(name) {
	if (customImpl) {
		return customImpl.getUserProperty(name)
	}
	return application.getUserProperty(name)
}

/**
 * @param {String} name
 * @param {String} value
 *
 * @properties={typeid:24,uuid:"B59DAF45-9A05-4960-9C9C-AA8103435FBA"}
 */
function setUserProperty(name, value) {
	if (customImpl) {
		customImpl.setUserProperty(name,value)
	} else {
		application.setUserProperty(name,value)
	}
}

/**
 * @private 
 * @type {RuntimeForm<defaultUserPropertyPersistanceImpl>}
 *
 * @properties={typeid:35,uuid:"496F983A-86BF-4FF3-BE2B-021A38ABE292",variableType:-4}
 */
var customImpl = null

/**
 * Allows implementations to register a different implementation for get/setting user properties, by extending this form and registering it back
 * @final
 * @param {RuntimeForm<defaultUserPropertyPersistanceImpl>} form
 *
 * @properties={typeid:24,uuid:"FDD684C4-05C6-49FF-9641-99E288178D24"}
 */
function setCustomImpl(form) {
	if (form) {
		scopes.svySystem.persistFormInMemory(this)
		scopes.svySystem.persistFormInMemory(form)
	} else {
		scopes.svySystem.desistFormInMemory(form)
	}
	customImpl = form
}