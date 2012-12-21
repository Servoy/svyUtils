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

/**
 * Selects the first record in the foundset
 * @param {JSFoundSet} foundset
 * @return {Boolean} false when the foundset is empty
 *
 * @properties={typeid:24,uuid:"9A608220-70B3-4953-B9B0-1394ABBF8763"}
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
 * @properties={typeid:24,uuid:"547E1B75-551C-4583-B976-3ECCF5FCDD67"}
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
 * @properties={typeid:24,uuid:"CEFC9684-3701-472E-9D3E-606E2984D8FC"}
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
 * @properties={typeid:24,uuid:"ED9BA429-2E44-445E-8229-1FB852E7DA09"}
 */
function selectLastRecord(foundset) {
	//TODO: test
	var newIdx = databaseManager.getFoundSetCount(foundset)
	if (!newIdx) return false
	
	foundset.getRecord(newIdx)
	foundset.setSelectedIndex(newIdx);
	return true
	
//	Code below not tested, but taken code above from old method in svy_utils
//	var curIdx = -1
//	while (curIdx != foundset.getSelectedIndex()) {
//		curIdx = foundset.getSelectedIndex()
//		foundset.setSelectedIndex(foundset.getSize())
//	}
}