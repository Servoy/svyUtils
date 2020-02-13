/**
 * @properties={typeid:24,uuid:"34ADBFA1-BB5C-40B4-B2A2-BEE16E1BD227"}
 */
function test_svyExcelUtils() {
	java.lang.System.setProperty("org.apache.poi.util.POILogger", "org.apache.poi.util.CommonsLogger" );
	
	var wbBytes = plugins.http.getMediaData("media:///test.xlsx");
	var wb = scopes.svyExcelUtils.createWorkbook(wbBytes);
	
	jsunit.assertNotNull('Workbook should not be null', wb);
	
	var sheetNo = wb.getNumberOfSheets();
	jsunit.assertEquals('Workbook should have 3 sheets', 3, sheetNo);
	
	var sheetNameCustomers = wb.getSheetNameAt(1);
	jsunit.assertEquals('Sheet 1 should be \'Customers\'', 'Customers', sheetNameCustomers);
	
	var sheetCustomers = wb.getSheet('Customers');
	jsunit.assertNotNull('Sheet should not be null', sheetCustomers);
	
	var sheetCustomersFirstRowNum = sheetCustomers.getFirstRowNum();
	jsunit.assertEquals('First row in \'Customers\' should be 1', 1, sheetCustomersFirstRowNum);
	
	var sheetCustomersLastRowNum = sheetCustomers.getLastRowNum();
	jsunit.assertEquals('First row in \'Customers\' should be 1', 93, sheetCustomersLastRowNum);
	
	var sheetDataSet = sheetCustomers.getSheetData(true);
	jsunit.assertNotNull('Customer dataset should not be null', sheetDataSet);
	jsunit.assertEquals('Customer dataset should have 92 rows', 92, sheetDataSet.getMaxRowIndex());
	jsunit.assertEquals('Customer dataset should have 11 columns', 11, sheetDataSet.getMaxColumnIndex());
	
	var customerCell = sheetCustomers.getCell(5, 2); //B5 Around the Horn
	jsunit.assertEquals('Customer cell type should be text', scopes.svyExcelUtils.CELL_TYPE.STRING, customerCell.getCellType());
	jsunit.assertEquals('Customer cell should contain \'Around the Horn\'', 'Around the Horn', customerCell.getCellValue());
	jsunit.assertEquals('Customer dataset cell should contain \'Around the Horn\'', 'Around the Horn', sheetDataSet.getValue(4, 2));
	jsunit.assertEquals('Customer cell ref should be B5', 'B5', customerCell.getCellReference());
	
	var customerCellByReference = sheetCustomers.getCellByReference('B5');
	jsunit.assertEquals('Customer cell should contain \'Around the Horn\'', 'Around the Horn', customerCellByReference.getCellValue());
	
	for (var i = 1; i <= sheetCustomersLastRowNum; i++) {
		var customerRow = sheetCustomers.getRow(i);
		customerCell = customerRow.getCell(5);
		if (i === 1) {
			jsunit.assertEquals('Customer cell should match dataset column name', sheetDataSet.getColumnNames()[4], customerCell.getCellValue());				
		} else {
			jsunit.assertEquals('Customer cell should match dataset cell', sheetDataSet.getValue(i-1, 5), customerCell.getCellValue());	
		}
	}
	
	for (var t in scopes.svyExcelUtils.FILE_FORMAT) {
		var ending = 'xlsx';
		switch (scopes.svyExcelUtils.FILE_FORMAT[t]) {
			case scopes.svyExcelUtils.FILE_FORMAT.SXLSX:			
				break;
			case scopes.svyExcelUtils.FILE_FORMAT.XLSX:
				break;
			case scopes.svyExcelUtils.FILE_FORMAT.XLS:
				ending = 'xls';
				break;
			default:
				break;
		}
		var jsTargetFile = plugins.file.createTempFile('svyExcelUtils_test_', '.' + ending);
		var newWb = scopes.svyExcelUtils.createWorkbookFromDataSet(sheetDataSet, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], sheetDataSet.getColumnNames(), scopes.svyExcelUtils.FILE_FORMAT[t]);
		application.output(jsTargetFile.getAbsolutePath());
		newWb.writeToFile(jsTargetFile);	
		jsunit.assertTrue('Workbook should have been created and have more than 10.000 bytes', jsTargetFile.exists() && jsTargetFile.size() > 10000);
	}
	
}