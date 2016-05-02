/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
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
 * Determines if two objects or two values are equivalent. Supports value types, regular expressions, arrays and
 * objects.
 *
 * <p>Two objects or values are considered equivalent if at least one of the following is true:</p><p><ul>
 *
 * <li>Both objects or values pass "===" comparison.</li>
 * <li>Both objects or values are of the same type and all of their properties pass "===" comparison.</li>
 * <li>Both values are NaN. (In JavasScript, NaN == NaN => false. But we consider two NaN as equal)</li>
 * <li>Both values are JSDataSets with the same content</li>
 * <li>Both values are JSFoundSets with the same records</li>
 * <li>Both values are UUIDs with the same value</li>
 * <li>Both values represent the same regular expression (In JavasScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).</li>
 * </ul></p><p>
 * During a property comparison, properties of type "function" type are ignored.</p>
 * 
 * @version 6.0
 * @since Oct 10, 2014
 * @author patrick
 *
 * @param {*} o1
 * @param {*} o2
 *
 * @properties={typeid:24,uuid:"4E1F1471-1A86-4E12-8AF8-DDD2E7171ECF"}
 */
function areObjectsEqual(o1, o2) {
	if (o1 === o2) return true;
	if (o1 === null || o2 === null) return false;
	if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
	var t1 = typeof o1, t2 = typeof o2, length, keySet;
	/** @type {String} */
	var key;
	if (t1 == t2) {
		if (t1 == 'object') {
			if (o1 instanceof Array) {
				if (! (o2 instanceof Array)) return false;
				if ( (length = o1.length) == o2.length) {
					for (key = 0; key < length; key++) {
						if (!areObjectsEqual(o1[key], o2[key])) return false;
					}
					return true;
				}
			} else if (o1 instanceof Date) {
				return (o2 instanceof Date) && o1.getTime() == o2.getTime();
			} else if (o1 instanceof UUID) {
				return (o2 instanceof UUID) && o1.toString() == o2.toString();
			} else if (o1 instanceof RegExp && o2 instanceof RegExp) {
				return o1.toString() == o2.toString();
			} else if (o1 instanceof JSDataSet) {
				if (! (o2 instanceof JSDataSet)) return false;
				if (o1.getMaxRowIndex() == o2.getMaxRowIndex) {
					for (var i = 1; i <= o1.getMaxRowIndex(); i++) {
						if (!areObjectsEqual(o1.getRowAsArray(i), o2.getRowAsArray(i))) return false;
					}
					return true;
				}
			} else if (o1 instanceof JSFoundSet) {
				if (! (o2 instanceof JSFoundSet)) return false;
				if (o1.getSize() == o2.getSize()) {
					for (var f = 1; f <= o1.getSize(); f++) {
						if (!areObjectsEqual(o1.getRecord(f).getPKs(), o2.getRecord(f).getPKs())) return false;
					}
					return true;
				}
			} else {
				keySet = { };
				for (key in o1) {
					if (o1[key] instanceof Function || (typeof (o1[key]) == "function")) continue;
					if (!areObjectsEqual(o1[key], o2[key])) return false;
					keySet[key] = true;
				}
				for (key in o2) {
					if (!keySet.hasOwnProperty(key) && o2[key] !== undefined && ! (o2[key] instanceof Function || (typeof (o2[key]) == "function"))) return false;
				}
				return true;
			}
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