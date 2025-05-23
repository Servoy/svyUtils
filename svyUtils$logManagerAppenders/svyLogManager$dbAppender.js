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
 * Example configuration for logging to a database table. The configuration below
 * will write all logging output of any logger to the console and the DB
 * 
 * Please make sure the datasource and dbMapping match your table
 * 
 * scopes.svyLogManager.loadConfig({
 * 		status: "error",
 * 		plugins: 'scopes.svyLogManager$dbAppender.DbAppender',
 * 		appenders: [{
 * 			type: "ApplicationOutputAppender",
 * 			name: "ApplicationOutput",
 * 			PatternLayout: {
 * 				pattern: "%5level %logger{1.} - %msg"
 * 			}
 * 		}, {
 * 			type: "scopes.svyLogManager$dbAppender.DbAppender",
 * 			name: "DbAppender",
 * 			datasource: "db:/my_db/log_events",
 * 			userId: globals.myUserId,
 * 			dbMapping: { eventTimeColumnName: "event_time", loggerColumnName: "logger_name", logLevelColumnName: "log_level", logMessageColumnName: "log_message", userIdColumName: "user_id", solutionColumnName: "solution_name" },
 * 			customColumns: [{columnName: 'my_custom_field', value: 'Hello'} , {columnName: 'my_custom_field_2', value: 'scopes.test.getMyValue'}, {columnName: 'my_custom_field_3'}],
 *			PatternLayout: {
 *				pattern: "%msg"
 *			}
 * 		}],
 * 		loggers: {
 * 			root: {
 * 				level: "warn",
 * 				AppenderRef: [{ref: "DbAppender"}, {ref: "ApplicationOutput"}]
 * 			}
 * 		}
 * 	});
 * 
 * If PatternLayout is used, values for custom columns can be provided as parameters to the logger methods:
 * 
 * logger.debug('This is a {} {} message', 'Hello', 'World', {my_custom_field: 'abc', my_custom_field_2: 'def'});
 * 
 * This will result in the message 'This is a Hello World message' and 'abc' will be written to the column 
 * 'my_custom_field' and 'def' to 'my_custom_field_2'. If no values are provided as parameters, the default
 * value or function call will be used instead.
 * 
 */

/**
 * Type definition for the table mapping used to match the logging events to the table's columns
 * 
 * @typedef {{
 * 	eventTimeColumnName: String, 
 * 	loggerColumnName: String=, 
 * 	logLevelNameColumnName: String=, 
 * 	logLevelColumnName: String=, 
 * 	logMessageColumnName: String, 
 * 	userIdColumName: String=,
 * 	userIdColumnName: String=,
 * 	solutionColumnName: String=
 * }}
 *
 * @properties={typeid:35,uuid:"EBB28330-3735-4D2C-8364-11203E69E914",variableType:-4}
 */
var DB_MAPPING;

/**
 * Simple Appender that writes log output to the given datasource using the given mapping<br>
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * When using this appender it needs to be added to the list of plugins in the config as
 * <pre>scopes.svyLogManager$dbAppender.DbAppender</pre>
 * see <code>scopes.svyLogManager.CONFIG_TYPE_DEF</code> for details<br>
 * 
 * @constructor
 * @extends {scopes.svyLogManager.AbstractAppender}
 *
 * @param {String} datasource
 * @param {DB_MAPPING} dbMapping
 * @param {String} userId
 *
 * @properties={typeid:24,uuid:"6EDA8242-99D0-46B8-AFD4-F27405C35DD9"}
 */
function DbAppender(datasource, dbMapping, userId) {
	
	scopes.svyLogManager.AbstractAppender.call(this);

	/**
	 * the datasource for this appender
	 */
	this.datasource = datasource;

	/**
	 * the mapping used
	 */
	this.dbMapping = dbMapping;
	
	/**
	 * a foundset for the datasource
	 */
	this.foundset = null;
	
	/**
	 * The userId
	 */
	this.userId = userId ? userId : null;
	
	/**
	 * Array of custom columns that can be configured with fixed values, variables or Function calls
	 * 
	 * @type {Array<{columnName: String, value: Object|Function=}>}
	 */
	this.customColumns = [];
	
	try {
		/**
		 * a foundset for the datasource
		 */
		this.foundset = databaseManager.getFoundSet(this.datasource);
	} catch(e) {
		scopes.svyLogManager.getStatusLogger().error("DbAppender couldn't find datasource \"" + this.datasource + "\"", e);
		throw e;
	}
	var jsTable = databaseManager.getTable(this.datasource);
	var columnNames = jsTable.getColumnNames();
	for ( var i in this.dbMapping ) {
		if (columnNames.indexOf(this.dbMapping[i]) == -1) {
			scopes.svyLogManager.getStatusLogger().error("DbAppender couldn't find given column \"" + this.dbMapping[i] + "\" in datasource \"" + this.datasource + "\"");
		}
		if (i == "eventTimeColumnName" && jsTable.getColumn(this.dbMapping[i]).getType() != JSColumn.DATETIME) {
			scopes.svyLogManager.getStatusLogger().error("DbAppender found wrong column type for column \"" + this.dbMapping[i] + "\" in datasource \"" + this.datasource + "\"; DATETIME required");
		} else if (i == "logLevelColumnName" && jsTable.getColumn(this.dbMapping[i]).getType() != JSColumn.INTEGER) {
			scopes.svyLogManager.getStatusLogger().error("DbAppender found wrong column type for column \"" + this.dbMapping[i] + "\" in datasource \"" + this.datasource + "\"; INTEGER required");
		}
	}
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"18BB30C5-C6E5-4E2C-A505-1231344DBCFB",variableType:-4}
 */
var initDbAppender = (/** @constructor */ function() {
	DbAppender.prototype = Object.create(scopes.svyLogManager.AbstractAppender.prototype);
	DbAppender.prototype.constructor = DbAppender

	/**
	 * @this {DbAppender}
	 * @param {scopes.svyLogManager.LoggingEvent} loggingEvent
	 */
	DbAppender.prototype.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { // All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return
		}
		
		var record = this.foundset.getRecord(this.foundset.newRecord());

		/**  @type {Array<*>} */
		var params = loggingEvent.message.getParameters();
		/** @type {Object<*>} */
		var customFieldValues = params ? params.pop() : null;
		if (this.dbMapping.eventTimeColumnName) record[this.dbMapping.eventTimeColumnName] = loggingEvent.timeStamp;
		if (this.dbMapping.logLevelColumnName) record[this.dbMapping.logLevelColumnName] = loggingEvent.level.intLevel;
		if (this.dbMapping.logLevelNameColumnName) record[this.dbMapping.logLevelNameColumnName] = loggingEvent.level.name;
		if (this.dbMapping.logMessageColumnName) record[this.dbMapping.logMessageColumnName] = loggingEvent.message.getFormattedMessage();
		if (this.dbMapping.userIdColumName && this.userId) record[this.dbMapping.userIdColumName] = this.userId;
		if (this.dbMapping.userIdColumnName && this.userId) record[this.dbMapping.userIdColumnName] = this.userId;
		if (this.dbMapping.loggerColumnName) record[this.dbMapping.loggerColumnName] = loggingEvent.logger.name;
		if (this.dbMapping.solutionColumnName) record[this.dbMapping.solutionColumnName] = application.getSolutionName();

		if (this.customColumns) {
			for (var c = 0; c < this.customColumns.length; c++) {
				var col = this.customColumns[c];
				var value;
				if (customFieldValues && customFieldValues.hasOwnProperty(col.columnName)) {
					value = customFieldValues[col.columnName];
				} else if (col.value instanceof Function) {
					/** @type {Function} */
					var colFun = col.value;
					value = colFun(loggingEvent);
				} else {
					value = col.value;
				}
				record[col.columnName] = value;
			}
		}
		
		var success = databaseManager.saveData(record);
		if (!success) {
			scopes.svyLogManager.getStatusLogger().error("DbAppender failed to save log message to datasource \"" + this.datasource + "\"");
		} else {
			this.foundset.clear();
		}
	}

	DbAppender.prototype.toString = function() {
		return 'DbAppender'
	}

	DbAppender.PluginFactory = {
		parameters: [{
			configName: 'name',
			type: 'string'
		}, {
			configName: 'Layout',
			type: scopes.svyLogManager.AbstractLayout
		}, {
			configName: 'datasource',
			type: 'string'
		}, {
			configName: 'dbMapping',
			type: '{ eventTimeColumnName: String, loggerColumnName: String, logLevelColumnName: String,  logMessageColumnName: String, userIdColumName: String, userIdColumnName: String, solutionColumnName: String}'
		}, {
			configName: 'userId',
			type: 'string'
		}, {
			configName: 'customColumns',
			type: 'object'
		}],

		/**
		 * @param {String} name
		 * @param {scopes.svyLogManager.AbstractLayout} layout
		 * @param {String} datasource
		 * @param {DB_MAPPING} dbMapping
		 * @param {String} userId
		 * @param {Array} customColumns
		 * @return {DbAppender}
		 */
		create: function(name, layout, datasource, dbMapping, userId, customColumns) {
			var retval = new DbAppender(datasource, dbMapping, userId);
			retval.setName(name);
			if (layout) retval.setLayout(layout);
			if (customColumns) retval.customColumns = customColumns;
			return retval;
		}
	}
}());

/**
 * Returns an object describing the appender that can be used in the logManager config
 * @public 
 *
 * @param {String} datasource the database table where the DbAppender should append to
 * @param {DB_MAPPING} dbMapping the mapping used to match logging events to the table's columns
 * @return {*}
 *
 * @properties={typeid:24,uuid:"4CF81578-F78E-46E9-8741-34AFCE1E9976"}
 */
function getAppenderConfigObject(datasource, dbMapping) {
	return {
		type: "scopes.svyLogManager$dbAppender.DbAppender",
		name: "DbAppender",
		datasource: datasource,
		dbMapping: { eventTimeColumnName: dbMapping.eventTimeColumnName, loggerColumnName: dbMapping.logLevelColumnName, logLevelColumnName: dbMapping.logLevelColumnName, logMessageColumnName: dbMapping.logMessageColumnName, userIdColumName: dbMapping.userIdColumName, solutionColumnName: dbMapping.solutionColumnName },
		userId: null,
		customColumns: null,
		PatternLayout: {
			pattern: "%5level %logger{1.} - %msg"
		}
	}
}