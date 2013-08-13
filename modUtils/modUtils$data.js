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
	if (!(main instanceof JSDataSet && addition instanceof JSDataSet)) {
		throw new scopes.modUtils$exceptions.IllegalArgumentException('Supplied arguments are not both instances of JSDataSet')
	}

	var newDS = databaseManager.createEmptyDataSet(0, getJSDataSetColumnNames(main));
	for (var i = 1; i <= main.getMaxRowIndex(); i++) {
		newDS.addRow(main.getRowAsArray(i))
	}
	
	for (i = 1; i <= addition.getMaxRowIndex(); i++) {
		newDS.addRow(addition.getRowAsArray(i).slice(0,main.getMaxColumnIndex()))
	}
	return newDS
}

/**
 * Returns an Array with the column names of the specified JSDataSet
 * 
 * @param {JSDataSet} dataset
 * 
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"DEF5A3BA-B9B9-4599-BB49-665AED2DFDB5"}
 */
function getJSDataSetColumnNames(dataset) {
	if (!(dataset instanceof JSDataSet)) {
		throw new scopes.modUtils$exceptions.IllegalArgumentException('Supplied argument is not an instance of JSDataSet')
	}
	
	var columnNames = []
	for (var i = 1; i <= dataset.getMaxColumnIndex(); i++) {
		columnNames.push(dataset.getColumnName(i));
	}
	return columnNames;
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
 * @param {String} [encoding] Optional param to specify the encoding/chartset to use. See {@link scopes#modUtils$IO#CHAR_SETS} for possible values. Default: scopes.modUtils$IO.CHAR_SETS.UTF_8
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"62FDE25B-B38E-4799-8DFD-9A151FB3DC7E"}
 */
function ByteArrayToString(bytes, encoding) {
	return new java.lang.String(bytes, encoding|scopes.modUtils$IO.CHAR_SETS.UTF_8).toString()
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
		errorMessage = 'Value not unique';
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
 * @extends {scopes.modUtils$exceptions.SvyException}
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
	scopes.modUtils$exceptions.SvyException.call(this, errorMessage);
}
/**
 * Point prototypes to superclasses
 * @protected 
 *
 * @properties={typeid:35,uuid:"661B7B5D-659E-43F5-97B7-F07FFB44FF5E",variableType:-4}
 */
var init = function() {
	NoRecordException.prototype = new SvyDataException("No record was given or the foundset is empty");
	NoRelatedRecordException.prototype = new SvyDataException("No related record found");
	NewRecordFailedException.prototype = new SvyDataException("Failed to create new record");
	FindModeFailedException.prototype = new SvyDataException("Failed to enter find mode");
	SaveDataFailedException.prototype = new SvyDataException("Failed to save data");
	DeleteRecordFailedException.prototype = new SvyDataException("Failed to delete data");
	ValueNotUniqueException.prototype = new SvyDataException("Value not unique");
	SvyDataException.prototype = new scopes.modUtils$exceptions.SvyException('Data related exception')
}()