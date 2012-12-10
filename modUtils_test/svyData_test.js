/**
 * @properties={typeid:24,uuid:"424DD9B5-8D9C-486B-BDA9-2D38E5FB1956"}
 */
function testPivotJSDataSet() {
	var ds = databaseManager.createEmptyDataSet(0,['col1', 'col2'])
	ds.addRow(['col1_row1','col2_row1'])
	ds.addRow(['col1_row2','col2_row2'])
	
	var pivoted = scopes.svyData.pivotJSDataSet(ds)
	jsunit.assertEquals(3,pivoted.getMaxColumnIndex())
	jsunit.assertEquals(2,pivoted.getMaxRowIndex())
	jsunit.assertEquals('row2',pivoted.getColumnName(3))
	jsunit.assertEquals('col2',pivoted.getValue(2,1))
}