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
 * TODO: allow classes to instantiate their own eventManager, with a local store of events, to improve performance
 * 
 */

/**
 * @private
 * @type {Object<Object<Array<String>>>}
 *
 * @properties={typeid:35,uuid:"0FE5A45F-B494-49C8-9080-A51DCEDF3F5F",variableType:-4}
 */
var events = {}

/**
 * TODO: add full support for "Named elements/variables/methods of RuntimeForms". Currently works when passed as a string, but not as an object
 * @private 
 * @param {*} obj
 *
 * @properties={typeid:24,uuid:"B14E62E6-95B1-4AE6-9AF1-032BA6B9495D"}
 */
function convertObjectToString(obj) {
	if (obj instanceof Function) {
		return scopes.modUtils.convertServoyMethodToQualifiedName(obj);
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
						    ((objStringParts[2] == 'elements' && (solutionModel.getForm(objStringParts[1]).getComponent(objStringParts[2] || solutionModel.getForm(objStringParts[1]).getBean(objStringParts[2]))) || 
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

//TODO: add full support for "Named elements/variables/methods of RuntimeForms," to the obj param: 
/**
 * Adds a Servoy method as listener for the specified eventType on the specified object
 * 
 * @public
 * 
 * @param {*|String} obj The object on which to listen for events. Supported are RuntimeForms, scopes or custom String identifiers ('.' not allowed in the custom String identifier)
 * @param {String} eventType The event identifier
 * @param {Function|String} eventHandler The Servoy method to execute upon event firing
 * 
 * @throws {scopes.modUtils$exceptions.IllegalArgumentException} When the obj or eventHandler could not be resolved to a node in the Servoy Object Model
 * 
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
 * @example <pre>scopes.modUtils$eventManager.addListener('forms.myForm', 'myEvent', 'scopes.myCustomScope.myEventHandlerMethod')</pre>
 * 
 * @properties={typeid:24,uuid:"B55D1349-D418-4775-BB05-0451D7438A62"}
 */
function addListener(obj, eventType, eventHandler) {
	var objectString = convertObjectToString(obj);
	if(!objectString){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('obj parameter could not be resolved to a node path in the Servoy Object Model: ' + obj);
	}
	var actionString = convertObjectToString(eventHandler);
	if (!actionString){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('eventHandler parameter could not be resolved to a Servoy method');
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
 * @public
 * 
 * @param {*|String} obj The object on which behalf to fire the event
 * @param {String} eventType The event identifier
 * @param {*|Array<*>} [args] An value or Array of values to apply as arguments to the eventHandler invocation
 * @param {Boolean} [isVetoable] Optionally specify if an event can be vetoed. A listener may veto an event by returning false. Subsequent propagation of the event is then cancelled
 *
 * @return {Boolean} True unless the event was vetoable and vetoed by a listener, in which case all subsequent listeners will not be notified and the caller of this method has an opportunity to veto a change
 *
 * @example <pre> //Example of using the Event class to fire an Event
 * var EVENT_TYPES = {
 * 	MY_OWN_EVENT_TYPE: 'myOwnEventType'
 * }
 * var event = new scopes.modUtils$eventManager.Event(myObject, EVENT_TYPES.MY_OWN_EVENT_TYPE, {x: 10, y:20}, {description: 'some text'})
 * scopes.modUtils$eventManager.fireEvent(id, EVENT_TYPES.MY_OWN_EVENT_TYPE, event)
 *</pre>
 *
 * @properties={typeid:24,uuid:"06FDBBB0-D4AF-48E1-BE0F-858BC089D977"}
 */
function fireEvent(obj, eventType, args, isVetoable) {
	var objectString = convertObjectToString(obj)
	if (objectString && events) {
		var evtel = events[objectString];
		if (evtel) {
			var curel = evtel[eventType];
			if (curel) {
				for (var act in curel) { //Is this a save loop? what if on fireEvent a listener removes itself or another one?
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
					var result = scope[actionStringParts[2]].apply(scope, Array.isArray(args) ? args : [args]);
					if(isVetoable && result === false){
						return false;	// terminate event propagation and (possibly) veto change (This is implementation-specific)
					}
				}
			}
		}
	}
	return true;
}

/**
 * Convenient base class for Event to send as event parameter when firing a event using fireEvent.<br/>
 * <br/>
 * Implementations can extend this base class or use it directly<br/>
 * <br/>
 * @constructor
 * @public
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
	 * @public 
	 * @return {*}
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