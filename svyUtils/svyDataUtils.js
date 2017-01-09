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

/**
 * Pivots a JSDataSet: First column in the returned JSDataSet will contain the column names of the original dataset.<br>
 * For each row in the original dataset an column will be added to the returned JSDataSet
 * 
 * @param {JSDataSet} dataset The dataset for which to create a pivoted datatset
 * @return {JSDataSet} a new JSDataSet containing a pivoted copy of the original JSDataSet
 *
 * @properties={typeid:24,uuid:"FBE240B1-512A-42ED-9B74-994CCBE82EE2"}
 */
function pivotJSDataSet(dataset) {
	//Generate column names for the pivoted dataset
	var columnNames = ['columnName']
	for (var i = 1; i <= dataset.getMaxRowIndex(); i++) {
		columnNames.push('row'+i)
	}
	var newDS = databaseManager.createEmptyDataSet(0, columnNames)
	for (i = 1; i <= dataset.getMaxColumnIndex(); i++) {
		var row = dataset.getColumnAsArray(i)
		row.splice(0, 0, dataset.getColumnName(i))
		newDS.addRow(row)
	}
	return newDS
}

/**
 * Returns a new JSDataSet comprised of the two specified JSDataSets. Any columns addition has more than main are NOt copied over.
 *
 * @param {JSDataSet} main
 * @param {JSDataSet} addition
 * @return {JSDataSet} New JSDataSet containing all rowns from main joined with all rows from addition.
 * 
 * @properties={typeid:24,uuid:"72E868A3-A03C-417C-BBC8-2980A55E5116"}
 */
function concatenateJSDataSets(main, addition) {
	if (! (main instanceof JSDataSet && addition instanceof JSDataSet)) {
		throw new scopes.svyExceptions.IllegalArgumentException('Supplied arguments are not both instances of JSDataSet')
	}

	var newDS = databaseManager.createEmptyDataSet(0, main.getColumnNames());
	for (var i = 1; i <= main.getMaxRowIndex(); i++) {
		newDS.addRow(main.getRowAsArray(i))
	}

	for (i = 1; i <= addition.getMaxRowIndex(); i++) {
		newDS.addRow(addition.getRowAsArray(i).slice(0, main.getMaxColumnIndex()))
	}
	return newDS
}

/**
 * Executes a query in the background, returning the resulting JSDataSet through the onSuccess callback<br>
 * In case and exception occurs, the onError callback will be called, with the exception that occurred as parameter<br>
 * <br>
 * Note: the callback do not execute in the scope in which they are defined, thus references to other scope members need to be specified with a fully qualified path<br>
 * <br>
 * @example <pre>
 * 	//TODO
 * <pre>
 *
 * @param {QBSelect} query
 * @param {Number} maxReturnedRows
 * @param {function(JSDataSet):*} onSuccess
 * @param {function(ServoyException|Error):*} onError
 *
 * @properties={typeid:24,uuid:"07670497-63A0-45A4-A20D-F0189157F300"}
 */
function getJSDataSetByQueryAsync(query, maxReturnedRows, onSuccess, onError) {
	//TODO: should use Servoy's public API to get a pooled Thread for execution: "IClientPluginAccess".getExecutor().execute(runnable);
	var r = new java.lang.Runnable({ 
		run: function () { 
			try {
				var ds = databaseManager.getDataSetByQuery(query, maxReturnedRows)
				Packages.javax.swing.SwingUtilities.invokeLater(new java.lang.Runnable({
					run: function(){
						onSuccess.call(null, ds)
					}
				}))
			} catch (e) {
				Packages.javax.swing.SwingUtilities.invokeLater(new java.lang.Runnable({
					run: function(){
						onError.call(null, e)
					}
				}))

			}
		}
	});
	new java.lang.Thread(r).start()
}

/**
 * Converts a byte[] to String<br>
 * <br>
 * @param {byte[]} bytes
 * @param {String} [encoding] Optional param to specify the encoding/chartset to use. See {@link scopes#svyIO#CHAR_SETS} for possible values. Default: scopes.svyIO.CHAR_SETS.UTF_8
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"62FDE25B-B38E-4799-8DFD-9A151FB3DC7E"}
 */
function ByteArrayToString(bytes, encoding) {
	return new java.lang.String(bytes, encoding|scopes.svyIO.CHAR_SETS.UTF_8).toString()
}

/**
 * Converts a String to byte[]<br>
 * <br>
 * @param {String} string
 * 
 * @properties={typeid:24,uuid:"C3081002-0792-4375-8C25-D2F52751844A"}
 */
function StringToByteArray(string) {
	return new java.lang.String(string).getBytes()
}

/**
 * Tests if a given value for the given dataprovider already exists in the provided datasource
 * 
 * @deprecated will be removed in version 7.0. This method has been renamed from isValueUnique,<br>
 * but the result is the opposite now of what it's current name suggests. Use <code>dataSourceHasValue</code><br>
 * instead which in contrast to this method returns true, if the datasource already contains the<br>
 * value asked for, so <b>exactly the opposite of this method!</b>
 * 
 * @param {JSRecord|JSFoundSet|String} datasource
 * @param {String} dataproviderName - the name of the dataprovider that should be tested for uniqueness
 * @param {Object} value - the value that should be unique in the given dataprovider
 * @param {String[]} [extraQueryColumns] - optional array of additional dataproviders that can be used in the unique query
 * @param {Object[]} [extraQueryValues] - optional array of additional values that can be used in the unique query
 * 
 * @return {Boolean} true if the datasource <b>does not contain</b> the value asked for
 *
 * @properties={typeid:24,uuid:"460E5007-852E-4143-82FD-6840DA430FC0"}
 */
function datasourceHasValue(datasource, dataproviderName, value, extraQueryColumns, extraQueryValues) {
	if (!datasource || !dataproviderName) {
		throw new scopes.svyExceptions.IllegalArgumentException("no parameters provided to scopes.svyDataUtils.datasourceHasValue(foundsetOrRecord, dataproviderName, value)");
	}
	/** @type {String} */
	var dataSource = (datasource instanceof String) ? datasource : datasource.getDataSource();
	var pkNames = databaseManager.getTable(dataSource).getRowIdentifierColumnNames();
	var query = databaseManager.createSelect(dataSource);
	query.result.add(query.getColumn(pkNames[0]).count);

	if (value == null) {
		query.where.add(query.getColumn(dataproviderName).isNull);
	} else if (value instanceof UUID) {
		query.where.add(query.getColumn(dataproviderName).eq(value.toString()));
	} else {
		query.where.add(query.getColumn(dataproviderName).eq(value));
	}
	if (extraQueryColumns || extraQueryValues) {
		if (!Array.isArray(extraQueryColumns) || !Array.isArray(extraQueryValues)) {
			throw scopes.svyExceptions.IllegalArgumentException("extraQueryColumns and extraQueryValues parameters are not both an Array");
		}
		if (extraQueryColumns.length != extraQueryValues.length) {
			throw scopes.svyExceptions.IllegalArgumentException("size of extraQueryColumns and extraQueryValues parameters do not match");
		}
		for (var j = 0; j < extraQueryColumns.length; j++) {
			if (extraQueryValues[j] == null) {
				query.where.add(query.getColumn(extraQueryColumns[j]).isNull);
			} else if (extraQueryValues[j] instanceof UUID) {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j].toString()));
			} else {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j]));
			}
		}
	}
	var dataset = databaseManager.getDataSetByQuery(query, 1);
	return (dataset.getValue(1,1) == 0)
}

/**
 * Tests if a given value for the given dataprovider already exists in the provided datasource
 * 
 * @param {JSRecord|JSFoundSet|String} datasource
 * @param {String} dataproviderName - the name of the dataprovider that should be tested for uniqueness
 * @param {Object} value - the value that should be unique in the given dataprovider
 * @param {String[]} [extraQueryColumns] - optional array of additional dataproviders that can be used in the unique query
 * @param {Object[]} [extraQueryValues] - optional array of additional values that can be used in the unique query
 * 
 * @return {Boolean} true if the datasource already does contain the value asked for
 *
 * @properties={typeid:24,uuid:"A5D17E06-BD6B-4CAA-8764-58C8F4C27D35"}
 */
function dataSourceHasValue(datasource, dataproviderName, value, extraQueryColumns, extraQueryValues) {
	if (!datasource || !dataproviderName) {
		throw new scopes.svyExceptions.IllegalArgumentException("no parameters provided to scopes.svyDataUtils.datasourceHasValue(foundsetOrRecord, dataproviderName, value)");
	}
	/** @type {String} */
	var dataSource = (datasource instanceof String) ? datasource : datasource.getDataSource();
	var pkNames = databaseManager.getTable(dataSource).getRowIdentifierColumnNames();
	var query = databaseManager.createSelect(dataSource);
	query.result.add(query.getColumn(pkNames[0]).count);

	if (value == null) {
		query.where.add(query.getColumn(dataproviderName).isNull);
	} else if (value instanceof UUID) {
		query.where.add(query.getColumn(dataproviderName).eq(value.toString()));
	} else {
		query.where.add(query.getColumn(dataproviderName).eq(value));
	}
	if (extraQueryColumns || extraQueryValues) {
		if (!Array.isArray(extraQueryColumns) || !Array.isArray(extraQueryValues)) {
			throw scopes.svyExceptions.IllegalArgumentException("extraQueryColumns and extraQueryValues parameters are not both an Array");
		}
		if (extraQueryColumns.length != extraQueryValues.length) {
			throw scopes.svyExceptions.IllegalArgumentException("size of extraQueryColumns and extraQueryValues parameters do not match");
		}
		for (var j = 0; j < extraQueryColumns.length; j++) {
			if (extraQueryValues[j] == null) {
				query.where.add(query.getColumn(extraQueryColumns[j]).isNull);
			} else if (extraQueryValues[j] instanceof UUID) {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j].toString()));
			} else {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j]));
			}
		}
	}
	var dataset = databaseManager.getDataSetByQuery(query, 1);
	return !(dataset.getValue(1,1) == 0)
}

/**
 * Gets a JSRecord with the specified PK from the specified datasource. 
 * 
 * @param {String} datasource
 * @param {*|Array<*>} pks The PK column values for the record. Can be a single value or an Array with values (sorted by PK columnname) in case of a multi-column PK. 
 *
 * @return {JSRecord} The requested record. Can be null if not found
 * 
 * @properties={typeid:24,uuid:"BD700BE2-5455-4FEF-B155-D7A683B75A5E"}
 */
function getRecord(datasource, pks) {
	if (!pks || !datasource) return null
	
	var fs = databaseManager.getFoundSet(datasource)

//	according to Rob Servoy will do the convert if the UUID flag is set on the column
//	if (/[0-9A-Fa-f]{8}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{12}/.test(""+pks)) {
//		pks = application.getUUID(""+ pks);
//	}

	fs.loadRecords(databaseManager.convertToDataSet(pks instanceof Array ? pks : [pks]))
	return  fs.getSize() ? fs.getRecord(1) : null
}

/**
 * Tests if a given relation is global (only based on global or scope variables or literals)
 * 
 * @param {String} relationName
 * @return {Boolean} false for any dataprovider based relation or self joins
 *
 * @properties={typeid:24,uuid:"045975C0-6EC2-4EFE-A1AA-43A7E7C94C64"}
 */
function isGlobalRelation(relationName) {
	var jsRelation = solutionModel.getRelation(relationName);
	if (!jsRelation) {
		throw new scopes.svyExceptions.IllegalArgumentException("Relation \"" + relationName + "\" not found");
	}
	var relationItems = jsRelation.getRelationItems();
	if (!relationItems || relationItems.length == 0) {
		// self relation
		return false;
	}
	var isGlobal = true;
	for (var i = 0; i < relationItems.length; i++) {
		var relationItem = relationItems[i];
		if (relationItem.primaryLiteral != null) {
			continue;
		}
		if (!relationItem.primaryDataProviderID.match("globals|scopes")) {
			isGlobal = false;
			break;
		}
	}
	return isGlobal;
}

/**
 * Selects the first record in the foundset
 * @param {JSFoundSet} foundset
 * @return {Boolean} false when the foundset is empty
 *
 * @properties={typeid:24,uuid:"6C95A33B-9D08-4AD9-9AE5-27CF1F5AE44F"}
 */
function selectFirstRecord(foundset) {
	if (foundset) {
		foundset.setSelectedIndex(1);
		return true;
	}
	return false
}

/**
 * Selects the record before the selected record
 * @param {JSFoundSet} foundset
 * @return {Boolean} false when there is no previous record
 *
 * @properties={typeid:24,uuid:"87CFAD5C-8697-441E-86DD-DDD0DA53B24E"}
 */
function selectPreviousRecord(foundset) {
	if (foundset && foundset.getSelectedIndex() != 1) {
		foundset.setSelectedIndex(foundset.getSelectedIndex() - 1);
		return true;
	}
	return false	
}

/**
 * Selects the record after the selected record
 * @param {JSFoundSet} foundset
 * @return {Boolean} false when there is no next record
 *
 * @properties={typeid:24,uuid:"9EF84149-DEB3-4AFB-B9D3-4F1F3324AD7E"}
 */
function selectNextRecord(foundset) {
	if (foundset) {
		var curIdx = foundset.getSelectedIndex()
		foundset.setSelectedIndex(++curIdx);
		return curIdx != foundset.getSelectedIndex();
	}
	return false
}

/**
 * Selects the last record in the foundset. Warning: can be very expensive, as the entire foundset needs to be loaded
 * @param {JSFoundSet} foundset
 * @return {Boolean} false when the foundset is empty
 *
 * @properties={typeid:24,uuid:"B645601C-81E3-43A6-AC43-2E18D1019B01"}
 */
function selectLastRecord(foundset) {
	var newIdx = databaseManager.getFoundSetCount(foundset)
	if (!newIdx) return false
	
	foundset.getRecord(newIdx)
	foundset.setSelectedIndex(newIdx);
	return true
}

/**
 * Raised when JSFoundSet.newRecord() failed
 *
 * @param {String} [errorMessage]
 * @param {JSFoundSet} [source] The source of the new record failure
 *
 * @constructor
 * @extends {SvyDataException}
 * @author Sean
 *
 * @properties={typeid:24,uuid:"94CEBEC1-259F-4F61-BF73-465BB450AF0F"}
 */
function NewRecordFailedException(errorMessage, source) {

	if(!errorMessage){
		errorMessage = 'New Record Failed';
	}
	
	SvyDataException.call(this, errorMessage,source);
}

/**
 * Raised when JSFoundSet.find() fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet} [source] The foundset which failed to enter find
 *
 * @constructor
 * @extends {SvyDataException}
 * @author Sean
 *
 * @properties={typeid:24,uuid:"0344D472-6DAB-47D5-B3AB-9AEEC4E26756"}
 */
function FindModeFailedException(errorMessage, source) {

	if(!errorMessage){
		errorMessage = 'Find Mode Failed';
	}
	SvyDataException.call(this,errorMessage,source);
}

/**
 * Raised when databaseManager.saveData() fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet|JSRecord} [source] The source, saves can be on anything (null), foundset, or record
 *
 * @extends {SvyDataException}
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"651BF190-9791-45A8-B9F7-075704A1636B"}
 */
function SaveDataFailedException(errorMessage, source) {

	if(!errorMessage){
		errorMessage = 'Save Data Failed';
	}
	SvyDataException.call(this,errorMessage,source);
}

/**
 * Raised when a delete fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet|JSRecord} [source] The source of the failed delete
 *
 * @constructor
 * @extends {SvyDataException}
 * 
 * @author Sean
 *
 * @properties={typeid:24,uuid:"0408A31A-2D36-4193-A25C-5C7D388F6432"}
 */
function DeleteRecordFailedException(errorMessage, source) {

	if(!errorMessage){
		errorMessage = 'Delete Record(s) Failed';
	}
	SvyDataException.call(this,errorMessage,source);
}

/**
 * Raised when the dataprovider needs to be unique
 *
 * @param {String} [errorMessage] The desired message
 * @param {String|JSRecord|JSFoundSet} [source] The data source name, foundset or record (ideally the record if it is known, but it may not exist yet)
 * @param {String} [dataProviderID] The name of the data provider
 * @param {Object} [value] the value which was not unique
 * 
 * @constructor
 * @extends {SvyDataException}
 * 
 * @author patrick
 * @since 30.09.2012
 *
 * @properties={typeid:24,uuid:"E1DCB83C-CE60-4015-BCE0-F122A09CE180"}
 */
function ValueNotUniqueException(errorMessage,source,dataProviderID, value) {

	/**
	 * Gets the value which caused the exception
	 * @return {Object} 
	 */
	this.getValue = function(){
		return value;
	}
	
	if(!errorMessage){
		errorMessage = "The value \"" + value + "\" is not unique for dataprovider \"" + dataProviderID + "\"";
	}
	SvyDataException.call(this,errorMessage,source,dataProviderID)
}

/**
 * No record present in foundset
 *
 * @param {String} [errorMessage]
 * @param {JSFoundSet} [source] The source of the exception
 * 
 * @constructor
 * @extends {SvyDataException}
 * 
 * @properties={typeid:24,uuid:"875407D4-1174-4FDE-A5C9-025BC1A6B89F"}
 */
function NoRecordException(errorMessage, source) {
	if(!errorMessage){
		errorMessage = 'Foundset has no records';
	}
	SvyDataException.call(this, errorMessage, source);
}

/**
 * No related record present on record or foundset
 * 
 * @param {String} [errorMessage]
 * @param {JSFoundSet|JSRecord} [source] The source of the exception
 * @param {String} [relationNames]
 * 
 * @constructor
 * @extends {SvyDataException}
 * 
 * @properties={typeid:24,uuid:"DCA3AAE0-8B37-4277-B532-714765CE657C"}
 */
function NoRelatedRecordException(errorMessage, source, relationNames) {
	
	/**
	 * Gets the name of the relation
	 * @return {String}
	 */
	this.getRelationNames = function(){
		return relationNames;
	}
	
	if(!errorMessage){
		errorMessage = 'No related record';
	}
	SvyDataException.call(this, errorMessage, source);
}

/**
 * General Data Exception
 * 
 * @param {String} [errorMessage]
 * @param {String|JSRecord|JSFoundSet} [source]
 * @param {String} [dataProviderID]
 * 
 * @constructor
 * @extends {scopes.svyExceptions.SvyException}
 * 
 * @properties={typeid:24,uuid:"5596DB5B-CCCF-46FF-B47E-1567827C66B5"}
 */
function SvyDataException(errorMessage, source, dataProviderID){
	
	/** @type {JSFoundSet} */
	var foundset = null;
	
	/** @type {JSRecord} */
	var record = null;
	
	/** @type {String} */
	var dataSource = null;
	
	//	check arg type and create instance vars
	if(source){
		if(source instanceof JSFoundSet){
			foundset = source;
			dataSource = foundset.getDataSource();
		} else if(source instanceof JSRecord){
			record = source;
			foundset = record.foundset
			dataSource = record.getDataSource();
		} else if(source instanceof String){
			dataSource = source;
		}
	}
	
	/**
	 * Gets the foundset (if one exists) for this exception
	 * @return {JSFoundSet}
	 */
	this.getFoundSet = function(){
		return foundset;
	}
	
	/**
	 * Gets the record (if one exists) for this exception
	 * @return {JSRecord}
	 */
	this.getRecord = function(){
		return record;
	}
	
	/**
	 * Gets the data source name (if one exists) for this exception
	 * @return {String}
	 */
	this.getDataSourceName = function(){
		return dataSource;
	}
	
	/**
	 * Gets the data source name (if one exists) for this exception
	 * @return {String}
	 */
	this.getDataProviderID = function(){
		return dataProviderID;
	}
	scopes.svyExceptions.SvyException.call(this, errorMessage);
}

/**
 * The 'from" method of a column converter that stringifies the real value to a JSON String for storage
 *
 * @param realValue The real value.
 * @param {String} dbType The type of the database column. Can be one of "TEXT", "INTEGER", "NUMBER", "DATETIME" or "MEDIA".
 *
 * @returns {String} the storage value
 * 
 * @see  {@link #fromJSONColumnConverter}
 *
 * @properties={typeid:24,uuid:"FB7F5FF8-7FC6-42AF-8E5F-3C6E5C10A9CA"}
 */
function toJSONColumnConverter(realValue, dbType) {
	if (realValue instanceof Array) {
		// in case we receive a Native Array here, 
		// try to convert it to a JS array
		realValue = realValue.concat(new Array())
	} else if (realValue instanceof UUID) {
		realValue = realValue.toString()
	}
	return JSON.stringify(realValue)
}

/**
 * The 'to' method of a column converter that revives a JSON String from storage to the real value for usage in the application again
 * 
 * @param storageValue The database value.
 * @param {String} dbType The type of the database column. Can be one of "TEXT", "INTEGER", "NUMBER", "DATETIME" or "MEDIA".
 *
 * @returns {Object} the real value
 * 
 * @see  {@link #toJSONColumnConverter}
 *
 * @properties={typeid:24,uuid:"D4FBF90C-3911-47D8-91EF-03D071D2CF13"}
 */
function fromJSONColumnConverter(storageValue, dbType) {
	if (storageValue == null) {
		return null;
	}
	return JSON.parse(storageValue)
}

/**
 * Returns the original value of the given dataprovider of a record that has changes not yet saved to the database
 * 
 * @param {JSRecord} record
 * @param {String} dataProviderId
 *
 * @properties={typeid:24,uuid:"357B80F0-BCCE-4E8E-A047-E2996E6E4CF9"}
 */
function getDataproviderValueInDB(record, dataProviderId) {
	var changedData = record.getChangedData();
	for (var i = 1; i <= changedData.getMaxRowIndex(); i++) {
		if (changedData.getValue(i, 1) == dataProviderId) {
			return changedData.getValue(i,2);
		}
	}
	return record[dataProviderId];
}

/**
 * Dumps all data of either all or the given tables of the given server to csv files and zips them.<p>
 * 
 * All possible table filters will be applied.
 * 
 * @public 
 * 
 * @version 6.1
 * @since Feb 4, 2015
 * @author patrick
 *
 * @param {String} serverName - the server to dump
 * @param {Array<String>} [tablesToUse] - if given, only these tables will be exported
 * 
 * @return {plugins.file.JSFile} zipFile - the zip file created
 *
 * @properties={typeid:24,uuid:"148D1F46-6615-4ED4-A3D6-BD03B1D39932"}
 */
function createDataDump(serverName, tablesToUse) {
	if (!tablesToUse) {
		tablesToUse = databaseManager.getTableNames(serverName);
	}

	try {
		var tempDir = plugins.file.createTempFile("data_dump_", "");
		tempDir.deleteFile();
		var success = plugins.file.createFolder(tempDir);
		if (!success) {
			throw new scopes.svyExceptions.IllegalStateException("Failed to create temp dir \"" + tempDir.getAbsolutePath() + "\"");
		}
		for (var i = 0; i < tablesToUse.length; i++) {
			var fs = databaseManager.getFoundSet(serverName, tablesToUse[i]);
			fs.loadAllRecords();
			
			if (!utils.hasRecords(fs)) continue;
			
			var fsQuery = databaseManager.getSQL(fs, true);
			var fsQueryParams = databaseManager.getSQLParameters(fs, true);
			var jsTable = databaseManager.getTable(fs);
			var dataProviderIds = jsTable.getColumnNames();
			var pkColumns = jsTable.getRowIdentifierColumnNames();
			var qualifiedDataproviderIds = [];
			for (var d = 0; d < dataProviderIds.length; d++) {
				qualifiedDataproviderIds.push(tablesToUse[i] + "." + dataProviderIds[d]);
			}
			for (var p = 0; p < pkColumns.length; p++) {
				pkColumns[p] = tablesToUse[i] + "." + pkColumns[p];
			}
			
			var pkArgToReplace = "select " + pkColumns.join(", ");
			fsQuery = utils.stringReplace(fsQuery, pkArgToReplace, "select " + qualifiedDataproviderIds.join(", "));
			
			var dataset = databaseManager.getDataSetByQuery(serverName, fsQuery, fsQueryParams, -1);
			var exportFile = plugins.file.convertToJSFile(tempDir.getAbsolutePath() + java.io.File.separator + tablesToUse[i] + ".csv");
			if (fs) {
				var textData = dataset.getAsText(";", "\n", "\"", true);
				if (textData.substring(textData.length-1) == "\n") {
					//remove last empty line if present
					textData = textData.substring(0, textData.length-1);
				}
				success = plugins.file.writeTXTFile(exportFile, textData);
				if (!success) {
					throw new scopes.svyExceptions.IllegalStateException("Failed to write to file \"" + exportFile.getAbsolutePath() + "\"");
				}
			}
		}
		var zipFile = scopes.svyIO.zip(tempDir);
		return zipFile;
	} catch (e) {
		throw new scopes.svyExceptions.SvyException("Error creating data dump: " + e.message);
	}
}

/**
 * Point prototypes to superclasses
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"661B7B5D-659E-43F5-97B7-F07FFB44FF5E",variableType:-4}
 */
var init = function() {
	SvyDataException.prototype = Object.create(scopes.svyExceptions.SvyException.prototype);
	SvyDataException.prototype.constructor = SvyDataException
	
	NoRecordException.prototype = Object.create(SvyDataException.prototype);
	NoRecordException.prototype.constructor = NoRecordException
		
	NoRelatedRecordException.prototype = Object.create(SvyDataException.prototype);
	NoRelatedRecordException.prototype.constructor = NoRelatedRecordException
	
	NewRecordFailedException.prototype = Object.create(SvyDataException.prototype);
	NewRecordFailedException.prototype.constructor = NewRecordFailedException
	
	FindModeFailedException.prototype = Object.create(SvyDataException.prototype);
	FindModeFailedException.prototype.constructor = FindModeFailedException
	
	SaveDataFailedException.prototype = Object.create(SvyDataException.prototype);
	SaveDataFailedException.prototype.constructor = SaveDataFailedException
	
	DeleteRecordFailedException.prototype = Object.create(SvyDataException.prototype);
	DeleteRecordFailedException.prototype.constructor = DeleteRecordFailedException
	
	ValueNotUniqueException.prototype = Object.create(SvyDataException.prototype);
	ValueNotUniqueException.prototype.constructor = ValueNotUniqueException
}()