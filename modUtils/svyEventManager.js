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
 * - don't store function references but Strings, to prevent mem leaks
 * - Removed binding param, as irrelevant within the context of Servoy (Servoy takes care of the binding)
 * - Modified the way arguments are applied when invoking a listener
 */

/**
 * @private
 * @type {Object<Object<Array<String>>>}
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
 * @private 
 * @param {*} obj
 *
 * @properties={typeid:24,uuid:"27DF517C-19E0-43AB-8FC6-402303D35C6F"}
 */
function convertObjectToString(obj) {
	if (obj instanceof Function) {
		return convertFunctionToString(obj)
	}
	if (obj instanceof String) {
		/**@type {Array<String>}*/
		var objStringParts = obj.split('.')
		if (objStringParts == 0) {
			return null
		}
		
		if (['forms','globals','scopes'].indexOf(objStringParts[0]) == -1) {
			return null
		} else if (objStringParts.length == 1) {
			return obj
		}
		
		switch (objStringParts[0]) {
			case 'forms':
				if (solutionModel.getForm(objStringParts[1]) == null || !(objStringParts[1] in forms)) { //check both designtime forms and runtime instances, but prevent auto form loading
					return null
				} else if (objStringParts.length == 2) {
					return obj
				} else if ( (objStringParts[1] in forms && forms[objStringParts[1]][objStringParts[2]]) ||
						    (solutionModel.getForm(objStringParts[1]).getComponent(objStringParts[2] || 
						     solutionModel.getForm(objStringParts[1]).getBean(objStringParts[2]) || 
							 solutionModel.getForm(objStringParts[1]).getMethod(objStringParts[2]) ||
							 solutionModel.getForm(objStringParts[1]).getVariable(objStringParts[2])))) {
					return obj
				}
				break;
			case 'globals':
				if (!(objStringParts[1] in globals)) {
					return null
				}
				break;
			case 'scopes':
				if (!(objStringParts[1] in scopes)) {
					return null
				}
				break;
			default:
				break;
		}
	}
	
	if (obj instanceof RuntimeForm) {
		return 'forms.' + obj.controller.getName() //Controller might be encapsulated
	} 
	
	if (obj == globals) {
		return 'globals'
	}
	
	var retval = null
	solutionModel.getScopeNames().forEach(function(value, index, array){
		if (obj == scopes[value]) {
			retval = 'scopes.' + value
		}
	})
	return retval
}

/**
 * Gets the index of the given action for the element
 * @private
 * 
 * @param {String} obj The object for which to listen for event.
 * @param {String} evt The event identifier
 * @param {String} eventHandler The listener method to execute upon the event firing
 * @return {Number} Returns an integer.
 *
 * @properties={typeid:24,uuid:"F788E5CA-8B6F-4006-99A3-4A05CBD991D5"}
 */
function getActionIdx(obj, evt, eventHandler) {
	if (obj && evt) {
		var curel = events[obj][evt];
		if (curel) {
			var len = curel.length;
			for (var i = len - 1; i >= 0; i--) {
				if (curel[i] == eventHandler) {
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
 * @param {*|String} obj The object on which to listen for events. Supported are forms, globals and custom scopes
 * @param {String} eventType The event identifier
 * @param {Function|String} eventHandler The listener method to execute upon event firing
 * 
 * @return {Boolean} Returns true if adding the listener succeeded, false otherwise.
 * 
 * @example <pre>var EVENT_TYPES = {
 * 	MY_OWN_EVENT_TYPE: 'myOwnEventType'
 * }
 * 
 * function onLoad() {
 * 	scopes.svyEventManager.addListener(this, EVENT_TYPES.MY_OWN_EVENT_TYPE, myEventHandler)
 * }	 
 * function myEventHandler(booleanValue, numberValue, stringValue) {
 * 	application.output(arguments)
 * }
 * 
 * function test(){
 * 	scopes.svyEventManager.fireEvent(this, EVENT_TYPES.MY_FIRST_EVENT_TYPE, [true, 1, 'Hello world!'])
 * }
 * </pre>
 * @example <pre>scopes.svyEventManager.addListener('forms.myForm', 'myEvent', 'scopes.myCustomScope.myEventHandlerMethod')</pre>
 * @properties={typeid:24,uuid:"35003AFB-65AF-42E1-A05C-E920FD3B538F"}
 */
function addListener(obj, eventType, eventHandler) {
	var objectString = convertObjectToString(obj)
	var actionString = convertObjectToString(eventHandler)
	if (!actionString) return false

	if (events[objectString]) {
		if (events[objectString][eventType]) {
			if (getActionIdx(objectString, eventType, actionString) == -1) {
				var curevt = events[objectString][eventType];
				curevt[curevt.length] = actionString;
			}
		} else {
			events[objectString][eventType] = [];
			events[objectString][eventType][0] = actionString;
		}
	} else {
		events[objectString] = {};
		events[objectString][eventType] = [];
		events[objectString][eventType][0] = actionString;
	}
	return true
}

/**
 * Removes a listener
 *
 * @param {*|String} obj The object from which the listener needs to be removed
 * @param {String} eventType The event identifier
 * @param {Function|String} eventHandler The listener to remove
 *
 * @properties={typeid:24,uuid:"B3C4A9FB-6058-43C2-BE8A-889ECE28C3EC"}
 */
function removeListener(obj, eventType, eventHandler) {
	var objectString = convertObjectToString(obj)
	var actionString = convertObjectToString(eventHandler)
	if (events[objectString]) {
		if (events[objectString][eventType]) {
			var idx = getActionIdx(objectString, eventType, actionString);
			if (idx >= 0) {
				events[objectString][eventType].splice(idx, 1);
			}
		}
	}
}

/**
 * Fires the specified event, which will invoke all listeners added for the combination of obj and evt<br>
 * <br>
 * NOTE when the method specified as eventHandler in {@link #addListener()} is a Form method and the form is not loaded when the event is fired, the eventHandler will NOT be invoked
 *
 * @param {*|String} obj The object on which behalf to fire the event
 * @param {String} eventType The event identifier
 * @param {*|Array<*>} [args] An value or Array of values to apply as arguments to the eventHandler invocation
 *
 * @properties={typeid:24,uuid:"47AE1425-E064-4AF6-A712-AAA33E54C30C"}
 */
function fireEvent(obj, eventType, args) {
	var objectString = convertObjectToString(obj)
	if (objectString && events) {
		var evtel = events[objectString];
		if (evtel) {
			var curel = evtel[eventType];
			if (curel) {
				for (var act in curel) {
					if (!curel[act]) continue
					var actionStringParts = curel[act].split('.');
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