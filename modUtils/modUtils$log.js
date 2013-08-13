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
 * Copyright 2013 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * log4javascript
 *
 * log4javascript is a logging framework for JavaScript based on log4j
 * for Java. This file contains all core log4javascript code and is the only
 * file required to use log4javascript, unless you require support for
 * document.domain, in which case you will also need console.html, which must be
 * stored in the same directory as the main log4javascript.js file.
 *
 * Author: Tim Down <tim@log4javascript.org>
 * Version: 1.4.6
 * Edition: log4javascript
 * Build date: 19 March 2013
 * Website: http://log4javascript.org
 */

/*
 * Altered version of log4javascript version 1.4.6 for usage within Servoy
 * - made header comments regular comments instead of JSDoc comments
 * - Removed Array prototype polyfills
 * - removed function prototype polyfills
 * - moved prototype code for timer, Logger, Level, Appender, Layout, LoggingEvent to initXxxx var
 * - Removed all appenders + related DOM specific code
 * - Removed log4javascript namespace logic
 * - adjusted formatting
 * - worked around Servoy's limitations when it comes to recognizing prototype modifications
 * - removed urlEncode/Decode polyfills
 * - Replaced typeCheckingCode with JSDoc
 * - Removed evalInScope
 * - Changed formatter to not modify Date prototype
 * - TODO Made default ApplicationOutputAppender one that uses application.output()
 * - TODO Made default level equal to Servoy's loglevel
 * - TODO Better exception output, using Rhino's capabilities
 * - Changed to show stacktraces by default
 * - Adjusted level values to align with Servoy's LOGGING_LEVEL values
 * - Replaces array_contains util function calls with inline Array.indexof 
 * - Added ApplicationOutputAppender that appends through Servoy's application.output
 * - Added ApplicationOutputAppender to RootLogger for convenience (involved initializing rootLogger lazy). Can be removed by calling removeAllAppenders
 * - Limited the logging methonds of the Logger to one message, as Servoy is not capable to resolve (.....Object, [Error])
 *
 * TODOs
 * - remove dependancy on window
 *
 */

/* -------------------------------------------------------------------------- */

/**
 * @param obj
 *
 * @properties={typeid:24,uuid:"6CEB9CEB-29E2-42AA-9A23-34D845BAF606"}
 */
function isUndefined(obj) {
	return typeof obj == "undefined";
}

/* ---------------------------------------------------------------------- */
// Custom event support

/**
 * @private
 * @properties={typeid:35,uuid:"CA1D5AD9-FCF8-4F5C-9A40-852C938A4CEB",variableType:-4}
 */
var eventTypes = []

/** 
 * @private
 * @type {Object<function>}
 * @properties={typeid:35,uuid:"93B013F7-C2D9-49AF-818B-0E421254D682",variableType:-4}
 */
var eventListeners = {}

/**
 * @public
 * @param {Array} eventTypesParam
 *
 * @properties={typeid:24,uuid:"D0545DC4-85F0-4F3D-858B-3822D0907F31"}
 */
function setEventTypes(eventTypesParam) {
	if (eventTypesParam instanceof Array) {
		eventTypes = eventTypesParam;
		eventListeners = {};
		for (var i = 0, len = eventTypes.length; i < len; i++) {
			eventListeners[eventTypes[i]] = [];
		}
	} else {
		handleError("log4javascript.EventSupport [" + this + "]: setEventTypes: eventTypes parameter must be an Array");
	}
}

/**
 * Adds a function to be called when an event of the type specified occurs in log4javascript. Supported event types are load (occurs once the page has loaded) and error.<br>
 * <br>
 * Each listener is passed three parameters:<br>
 * <li>sender. The object that raised the event (i.e. the log4javascript object);</li>
 * <li>eventType. The type of the event;</li>
 * <li>eventArgs. An object containing of event-specific arguments. For the error event, this is an object with properties message and exception. For the load event this is an empty object.</li><br>
 * <br>
 * 
 * @public
 * @param {String} eventType
 * @param {Function} listener
 *
 * @properties={typeid:24,uuid:"4DEEE7E8-DE40-4482-B7EA-DA226DE284F7"}
 */
function addEventListener(eventType, listener) {
	if (typeof listener == "function") {
		if (!(eventTypes.indexOf(eventType) != -1)) {
			handleError("log4javascript.EventSupport [" + this + "]: addEventListener: no event called '" + eventType + "'");
		}
		this.eventListeners[eventType].push(listener);
	} else {
		handleError("log4javascript.EventSupport [" + this + "]: addEventListener: listener must be a function");
	}
}

/**
 * Removes the event listener function supplied for the event of the type specified.<br>
 * <br>
 * @public
 * @param {String} eventType
 * @param {Function} listener
 *
 * @properties={typeid:24,uuid:"20F3D5BA-EDE5-4492-BE8D-9B424CDA9CEB"}
 */
function removeEventListener(eventType, listener) {
	if (typeof listener == "function") {
		if (!(eventTypes.indexOf(eventType) != -1)) {
			handleError("log4javascript.EventSupport [" + this + "]: removeEventListener: no event called '" + eventType + "'");
		}
		array_remove(eventListeners[eventType], listener);
	} else {
		handleError("log4javascript.EventSupport [" + this + "]: removeEventListener: listener must be a function");
	}
}

/**
 * Raises an event of type eventType on the log4javascript object. Each of the listeners for this type of event (registered via addEventListener) is called and passed eventArgs as the third parameter.<br>
 * <br>
 * @public
 * @param {String} eventType
 * @param {Object} eventArgs
 *
 * @properties={typeid:24,uuid:"8EFE64BA-A8D3-4B29-92D2-8B37EE216E55"}
 */
function dispatchEvent(eventType, eventArgs) {
	if (eventTypes.indexOf(eventType) != -1) {
		var listeners = eventListeners[eventType];
		for (var i = 0, len = listeners.length; i < len; i++) {
			listeners[i](this, eventType, eventArgs);
		}
	} else {
		handleError("log4javascript.EventSupport [" + this + "]: dispatchEvent: no event called '" + eventType + "'");
	}
}

/* -------------------------------------------------------------------------- */

/**
 * @private
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"52934E8C-E1B9-49AC-A576-F0E42DEF60B7",variableType:93}
 */
var applicationStartDate = new Date();

/**
 * @private
 * @properties={typeid:35,uuid:"BE894510-4167-43D5-A14F-9294368F9BF5",variableType:-4}
 */
var emptyFunction = function() {};

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D2ADB9F2-5BC8-45E8-BCFF-A9A2F653903C"}
 */
var newLine = "\r\n";

/* -------------------------------------------------------------------------- */
// Utility functions
/**
 * @private
 * @param obj
 *
 * @properties={typeid:24,uuid:"3CBFF4F8-0E78-43EB-9049-C701390164FE"}
 */
function toStr(obj) {
	if (obj && obj.toString) {
		return obj.toString();
	} else {
		return String(obj);
	}
}

/**
 * @private
 * @param ex
 *
 * @properties={typeid:24,uuid:"CCE60797-1950-4A51-8463-07C0C6063357"}
 */
function getExceptionMessage(ex) {
	if (ex.message) {
		return ex.message;
	} else if (ex.description) {
		return ex.description;
	} else {
		return toStr(ex);
	}
}

/**
 * Gets the portion of the URL after the last slash
 * @private
 * @param url
 *
 * @properties={typeid:24,uuid:"BEE66465-76C9-4724-895C-C6680C283FB6"}
 */
function getUrlFileName(url) {
	var lastSlashIndex = Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\"));
	return url.substr(lastSlashIndex + 1);
}

/**
 * Returns a nicely formatted representation of an error
 * @private
 * @param ex
 *
 * @properties={typeid:24,uuid:"C47C85D0-9C6B-4FE0-BB10-BE5CBC6BFCC3"}
 */
function getExceptionStringRep(ex) {
	if (ex) {
		var exStr = " " + getExceptionMessage(ex);
		try {
			if (ex.lineNumber) {
				exStr += " on line number " + ex.lineNumber;
			}
			if (ex.fileName) {
				exStr += " in file " + getUrlFileName(ex.fileName);
			}
		} catch (localEx) {
			logLog.warn("Unable to obtain file and line information for error");
		}
		if (showStackTraces && ex.stack) {
			exStr += newLine + ex.stack;
		}
		if (exStr.slice(-1) == '\n') {
			exStr = exStr.slice(0,-1)
		}
		return exStr;
	}
	return null;
}

/**
 * @private
 * @param str
 *
 * @properties={typeid:24,uuid:"2C337EA7-43EF-4153-9DA4-A84E78523D8A"}
 */
function trim(str) {
	return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

/**
 * @private
 * @param {String} text
 *
 * @properties={typeid:24,uuid:"B196FF17-B7A4-42B0-9F06-DDA127CF2C39"}
 */
function splitIntoLines(text) {
	// Ensure all line breaks are \n only
	var text2 = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	return text2.split("\n");
}

/**
 * @private
 * @param arr
 * @param val
 *
 * @properties={typeid:24,uuid:"205A3A2E-FD78-4716-A7A1-63C5C3620D2D"}
 */
function array_remove(arr, val) {
	//TODO: replace with indexof
	var index = -1;
	for (var i = 0, len = arr.length; i < len; i++) {
		if (arr[i] === val) {
			index = i;
			break;
		}
	}
	if (index >= 0) {
		arr.splice(index, 1);
		return true;
	} else {
		return false;
	}
}

/**
 * @private
 * @param param
 * @param defaultValue
 *
 * @properties={typeid:24,uuid:"56212B49-D96A-4067-B0C1-6A6F20314721"}
 */
function extractBooleanFromParam(param, defaultValue) {
	if (isUndefined(param)) {
		return defaultValue;
	} else {
		return Boolean(param);
	}
}

/**
 * @private
 * @param param
 * @param defaultValue
 *
 * @properties={typeid:24,uuid:"5B540C3D-94D3-49ED-A15F-AAF5648A4021"}
 */
function extractStringFromParam(param, defaultValue) {
	if (isUndefined(param)) {
		return defaultValue;
	} else {
		return String(param);
	}
}

/**
 * @private
 * @param param
 * @param defaultValue
 *
 * @properties={typeid:24,uuid:"F73749F6-41CE-4ACF-84D8-C89B268E2302"}
 */
function extractIntFromParam(param, defaultValue) {
	if (isUndefined(param)) {
		return defaultValue;
	} else {
		try {
			var value = parseInt(param, 10);
			return isNaN(value) ? defaultValue : value;
		} catch (ex) {
			logLog.warn("Invalid int param " + param, ex);
			return defaultValue;
		}
	}
}

/**
 * @private
 * @param param
 * @param defaultValue
 *
 * @properties={typeid:24,uuid:"0CC09160-6123-4FB7-A0F9-AB15538A85DA"}
 */
function extractFunctionFromParam(param, defaultValue) {
	if (typeof param == "function") {
		return param;
	} else {
		return defaultValue;
	}
}

/**
 * @private
 * @param err
 *
 * @properties={typeid:24,uuid:"840203A7-0B92-4021-BDD2-1A338AB1477E"}
 */
function isError(err) {
	return (err instanceof Error);
}

/**
 * @private
 * @param eventName
 *
 * @properties={typeid:24,uuid:"96639A11-A5C4-4AAC-A11C-BD882F8CF9F6"}
 */
function getListenersPropertyName(eventName) {
	return "__log4javascript_listeners__" + eventName;
}

/**
 * @private
 * @param node
 * @param eventName
 * @param listener
 * @param useCapture
 * @param win
 *
 * @properties={typeid:24,uuid:"5EB8D682-F8FF-4E02-A225-EC2B2AA7E7CE"}
 */
function addEvent(node, eventName, listener, useCapture, win) {
	win = win ? win : window;
	if (node.addEventListener) {
		node.addEventListener(eventName, listener, useCapture);
	} else if (node.attachEvent) {
		node.attachEvent("on" + eventName, listener);
	} else {
		var propertyName = getListenersPropertyName(eventName);
		if (!node[propertyName]) {
			node[propertyName] = [];
			// Set event handler
			node["on" + eventName] = function(evt) {
				evt = getEvent(evt, win);
				var listenersPropertyName = getListenersPropertyName(eventName);

				// Clone the array of listeners to leave the original untouched
				var listeners = this[listenersPropertyName].concat([]);
				var currentListener;

				// Call each listener in turn
				while ( (currentListener = listeners.shift())) {
					currentListener.call(this, evt);
				}
			};
		}
		node[propertyName].push(listener);
	}
}

/**
 * @private
 * @param node
 * @param eventName
 * @param listener
 * @param useCapture
 *
 * @properties={typeid:24,uuid:"32692D65-0AFB-4615-8046-A47A01645A3A"}
 */
function removeEvent(node, eventName, listener, useCapture) {
	if (node.removeEventListener) {
		node.removeEventListener(eventName, listener, useCapture);
	} else if (node.detachEvent) {
		node.detachEvent("on" + eventName, listener);
	} else {
		var propertyName = getListenersPropertyName(eventName);
		if (node[propertyName]) {
			array_remove(node[propertyName], listener);
		}
	}
}

/**
 * @private
 * @param evt
 * @param win
 *
 * @properties={typeid:24,uuid:"F216D58B-4221-42A0-93C9-310AD4BBB8EC"}
 */
function getEvent(evt, win) {
	win = win ? win : window;
	return evt ? evt : win.event;
}

/**
 * @private
 * @param evt
 *
 * @properties={typeid:24,uuid:"02BE4357-C4BE-4439-B836-D7307873CADF"}
 */
function stopEventPropagation(evt) {
	if (evt.stopPropagation) {
		evt.stopPropagation();
	} else if (typeof evt.cancelBubble != "undefined") {
		evt.cancelBubble = true;
	}
	evt.returnValue = false;
}

/* ---------------------------------------------------------------------- */
// Simple logging for log4javascript itself

/**
 * @public
 * @properties={typeid:35,uuid:"CF306053-9ED3-4B7B-8760-1697FE983599",variableType:-4}
 */
var logLog = {
	quietMode: false,

	debugMessages: [],

	/**
	 * @param {Boolean} quietMode
	 */
	setQuietMode: function(quietMode) {
		this.quietMode = quietMode;
	},

	numberOfErrors: 0,

	alertAllErrors: false,

	setAlertAllErrors: function(alertAllErrors) {
		this.alertAllErrors = alertAllErrors;
	},

	/**
	 * @param {String} message
	 */
	debug: function(message) {
		this.debugMessages.push(message);
	},

	displayDebug: function() {
		application.output(this.debugMessages.join(newLine)); //TODO: changed alert into application.output. Should maybe be something else
	},

	/**
	 * @param {String} message
	 * @param {Error} [exception]
	 */
	warn: function(message, exception) {},

	/**
	 * @param {String} message
	 * @param {Error} [exception]
	 */
	error: function(message, exception) {
		if (++this.numberOfErrors == 1 || this.alertAllErrors) {
			if (!this.quietMode) {
				var alertMessage = "log4javascript error: " + message;
				if (exception) {
					alertMessage += newLine + newLine + "Original error: " + getExceptionStringRep(exception);
				}
				application.output(alertMessage); //TODO: changed alert into application.output. Should maybe be something else
			}
		}
	}
};

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"3773B2A6-00D3-43EC-82E4-6EEB055CFEC3",variableType:-4}
 */
var initEventTypes = (function() {
		setEventTypes(["load", "error"]);
	}())

/**
 * @private
 * @param {String} message
 * @param {Error} [exception]
 *
 * @properties={typeid:24,uuid:"93A19F6D-8A54-450B-B69C-06170FAAAF2E"}
 */
function handleError(message, exception) {
	logLog.error(message, exception);
	dispatchEvent("error", { "message": message, "exception": exception });
}

/* ---------------------------------------------------------------------- */
/**
 * @private
 *
 * @properties={typeid:35,uuid:"F6980ABC-334D-47E6-9271-7BA4200BD4F0",variableType:-4}
 */
var enabled = true

/**
 * Enables or disables all logging, depending on enabled<br>
 * <br>
 * @public 
 * @param enable
 *
 * @properties={typeid:24,uuid:"E50DA821-4DEC-4216-A7B5-9A8D8A7BE362"}
 */
function setEnabled(enable) {
	enabled = enable;
}

/**
 * Returns true or false depending on whether logging is enabled<br>
 * <br>
 * @public 
 * @properties={typeid:24,uuid:"F76D5F2E-DDE4-41F9-A5B2-89AD3ADF8D1D"}
 */
function isEnabled() {
	return enabled;
}

/**
 * @private
 *
 * @properties={typeid:35,uuid:"BE695155-2057-40ED-B87D-803BE91F1CDA",variableType:-4}
 */
var useTimeStampsInMilliseconds = true;

/**
 * @param {Boolean} timeStampsInMilliseconds
 *
 * @properties={typeid:24,uuid:"2293F82F-B192-4375-A38A-DF7CD697B7A2"}
 */
function setTimeStampsInMilliseconds(timeStampsInMilliseconds) {
	useTimeStampsInMilliseconds = timeStampsInMilliseconds
}

/**
 * @properties={typeid:24,uuid:"21804846-E57C-4ECB-8D32-8AC9D114BC5C"}
 */
function isTimeStampsInMilliseconds() {
	return useTimeStampsInMilliseconds;
}

/**
 * @private
 *
 * @properties={typeid:35,uuid:"3BA815E8-C750-4A9A-81FE-0C6F6DD870EE",variableType:-4}
 */
var showStackTraces = true;

/**
 * Enables or disables displaying of error stack traces, depending on show. By default stack traces are displayed.<br>
 * <br>
 * @public 
 * @param {Boolean} show
 *
 * @properties={typeid:24,uuid:"D873127D-D46B-44D6-B343-02C20D3423C7"}
 */
function setShowStackTraces(show) {
	showStackTraces = show;
}

/* ---------------------------------------------------------------------- */
// Levels

/**
 * @properties={typeid:35,uuid:"0971FFA4-3E9F-4020-8276-31ED8EAF2F0C",variableType:-4}
 */
var Level = function(level, name) {
	this.level = level;
	this.name = name;
};

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"8CB2F193-D26E-47E7-AF91-28574067D667",variableType:-4}
 */
var levelInit = (function() {
		Level.prototype = {
			toString: function() {
				return this.name;
			},
			equals: function(level) {
				return this.level == level.level;
			},
			isGreaterOrEqual: function(level) {
				return this.level >= level.level;
			}
		};

		Level.ALL = new Level(Number.MIN_VALUE, "ALL");
		Level.TRACE = new Level(-1, "TRACE");
		Level.DEBUG = new Level(LOGGINGLEVEL.DEBUG, "DEBUG");
		Level.INFO = new Level(LOGGINGLEVEL.INFO, "INFO");
		Level.WARN = new Level(LOGGINGLEVEL.WARNING, "WARN");
		Level.ERROR = new Level(LOGGINGLEVEL.ERROR, "ERROR");
		Level.FATAL = new Level(LOGGINGLEVEL.FATAL, "FATAL");
		Level.OFF = new Level(Number.MAX_VALUE, "OFF");
	}())

/* ---------------------------------------------------------------------- */
// Timers

/**
 * @private
 * @param name
 * @param level
 *
 * @properties={typeid:24,uuid:"C34A130A-45C8-4696-A4CD-212F53EB5BB6"}
 */
function Timer(name, level) {
	this.name = name;
	this.level = isUndefined(level) ? Level.INFO : level;
	this.start = new Date();
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"81F57DBB-3F07-4206-AF8A-ED1C95095C71",variableType:-4}
 */
var timerInit = (function() {
		Timer.prototype.getElapsedTime = function() {
			return new Date().getTime() - this.start.getTime();
		};
	}())

// Loggers
/**
 * @private
 * @constructor 
 * @extends {LoggerImpl}
 * @param {String} name
 *
 * @properties={typeid:24,uuid:"0C0DFC6B-7B2C-4595-AD48-DD811EB49DBC"}
 */
function Logger(name) {
	/**
	 * @private 
	 */
	this.name = name;
	/**
	 * @private 
	 */
	this.parent = null;
	/**
	 * @private 
	 */
	this.children = [];

	/** @type {Array<Appender>} */
	var appenders = [];
	var loggerLevel = null;
	var isRoot = (this.name === rootLoggerName);
	var isNull = (this.name === nullLoggerName);

	var appenderCache = null;
	var appenderCacheInvalidated = false;

	/**
	 * @protected
	 */
	this.addChild = function(childLogger) {
		this.children.push(childLogger);
		childLogger.parent = this;
		childLogger.invalidateAppenderCache();
	};

	// Additivity
	/**
	 * @private 
	 */
	var additive = true;
	
	/**
	 * Returns whether additivity is enabled for this logger<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.getAdditivity = function() {
		return additive;
	};

	/**
	 * Sets whether appender additivity is enabled (the default) or disabled. If set to false, this particular logger will not inherit any appenders form its ancestors. Any descendant of this logger, however, will inherit from its ancestors as normal, unless its own additivity is explicitly set to false.<br>
	 * <br>
	 * Default value is true<br>
	 * <br>
	 * @public
	 * @param {Boolean} additivity
	 */
	this.setAdditivity = function(additivity) {
		var valueChanged = (additive != additivity);
		additive = additivity;
		if (valueChanged) {
			this.invalidateAppenderCache();
		}
	};

	// Create methods that use the appenders variable in this scope
	/**
	 * Adds the given appender<br>
	 * <br>
	 * @public
	 * @param {Appender} appender
	 */
	this.addAppender = function(appender) {
		if (isNull) {
			handleError("Logger.addAppender: you may not add an appender to the null logger");
		} else {
			if (appender instanceof Appender) {
				if (!(appenders.indexOf(appender) != -1)) {
					appenders.push(appender);
					appender.setAddedToLogger(this);
					this.invalidateAppenderCache();
				}
			} else {
				handleError("Logger.addAppender: appender supplied ('" + toStr(appender) + "') is not a subclass of Appender");
			}
		}
	};

	/**
	 * Removes the given appender<br>
	 * <br>
	 * @public
	 * @param {Appender} appender
	 */
	this.removeAppender = function(appender) {
		array_remove(appenders, appender);
		appender.setRemovedFromLogger(this);
		this.invalidateAppenderCache();
	};

	/**
	 * Clears all appenders for the current logger<br>
	 * <br>
	 * @public
	 */
	this.removeAllAppenders = function() {
		var appenderCount = appenders.length;
		if (appenderCount > 0) {
			for (var i = 0; i < appenderCount; i++) {
				appenders[i].setRemovedFromLogger(this);
			}
			appenders.length = 0;
			this.invalidateAppenderCache();
		}
	};

	/**
	 * @protected 
	 * @return {Array<Appender>}
	 */
	this.getEffectiveAppenders = function() {
		if (appenderCache === null || appenderCacheInvalidated) {
			// Build appender cache
			var parentEffectiveAppenders = (isRoot || !this.getAdditivity()) ? [] : this.parent.getEffectiveAppenders();
			appenderCache = parentEffectiveAppenders.concat(appenders);
			appenderCacheInvalidated = false;
		}
		return appenderCache;
	};

	/**
	 * @private 
	 */
	this.invalidateAppenderCache = function() {
		appenderCacheInvalidated = true;
		for (var i = 0, len = this.children.length; i < len; i++) {
			this.children[i].invalidateAppenderCache();
		}
	};

	/**
	 * Generic logging method used by wrapper methods such as debug, error etc<br>
	 * <br>
	 * @public 
	 * @param {Level} level
	 * @param {Object} params Array with messages to log. Last entry can be an Error
	 */
	this.log = function(level, params) {
		if (enabled && level.isGreaterOrEqual(this.getEffectiveLevel())) {
			// Check whether last param is an exception
			/** @type {Error} */
			var exception;
			var finalParamIndex = params.length - 1;
			var lastParam = params[finalParamIndex];
			if (params.length > 1 && isError(lastParam)) {
				exception = lastParam;
				finalParamIndex--;
			}

			// Construct genuine array for the params
			var messages = [];
			for (var i = 0; i <= finalParamIndex; i++) {
				messages[i] = params[i];
			}

			var loggingEvent = new LoggingEvent(this, new Date(), level, messages, exception);

			this.callAppenders(loggingEvent);
		}
	};

	/**
	 * @private 
	 * @param {Object} loggingEvent
	 */
	this.callAppenders = function(loggingEvent) {
		var effectiveAppenders = this.getEffectiveAppenders();
		for (var i = 0, len = effectiveAppenders.length; i < len; i++) { //Servoy bug: SVY-4871
			effectiveAppenders[i].doAppend(loggingEvent);
		}
	};

	/**
	 * Sets the level. Log messages of a lower level than level will not be logged. Default value is DEBUG<br>
	 * <br>
	 * @public
	 * @param {Level} level
	 */
	this.setLevel = function(level) {
		// Having a level of null on the root logger would be very bad.
		if (isRoot && level === null) {
			handleError("Logger.setLevel: you cannot set the level of the root logger to null");
		} else if (level instanceof Level) {
			loggerLevel = level;
		} else {
			handleError("Logger.setLevel: level supplied to logger " + this.name + " is not an instance of log4javascript.Level");
		}
	};

	/**
	 * Returns the level explicitly set for this logger or null if none has been set<br>
	 * <br>
	 * @public 
	 * @return {Level}
	 */
	this.getLevel = function() {
		return loggerLevel;
	};

	/**
	 * Returns the level at which the logger is operating. This is either the level explicitly set on the logger or, if no level has been set, the effective level of the logger's parent<br>
	 * <br>
	 * @public
	 * @return {Level}
	 */
	this.getEffectiveLevel = function() {
		for (var logger = this; logger !== null; logger = logger.parent) {
			var level = logger.getLevel();
			if (level !== null) {
				return level;
			}
		}
		return null;
	}

	/**
	 * Starts a new group of log messages. In appenders that support grouping (currently PopUpAppender and InPageAppender), a group appears as an expandable section in the console, labelled with the name specified. Specifying initiallyExpanded determines whether the group starts off expanded (the default is true). Groups may be nested.<br>
	 * <br>
	 * @public 
	 * @param {String} groupName
	 * @param {Boolean} initiallyExpanded
	 */
	this.group = function(groupName, initiallyExpanded) {
		if (enabled) {
			var effectiveAppenders = this.getEffectiveAppenders();
			for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
				effectiveAppenders[i].group(groupName, initiallyExpanded);
			}
		}
	};

	/**
	 * Ends the current group. If there is no group then this function has no effect<br>
	 * <br>
	 * @public 
	 */
	this.groupEnd = function() {
		if (enabled) {
			var effectiveAppenders = this.getEffectiveAppenders();
			for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
				effectiveAppenders[i].groupEnd();
			}
		}
	};

	/**
	 * @private  
	 * @type {Object<Timer>} 
	 */
	var timers = {};

	/**
	 * Starts a timer with name name. When the timer is ended with a call to timeEnd using the same name, the amount of time that has elapsed in milliseconds since the timer was started is logged at level level. If not level is supplied, the level defaults to INFO<br>
	 * <br>
	 * @public 
	 * @param {String} timerName
	 * @param {Level} level
	 */
	this.time = function(timerName, level) {
		if (enabled) {
			if (isUndefined(timerName)) {
				handleError("Logger.time: a name for the timer must be supplied");
			} else if (level && ! (level instanceof Level)) {
				handleError("Logger.time: level supplied to timer " + timerName + " is not an instance of log4javascript.Level");
			} else {
				timers[timerName] = new Timer(timerName, level);
			}
		}
	};

	/**
	 * Ends the timer with name name and logs the time elapsed<br>
	 * <br>
	 * @public 
	 * @param {String} timerName
	 */
	this.timeEnd = function(timerName) {
		if (enabled) {
			if (isUndefined(timerName)) {
				handleError("Logger.timeEnd: a name for the timer must be supplied");
			} else if (timers[timerName]) {
				var timer = timers[timerName];
				var milliseconds = timer.getElapsedTime();
				this.log(timer.level, ["Timer " + toStr(timerName) + " completed in " + milliseconds + "ms"]);
				delete timers[timerName];
			} else {
				logLog.warn("Logger.timeEnd: no timer found with name " + timerName);
			}
		}
	};

	/**
	 * Asserts the given expression is true or evaluates to true. If so, nothing is logged. If not, an error is logged at the ERROR level<br>
	 * <br>
	 * @public 
	 * @param {Object} expr
	 */
	this.assert = function(expr) {
		if (enabled && !expr) {
			var args = [];
			for (var i = 1, len = arguments.length; i < len; i++) {
				args.push(arguments[i]);
			}
			args = (args.length > 0) ? args : ["Assertion Failure"];
			args.push(newLine);
			args.push(expr);
			this.log(Level.ERROR, args);
		}
	};

	/**
	 * @private 
	 * @return {String}
	 */
	this.toString = function() {
		return "Logger[" + this.name + "]";
	};
}

/**
 * @constructor 
 * @private
 *
 * @properties={typeid:24,uuid:"D532F0FE-2034-491E-85AF-20E2A8C9C7E9"}
 */
function LoggerImpl() {
	//TODO: all log functions can take one of more messages and then an optional Error. However, Servoy doesn't support this syntax currently, therefor this option is hidden
	//TODO: file case
	/**
	 * Logs a message and optionally an error at level TRACE<br>
	 * <br>
	 * @public
	 * @param {Object} message
	 * @param {Error} [exception]
	 */
	this.trace = function(message, exception) {
		this.log(Level.TRACE, arguments);
	}
	
	/**
	 * Logs a message and optionally an error at level DEBUG<br>
	 * <br>
	 * @public
	 * @param {Object} message
	 * @param {Error} [exception]
	 */
	this.debug = function(message, exception) {
		this.log(Level.DEBUG, arguments);
	}
	
	/**
	 * Logs a message and optionally an error at level INFO<br>
	 * <br>
	 * @public
	 * @param {Object} message
	 * @param {Error} [exception]
	 */
	this.info = function(message, exception) {
		this.log(Level.INFO, arguments);
	}
	
	/**
	 * Logs a message and optionally an error at level WARN<br>
	 * <br>
	 * @public
	 * @param {String} message
	 * @param {Error} [exception]
	  */
	this.warn = function(message, exception) {
		this.log(Level.WARN, arguments);
	}
	
	/**
	 * Logs a message and optionally an error at level ERROR<br>
	 * <br>
	 * @public
	 * @param {Object} message
	 * @param {Error} [exception]
	 */
	this.error = function(message, exception) {
		this.log(Level.ERROR, arguments);
	}
	
	/**
	 * Logs a message and optionally an error at level FATAL<br>
	 * <br>
	 * @public
	 * @param {Object} message
	 * @param {Error} [exception]
	 */
	this.fatal = function(message, exception) {
		this.log(Level.FATAL, arguments);
	}
	
	/**
	 * Returns whether the logger is enabled for the specified level<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isEnabledFor = function(level) {
		return level.isGreaterOrEqual(this.getEffectiveLevel());
	}
	
	/**
	 * Returns whether the logger is enabled for TRACE messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isTraceEnabled = function() {
		return this.isEnabledFor(Level.TRACE);
	}
	/**
	 * Returns whether the logger is enabled for DEBUG messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isDebugEnabled = function() {
		return this.isEnabledFor(Level.DEBUG);
	}
	/**
	 * Returns whether the logger is enabled for INFO messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isInfoEnabled = function() {
		return this.isEnabledFor(Level.INFO);
	}
	/**
	 * Returns whether the logger is enabled for WARN messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isWarnEnabled = function() {
		return this.isEnabledFor(Level.WARN);
	}
	/**
	 * Returns whether the logger is enabled for ERROR messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isErrorEnabled = function() {
		return this.isEnabledFor(Level.ERROR);
	}
	/**
	 * Returns whether the logger is enabled for FATAL messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isFatalEnabled = function() {
		return this.isEnabledFor(Level.FATAL);
	}
	
	this.trace.isEntryPoint = true;
	this.debug.isEntryPoint = true;
	this.info.isEntryPoint = true;
	this.warn.isEntryPoint = true;
	this.error.isEntryPoint = true;
	this.fatal.isEntryPoint = true;
}

/**
 * @properties={typeid:35,uuid:"AED5EC46-1553-4EC5-8BEC-92B2B7BD787C",variableType:-4}
 */
var loggerInit = (function(){
	Logger.prototype = new LoggerImpl()
	Logger.prototype.constructor = Logger 
}())

// Logger access methods
/** 
 * Hashtable of loggers keyed by logger name
 * @private
 * @type {Object<Logger>}
 * @properties={typeid:35,uuid:"0F49DC42-01BC-4720-B19F-DA1B30BF9D1E",variableType:-4}
 */
var loggers = {};

/**
 * @private
 * @properties={typeid:35,uuid:"C66CF9A3-95F9-4A51-B124-7DCD47CF22B2",variableType:-4}
 */
var loggerNames = [];

/**
* @private
* @type {String}
*
* @properties={typeid:35,uuid:"6D1F7437-DD22-46E8-848A-5B5BE3F0D418"}
*/
var anonymousLoggerName = "[anonymous]"
	
/**
* @private
* @type {String}
*
* @properties={typeid:35,uuid:"40694F9C-3469-48F4-85DE-AD3E6C0BD66E"}
*/
var defaultLoggerName = "[default]"
	
/**
* @private
* @type {String}
*
* @properties={typeid:35,uuid:"7448E46E-B6A7-404D-9F36-31407CBDB9BF"}
*/
var nullLoggerName = "[null]"
	
/**
* @private
* @type {String}
*
* @properties={typeid:35,uuid:"D1C8E18C-4D94-4CD3-B92F-DF0CA36C9E36"}
*/
var rootLoggerName = "root"
	
/**
 * @private
 * @properties={typeid:35,uuid:"EC4E9958-AA1E-4F91-9612-FEEB50E4CFA9",variableType:-4}
 */
var ROOT_LOGGER_DEFAULT_LEVEL = application.isInDeveloper() ? Level.DEBUG : Level.WARN;

/**
 * @private
 * @type {Logger}
 * @properties={typeid:35,uuid:"8FD01917-2F91-4033-A373-C6B8476A6476",variableType:-4}
 */
var rootLogger

/**
 * Returns the root logger from which all other loggers derive<br>
 * <br>
 * @public 
 * @properties={typeid:24,uuid:"AB765A70-AFE5-408F-8DA2-AC05200BD87B"}
 */
function getRootLogger() {
	if (!rootLogger) {
		rootLogger = new Logger(rootLoggerName);
		rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
		rootLogger.addAppender(new ApplicationOutputAppender())
	}
	return rootLogger;
}

/**
 * Returns a logger with the specified name, creating it if a logger with that name does not already exist. If no name is specified, a logger is returned with name [anonymous], and subsequent calls to getLogger() (with no logger name specified) will return this same logger object<br>
 * <br>
 * Note that the names [anonymous], [default], [null] and root are reserved for the anonymous logger, default logger, null logger and root logger respectively<br>
 * <br>
 * @public 
 * @param {String} [loggerName]
 * @return {Logger}
 *
 * @properties={typeid:24,uuid:"B8C91C9F-3D84-4CC7-8228-EA6D5A975FE0"}
 */
function getLogger(loggerName) {
	// Use default logger if loggerName is not specified or invalid
	if (! (typeof loggerName == "string")) {
		loggerName = anonymousLoggerName;
		logLog.warn("log4javascript.getLogger: non-string logger name " + toStr(loggerName) + " supplied, returning anonymous logger");
	}

	// Do not allow retrieval of the root logger by name
	if (loggerName == rootLoggerName) {
		handleError("log4javascript.getLogger: root logger may not be obtained by name");
	}

	// Create the logger for this name if it doesn't already exist
	if (!loggers[loggerName]) {
		var logger = new Logger(loggerName);
		loggers[loggerName] = logger;
		loggerNames.push(loggerName);

		// Set up parent logger, if it doesn't exist
		var lastDotIndex = loggerName.lastIndexOf(".");
		var parentLogger;
		if (lastDotIndex > -1) {
			var parentLoggerName = loggerName.substring(0, lastDotIndex);
			parentLogger = getLogger(parentLoggerName); // Recursively sets up grandparents etc.
		} else {
			parentLogger = getRootLogger();
		}
		parentLogger.addChild(logger);
	}
	return loggers[loggerName];
}

/**
 * @private
 * @properties={typeid:35,uuid:"FA26FFD1-88C2-4ABF-A2F7-267F50A6B363",variableType:-4}
 */
var defaultLogger = null;

/**
 * Convenience method that returns the default logger. The default logger has a single appender: a PopUpAppender with the default layout, width and height, and with focusPopUp set to false and lazyInit, useOldPopUp and complainAboutPopUpBlocking all set to true<br>
 * <br>
 * @public 
 * @properties={typeid:24,uuid:"90E05B7D-8D23-4C1A-818C-EA777D57431D"}
 */
function getDefaultLogger() {
	if (!defaultLogger) {
		defaultLogger = getLogger(defaultLoggerName);
		var a = new PopUpAppender();
		defaultLogger.addAppender(a);
	}
	return defaultLogger;
}

/**
 * @private
 * @properties={typeid:35,uuid:"4BCE42C7-DB72-4199-8B45-48F767507BB2",variableType:-4}
 */
var nullLogger = null;

/**
 * Returns an empty logger with no appenders. Useful for disabling all logging<br>
 * <br>
 * @public 
 * @properties={typeid:24,uuid:"410E6F3E-AAC9-4555-8040-91CB35B23F34"}
 */
function getNullLogger() {
	if (!nullLogger) {
		nullLogger = new Logger(nullLoggerName);
		nullLogger.setLevel(Level.OFF);
	}
	return nullLogger;
}

/**
 * Resets the all loggers to their default level
 * @public 
 * @properties={typeid:24,uuid:"A38B73EE-4752-4909-9D61-CF4DB620CC3D"}
 */
function resetConfiguration() {
	getRootLogger().setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
	loggers = {};
}

/* ---------------------------------------------------------------------- */
// Logging events

/**
 * @private
 * @constructor
 *
 * @param {Logger} logger
 * @param {Date} timeStamp
 * @param {Level} level
 * @param {Array<String>} messages
 * @param {Error} exception
 *
 * @properties={typeid:24,uuid:"40428863-BCA7-42D5-9B8D-D276C1A00B5F"}
 */
function LoggingEvent(logger, timeStamp, level, messages, exception) {
	this.logger = logger;
	this.timeStamp = timeStamp;
	this.timeStampInMilliseconds = timeStamp.getTime();
	this.timeStampInSeconds = Math.floor(this.timeStampInMilliseconds / 1000);
	this.milliseconds = this.timeStamp.getMilliseconds();
	this.level = level;
	this.messages = messages;
	this.exception = exception;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"6BE6F430-807C-4673-85CC-055DFE1DD45F",variableType:-4}
 */
var loggingEventInit = (function() {
		LoggingEvent.prototype = {
			getThrowableStrRep: function() {
				return this.exception ? getExceptionStringRep(this.exception) : "";
			},
			getCombinedMessages: function() {
				return (this.messages.length == 1) ? this.messages[0] : this.messages.join(newLine);
			},
			toString: function() {
				return "LoggingEvent[" + this.level + "]";
			}
		};
	}())

/* ---------------------------------------------------------------------- */
// Layout prototype

/**
 * @constructor
 * @extends {LayoutImpl}
 * @properties={typeid:24,uuid:"661F2A58-DBBD-4633-849C-AB0C260A7463"}
 */
function Layout() {}

/**
 * @private
 * @constructor 
 *
 * @properties={typeid:24,uuid:"2D33DAB0-E039-4A7E-8AF9-98E7D0BD3F98"}
 */
function LayoutImpl() {
	this.defaults = {
		loggerKey: "logger",
		timeStampKey: "timestamp",
		millisecondsKey: "milliseconds",
		levelKey: "level",
		messageKey: "message",
		exceptionKey: "exception",
		urlKey: "url"
	}
	this.loggerKey = "logger"
	this.timeStampKey = "timestamp"
	this.millisecondsKey = "milliseconds"
	this.levelKey = "level"
	this.messageKey = "message"
	this.exceptionKey = "exception"
	this.urlKey = "url"
	this.batchHeader = ""
	this.batchFooter = ""
	this.batchSeparator = ""
	this.returnsPostData = false
	this.overrideTimeStampsSetting = false
	this.useTimeStampsInMilliseconds = null

	this.format = function() {
		handleError("Layout.format: layout supplied has no format() method");
	}

	this.ignoresThrowable = function() {
		handleError("Layout.ignoresThrowable: layout supplied has no ignoresThrowable() method");
	}

	this.getContentType = function() {
		return "text/plain";
	}

	this.allowBatching = function() {
		return true;
	}

	/**
	 * @param {Boolean} timeStampsInMilliseconds
	 */
	this.setTimeStampsInMilliseconds = function(timeStampsInMilliseconds) {
		this.overrideTimeStampsSetting = true;
		this.useTimeStampsInMilliseconds = timeStampsInMilliseconds
	}

	this.isTimeStampsInMilliseconds = function() {
		return this.overrideTimeStampsSetting ? this.useTimeStampsInMilliseconds : useTimeStampsInMilliseconds;
	}

	this.getTimeStampValue = function(loggingEvent) {
		return this.isTimeStampsInMilliseconds() ? loggingEvent.timeStampInMilliseconds : loggingEvent.timeStampInSeconds;
	}

	this.getDataValues = function(loggingEvent, combineMessages) {
		var dataValues = [[this.loggerKey, loggingEvent.logger.name],
			[this.timeStampKey, this.getTimeStampValue(loggingEvent)],
			[this.levelKey, loggingEvent.level.name],
			[this.urlKey, window.location.href],
			[this.messageKey, combineMessages ? loggingEvent.getCombinedMessages() : loggingEvent.messages]];
		if (!this.isTimeStampsInMilliseconds()) {
			dataValues.push([this.millisecondsKey, loggingEvent.milliseconds]);
		}
		if (loggingEvent.exception) {
			dataValues.push([this.exceptionKey, getExceptionStringRep(loggingEvent.exception)]);
		}
		if (this.hasCustomFields()) {
			for (var i = 0, len = this.customFields.length; i < len; i++) {
				var val = this.customFields[i].value;

				// Check if the value is a function. If so, execute it, passing it the
				// current layout and the logging event
				if (typeof val === "function") {
					/** @type {Function} */
					var tmp = val
					val = tmp(this, loggingEvent);
				}
				dataValues.push([this.customFields[i].name, val]);
			}
		}
		return dataValues;
	}
	
	/**
	 * @param {Object} [loggerKey]
	 * @param {Object} [timeStampKey]
	 * @param {Object} [levelKey]
	 * @param {Object} [messageKey]
	 * @param {Object} [exceptionKey]
	 * @param {Object} [urlKey]
	 * @param {Object} [millisecondsKey]
	 */
	this.setKeys = function(loggerKey, timeStampKey, levelKey, messageKey,exceptionKey, urlKey, millisecondsKey) {
		this.loggerKey = extractStringFromParam(loggerKey, this.defaults.loggerKey);
		this.timeStampKey = extractStringFromParam(timeStampKey, this.defaults.timeStampKey);
		this.levelKey = extractStringFromParam(levelKey, this.defaults.levelKey);
		this.messageKey = extractStringFromParam(messageKey, this.defaults.messageKey);
		this.exceptionKey = extractStringFromParam(exceptionKey, this.defaults.exceptionKey);
		this.urlKey = extractStringFromParam(urlKey, this.defaults.urlKey);
		this.millisecondsKey = extractStringFromParam(millisecondsKey, this.defaults.millisecondsKey);
	}

	this.setCustomField = function(name, value) {
		var fieldUpdated = false;
		for (var i = 0, len = this.customFields.length; i < len; i++) {
			if (this.customFields[i].name === name) {
				this.customFields[i].value = value;
				fieldUpdated = true;
			}
		}
		if (!fieldUpdated) {
			this.customFields.push({ "name": name, "value": value });
		}
	}

	this.hasCustomFields = function() {
		return (this.customFields.length > 0);
	}

	this.toString = function() {
		handleError("Layout.toString: all layouts must override this method");
	}
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"994AF0DE-AA41-453A-B2E0-61047DBFC751",variableType:-4}
 */
var layoutInit = (function(){
	Layout.prototype = new LayoutImpl()
	Layout.prototype.constructor = Layout
}())

/* ---------------------------------------------------------------------- */
// Appender prototype

/**
 * @constructor 
 *
 * @properties={typeid:24,uuid:"347251D0-84E5-40FE-8ED9-45CB3FE7FB4A"}
 */
function Appender() {
	this.eventTypes = []
	this.eventListeners = {}
	this.setEventTypes = setEventTypes
	this.addEventListener = addEventListener
	this.removeEventListener = removeEventListener
	this.dispatchEvent = dispatchEvent

	this.layout = new PatternLayout();
	this.threshold = Level.ALL;
	this.loggers = [];

	// Performs threshold checks before delegating actual logging to the
	// subclass's specific append method.
	/**
	 * Checks the logging event's level is at least as severe as the appender's threshold and calls the appender's append method if so.<br>
	 * <br>
	 * This method should not in general be used directly or overridden<br>
	 * <br>
	 * @public 
	 * @param {LoggingEvent} loggingEvent
	 */
	this.doAppend = function(loggingEvent) {
		if (enabled && loggingEvent.level.level >= this.threshold.level) {
			this.append(loggingEvent);
		}
	};

	/**
	 * Appender-specific method to append a log message. Every appender object should implement this method<br>
	 * <br>
	 * @public
	 * @param {LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {};
	
	/**
	 * Sets the appender's layout<br>
	 * <br>
	 * @public 
	 * @param {Layout} layout
	 */
	this.setLayout = function(layout) {
		if (layout instanceof Layout) {
			this.layout = layout;
		} else {
			handleError("Appender.setLayout: layout supplied to " + this.toString() + " is not a subclass of Layout");
		}
	};

	/**
	 * Returns the appender's layout<br>
	 * <br>
	 * @return {Layout}
	 */
	this.getLayout = function() {
		return this.layout;
	};

	/**
	 * Sets the appender's threshold. Log messages of level less severe than this threshold will not be logged<br>
	 * <br>
	 * @public
	 * @param {Level} threshold
	 */
	this.setThreshold = function(threshold) {
		if (threshold instanceof Level) {
			this.threshold = threshold;
		} else {
			handleError("Appender.setThreshold: threshold supplied to " + this.toString() + " is not a subclass of Level");
		}
	};

	/**
	 * Returns the appender's threshold<br>
	 * <br>
	 * @return {Level}
	 */
	this.getThreshold = function() {
		return this.threshold;
	};

	/**
	 * @private
	 */
	this.setAddedToLogger = function(logger) {
		this.loggers.push(logger);
	};

	/**
	 * @private
	 */
	this.setRemovedFromLogger = function(logger) {
		array_remove(this.loggers, logger);
	};

	/**
	 * @private
	 */
	this.group = emptyFunction;
	/**
	 * @private
	 */
	this.groupEnd = emptyFunction;

	/**
	 * @protected
	 */
	this.toString = function() {
		handleError("Appender.toString: all appenders must override this method");
	};
};

/**
 * Simple Appender that performs application.output
 * @constructor 
 * @extends {Appender}
 *
 * @properties={typeid:24,uuid:"4500F0BF-BB5B-4D4C-868A-611335B3AD71"}
 */
function ApplicationOutputAppender() {
	/**
	 * @param {LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {
//        var getFormattedMessage = function() {
//            var layout = appender.getLayout();
//            var formattedMessage = layout.format(loggingEvent);
//            if (layout.ignoresThrowable() && loggingEvent.exception) {
//                formattedMessage += loggingEvent.getThrowableStrRep();
//            }
//            return formattedMessage;
//        }
        
        /*
         * By default Servoy logs in different way, depending on the type of client and the type of output
         * In Debug clients output is also redirected to the DBPGDebugger, which prints it to the console in Eclipse
         * In Smart Client (J2DBClient.java) System.out/err.println is used
         * In Web Client (SessionClient.java) it is delegated to Debug.java, which instantiates a log4j Logger, through org.apache.commons.logging.LogFactory for the com.servoy.j2db.util.Debug class
         *
         * This appender should:
         * - If in Developer post formatted message directly to DBPGDebugger using the defined format
         * - If in Smart Client, post formatted message directly to System.out/err.println
         * - If in Web Client, post through relevant Debug method directly
         * 
         * Then there's also the Public Java API to report errors/warnings etc.
         */
        var msg = loggingEvent.messages[0]
        if (loggingEvent.exception) {
        	msg += '\n' + loggingEvent.exception.name + ': ' + loggingEvent.exception.message + '\n' + loggingEvent.exception.stack
        }
        application.output(msg, loggingEvent.level.level) //TODO: handle TRACE, ALL and OFF
    }
	
    this.toString = function() {
    	return 'ApplicationOutputAppender'
    }
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"CCE870E3-C277-473F-9332-5B2EC5597282",variableType:-4}
 */
var initServoyAppender = (function(){
	ApplicationOutputAppender.prototype = new Appender()
	ApplicationOutputAppender.prototype.constructor = ApplicationOutputAppender	
	ApplicationOutputAppender.prototype.threshold = application.isInDeveloper() ? Level.DEBUG : Level.ERROR
}())
/* ---------------------------------------------------------------------- */
// SimpleLayout

/**
 * @constructor
 * @extends {Layout}
 *
 * @properties={typeid:24,uuid:"797A6AF8-F753-4455-9F05-2D0FA04267BA"}
 */
function SimpleLayout() {
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"0427BB0C-1835-4CFC-8477-5F56A5DD8387",variableType:-4}
 */
var simpleLayoutInit = (function() {
		SimpleLayout.prototype = new Layout();

		SimpleLayout.prototype.format = function(loggingEvent) {
			return loggingEvent.level.name + " - " + loggingEvent.getCombinedMessages();
		};

		SimpleLayout.prototype.ignoresThrowable = function() {
			return true;
		};

		SimpleLayout.prototype.toString = function() {
			return "SimpleLayout";
		};
	}())

/* ----------------------------------------------------------------------- */
// NullLayout

/**
 * @constructor
 * @extends {Layout}
 *
 * @properties={typeid:24,uuid:"82542802-B4D0-45D6-AC01-A638A2587DE6"}
 */
function NullLayout() {
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BEF97D79-9D62-4B12-87B3-ABE53EA0C738",variableType:-4}
 */
var nullLayoutInit = (function() {
		NullLayout.prototype = new Layout();

		NullLayout.prototype.format = function(loggingEvent) {
			return loggingEvent.messages;
		};

		NullLayout.prototype.ignoresThrowable = function() {
			return true;
		};

		NullLayout.prototype.toString = function() {
			return "NullLayout";
		};
	}())

/* ---------------------------------------------------------------------- */
// XmlLayout

/**
 * @constructor
 * @extends {Layout}
 * @param {Object} combineMessages
 *
 * @properties={typeid:24,uuid:"E33DAAA2-193B-4080-8805-1D3452AA08BD"}
 */
function XmlLayout(combineMessages) {
	this.combineMessages = extractBooleanFromParam(combineMessages, true);
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"5A02CFFB-582D-4B3F-92AD-B4DEA07071F2",variableType:-4}
 */
var xmlLayoutInit = (function() {
			XmlLayout.prototype = new Layout();

			XmlLayout.prototype.isCombinedMessages = function() {
				return this.combineMessages;
			};

			XmlLayout.prototype.getContentType = function() {
				return "text/xml";
			};

			XmlLayout.prototype.escapeCdata = function(str) {
				return str.replace(/\]\]>/, "]]>]]&gt;<![CDATA[");
			};

			XmlLayout.prototype.format = function(loggingEvent) {
				var layout = this;
				var i, len;
				function formatMessage(message) {
					message = (typeof message === "string") ? message : toStr(message);
					return "<log4javascript:message><![CDATA[" + layout.escapeCdata(message) + "]]></log4javascript:message>";
				}

				var str = "<log4javascript:event logger=\"" + loggingEvent.logger.name + "\" timestamp=\"" + this.getTimeStampValue(loggingEvent) + "\"";
				if (!this.isTimeStampsInMilliseconds()) {
					str += " milliseconds=\"" + loggingEvent.milliseconds + "\"";
				}
				str += " level=\"" + loggingEvent.level.name + "\">" + newLine;
				if (this.combineMessages) {
					str += formatMessage(loggingEvent.getCombinedMessages());
				} else {
					str += "<log4javascript:messages>" + newLine;
					for (i = 0, len = loggingEvent.messages.length; i < len; i++) {
						str += formatMessage(loggingEvent.messages[i]) + newLine;
					}
					str += "</log4javascript:messages>" + newLine;
				}
				if (this.hasCustomFields()) {
					for (i = 0, len = this.customFields.length; i < len; i++) {
						str += "<log4javascript:customfield name=\"" + this.customFields[i].name + "\"><![CDATA[" + this.customFields[i].value.toString() + "]]></log4javascript:customfield>" + newLine;
					}
				}
				if (loggingEvent.exception) {
					str += "<log4javascript:exception><![CDATA[" + getExceptionStringRep(loggingEvent.exception) + "]]></log4javascript:exception>" + newLine;
				}
				str += "</log4javascript:event>" + newLine + newLine;
				return str;
			};

			XmlLayout.prototype.ignoresThrowable = function() {
				return false;
			};

			XmlLayout.prototype.toString = function() {
				return "XmlLayout";
			};
	}())

/* ---------------------------------------------------------------------- */
// JsonLayout related

/**
 * @private
 * @param str
 *
 * @properties={typeid:24,uuid:"6D1D3E82-FB48-4421-98CF-2A322FD8A11F"}
 */
function escapeNewLines(str) {
	return str.replace(/\r\n|\r|\n/g, "\\r\\n");
}

/* ---------------------------------------------------------------------- */
// JsonLayout

/**
 * @constructor
 * @extends {Layout}
 *
 * @param {Object} readable
 * @param {Object} combineMessages
 *
 * @properties={typeid:24,uuid:"340D216B-0285-475B-82D9-560E6D6E183B"}
 */
function JsonLayout(readable, combineMessages) {
	this.readable = extractBooleanFromParam(readable, false);
	this.combineMessages = extractBooleanFromParam(combineMessages, true);
	this.batchHeader = this.readable ? "[" + newLine : "[";
	this.batchFooter = this.readable ? "]" + newLine : "]";
	this.batchSeparator = this.readable ? "," + newLine : ",";
	this.setKeys();
	this.colon = this.readable ? ": " : ":";
	this.tab = this.readable ? "\t" : "";
	this.lineBreak = this.readable ? newLine : "";
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"3350BBD8-3E6C-4E29-AEBA-FE90AEB1D0A8",variableType:-4}
 */
var jsonLayoutInit = (function() {
		JsonLayout.prototype = new Layout();

		JsonLayout.prototype.isReadable = function() {
			return this.readable;
		};

		JsonLayout.prototype.isCombinedMessages = function() {
			return this.combineMessages;
		};

		JsonLayout.prototype.format = function(loggingEvent) {
			var layout = this;
			/** @type {Array} */
			var dataValues = this.getDataValues(loggingEvent, this.combineMessages);
			var str = "{" + this.lineBreak;
			var i, len;

			function formatValue(val, prefix, expand) {
				// Check the type of the data value to decide whether quotation marks
				// or expansion are required
				var formattedValue;
				var valType = typeof val;
				if (val instanceof Date) {
					formattedValue = String(val.getTime());
				} else if (expand && (val instanceof Array)) {
					formattedValue = "[" + layout.lineBreak;
					for (var j = 0, len = val.length; j < len; j++) {
						var childPrefix = prefix + layout.tab;
						formattedValue += childPrefix + formatValue(val[j], childPrefix, false);
						if (j < val.length - 1) {
							formattedValue += ",";
						}
						formattedValue += layout.lineBreak;
					}
					formattedValue += prefix + "]";
				} else if (valType !== "number" && valType !== "boolean") {
					formattedValue = "\"" + escapeNewLines(toStr(val).replace(/\"/g, "\\\"")) + "\"";
				} else {
					formattedValue = val;
				}
				return formattedValue;
			}

			for (i = 0, len = dataValues.length - 1; i <= len; i++) {
				str += this.tab + "\"" + dataValues[i][0] + "\"" + this.colon + formatValue(dataValues[i][1], this.tab, true);
				if (i < len) {
					str += ",";
				}
				str += this.lineBreak;
			}

			str += "}" + this.lineBreak;
			return str;
		};

		JsonLayout.prototype.ignoresThrowable = function() {
			return false;
		};

		JsonLayout.prototype.toString = function() {
			return "JsonLayout";
		};

		JsonLayout.prototype.getContentType = function() {
			return "application/json";
		};
	}())

/* ---------------------------------------------------------------------- */
// HttpPostDataLayout

/**
 * @extends {Layout}
 *
 * @properties={typeid:24,uuid:"7027598D-2240-43BD-84A3-05F5BA79B6CC"}
 */
function HttpPostDataLayout() {
	this.setKeys();
	this.customFields = [];
	this.returnsPostData = true;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BB86A214-5807-443C-A4F0-934F4671552D",variableType:-4}
 */
var httpPostdataLayoutInit = (function() {
		HttpPostDataLayout.prototype = new Layout();

		// Disable batching
		HttpPostDataLayout.prototype.allowBatching = function() {
			return false;
		};

		HttpPostDataLayout.prototype.format = function(loggingEvent) {
			var dataValues = this.getDataValues(loggingEvent);
			var queryBits = [];
			for (var i = 0, len = dataValues.length; i < len; i++) {
				var val = (dataValues[i][1] instanceof Date) ? String(dataValues[i][1].getTime()) : dataValues[i][1];
				queryBits.push(encodeURIComponent(dataValues[i][0]) + "=" + encodeURIComponent(val));
			}
			return queryBits.join("&");
		};

		HttpPostDataLayout.prototype.ignoresThrowable = function(loggingEvent) {
			return false;
		};

		HttpPostDataLayout.prototype.toString = function() {
			return "HttpPostDataLayout";
		};
	}())

/* ---------------------------------------------------------------------- */
// formatObjectExpansion

/**
 * @private
 * @param obj
 * @param depth
 * @param indentation
 *
 * @properties={typeid:24,uuid:"A20BF81C-84B3-4D88-AFF2-966B67B173B1"}
 */
function formatObjectExpansion(obj, depth, indentation) {
	var objectsExpanded = [];

	function doFormat(obj, depth, indentation) {
		var i, len, childDepth, childIndentation, childLines, expansion,
			childExpansion;

		if (!indentation) {
			indentation = "";
		}

		function formatString(text) {
			var lines = splitIntoLines(text);
			for (var j = 1, jLen = lines.length; j < jLen; j++) {
				lines[j] = indentation + lines[j];
			}
			return lines.join(newLine);
		}

		if (obj === null) {
			return "null";
		} else if (typeof obj == "undefined") {
			return "undefined";
		} else if (typeof obj == "string") {
			return formatString(obj);
		} else if (typeof obj == "object" && objectsExpanded.indexOf(obj) != -1) {
			try {
				expansion = toStr(obj);
			} catch (ex) {
				expansion = "Error formatting property. Details: " + getExceptionStringRep(ex);
			}
			return expansion + " [already expanded]";
		} else if ( (obj instanceof Array) && depth > 0) {
			objectsExpanded.push(obj);
			expansion = "[" + newLine;
			childDepth = depth - 1;
			childIndentation = indentation + "  ";
			childLines = [];
			for (i = 0, len = obj.length; i < len; i++) {
				try {
					childExpansion = doFormat(obj[i], childDepth, childIndentation);
					childLines.push(childIndentation + childExpansion);
				} catch (ex) {
					childLines.push(childIndentation + "Error formatting array member. Details: " + getExceptionStringRep(ex) + "");
				}
			}
			expansion += childLines.join("," + newLine) + newLine + indentation + "]";
			return expansion;
		} else if (Object.prototype.toString.call(obj) == "[object Date]") {
			return obj.toString();
		} else if (typeof obj == "object" && depth > 0) {
			objectsExpanded.push(obj);
			expansion = "{" + newLine;
			childDepth = depth - 1;
			childIndentation = indentation + "  ";
			childLines = [];
			for (i in obj) {
				try {
					childExpansion = doFormat(obj[i], childDepth, childIndentation);
					childLines.push(childIndentation + i + ": " + childExpansion);
				} catch (ex) {
					childLines.push(childIndentation + i + ": Error formatting property. Details: " + getExceptionStringRep(ex));
				}
			}
			expansion += childLines.join("," + newLine) + newLine + indentation + "}";
			return expansion;
		} else {
			return formatString(toStr(obj));
		}
	}
	return doFormat(obj, depth, indentation);
}
/* ---------------------------------------------------------------------- */
// Date-related stuff

/**
 * @private
 * @properties={typeid:35,uuid:"4ACF3D45-CF09-443D-A6B9-FC3D1047074E",variableType:-4}
 */
var DateUtils = new function() {
	this.regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
	this.monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];
	this.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	this.TEXT2 = 0
	this.TEXT3 = 1
	this.NUMBER = 2
	this.YEAR = 3
	this.MONTH = 4
	this.TIMEZONE = 5
	this.types = {
		G: this.TEXT2,
		y: this.YEAR,
		M: this.MONTH,
		w: this.NUMBER,
		W: this.NUMBER,
		D: this.NUMBER,
		d: this.NUMBER,
		F: this.NUMBER,
		E: this.TEXT3,
		a: this.TEXT2,
		H: this.NUMBER,
		k: this.NUMBER,
		K: this.NUMBER,
		h: this.NUMBER,
		m: this.NUMBER,
		s: this.NUMBER,
		S: this.NUMBER,
		Z: this.TIMEZONE
	};
	var ONE_DAY = 24 * 60 * 60 * 1000;
	var ONE_WEEK = 7 * ONE_DAY;
	this.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;

	var newDateAtMidnight = function(year, month, day) {
		var d = new Date(year, month, day, 0, 0, 0);
		d.setMilliseconds(0);
		return d;
	};

	this.getDifference = function(date1, date2) {
		return date1.getTime() - date2.getTime();
	};

	this.isBefore = function(date1, date2) {
		return date1.getTime() < date2.getTime();
	};

	this.getUTCTime = function(date) {
		return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	};

	this.getTimeSince = function(date1, date2) {
		return date1.getUTCTime() - date2.getUTCTime();
	};

	this.getPreviousSunday = function(date) {
		// Using midday avoids any possibility of DST messing things up
		var midday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
		var previousSunday = new Date(midday.getTime() - date.getDay() * ONE_DAY);
		return newDateAtMidnight(previousSunday.getFullYear(), previousSunday.getMonth(), previousSunday.getDate());
	};

	this.getWeekInYear = function(date, minimalDaysInFirstWeek) {
		if (isUndefined(this.minimalDaysInFirstWeek)) {
			minimalDaysInFirstWeek = this.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
		}
		var previousSunday = this.getPreviousSunday(date);
		var startOfYear = newDateAtMidnight(date.getFullYear(), 0, 1);
		var numberOfSundays = this.isBefore(previousSunday, startOfYear) ? 0 : 1 + Math.floor(this.getTimeSince(previousSunday, startOfYear) / ONE_WEEK);
		var numberOfDaysInFirstWeek = 7 - startOfYear.getDay();
		var weekInYear = numberOfSundays;
		if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
			weekInYear--;
		}
		return weekInYear;
	};

	this.getWeekInMonth = function(date, minimalDaysInFirstWeek) {
		if (isUndefined(date.minimalDaysInFirstWeek)) {
			minimalDaysInFirstWeek = this.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
		}
		var previousSunday = this.getPreviousSunday(date);
		var startOfMonth = newDateAtMidnight(date.getFullYear(), date.getMonth(), 1);
		var numberOfSundays = this.isBefore(previousSunday, startOfMonth) ? 0 : 1 + Math.floor(this.getTimeSince(previousSunday, startOfMonth) / ONE_WEEK);
		var numberOfDaysInFirstWeek = 7 - startOfMonth.getDay();
		var weekInMonth = numberOfSundays;
		if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
			weekInMonth++;
		}
		return weekInMonth;
	};

	this.getDayInYear = function(date) {
		var startOfYear = this.newDateAtMidnight(date.getFullYear(), 0, 1);
		return 1 + Math.floor(this.getTimeSince(date, startOfYear) / ONE_DAY);
	};

}();

/* ------------------------------------------------------------------ */

/**
 * @param formatString
 *
 * @properties={typeid:24,uuid:"FDAFF19B-4805-4D54-A8C5-1C9B23E11542"}
 */
function SimpleDateFormat(formatString) {
	this.formatString = formatString;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"EB1F8FE2-6378-482A-8DCC-9EC84E798327",variableType:-4}
 */
var simpleDateFormatInit = (function() {
		var padWithZeroes = function(str, len) {
			while (str.length < len) {
				str = "0" + str;
			}
			return str;
		};

		var formatText = function(data, numberOfLetters, minLength) {
			return (numberOfLetters >= 4) ? data : data.substr(0, Math.max(minLength, numberOfLetters));
		};

		var formatNumber = function(data, numberOfLetters) {
			var dataString = "" + data;
			// Pad with 0s as necessary
			return padWithZeroes(dataString, numberOfLetters);
		};

		/**
		 * Sets the minimum number of days in a week in order for that week to
		 * be considered as belonging to a particular month or year
		 */
		SimpleDateFormat.prototype.setMinimalDaysInFirstWeek = function(days) {
			this.minimalDaysInFirstWeek = days;
		};

		SimpleDateFormat.prototype.getMinimalDaysInFirstWeek = function() {
			return isUndefined(this.minimalDaysInFirstWeek) ? DateUtils.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
		};

		SimpleDateFormat.prototype.format = function(date) {
			var formattedString = "";
			var result;
			var searchString = this.formatString;
			while ( (result = DateUtils.regex.exec(searchString))) {
				/** @type {String} */
				var quotedString = result[1];
				/** @type {String} */
				var patternLetters = result[2];
				/** @type {String} */
				var otherLetters = result[3];
				/** @type {String} */
				var otherCharacters = result[4];

				// If the pattern matched is quoted string, output the text between the quotes
				if (quotedString) {
					if (quotedString == "''") {
						formattedString += "'";
					} else {
						formattedString += quotedString.substring(1, quotedString.length - 1);
					}
				} else if (otherLetters) {
					// Swallow non-pattern letters by doing nothing here
				} else if (otherCharacters) {
					// Simply output other characters
					formattedString += otherCharacters;
				} else if (patternLetters) {
					// Replace pattern letters
					var patternLetter = patternLetters.charAt(0);
					var numberOfLetters = patternLetters.length;
					var rawData = "";
					switch (patternLetter) {
						case "G":
							rawData = "AD";
							break;
						case "y":
							rawData = date.getFullYear();
							break;
						case "M":
							rawData = date.getMonth();
							break;
						case "w":
							rawData = date.getWeekInYear(this.getMinimalDaysInFirstWeek());
							break;
						case "W":
							rawData = date.getWeekInMonth(this.getMinimalDaysInFirstWeek());
							break;
						case "D":
							rawData = date.getDayInYear();
							break;
						case "d":
							rawData = date.getDate();
							break;
						case "F":
							rawData = 1 + Math.floor( (date.getDate() - 1) / 7);
							break;
						case "E":
							rawData = DateUtils.dayNames[date.getDay()];
							break;
						case "a":
							rawData = (date.getHours() >= 12) ? "PM" : "AM";
							break;
						case "H":
							rawData = date.getHours();
							break;
						case "k":
							rawData = date.getHours() || 24;
							break;
						case "K":
							rawData = date.getHours() % 12;
							break;
						case "h":
							rawData = (date.getHours() % 12) || 12;
							break;
						case "m":
							rawData = date.getMinutes();
							break;
						case "s":
							rawData = date.getSeconds();
							break;
						case "S":
							rawData = date.getMilliseconds();
							break;
						case "Z":
							rawData = date.getTimezoneOffset(); // This returns the number of minutes since GMT was this time.
							break;
					}
					// Format the raw data depending on the type
					switch (DateUtils.types[patternLetter]) {
						case DateUtils.TEXT2:
							formattedString += formatText(rawData, numberOfLetters, 2);
							break;
						case DateUtils.TEXT3:
							formattedString += formatText(rawData, numberOfLetters, 3);
							break;
						case DateUtils.NUMBER:
							formattedString += formatNumber(rawData, numberOfLetters);
							break;
						case DateUtils.YEAR:
							if (numberOfLetters <= 3) {
								// Output a 2-digit year
								var dataString = "" + rawData;
								formattedString += dataString.substr(2, 2);
							} else {
								formattedString += formatNumber(rawData, numberOfLetters);
							}
							break;
						case DateUtils.MONTH:
							if (numberOfLetters >= 3) {
								formattedString += formatText(DateUtils.monthNames[rawData], numberOfLetters, numberOfLetters);
							} else {
								// NB. Months returned by getMonth are zero-based
								formattedString += formatNumber(rawData + 1, numberOfLetters);
							}
							break;
						case DateUtils.TIMEZONE:
							var isPositive = (rawData > 0);
							// The following line looks like a mistake but isn't
							// because of the way getTimezoneOffset measures.
							var prefix = isPositive ? "-" : "+";
							var absData = Math.abs(rawData);

							// Hours
							var hours = "" + Math.floor(absData / 60);
							hours = padWithZeroes(hours, 2);
							// Minutes
							var minutes = "" + (absData % 60);
							minutes = padWithZeroes(minutes, 2);

							formattedString += prefix + hours + minutes;
							break;
					}
				}
				searchString = searchString.substr(result.index + result[0].length);
			}
			return formattedString;
		};
	})()

/* ---------------------------------------------------------------------- */
// PatternLayout

/**
 * @constructor
 * @extends {Layout}
 * @param {Object} [pattern]
 *
 * @properties={typeid:24,uuid:"2C542AAB-8C8F-4C1F-951A-22A2CB81D623"}
 */
function PatternLayout(pattern) {
	if (pattern) {
		this.pattern = pattern;
	} else {
		this.pattern = PatternLayout.DEFAULT_CONVERSION_PATTERN;
	}
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"DEC0D9CB-1760-41E1-9408-5310708D3DC6",variableType:-4}
 */
var patternLayoutInit = (function() {
		PatternLayout.TTCC_CONVERSION_PATTERN = "%r %p %c - %m%n";
		PatternLayout.DEFAULT_CONVERSION_PATTERN = "%m%n";
		PatternLayout.ISO8601_DATEFORMAT = "yyyy-MM-dd HH:mm:ss,SSS";
		PatternLayout.DATETIME_DATEFORMAT = "dd MMM yyyy HH:mm:ss,SSS";
		PatternLayout.ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS";

		PatternLayout.prototype = new Layout();

		PatternLayout.prototype.format = function(loggingEvent) {
			var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([acdfmMnpr%])(\{([^\}]+)\})?|([^%]+)/;
			var formattedString = "";
			var result;
			var searchString = this.pattern;

			// Cannot use regex global flag since it doesn't work with exec in IE5
			while ( (result = regex.exec(searchString))) {
				var matchedString = result[0];
				/** @type {String} */
				var padding = result[1];
				var truncation = result[2];
				var conversionCharacter = result[3];
				/** @type {String} */
				var specifier = result[5];
				var text = result[6];

				// Check if the pattern matched was just normal text
				if (text) {
					formattedString += "" + text;
				} else {
					// Create a raw replacement string based on the conversion
					// character and specifier
					var replacement = "";
					switch (conversionCharacter) {
						case "a": // Array of messages
						case "m": // Message
							var depth = 0;
							if (specifier) {
								depth = parseInt(specifier, 10);
								if (isNaN(depth)) {
									handleError("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character '" + conversionCharacter + "' - should be a number");
									depth = 0;
								}
							}
							var messages = (conversionCharacter === "a") ? loggingEvent.messages[0] : loggingEvent.messages;
							for (var i = 0, len = messages.length; i < len; i++) {
								if (i > 0 && (replacement.charAt(replacement.length - 1) !== " ")) {
									replacement += " ";
								}
								if (depth === 0) {
									replacement += messages[i];
								} else {
									replacement += formatObjectExpansion(messages[i], depth);
								}
							}
							break;
						case "c": // Logger name
							var loggerName = loggingEvent.logger.name;
							if (specifier) {
								var precision = parseInt(specifier, 10);
								var loggerNameBits = loggingEvent.logger.name.split(".");
								if (precision >= loggerNameBits.length) {
									replacement = loggerName;
								} else {
									replacement = loggerNameBits.slice(loggerNameBits.length - precision).join(".");
								}
							} else {
								replacement = loggerName;
							}
							break;
						case "d": // Date
							var dateFormat = PatternLayout.ISO8601_DATEFORMAT;
							if (specifier) {
								dateFormat = specifier;
								// Pick up special cases
								if (dateFormat == "ISO8601") {
									dateFormat = PatternLayout.ISO8601_DATEFORMAT;
								} else if (dateFormat == "ABSOLUTE") {
									dateFormat = PatternLayout.ABSOLUTETIME_DATEFORMAT;
								} else if (dateFormat == "DATE") {
									dateFormat = PatternLayout.DATETIME_DATEFORMAT;
								}
							}
							// Format the date
							replacement = (new SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);
							break;
						case "f": // Custom field
							if (this.hasCustomFields()) {
								var fieldIndex = 0;
								if (specifier) {
									fieldIndex = parseInt(specifier, 10);
									if (isNaN(fieldIndex)) {
										handleError("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - should be a number");
									} else if (fieldIndex === 0) {
										handleError("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - must be greater than zero");
									} else if (fieldIndex > this.customFields.length) {
										handleError("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - there aren't that many custom fields");
									} else {
										fieldIndex = fieldIndex - 1;
									}
								}
								var val = this.customFields[fieldIndex].value;
								if (typeof val == "function") {
									/** @type {Function} */
									var tmp = val
									val = tmp(this, loggingEvent);
								}
								replacement = val;
							}
							break;
						case "n": // New line
							replacement = newLine;
							break;
						case "p": // Level
							replacement = loggingEvent.level.name;
							break;
						case "r": // Milliseconds since log4javascript startup
							replacement = "" + DateUtils.getDifference(loggingEvent.timeStamp, applicationStartDate);
							break;
						case "%": // Literal % sign
							replacement = "%";
							break;
						default:
							replacement = matchedString;
							break;
					}
					// Format the replacement according to any padding or
					// truncation specified
					var l;

					// First, truncation
					if (truncation) {
						l = parseInt(truncation.substr(1), 10);
						var strLen = replacement.length;
						if (l < strLen) {
							replacement = replacement.substring(strLen - l, strLen);
						}
					}
					// Next, padding
					if (padding) {
						if (padding.charAt(0) == "-") {
							l = parseInt(padding.substr(1), 10);
							// Right pad with spaces
							while (replacement.length < l) {
								replacement += " ";
							}
						} else {
							l = parseInt(padding, 10);
							// Left pad with spaces
							while (replacement.length < l) {
								replacement = " " + replacement;
							}
						}
					}
					formattedString += replacement;
				}
				searchString = searchString.substr(result.index + result[0].length);
			}
			return formattedString;
		};

		PatternLayout.prototype.ignoresThrowable = function() {
			return true;
		};

		PatternLayout.prototype.toString = function() {
			return "PatternLayout";
		};
	}())


/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"2069232D-0928-41BD-AAED-86BFD85B3EAF",variableType:-4}
 */
var initScope = (function () {
	dispatchEvent("load", {});
}())
