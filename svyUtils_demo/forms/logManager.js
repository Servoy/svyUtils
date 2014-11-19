/**
 *
 * @type {scopes.svyLogManager.Logger}
 *
 * @properties={typeid:35,uuid:"35C82DCF-B27D-4DBB-A15E-959358FA8771",variableType:-4}
 */
var log = scopes.demo.log;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"4250FB90-3464-454B-8B35-A5355A243135"}
 */
var text = "This is a sample log message";

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"AF9DEDE5-EA48-485D-95C1-98DD537266DE",variableType:8}
 */
var fileLogEnabled;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9A8FB5EF-9F1C-4A6C-BBDB-6DC74B53C359",variableType:8}
 */
var DBLogEnabled

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"051E959D-54F0-417F-93F2-E460354DE393"}
 */
function logMessage(event) {
	log.debug(text)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"6D5E5A76-03EF-485C-8667-46ABC24C8EA2"}
 */
function warningMessage(event) {
	log.warn(text)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"74EEF732-DFF6-4002-B2F4-E1E4B977C612"}
 */
function errorMessage(event) {
	log.error(text)
}

/**
 * @properties={typeid:24,uuid:"50AC2F25-0F7A-4CD1-9285-27E1D9E29001"}
 */
function reloadLogConfig() {
	// log configuration
	var config = {
		status: "debug", // status of the logManager logger
		plugins: 'scopes.svyLogManager$rollingFileAppender.RollingFileAppender, scopes.svyLogManager$dbAppender.DbAppender', // list of used log plugins
		appenders: [{ // list of all appenders used
			type: "ApplicationOutputAppender",
			name: "ApplicationOutput",
			PatternLayout: {
				pattern: "%5level %msg"
			}
		}],
		loggers: {
			root: { // configuration for the root logger
				level: "debug",
				AppenderRef: [{ 
			          ref: "ApplicationOutput" 
			    }]
			}
		}
	}

	// log appenders
	var fileAppender = {
		type: "scopes.svyLogManager$rollingFileAppender.RollingFileAppender",
		name: "RollingFileAppender",
		fileName: "myLogs/myAppLog.log",
		maxFileSize: 1024 * 1024 * 5,
		maxBackupIndex: 5,
		PatternLayout: {
			pattern: "%date %5level %30logger - %msg"
		}
	}

	var DBAppender = {
		type: "scopes.svyLogManager$dbAppender.DbAppender",
		name: "DbAppender",
		userId: 'sampleuser',
		datasource: undefined,	// set the datasource. chand the dbMapping to use different column names
		dbMapping: { eventTimeColumnName: "event_time", loggerColumnName: "logger_name", logLevelColumnName: "log_level", logMessageColumnName: "log_message", userIdColumName: "user_id", solutionColumnName: "solution_name" },
		PatternLayout: {
			pattern: ""
		}
	}

	var appenders = config.appenders
	var appenderRef = config.loggers.root.AppenderRef

	// enable the file appender
	if (fileLogEnabled) { 
		appenders.push(fileAppender);
		appenderRef.push({ ref: fileAppender.name })

	}
	
	// enable the DBAppender Logger
	if (DBLogEnabled) { 
		if (!DBAppender.datasource) {
			DBLogEnabled = 0
			elements.labelError.visible = true
			application.output('warning: you must specify a valid datasource in order to use the DBLogger')
		} else {
			appenders.push(DBAppender);
			appenderRef.push({ ref: DBAppender.name })
			elements.labelError.visible = false
		}
	}

	// apply the changes
	scopes.svyLogManager.loadConfig(config)

}

/**
 * Handle changed data.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"ED9003C2-1A30-4E2D-842B-0E9369728ED5"}
 */
function onDataChange(oldValue, newValue, event) {
	reloadLogConfig()
	return true
}
