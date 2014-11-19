/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"366CB6C8-B877-4945-AD89-B2EB29A64D3F"}
 */
var filePath = "C:\\sampleExcel.xls";

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7EF54742-A176-467F-9D97-2F1CAAAD2CDF"}
 */
var headerRow1 = "Test Row 1";

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"669B08BD-DACC-43CA-9645-E48044FD605E"}
 */
var headerRow2 = "Test Row 2";

/**
 * @type {Boolean}
 *
 * @properties={typeid:35,uuid:"13AC538A-F99D-4826-9982-CDB85AC49018",variableType:-4}
 */
var success;

/**
 * @properties={typeid:24,uuid:"FC29EB63-77DB-4D3A-B014-1FD8A93984BB"}
 */
function createExcelSheet() {

	// Create workbook and sheet
	var workbook = scopes.svyExcelUtils.createWorkbook();
	var sheet = workbook.createSheet("Test");

	// Create style for the header
	var headerStyle = workbook.createCellStyle();
	headerStyle.setFont("Arial,1,12").setFillPattern(scopes.svyExcelUtils.FILL_PATTERN.SOLID_FOREGROUND).setFillForegroundColor(scopes.svyExcelUtils.INDEXED_COLOR.LIGHT_ORANGE).setAlignment(scopes.svyExcelUtils.ALIGNMENT.CENTER);

	var rowNum = 1;

	// Create header row and cells
	var row = sheet.createRow(rowNum++);
	var cell = row.createCell(1);
	cell.setCellValue(headerRow1, headerStyle);

	cell = row.createCell(2);
	cell.setCellValue(headerRow2, headerStyle);

	// Create some data and write to the sheet
	var data = [[10, 35], [15, 47], [9, 22], [10, 33]];
	for (var i = 0; i < data.length; i++) {
		row = sheet.createRow(rowNum++);
		row.createCell(1).setCellValue(data[i][0]);
		row.createCell(2).setCellValue(data[i][1]);
	}

	// Create a style for the sum
	var sumStyle = workbook.createCellStyle();
	// Clone the default font, so we won't be changing the default
	var font = sumStyle.cloneFont();
	font.underline = scopes.svyExcelUtils.FONT_UNDERLINE.DOUBLE_ACCOUNTING;
	font.isBold = true;

	// Create formula cells at the bottom
	row = sheet.createRow(rowNum++);
	cell = row.createCell(1);
	cell.setCellStyle(sumStyle);
	cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 1, 1) + ")");

	cell = row.createCell(2);
	cell.setCellStyle(sumStyle);
	cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 2, 2) + ")");

	// Write to file
	if (workbook.writeToFile(filePath)) {
		success = 1
	} else {
		success = 0
	}
}
