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
 * 			customColumns: null,
 * 			PatternLayout: {
 * 				pattern: ""
 * 			}
 * 		}],
 * 		loggers: {
 * 			root: {
 * 				level: "warn",
 * 				AppenderRef: [{ref: "DbAppender"}, {ref: "ApplicationOutput"}]
 * 			}
 * 		}
 * 	});
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
	 * @type {Array<{columnName: String, value: Object|Function}>}
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
var initDbAppender = (function() {
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

		if (this.dbMapping.eventTimeColumnName) record[this.dbMapping.eventTimeColumnName] = loggingEvent.timeStamp;
		if (this.dbMapping.logLevelColumnName) record[this.dbMapping.logLevelColumnName] = loggingEvent.level.intLevel;
		if (this.dbMapping.logLevelNameColumnName) record[this.dbMapping.logLevelNameColumnName] = loggingEvent.level.name;
		if (this.dbMapping.logMessageColumnName) record[this.dbMapping.logMessageColumnName] = loggingEvent.message.getFormattedMessage();
		if (this.dbMapping.userIdColumName && this.userId) record[this.dbMapping.userIdColumName] = this.userId;
		if (this.dbMapping.loggerColumnName) record[this.dbMapping.loggerColumnName] = loggingEvent.logger.name;
		if (this.dbMapping.solutionColumnName) record[this.dbMapping.solutionColumnName] = application.getSolutionName();

		if (this.customColumns) {
			for (var c = 0; c < this.customColumns.length; c++) {
				var col = this.customColumns[c];
				var value;
				if (col.value instanceof Function) {
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
			type: '{ eventTimeColumnName: String, loggerColumnName: String, logLevelColumnName: String,  logMessageColumnName: String, userIdColumName: String,solutionColumnName: String}'
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
			retval.setLayout(layout);
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