/*
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2013 Servoy BV 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Returns true if the supplied argument is a JavaScript object. Returns false for non-objects, including subclasses like Array, Date or Regex
 * @param {*} object
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"8B942664-6C9B-48AD-B0AA-DC9C9E411BCD"}
 */
function isObject(object) {
	return Object.prototype.toString.call(object) == '[object Object]'
}

/**
 * Returns true if a given object has a property with the given value<br>
 * Only checks properties of the Object itself, not properties inherited through the prototype chain
 * 
 * @param {Object} object
 * @param {*} value
 *
 * @properties={typeid:24,uuid:"1961FA1B-D8D7-47F7-BFE7-FE017E7CB4FC"}
 */
function objectHasValue(object, value) {
	var keys = Object.keys(object)
	for (var i = 0; i < keys.length; i++) {
		if (object[keys[i]] === value) {
			return true;
		}
	}
	return false;
}

/**
 * Helper function for dynamically calling a constructor function with arguments
 * 
 * @see http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
 * 
 * @param {Function} constructor
 * @param {Array<*>} args
 * @return {Object}
 *
 * @properties={typeid:24,uuid:"FEA9C6A7-068C-49AD-A4F5-79E0BFDF8ACE"}
 */
function dynamicConstructorInvoker(constructor, args) {
	var instance = Object.create(constructor.prototype);
    var result = constructor.apply(instance, args);

    return (result !== null && typeof result === 'object') ? result : instance;
}

//TODO add replacer function for JSON.stringify that handles circular references or a custom object stringifier that does this and also removes the quotes around the keys

/*Attempt to replace globals.svy_utl_getTypeOf, but doesn't work that well (yet)
 * =>scopes.svyJSUtils.getType(undefined)
 * global
 * =>scopes.svyJSUtils.getType(null)
 * global
 * =>var x = databaseManager.createEmptyDataSet()
 * =>scopes.svyJSUtils.getType(x)
 * jsdataset
 * =>scopes.svyJSUtils.getType(databaseManager.getFoundSet('db:/svy_framework/log'))
 * foundset
 * =>scopes.svyJSUtils.getType(solutionModel.getForm('AbstractModuleDef'))
 * javaobject
 * =>scopes.svyJSUtils.getType(plugins)
 * pluginscope
 * =>scopes.svyJSUtils.getType(forms)
 * creationalprototype
 * =>scopes.svyJSUtils.getType(forms.AbstractModuleDef.controller)
 * javaobject
 * =>scopes.svyJSUtils.getType(forms.AbstractModuleDef.getId())
 * global
 * =>scopes.svyJSUtils.getType(forms.AbstractModuleDef.getId)
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