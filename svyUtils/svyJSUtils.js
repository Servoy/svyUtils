/**
 * Returns true if the supplied argument is a JavaScript object. Returns false for non-objects, including subclasses like Array, Date or Regex
 * @param {*} object
 *
 * @properties={typeid:24,uuid:"8B942664-6C9B-48AD-B0AA-DC9C9E411BCD"}
 */
function isObject(object) {
	return Object.prototype.toString.call(object) == '[object Object]'
}

//TODO add replacer function for JSON.stringify that handles circular references or a custom object stringifier that does this and also removes the quotes around the keys

/*Attempt to replace globals.svy_utl_getTypeOf, but doesn't work that well (yet)
 * =>scopes.svyUtils.getType(undefined)
 * global
 * =>scopes.svyUtils.getType(null)
 * global
 * =>var x = databaseManager.createEmptyDataSet()
 * =>scopes.svyUtils.getType(x)
 * jsdataset
 * =>scopes.svyUtils.getType(databaseManager.getFoundSet('db:/svy_framework/log'))
 * foundset
 * =>scopes.svyUtils.getType(solutionModel.getForm('AbstractModuleDef'))
 * javaobject
 * =>scopes.svyUtils.getType(plugins)
 * pluginscope
 * =>scopes.svyUtils.getType(forms)
 * creationalprototype
 * =>scopes.svyUtils.getType(forms.AbstractModuleDef.controller)
 * javaobject
 * =>scopes.svyUtils.getType(forms.AbstractModuleDef.getId())
 * global
 * =>scopes.svyUtils.getType(forms.AbstractModuleDef.getId)
 * function
 */
///**
// * based on http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator
// * @param {*} object
// *
// * @properties={typeid:24,uuid:"05736CB2-5541-4656-833F-CDCF1B879462"}
// */
//function getType(object) {
//	return {}.toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
//}