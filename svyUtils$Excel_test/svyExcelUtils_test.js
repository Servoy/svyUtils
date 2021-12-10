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
	
	//create workbooks from dataset using different file formats
	for (var t in scopes.svyExcelUtils.FILE_FORMAT) {
		var suffix = 'xlsx';
		switch (scopes.svyExcelUtils.FILE_FORMAT[t]) {
			case scopes.svyExcelUtils.FILE_FORMAT.SXLSX:			
				break;
			case scopes.svyExcelUtils.FILE_FORMAT.XLSX:
				break;
			case scopes.svyExcelUtils.FILE_FORMAT.XLS:
				suffix = 'xls';
				break;
			default:
				break;
		}
		var jsTargetFile = plugins.file.createTempFile('svyExcelUtils_test_', '.' + suffix);
		var newWb = scopes.svyExcelUtils.createWorkbookFromDataSet(sheetDataSet, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], sheetDataSet.getColumnNames(), scopes.svyExcelUtils.FILE_FORMAT[t]);
		application.output('Workbook created in ' + jsTargetFile.getAbsolutePath());
		newWb.writeToFile(jsTargetFile);	
		jsunit.assertTrue('Workbook should have been created and have more than 10.000 bytes', jsTargetFile.exists() && jsTargetFile.size() > 10000);
	}
	
	//create a workbook from scratch
	wb = scopes.svyExcelUtils.createWorkbook(scopes.svyExcelUtils.FILE_FORMAT.XLSX);
	var sheet = wb.createSheet('Sheet 1');
	
	var headerStyle = wb.createCellStyle();
	var headerFont = wb.createFont('Calibri,1,11');
	headerFont.setColor(scopes.svyExcelUtils.INDEXED_COLOR.WHITE);
	headerStyle.setFont(headerFont);
	headerStyle.setFillForegroundColor(scopes.svyExcelUtils.INDEXED_COLOR.BLUE);
	headerStyle.setFillPattern(scopes.svyExcelUtils.FILL_PATTERN.SOLID_FOREGROUND);
	
	//HeaderFooter
	var pageFooter = sheet.sheet.getFooter();
	pageFooter.setCenter("Page " + scopes.svyExcelUtils.HeaderFooter.page() + " of " + scopes.svyExcelUtils.HeaderFooter.numPages());
	
	//header row
	var row = sheet.createRow(1);
	var cell = row.createCell(1, headerStyle, 'Text column');
	cell = row.createCell(2, headerStyle, 'Integer column');
	cell = row.createCell(3, headerStyle, 'Date column');
	cell = row.createCell(4, headerStyle, 'Number column');
	cell = row.createCell(5, headerStyle, 'Formula column');
	
	var dateStyle = wb.createCellStyle();
	dateStyle.setDataFormat('dd.MM.yyyy HH:mm');
	
	var now = new Date();
	for (i = 1; i <= 999; i++) {
		row = sheet.createRow(i+1);
		//Text cell
		cell = row.createCell(1);
		cell.setCellValue('Text ' + i);
		//Integer cell
		cell = row.createCell(2);
		cell.setCellValue(i);
		//Date cell
		cell = row.createCell(3, dateStyle);
		var randomDate = new Date(now.getTime() + Math.round(Math.random() * 100000 * 60 * 60 * 24));
		if (i === 499) {
			cell.setCellValue(now);
		} else {
			cell.setCellValue(randomDate);
		}
		//Number cell
		cell = row.createCell(4);
		cell.setCellValue(Math.random() * 10000);
		//Formula cell
		cell = row.createCell(5);
		cell.setCellFormula('B' + (i+1) + '+D' + (i+1));
	}
	
	//create total
	row = sheet.createRow(1001);
	cell = row.createCell(1);
	cell.setCellValue('Total');
	cell = row.createCell(5);
	cell.setCellFormula('SUM(E2:E1000)');
	
	sheet.setAutoFilter(1, 1, 1, 5);
	sheet.autoSizeColumn(1);
	sheet.autoSizeColumn(2);
	sheet.autoSizeColumn(3);
	sheet.autoSizeColumn(4);
	sheet.autoSizeColumn(5);
	sheet.createFreezePane(1, 2);
	jsTargetFile = plugins.file.createTempFile('svyExcelUtils_test_', '.' + suffix);
	wb.writeToFile(jsTargetFile);
	application.output('Custom workbook created in ' + jsTargetFile.getAbsolutePath());
	
	//read this back in
	wb = scopes.svyExcelUtils.createWorkbook(jsTargetFile);
	sheet = wb.getSheetAt(1);
	
	jsunit.assertEquals('Sheet should have 1001 rows', 1001, sheet.getPhysicalNumberOfRows());
	
	//get a row
	row = sheet.getRow(500);
	jsunit.assertEquals('Should have text "Text 499"', 'Text 499', row.getCell(1).getCellValue());
	jsunit.assertEquals('Should have integer 499', 499, row.getCell(2).getCellValue());
	jsunit.assertEquals('Should have formula "B500+D500"', "B500+D500", row.getCell(5).getCellFormula());
	jsunit.assertTrue('Should have a date value in column 3', row.getCell(3).getCellValue() instanceof Date);
	jsunit.assertEquals('Should have the "now" date in column 3', now, row.getCell(3).getCellValue());
}