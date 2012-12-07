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