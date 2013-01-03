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