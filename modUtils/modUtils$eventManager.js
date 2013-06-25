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
 * 
 * TODO: add support for listeners on FoundSets by creating a JavaClass that allows you to access Servoy's public API on FoundSets to add a listener and load this through the media/bin
 */

/**
 * @private
 * @type {Object<Object<Array<String>>>}
 *
 * @properties={typeid:35,uuid:"0FE5A45F-B494-49C8-9080-A51DCEDF3F5F",variableType:-4}
 */
var events = {}

/**
 * TODO: externalize to utility scope, so it can be used wider
 * Converts function references to string representations
 * @private
 * @param {Function|String} action
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"0C9921E3-237F-4E85-B0A3-D2EB2E99A78E"}
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
 * @properties={typeid:24,uuid:"B14E62E6-95B1-4AE6-9AF1-032BA6B9495D"}
 */
function convertObjectToString(obj) {
	if (obj instanceof Function) {
		return convertFunctionToString(obj)
	}
	if (obj instanceof String) {
		/**@type {Array<String>}*/
		var objStringParts = obj.split('.')
		if (objStringParts.length == 0) {
			return null
		}
		
		if (objStringParts.length == 1) {
			return obj
		} else if (['forms','globals','scopes'].indexOf(objStringParts[0]) == -1) {
			return null
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
	
	for (var name in scopes) {
		if (scopes[name] == obj) {
			return 'scopes.' + name
		}
	}
	
	return null
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
 * @properties={typeid:24,uuid:"3B83F870-C874-4018-B608-38D4CB280EF2"}
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
 * 
 * @param {*|String} obj The object on which to listen for events. Supported are forms, globals and custom scopes
 * @param {String} eventType The event identifier
 * @param {Function|String} eventHandler The listener method to execute upon event firing

 * @example <pre>var EVENT_TYPES = {
 * 	MY_OWN_EVENT_TYPE: 'myOwnEventType'
 * }
 * 
 * function onLoad() {
 * 	scopes.modUtils$eventManager.addListener(this, EVENT_TYPES.MY_OWN_EVENT_TYPE, myEventHandler)
 * }	
 *  
 * function myEventHandler(booleanValue, numberValue, stringValue) {
 * 	application.output(arguments)
 * }
 * 
 * function test(){
 * 	scopes.modUtils$eventManager.fireEvent(this, EVENT_TYPES.MY_FIRST_EVENT_TYPE, [true, 1, 'Hello world!'])
 * }
 * </pre>
 * 
 * @public
 * @example <pre>scopes.modUtils$eventManager.addListener('forms.myForm', 'myEvent', 'scopes.myCustomScope.myEventHandlerMethod')</pre>
 * @throws {scopes.modUtils$exceptions.IllegalArgumentException} When the target or listener could not be resolved to a node path in the solution model
 * 
 * @properties={typeid:24,uuid:"B55D1349-D418-4775-BB05-0451D7438A62"}
 */
function addListener(obj, eventType, eventHandler) {
	var objectString = convertObjectToString(obj);
	if(!objectString){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('Target could not be resolved to a node path in soution model');
	}
	var actionString = convertObjectToString(eventHandler);
	if (!actionString){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('Event handler could not be resolved to a node path in soution model');
	}

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
}

/**
 * Removes a listener
 * 
 * @example <pre>scopes.modUtils$eventManager.removeListener('forms.myForm', 'myEvent', 'scopes.myCustomScope.myEventHandlerMethod')</pre>
 *
 * @param {*|String} obj The object from which the listener needs to be removed
 * @param {String} eventType The event identifier
 * @param {Function|String} eventHandler The listener to remove
 *
 * @public
 *  
 * @properties={typeid:24,uuid:"999BAC85-4450-4FF1-8252-BDC403778E06"}
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
 * @example <pre> //Example of using the Event class to fire an Event
 * var EVENT_TYPES = {
 * 	MY_OWN_EVENT_TYPE: 'myOwnEventType'
 * }
 * var event = new scopes.modUtils$eventManager.Event(myObject, EVENT_TYPES.MY_OWN_EVENT_TYPE, {x: 10, y:20}, {description: 'some text'})
 * scopes.modUtils$eventManager.fireEvent(id, EVENT_TYPES.MY_OWN_EVENT_TYPE, event)
 *</pre>
 *
 * @param {*|String} obj The object on which behalf to fire the event
 * @param {String} eventType The event identifier
 * @param {*|Array<*>} [args] An value or Array of values to apply as arguments to the eventHandler invocation
 *
 * @public
 * 
 * @properties={typeid:24,uuid:"06FDBBB0-D4AF-48E1-BE0F-858BC089D977"}
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

					//Would be nice to allow the args param be an arguments object, but haven't found a failsave way to distinguish an arguments object form anything else
					//Not using something like http://oranlooney.com/javascript-arguments/, as arguments.callee is deprecated in future JavaScript versions and the for loop check doesn't work in Rhino
					//!!Array.prototype.slice.call(args)['length'] fails for forms and elements objects and other objects that have a length property
					scope[actionStringParts[2]].apply(scope, Array.isArray(args) ? args : [args])
				}
			}
		}
	}
}

/**
 * Convenient base class for Event to send as event parameter when firing a event using fireEvent.<br/>
 * <br/>
 * Implementations can extend this base class or use it directly<br/>
 * <br/>
 * @constructor 
 * 
 * @param {String} type
 * @param {*} source
 * @param {Object} [data]
 * 
 * @example <pre> //Example of using the Event class to fire an Event
 * var EVENT_TYPES = {
 * 	MY_OWN_EVENT_TYPE: 'myOwnEventType'
 * }
 * var event = new scopes.modUtils$eventManager.Event(myObject, EVENT_TYPES.MY_OWN_EVENT_TYPE, {x: 10, y:20}, {description: 'some text'})
 * scopes.modUtils$eventManager.fireEvent(id, EVENT_TYPES.MY_OWN_EVENT_TYPE, event)
 *</pre>
 * 
 * @example <pre> //Example of extending the base class
 * &#47;**
 *  * Extended Event class that also exposes getPosition
 *  * &#64;private
 *  * &#64;constructor 
 *  * &#64;extends {scopes.modUtils$eventManager.Event}
 *  *
 *  * @param {String} type
 *  * @param {*} source
 *  * @param {{x: Number, y: Number}} [position]
 *  * @param {Object} [data]
 *  *&#47;
 *  function Event(type, source, position, data) {
 *  	scopes.modUtils$eventManager.Event.call(this, type, source, data); //Applying the arguments to the base class constructor
 *  	
 *  	this.getPosition = function() {
 *  		return position||null;
 *  	}
 *  }
 *  
 *  var eventSetup = function() {
 *  	Event.prototype = Object.create(scopes.modUtils$eventManager.Event.prototype); //Set the custom event's prototype to the base class, without invoking the constructor
 *  }()
 *</pre>
 *
 * @public
 *  
 * @properties={typeid:24,uuid:"C72578DE-E6DE-4CBF-B958-6835A203ED3B"}
 */
function Event(type, source, data) {
	this.data = data
	
	/**
	 * Gets the event type
	 * @return {String}
	 * @public 
	 */
	this.getType = function(){
		return type
	}
	
	/**
	 * Gets the event source, can be anything
	 * @return {Object}
	 * @public 
	 */
	this.getSource = function() {
		return source
	}
	
	/**
	 * Gets a string representation of the Object
	 * @return {String}
	 * @override 
	 */
	this.toString = function (){
		var props = {
			type: this.getType(),
			source: this.getSource()
		}
		
		var instance = this
		Object.getOwnPropertyNames(this).forEach(function(value, index, array) {
			if (['getSource', 'getType'].indexOf(value) == -1 && value.substr(0,3) == 'get') {
				var name = value.substr(3,1).toLowerCase() + value.substring(4)
				if (instance[value] instanceof Function) {
					props[name] =  instance[value]()
				} else {
					props[name] = instance[value]
				}
			}
		})
		
		props.data = this.data

		//TODO: instances of JavaScript objects do not serialize nicely, but result in [object Object]
		var retval = 'Event('
		for (var prop in props) {
			retval += prop + ' : ' + (props[prop] ? props[prop] : 'null') + ', '
		}
		return retval.slice(0, -2) + ')'
	}
}