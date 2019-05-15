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

/*
 * This log implementation is an adapted copy of log4javascript version 1.4.6
 * 
 * this implementation is heavily altered to:
 * - Adapt it to the Servoy environment
 * - Improve performance
 * - Bring it more inline with log4j 2 (for example: Not expose all configuration options through API, but instead supply one loadConfig method that takes care of the configuration)
 * 
 * Below the information distributed with the original log4javascript implementation that is licensed under Apache 2:
 * -------------
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
 * -------------
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
 * - Made default ApplicationOutputAppender one that uses application.output()
 * - Made default level equal to Servoy's loglevel
 * - Better exception output, using Rhino's capabilities
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
 * - Removed the logic that allows logging multiple messages in one go
 * - Replaced logLog impl with statusLogger (to align with log4j 2)
 * - Added messages, to prevent building the String to output if it is not needed
 * - Added 'solution' as Pattern to PatternLayout
 * 
 * TODOs
 * - Allow multiple appenders per logger in the config (AppenderRef: [{ref: 'something'}, {ref: 'something else'])
 * - finish (re)configuration
 * -- make all config go through the same methods: getLogger, getRootLogger, loadConfig
 * -- Make it so that named appender result in one shared instance
 * - Change Logger impl. to use shared Loggerconfig objects between Loggers, like Log4j 2
 * - Remove unused threshold impl.
 * - support filters: http://logging.apache.org/log4j/2.x/manual/filters.html
 * - Option to listen to logging on statuslogger using events, similar to what Log4j offers (needed at least for testing)
 * - Review all layouts except PatternLayout
 * - fix warnings
 * - Support consise format besides strict format
 * - See if Level can be not exposed as Constructor function, but as an object with static properties only
 * - build in fail-save if constructors aren't called with new keyword
 * - See which appenders/layouts need to stay
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
 * TODO: code in this scope contains some hardcoded \n and \r\n\'s. Check whether that is correct
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"282E129E-AEB0-4B2F-8ABB-5DDF5F0C09DC"}
 */
var NEW_LINE = Packages.java.lang.System.getProperty("line.separator");

/**
 * @private
 *
 * @properties={typeid:35,uuid:"BE695155-2057-40ED-B87D-803BE91F1CDA",variableType:-4}
 */
var useTimeStampsInMilliseconds = true;

/**
 * TODO figure out what to do with this method. Made it private for now as to not expose it in the API
 * @private
 * @param {Boolean} timeStampsInMilliseconds
 *
 * @properties={typeid:24,uuid:"2293F82F-B192-4375-A38A-DF7CD697B7A2"}
 */
function setTimeStampsInMilliseconds(timeStampsInMilliseconds) {
	useTimeStampsInMilliseconds = timeStampsInMilliseconds
}

/**
 * TODO figure out what to do with this method. Made it private for now as to not expose it in the API
 * @private
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
			statusLogger.warn("Unable to obtain file and line information for error");
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

/* ----------------------------------Configuration------------------------------------ */
/**
 * Type Definition for the config parameter of {@link #loadConfig}<br>
 * <br>
 * @public
 * @typedef {{
 * 	status: String=,
 *  plugins: String=,
 *  appenders: Array<{
 *  	type: String,
 *  	name: String
 *  }>,
 *  loggers: {
 *  	logger: Array<{
 *  		name: String,
 *  		level: String=,
 *  		additivity: boolean=,
 *  		AppenderRef: {ref:String}|Array<{ref:String}>=
 *  	}>=,
 *  	root: {
 *  		level: String,
 *  		AppenderRef: {ref:String}|Array<{ref:String}>=
 *  	}
 *  }
 * }}
 *
 * @properties={typeid:35,uuid:"9968F91A-7D3B-4FD6-8CFE-5424DE80D46F",variableType:-4}
 */
var CONFIG_TYPE_DEF

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
 * Load the logging configuration<br>
 * Call with null to reset to the default configuration<br>
 * 
 * @public
 * <br> {String} <b>[configuration.status]</b> 
 * <br> {String} <b>[configuration.plugins]</b> List of used plugins. You must list here all the types of appender plugin used. 
 * <br> Example 
 * <br> <i>scopes.svyLogManager$rollingFileAppender.RollingFileAppender, scopes.svyLogManager$dbAppender.DbAppender</i>
 * <br> 
 * <br> {Array<{type: String, name:String, Layout: AbstractLayout=}>} <b>[configuration.appenders]</b> List of appender instances. You can add multiple instances of the same appender type.
 * <br> Example <i>[{ 
				type: "ApplicationOutputAppender",
				name: "ApplicationOutput",
				PatternLayout: {
					pattern: "[%thread] %solution %f c %c %5level %logger{1.} - %msg"
				}
			}, {
				type: "scopes.svyLogManager$rollingFileAppender.RollingFileAppender",
				name: "RollingFileAppender",
				fileName: "myLogs/myAppLog.log",
				maxFileSize: 1024 * 1024 * 5,
				maxBackupIndex: 5,
				RollingPatternLayout: {
					pattern: "%date %5level %30logger - %msg"
				}
			}]</i>
 * <br> 
 * <br> {String} <b>[configuration.appenders.type]</b> Type of the appender plugin
 * <br> {String} <b>[configuration.appenders.name]</b> Appender name identifier. Named appender may be referenced from AppenderRef.ref of the root or any other logger.
 * <br> {AbstractLayout} <b>[configuration.appenders.<i>Layout</i>]</b> The layout constructor determines the layout of the log message. Available layout constructors are <b><i>
 * 		PatternLayout, SimpleLayout, XmlLayout, JsonLayout, NullLayout, HttpPostDataLayout </i></b>. 
 * <br> Example
 * <br> <i> PatternLayout: { pattern: "[%thread] %solution %f c %c %5level %logger{1.} - %msg" } </i> 
 * <br> 
 * <br> {Array} <b>[configuration.loggers.logger]</b> List of loggers
 * <br> {String} <b>[configuration.loggers.logger.name]</b> The logger name
 * <br> {String} <b>[configuration.loggers.logger.level]</b> The logger level. Possible values: <b><i>fatal, error, warn, debug, info, trace</i></b>.
 * <br> {Boolean} <b>[configuration.loggers.logger.Additivity]</b>
 * <br> {{ref:String, level:String=}} [configuration.loggers.logger.AppenderRef]</b> List of appender references. 
 * <br> Example: 
 * <br> <i> {
			ref: "",
			level: "error"
		} </i>
 * <br> 
 * <br> {String} <b>[configuration.loggers.logger.AppenderRef.ref]</b> The name of the appender used by this logger. The appender name must be listed in the appenders object.
 * <br> {String} <b>[configuration.loggers.logger.AppenderRef.level]</b> Optional, overrule the logger's level for the specific appender reference.
 * <br> {String} <b>[configuration.loggers.root.level]</b> Root logger log level
 * <br> {{ref:String, level:String=}} <b>[configuration.loggers.root.AppenderRef]</b> List of appender references for the root logger. 
 * <br> {String} <b>[configuration.loggers.root.AppenderRef.ref]</b> The name of the appender used by the root logger. The appender name must be listed in the appenders object.
 * <br> {String} <b>[configuration.loggers.root.AppenderRef.level]</b> Optional, overrule the logger's level for the specific appender reference.
 * @param {CONFIG_TYPE_DEF} configuration
 * @example <pre>scopes.svyLogManager.loadConfig({
 *  status: "error", 
 *  appenders: [
 *    {
 *      type: "ApplicationOutputAppender", 
 *      name: "ApplicationOutput",
 *      PatternLayout: { 
 *        pattern: "%5level %logger{1.} - %msg" 
 *      }
 *    },
 *    {
 *      type: "ApplicationOutputAppender", 
 *      name: "ApplicationOutputWithThread", 
 *      PatternLayout: { 
 *        pattern: "[%thread] %5level %logger{1.} - %msg" 
 *      }
 *    }
 *  ],
 *  loggers: {
 *    logger: [
 *      {
 *        name: "com.servoy.bap.components.webview", 
 *        level: "debug", 
 *        additivity: false, 
 *        AppenderRef: {
 *          ref: "ApplicationOutputWithThread"
 *        }
 *      }
 *    ],
 *    root: { 
 *      level: "error", 
 *        AppenderRef: { 
 *          ref: "ApplicationOutput" 
 *        }
 *      }
 *    }
 *  })</pre>
 *
 * @properties={typeid:24,uuid:"ED82D72C-D6B5-4C6C-AD4C-5331AD8713C1"}
 */
function loadConfig(configuration) {
	currentConfig = configuration = configuration||defaultConfig
	
	//Reset the status logger
	statusLoggerConfig.setLevel(Level.toLevel(configuration.status, Level.ERROR))
	
	//Load custom LogPlugins
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
	
	/** @type {Array<String>} */
	var plugs = configuration.plugins ? configuration.plugins.split(',') : []
	for (var i = 0; i < plugs.length; i++) {
		var plugName = utils.stringTrim(plugs[i]);
		var plugin = scopes.svySystem.getObject(plugName)
		if (plugin.prototype instanceof LogPlugin) {
			logPlugins[plugName] = plugin
		} else {
			if (plugin) { //Found object, but not an instanceof LogPlugin
				statusLogger.warn("Could not find plugin: The path '{}' did not resolve to an object that is an instance of LogPlugin", plugName)
			} else { //Not found
				statusLogger.warn("Could not find plugin: The path '{}' did not resolve to an object", plugName)
			}
		}
	}
	
	//For now we just clear out the store of named appenders and create new ones, instead of reconfiguring existing instances
	namedAppenders = {}
	
	//reset the rootlogger
	var rootLoggerConfig
	if (configuration.loggers && configuration.loggers.root) {
		rootLoggerConfig = configuration.loggers.root
	} else {
		statusLogger.error('Unable to locate configuration for logger ROOTLOGGER (Using default config instead)')
		rootLoggerConfig = defaultConfig.loggers.root
	}
	var rl = getRootLoggerConfig()
	rl.setLevel(Level.toLevel(rootLoggerConfig.level, ROOT_LOGGER_DEFAULT_LEVEL))	
	rl.setAdditivity(false)
	rl.removeAllAppenders()
	
	var defaultAppenderRef
	if (rootLoggerConfig.AppenderRef) {
		/** @type {Array<{appender: AbstractAppender, level: Level}>} */
		var appenders = [];
		if (rootLoggerConfig.AppenderRef instanceof Array) {
			/** @type {Array<{ref: string, level: String}>} */
			var rootAppenders = rootLoggerConfig.AppenderRef;
			for (var raps = 0; raps < rootAppenders.length; raps++) {
				if (!rootAppenders[raps].hasOwnProperty('ref')) {
					statusLogger.error("'ref' attribute not specified on Appender configured for Logger '{}'", loggerConfig.name)
					continue
				}
				appenders.push(getAppenderForRef(rootAppenders[raps]));
			}
		} else if (rootLoggerConfig.AppenderRef.hasOwnProperty('ref')) {
			/** @type {{ref: String, level: String}} */
			var rootAppenderRef = rootLoggerConfig.AppenderRef;
			appenders.push(getAppenderForRef(rootAppenderRef));
		} else {
			statusLogger.error("'ref' attribute not specified on Appender configured for ROOTLOGGER. Using default Appender config for RootLogger instead")
			appenders.push(getAppenderForRef(defaultConfig.loggers.root.AppenderRef))
		}
		if (appenders.length > 0) {
			for (var ap = 0; ap < appenders.length; ap++) {
				rl.addAppender(appenders[ap].appender, appenders[ap].level);
			}
		} else {
			statusLogger.error('Couldn\'t configure the specified Appender for the ROOTLOGGER: {}. Using default config instead', JSON.stringify(rootLoggerConfig.AppenderRef))
			defaultAppenderRef = getAppenderForRef(defaultConfig.loggers.root.AppenderRef);
			rl.addAppender(defaultAppenderRef.appender, defaultAppenderRef.level)
		}
	} else {
		statusLogger.error('Unable to locate Appender configuration for logger ROOTLOGGER. Using default config instead')
		defaultAppenderRef = getAppenderForRef(defaultConfig.loggers.root.AppenderRef)
		rl.addAppender(defaultAppenderRef.appender, defaultAppenderRef.level)
	}
	
	//Reset all custom loggers
	var configuredLoggers = (configuration.loggers.logger||[]).slice(0)
	configuredLoggers.sort(function(a, b) { //Sorting loggers to minimize internal reconfiguration
		if (a.name > b.name) {
			return 1;
		} else if (a.name < b.name) {
			return -1;
		}
		return 0;
	})
	var configuredLoggerNames = []
	//Go through configuredLoggers and if a logger is already instantiated with the supplied name, reconfigure the logger
	for (i = 0; i < configuredLoggers.length; i++) { //
		var loggerConfig = configuredLoggers[i]
		if (!loggerConfig.hasOwnProperty('name')) {
			statusLogger.error("'name' attribute underdefined on Logger: '{}'", JSON.stringify(loggerConfig))
			continue
		}
		if (!loggers.hasOwnProperty(loggerConfig.name)) { //Not yet instantiated, so no need to reconfigure
			continue
		}	
		
		//Reconfigure the existing logger instance
		var logger = loggers[loggerConfig.name]
		
		//Reconfig Level
		logger.setLevel(loggerConfig.hasOwnProperty('level') ? Level.toLevel(loggerConfig.level) : null)
		
		//Reconfig Additivity
		if (loggerConfig.hasOwnProperty('additivity')) {
			if (typeof loggerConfig.additivity === 'boolean') {
				logger.setAdditivity(loggerConfig.additivity)
			} else {
				statusLogger.warn("Invalid value for additivity property on logger '{}': {}", loggerConfig.name, loggerConfig.additivity)
				logger.setAdditivity(true)
			}
		} else {
			logger.setAdditivity(true)
		}
		
		//Reconfig Appenders
		logger.removeAllAppenders()
		
		var appenderConfig
		if (loggerConfig.hasOwnProperty('AppenderRef')) {
			if (loggerConfig.AppenderRef instanceof Array) {
				/** @type {Array<{ref: string, level: String}>} */
				var loggerAppenders = loggerConfig.AppenderRef;
				for (var aps = 0; aps < loggerAppenders.length; aps++) {
					if (!loggerAppenders[aps].hasOwnProperty('ref')) {
						statusLogger.error("'ref' attribute not specified on Appender configured for Logger '{}'", loggerConfig.name)
						continue
					}
					appenderConfig = getAppenderForRef(loggerAppenders[aps])
					logger.addAppender(appenderConfig.appender, appenderConfig.level);
				}
			} else if (!loggerConfig.AppenderRef.hasOwnProperty('ref')) {
				statusLogger.error("'ref' attribute not specified on Appender configured for Logger '{}'", loggerConfig.name)
				continue
			} else {
				/** @type {{ref: String, level: String}} */
				var appenderRef = loggerConfig.AppenderRef;
				appenderConfig = getAppenderForRef(appenderRef);
				logger.addAppender(appenderConfig.appender, appenderConfig.level)
			}
		}
		//Save processed Logger in order to reset non-processed loggers
		configuredLoggerNames.push(loggerConfig.name)
	}
	
	//Reset already instantiated loggers to default setup if they are not in the configuration anymore
	for (var loggerName in loggers) {
		if (configuredLoggerNames.indexOf(loggerName) == -1) {
			loggers[loggerName].removeAllAppenders()
			loggers[loggerName].setLevel(null)
			loggers[loggerName].setAdditivity(true)
		}
	}
}

/**
 * @private 
 * @type {Object<AbstractAppender>}
 * @properties={typeid:35,uuid:"42790755-ECF4-4604-91DC-6DB654A73344",variableType:-4}
 */
var namedAppenders = {}

/**
 * Returns the appender with the given name (ref)
 * @param {String} appenderName
 * @return {AbstractAppender}
 * @public 
 *
 * @properties={typeid:24,uuid:"4775201B-7B56-4EB9-9634-808BF39708BA"}
 */
function getAppender(appenderName) {
	var result = getAppenderForRef({ref: appenderName});
	if (result) {
		return result.appender;
	} else {
		return null;
	}
}

/**
 * @private 
 * @param {{ref: String, level: String=}} appenderRef
 * 
 * @return {{appender: AbstractAppender, level: Level}}
 *
 * @properties={typeid:24,uuid:"E9083AE2-0B82-4515-88CC-58E1695D8EFF"}
 */
function getAppenderForRef(appenderRef) {
	if (!appenderRef) {
		statusLogger.error('getAppenderForRef called with null configuration')
		return null
	} else if (!appenderRef.ref) {
		statusLogger.error("'ref' attribute undefined on Appender configuration")
		return null
	}
	var level = appenderRef.level ? Level.toLevel(appenderRef.level) : null;
	
	if (namedAppenders.hasOwnProperty(appenderRef.ref)) {
		statusLogger.trace('Existing Appender returned for {}', appenderRef.ref)
		return {appender: namedAppenders[appenderRef.ref], level: level};
	}
	for (var j = 0; j < currentConfig.appenders.length; j++) {
		var appenderConfig = currentConfig.appenders[j]
		if (appenderConfig.name == appenderRef.ref) {
			var appenderConstructor = logPlugins[appenderConfig.type]
			
			if (!appenderConstructor || !(appenderConstructor.prototype instanceof AbstractAppender)) { //CHECKME: second check needed or is the contents of logPlugins under out direct control
				statusLogger.error('LogPlugin of type "{}" not found', appenderConfig.type)
				return null
			} else {
				/** @type {AbstractAppender} */
				var appender = getPluginInstance(appenderConfig.type, appenderConfig)
				namedAppenders[appenderRef.ref] = appender
				statusLogger.trace('Created Appender of type "{}" with name "{}"', appenderConfig.type, appenderConfig.name)
				return {appender: appender, level: level}
			}
		}
	}
	return null
}

/**
 * Generic method to create a configured instance of a LogPlugin subclass, based on the attributes of the configNode
 * @private
 * @param {String} type
 * @param {Object} configNode
 *
 * @properties={typeid:24,uuid:"CA46514A-47F4-4DF0-B880-6033387B96E2"}
 */
function getPluginInstance(type, configNode) {
	var clazz = logPlugins[type];
	
	/** @type {PLUGIN_FACTORY_TYPE_DEF} */
	var factory = clazz['PluginFactory'];
	var args = [];
	var plugin = null;
	for (var i = 0; i < factory.parameters.length; i++) { //Find the values in configNode for all the parameters specified by the factory
		var param = factory.parameters[i]
		if (configNode.hasOwnProperty(param.configName)) { //configNode attribute matches named parameter, for example "name"
			switch (typeof param.type) {
				case 'string':
				case 'boolean':
				case 'number':
					args.push(configNode[param.configName])
					break;
				default:
					if (param.type == null) {
						args.push(null)
					} else {
						plugin = logPlugins[param.type]
						if (plugin) {
							args.push(getPluginInstance(param.type, configNode[param.configName]))
						} else {
							statusLogger.warn("Unable to resolve type of '{}'", param.configName)
						}
					}
					break;
			}
		} else { //configNode Attribute matches parameter type, for example attribute 'PatternLayout' matches parameter of type 'AbstractLayout'
			var keys = Object.keys(configNode);
			var paramSet = false;
			for (var j = 0; j < keys.length; j++) {
				plugin = logPlugins[keys[j]]
				if (plugin) {
					switch (typeof param.type) {
						case 'string':
						case 'boolean':		
						case 'number':
							args.push(null);
							paramSet = true;
							break;
						default:
							if (param.type == null) {
								args.push(null)
							} else {
								if (plugin && plugin.prototype instanceof param.type) {
									args.push(getPluginInstance(keys[j], configNode[keys[j]]))
									paramSet = true
								}
							}
							break;
					}
				}
				
			}
			if (!paramSet) {
				args.push(undefined)
			}
		}
	}
	
	return factory.create.apply(factory, args)
}

/* ----------------------------------Levels------------------------------------ */
/**
 * @public
 * @constructor 
 * @properties={typeid:24,uuid:"0C200AEA-BAF4-4F93-B657-C1F0EF44268D"}
 */
function Level(level, name) {
	if (!(this instanceof Level)) {
		return new Level(level, name)
	}
	this.intLevel = level;
	this.name = name;
};

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"8CB2F193-D26E-47E7-AF91-28574067D667",variableType:-4}
 */
var initLevel = (/** @constructor */ function() {
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
		statusLogger.warn("Unable to convert '{}' to a Level", name)
			return defaultLevel||Level.DEBUG
		}
	}())

/* -------------------------------MessageFactory--------------------------------------- */
/**
 * @public 
 * @constructor 
 * @abstract
 * 
 * @properties={typeid:24,uuid:"D24859FB-64E3-48D0-AC00-D48824496F3A"}
 */
function AbstractMessageFactory() {}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"CA03143B-DE1F-40FE-9F21-7F6AD3DF03EF",variableType:-4}
 */
var initAbstractMessageFactory = (/** @constructor */ function() {
	/**
	 * @public 
	 * @param {String|Object|*} message 
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * @return {AbstractMessage}
	 */
	AbstractMessageFactory.prototype.newMessage = function(message, messageParamsOrException) {
		if (arguments.length == 1) {
			if (typeof message === 'string') {
				return new SimpleMessage(message)
			} else {
				return new ObjectMessage(message)
			}
		} else {
			return this.newFormattedMessage.apply(this, arguments)
		}
	}
	
	/**
	 * @abstract
	 * @protected
	 * @param {String|Object|*} message 
	 * @param {Error|ServoyException|*...} messageParamsOrException
	 * @return {AbstractMessage}
	 */
	AbstractMessageFactory.prototype.newFormattedMessage = function(message, messageParamsOrException) {
		return null;
	}
}())

/**
 * @public 
 * @constructor 
 * @extends {AbstractMessageFactory}
 *
 * @properties={typeid:24,uuid:"49D8E274-D50C-4423-BF8D-957EE60414C6"}
 */
function ParameterizedMessageFactory() {
	if (!(this instanceof ParameterizedMessageFactory)) {
		return new ParameterizedMessageFactory()
	}
}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"AEB56CA1-2987-4510-940A-B7201936986D",variableType:-4}
 */
var initParameterizedMessageFactory = (/** @constructor */ function() {
	ParameterizedMessageFactory.prototype = Object.create(AbstractMessageFactory.prototype)
	ParameterizedMessageFactory.prototype.constructor = ParameterizedMessageFactory

	ParameterizedMessageFactory.prototype.newFormattedMessage = function(message, params){
		return scopes.svyJSUtils.dynamicConstructorInvoker(ParameterizedMessage, Array.prototype.slice.call(arguments))
	}
}())

/**
 * @private
 * @type {AbstractMessageFactory}
 * @properties={typeid:35,uuid:"87FC8503-D5E5-4BB7-B777-3CC94617BAD7",variableType:-4}
 */
var defaultMessageFactory = new ParameterizedMessageFactory()

/* ---------------------------------Message------------------------------------- */
/**
 * TODO: documentation
 * @public 
 * @constructor
 * @abstract
 * 
 * @param {*} message
 * @param {*...} [params]
 *
 * @properties={typeid:24,uuid:"36095B79-6EF7-4449-A89E-C4867F327578"}
 */
function AbstractMessage(message, params) {
	if (this.constructor.name === 'AbstractMessage') {
		//TODO: throw an exception about invoking an Abstract Constructor
	}
	/**
	 * @protected 
	 */
	this.format = message
	//TODO: stringify the parameters, as to not cause mem-leaks or have objects altered before logging
	/**
	 * @protected 
	 */
	this.parameters = arguments.length == 1 ? null : Array.prototype.slice.call(arguments, 1)
	/**
	 * @protected 
	 */
	this.throwable = this.parameters && this.parameters.length && this.parameters.slice(-1)[0] instanceof Error ? this.parameters.slice(-1)[0] : null
}

/**
 * @private
 * @SuppressWarnings(unused)
  * @properties={typeid:35,uuid:"0960F1DA-3085-4D33-A31E-794E5F7E4F68",variableType:-4}
 */
var initAbstractMessage = (/** @constructor */ function(){
	/**
	 * @protected
	 */
	AbstractMessage.prototype.format = null

	/**
	 * @protected
	 */
	AbstractMessage.prototype.parameters = null
	
	/**
	 * @protected
	 */
	AbstractMessage.prototype.throwable = null
	
	/**
	 * @public
	 */
	AbstractMessage.prototype.getFormat = function() {
		return this.format
	}
	
	/**
	 * @public
	 * @abstract
	 * @return {String}
	 */
	AbstractMessage.prototype.getFormattedMessage = function(){
		return null
	}
	
	/**
	 * @public
	 * @return {Array<*>}
	 */
	AbstractMessage.prototype.getParameters = function(){
		return this.parameters
	}
	
	/**
	 * @public
	 * @return {Error}
	 */
	AbstractMessage.prototype.getThrowable = function(){
		return this.throwable
	}
}())

/**
 * @public
 * @constructor
 * @extends {AbstractMessage}
 * @param {String} message
 * @param {*...} params
 *
 * @properties={typeid:24,uuid:"4095E81F-AF1B-4CF8-85BF-25C03B7C7B51"}
 */
function StringFormattedMessage(message, params) {
	if (!(this instanceof StringFormattedMessage)) {
		return new StringFormattedMessage(message, params)
	}
	AbstractMessage.apply(this, arguments)
	
	/** @protected */
	this.formattedMessage = null
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"A7691A61-E4B9-4707-9034-8DDDACF36A3B",variableType:-4}
 */
var initStringformattedMessage = (/** @constructor */ function() {
	StringFormattedMessage.prototype = Object.create(AbstractMessage.prototype)
	StringFormattedMessage.prototype.constructor = StringFormattedMessage
	
	StringFormattedMessage.prototype.getFormattedMessage = function() {
		return utils.stringFormat(this.format, this.parameters)
	}
}())

/**
 * TODO: samples & docs
 * @public
 * @constructor 
 * @extends {AbstractMessage}
 * @param {String} message
 * @param {*...} params
 *
 * @properties={typeid:24,uuid:"2B246023-42C8-45AB-8C18-C8D34E416741"}
 */
function ParameterizedMessage(message, params) {
	if (!(this instanceof ParameterizedMessage)) {
		return new ParameterizedMessage(message, params)
	}
	AbstractMessage.apply(this, arguments)
	
	/** @protected */
	this.formattedMessage = null
}

/** 
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"F678ABD1-57B4-4319-9772-F084F223BAF6",variableType:-4}
 */
var initParameterizedMessage = (/** @constructor */ function() {
	ParameterizedMessage.prototype = Object.create(AbstractMessage.prototype)
	ParameterizedMessage.prototype.constructor = ParameterizedMessage

	/**
	 * TODO license message, see http://logging.apache.org/log4j/2.x/log4j-api/apidocs/src-html/org/apache/logging/log4j/message/ParameterizedMessage.html#line.31
	 * @this {ParameterizedMessage}
	 */
	ParameterizedMessage.prototype.getFormattedMessage = function() {
		if (this.formattedMessage === null) {
			
			if (this.format == null || this.parameters == null || this.parameters.length == 0) {
                return this.formattedMessage = this.format;
            }
			var messagePattern = this.format
    
            var DELIM_START = '{';
            var DELIM_STOP = '}';
            var ESCAPE_CHAR = '\\';
            
            var result = ''
            var escapeCounter = 0;
            var currentArgument = 0;
            for (var i = 0; i < messagePattern.length; i++) {
                var curChar = messagePattern.charAt(i);
                if (curChar == ESCAPE_CHAR) {
                    escapeCounter++;
                } else {
                    if (curChar == DELIM_START) {
                        if (i < messagePattern.length - 1) {
                            if (messagePattern.charAt(i + 1) == DELIM_STOP) {
                                // write escaped escape chars
                                var escapedEscapes = escapeCounter / 2;
                                for (var j = 0; j < escapedEscapes; j++) {
                                    result += ESCAPE_CHAR;
                                }
    
                                if (escapeCounter % 2 == 1) {
                                    // i.e. escaped
                                    // write escaped escape chars
                                    result += DELIM_START;
                                    result += DELIM_STOP;
                                } else {
                                    // unescaped
                                    if (currentArgument < this.parameters.length) {
                                        result += this.parameters[currentArgument];
                                    } else {
                                        result += DELIM_START + DELIM_STOP;
                                    }
                                    currentArgument++;
                                }
                                i++;
                                escapeCounter = 0;
                                continue;
                            }
                        }
                    }
                    // any other char beside ESCAPE or DELIM_START/STOP-combo
                    // write unescaped escape chars
                    if (escapeCounter > 0) {
                        for (j = 0; j < escapeCounter; j++) {
                            result += ESCAPE_CHAR;
                        }
                        escapeCounter = 0;
                    }
                    result += curChar;
                }
            }
            this.formattedMessage = result
			//-------------------
		}
		return this.formattedMessage
	}
}())

/**
 * @public
 * @constructor 
 * @extends {AbstractMessage}
 *
 * @properties={typeid:24,uuid:"3BA243D7-8B29-40BC-B03B-C42A1C9ED1FA"}
 */
function SimpleMessage(message) {
	if (!(this instanceof SimpleMessage)) {
		return new SimpleMessage(message)
	}
	AbstractMessage.apply(this, arguments)
}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"2BAE5202-1155-4923-B40F-72A7ADF26F77",variableType:-4}
 */
var initSimpleMessage = (/** @constructor */ function() {
	SimpleMessage.prototype = Object.create(AbstractMessage.prototype)
	SimpleMessage.prototype.constructor = SimpleMessage
	
	SimpleMessage.prototype.getFormattedMessage = function() {
		return this.format
	}
}())

/**
 * @public
 * @constructor 
 * @extends {AbstractMessage}
 *
 * @properties={typeid:24,uuid:"835EDA8E-FE17-4746-8D30-EDDFFE3DFF95"}
 */
function ObjectMessage(object) {
	if (!(this instanceof ObjectMessage)) {
		return new ObjectMessage(object)
	}
	AbstractMessage.apply(this, arguments)
}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"6D980F77-FB92-475E-8895-6BA8C01B59A0",variableType:-4}
 */
var initObjectMessage = (/** @constructor */ function() {
	ObjectMessage.prototype = Object.create(AbstractMessage.prototype)
	ObjectMessage.prototype.constructor = ObjectMessage
	
	ObjectMessage.prototype.getFormat = function() {
		return typeof this.format.toString === 'function' ? this.format.toString() : '' + this.format
	}
	
	ObjectMessage.prototype.getFormattedMessage = function() {
		return this.format === undefined ? 'undefined' : this.format === null ? 'null' : typeof this.format.toString === 'function' ? this.format.toString() : '' + this.format
	}

	ObjectMessage.prototype.getParameters = function() {
		return [this.format]
	}
	
	ObjectMessage.prototype.getThrowable = function() {
		return (this.format instanceof Error || this.format instanceof ServoyException) ? this.format : null
	}
}())

/* ----------------------------------Loggers------------------------------------ */
/**
 * TODO: the mechanism of Logger and LoggerConfig can be optimized even further: 
 * instances are only needed for Loggers that are defined in the config 
 * and all instantiated loggers use the LoggerConfig of the closest parent that is configured.
 * Logger instances that are not backed by config receive all their settings from a parent that is backed by config anyway
 * @private
 * @constructor
 * @this {LoggerConfig}
 *
 * @param {String} name
 * @param {AbstractMessageFactory} [messageFactory]
 * @param {Logger} [logger] Optional Logger, used when reconfiguring existing loggers
 *
 * @properties={typeid:24,uuid:"1086E0C7-EE0E-4A8B-B208-9E27A4057B9F"}
 */
function LoggerConfig(name, messageFactory, logger) {
	/**
	 * @type {Level}
	 */
	this.effectiveLevel = null
	
	/**
	 * @type {LoggerConfig}
	 */
	this.parent = null;
	/**
	 * @protected
	 * @type {Array<LoggerConfig>}
	 */
	this.children = [];
	
	/** 
	 * @protected 
	 * @type {Array<{appender: AbstractAppender, level: Level}>}
	 * */
	this.appenders = [];
	
	/**
	 * @protected
	 * @type {Level}
	 */
	this.loggerLevel = null;
	this.isRoot = (name === ROOT_LOGGER_NAME);
	
	/**
	 * @protected
	 */
	this.appenderCache = null;
	/**
	 * @protected
	 */
	this.appenderCacheInvalidated = false;

	/** 
	 * @type {String}
	 */
	this.name = name

	// Additivity
	/**
	 * @protected 
	 */
	this.additive = true;
	
	/**
	 * @type {Logger}
	 */
	this.externalLogger = logger ? Logger.call(logger, this) : new Logger(this, messageFactory)
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"0F992E15-B252-4AC8-9041-F2AF6A132DE2",variableType:-4}
	 */
var initLoggerConfig = (/** @constructor */ function(){
	LoggerConfig.prototype = Object.create(LogPlugin.prototype)
	LoggerConfig.prototype.constructor = LoggerConfig
	
	/**
	 * Get the additivity flag for this Logger instance<br>
	 * <br>
	 * @public
	 * @return {Boolean}
	 */
	LoggerConfig.prototype.getAdditivity = function() {
		return this.additive;
	};

	/**
	 * Sets whether appender additivity is enabled (the default) or disabled. If set to false, this particular logger will not inherit any appenders form its ancestors. Any descendant of this logger, however, will inherit from its ancestors as normal, unless its own additivity is explicitly set to false.<br>
	 * <br>
	 * Default value is true<br>
	 * <br>
	 * @public
	 * @this {LoggerConfig}
	 * @param {Boolean} additivity
	 */
	LoggerConfig.prototype.setAdditivity = function(additivity) {
		var valueChanged = (this.additive != additivity);
		this.additive = additivity;
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
	 * @param {Level} [level]
	 */
	LoggerConfig.prototype.addAppender = function(appender, level) {
		if (!(appender instanceof AbstractAppender)) {
			statusLogger.error("Logger.addAppender: appender supplied ('{}') is not a subclass of Appender", appender);
			return;
		}
		if (level && !(level instanceof Level)) {
			statusLogger.error("Logger.addAppender: level supplied ('{}') is not a subclass of Level", level);
			return;
		}
		for (var x = this.appenders.length - 1 ; x >= 0 ; x--) {
			if (this.appenders[x].appender.appenderName == appender.appenderName) {
				return;
			}
		}
		this.appenders.push({appender: appender, level: level ? level : null});
		this.invalidateAppenderCache();
	};
	
	/**
	 * @public 
	 * @param {String} appenderName
	 */
	LoggerConfig.prototype.getAppender = function(appenderName) {
		var retval = null
		this.appenders.some(function(elementValue, elementIndex, traversedArray){
			if (elementValue.appender.getName() == appenderName) {
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
	LoggerConfig.prototype.getAllAppenders = function() {
		return this.appenders.slice(0)
	}

	/**
	 * Removes the given appender<br>
	 * <br>
	 * @public
	 * @param {AbstractAppender} appender
	 */
	LoggerConfig.prototype.removeAppender = function(appender) {
		for (var x = this.appenders.length - 1 ; x >= 0 ; x--) {
			if (this.appenders[x].appender.appenderName == appender.appenderName) {
				this.appenders.splice(x,1)
			}
		}
		//appender.setRemovedFromLogger(this);
		this.invalidateAppenderCache();
	};

	/**
	 * Clears all appenders for the current logger<br>
	 * <br>
	 * @public
	 * @this {LoggerConfig}
	 */
	LoggerConfig.prototype.removeAllAppenders = function() {
//		var appenderCount = appenders.length;
//		if (appenderCount > 0) {
//			for (var i = 0; i < appenderCount; i++) {
//				appenders[i].setRemovedFromLogger(this);
//			}
			this.appenders.length = 0;
			this.invalidateAppenderCache();
//		}
	};

	/**
	 * @return {Array<{appender: AbstractAppender, level: Level}>}
	 */
	LoggerConfig.prototype.getEffectiveAppenders = function() {
		if (this.appenderCache === null || this.appenderCacheInvalidated) {
			// Build appender cache
			var parentEffectiveAppenders = (this.isRoot || !this.getAdditivity()) ? [] : this.parent.getEffectiveAppenders();
			this.appenderCache = parentEffectiveAppenders.concat(this.appenders);
			this.appenderCacheInvalidated = false;
		}
		return this.appenderCache;
	};
	
//	this.isAttached = function(){}

	/**
	 * @this {LoggerConfig}
	 */
	LoggerConfig.prototype.invalidateAppenderCache = function() {
		this.appenderCacheInvalidated = true;
		for (var i = 0, len = this.children.length; i < len; i++) {
			this.children[i].invalidateAppenderCache();
		}
	};

	/**
	 * @public 
	 */
	LoggerConfig.prototype.getParent = function(){
		return this.parent
	}

	/**
	 * @this {LoggerConfig}
	 * @param {LoggerConfig} childLogger
	 */
	LoggerConfig.prototype.addChild = function(childLogger) {
		//Check existing children and see if they need to become a child of childLogger instead
		var childName = childLogger.name + '.'
		for (var i = 0; i < this.children.length; i++) {
			if(this.children[i].name.substring(0, childName.length) == childName) {
				var childToMove = this.children.splice(i,1)[0]
				childLogger.addChild(childToMove)
				childToMove.parent = childLogger
				childToMove.invalidateAppenderCache();
			}
		}
		this.children.push(childLogger);
		childLogger.parent = this;
		childLogger.invalidateAppenderCache();
	};
	
	/**
	 * @this {LoggerConfig}
	 * @param {Level} level
	 * @param {AbstractMessage} message 
	 */
	LoggerConfig.prototype.log = function(level, message) {
		var loggingEvent = new LoggingEvent(this, new Date(), level, message);

		var effectiveAppenders = this.getEffectiveAppenders();
		for (var i = 0; i < effectiveAppenders.length; i++) {
			var effectiveAppender = effectiveAppenders[i];
			if (!effectiveAppender.level || (loggingEvent.level.intLevel >= effectiveAppender.level.intLevel)) {
				effectiveAppender.appender.doAppend(loggingEvent);
			}
		}
	}
	
//	/**
//	 * Call the appenders in the hierarchy starting at this. If no appenders could be found, emit a warning<br>
//	 * <br>
//	 * This method calls all the appenders inherited from the hierarchy circumventing any evaluation of whether to log or not to log the particular log request<br>
//	 * <br>
//	 * @public 
//	 * @param {LoggingEvent} loggingEvent
//	 */
//	this.callAppenders = function(loggingEvent) {
//		var effectiveAppenders = this.getEffectiveAppenders();
//		for (var i = 0; i < effectiveAppenders.length; i++) {
//			effectiveAppenders[i].doAppend(loggingEvent);
//		}
//	};
	
	/**
	 * Sets the level. Log messages of a lower level than level will not be logged. Default value is DEBUG<br>
	 * <br>
	 * @public
	 * @this {LoggerConfig}
	 * @param {Level} level
	 */
	LoggerConfig.prototype.setLevel = function(level) {
		// Having a level of null on the root logger would be very bad.
		if (this.isRoot && level === null) {
			statusLogger.error("Logger.setLevel: you cannot set the level of the root logger to null");
		} else if (level === this.loggerLevel) { 
			return
		} else if (level instanceof Level || level === null) {
			this.loggerLevel = level;
			this.setEffectiveLevel(level||this.getParent().effectiveLevel)
		} else {
			statusLogger.error("Logger.setLevel: level supplied to logger {} is not an instance of Level", this.name);
		}
	}

	/**
	 * Returns the level explicitly set for this logger or null if none has been set<br>
	 * <br>
	 * @public 
	 * @this {LoggerConfig}
	 * @return {Level}
	 */
	LoggerConfig.prototype.getLevel = function() {
		return this.loggerLevel;
	};

	/**
	 * @this {LoggerConfig}
	 * @param {Level} level
	 */
	LoggerConfig.prototype.setEffectiveLevel = function(level) {
		statusLogger.trace('Setting effectiveLevel on "{}" to {}', this.name, level)
		this.effectiveLevel = level
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].setEffectiveLevel(level)
		}
	}
	
//	/**
//	 * Returns the level at which the logger is operating. This is either the level explicitly set on the logger or, if no level has been set, the effective level of the logger's parent<br>
//	 * <br>
//	 * @public
//	 * @return {Level}
//	 */
//	this.getEffectiveLevel = function() {
//		return this.effectiveLevel;
//	}

	/**
	 * @return {String}
	 */
	LoggerConfig.prototype.toString = function() {
		return "Logger[" + this.name + "]";
	};
	
	//TODO: this PluginFactory is not yet used anywhere
	LoggerConfig.PluginFactory = function(config) {
//		var retval = new LoggerConfig(config.name)
//
//		var keys = Object.keys(config)
//		for (var index = 0; index < keys.length; index++) {
//			var key = keys[index]
//			switch (key) {
//				case 'type':
//					break;
//				case 'name':
//					retval.name = config.name
//					break
//				case 'threshold':
//					retval.setThreshold(Level.toLevel(config.threshold))
//					break;
//				default:
//					var plugin = logPlugins[key]
//					if (plugin) {
//						if (plugin.prototype instanceof AbstractLayout) {
//							retval.setLayout(plugin['PluginFactory'](config[key]))
//						} else {
//							//Unknown plugin type
//						}
//					} else {
//						//Unknown config entry
//					}
//					break;
//			}
//		}
//		return retval
	}
}())

/**
 * @typedef {{
 * 	name: String,
 *  effectiveLevel: Level,
 *  log: function(Level, AbstractMessage)
 * }}
 * 
 * @private 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"008FD40C-B8C7-4458-B7C3-E68C68B00319",variableType:-4}
 */
var ILogConfig

/**
 * TODO: add docs and samplecode
 * @private
 * @constructor 
 * @param {ILogConfig} internal
 * @param {AbstractMessageFactory} [messageFactory]
 *
 * @properties={typeid:24,uuid:"118575D2-E51F-4294-97AE-E5F515B7A821"}
 */
function Logger(internal, messageFactory) {
	/* CHECKME: when implementing shared LoggerConfigs, need to think of a way to properly set a new "LogConfig" on already instantiated Loggers, 
	 * without loosing state like the customMessageFactory or ideally without creating all the methods again,
	 * but all this without exposing a public setter method
	 */
	var customMessageFactory = messageFactory
	
	var isRoot = (this.name === ROOT_LOGGER_NAME);

	/**
	 * Generic logging method<br>
	 * <br>
	 * @public 
	 * @param {Level} level
	 * @param {AbstractMessage|String|Object|*} message 
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 */
	this.log = function(level, message, messageParamsOrException) {
		if (level.intLevel >= internal.effectiveLevel.intLevel) {
			
			if (arguments.length == 2 && message instanceof AbstractMessage) {
				/**@type {AbstractMessage}*/
				var msg = message
				internal.log(level, msg)
			} else {
				var args = Array.prototype.slice.call(arguments, 1)
				var lastParam = args[args.length - 1]
				if (lastParam instanceof ServoyException || lastParam instanceof Packages.java.lang.Exception) {
					/**@type {ServoyException|Packages.java.lang.Exception}*/
					var ex = lastParam
					args[args.length - 1] = new scopes.svyExceptions.ServoyError(ex)				
				}
			
				internal.log(level, (customMessageFactory||defaultMessageFactory).newMessage.apply(customMessageFactory||defaultMessageFactory, args))
			}
		}
	}
	
	/**
	 * Logs a message and optionally an error at level TRACE<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.trace("Logged user {} has complete the action {}", security.getUserName(), "log a trace message");
	 * 
	 * var e = new Error("My error message");
	 * log.trace("Logging the exception message: {} ", e);
	 * </pre> 
	 */
	this.trace = function(message, messageParamsOrException) {
		if (Level.TRACE.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.TRACE)
			this.log.apply(this, args)
		}
	}
	/**
	 * Logs a message and optionally an error at level DEBUG<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.debug("Logged user {} has complete the action {}", security.getUserName(), "log a debug message");
	 * 
	 * var e = new Error("My error message");
	 * log.debug("Logging the exception message: {} ", e);
	 * </pre>
	 * 
	 */
	this.debug = function(message, messageParamsOrException) {
		if (Level.DEBUG.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.DEBUG)
			this.log.apply(this, args)
		}
	}
	/**
	 * Logs a message and optionally an error at level INFO<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.info("Logged user {} has complete the action {}", security.getUserName(), "log an info message");
	 * 
	 * var e = new Error("My error message");
	 * log.info("Logging the exception message: {} ", e);
	 * </pre>
	 */
	this.info = function(message, messageParamsOrException) {
		if (Level.INFO.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.INFO)
			this.log.apply(this, args)
		}			
	}
	/**
	 * Logs a message and optionally an error at level WARN<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.warn("Logged user {} has complete the action {}", security.getUserName(), "log a warn message");
	 * 
	 * var e = new Error("My error message");
	 * log.warn("Logging the exception message: {} ", e);
	 * </pre>
	 */
	this.warn = function(message, messageParamsOrException) {
		if (Level.WARN.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.WARN)
			this.log.apply(this, args)
		}			
	}
	/**
	 * Logs a message and optionally an error at level ERROR<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.error("Logged user {} has complete the action {}", security.getUserName(), "log an error message");
	 * 
	 * var e = new Error("My error message");
	 * log.error("Logging the exception message: {} ", e);
	 * </pre>
	 */
	this.error = function(message, messageParamsOrException) {
		if (Level.ERROR.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.ERROR)
			this.log.apply(this, args)
		}			
	}
	/**
	 * Logs a message and optionally an error at level FATAL<br>
	 * <br>
	 * @public
	 * @param {AbstractMessage|String|Object|*} message
	 * @param {Error|ServoyException|*...} [messageParamsOrException]
	 * 
	 * @example <pre>
	 * var log = scopes.svyLogManager.getLogger('com.servoy.example');
	 * log.fatal("Logged user {} has complete the action {}", security.getUserName(), "log a fatal message");
	 * 
	 * var e = new Error("My error message");
	 * log.fatal("Logging the exception message: {} ", e);
	 * </pre>
	 */
	this.fatal = function(message, messageParamsOrException) {
		if (Level.FATAL.intLevel >= internal.effectiveLevel.intLevel) {
			var args = Array.prototype.slice.call(arguments)
			args.unshift(Level.FATAL)
			this.log.apply(this, args)
		}
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
	
	/**
	 * Returns whether additivity is enabled for this logger.
	 * @return {Boolean}
	 * @public 
	 */
	this.getAdditivity = function() {
		var logger = loggers[internal.name];
		return logger.getAdditivity();
	}

	/**
	 * Returns the name of this logger
	 * @public
	 */
	this.getName = function() {
		return internal.name
	}
	
	/**
	 * Sets whether appender additivity is enabled (the default) or disabled. 
	 * If set to false, this particular logger will not inherit any appenders 
	 * form its ancestors. Any descendant of this logger, however, will inherit 
	 * from its ancestors as normal, unless its own additivity is explicitly set to false.
	 * @param {Boolean} additivity
	 * @return {Logger}
	 * @public
	 */
	this.setAdditivity = function(additivity) {
		var logger = loggers[internal.name];
		logger.setAdditivity(additivity);
		return this;
	}
	
	/**
	 * Sets the level. Log messages of a lower level than level will not be logged. Default value is DEBUG.
	 * @param {String|Level} level
	 * @return {Logger}
	 * @public 
	 */
	this.setLevel = function(level) {
		var levelToSet = level;
		if (level instanceof String) {
			/** @type {String} */
			var levelString = level;
			levelToSet = Level.toLevel(levelString);
		}
		// Having a level of null on the root logger would be very bad.
		if (isRoot && level === null) {
			statusLogger.error("Logger.setLevel: you cannot set the level of the root logger to null");
		} else if (levelToSet instanceof Level) {
			var logger = loggers[internal.name];
			logger.setLevel(levelToSet);
		} else {
			statusLogger.error("Logger.setLevel: level supplied to logger {} is not an instance of Level", internal.name);
		}
		return this;
	};
	
	/**
	 * Adds an appender to this logger
	 * @param {AbstractAppender} appender
	 * @param {String|Level} [level]
	 * @return {Logger}
	 * @public 
	 */
	this.addAppender = function(appender, level) {
		var levelToSet = level;
		if (level instanceof String) {
			/** @type {String} */
			var levelString = level;
			levelToSet = Level.toLevel(levelString);
		}
		if (! (appender instanceof AbstractAppender)) {
			statusLogger.error("Logger.addAppender: appender supplied ('{}') is not a subclass of Appender", appender);
			return this;
		} else if (levelToSet && ! (levelToSet instanceof Level)) {
			statusLogger.error("Logger.addAppender: level supplied ('{}') is not a subclass of Level", levelToSet);
			return this;
		}
		var logger = loggers[internal.name];
		logger.addAppender(appender, levelToSet);
		return this;
	};
	
	/**
	 * Removes an appender from this logger
	 * @param {AbstractAppender} appender
	 * @return {Logger}
	 * @public 
	 */
	this.removeAppender = function(appender) {
		if (appender instanceof AbstractAppender) {
			var logger = loggers[internal.name];
			logger.removeAppender(appender);
		} else {
			statusLogger.error("Logger.removeAppender: appender supplied ('{}') is not a subclass of Appender", appender);
		}
		return this;
	};
	
	/**
	 * Removes all appenders from this logger
	 * @return {Logger}
	 * @public 
	 */
	this.removeAllAppenders = function() {
		var logger = loggers[internal.name];
		logger.removeAllAppenders();
		return this;		
	}

	/**
	 * Returns the level explicitly set for this logger or null if none has been set
	 * @return {Level}
	 * @public 
	 */
	this.getLevel = function() {
		var logger = loggers[internal.name];
		return logger.getLevel();
	};

	/**
	 * Returns the level at which the logger is operating. This is either the level 
	 * explicitly set on the logger or, if no level has been set, the effective 
	 * level of the logger's parent.
	 * @return {Level}
	 * @public 
	 */
	this.getEffectiveLevel = function() {
		var logger = loggers[internal.name];
		return logger.effectiveLevel
	};	
}

/** 
 * Hashtable of loggers keyed by logger name
 * 
 * TODO: should be a WeakMap to unreferenced loggers are GC. Currently Loggers hold a direct reference to their parent and children, so this wouldn't help.
 * @private
 * @type {Object<LoggerConfig>}
 * @properties={typeid:35,uuid:"0F49DC42-01BC-4720-B19F-DA1B30BF9D1E",variableType:-4}
 */
var loggers = {};

/**
* @public
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
 * @type {LoggerConfig}
 * @properties={typeid:35,uuid:"8FD01917-2F91-4033-A373-C6B8476A6476",variableType:-4}
 */
var rootLogger

/**
 * @private
 * @properties={typeid:24,uuid:"AB765A70-AFE5-408F-8DA2-AC05200BD87B"}
 */
function getRootLoggerConfig() {
	if (!rootLogger) {
		//TODO: RootLogger config should be read from the config
		rootLogger = new LoggerConfig(ROOT_LOGGER_NAME);
		rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
		var appender = new ApplicationOutputAppender()
		appender.layout = new PatternLayout('%5level %msg')
		rootLogger.addAppender(appender) 
	}
	return rootLogger;
}

/**
 * Returns a logger with the specified name, creating it if a logger with that name does not already exist<br>
 * <br>
 * Optionally a instance of a MessageFactory can be provided. A MessageFactory determines how a log statement with additional parameters gets converted to an actual log message.<br>
 * By default the {@link ParameterizedMessageFactory} is used<br>
 * <br>
 * Note that the name 'root' is reserved for the root logger<br>
 * <br>
 * @public
 * @param {String} loggerName
 * @param {AbstractMessageFactory} [messageFactory]
 * @return {Logger}
 *
 * @properties={typeid:24,uuid:"B8C91C9F-3D84-4CC7-8228-EA6D5A975FE0"}
 */
function getLogger(loggerName, messageFactory) {
	if (!loggerName || typeof loggerName !== "string") {
		throw scopes.svyExceptions.IllegalArgumentException('non-string logger name "' + loggerName + '" supplied')
	}

	if (loggerName == ROOT_LOGGER_NAME) {
		return (rootLogger||getRootLoggerConfig()).externalLogger
	}

	// Create the logger for this name if it doesn't already exist
	if (!loggers[loggerName]) {
		var logger = new LoggerConfig(loggerName, messageFactory)
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
								statusLogger.trace('Setting level on "{}" to {}', loggerName, logConfig.level)
								logger.setLevel(Level.toLevel(logConfig.level))
								break;
							case 'additivity':
								logger.setAdditivity(logConfig.hasOwnProperty('additivity') && typeof logConfig.additivity === 'boolean' ? logConfig.additivity : true)
								break;
							case 'AppenderRef':
								if (logConfig.AppenderRef instanceof Array) {
									/** @type {Array<{ref: String, level: String}>} */
									var appArray = logConfig.AppenderRef;
									for (var a = 0; a < appArray.length; a++) {
										/** @type {{appender: AbstractAppender, level: Level}} */
										var appArrayItem = getAppenderForRef(appArray[a]);
										logger.addAppender(appArrayItem.appender, appArrayItem.level);
									}
								} else {
									/** @type {{ref: String, level: String}} */
									var appRef = logConfig.AppenderRef;
									/** @type {{appender: AbstractAppender, level: Level}} */
									var appRefItem = getAppenderForRef(appRef);
									logger.addAppender(appRefItem.appender, appRefItem.level);
								}
								break;
							default:
								//TODO: log unknown config keys
								break;
						}
					}
				}
			}
		}
		statusLogger.trace('Getting parent for "{}"', loggerName)
		/*
		 * FIXME: The parent lookup is looking for instantiated loggers only. 
		 * If configuration is provided for a parent logger, but it is not yet instantiated, the parent lookup doesn't take this into account and continues onto the rootlogger.
		 * 
		 * This ties into other TODO's about shared LoggerConfigs: There should only be LoggerConfigs instantiated for logger defined in the configuration: all Loggers (re)use the closest LoggerConfig
		 */
		var parentName = loggerName
		var parent
		while (!parent && parentName) {
			parentName = parentName.substring(0, parentName.lastIndexOf("."));
			parent = loggers[parentName]
		}
		parent = parent||getRootLoggerConfig()
		statusLogger.trace('Found parent is "{}"', parent.name)
		if (!logger.getLevel()) {
			logger.setEffectiveLevel(parent.effectiveLevel)
		}
		parent.addChild(logger)
		return logger.externalLogger;
	}
	//TODO: add warnings when returning existing logger and a messageFactory was provided that is different than the one with which the logger was previously requested.
	//See checkMessageFactory in Log4J's AbstractLogger 
	return loggers[loggerName].externalLogger;
}

/**
 * Returns all loggers created
 * @return {Array<Logger>}
 * @properties={typeid:24,uuid:"68414983-8B0C-498D-B34B-EE66037B03DF"}
 */
function getLoggers() {
	var result = [];
	for (var i in loggers) {
		result.push(loggers[i].externalLogger);
	}
	function sortLoggers(l1, l2) {
		if (l1.getName() > l2.getName()) return 1;
		else if (l1.getName() < l2.getName()) return -1;
		else return 0;
	}
	return result.sort(sortLoggers);
}

/* ---------------------------------Logging events------------------------------------- */
/**
 * @private
 * @constructor
 *
 * @param {LoggerConfig} logger
 * @param {Date} timeStamp
 * @param {Level} level
 * @param {AbstractMessage} message
 *
 * @properties={typeid:24,uuid:"40428863-BCA7-42D5-9B8D-D276C1A00B5F"}
 */
function LoggingEvent(logger, timeStamp, level, message) {
	this.logger = logger
	this.timeStamp = timeStamp
	this.timeStampInMilliseconds = timeStamp.getTime()
	this.timeStampInSeconds = Math.floor(this.timeStampInMilliseconds / 1000)
	this.milliseconds = this.timeStamp.getMilliseconds()
	this.level = level
	/**
	 * @type {AbstractMessage}
	 */
	this.message = message
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"6BE6F430-807C-4673-85CC-055DFE1DD45F",variableType:-4}
 */
var initLoggingEvent = (/** @constructor */ function() {
	LoggingEvent.prototype = {
		getThrowableStrRep: function() { //CHECKME This seems to not get called from anywhere
			return this.exception ? getExceptionStringRep(this.exception) : "";
		},
		toString: function() {
			return "LoggingEvent[" + this.level + "]";
		}
	};
}())

/* -------------------------------LogPlugin prototype--------------------------------------- */
/**
 * Empty base class for all classes that are to be configurable Log components</br>
 * Each LogPlugin subclass must provide a static PluginFactory method that takes a config snippet as parameter and returns an instance of itself
 * @constructor
 * @public
 * @properties={typeid:24,uuid:"B7FBEA4D-EF81-4471-846A-193E058267A1"}
 */
function LogPlugin (){}

/**
 * @typedef {{
 *  create: Function,
 *  parameters: Array<{configName: String, type: *}>
 * }}
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"278F3AAE-604B-4685-AA3E-B4317E553D24",variableType:-4}
 */
var PLUGIN_FACTORY_TYPE_DEF

/**
 * Map holding all LogPlugin constructors by name. the constructor functions must be extending LogPlugin
 * @private 
 * @type {Object<Function>}
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
 * @abstract
 * @extends {LogPlugin}
 *
 * @properties={typeid:24,uuid:"347251D0-84E5-40FE-8ED9-45CB3FE7FB4A"}
 */
function AbstractAppender() {
	this.appenderName = null
	
	this.layout = new PatternLayout(); //CHECKME: does this need to be initialized to a PatternLayout w/o any pattern?
	this.threshold = Level.ALL;
};

/**
 * @private 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"8B52A861-1DDF-487E-9C89-94551992722F",variableType:-4}
 */
var initAbstractAppender = (/** @constructor */ function(){
	AbstractAppender.prototype = Object.create(LogPlugin.prototype)
	AbstractAppender.prototype.constructor = AbstractAppender
	
	/**
	 * Checks the logging event's level is at least as severe as the appender's threshold and calls the appender's append method if so.<br>
	 * <br>
	 * This method should not in general be used directly or overridden<br>
	 * <br>
	 * @public 
	 * @param {LoggingEvent} loggingEvent
	 */
	AbstractAppender.prototype.doAppend = function(loggingEvent) {
		
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
	AbstractAppender.prototype.append = function(loggingEvent) {};
	
	/**
	 * Sets the appender's layout<br>
	 * <br>
	 * @public 
	 * @this {AbstractAppender}
	 * @param {AbstractLayout} layout
	 */
	AbstractAppender.prototype.setLayout = function(layout) {
		if (layout instanceof AbstractLayout) {
			this.layout = layout;
		} else {
			statusLogger.error("Appender.setLayout: layout supplied to {} is not a subclass of Layout", this.toString());
		}
	};

	/**
	 * Returns the appender's layout<br>
	 * <br>
	 * @public
	 * @this {AbstractAppender}
	 * @return {AbstractLayout}
	 */
	AbstractAppender.prototype.getLayout = function() {
		return this.layout;
	};

	/**
	 * Sets the appender's threshold. Log messages of level less severe than this threshold will not be logged<br>
	 * <br>
	 * @public
	 * @this {AbstractAppender}
	 * @param {Level} threshold
	 */
	AbstractAppender.prototype.setThreshold = function(threshold) {
		if (threshold instanceof Level) {
			this.threshold = threshold;
		} else {
			statusLogger.error("Appender.setThreshold: threshold supplied to {} is not a subclass of Level", this.toString());
		}
	};
	
	AbstractAppender.prototype.getName = function() {
		return this.appenderName;
	}
	
	AbstractAppender.prototype.setName = function(name) {
		this.appenderName = name
	}

	/**
	 * @public
	 * @return {String}
	 */
	AbstractAppender.prototype.toString = function() {
		statusLogger.error("Appender.toString: all appenders must override this method");
		return null
	};
	
	AbstractAppender.PluginFactory = function(config) {
		//TODO raise warning when called
	}
}())

/**
 * Simple Appender that performs application.output<br>
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * @private 
 * @constructor 
 * @extends {AbstractAppender}
 *
 * @properties={typeid:24,uuid:"4500F0BF-BB5B-4D4C-868A-611335B3AD71"}
 */
function ApplicationOutputAppender() {
	AbstractAppender.call(this);
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"CCE870E3-C277-473F-9332-5B2EC5597282",variableType:-4}
 */
var initApplicationOutputAppender = (/** @constructor */ function(){
	ApplicationOutputAppender.prototype = Object.create(AbstractAppender.prototype);
	ApplicationOutputAppender.prototype.constructor = ApplicationOutputAppender
	
	/**
	 * @this {ApplicationOutputAppender}
	 * @param {LoggingEvent} loggingEvent
	 */
	ApplicationOutputAppender.prototype.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl == LOGGINGLEVEL.FATAL) { //ERROR because Servoy does not output FATAL in red
			lvl = LOGGINGLEVEL.ERROR 
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return 
		}
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
        var msg = this.layout.format(loggingEvent)
		var ex = loggingEvent.message.getThrowable()
		if (ex) {
			msg = msg.replace(/\r?\n$/g,'')
        	msg += NEW_LINE + ex.name + ': ' + ex.message
        	var stack = ex.stack
			if (stack) {
				msg += NEW_LINE + stack
        	}
		}
        msg = msg.replace(/\r?\n$/g,'')
        application.output(msg, lvl)
    }
	
    ApplicationOutputAppender.prototype.toString = function() {
    	return 'ApplicationOutputAppender'
    }
	
	logPlugins['ApplicationOutputAppender'] = ApplicationOutputAppender
	
	ApplicationOutputAppender.PluginFactory = {
		parameters: [{
				configName: 'name',
				type: 'string'
			}, {
				configName: 'Layout',
				type: AbstractLayout
			}
		],
		
		/**
		 * @param {String} name
		 * @param {AbstractLayout} layout
		 * @return {ApplicationOutputAppender}
		 */
		create: function(name, layout) {
			var retval = new ApplicationOutputAppender()
			retval.setName(name)
			retval.setLayout(layout)
			return retval
		}
	}
}())

/* -------------------------------Layout prototype--------------------------------------- */
/**
 * Abstract Layout implementation to be extended for actual Layouts
 * @public 
 * @constructor
 * @abstract
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
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"994AF0DE-AA41-453A-B2E0-61047DBFC751",variableType:-4}
 */
var initAbstractLayout = (/** @constructor */ function() {
	AbstractLayout.prototype = Object.create(LogPlugin.prototype)
	AbstractLayout.prototype.constructor = AbstractLayout
	
	/**
	 * @public
	 * @abstract
	 * @param {LoggingEvent} logEvent
	 * @return {String}
	 */
	AbstractLayout.prototype.format = function(logEvent) {
		statusLogger.error("Layout.format: layout supplied has no format() method")
		return null
	}

	/**
	 * @public
	 * @abstract
	 */
	AbstractLayout.prototype.ignoresThrowable = function() {
		statusLogger.error("Layout.ignoresThrowable: layout supplied has no ignoresThrowable() method");
	}
	/**
	 * @public
	 * @abstract
	 */
	AbstractLayout.prototype.toString = function() {
		statusLogger.error("Layout.toString: all layouts must override this method");
	}

	AbstractLayout.prototype.getContentType = function() {
		return "text/plain";
	}

	AbstractLayout.prototype.allowBatching = function() {
		return true;
	}

	/**
	 * @param {Boolean} timeStampsInMilliseconds
	 */
	AbstractLayout.prototype.setTimeStampsInMilliseconds = function(timeStampsInMilliseconds) {
		this.overrideTimeStampsSetting = true;
		this.useTimeStampsInMilliseconds = timeStampsInMilliseconds
	}

	AbstractLayout.prototype.isTimeStampsInMilliseconds = function() {
		return this.overrideTimeStampsSetting ? this.useTimeStampsInMilliseconds : useTimeStampsInMilliseconds;
	}

	/**
	 * @param {LoggingEvent} loggingEvent
	 * @return {Number}
	 */
	AbstractLayout.prototype.getTimeStampValue = function(loggingEvent) {
		return this.isTimeStampsInMilliseconds() ? loggingEvent.timeStampInMilliseconds : loggingEvent.timeStampInSeconds;
	}

	/**
	 * Used by JSOn Layout
	 * @param {LoggingEvent} loggingEvent
	 * @return {Array<Array<String|Date>>}
	 */
	AbstractLayout.prototype.getDataValues = function(loggingEvent) {
		var dataValues = [
			[this.loggerKey, loggingEvent.logger.name],
			[this.timeStampKey, this.getTimeStampValue(loggingEvent)],
			[this.levelKey, loggingEvent.level.name],
			//[this.urlKey, window.location.href], //FIXME
			[this.messageKey, loggingEvent.message.getFormattedMessage()]
		];
		if (!this.isTimeStampsInMilliseconds()) {
			dataValues.push([this.millisecondsKey, loggingEvent.milliseconds]);
		}
		var ex = loggingEvent.message.getThrowable()
		if (ex) {
			dataValues.push([this.exceptionKey, getExceptionStringRep(ex)]);
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
	 * @this {AbstractLayout}
	 * @param {String} [loggerKey]
	 * @param {String} [timeStampKey]
	 * @param {String} [levelKey]
	 * @param {String} [messageKey]
	 * @param {String} [exceptionKey]
	 * @param {String} [urlKey]
	 * @param {String} [millisecondsKey]
	 */
	AbstractLayout.prototype.setKeys = function(loggerKey, timeStampKey, levelKey, messageKey,exceptionKey, urlKey, millisecondsKey) {
		this.loggerKey = loggerKey !== undefined ? loggerKey : this.defaults.loggerKey;
		this.timeStampKey = timeStampKey !== undefined ? timeStampKey : this.defaults.timeStampKey;
		this.levelKey = levelKey !== undefined ? levelKey : this.defaults.levelKey;
		this.messageKey = messageKey !== undefined ? messageKey : this.defaults.messageKey;
		this.exceptionKey = exceptionKey !== undefined ? exceptionKey : this.defaults.exceptionKey;
		this.urlKey = urlKey !== undefined ? urlKey : this.defaults.urlKey;
		this.millisecondsKey = millisecondsKey !== undefined ? millisecondsKey : this.defaults.millisecondsKey;
	}

	/**
	 * @this {AbstractLayout}
	 */
	AbstractLayout.prototype.setCustomField = function(name, value) {
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

	AbstractLayout.prototype.hasCustomFields = function() {
		return this.customFields.length > 0;
	}
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
	AbstractLayout.call(this)
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"0427BB0C-1835-4CFC-8477-5F56A5DD8387",variableType:-4}
 */
var initSimpleLayout = (/** @constructor */ function() {
	SimpleLayout.prototype = Object.create(AbstractLayout.prototype);
	SimpleLayout.prototype.constructor = SimpleLayout

	SimpleLayout.prototype.format = function(loggingEvent) {
		return loggingEvent.level.name + " - " + loggingEvent.message.getFormattedMessage();
	};

	SimpleLayout.prototype.ignoresThrowable = function() {
		return true;
	};

	SimpleLayout.prototype.toString = function() {
		return "SimpleLayout";
	};
	
	logPlugins['SimpleLayout'] = SimpleLayout
	
	SimpleLayout.PluginFactory = {
		parameters: [],
		create: function() {
			return new SimpleLayout()
		}
	}
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
	AbstractLayout.call(this)
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BEF97D79-9D62-4B12-87B3-ABE53EA0C738",variableType:-4}
 */
var initNullLayout = (/** @constructor */ function() {
	NullLayout.prototype = Object.create(AbstractLayout.prototype);
	NullLayout.prototype.constructor = NullLayout

	/**
	 * @param {LoggingEvent} loggingEvent
	 * @return {String}
	 */
	NullLayout.prototype.format = function(loggingEvent) {
		return loggingEvent.message.getFormattedMessage();
	};

	NullLayout.prototype.ignoresThrowable = function() {
		return true;
	};

	NullLayout.prototype.toString = function() {
		return "NullLayout";
	};
	
	logPlugins['NullLayout'] = NullLayout
	
	NullLayout.PluginFactory = {
		parameters: [],
		create: function(pattern) {
			return new NullLayout()
		}
	}
}())

/* ---------------------------------XmlLayout------------------------------------- */
/**
 * @private 
 * @constructor
 * @extends {AbstractLayout}
 *
 * @properties={typeid:24,uuid:"E33DAAA2-193B-4080-8805-1D3452AA08BD"}
 */
function XmlLayout() {
	AbstractLayout.call(this)
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"5A02CFFB-582D-4B3F-92AD-B4DEA07071F2",variableType:-4}
 */
var initXmlLayout = (/** @constructor */ function() {
	XmlLayout.prototype = Object.create(AbstractLayout.prototype);
	XmlLayout.prototype.constructor = XmlLayout

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
		
		var str = "<log4javascript:event logger=\"" + loggingEvent.logger.name + "\" timestamp=\"" + this.getTimeStampValue(loggingEvent) + "\"";
		if (!this.isTimeStampsInMilliseconds()) {
			str += " milliseconds=\"" + loggingEvent.milliseconds + "\"";
		}
		str += " level=\"" + loggingEvent.level.name + "\">" + NEW_LINE;
		
		str += "<log4javascript:message><![CDATA[" + layout.escapeCdata(loggingEvent.message.getFormattedMessage()) + "]]></log4javascript:message>";
		
		if (this.hasCustomFields()) {
			for (i = 0, len = this.customFields.length; i < len; i++) {
				str += "<log4javascript:customfield name=\"" + this.customFields[i].name + "\"><![CDATA[" + this.customFields[i].value.toString() + "]]></log4javascript:customfield>" + NEW_LINE;
			}
		}
		var ex = loggingEvent.message.getThrowable()
		if (ex) {
			str += "<log4javascript:exception><![CDATA[" + getExceptionStringRep(ex) + "]]></log4javascript:exception>" + NEW_LINE;
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
	
	XmlLayout.PluginFactory = {
		parameters: [],
		create: function() {
			return new XmlLayout()
		}
	}
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
 * @param {Object} [readable]
 *
 * @properties={typeid:24,uuid:"340D216B-0285-475B-82D9-560E6D6E183B"}
 */
function JsonLayout(readable) {
	AbstractLayout.call(this)
	
	this.readable = typeof readable !== "undefined" ? Boolean(readable) : false;
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
var initJsonLayout = (/** @constructor */ function() {
	JsonLayout.prototype = Object.create(AbstractLayout.prototype);
	JsonLayout.prototype.constructor = JsonLayout
		
	JsonLayout.prototype.isReadable = function() {
		return this.readable;
	};

	/**
	 * @param {LoggingEvent} loggingEvent
	 * @return {String}
	 * @this {JsonLayout}
	 */
	JsonLayout.prototype.format = function(loggingEvent) {
		var layout = this;
		/** @type {Array} */
		var dataValues = this.getDataValues(loggingEvent);
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
	
	JsonLayout.PluginFactory = {
		parameters: [],
		create: function() {
			return new JsonLayout()
		}
	}
}())

/* ---------------------------------HttpPostDataLayout------------------------------------- */
/**
 * @private 
 * @constructor 
 * @extends {AbstractLayout}
 *
 * @properties={typeid:24,uuid:"7027598D-2240-43BD-84A3-05F5BA79B6CC"}
 */
function HttpPostDataLayout() {
	AbstractLayout.call(this)
	this.setKeys();
	this.customFields = [];
	this.returnsPostData = true;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BB86A214-5807-443C-A4F0-934F4671552D",variableType:-4}
 */
var initHttpPostdataLayout = (/** @constructor */ function() {
	HttpPostDataLayout.prototype = Object.create(AbstractLayout.prototype);
	HttpPostDataLayout.prototype.constructor = HttpPostDataLayout
		
	// Disable batching
	HttpPostDataLayout.prototype.allowBatching = function() {
		return false;
	};

	/**
	 * @param {LoggingEvent} loggingEvent
	 * @return {String}
	 * @this {HttpPostDataLayout}
	 */
	HttpPostDataLayout.prototype.format = function(loggingEvent) {
		var dataValues = this.getDataValues(loggingEvent);
		var queryBits = [];
		for (var i = 0, len = dataValues.length; i < len; i++) {
			/** @type {Date} */
			var date = (dataValues[i][1] instanceof Date) ? dataValues[i][1] : null 
			/**@type {String}*/
			var val = date ? date.getTime() : dataValues[i][1];
			queryBits.push(encodeURIComponent(dataValues[i][0].toString()) + "=" + encodeURIComponent(val));
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
	HttpPostDataLayout.PluginFactory = {
		parameters: [],
		create: function() {
			return new HttpPostDataLayout()
		}
	}
}())

/* --------------------------------formatObjectExpansion-------------------------------------- */
/* TODO: replace this utility method with JSON.Stringify:
 * - Take care of cyclic references using a replacer function
 * - strip out the double quotes around the keys using regex: http://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
 */

/**
 * Helper method that stringifies Objects (and prevents recursion while doing that)
 * 
 * @private
 * @param {*} object
 * @param {Number} maxdepth
 * @param {String} [indent]
 * @return {String}
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
		} else if (typeof obj === "undefined") {
			return "undefined";
		} else if (typeof obj === "string") {
			return formatString(obj);
		} else if (typeof obj === "object" && objectsExpanded.indexOf(obj) != -1) {
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
		} else if (typeof obj === "object" && depth > 0) {
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
	AbstractLayout.call(this)
	this.pattern = pattern||PatternLayout.DEFAULT_CONVERSION_PATTERN;
	this.customFields = [];
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"DEC0D9CB-1760-41E1-9408-5310708D3DC6",variableType:-4}
 */
var initPatternLayout = (/** @constructor */ function() {
		PatternLayout.TTCC_CONVERSION_PATTERN = "%r %p %c - %m%n";
		PatternLayout.DEFAULT_CONVERSION_PATTERN = "%m%n";
		PatternLayout.ISO8601_DATEFORMAT = "yyyy-MM-dd HH:mm:ss,SSS";
		PatternLayout.ISO8601_BASIC_DATEFORMAT = "yyyyMMdd HHmmss,SSS";
		PatternLayout.ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS";
		PatternLayout.DATETIME_DATEFORMAT = "dd MMM yyyy HH:mm:ss,SSS";
		PatternLayout.COMPACT_DATEFORMAT = "yyyyMMddHHmmssSSS";

		PatternLayout.prototype = Object.create(AbstractLayout.prototype);
		PatternLayout.prototype.constructor = PatternLayout

		/**
		 * @this {PatternLayout}
		 */
		PatternLayout.prototype.format = function(loggingEvent) {
			//TODO: for every logged message the entire config is parsed again. Maybe need to cache something to improve performance
			var regex = /%(-?[0-9]+)?(\.?[0-9]+)?(message|msg|logger|date|level|relative|thread|solution|[cdflmnprtsM%])(\{([^\}]+)\})?|([^%]+)/;
			var formattedString = "";
			/** @type {Array<String>} */
			var result;
			var searchString = this.pattern;
			var scriptTrace;
			
			// if does require a scriptTrace
			var regexScriptTrace = /%(-?[0-9]+)?(\.?[0-9]+)?([lM%])(\{([^\}]+)\})?|([^%]+)/;
			if (regexScriptTrace.test(searchString)) {
				try {
					var exception = new ServoyException();
					scriptTrace = exception.getScriptStackTrace();
					scriptTrace = scriptTrace.slice(scriptTrace.lastIndexOf("svyLogManager.js"));	// remove svyLogManager stack;
				} catch (e) {
					// TODO log the exception ?
				}
			}

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
					formattedString += '' + text;
				} else {
					// Create a raw replacement string based on the conversion character and specifier
					var replacement = '';
					switch (conversionCharacter) {
						case 'message':
						case 'msg':
						case 'm': // Message
							var depth = 0;
							if (specifier) {
								depth = parseInt(specifier, 10);
								if (isNaN(depth)) {
									statusLogger.error("PatternLayout.format: invalid specifier '{}' for conversion character '{}' - should be a number", specifier, conversionCharacter);
									depth = 0;
								}
							}
							
							replacement += depth === 0 ? loggingEvent.message.getFormattedMessage() : formatObjectExpansion(loggingEvent.message.getFormattedMessage(), depth);
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
										statusLogger.error("PatternLayout.format: invalid specifier 'specifier' for conversion character 'f' - should be a number", specifier);
									} else if (fieldIndex === 0) {
										statusLogger.error("PatternLayout.format: invalid specifier '{}' for conversion character 'f' - must be greater than zero", specifier);
									} else if (fieldIndex > this.customFields.length) {
										statusLogger.error("PatternLayout.format: invalid specifier '{}' for conversion character 'f' - there aren't that many custom fields", specifier);
									} else {
										fieldIndex = fieldIndex - 1;
									}
								}
								var val = this.customFields[fieldIndex].value;
								if (typeof val === "function") {
									/** @type {Function} */
									var tmp = val
									val = tmp(this, loggingEvent);
								}
								replacement = val;
							}
							break;
						case 'l': 	// at line
							// TODO check if scriptTrace exists ?
							replacement = scriptTrace.slice(scriptTrace.indexOf("at"), scriptTrace.indexOf(")") + 1);
							break;
						case 'M': // Method name
							// TODO check if scriptTrace exists ?
							var methodIndex = scriptTrace.indexOf("(") + 1;
							replacement = scriptTrace.slice(methodIndex, scriptTrace.indexOf(")"));
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
						case 'solution':
						case 's': // Current solution name
							replacement = application.getSolutionName();
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
		
		PatternLayout.PluginFactory = {
			parameters: [{
					configName: 'pattern',
					type: 'string'
				}
			],
			
			/**
			 * @param {String} pattern
			 */
			create: function(pattern) {
				var retval = new PatternLayout(pattern);
				return retval;
			}
		}
	}()
)

/* --------------------------------Simple logging for log4javascript itself-------------------------------------- */
/**
 * @private
 * @properties={typeid:35,uuid:"7BA41465-E0B4-4A49-9A83-FA49AF7E644C",variableType:-4}
 */
var statusLoggerConfig = {
	name: 'StatusLogger',
	effectiveLevel: Level.DEBUG,
	setLevel: function(level) {
		this.effectiveLevel = level
	},
	/**
	 * @param {Level} level
	 * @param {AbstractMessage} message
	 */
	log: function(level, message) {
		var lvl = level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return 
		}
		var msg = utils.dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss,SSS ") + level.toString() + ' '
		msg += message.getFormattedMessage()
		if (message.getThrowable()) {
			msg += NEW_LINE + message.getThrowable() //CHECKME: need to better format and include more info, like stack?
		}
		
		application.output(msg, lvl)
	}
}

/**
 * Logger to be used by LogPlugins
 * @type {Logger}
 * @private
 *
 * @properties={typeid:35,uuid:"EB873CA1-E87F-45C5-8466-92A241156D3F",variableType:-4}
 */
var statusLogger = new Logger(statusLoggerConfig)

/**
 * Gets the logger to be used in LogPlugins for logging messages about the internals of the LogPlugin itself.
 * 
 * Used for debugging internal and configuration issues of the LogManager 
 * @public
 * @return {Logger}
 * @properties={typeid:24,uuid:"1B89A7F7-9F24-40D5-A26D-8994D7BE1C04"}
 */
function getStatusLogger() {
	return statusLogger
}
