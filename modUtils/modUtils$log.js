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
 * - Removed Timer impl.
 * - inlined Level.isGreaterOrEqual calls for performance
 * - Inlined Logger.isEnabledFor for performance 
 * - Removed all add/remove/dispatchEvent related code
 * - Renamed Logger.assert to Logger.assertLog (to stay inline with log4j)
 * - Removed Group impl.
 * - Inlined many of the utility functions or replaced them by (now) standard JavaScript variants
 * - Removed Default, null and Anonymous loggers so to be more inline with log4j
 * - Removed global enabled flag
 * - Removed global showStackTraces flag
 * - Added %t to add current ThreadName to output
 *
 * TODOs
 * - Fix encapsulation
 * - finish (re)configuration
 * - Make it so that named appender result in one shared instance
 * - Review logLog (vs. StaticLogger in log4j?)
 * - Review all layouts except PatternLayout
 * - fix warnings
 * - See if Level can be not exposed as Constructor function, but as an object with static properties only
 * - Remove the logic that allows logging multiple messages in one go
 * - remove dependancy on window
 * - Remove logic that allows passing multiple messages
 * - See which appenders/layouts need to stay
 * - Review date utils and see if they can be replaced by modUtils$date
 * - rename to logManager
 * - Add message formatting as in log4j 2
 * - Add catching as in Log4j 2
 */
/**
 * @private
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"52934E8C-E1B9-49AC-A576-F0E42DEF60B7",variableType:93}
 */
var APPLICATION_START_DATE = new Date();

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"282E129E-AEB0-4B2F-8ABB-5DDF5F0C09DC"}
 */
var NEW_LINE = "\r\n"; //CHECKME: shouldn't this use a platform specific newLine?

/**
 * @private
 *
 * @properties={typeid:35,uuid:"BE695155-2057-40ED-B87D-803BE91F1CDA",variableType:-4}
 */
var useTimeStampsInMilliseconds = true;

/**
 * @public
 * @param {Boolean} timeStampsInMilliseconds
 *
 * @properties={typeid:24,uuid:"2293F82F-B192-4375-A38A-DF7CD697B7A2"}
 */
function setTimeStampsInMilliseconds(timeStampsInMilliseconds) {
	useTimeStampsInMilliseconds = timeStampsInMilliseconds
}

/**
 * @public
 * @properties={typeid:24,uuid:"21804846-E57C-4ECB-8D32-8AC9D114BC5C"}
 */
function isTimeStampsInMilliseconds() {
	return useTimeStampsInMilliseconds;
}

/* --------------------------------Utility functions------------------------------------------ */
/**
 * Returns a nicely formatted representation of an error
 * @private
 * @param ex
 *
 * @properties={typeid:24,uuid:"C47C85D0-9C6B-4FE0-BB10-BE5CBC6BFCC3"}
 */
function getExceptionStringRep(ex) {
	if (ex) {
		var exStr
		if (ex.message) {
			exStr = ex.message;
		} else if (ex.description) {
			exStr = ex.description;
		} else {
			exStr = '' + ex;
		}
		
		try {
			if (ex.lineNumber) {
				exStr += " on line number " + ex.lineNumber;
			}
			if (ex.fileName) {
				var lastSlashIndex = Math.max(ex.fileName.lastIndexOf("/"), ex.fileName.lastIndexOf("\\"));
				exStr += " in file " + ex.fileName.substr(lastSlashIndex + 1)
			}
		} catch (localEx) {
			logLog.warn("Unable to obtain file and line information for error");
		}
		if (ex.stack) {
			exStr += NEW_LINE + ex.stack;
		}
		if (exStr.slice(-1) == '\n') {
			exStr = exStr.slice(0,-1)
		}
		return exStr;
	}
	return null;
}

/* --------------------------------Simple logging for log4javascript itself-------------------------------------- */
//TODO: finish statusLogger to replace loglog
/**
 * @private
 * @constructor 
 * @extends {Logger}
 * @properties={typeid:24,uuid:"0AC59D9D-FFC7-438B-A6B2-C8096BDF5282"}
 */
function StatusLogger() {
	this.log = function(){}
	this.toString = function(){}
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"E02462A4-85E5-4985-B18F-865415F4D9AA",variableType:-4}
 */
var initStatusLogger = (function() {
	StatusLogger.prototype = new Logger() //Object.create(Logger.prototype);
	StatusLogger.prototype.constructor = StatusLogger
}())

/**
 * @public
 * @properties={typeid:24,uuid:"1B89A7F7-9F24-40D5-A26D-8994D7BE1C04"}
 */
function getStatusLogger() {
	return
}
/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"E4F9858D-7E28-4372-B357-D5D31DA6A3CF"}
 */
var statusLogger

/**
 * @private
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
		application.output(this.debugMessages.join(NEW_LINE)); //TODO: changed alert into application.output. Should maybe be something else
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
					alertMessage += NEW_LINE + NEW_LINE + "Original error: " + getExceptionStringRep(exception);
				}
				application.output(alertMessage); //TODO: changed alert into application.output. Should maybe be something else
			}
		}
	}
};

/**
 * @typedef {{
 * 	status: String,
 *  plugins: String,
 *  appenders: Array<{
 *  	type: String,
 *  	name: String
 *  }>,
 *  loggers: {
 *  	logger: Array<{
 *  		name: String,
 *  		level: String,
 *  		additivity: boolean,
 *  		AppenderRef: {
 *  			ref: String
 *  		}
 *  	}>,
 *  	root: {
 *  		level: String,
 *  		AppenderRef: {
 *  			ref: String
 *  		}
 *  	}
 *  }
 * }}
 *
 * @properties={typeid:35,uuid:"9968F91A-7D3B-4FD6-8CFE-5424DE80D46F",variableType:-4}
 */
var CONFIG_TYPE_DEF

/* ----------------------------------Configuration------------------------------------ */
/**
 * @private 
 * @properties={typeid:35,uuid:"64DE8B65-AA2E-4B1D-99DE-36983CAF6DB7",variableType:-4}
 */
var defaultConfig = {
	status: "error", 
	appenders: [
		{
			type: "ApplicationOutputAppender", 
			name: "ApplicationOutput",
			PatternLayout: { 
				pattern: "%5level %logger{1.} - %msg" 
			}
		}
	],
	loggers: {
		root: { 
			level: "error", 
			AppenderRef: { 
				ref: "ApplicationOutput" 
			}
		}
	}
}

/**
 * @private 
 * @type {CONFIG_TYPE_DEF}
 * @properties={typeid:35,uuid:"9C2C2402-79C3-417A-BF27-19B1C5F6D63F",variableType:-4}
 */
var currentConfig = defaultConfig

/**
 * Call with null to reset to the default configuration
 * TODO: proper example code
 * TODO: expose config as type 
 * @public 
 * @param configuration
 * @example 
 *  {
	status: "error", 
	appenders: [
		{
			type: "ApplicationOutputAppender", 
			name: "ApplicationOutput",
			PatternLayout: { 
				pattern: "%5level %logger{1.} - %msg" 
			}
		},
		{
			type: "ApplicationOutputAppender", 
			name: "ApplicationOutputWithThread", 
			PatternLayout: { 
				pattern: "[%thread] %5level %logger{1.} - %msg" 
			}
		}
	],
	loggers: {
		logger: [
			{
				name: "com.servoy.bap.components.webpanel", 
				level: "debug", 
				additivity: false, 
				AppenderRef: {
					ref: "ApplicationOutputWithThread"
				}
			}
		],
		root: { 
			level: "error", 
			AppenderRef: { 
				ref: "ApplicationOutput" 
			}
		}
	}
}
 *
 * @properties={typeid:24,uuid:"ED82D72C-D6B5-4C6C-AD4C-5331AD8713C1"}
 */
function loadConfig(configuration) {
	currentConfig = configuration||defaultConfig
	
	var pluginName
	if (!defaultLogPlugins) { //Initialization of defaultLogPlugins array with the names of the default plugins
		defaultLogPlugins = Object.keys(logPlugins)
	} else {
		for (pluginName in logPlugins) { //Clear already loaded custom plugins
			if (defaultLogPlugins.indexOf(pluginName) == -1) {
				delete logPlugins[pluginName]
			}
		}
	}
	
	//load custom plugins
	/** @type {Array<String>} */
	var plugs = configuration.plugins ? configuration.plugins.split(',') : []
	for (var i = 0; i < plugs.length; i++) {
		var plugin = scopes.modUtils.getObject(utils.stringTrim(plugs[i]))
		if (plugin.prototype instanceof LogPlugin) {
			logPlugins[utils.stringTrim(plugs[i])] = plugin
		} else {
			//TODO: Log config warning
		}
	}
	
	//Reset the status logger
	//TODO 
	
	//reset the rootlogger
	var rootLoggerConfig = currentConfig.loggers.root //TODO make safer
	var rl = getRootLoggerInternal()
	rl.removeAllAppenders()
	rl.setLevel(Level.toLevel(rootLoggerConfig.level, ROOT_LOGGER_DEFAULT_LEVEL))
	rl.setAdditivity(false)
	rl.addAppender(getAppenderForRef(rootLoggerConfig.AppenderRef))
	
	//Need to reset all loggers and only configure the ones that are in the new config
	var configgedLoggers = currentConfig.loggers.logger||[]
	var configgedLoggerNames = []
	//Go through logger config and if a logger is already instantiated with the supplied name, reconfigure the logger
	for (i = 0; i < configgedLoggers.length; i++) { //
		var loggerConfig = configgedLoggers[i]
		configgedLoggerNames.push(loggerConfig.name)
		
		if (loggers.hasOwnProperty(loggerConfig.name)) { //Need to reconfigure an existing logger
			var logger = loggers[loggerConfig.name]
			logger.removeAllAppenders()
			logger.setLevel(Level.toLevel(loggerConfig.level))
			logger.setAdditivity(loggerConfig.hasOwnProperty('additivity') ? loggerConfig.additivity : true)
			
			//TODO: appender config
			if (loggerConfig.hasOwnProperty('AppenderRef')) {
				logger.addAppender(getAppenderForRef(loggerConfig.AppenderRef))
			}
		}
	}
	
	//Reset already instantiated loggers that are not in the config anymore to default values
	for (var loggerName in loggers) {
		if (!loggers.hasOwnProperty(loggerName)) {
			continue
		}
		if (configgedLoggerNames.indexOf(loggerName) == -1) {
			loggers[loggerName].removeAllAppenders()
			loggers[loggerName].setLevel(Level.ERROR) //CHECKME: need to specify a default? will use Debug now 
			loggers[loggerName].setAdditivity(false)
		}
	}
	
	//TODO: also need to reconfig/reset named appenders
}

/**
 * @private 
 * @type {Object<AbstractAppender>}
 * @properties={typeid:35,uuid:"42790755-ECF4-4604-91DC-6DB654A73344",variableType:-4}
 */
var namedAppenders = {}

/**
 * @private 
 * @param {{ref: String}} appenderRef
 * 
 * @return {AbstractAppender}
 *
 * @properties={typeid:24,uuid:"E9083AE2-0B82-4515-88CC-58E1695D8EFF"}
 */
function getAppenderForRef(appenderRef) {
	if (!appenderRef || !appenderRef.ref) {
		//TODO: log warning
		return null
	}
	if (namedAppenders.hasOwnProperty(appenderRef.ref)) {
		application.output('Existing Appender returned')
		return namedAppenders[appenderRef.ref]
	}
	for (var j = 0; j < currentConfig.appenders.length; j++) {
		var appenderConfig = currentConfig.appenders[j]
		if (appenderConfig.name == appenderRef.ref) {
			var appenderConstructor = logPlugins[appenderConfig.type]
			if (!appenderConstructor || !(appenderConstructor.prototype instanceof AbstractAppender)) { //CHECKME: second check needed or is the contents of logPlugins under out direct control
				//TODO: raise config error
				application.output('Appender not found')
				return null
			} else {
				/** @type {AbstractAppender} */
				var appender = appenderConstructor['PluginFactory'](appenderConfig)
				namedAppenders[appenderRef.ref] = appender
				application.output('Appender created')
				return appender
			}
		}
	}
	return null
}

/**
 * TODO: remove this when reconfig is finished
 * Resets the all loggers to their default level
 * @public 
 * @deprecated 
 * @properties={typeid:24,uuid:"A38B73EE-4752-4909-9D61-CF4DB620CC3D"}
 */
function resetConfiguration() {
	getRootLogger().setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
	loggers = {};
}

/* ----------------------------------Levels------------------------------------ */
/**
 * @public
 * @properties={typeid:35,uuid:"0971FFA4-3E9F-4020-8276-31ED8EAF2F0C",variableType:-4}
 */
var Level = function(level, name) {
	this.intLevel = level;
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
				return this.intLevel == level.intLevel;
			},
			isAtLeastAsSpecificAs: function(level){
				return this.intLevel >= level.intLevel;
			},
			lessOrEqual: function(level){
				return this.intLevel >= level.intLevel
			}
		};

		Level.ALL = new Level(-Number.MAX_VALUE, "ALL");
		Level.TRACE = new Level(-1, "TRACE");
		Level.DEBUG = new Level(LOGGINGLEVEL.DEBUG, "DEBUG");
		Level.INFO = new Level(LOGGINGLEVEL.INFO, "INFO");
		Level.WARN = new Level(LOGGINGLEVEL.WARNING, "WARN");
		Level.ERROR = new Level(LOGGINGLEVEL.ERROR, "ERROR");
		Level.FATAL = new Level(LOGGINGLEVEL.FATAL, "FATAL");
		Level.OFF = new Level(Number.MAX_VALUE, "OFF");
		
		/**
		 * @param {String} name
		 * @param {Level} [defaultLevel] Default: Level.DEBUG
		 * @return {Level}
		 */
		Level.toLevel = function(name, defaultLevel) {
			if (name == null) {
			    return defaultLevel||Level.DEBUG
			}
			var cleanLevel = name.toUpperCase();
			
			var levels = [Level.ALL, Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL, Level.OFF]
			for (var i = 0; i < levels.length; i++) {
			    if (levels[i].name == cleanLevel) {
			        return levels[i];
			    }
			}
			return defaultLevel||Level.DEBUG
		}
	}())

/* ----------------------------------Loggers------------------------------------ */
/**
 * @private
 * @constructor
 * @this {LoggerInternal}
 *
 * @param {String} name
 * @param {Logger} [logger]
 *
 * @properties={typeid:24,uuid:"1086E0C7-EE0E-4A8B-B208-9E27A4057B9F"}
 */
function LoggerInternal(name, logger) {
	/**
	 * @type {Level}
	 */
	this.effectiveLevel = null
	
	/**
	 * @type {LoggerInternal}
	 */
	this.parent = null;
	/**
	 * @type {Array<LoggerInternal>}
	 */
	var children = [];
	
	/** @type {Array<AbstractAppender>} */
	var appenders = [];
	var loggerLevel = null;
	this.isRoot = (name === ROOT_LOGGER_NAME);
	
	var appenderCache = null;
	var appenderCacheInvalidated = false;

	/** @type {String} */
	this.name = name
	/**
	 * @return {String}
	 */
	this.getName = function(){
		return this.name
	}
	
	/**
	 * @param {LoggerInternal} childLogger
	 */
	this.addChild = function(childLogger) {
		//Check existing children and see if they need to become a child of childLogger instead
		var childName = childLogger.name + '.'
		for (var i = 0; i < children.length; i++) {
			if(children[i].name.substring(0, childName.length) == childName) {
				var childToMove = children.splice(i,1)[0]
				childLogger.addChild(childToMove)
				childToMove.parent = childLogger
				childToMove.invalidateAppenderCache();
			}
		}
		children.push(childLogger);
		childLogger.parent = this;
		childLogger.invalidateAppenderCache();
	};

	// Additivity
	/**
	 * @private 
	 */
	var additive = true;
	
	/**
	 * Get the additivity flag for this Logger instance<br>
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
	 * Add {@link appender} to the list of appenders of this Logger instance<br>
	 * <br>
	 * If {@link appender} is already in the list of appenders, then it won't be added again.<br>
	 * <br>
	 * @public
	 * @param {AbstractAppender} appender
	 */
	this.addAppender = function(appender) {
		if (appender instanceof AbstractAppender) {
			if (!(appenders.indexOf(appender) != -1)) {
				appenders.push(appender);
				//appender.setAddedToLogger(this);
				this.invalidateAppenderCache();
			}
		} else {
			logLog.error("Logger.addAppender: appender supplied ('" + appender + "') is not a subclass of Appender");
		}
	};
	
	/**
	 * @public 
	 * @param {String} appenderName
	 */
	this.getAppender = function(appenderName) {
		var retval = null
		appenders.some(function(elementValue, elementIndex, traversedArray){
			if (elementValue.getName() == appenderName) {
				retval = elementValue
				return true
			}
			return false
		})
		return retval
	}
	
	/**
	 * @public 
	 */
	this.getAllAppenders = function() {
		return appenders.slice(0)
	}

	/**
	 * Removes the given appender<br>
	 * <br>
	 * @public
	 * @param {AbstractAppender} appender
	 */
	this.removeAppender = function(appender) {
		var i = appenders.indexOf(appender)
		if (i != -1) {
			appenders.splice(i,1)
		}
		//appender.setRemovedFromLogger(this);
		this.invalidateAppenderCache();
	};

	/**
	 * Clears all appenders for the current logger<br>
	 * <br>
	 * @public
	 */
	this.removeAllAppenders = function() {
//		var appenderCount = appenders.length;
//		if (appenderCount > 0) {
//			for (var i = 0; i < appenderCount; i++) {
//				appenders[i].setRemovedFromLogger(this);
//			}
			appenders.length = 0;
			this.invalidateAppenderCache();
//		}
	};

	/**
	 * @return {Array<AbstractAppender>}
	 */
	this.getEffectiveAppenders = function() {
		if (appenderCache === null || appenderCacheInvalidated) {
			// Build appender cache
			var parentEffectiveAppenders = (this.isRoot || !this.getAdditivity()) ? [] : this.parent.getEffectiveAppenders();
			appenderCache = parentEffectiveAppenders.concat(appenders);
			appenderCacheInvalidated = false;
		}
		return appenderCache;
	};
	
	this.isAttached = function(){}

	this.invalidateAppenderCache = function() {
		appenderCacheInvalidated = true;
		for (var i = 0, len = children.length; i < len; i++) {
			children[i].invalidateAppenderCache();
		}
	};

	/**
	 * @public 
	 */
	this.getParent = function(){
		return this.parent
	}

	/**
	 * Call the appenders in the hierrachy starting at this. If no appenders could be found, emit a warning<br>
	 * <br>
	 * This method calls all the appenders inherited from the hierarchy circumventing any evaluation of whether to log or not to log the particular log request<br>
	 * <br>
	 * @public 
	 * @param {LoggingEvent} loggingEvent
	 */
	this.callAppenders = function(loggingEvent) {
		var effectiveAppenders = this.getEffectiveAppenders();
		for (var i = 0; i < effectiveAppenders.length; i++) {
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
		if (this.isRoot && level === null) {
			logLog.error("Logger.setLevel: you cannot set the level of the root logger to null");
		} else if (level instanceof Level) {
			this.setEffectiveLevel(level)
			loggerLevel = level;
		} else {
			logLog.error("Logger.setLevel: level supplied to logger " + this.name + " is not an instance of log4javascript.Level");
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

	this.setEffectiveLevel = function(level) {
		if (loggerLevel === null) {
			this.effectiveLevel = level
			for (var i = 0; i < children.length; i++) {
				children[i].setEffectiveLevel(level)
			}
		}
	}
	
	/**
	 * Returns the level at which the logger is operating. This is either the level explicitly set on the logger or, if no level has been set, the effective level of the logger's parent<br>
	 * <br>
	 * @public
	 * @return {Level}
	 */
	this.getEffectiveLevel = function() {
		return this.effectiveLevel;
	}

	/**
	 * @return {String}
	 */
	this.toString = function() {
		return "Logger[" + name + "]";
	};
	
	/**
	 * @type {Logger}
	 */
	this.externalLogger = logger ? Logger.call(logger, this) : new Logger(this)
}

/**
 * @properties={typeid:35,uuid:"0F992E15-B252-4AC8-9041-F2AF6A132DE2",variableType:-4}
 */
var initLoggerInternal = (function(){
	LoggerInternal.prototype = new LogPlugin() //Object.create(LogPlugin.prototype)
	LoggerInternal.prototype.constructor = LoggerInternal
	
	LoggerInternal.PluginFactory = function(config) {
		var retval = new LoggerInternal(config.name)
				
		var keys = Object.keys(config)
		for (var index = 0; index < keys.length; index++) {
			var key = keys[index]
			switch (key) {
				case 'type':
					break;
				case 'name':
					retval.name = config.name
					break
				case 'threshold':
					retval.setThreshold(Level.toLevel(config.threshold))
					break;
				default:
					var plugin = logPlugins[key]
					if (plugin) {
						if (plugin.prototype instanceof AbstractLayout) {
							retval.setLayout(plugin['PluginFactory'](config[key]))
						} else {
							//Unknown plugin type
						}
					} else {
						//Unknown config entry
					}
					break;
			}
		}
		return retval
	}
}())

/**
 * @private
 * @constructor 
 * @param {LoggerInternal} internal
 *
 * @properties={typeid:24,uuid:"118575D2-E51F-4294-97AE-E5F515B7A821"}
 */
function Logger(internal) {
	/**
	 * Generic logging method used by wrapper methods such as debug, error etc<br>
	 * <br>
	 * @public 
	 * @param {Level} level
	 * @param {Array<Object>} params Array with messages to log. Last entry can be an Error
	 */
	this.log = function(level, params) {
		if (level.intLevel >= internal.effectiveLevel.intLevel) {
			// Check whether last param is an exception
			/** @type {Error} */
			var exception;
			var finalParamIndex = params.length - 1;
			var lastParam = params[finalParamIndex];
			if (params.length > 1 && (lastParam instanceof Error)) {
				exception = lastParam;
				finalParamIndex--;
			}

			// Construct genuine array for the params
			var messages = [];
			for (var i = 0; i <= finalParamIndex; i++) {
				messages[i] = params[i];
			}

			var loggingEvent = new LoggingEvent(internal, new Date(), level, messages, exception);

			internal.callAppenders(loggingEvent);
		}
	}
	
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
	 * @param {*} message
	 * @param {Error} [exception]
	 */
	this.debug = function(message, exception) {
		this.log(Level.DEBUG, arguments);
	}
	/**
	 * Logs a message and optionally an error at level INFO<br>
	 * <br>
	 * @public
	 * @param {*} message
	 * @param {Error} [exception]
	 */
	this.info = function(message, exception) {
		this.log(Level.INFO, arguments);
	}
	/**
	 * Logs a message and optionally an error at level WARN<br>
	 * <br>
	 * @public
	 * @param {*} message
	 * @param {Error} [exception]
	  */
	this.warn = function(message, exception) {
		this.log(Level.WARN, arguments);
	}
	/**
	 * Logs a message and optionally an error at level ERROR<br>
	 * <br>
	 * @public
	 * @param {*} message
	 * @param {Error} [exception]
	 */
	this.error = function(message, exception) {
		this.log(Level.ERROR, arguments);
	}
	/**
	 * Logs a message and optionally an error at level FATAL<br>
	 * <br>
	 * @public
	 * @param {*} message
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
		return level.isAtLeastAsSpecificAs(internal.effectiveLevel.intLevel);
	}
	
	/**
	 * Returns whether the logger is enabled for TRACE messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isTraceEnabled = function() {
		return Level.TRACE.intLevel >= internal.effectiveLevel.intLevel;
	}
	/**
	 * Returns whether the logger is enabled for DEBUG messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isDebugEnabled = function() {
		return Level.DEBUG.intLevel >= internal.effectiveLevel.intLevel;
	}
	/**
	 * Returns whether the logger is enabled for INFO messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isInfoEnabled = function() {
		return Level.INFO.intLevel >= internal.effectiveLevel.intLevel;
	}
	/**
	 * Returns whether the logger is enabled for WARN messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isWarnEnabled = function() {
		return Level.WARN.intLevel >= internal.effectiveLevel.intLevel;
	}
	/**
	 * Returns whether the logger is enabled for ERROR messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isErrorEnabled = function() {
		return Level.ERROR.intLevel >= internal.effectiveLevel.intLevel;
	}
	/**
	 * Returns whether the logger is enabled for FATAL messages<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	this.isFatalEnabled = function() {
		return Level.FATAL.intLevel >= internal.effectiveLevel.intLevel;
	}

	this.getName = function() {
		return internal.name
	}
}

// Logger access methods
/** 
 * Hashtable of loggers keyed by logger name
 * 
 * TODO: should be a WeakMap to unreferenced loggers are GC. Currently Loggers hold a direct reference to their parent and children, so this wouldn't help.
 * @private
 * @type {Object<LoggerInternal>}
 * @properties={typeid:35,uuid:"0F49DC42-01BC-4720-B19F-DA1B30BF9D1E",variableType:-4}
 */
var loggers = {};
	
/**
* @private
* @type {String}
*
* @properties={typeid:35,uuid:"7AA018E7-ACA9-4215-9117-597DF91D7D16"}
*/
var ROOT_LOGGER_NAME = "root"
	
/**
 * @private
 * @properties={typeid:35,uuid:"EC4E9958-AA1E-4F91-9612-FEEB50E4CFA9",variableType:-4}
 */
var ROOT_LOGGER_DEFAULT_LEVEL = application.isInDeveloper() ? Level.DEBUG : Level.WARN;

/**
 * @private
 * @type {LoggerInternal}
 * @properties={typeid:35,uuid:"8FD01917-2F91-4033-A373-C6B8476A6476",variableType:-4}
 */
var rootLogger

/**
 * @private
 * @properties={typeid:24,uuid:"AB765A70-AFE5-408F-8DA2-AC05200BD87B"}
 */
function getRootLoggerInternal() {
	if (!rootLogger) {
		rootLogger = new LoggerInternal(ROOT_LOGGER_NAME);
		rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
		rootLogger.addAppender(new ApplicationOutputAppender()) //TODO: this should be read from the config
	}
	return rootLogger;
}

/**
 * Returns the root logger from which all other loggers derive<br>
 * <br>
 * @public 
 * @properties={typeid:24,uuid:"8316507A-C3C1-4FDB-9A02-486F725ACD51"}
 */
function getRootLogger() {
	return rootLogger||getRootLoggerInternal().externalLogger
}

/**
 * Returns a logger with the specified name, creating it if a logger with that name does not already exist<br>
 * <br>
 * Note that the name 'root' is reserved for the root logger<br>
 * <br>
 * @public
 * @param {String} loggerName
 * @return {Logger}
 *
 * @properties={typeid:24,uuid:"B8C91C9F-3D84-4CC7-8228-EA6D5A975FE0"}
 */
function getLogger(loggerName) {
	if (!loggerName || typeof loggerName != "string") {
		throw scopes.modUtils$exceptions.IllegalArgumentException('non-string logger name "' + loggerName + '" supplied')
	}

	// Do not allow retrieval of the root logger by name
	if (loggerName == ROOT_LOGGER_NAME) {
		logLog.error("log4javascript.getLogger: root logger may not be obtained by name");
	}

	// Create the logger for this name if it doesn't already exist
	if (!loggers[loggerName]) {
		var logger = new LoggerInternal(loggerName)
		loggers[loggerName] = logger;
		
		if (currentConfig.loggers && currentConfig.loggers.logger) {
			for (var i = 0; i < currentConfig.loggers.logger.length; i++) {
				if (currentConfig.loggers.logger[i].name == loggerName) {
					//TODO: delegate logger config to the pluginFactory of Logger
					var logConfig = currentConfig.loggers.logger[i]
					var keys = Object.keys(logConfig)
					for (var p = 0; p < keys.length; p++) {
						switch (keys[p]) {
							case 'level':
								logger.setLevel(Level.toLevel(logConfig['level']))
								break;
							case 'additivity':
								logger.setAdditivity(logConfig['additivity'] == false ? false: true) //TODO: Better true/false determination needed
								break;
							case 'AppenderRef':
							logger.addAppender(getAppenderForRef(logConfig.AppenderRef))
							
//								//FIXME: multiple loggers using the same named Appender should not result in multiple Appender instances
//								//TODO: How to configure multiple appenders?
//								for (var j = 0; j < config.appenders.length; j++) {
//									var appenderConfig = config.appenders[j]
//									if (appenderConfig.name == logConfig['AppenderRef'].ref) {
//										var appenderConstructor = logPlugins[appenderConfig.type]
//										if (!appenderConstructor || !(appenderConstructor instanceof AbstractAppender)) { //CHECKME: second check needed or is the contents of logPlugins under out direct control
//											//TODO: raise config error
//										} else {
//											logger.addAppender(appenderConstructor['PluginFactory'](appenderConfig))
//										}
//									}
//								}
								break;
							default:
								//TODO: log unknown config keys
								break;
						}
					}
				}
			}
		}
		
		var parentName = loggerName
		var parent
		while (!parent && parentName) {
			parentName = parentName.substring(0, parentName.lastIndexOf("."));
			parent = loggers[parentName]
		}
		parent = parent||getRootLoggerInternal()
		logger.setEffectiveLevel(parent.effectiveLevel)
		parent.addChild(logger)
		return logger.externalLogger;
	}
	return loggers[loggerName].externalLogger;
}

/* ---------------------------------Logging events------------------------------------- */
/**
 * @private
 * @constructor
 *
 * @param {LoggerInternal} logger
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
			return (this.messages.length == 1) ? this.messages[0] : this.messages.join(NEW_LINE);
		},
		toString: function() {
			return "LoggingEvent[" + this.level + "]";
		}
	};
}())

/* -------------------------------LogPlugin prototype--------------------------------------- */
/**
 * Empty base class for all classes that are to be configurable Log components
 * @constructor 
 * @private 
 * @properties={typeid:24,uuid:"B7FBEA4D-EF81-4471-846A-193E058267A1"}
 */
function LogPlugin (){}

/**
 * @private 
 * @type {Object<LogPlugin>}
 * @properties={typeid:35,uuid:"F33918BB-200F-4EA9-BC61-0B4C3778DB2C",variableType:-4}
 */
var logPlugins = {}

/**
 * Array holding the names of the default plugins, in order to clean {@link logPlugins} from custom plugins on {@link #loadConfig()}
 * @private 
 * @type {Array<String>}
 *
 * @properties={typeid:35,uuid:"941CB850-3A34-4274-A742-8775203F0898",variableType:-4}
 */
var defaultLogPlugins = null

/* --------------------------------Appender prototype-------------------------------------- */
/**
 * Abstract implementation for Appenders. Each subclass must override the .append(LoggingEvent) and .toString() methods<br>
 * <br>
 * Appenders are also subclasses of {@link #LogPlugin} and in order to be automatically configurable, must provide a static .PluginFactory(config) method<br>
 * <br>
 * @public 
 * @constructor
 * @extends {LogPlugin}
 *
 * @properties={typeid:24,uuid:"347251D0-84E5-40FE-8ED9-45CB3FE7FB4A"}
 */
function AbstractAppender() {
	this.appenderName = null
	
	this.layout = new PatternLayout(); //CHECKME: does this need to be initialized to a PatternLayout w/o any pattern?
	this.threshold = Level.ALL;
//	this.loggers = [];

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
		
		if (loggingEvent.level.intLevel >= this.threshold.intLevel) {
			this.append(loggingEvent);
		}
	};

	/**
	 * Appender-specific method to append a log message. Every appender object should implement this method<br>
	 * <br>
	 * @protected
	 * @param {LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {};
	
	/**
	 * Sets the appender's layout<br>
	 * <br>
	 * @public 
	 * @param {AbstractLayout} layout
	 */
	this.setLayout = function(layout) {
		if (layout instanceof AbstractLayout) {
			this.layout = layout;
		} else {
			logLog.error("Appender.setLayout: layout supplied to " + this.toString() + " is not a subclass of Layout");
		}
	};

	/**
	 * Returns the appender's layout<br>
	 * <br>
	 * @public
	 * @return {AbstractLayout}
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
			logLog.error("Appender.setThreshold: threshold supplied to " + this.toString() + " is not a subclass of Level");
		}
	};

//	/**
//	 * Returns the appender's threshold<br>
//	 * <br>
//	 * @public
//	 * @return {Level}
//	 */
//	this.getThreshold = function() {
//		return this.threshold;
//	};
	
	this.getName = function() {
		return this.appenderName;
	}
	
	this.setName = function(name) {
		this.appenderName = name
	}

//	this.setAddedToLogger = function(logger) {
//		this.loggers.push(logger);
//	};
//
//	this.setRemovedFromLogger = function(logger) {
//		var i = this.loggers.indexOf(logger)
//		if (i != -1) {
//			this.loggers.splice(i,1)
//		}
//	};

	/**
	 * @public
	 * @return {String}
	 */
	this.toString = function() {
		logLog.error("Appender.toString: all appenders must override this method");
		return null
	};
};

/**
 * @private 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"8B52A861-1DDF-487E-9C89-94551992722F",variableType:-4}
 */
var AbstractAppenderInit = (function(){
	AbstractAppender.prototype = new LogPlugin() //Object.create(LogPlugin.prototype)
	AbstractAppender.prototype.constructor = AbstractAppender
	
	AbstractAppender.PluginFactory = function(config) {
		//TODO raise warning when called
	}
}())

/**
 * Simple Appender that performs application.output
 * @private 
 * @constructor 
 * @extends {AbstractAppender}
 *
 * @properties={typeid:24,uuid:"4500F0BF-BB5B-4D4C-868A-611335B3AD71"}
 */
function ApplicationOutputAppender() {
	 AbstractAppender.call(this);
	
	/**
	 * @param {LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {
        /*
         * By default Servoy logs in different way, depending on the type of client and the type of output
         * - In Smart Client (J2DBClient.java) System.out/err.println is used
         * - In Web Client (SessionClient.java) it is delegated to Debug.java, which instantiates a log4j Logger, through org.apache.commons.logging.LogFactory for the com.servoy.j2db.util.Debug class
         * - In Debug clients output is also redirected to the DBPGDebugger, which prints it to the console in Eclipse
         * 
         * This appender should use internal API directly to reduce overhead:
         * - If in Developer post formatted message directly to DBPGDebugger using the defined format
         * - If in Smart Client, post formatted message directly to System.out/err.println
         * - If in Web Client, post through relevant Debug method directly
         * 
         * Then there's also the Public Java API to report errors/warnings etc.
         */
        var msg = this.layout.format(loggingEvent)//loggingEvent.messages[0]
        if (loggingEvent.exception) {
        	msg += NEW_LINE + loggingEvent.exception.name + ': ' + loggingEvent.exception.message + NEW_LINE + loggingEvent.exception['stack']
        }
        application.output(msg, loggingEvent.level.intLevel) //TODO: handle TRACE, ALL and OFF
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
var initApplicationOutputAppender = (function(){
	ApplicationOutputAppender.prototype = new AbstractAppender() //Object.create(AbstractAppender.prototype);
	ApplicationOutputAppender.prototype.constructor = ApplicationOutputAppender
	
	logPlugins['ApplicationOutputAppender'] = ApplicationOutputAppender
	
	ApplicationOutputAppender.PluginFactory = function(config) {
		var retval = new ApplicationOutputAppender()
				
		var keys = Object.keys(config)
		for (var index = 0; index < keys.length; index++) {
			var key = keys[index]
			switch (key) {
				case 'type':
					break;
				case 'name':
					retval.setName(config.name)
					break
				case 'threshold':
					retval.setThreshold(Level.toLevel(config.threshold))
					break;
				default:
					var plugin = logPlugins[key]
					if (plugin) {
						if (plugin.prototype instanceof AbstractLayout) {
							retval.setLayout(plugin['PluginFactory'](config[key]))
						} else {
							//Unknown plugin type
						}
					} else {
						//Unknown config entry
					}
					break;
			}
		}
		return retval
	}
}())

/* -------------------------------Layout prototype--------------------------------------- */
/**
 * Abstract Layout implementation to be extended for actual Layouts
 * @public 
 * @constructor
 * @extends {LogPlugin}
 *
 * @properties={typeid:24,uuid:"2D33DAB0-E039-4A7E-8AF9-98E7D0BD3F98"}
 */
function AbstractLayout() {
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
	/**
	 * @type {Array}
	 */
	this.customFields = null

	/**
	 * @public
	 */
	this.format = function() {
		logLog.error("Layout.format: layout supplied has no format() method");
	}

	/**
	 * @public
	 */
	this.ignoresThrowable = function() {
		logLog.error("Layout.ignoresThrowable: layout supplied has no ignoresThrowable() method");
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

	/**
	 * @param {LoggingEvent} loggingEvent
	 * @param {Object} combineMessages
	 * @return {Array<Array>}
	 */
	this.getDataValues = function(loggingEvent, combineMessages) {
		var dataValues = [
			[this.loggerKey, loggingEvent.logger.name],
			[this.timeStampKey, this.getTimeStampValue(loggingEvent)],
			[this.levelKey, loggingEvent.level.name],
			[this.urlKey, window.location.href], //FIXME
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
	 * @param {String} [loggerKey]
	 * @param {String} [timeStampKey]
	 * @param {String} [levelKey]
	 * @param {String} [messageKey]
	 * @param {String} [exceptionKey]
	 * @param {String} [urlKey]
	 * @param {String} [millisecondsKey]
	 */
	this.setKeys = function(loggerKey, timeStampKey, levelKey, messageKey,exceptionKey, urlKey, millisecondsKey) {
		this.loggerKey = loggerKey !== undefined ? loggerKey : this.defaults.loggerKey;
		this.timeStampKey = timeStampKey !== undefined ? timeStampKey : this.defaults.timeStampKey;
		this.levelKey = levelKey !== undefined ? levelKey : this.defaults.levelKey;
		this.messageKey = messageKey !== undefined ? messageKey : this.defaults.messageKey;
		this.exceptionKey = exceptionKey !== undefined ? exceptionKey : this.defaults.exceptionKey;
		this.urlKey = urlKey !== undefined ? urlKey : this.defaults.urlKey;
		this.millisecondsKey = millisecondsKey !== undefined ? millisecondsKey : this.defaults.millisecondsKey;
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
		return this.customFields.length > 0;
	}

	/**
	 * @public
	 */
	this.toString = function() {
		logLog.error("Layout.toString: all layouts must override this method");
	}
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"994AF0DE-AA41-453A-B2E0-61047DBFC751",variableType:-4}
 */
var AbstractlayoutInit = (function(){
	AbstractLayout.prototype = new LogPlugin() //Object.create(LogPlugin.prototype);
	AbstractLayout.prototype.constructor = AbstractLayout
}())

/* ---------------------------------SimpleLayout------------------------------------- */
/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
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
	SimpleLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
	SimpleLayout.prototype.constructor = SimpleLayout

	SimpleLayout.prototype.format = function(loggingEvent) {
		return loggingEvent.level.name + " - " + loggingEvent.getCombinedMessages();
	};

	SimpleLayout.prototype.ignoresThrowable = function() {
		return true;
	};

	SimpleLayout.prototype.toString = function() {
		return "SimpleLayout";
	};
	
	logPlugins['SimpleLayout'] = SimpleLayout
}())

/* ---------------------------------NullLayout-------------------------------------- */
/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
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
	NullLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
	NullLayout.prototype.constructor = NullLayout

	NullLayout.prototype.format = function(loggingEvent) {
		return loggingEvent.messages;
	};

	NullLayout.prototype.ignoresThrowable = function() {
		return true;
	};

	NullLayout.prototype.toString = function() {
		return "NullLayout";
	};
	
	logPlugins['NullLayout'] = NullLayout
}())

/* ---------------------------------XmlLayout------------------------------------- */
/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
 * @param {Object} combineMessages
 *
 * @properties={typeid:24,uuid:"E33DAAA2-193B-4080-8805-1D3452AA08BD"}
 */
function XmlLayout(combineMessages) {
	this.combineMessages = typeof combineMessages != "undefined" ? Boolean(combineMessages) : true;
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"5A02CFFB-582D-4B3F-92AD-B4DEA07071F2",variableType:-4}
 */
var xmlLayoutInit = (function() {
			XmlLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
			XmlLayout.prototype.constructor = XmlLayout
			
			XmlLayout.prototype.isCombinedMessages = function() {
				return this.combineMessages;
			};

			XmlLayout.prototype.getContentType = function() {
				return "text/xml";
			};

			XmlLayout.prototype.escapeCdata = function(str) {
				return str.replace(/\]\]>/, "]]>]]&gt;<![CDATA[");
			};

			/**
			 * @param {LoggingEvent} loggingEvent
			 * @return {String}
			 * @this {XmlLayout}
			 */
			XmlLayout.prototype.format = function(loggingEvent) {
				var layout = this;
				var i, len;
				function formatMessage(message) {
					message = (typeof message === "string") ? message : '' + message;
					return "<log4javascript:message><![CDATA[" + layout.escapeCdata(message) + "]]></log4javascript:message>"; //FIXME
				}

				var str = "<log4javascript:event logger=\"" + loggingEvent.logger.name + "\" timestamp=\"" + this.getTimeStampValue(loggingEvent) + "\"";
				if (!this.isTimeStampsInMilliseconds()) {
					str += " milliseconds=\"" + loggingEvent.milliseconds + "\"";
				}
				str += " level=\"" + loggingEvent.level.name + "\">" + NEW_LINE;
				if (this.combineMessages) {
					str += formatMessage(loggingEvent.getCombinedMessages());
				} else {
					str += "<log4javascript:messages>" + NEW_LINE;
					for (i = 0, len = loggingEvent.messages.length; i < len; i++) {
						str += formatMessage(loggingEvent.messages[i]) + NEW_LINE;
					}
					str += "</log4javascript:messages>" + NEW_LINE;
				}
				if (this.hasCustomFields()) { //FIXME
					for (i = 0, len = this.customFields.length; i < len; i++) { //FIXME
						str += "<log4javascript:customfield name=\"" + this.customFields[i].name + "\"><![CDATA[" + this.customFields[i].value.toString() + "]]></log4javascript:customfield>" + NEW_LINE;
					}
				}
				if (loggingEvent.exception) {
					str += "<log4javascript:exception><![CDATA[" + getExceptionStringRep(loggingEvent.exception) + "]]></log4javascript:exception>" + NEW_LINE;
				}
				str += "</log4javascript:event>" + NEW_LINE + NEW_LINE;
				return str;
			};

			XmlLayout.prototype.ignoresThrowable = function() {
				return false;
			};

			XmlLayout.prototype.toString = function() {
				return "XmlLayout";
			};
			
			logPlugins['XmlLayout'] = XmlLayout
	}())

/* ---------------------------------JsonLayout------------------------------------- */
/**
 * @private
 * @param str
 *
 * @properties={typeid:24,uuid:"6D1D3E82-FB48-4421-98CF-2A322FD8A11F"}
 */
function escapeNewLines(str) {
	return str.replace(/\r\n|\r|\n/g, "\\r\\n");
}

/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
 *
 * @param {Object} readable
 * @param {Object} combineMessages
 *
 * @properties={typeid:24,uuid:"340D216B-0285-475B-82D9-560E6D6E183B"}
 */
function JsonLayout(readable, combineMessages) {
	this.readable = typeof readable != "undefined" ? Boolean(readable) : false;
	this.combineMessages = typeof combineMessages != "undefined" ? Boolean(combineMessages) : true;
	this.batchHeader = this.readable ? "[" + NEW_LINE : "[";
	this.batchFooter = this.readable ? "]" + NEW_LINE : "]";
	this.batchSeparator = this.readable ? "," + NEW_LINE : ",";
	this.setKeys();
	this.colon = this.readable ? ": " : ":";
	this.tab = this.readable ? "\t" : "";
	this.lineBreak = this.readable ? NEW_LINE : "";
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"3350BBD8-3E6C-4E29-AEBA-FE90AEB1D0A8",variableType:-4}
 */
var jsonLayoutInit = (function() {
		JsonLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
		JsonLayout.prototype.constructor = JsonLayout
			
		JsonLayout.prototype.isReadable = function() {
			return this.readable;
		};

		JsonLayout.prototype.isCombinedMessages = function() { //FIXME
			return this.combineMessages;
		};

		/**
		 * @param {LoggingEvent} loggingEvent
		 * @return {String}
		 * @this {JsonLayout}
		 */
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
					for (var j = 0; j < val.length; j++) {
						var childPrefix = prefix + layout.tab;
						formattedValue += childPrefix + formatValue(val[j], childPrefix, false);
						if (j < val.length - 1) {
							formattedValue += ",";
						}
						formattedValue += layout.lineBreak;
					}
					formattedValue += prefix + "]";
				} else if (valType !== "number" && valType !== "boolean") {
					formattedValue = "\"" + escapeNewLines(('' + val).replace(/\"/g, "\\\"")) + "\"";
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
		
		logPlugins['JsonLayout'] = JsonLayout
	}())

/* ---------------------------------HttpPostDataLayout------------------------------------- */
/**
 * @private 
 * @extends {AbstractLayout}
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
		HttpPostDataLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
		HttpPostDataLayout.prototype.constructor = HttpPostDataLayout
			
		// Disable batching
		HttpPostDataLayout.prototype.allowBatching = function() {
			return false;
		};

		/**
		 * @param {LoggingEvent} loggingEvent
		 * @return {String}
		 */
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
		
		logPlugins['HttpPostDataLayout'] = HttpPostDataLayout
	}())

/* --------------------------------formatObjectExpansion-------------------------------------- */
/**
 * @private
 * @param object
 * @param {Number} maxdepth
 * @param [indent]
 *
 * @properties={typeid:24,uuid:"A20BF81C-84B3-4D88-AFF2-966B67B173B1"}
 */
function formatObjectExpansion(object, maxdepth, indent) {
	var objectsExpanded = [];

	function doFormat(obj, depth, indentation) {
		var i, len, childDepth, childIndentation, childLines, expansion,
			childExpansion;

		if (!indentation) {
			indentation = "";
		}

		/**
		 * @param {String} text
		 * @return {String}
		 */
		function formatString(text) {
			var text2 = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
			var lines = text2.split("\n");
			for (var j = 1, jLen = lines.length; j < jLen; j++) {
				lines[j] = indentation + lines[j];
			}
			return lines.join(NEW_LINE);
		}

		if (obj === null) {
			return "null";
		} else if (typeof obj == "undefined") {
			return "undefined";
		} else if (typeof obj == "string") {
			return formatString(obj);
		} else if (typeof obj == "object" && objectsExpanded.indexOf(obj) != -1) {
			try {
				expansion = '' + obj;
			} catch (ex) {
				expansion = "Error formatting property. Details: " + getExceptionStringRep(ex);
			}
			return expansion + " [already expanded]";
		} else if ( (obj instanceof Array) && depth > 0) {
			objectsExpanded.push(obj);
			expansion = "[" + NEW_LINE;
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
			expansion += childLines.join("," + NEW_LINE) + NEW_LINE + indentation + "]";
			return expansion;
		} else if (Object.prototype.toString.call(obj) == "[object Date]") {
			return obj.toString();
		} else if (typeof obj == "object" && depth > 0) {
			objectsExpanded.push(obj);
			expansion = "{" + NEW_LINE;
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
			expansion += childLines.join("," + NEW_LINE) + NEW_LINE + indentation + "}";
			return expansion;
		} else {
			return formatString('' + obj);
		}
	}
	return doFormat(object, maxdepth, indent);
}

/* ---------------------------------PatternLayout------------------------------------- */
/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
 * @param {String} [pattern]
 *
 * @properties={typeid:24,uuid:"2C542AAB-8C8F-4C1F-951A-22A2CB81D623"}
 */
function PatternLayout(pattern) {
	this.pattern = pattern||PatternLayout.DEFAULT_CONVERSION_PATTERN;
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
		PatternLayout.ISO8601_BASIC_DATEFORMAT = "yyyyMMdd HHmmss,SSS";
		PatternLayout.ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS";
		PatternLayout.DATETIME_DATEFORMAT = "dd MMM yyyy HH:mm:ss,SSS";
		PatternLayout.COMPACT_DATEFORMAT = "yyyyMMddHHmmssSSS";

		PatternLayout.prototype = new AbstractLayout() //Object.create(AbstractLayout.prototype);
		PatternLayout.prototype.constructor = PatternLayout

		/**
		 * @param {LoggingEvent} loggingEvent
		 * @return {String}
		 * @this {PatternLayout}
		 */
		PatternLayout.prototype.format = function(loggingEvent) {
			//TODO: for every logged message the entire config is parsed again. Maybe need to cache something to improve performance
			var regex = /%(-?[0-9]+)?(\.?[0-9]+)?(message|msg|logger|date|level|relative|thread|[acdfmnprt%])(\{([^\}]+)\})?|([^%]+)/;
			var formattedString = "";
			/** @type {Array<String>} */
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
						case 'a': // Array of messages
						case 'message':
						case 'msg':
						case 'm': // Message
							var depth = 0;
							if (specifier) {
								depth = parseInt(specifier, 10);
								if (isNaN(depth)) {
									logLog.error("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character '" + conversionCharacter + "' - should be a number");
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
						case 'logger':
						case 'c':
							replacement = loggingEvent.logger.name;
							if (specifier) {
								var loggerNameBits = replacement.split(".");
								var bits = specifier.split('.')
								if (bits.length == 1) {
									if (/^\d+$/.test(bits[0])) {
										replacement = loggerNameBits.slice(Math.max(loggerNameBits.length - parseInt(bits[0], 10), 0)).join(".");
									} else {
										//TODO: raise config error: if only 1 bit is specified, it must be an integer
									}
								} else {
									var last = loggerNameBits.pop()
									var retval = []
									var prevBit, bit
									for (var j = 0; j < loggerNameBits.length; j++) {
										bit = bits[j]||prevBit 
										//TODO: implement support for bits that have the format .1~.: should result in an abbreviated loggerNameBit, followed by the literal text
										if (/^\d+$/.test(bit)) {
											 retval.push(loggerNameBits[j].substr(0, parseInt(bit)))
										 } else if (bit === '*') {
											 retval.push(loggerNameBits[j])
										 } else {
											 retval.push(bit)
										 }
										 prevBit = bit
									}
									retval.push(last)
									replacement = retval.join('.')
								}
							}
							break;
						case 'date':
						case 'd':
							var dateFormat = PatternLayout.ISO8601_DATEFORMAT;
							if (specifier) {
								// Pick up special cases
								switch (dateFormat) {
									case 'ISO8601':
										dateFormat = PatternLayout.ISO8601_DATEFORMAT;
										break;
									case 'ISO8601_BASIC':
										dateFormat = PatternLayout.ISO8601_BASIC_DATEFORMAT;
										break;
									case 'ABSOLUTE':
										dateFormat = PatternLayout.ABSOLUTETIME_DATEFORMAT;
										break;
									case 'DATE':
										dateFormat = PatternLayout.DATETIME_DATEFORMAT;
										break;
									case 'COMPACT':
										dateFormat = PatternLayout.COMPACT_DATEFORMAT
										break;
									default:
										dateFormat = specifier;
										break;
								}
							}
							// Format the date
							replacement = utils.dateFormat(loggingEvent.timeStamp, dateFormat)
							break;
						case "f": // Custom field
							if (this.hasCustomFields()) {
								var fieldIndex = 0;
								if (specifier) {
									fieldIndex = parseInt(specifier, 10);
									if (isNaN(fieldIndex)) {
										logLog.error("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - should be a number");
									} else if (fieldIndex === 0) {
										logLog.error("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - must be greater than zero");
									} else if (fieldIndex > this.customFields.length) {
										logLog.error("PatternLayout.format: invalid specifier '" + specifier + "' for conversion character 'f' - there aren't that many custom fields");
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
						case 'n': // New line
							replacement = NEW_LINE;
							break;
						case 'level':
						case 'p':
							replacement = loggingEvent.level.name;
							break;
						case 'relative': // Milliseconds since log4javascript startup
						case 'r': 
							replacement = (loggingEvent.timeStamp.getTime() - APPLICATION_START_DATE.getTime()).toFixed(0)
							break;
						case 'thread':
						case 't': // Current Thread name
							replacement = application.getApplicationType() != APPLICATION_TYPES.MOBILE_CLIENT ? java.lang.Thread.currentThread().getName() : 'main';
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
				searchString = searchString.substr(result['index'] + result[0].length);
			}
			return formattedString;
		};

		PatternLayout.prototype.ignoresThrowable = function() {
			return true;
		};

		PatternLayout.prototype.toString = function() {
			return "PatternLayout";
		};
		
		logPlugins['PatternLayout'] = PatternLayout
		
		PatternLayout.PluginFactory = function (config){
			var retval = new PatternLayout()
			
			var keys = Object.keys(config)
			for (var index = 0; index < keys.length; index++) {
				var key = keys[index]
				switch (key) {
					case 'pattern':
						retval.pattern = config[key]
						break;
					default:
						var plugin = logPlugins[key]
						if (plugin) {
							//Unknown plugin type
						} else {
							//Unknown config entry
						}
						break;
				}
			}
			return retval
		}
		
	}()
)