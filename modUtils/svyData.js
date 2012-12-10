/**
 * Pivots a JSDataSet: First column in the returned JSDataSet will contain the column names of the original dataset.<br>
 * For each row in the original dataset an column will be added to the returned JSDataSet
 * 
 * @param {JSDataSet} dataset The dataset for which to create a pivoted datatset
 * @return {JSDataSet} a new JSDataSet containing a pivoted copy of the original JSDataSet
 *
 * @properties={typeid:24,uuid:"D532BF51-A347-4DF2-844C-B06CAEA70919"}
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
 * Gets a JSRecord with the specified PK from the specified datasource. 
 * 
 * @param {String} datasource
 * @param {*|Array<*>} pks The PK column values for the record. Can be a single value or an Array with values (sorted by PK columnname) in case of a multi-column PK. 
 *
 * @return {JSRecord} The requested record. Can be null if not found
 * 
 * @properties={typeid:24,uuid:"A08119C8-7762-49C1-8B00-F9E8E7A65913"}
 */
function getRecord(datasource, pks) {
	if (!pks || !datasource) return null
	
	/** @type {JSFoundSet} */
	var fs = databaseManager.getFoundSet(datasource)

//	according to Rob Servoy will do the convert if the UUID flag is set on the column
//	if (/[0-9A-Fa-f]{8}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{4}\-[0-9A-Fa-f]{12}/.test(""+pks)) {
//		pks = application.getUUID(""+ pks);
//	}

	fs.loadRecords(databaseManager.convertToDataSet(pks instanceof Array ? pks : [pks]))
	return  fs.getSize() ? fs.getRecord(1) : null
}