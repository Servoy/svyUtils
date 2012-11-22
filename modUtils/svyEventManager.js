/*
 * Implementation based on http://www.josh-davis.org/node/4, http://www.josh-davis.org/files/uploads/2007/05/custom-event-listeners.js
 * ---------------------------------------------------------------------------------------------------------
 * Copyright (c) 2007 	Josh Davis ( http://joshdavis.wordpress.com )
 * 
 * Licensed under the MIT License ( http://www.opensource.org/licenses/mit-license.php ) as follows:
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
 * ---------------------------------------------------------------------------------------------------------
 * 
 * Event Manager implementation, supports adding, removing and firing events
 * 
 * NOTE Event handler methods must be Servoy methods, not dynamically created functions inside code
 * 
 * Original implementation was adjusted to:
 * - don't store function references but Strings
 * - Removed binding param, as irrelevant within the context of Servoy (Servoy takes care of the binding)
 * - Modified the way arguments are applied when invoking a listener
 */

/**
 * @private
 * @type {Object<Object<Array<{ action: String}>>>}
 *
 * @properties={typeid:35,uuid:"EB9A7966-F1E0-4A2D-BB6D-4B65B76CB019",variableType:-4}
 */
var events = {}

/**
 * TODO: externalize to utility scope, so it can be used wider
 * Converts function references to string representations
 * @private
 * @param {Function|String} action
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"E0E9A44A-DD06-4928-A521-F53EE328DAF2"}
 */
function convertFunctionToString(action) {
	if (action instanceof Function) {
		try {
			var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(action)
			if (fd.getFormName()) {
				return 'forms.' + fd.getFormName() + '.' + fd.getMethodName()
			} else if (fd.getScopeName()) {
				return 'scopes.' + fd.getScopeName() + '.' + fd.getMethodName()
			} else { //TODO: got all variations covered with the above logic?
				return null
			}
		} catch (e) {
			application.output(e, LOGGINGLEVEL.ERROR)
			return null
		}
	}
	return action
}

/**
 * Gets the index of the given action for the element
 * @private
 * 
 * @param {*} obj The element attached to the action.
 * @param {String} evt The name of the event.
 * @param {Function|String} action The action to execute upon the event firing.
 * @return {Number} Returns an integer.
 *
 * @properties={typeid:24,uuid:"F788E5CA-8B6F-4006-99A3-4A05CBD991D5"}
 */
function getActionIdx(obj, evt, action) {
	var actionString = convertFunctionToString(action)

	if (obj && evt) {
		var curel = events[obj][evt];
		if (curel) {
			var len = curel.length;
			for (var i = len - 1; i >= 0; i--) {
				if (curel[i].action == actionString) {
					return i;
				}
			}
		} else {
			return -1;
		}
	}
	return -1;
}

/**
 * Adds a listener
 * FIXME: obj param can be objects that might get unloaded, thus would cause a memory leak
 * TODO: add option to specify if form-based listener methods should load the form when invoked and the form is unloaded
 * @param {*} obj The element attached to the action.
 * @param {String} evt The name of the event.
 * @param {Function|String} action The action to execute upon the event firing.
 * 
 * @return {Boolean} Returns true if adding the listener succeeded, false otherwise.
 *
 * @properties={typeid:24,uuid:"35003AFB-65AF-42E1-A05C-E920FD3B538F"}
 */
function addListener(obj, evt, action) {
	var actionString = convertFunctionToString(action)
	if (!actionString) return false

	if (events[obj]) {
		if (events[obj][evt]) {
			if (getActionIdx(obj, evt, actionString) == -1) {
				var curevt = events[obj][evt];
				curevt[curevt.length] = { action: actionString};
			}
		} else {
			events[obj][evt] = [];
			events[obj][evt][0] = { action: actionString};
		}
	} else {
		events[obj] = {};
		events[obj][evt] = [];
		events[obj][evt][0] = { action: actionString};
	}
	return true
}

/**
 * Removes a listener
 *
 * @param {*} obj The element attached to the action.
 * @param {String} evt The name of the event.
 * @param {Function|String} action The action to execute upon the event firing.
 * @param {*} [binding] The object to scope the action to.
 *
 * @properties={typeid:24,uuid:"B3C4A9FB-6058-43C2-BE8A-889ECE28C3EC"}
 */
function removeListener(obj, evt, action) {
	var actionString = convertFunctionToString(action)
	if (events[obj]) {
		if (events[obj][evt]) {
			var idx = getActionIdx(obj, evt, actionString);
			if (idx >= 0) {
				events[obj][evt].splice(idx, 1);
			}
		}
	}
}

/**
 * Fires an event
 *
 * @param {*} obj The object attached to the action.
 * @param {String} evt The name of the event.
 * @param {*|Array<*>} [args] The argument attached to the event.
 *
 * @properties={typeid:24,uuid:"47AE1425-E064-4AF6-A712-AAA33E54C30C"}
 */
function fireEvent(obj, evt, args) {
	if (obj && events) {
		var evtel = events[obj];
		if (evtel) {
			var curel = evtel[evt];
			if (curel) {
				for (var act in curel) {
					if (!curel[act].action) continue
					var actionStringParts = curel[act].action.split('.');
					var scope
					switch (actionStringParts[0]) {
						case 'forms':
							if (!(actionStringParts[1] in forms)) continue; //form is currently not loaded, so not firing the event
							scope = forms[actionStringParts[1]]
							break;
						case 'scopes':
							scope = scopes[actionStringParts[1]]
							break;
						default:
							continue
					}
					scope[actionStringParts[2]].apply(scope, args)
				}
			}
		}
	}
}

///**
// * @param {String} formName
// * @param {String} elementName
// * @param {Number} modifiers
// * @param {Object} source
// * @param {Number} type
// * @param {{x: Number, y: Number}} position
// * @param {Object} data
// *
// * @properties={typeid:24,uuid:"0F2D7A99-F669-41EA-9CB9-F84DBCC768DA"}
// */
//function newJSEvent(formName, elementName, modifiers, source, type, position, data) {
//	return new customJSEvent(formName, elementName, modifiers, source, type, position, data)
//}
//
///**
// * @constructor
// * @private
// * @SuppressWarnings(unused)
// * @properties={typeid:35,uuid:"CF005E81-F845-49E5-A4B3-A2B36F6FF13F",variableType:-4}
// */
//var customJSEvent = function(formName, elementName, modifiers, source, type, position, data) {
//	var time = application.getTimeStamp()
//
//	this.getElementName = function() {
//		return elementName
//	}
//	this.getFormName = function() {
//		return formName
//	}
//	this.getModifiers = function() {
//		return modifiers
//	}
//	this.getSource = function() {
//		return source
//	}
//	this.getTimeStamp = function() {
//		return time
//	}
//	this.getType = function() {
//		return type
//	}
//	this.getX = function() {
//		return position.x
//	}
//	this.getY = function() {
//		return position.y
//	}
//
//	//TODO make this a getter?
//	this.data = data
//}