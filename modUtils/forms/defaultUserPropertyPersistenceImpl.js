/**
 * Gets the specified user property
 * Provides the default persistence implementation for the User Properties Service Interface
 * 
 * @param {String} name
 * 
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"A565B3BF-0754-48E7-8786-A46E8E1DFC85"}
 */
function getUserProperty(name) {
	return application.getUserProperty(name)
}

/**
 * Sets the specified user property
 * Provides the default persistence implementation for the User Properties Service Interface
 * 
 * @param {String} name
 * @param {String} value
 *
 * @properties={typeid:24,uuid:"B59DAF45-9A05-4960-9C9C-AA8103435FBA"}
 */
function setUserProperty(name, value) {
	application.setUserProperty(name,value)
}