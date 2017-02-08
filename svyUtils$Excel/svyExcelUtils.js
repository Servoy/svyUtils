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
 * @private
 *
 * @properties={typeid:35,uuid:"65F4692A-A648-4194-AC04-EE82CA94B295",variableType:-4}
 */
var logger = scopes.svyLogManager.getLogger("com.servoy.bap.svyexcelutils");

/**
 * Possible file formats used instead of templates when creating empty workbooks
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"C88BEC59-8BE3-4FE8-BA92-B13A8B507858",variableType:-4}
 */
var FILE_FORMAT = {
	XLS: 1,
	XLSX: 2
}

/**
 * Colors from the Excel color palette
 * 
 * @enum
 *
 * @type {Packages.org.apache.poi.ss.usermodel.IndexedColors}
 *
 * @properties={typeid:35,uuid:"855289A8-C79C-4F8B-A426-91856FAF9E4A",variableType:-4}
 */
var INDEXED_COLOR = {
	AQUA: Packages.org.apache.poi.ss.usermodel.IndexedColors.AQUA,
	BLACK: Packages.org.apache.poi.ss.usermodel.IndexedColors.BLACK,
	BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.BLUE,
	BLUE_GREY: Packages.org.apache.poi.ss.usermodel.IndexedColors.BLUE_GREY,
	BRIGHT_GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.BRIGHT_GREEN,
	BROWN: Packages.org.apache.poi.ss.usermodel.IndexedColors.BROWN,
	CORAL: Packages.org.apache.poi.ss.usermodel.IndexedColors.CORAL,
	CORNFLOWER_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.CORNFLOWER_BLUE,
	DARK_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.DARK_BLUE,
	DARK_GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.DARK_GREEN,
	DARK_RED: Packages.org.apache.poi.ss.usermodel.IndexedColors.DARK_RED,
	DARK_TEAL: Packages.org.apache.poi.ss.usermodel.IndexedColors.DARK_TEAL,
	DARK_YELLOW: Packages.org.apache.poi.ss.usermodel.IndexedColors.DARK_YELLOW,
	GOLD: Packages.org.apache.poi.ss.usermodel.IndexedColors.GOLD,
	GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.GREEN,
	GREY_25_PERCENT: Packages.org.apache.poi.ss.usermodel.IndexedColors.GREY_25_PERCENT,
	GREY_40_PERCENT: Packages.org.apache.poi.ss.usermodel.IndexedColors.GREY_40_PERCENT,
	GREY_50_PERCENT: Packages.org.apache.poi.ss.usermodel.IndexedColors.GREY_50_PERCENT,
	GREY_80_PERCENT: Packages.org.apache.poi.ss.usermodel.IndexedColors.GREY_80_PERCENT,
	INDIGO: Packages.org.apache.poi.ss.usermodel.IndexedColors.INDIGO,
	LAVENDER: Packages.org.apache.poi.ss.usermodel.IndexedColors.LAVENDER,
	LEMON_CHIFFON: Packages.org.apache.poi.ss.usermodel.IndexedColors.LEMON_CHIFFON,
	LIGHT_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE,
	LIGHT_CORNFLOWER_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_CORNFLOWER_BLUE,
	LIGHT_GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_GREEN,
	LIGHT_ORANGE: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_ORANGE,
	LIGHT_TURQUOISE: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_TURQUOISE,
	LIGHT_YELLOW: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIGHT_YELLOW,
	LIME: Packages.org.apache.poi.ss.usermodel.IndexedColors.LIME,
	MAROON: Packages.org.apache.poi.ss.usermodel.IndexedColors.MAROON,
	OLIVE_GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.OLIVE_GREEN,
	ORANGE: Packages.org.apache.poi.ss.usermodel.IndexedColors.ORANGE,
	ORCHID: Packages.org.apache.poi.ss.usermodel.IndexedColors.ORCHID,
	PALE_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.PALE_BLUE,
	PINK: Packages.org.apache.poi.ss.usermodel.IndexedColors.PINK,
	PLUM: Packages.org.apache.poi.ss.usermodel.IndexedColors.PLUM,
	RED: Packages.org.apache.poi.ss.usermodel.IndexedColors.RED,
	ROSE: Packages.org.apache.poi.ss.usermodel.IndexedColors.ROSE,
	ROYAL_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.ROYAL_BLUE,
	SEA_GREEN: Packages.org.apache.poi.ss.usermodel.IndexedColors.SEA_GREEN,
	SKY_BLUE: Packages.org.apache.poi.ss.usermodel.IndexedColors.SKY_BLUE,
	TAN: Packages.org.apache.poi.ss.usermodel.IndexedColors.TAN,
	TEAL: Packages.org.apache.poi.ss.usermodel.IndexedColors.TEAL,
	TURQUOISE: Packages.org.apache.poi.ss.usermodel.IndexedColors.TURQUOISE,
	VIOLET: Packages.org.apache.poi.ss.usermodel.IndexedColors.VIOLET,
	WHITE: Packages.org.apache.poi.ss.usermodel.IndexedColors.WHITE,
	YELLOW: Packages.org.apache.poi.ss.usermodel.IndexedColors.YELLOW
}

/**
 * Horizontal alignments used in ExcelCellStyle
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"DEA33F4D-6CCD-404C-BC04-7453C0298204",variableType:-4}
 */
var ALIGNMENT = {
	CENTER: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_CENTER,
	CENTER_SELECTION: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_CENTER_SELECTION,
	FILL: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_FILL,
	GENERAL: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_GENERAL,
	JUSTIFY: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_JUSTIFY,
	LEFT: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_LEFT,
	RIGHT: Packages.org.apache.poi.ss.usermodel.CellStyle.ALIGN_RIGHT
}

/**
 * Vertical alignments used in ExcelCellStyle
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"ECC742E2-74A1-4BCC-A0AA-FC8018B4F70E",variableType:-4}
 */
var VERTICAL_ALIGNMENT = {
	BOTTOM: Packages.org.apache.poi.ss.usermodel.CellStyle.VERTICAL_BOTTOM,
	CENTER: Packages.org.apache.poi.ss.usermodel.CellStyle.VERTICAL_CENTER,
	JUSTIFY: Packages.org.apache.poi.ss.usermodel.CellStyle.VERTICAL_JUSTIFY,
	TOP: Packages.org.apache.poi.ss.usermodel.CellStyle.VERTICAL_TOP
}

/**
 * Underline patterns used in ExcelFont
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"2B464E4E-1039-4D3A-AC13-4ABE1F39487A",variableType:-4}
 */
var FONT_UNDERLINE = {
	DOUBLE: Packages.org.apache.poi.hssf.usermodel.HSSFFont.U_DOUBLE,
	DOUBLE_ACCOUNTING: Packages.org.apache.poi.hssf.usermodel.HSSFFont.U_DOUBLE_ACCOUNTING,
	NONE: Packages.org.apache.poi.hssf.usermodel.HSSFFont.U_NONE,
	SINGLE: Packages.org.apache.poi.hssf.usermodel.HSSFFont.U_SINGLE,
	SINGLE_ACCOUNTING: Packages.org.apache.poi.hssf.usermodel.HSSFFont.U_SINGLE_ACCOUNTING
}

/**
 * Borders used in ExcelCellStyle
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"EBD9777E-A1E9-4E97-AD9B-2A539697CDED",variableType:-4}
 */
var BORDER = {
	DASH_DOT: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_DASH_DOT,
	DASH_DOT_DOT: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_DASH_DOT_DOT,
	DASHED: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_DASHED,
	DOTTED: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_DOTTED,
	DOUBLE: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_DOUBLE,
	HAIR: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_HAIR,
	MEDIUM: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_MEDIUM,
	MEDIUM_DASH_DOT: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_MEDIUM_DASH_DOT,
	MEDIUM_DASH_DOT_DOT: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_MEDIUM_DASH_DOT_DOT,
	MEDIUM_DASHED: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_MEDIUM_DASHED,
	NONE: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_NONE,
	SLANTED_DASH_DOT: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_SLANTED_DASH_DOT,
	THICK: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_THICK,
	THIN: Packages.org.apache.poi.ss.usermodel.CellStyle.BORDER_THIN
}

/**
 * Fill patterns used in ExcelCellStyle
 * 
 * @enum
 * 
 * @properties={typeid:35,uuid:"3ADD93AE-0FEE-4454-8FBB-0528D00B579C",variableType:-4}
 */
var FILL_PATTERN = {
	NO_FILL: Packages.org.apache.poi.ss.usermodel.CellStyle.NO_FILL,
	SOLID_FOREGROUND: Packages.org.apache.poi.ss.usermodel.CellStyle.SOLID_FOREGROUND,
	FINE_DOTS: Packages.org.apache.poi.ss.usermodel.CellStyle.FINE_DOTS,
	ALT_BARS: Packages.org.apache.poi.ss.usermodel.CellStyle.ALT_BARS,
	SPARSE_DOTS: Packages.org.apache.poi.ss.usermodel.CellStyle.SPARSE_DOTS,
	THICK_HORZ_BANDS: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_HORZ_BANDS,
	THICK_VERT_BANDS: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_VERT_BANDS,
	THICK_BACKWARD_DIAG: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_BACKWARD_DIAG,
	THICK_FORWARD_DIAG: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_FORWARD_DIAG,
	BIG_SPOTS: Packages.org.apache.poi.ss.usermodel.CellStyle.BIG_SPOTS,
	BRICKS: Packages.org.apache.poi.ss.usermodel.CellStyle.BRICKS,
	THIN_HORZ_BANDS: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_HORZ_BANDS,
	THIN_VERT_BANDS: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_VERT_BANDS,
	THIN_BACKWARD_DIAG: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_FORWARD_DIAG,
	THIN_FORWARD_DIAG: Packages.org.apache.poi.ss.usermodel.CellStyle.THICK_FORWARD_DIAG,
	SQUARES: Packages.org.apache.poi.ss.usermodel.CellStyle.SQUARES,
	DIAMONDS: Packages.org.apache.poi.ss.usermodel.CellStyle.DIAMONDS
}

/**
 * Panes of a sheet used in split panes
 * 
 * @enum 
 * 
 * @type {byte}
 *
 * @properties={typeid:35,uuid:"C1EAA619-7C53-4E3C-8236-FD83E12B3FE3",variableType:-4}
 */
var SHEET_PANE = {
	LOWER_RIGHT: Packages.org.apache.poi.ss.usermodel.Sheet.PANE_LOWER_RIGHT,
	LOWER_LEFT: Packages.org.apache.poi.ss.usermodel.Sheet.PANE_LOWER_LEFT,
	UPPER_LEFT: Packages.org.apache.poi.ss.usermodel.Sheet.PANE_UPPER_LEFT,
	UPPER_RIGHT: Packages.org.apache.poi.ss.usermodel.Sheet.PANE_UPPER_RIGHT
}

/**
 * Possible cell types
 * 
 * @enum 
 * 
 * @properties={typeid:35,uuid:"9FF3C911-31DA-416B-86DE-13A8F69ADD96",variableType:-4}
 */
var CELL_TYPE = {
	BLANK: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BLANK,
	BOOLEAN: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN,
	ERROR: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_ERROR,
	FORMULA: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_FORMULA,
	NUMERIC: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC,
	STRING: Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_STRING
}

/**
 * Possible paper sizes for a PrintSetup
 * 
 * @enum
 *  
 * @properties={typeid:35,uuid:"B7BD0408-60E3-48E2-B263-4A185F7AF05D",variableType:-4}
 */
var PAPER_SIZE = {
	A3_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A3_PAPERSIZE,
	A4_EXTRA_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_EXTRA_PAPERSIZE,
	A4_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_PAPERSIZE,
	A4_PLUS_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_PLUS_PAPERSIZE,
	A4_ROTATED_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_ROTATED_PAPERSIZE,
	A4_SMALL_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_SMALL_PAPERSIZE,
	A4_TRANSVERSE_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A4_TRANSVERSE_PAPERSIZE,
	A5_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.A5_PAPERSIZE,
	B4_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.B4_PAPERSIZE,
	B5_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.B5_PAPERSIZE,
	ELEVEN_BY_SEVENTEEN_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ELEVEN_BY_SEVENTEEN_PAPERSIZE,
	ENVELOPE_10_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_10_PAPERSIZE,
	ENVELOPE_9_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_9_PAPERSIZE,
	ENVELOPE_C3_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_C3_PAPERSIZE,
	ENVELOPE_C4_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_C4_PAPERSIZE,
	ENVELOPE_C5_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_C5_PAPERSIZE,
	ENVELOPE_C6_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_C6_PAPERSIZE,
	ENVELOPE_CS_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_CS_PAPERSIZE,
	ENVELOPE_DL_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_DL_PAPERSIZE,
	ENVELOPE_MONARCH_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.ENVELOPE_MONARCH_PAPERSIZE,
	EXECUTIVE_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.EXECUTIVE_PAPERSIZE,
	FOLIO8_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.FOLIO8_PAPERSIZE,
	LEDGER_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.LEDGER_PAPERSIZE,
	LEGAL_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.LEGAL_PAPERSIZE,
	LETTER_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.LETTER_PAPERSIZE,
	LETTER_ROTATED_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.LETTER_ROTATED_PAPERSIZE,
	LETTER_SMALL_PAGESIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.LETTER_SMALL_PAGESIZE,
	NOTE8_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.NOTE8_PAPERSIZE,
	PRINTER_DEFAULT_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.PRINTER_DEFAULT_PAPERSIZE,
	QUARTO_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.QUARTO_PAPERSIZE,
	STATEMENT_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.STATEMENT_PAPERSIZE,
	TABLOID_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.TABLOID_PAPERSIZE,
	TEN_BY_FOURTEEN_PAPERSIZE: Packages.org.apache.poi.ss.usermodel.PrintSetup.TEN_BY_FOURTEEN_PAPERSIZE
}

/**
 * @type {PrintSetup}
 * 
 * @private 
 *
 * @properties={typeid:35,uuid:"67212952-2D5F-421C-8B00-72026DF20A66",variableType:-4}
 */
var defaultPrintSetup;

/**
 * Returns an empty ExcelWorkbook
 * 
 * @public 
 * 
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either an existing Excel file as template or one of the FILE_FORMAT constants when creating empty workbooks
 * 
 * @return {ExcelWorkbook}
 * 
 * @example <pre>
 * // Create workbook and sheet
 * var workbook = scopes.svyExcelUtils.createWorkbook(scopes.svyExcelUtils.FILE_FORMAT.XLSX);
 * var sheet = workbook.createSheet("Test");
 * 
 * // Create style for the header
 * var headerStyle = workbook.createCellStyle();
 * headerStyle
 *    .setFont("Arial,1,12")
 *    .setFillPattern(scopes.svyExcelUtils.FILL_PATTERN.SOLID_FOREGROUND)
 *    .setFillForegroundColor(scopes.svyExcelUtils.INDEXED_COLOR.LIGHT_ORANGE)
 *    .setAlignment(scopes.svyExcelUtils.ALIGNMENT.CENTER);
 * 
 * var rowNum = 1;
 * 
 * // Create header row and cells
 * var row = sheet.createRow(rowNum ++);
 * var cell = row.createCell(1);
 * cell.setCellValue("Test 1", headerStyle);
 * 
 * cell = row.createCell(2);
 * cell.setCellValue("Test 2", headerStyle);
 * 
 * // Create some data and write to the sheet
 * var data = [[10, 35], [15, 47], [9, 22], [10, 33]];
 * for (var i = 0; i < data.length; i++) {
 *    row = sheet.createRow(rowNum ++);
 *    row.createCell(1).setCellValue(data[i][0]);
 *    row.createCell(2).setCellValue(data[i][1]);
 * }
 * 
 * // Create a style for the sum
 * var sumStyle = workbook.createCellStyle();
 * // Clone the default font, so we won't be changing the default
 * var font = sumStyle.cloneFont();
 * font.underline = scopes.svyExcelUtils.FONT_UNDERLINE.DOUBLE_ACCOUNTING;
 * font.isBold = true;
 * 
 * // Create formula cells at the bottom
 * row = sheet.createRow(rowNum ++);
 * cell = row.createCell(1);
 * cell.setCellStyle(sumStyle);
 * cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 1, 1) + ")");
 * 
 * cell = row.createCell(2);
 * cell.setCellStyle(sumStyle);
 * cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 2, 2) + ")");
 * 
 * // Write to file
 * var success = workbook.writeToFile("d:\\test.xls");
 * </pre>
 *
 * @properties={typeid:24,uuid:"CCF85B3E-E45B-4797-9A45-06C679BD252B"}
 */
function createWorkbook(templateOrFileType) {
	return new ExcelWorkbook(templateOrFileType);
}

/**
 * Returns an ExcelWorkbook from the given file or media URL
 * 
 * @public 
 * 
 * @param {String|plugins.file.JSFile} original - path to the file, file or media URL
 * 
 * @return {ExcelWorkbook}
 *
 * @properties={typeid:24,uuid:"4367675B-91F3-4407-8124-541C0F06B603"}
 */
function getWorkbook(original) {
	return new ExcelWorkbook(original);
}

/**
 * Creates an ExcelWorkbook from the given foundset<p>
 * 
 * If a templateOrFileType is provided, the foundset will be inserted in the given sheet
 * 
 * @public 
 * 
 * @param {JSFoundSet} foundset - the foundset
 * @param {Array<String>} dataproviders - the dataproviders to be used for the excel sheet
 * @param {Array<String>} [headers] - the text to be used as column headers
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either file or media URL pointing to an existing Excel to be used as templateOrFileType or one of the FILE_FORMAT constants when creating empty workbooks
 * @param {String} [sheetNameToUse] - when a template is used, this is the name of the sheet to be filled
 * 
 * @return {FoundSetExcelWorkbook}
 *
 * @properties={typeid:24,uuid:"23327BCA-78A2-43C8-8017-66EB9AF6AEFA"}
 */
function createWorkbookFromFoundSet(foundset, dataproviders, headers, templateOrFileType, sheetNameToUse) {
	return new FoundSetExcelWorkbook(foundset, dataproviders, headers, templateOrFileType, sheetNameToUse);
}

/**
 * Creates an ExcelWorkbook from the given dataset<p>
 * 
 * If a template is provided, the dataset will be inserted in the given sheet
 * 
 * @public 
 * 
 * @param {JSDataSet} dataset - the dataset
 * @param {Array<Number>} [columns] - the column numbers to be included in the sheet
 * @param {Array<String>} [headers] - the text to be used as column headers
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either file or media URL pointing to an existing Excel to be used as template or one of the FILE_FORMAT constants when creating empty workbooks
 * @param {String} [sheetNameToUse] - when a template is used, this is the name of the sheet to be filled
 * 
 * @return {DataSetExcelWorkbook}
 *
 * @properties={typeid:24,uuid:"8C20858C-E1C9-4639-ABD7-15B516BA369B"}
 */
function createWorkbookFromDataSet(dataset, columns, headers, templateOrFileType, sheetNameToUse) {
	return new DataSetExcelWorkbook(dataset, columns, headers, templateOrFileType, sheetNameToUse);
}

/**
 * Creates an empty Excel workbook or reads the one provided
 *
 * @constructor
 * 
 * @public 
 *
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either an existing Excel file as template or one of the FILE_FORMAT constants when creating empty workbooks
 * 
 * @example <pre>
 * // Create workbook and sheet
 * var workbook = new scopes.svyExcelUtils.Workbook(scopes.svyExcelUtils.FILE_FORMAT.XLSX);
 * var sheet = workbook.createSheet("Test");
 * 
 * // Create style for the header
 * var headerStyle = workbook.createCellStyle();
 * headerStyle
 *    .setFont("Arial,1,12")
 *    .setFillPattern(scopes.svyExcelUtils.FILL_PATTERN.SOLID_FOREGROUND)
 *    .setFillForegroundColor(scopes.svyExcelUtils.INDEXED_COLOR.LIGHT_ORANGE)
 *    .setAlignment(scopes.svyExcelUtils.ALIGNMENT.CENTER);
 * 
 * var rowNum = 1;
 * 
 * // Create header row and cells
 * var row = sheet.createRow(rowNum ++);
 * var cell = row.createCell(1);
 * cell.setCellValue("Test 1", headerStyle);
 * 
 * cell = row.createCell(2);
 * cell.setCellValue("Test 2", headerStyle);
 * 
 * // Create some data and write to the sheet
 * var data = [[10, 35], [15, 47], [9, 22], [10, 33]];
 * for (var i = 0; i < data.length; i++) {
 *    row = sheet.createRow(rowNum ++);
 *    row.createCell(1).setCellValue(data[i][0]);
 *    row.createCell(2).setCellValue(data[i][1]);
 * }
 * 
 * // Create a style for the sum
 * var sumStyle = workbook.createCellStyle();
 * // Clone the default font, so we won't be changing the default
 * var font = sumStyle.cloneFont();
 * font.underline = scopes.svyExcelUtils.FONT_UNDERLINE.DOUBLE_ACCOUNTING;
 * font.isBold = true;
 * 
 * // Create formula cells at the bottom
 * row = sheet.createRow(rowNum ++);
 * cell = row.createCell(1);
 * cell.setCellStyle(sumStyle);
 * cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 1, 1) + ")");
 * 
 * cell = row.createCell(2);
 * cell.setCellStyle(sumStyle);
 * cell.setCellFormula("SUM(" + scopes.svyExcelUtils.getCellReferenceFromRange(2, 1 + data.length, 2, 2) + ")");
 * 
 * // Write to file
 * var success = workbook.writeToFile("d:\\test.xls");
 * </pre>
 * 
 * @properties={typeid:24,uuid:"397FC940-8B31-44D7-BE4A-AA02A65A8981"}
 */
function ExcelWorkbook(templateOrFileType) {
	
	if (!(this instanceof ExcelWorkbook)) {
		logger.warn("ExcelWorkbook constructor called without the \"new\" keyword");
		return new ExcelWorkbook(templateOrFileType);
	}

	/**
	 * The internal workbook object
	 * @type {Packages.org.apache.poi.ss.usermodel.Workbook}
	 */
	this.wb = null;

	if (!templateOrFileType) {
		templateOrFileType = FILE_FORMAT.XLS;
	}

	//workbook factory
	var factory = Packages.org.apache.poi.ss.usermodel.WorkbookFactory;

	if (templateOrFileType instanceof Number) {
		/** @type {Number} */
		var format = templateOrFileType;
		if (format == FILE_FORMAT.XLS) {
			this.wb = new Packages.org.apache.poi.hssf.usermodel.HSSFWorkbook();
		} else {
			this.wb = new Packages.org.apache.poi.xssf.usermodel.XSSFWorkbook();
		}
	} else if (templateOrFileType instanceof String) {
		/** @type {String} */
		var filePathOrUrl = templateOrFileType;
		if (filePathOrUrl.indexOf("media:///") >= 0) {
			var wbData = plugins.http.getMediaData(filePathOrUrl);
			var bis = new java.io.ByteArrayInputStream(wbData);
			this.wb = factory.create(bis);
		} else {
			this.wb = factory.create(new java.io.File(plugins.file.convertToJSFile(filePathOrUrl).getAbsolutePath()));
		}
	} else if (templateOrFileType instanceof plugins.file.JSFile) {
		/** @type {plugins.file.JSFile} */
		var jsFile = templateOrFileType;
		this.wb = factory.create(new java.io.File(jsFile.getAbsolutePath()));
	} else {
		throw new scopes.svyExceptions.IllegalArgumentException("Wrong arguments provided for ExcelWorkbook");
	}
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"5D3DBE94-9302-45D7-969B-2CA6AD0B8BD2",variableType:-4}
 */
var initExcelWorkbook = (function() {
	ExcelWorkbook.prototype = Object.create(Object.prototype, {});
	ExcelWorkbook.prototype.constructor = ExcelWorkbook;
	
	/**
	 * Creates a sheet with the given name<p>
	 * This method makes sure that no illegal names are provided and might change the name if needed
	 * 
	 * @param {String} sheetName
	 * @return {ExcelSheet}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.createSheet = function(sheetName) {
		var sName = Packages.org.apache.poi.ss.util.WorkbookUtil.createSafeSheetName(sheetName);
		var result = new ExcelSheet(this.wb.createSheet(sName));
		if (defaultPrintSetup) {
			result.setPrintSetup(defaultPrintSetup);
		}
		return result;
	}
	
	/**
	 * Returns the ExcelSheet object at the given index
	 * 
	 * @param {Number} index
	 * @return {ExcelSheet}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getSheetAt = function(index) {
		var s = this.wb.getSheetAt(index - 1);
		if (!s) return null;
		return new ExcelSheet(s);
	}
	
	/**
	 * Returns the sheet with the given name (case insensitive match)
	 * 
	 * @param {String} sheetName
	 * @return {ExcelSheet}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getSheet = function(sheetName) {
		var s = this.wb.getSheet(sheetName);
		if (!s) return null;
		return new ExcelSheet(s);
	}
	
	/**
	 * Returns the name of the sheet at the given index
	 * 
	 * @param {Number} index
	 * @return {String} sheetName
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getSheetNameAt = function(index) {
		return this.wb.getSheetName(index - 1);
	}
	
	/**
	 * Returns all sheet names
	 * 
	 * @return {Array<String>}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getSheetNames = function() {
		var sheetNum = this.wb.getNumberOfSheets();
		var result = [];
		for (var i = 0; i < sheetNum; i++) {
			result.push(this.wb.getSheetName(i));
		}
		return result;
	}
	
	/**
	 * Returns the number of spreadsheets in the workbook
	 * 
	 * @return {Number}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getNumberOfSheets = function() {
		return this.wb.getNumberOfSheets();
	}
	
	/**
	 * Writes this workbook to the given targetFile
	 * 
	 * @param {plugins.file.JSFile|String} targetFile
	 * @return {Boolean} success
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.writeToFile = function(targetFile) {
		/** @type {String} */
		var filePath = targetFile;
		if (targetFile instanceof plugins.file.JSFile) {
			filePath = targetFile.getAbsolutePath();
		}

		var fileOut;
		try {
			fileOut = new java.io.FileOutputStream(filePath);
			this.wb.write(fileOut);
			fileOut.close();
			return true;
		} catch (e) {
			logger.error(e.message);
		} finally {
			if (fileOut != null) {
				try {
					fileOut.close();
				} catch (e) {
				}
			}
		}

		return false;
	}
	
	/**
	 * Returns this workbook as a byte[] array
	 * 
	 * @return {Array<byte>}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.getBytes = function() {
		try {
			var bytesOut = new java.io.ByteArrayOutputStream();
			this.wb.write(bytesOut);
			bytesOut.close();
			return bytesOut.toByteArray();
		} catch (e) {
			logger.error(e.message);
		} finally {
			if (bytesOut) {
				try {
					bytesOut.close();
				} catch(e) {
				}
			}
		}
		return null;
	}
	
	/**
	 * Creates an empty ExcelCellStyle
	 * 
	 * @return {ExcelCellStyle}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.createCellStyle = function() {
		var cs = this.wb.createCellStyle();
		return new ExcelCellStyle(cs, this.wb);
	}
	
	/**
	 * Clones the given ExcelCellStyle
	 * 
	 * @param {ExcelCellStyle} cellStyle
	 * @return {ExcelCellStyle}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.cloneCellStyle = function(cellStyle) {
		var cs = this.wb.createCellStyle();
		var result = new ExcelCellStyle(cs, this.wb);
		result.cloneStyleFrom(cellStyle);
		return result;
	}	
	
	/**
	 * Creates a font
	 * 
	 * @return {ExcelFont}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.createFont = function(fontString) {
		return createExcelFontFromString(this.wb, fontString);
	}
	
	/**
	 * Clones the given font and returns a new ExcelFont
	 * 
	 * @param {ExcelFont} font
	 * @return {ExcelFont}
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.cloneFont = function(font) {
		/** @type {Packages.org.apache.poi.ss.usermodel.Font} */
		var result = this.wb.createFont();
		/** @type {Packages.org.apache.poi.ss.usermodel.Font} */
		var original = font.getFont();
		result.setBoldweight(original.getBoldweight());
		result.setCharSet(original.getCharSet());
		result.setColor(original.getColor());
		result.setFontHeight(original.getFontHeight());
		result.setFontName(original.getFontName());
		result.setItalic(original.getItalic());
		result.setStrikeout(original.getStrikeout());
		result.setTypeOffset(original.getTypeOffset());
		result.setUnderline(original.getUnderline());
		return new ExcelFont(result);
	}
	
	/**
	 * Creates an ExcelSheet from an existing sheet in the Workbook
	 * 
	 * @param {Number} indexToClone one based
	 * @return {ExcelSheet} clone
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.cloneSheet = function(indexToClone) {
		var clonedSheet = this.wb.cloneSheet(indexToClone - 1);
		return new ExcelSheet(clonedSheet);
	}
	
	/**
	 * Sets the sheet name
	 * 
	 * @param {Number} index
	 * @param {String} name
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.setSheetNameAt = function(index, name) {
		try {
			this.wb.setSheetName(index - 1, name);
		} catch (e) {
			logger.error("Error setting sheet name: " + e.message);
		}
	}
	
	/**
	 * Removes the sheet at the given index
	 * 
	 * @param {Number} index
	 * @this {ExcelWorkbook}
	 */
	ExcelWorkbook.prototype.removeSheetAt = function(index) {
		this.wb.removeSheetAt(index-1);
	}
}());

/**
 * @constructor 
 * @extends {ExcelWorkbook}
 * @private 
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either an existing Excel file as template or one of the FILE_FORMAT constants when creating empty workbooks
 * @param {String} sheetNameToUse
 *
 * @properties={typeid:24,uuid:"62218771-88C9-4D58-954C-4B39A92F8513"}
 */
function ServoyExcelWorkbook(templateOrFileType, sheetNameToUse) {
	
	if (!(this instanceof ServoyExcelWorkbook)) {
		logger.warn("ServoyExcelWorkbook constructor called without the \"new\" keyword");
		return new ServoyExcelWorkbook(templateOrFileType, sheetNameToUse);
	}
	
	ExcelWorkbook.call(this, templateOrFileType);
	
	/**
	 * The style used for the header of the data
	 * @type {ExcelCellStyle}
	 */
	this.headerStyle = null;

	/**
	 * @type {Array<ExcelCellStyle>}
	 */
	this.columnStyles = [];

	/**
	 * @type {Array<String>}
	 */
	this.columnFormats = [];	

	/**
	 * The style used for a data cell
	 * @type {ExcelCellStyle}
	 */
	this.rowStyle = null;
	
	/**
	 * The default format used to format date values<p>
	 * This can be overriden for specific columns by calling <code>setFormatForColumn()</code>
	 * @type {String}
	 */
	this.defaultDateFormat = i18n.getDefaultDateFormat();
	
	/**
	 * The default format used to format number values<p>
	 * This can be overriden for specific columns by calling <code>setFormatForColumn()</code>
	 * @type {String}
	 */
	this.defaultNumberFormat = i18n.getDefaultNumberFormat();

	/**
	 * The ExcelWorkbook created
	 * @type {ExcelWorkbook}
	 */
	this.workbook = new ExcelWorkbook(templateOrFileType);	
	
	/**
	 * The ExcelSheet used or created
	 * @type {ExcelSheet}
	 */
	this.sheet = null;
	if (templateOrFileType && !(templateOrFileType instanceof Number)) {
		if (sheetNameToUse) {
			this.sheet = this.workbook.getSheet(sheetNameToUse);
			if (!this.sheet) {
				this.sheet = this.workbook.getSheetAt(1);
			}
		} else {
			this.sheet = this.workbook.getSheetAt(1);
		}
	} else {
		this.sheet = this.workbook.createSheet("Export");
	}
	
	/**
	 * The name of the sheet to be used<p>
	 * When a template is used, data will be inserted in the<br>
	 * sheet with this name or the first best if not found
	 * @type {String}
	 */
	this.sheetName = this.sheet.name;

	/**
	 * Whether the header row is frozen or not
	 * @type {Boolean}
	 */
	this.freezeFirstRow = false;

	/**
	 * Whether or not all data columns should be auto sized
	 * @type {Boolean}
	 */
	this.autoSizeColumns = true;

	/**
	 * The first row where data will be inserted (one based)
	 * @type {Number}
	 */
	this.startRow = 1;

	/**
	 * The first column where data will be inserted (one based)
	 * @type {Number}
	 */
	this.startColumn = 1;

	/**
	 * Whether or not the data columns should be auto filtered or not
	 * @type {Boolean}
	 */
	this.setAutoFilter = false;
	
	/**
	 * Override this method in a subclass
	 */
	this.fillData = function() {
		
	}
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"FEBE6A80-7206-4430-9389-A93E8199B52B",variableType:-4}
 */
var initServoyExcelWorkbook = (function() {
	ServoyExcelWorkbook.prototype = Object.create(ExcelWorkbook.prototype, {});
	ServoyExcelWorkbook.prototype.constructor = ServoyExcelWorkbook;
	
	Object.defineProperty(ServoyExcelWorkbook.prototype, "sheetName", {
		get: function() {
			if (this.sheet) {
				return this.sheet.name;
			} else {
				return null;
			}
		},
		set: function(x) {
			if (x && this.sheet) {
				this.sheet.name = x;
			}
		}
	})
	
	/**
	 * Returns the data of this workbook as a byte[]
	 * @return {Array<byte>} bytes
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.getBytes = function() {
		this.fillData();
		return this.workbook.getBytes();
	}
	
	/**
	 * Writes this workbook to the given file
	 * @param {String|plugins.file.JSFile} targetFile
	 * @return {Boolean} success
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.writeToFile = function(targetFile) {
		this.fillData();
		return this.workbook.writeToFile(targetFile);
	}
	
	/**
	 * Sets a date or number format used for the given column
	 * @param {Number} columnIndex
	 * @param {String} format
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.setFormatForColumn = function(columnIndex, format) {
		this.columnFormats[columnIndex - 1] = format;
	}
	
	/**
	 * Creates and returns an ExcelCellStyle used for a specific column
	 * @param {Number} columnIndex
	 * @return {ExcelCellStyle}
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.createColumnStyle = function(columnIndex) {
		var style = this.workbook.createCellStyle();
		this.columnStyles[columnIndex - 1] = style;
		return style;
	}
	
	/**
	 * Creates and returns an ExcelCellStyle used for a data row
	 * @return {ExcelCellStyle}
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.createRowStyle = function() {
		this.rowStyle = this.workbook.createCellStyle();
		return this.rowStyle;
	}
	
	/**
	 * Creates and returns an ExcelCellStyle used for the header row
	 * @return {ExcelCellStyle}
	 * @this {ServoyExcelWorkbook}
	 */
	ServoyExcelWorkbook.prototype.createHeaderStyle = function() {
		this.headerStyle = this.workbook.createCellStyle();
		return this.headerStyle;
	}
}())

/**
 * A FoundSet based Excel workbook
 *
 * @constructor
 * @extends {ServoyExcelWorkbook}
 * 
 * @public 
 *
 * @param {JSFoundSet} foundset - the foundset
 * @param {Array<String>} dataproviders - the dataproviders to be used for the excel sheet
 * @param {Array<String>} [headers] - the text to be used as column headers
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either file or media URL pointing to an existing Excel to be used as template or one of the FILE_FORMAT constants when creating empty workbooks
 * @param {String} [sheetNameToUse] - when a template is used, this is the name of the sheet to be filled
 *
 * @properties={typeid:24,uuid:"98D3A864-3E94-47AD-99E6-4B77046BDFEC"}
 */
function FoundSetExcelWorkbook(foundset, dataproviders, headers, templateOrFileType, sheetNameToUse) {
	
	if (!(this instanceof FoundSetExcelWorkbook)) {
		logger.warn("FoundSetExcelWorkbook constructor called without the \"new\" keyword");
		return new FoundSetExcelWorkbook(foundset, dataproviders, headers, templateOrFileType);
	}
	
	ServoyExcelWorkbook.call(this, templateOrFileType, sheetNameToUse);
	
	/**
	 * @type {Boolean}
	 */
	var dataFilled = false;	
	
	/**
	 * The foundset used to create this workbook
	 * @type {JSFoundSet}
	 */
	this.foundset = foundset;
	
	if (!headers) {
		this.setAutoFilter = false;
		this.freezeFirstRow = false;		
	}

	/**
	 * Fills the sheet with the data of the foundset<p>
	 * This is automatically done when <code>writeToFile()</code> or <code>getBytes()</code> is called
	 */
	this.fillData = function() {
		if (dataFilled) return;

		if (!this.headerStyle) {
			var headerFont = this.workbook.createFont('Calibri,1,10');
			this.headerStyle = this.workbook.createCellStyle();
			this.headerStyle.setFont(headerFont);
			this.headerStyle.setFillForegroundColor(INDEXED_COLOR.GREY_25_PERCENT);
			this.headerStyle.setFillPattern(FILL_PATTERN.SOLID_FOREGROUND);
		}

		var rowNum = this.startRow;
		var row, cell;
		if (headers) {
			row = this.sheet.insertRowAt(rowNum);
			for (var i = 0; i < headers.length; i++) {
				cell = row.createCell(this.startColumn + i);
				cell.setCellValue(headers[i]);
				cell.setCellStyle(this.headerStyle);
			}
			rowNum ++;
		}
		
		if (!this.rowStyle) {
			var font = this.workbook.createFont('Calibri,0,10');
			this.rowStyle = this.workbook.createCellStyle();
			this.rowStyle.setFont(font);
		}

		var numberCellStyle = this.workbook.createCellStyle();
		numberCellStyle.cloneStyleFrom(this.rowStyle);
		numberCellStyle.setAlignment(ALIGNMENT.RIGHT);
		numberCellStyle.setDataFormat(this.defaultNumberFormat);

		var dateCellStyle = this.workbook.createCellStyle();
		dateCellStyle.cloneStyleFrom(this.rowStyle);
		dateCellStyle.setDataFormat(this.defaultDateFormat);

		var cellFormatToUse;
		for (i = 0; i < this.columnFormats.length; i++) {
			if (this.columnFormats[i]) {
				if (this.columnStyles[i]) {
					cellFormatToUse = this.columnStyles[i];
				} else {
					this.columnStyles[i] = cellFormatToUse = this.workbook.createCellStyle();
					cellFormatToUse.cloneStyleFrom(this.rowStyle);
				}
				cellFormatToUse.setDataFormat(this.columnFormats[i]);
			}
		}

		for (i = 1; i <= foundset.getSize(); i++) {
			var record = foundset.getRecord(i);
			row = this.sheet.insertRowAt(rowNum + (i-1));

			for (var d = 0; d < dataproviders.length; d++) {
				cell = row.createCell(this.startColumn + d);
				var dpValue = record[dataproviders[d]];
				cell.setCellValue(dpValue);
				if (this.columnStyles[d]) {
					cell.setCellStyle(this.columnStyles[d]);
				} else if (dpValue instanceof Number) {
					cell.setCellStyle(numberCellStyle);
				} else if (dpValue instanceof Date) {
					cell.setCellStyle(dateCellStyle);
				} else {
					cell.setCellStyle(this.rowStyle);
				}
			}
		}

		if (this.freezeFirstRow) {
			this.sheet.createFreezePane(1, this.startRow + 1);
		}

		if (this.autoSizeColumns && headers) {
			for (i = 0; i < headers.length; i++) {
				this.sheet.autoSizeColumn(this.startColumn + i);
			}
		}

		if (this.setAutoFilter) {
			this.sheet.setAutoFilter(this.startRow, this.startColumn, this.startRow + foundset.getSize(), this.startColumn + dataproviders.length - 1);
		}

		dataFilled = true;
	}

}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"FF6BB91E-6E17-474B-8371-E73D2BF866DC",variableType:-4}
 */
var initFoundSetExcelWorkbook = (function() {
	FoundSetExcelWorkbook.prototype = Object.create(ServoyExcelWorkbook.prototype, {});
	FoundSetExcelWorkbook.prototype.constructor = FoundSetExcelWorkbook;
	
	/**
	 * Returns the foundset used to create this workbook
	 * @return {JSFoundSet}
	 */
	FoundSetExcelWorkbook.prototype.getFoundSet = function() {
		return this.foundset;
	}
}())

/**
 * A DataSet based Excel workbook
 *
 * @constructor
 * @extends {ServoyExcelWorkbook}
 * 
 * @public 
 *
 * @param {JSDataSet} dataset - the dataset
 * @param {Array<Number>} [columns] - the column numbers to be included in the sheet
 * @param {Array<String>} [headers] - the text to be used as column headers
 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either file or media URL pointing to an existing Excel to be used as template or one of the FILE_FORMAT constants when creating empty workbooks
 * @param {String} [sheetNameToUse] - when a template is used, this is the name of the sheet to be filled
 * 
 * @example <pre>
 * var query = datasources.db.example_data.orders.createSelect();
 * query.result.add(query.columns.customerid);	
 * query.result.add(query.columns.shipname);
 * query.result.add(query.columns.shipaddress);
 * query.result.add(query.columns.shipcity);
 * query.result.add(query.columns.shipcountry);
 * query.result.add(query.columns.shippeddate);
 * query.result.add(query.columns.freight);	
 * var dataset = databaseManager.getDataSetByQuery(query, -1);
 * 
 * var wb = scopes.svyExcelUtils.createWorkbookFromDataSet(dataset, [2,3,4,5,6,7], ["Company", "Address", "City", "Country", "Order date", "Freight"]);
 * 
 * wb.setFormatForColumn(5, "yyyy-MM-dd");
 * wb.setFormatForColumn(6, "#,##0.00");
 * wb.sheetName = "Dataset export";
 * wb.autoSizeColumns = true;
 * wb.freezeFirstRow = true;
 * wb.setAutoFilter = true;
 * 
 * var headerStyle = wb.createHeaderStyle();
 * headerStyle.setFont("Calibri,1,12");
 * headerStyle.setFillForegroundColor(scopes.svyExcelUtils.INDEXED_COLOR.LIGHT_CORNFLOWER_BLUE);
 * headerStyle.setFillPattern(scopes.svyExcelUtils.FILL_PATTERN.SOLID_FOREGROUND);
 * 
 * wb.writeToFile("d:\\dataset.xls");
 * </pre>
 *
 * @properties={typeid:24,uuid:"EF4F46C2-684F-4589-97A0-CFF3338833F8"}
 */
function DataSetExcelWorkbook(dataset, columns, headers, templateOrFileType, sheetNameToUse) {
	
	if (!(this instanceof DataSetExcelWorkbook)) {
		logger.warn("DataSetExcelWorkbook constructor called without the \"new\" keyword");
		return new DataSetExcelWorkbook(dataset, columns, headers, templateOrFileType);
	}
	
	ServoyExcelWorkbook.call(this, templateOrFileType, sheetNameToUse);
	
	/**
	 * The dataset used to create this workbook
	 * @type {JSDataSet}
	 */
	this.dataset = dataset;
	
	/**
	 * @type {Boolean}
	 */
	var dataFilled = false;
	
	if (!columns) {
		columns = [];
		for (var c = 1; c <= dataset.getMaxColumnIndex(); c++) {
			columns.push(c);
		}
	}
	
	if (!headers) {
		this.setAutoFilter = false;
		this.freezeFirstRow = false;
	}

	/**
	 * Fills the sheet with the data of the foundset<p>
	 * This is automatically done when <code>writeToFile()</code> or <code>getBytes()</code> is called
	 */
	this.fillData = function() {
		if (dataFilled) return;

		if (!this.headerStyle) {
			var headerFont = this.workbook.createFont('Calibri,1,10');
			this.headerStyle = this.workbook.createCellStyle();
			this.headerStyle.setFont(headerFont);
			this.headerStyle.setFillForegroundColor(INDEXED_COLOR.GREY_25_PERCENT);
			this.headerStyle.setFillPattern(FILL_PATTERN.SOLID_FOREGROUND);
		}

		var rowNum = this.startRow;
		var row, cell;
		if (headers) {
			row = this.sheet.insertRowAt(rowNum);
			for (var i = 0; i < headers.length; i++) {
				cell = row.createCell(this.startColumn + i);
				cell.setCellValue(headers[i]);
				cell.setCellStyle(this.headerStyle);
			}
			rowNum ++;
		}
		
		if (!this.rowStyle) {
			var font = this.workbook.createFont('Calibri,0,10');
			this.rowStyle = this.workbook.createCellStyle();
			this.rowStyle.setFont(font);
		}

		var numberCellStyle = this.workbook.createCellStyle();
		numberCellStyle.cloneStyleFrom(this.rowStyle);
		numberCellStyle.setAlignment(ALIGNMENT.RIGHT);
		numberCellStyle.setDataFormat(this.defaultNumberFormat);

		var dateCellStyle = this.workbook.createCellStyle();
		dateCellStyle.cloneStyleFrom(this.rowStyle);
		dateCellStyle.setDataFormat(this.defaultDateFormat);

		var cellFormatToUse;
		for (i = 0; i < this.columnFormats.length; i++) {
			if (this.columnFormats[i]) {
				if (this.columnStyles[i]) {
					cellFormatToUse = this.columnStyles[i];
				} else {
					this.columnStyles[i] = cellFormatToUse = this.workbook.createCellStyle();
					cellFormatToUse.cloneStyleFrom(this.rowStyle);
				}
				cellFormatToUse.setDataFormat(this.columnFormats[i]);
			}
		}

		for (i = 1; i <= dataset.getMaxRowIndex(); i++) {
			var rowData = dataset.getRowAsArray(i);
			row = this.sheet.insertRowAt(rowNum + (i-1));

			for (var d = 0; d < columns.length; d++) {
				cell = row.createCell(this.startColumn + d);
				var dpValue = rowData[columns[d]-1];
				cell.setCellValue(dpValue);
				if (this.columnStyles[d]) {
					cell.setCellStyle(this.columnStyles[d]);
				} else if (dpValue instanceof Number) {
					cell.setCellStyle(numberCellStyle);
				} else if (dpValue instanceof Date) {
					cell.setCellStyle(dateCellStyle);
				} else {
					cell.setCellStyle(this.rowStyle);
				}
			}
		}

		if (this.freezeFirstRow) {
			this.sheet.createFreezePane(1, this.startRow + 1);
		}

		if (this.autoSizeColumns) {
			for (i = 0; i < columns.length; i++) {
				this.sheet.autoSizeColumn(this.startColumn + i);
			}
		}

		if (headers && this.setAutoFilter) {
			this.sheet.setAutoFilter(this.startRow, this.startColumn, this.startRow + dataset.getMaxRowIndex(), columns.length);
		}

		dataFilled = true;
	}

}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"FBDCE3AA-4A94-49B9-988C-9A05EB672C63",variableType:-4}
 */
var initDataSetExcelWorkbook = (function() {
	DataSetExcelWorkbook.prototype = Object.create(ServoyExcelWorkbook.prototype, {});
	DataSetExcelWorkbook.prototype.constructor = DataSetExcelWorkbook;
	
	/**
	 * Returns the dataset used to create this workbook
	 * @return {JSDataSet}
	 */
	DataSetExcelWorkbook.prototype.getDataSet = function() {
		return this.dataset;
	}
}())

/**
 * A sheet in a workbook
 *
 * @constructor
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.Sheet} sheet
 *
 * @properties={typeid:24,uuid:"FABA242D-23EC-4265-88C8-224CD2EB0146"}
 */
function ExcelSheet(sheet) {
	
	/**
	 * The internal sheet object
	 * @type {Packages.org.apache.poi.ss.usermodel.Sheet}
	 */
	this.sheet = sheet;
	
	/**
	 * The name of this sheet
	 * @type {String}
	 */
	this.name = sheet.getSheetName();	
	
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"6CDC2194-2A57-472A-B57B-2776B2CE8432",variableType:-4}
 */
var initExcelSheet = (function() {
	ExcelSheet.prototype = Object.create(Object.prototype, { });
	ExcelSheet.prototype.constructor = ExcelSheet;
	
	Object.defineProperty(ExcelSheet.prototype, "name", {
			get: function() {
				return this.sheet.getSheetName();
			},
			/**
			 * @this {ExcelSheet}
			 */
			set: function(x) {
				/** @type {Packages.org.apache.poi.ss.usermodel.Workbook} */
				var wb = this.sheet.getWorkbook();
				var sheetIndex = wb.getSheetIndex(this.sheet);
				wb.setSheetName(sheetIndex, Packages.org.apache.poi.ss.util.WorkbookUtil.createSafeSheetName(x));
			}
		});
	
	/**
	 * Create a new row within the sheet (one based)
	 * @param {Number} row
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.createRow = function(row) {
		return new ExcelRow(this.sheet.createRow(row - 1));
	}
	
	/**
	 * Inserts a new row at the given position (one based)
	 * @param {Number} row
	 * @return {ExcelRow} insertedRow
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.insertRowAt = function(row) {
		if (row-1 <= this.sheet.getLastRowNum()) {
			this.sheet.shiftRows(row - 1, this.sheet.getLastRowNum() == 0 ? this.sheet.getPhysicalNumberOfRows() : this.sheet.getLastRowNum(), 1);
		}
		return new ExcelRow(this.sheet.createRow(row - 1));
	}
	
	/**
	 * Creates a split (freezepane). Any existing freezepane or split pane is overwritten.<p>
	 * If both colSplit and rowSplit are zero then the existing freeze pane is removed
	 * 
	 * @param {Number} colSplit - the column where the split occurs (one based)
	 * @param {Number} rowSplit - the row where the split occurs (one based)
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.createFreezePane = function(colSplit, rowSplit) {
		this.sheet.createFreezePane(colSplit - 1, rowSplit - 1);
	}
	
	/**
	 * Creates a split pane. Any existing freezepane or split pane is overwritten.
	 * 
	 * @param {Number} xSplitPos - Horizonatal position of split (in 1/20th of a point).
	 * @param {Number} ySplitPos - Vertical position of split (in 1/20th of a point).
	 * @param {Number} leftmostColumn - Top row visible in bottom pane
	 * @param {Number} topRow - Top row visible in bottom pane
	 * @param {byte} [activePane] - Active pane as any of the SHEET_PANE enum values
	 */
	ExcelSheet.prototype.createSplitPane = function(xSplitPos, ySplitPos, leftmostColumn, topRow, activePane) {
		this.sheet.createSplitPane(xSplitPos - 1, ySplitPos - 1, leftmostColumn - 1, topRow - 1, activePane ? activePane : SHEET_PANE.UPPER_LEFT);
	}
	
	/**
	 * Adjusts the column width to fit the contents.<p>
	 * This process can be relatively slow on large sheets, so this should normally only be called once per column, at the end of your processing.
	 * @param {Number} column - the column index (one based)
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.autoSizeColumn = function(column) {
		this.sheet.autoSizeColumn(column - 1);
	}
	
	/**
	 * Show automatic page breaks or not
	 * @param {Boolean} autoBreaks
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.setAutoBreaks = function(autoBreaks) {
		this.sheet.setAutobreaks(autoBreaks);
	}
	
	/**
	 * Enable filtering for a range of cells
	 * 
	 * @param {Number} startRow - one based
	 * @param {Number} startColumn - one based
	 * @param {Number} endRow - one based
	 * @param {Number} endColumn - one based
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.setAutoFilter = function(startRow, startColumn, endRow, endColumn) {
		var range = new Packages.org.apache.poi.ss.util.CellRangeAddress(startRow - 1, endRow - 1, startColumn - 1, endColumn - 1);
		this.sheet.setAutoFilter(range);
	}
	
	/**
	 * Returns the cell in the given row and column
	 * 
	 * @param {Number} row - one based
	 * @param {Number} column - one based
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getCell = function(row, column) {
		/** @type {Packages.org.apache.poi.ss.usermodel.Row} */
		var r = this.sheet.getRow(row - 1);
		if (!r) return null;
		var c = r.getCell(column - 1);
		if (!c) return null;
		return new ExcelCell(c);
	}
	
	/**
	 * Gets the first row on the sheet
	 * @return {Number} the number of the first logical row on the sheet, one based
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getFirstRowNum = function() {
		return this.sheet.getFirstRowNum() + 1;
	}
	
	/**
	 * Gets the number last row on the sheet. Owing to idiosyncrasies in the excel file format, if the result of calling this method is one, you can't tell if that means there are no rows on the sheet, or one at position one. For that case, additionally call getPhysicalNumberOfRows() to tell if there is a row at position one or not.
	 * @return {Number} the number of the last row contained in this sheet, one based
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getLastRowNum = function() {
		return this.sheet.getLastRowNum() + 1;
	}
	
	/**
	 * Returns the number of physically defined rows (NOT the number of rows in the sheet)
	 * @return {Number} the number of physically defined rows in this sheet
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getPhysicalNumberOfRows = function() {
		return this.sheet.getPhysicalNumberOfRows();
	}
	
	/**
	 * Returns the logical row (not physical) 1-based. If you ask for a row that is not defined you get a null.
	 * @return {ExcelRow} ExcelRow representing the row number or null if its not defined on the sheet
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getRow = function(row) {
		var r = this.sheet.getRow(row - 1);
		if (!r) return null;
		return new ExcelRow(r);
	}
	
	/**
	 * Returns the data of this sheet as JSDataSet
	 * 
	 * @param {Boolean} [firstRowHasColumnNames]
	 * @param {Number} [startRow]
	 * @param {Number} [endRow]
	 * @param {Number} [startColumn]
	 * @param {Number} [endColumn]
	 * 
	 * @return {JSDataSet}
	 * 
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getSheetData = function(firstRowHasColumnNames, startRow, endRow, startColumn, endColumn) {
		/** @type {Packages.org.apache.poi.ss.usermodel.Row} */
		var row;
		var cell, rowData;
		
		if (this.sheet.getPhysicalNumberOfRows() == 0) {
			return databaseManager.createEmptyDataSet(0, 0);
		}
		
		if (!startRow) {
			startRow = this.sheet.getFirstRowNum();
		} else {
			startRow -= 1;
		}
		if (!startColumn) {
			row = this.sheet.getRow(startRow);
			if (!row) {
				for (var r = startRow; r <= this.sheet.getPhysicalNumberOfRows(); r++) {
					row = this.sheet.getRow(r);
					if (row) {
						startRow = r;
						startColumn = row.getFirstCellNum();
						break;
					}
				}
			} else {
				startColumn = row.getFirstCellNum();
			}
		} else {
			startColumn -= 1;
		}
		if (!endRow) {
			endRow = this.sheet.getLastRowNum();
		} else {
			endRow -= 1;
		}
		if (endColumn) {
			endColumn -= 1;
		} else {
			row = this.sheet.getRow(startRow);
			if (!row) {
				for (var rr = startRow; rr <= this.sheet.getPhysicalNumberOfRows(); rr++) {
					row = this.sheet.getRow(rr);
					if (row) {
						startColumn = row.getLastCellNum() - 1;
						break;
					}
				}
			} else {
				endColumn = row.getLastCellNum() - 1;
			}
		}
		
		var dataset;
		if (firstRowHasColumnNames) {
			var columnNames = [];
			row = this.sheet.getRow(startRow);
			if (!row) {
				throw new scopes.svyExceptions.IllegalArgumentException("Given row " + startRow + " does not exist");
			}
			for (var h = startColumn; h <= endColumn; h++) {
				cell = row.getCell(h);
				if (cell) {
					columnNames.push(getCellData(cell));
				} else {
					columnNames.push("");
				}
			}
			dataset = databaseManager.createEmptyDataSet(0, columnNames);
			startRow ++;
		} else {
			dataset = databaseManager.createEmptyDataSet(0, endColumn - startColumn + 1);
		}
		for (var i = startRow; i <= endRow; i++) {
			row = this.sheet.getRow(i);
			if (row == null || !row.getPhysicalNumberOfCells()) continue;
			rowData = [];
			for (var c = startColumn; c <= endColumn; c++) {
				cell = row.getCell(c);
				if (cell) {
					rowData.push(getCellData(cell));
				} else {
					rowData.push(null);
				}
			}
			dataset.addRow(rowData);
		}
		return dataset;
	}
	
	/**
	 * Returns the data in the given row as an Array
	 * @return {Array}
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.getRowData = function(row) {
		/** @type {Packages.org.apache.poi.ss.usermodel.Row} */
		var r = this.sheet.getRow(row - 1);
		if (!r) return null;
		var result = [];
		for (var it = r.cellIterator(); it.hasNext();) {
			/** @type {Packages.org.apache.poi.ss.usermodel.Cell} */
			var cell = it.next();
			result.push(getCellData(cell));
		}
		return result;
	}
	
	/**
	 * Set the visibility state for a given column.
	 * @param {Number} column - the column to get (1-based)
	 * @param {Boolean} hidden - the visiblity state of the column
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.setColumnHidden = function(column, hidden) {
		this.sheet.setColumnHidden(column - 1, hidden);
	}
	
	/**
	 * Shifts rows between startRow and endRow n number of rows. If you use a negative number, it will shift rows up.
	 * @param {Number} startRow
	 * @param {Number} endRow
	 * @param {Number} n
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.shiftRows = function(startRow, endRow, n) {
		this.sheet.shiftRows(startRow, endRow, n);
	}
	
	/**
	 * Adds a merged region of cells (hence those cells form one)
	 * @param {Number} startRow
	 * @param {Number} startColumn
	 * @param {Number} endRow
	 * @param {Number} endColumn
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.addMergedRegion = function(startRow, startColumn, endRow, endColumn) {
		this.sheet.addMergedRegion(new Packages.org.apache.poi.ss.util.CellRangeAddress(startRow - 1, 
			endRow - 1,
			startColumn - 1,
			endColumn - 1
		));
	}
	
	/**
	 * Sets the print setup for this sheet
	 * @param {PrintSetup} printSetup
	 * @return {ExcelSheet}
	 * @this {ExcelSheet}
	 */
	ExcelSheet.prototype.setPrintSetup = function(printSetup) {
		var setup = this.sheet.getPrintSetup();
		if (printSetup.copies != null) setup.setCopies(printSetup.copies);
		if (printSetup.draft != null) setup.setDraft(printSetup.draft);
		if (printSetup.fitHeight != null) setup.setFitHeight(printSetup.fitHeight);
		if (printSetup.fitWidth != null) setup.setFitWidth(printSetup.fitWidth);
		if (printSetup.fitHeight != null || printSetup.fitWidth != null) {
			this.sheet.setAutobreaks(true);
		}
		if (printSetup.landscape != null) setup.setLandscape(printSetup.landscape);
		if (printSetup.noColor != null) setup.setNoColor(printSetup.noColor);
		if (printSetup.paperSize != null) setup.setPaperSize(printSetup.paperSize);
		return this;
	}
}());

/**
 * A reusable style that can be assigned to any cell
 *
 * @constructor
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.CellStyle} style
 * @param {Packages.org.apache.poi.ss.usermodel.Workbook} workbook
 *
 * @properties={typeid:24,uuid:"7AC10C4F-3D57-4E31-883D-769B02E88CA3"}
 */
function ExcelCellStyle(style, workbook) {
	
	/**
	 * The internal font object
	 * @type {ExcelFont}
	 */
	this.fontInternal = null;
	
	/**
	 * The internal style object
	 * @type {Packages.org.apache.poi.ss.usermodel.CellStyle}
	 */
	this.cellStyle = style;
	
	/**
	 * The internal workbook object
	 * @type {Packages.org.apache.poi.ss.usermodel.Workbook}
	 */
	this.workbook = workbook;
	
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"2F3FCD8F-49B2-432B-A1B7-004E406F3745",variableType:-4}
 */
var initExcelCellStyle = (function() {
	ExcelCellStyle.prototype = Object.create(Object.prototype, {});
	ExcelCellStyle.prototype.constructor = ExcelCellStyle;
	
	/**
	 * Sets the font of this style
	 * @param {ExcelFont|String} font
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setFont = function(font) {
		if (font instanceof String) {
			/** @type {String} */
			var fontString = font;
			var newFont = createExcelFontFromString(this.workbook, fontString);
			this.cellStyle.setFont(newFont.getFont());
			this.fontInternal = newFont;
		} else if (font instanceof ExcelFont) {
			/** @type {ExcelFont} */
			var givenFont = font;
			this.cellStyle.setFont(givenFont.getFont());
			this.fontInternal = givenFont;			
		}
		return this;
	}
	
	/**
	 * Sets the background fill color
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setFillBackgroundColor = function(color) {
		this.cellStyle.setFillBackgroundColor(color.getIndex());
		return this;
	}	
	
	/**
	 * Sets the foreground fill color Note: Ensure Foreground color is set prior to background color.
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setFillForegroundColor = function(color) {
		this.cellStyle.setFillForegroundColor(color.getIndex());
		return this;
	}	
	
	/**
	 * Sets the fill pattern
	 * @param {Number} pattern - any of the FILL_PATTERN enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setFillPattern = function(pattern) {
		this.cellStyle.setFillPattern(pattern);
		return this;
	}	
	
	/**
	 * Sets the alignment
	 * @param {Number} alignment - any of the ALIGNMENT enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setAlignment = function(alignment) {
		this.cellStyle.setAlignment(alignment);
		return this;
	}	
	
	/**
	 * Sets the vertical alignment
	 * @param {Number} alignment - any of the VERTICAL_ALIGNMENT enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setVerticalAlignment = function(alignment) {
		this.cellStyle.setVerticalAlignment(alignment);
		return this;
	}	
	
	/**
	 * Sets the format used to format data
	 * @param {String} format
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setDataFormat = function(format) {
		/** @type {Packages.org.apache.poi.ss.usermodel.DataFormat} */
		var f = this.workbook.createDataFormat();
		this.cellStyle.setDataFormat(f.getFormat(format));
		return this;
	}
	
	/**
	 * Sets the borders of this cell
	 * @param {Number} borderTop - any of the BORDER enum values
	 * @param {Number} borderRight - any of the BORDER enum values
	 * @param {Number} borderBottom - any of the BORDER enum values
	 * @param {Number} borderLeft - any of the BORDER enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorder = function(borderTop, borderRight, borderBottom, borderLeft) {
		if (borderTop != null) this.cellStyle.setBorderTop(borderTop);
		if (borderRight != null) this.cellStyle.setBorderRight(borderRight);
		if (borderBottom != null) this.cellStyle.setBorderBottom(borderBottom);
		if (borderLeft != null) this.cellStyle.setBorderLeft(borderLeft);
		return this;
	}	
	
	/**
	 * Sets the border colors of this cell
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} colorTop - any of the INDEXED_COLOR enum values
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} colorRight - any of the INDEXED_COLOR enum values
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} colorBottom - any of the INDEXED_COLOR enum values
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} colorLeft - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorderColor = function(colorTop, colorRight, colorBottom, colorLeft) {
		if (colorTop != null) this.cellStyle.setTopBorderColor(colorTop.getIndex());
		if (colorRight != null) this.cellStyle.setRightBorderColor(colorRight.getIndex());
		if (colorBottom != null) this.cellStyle.setBottomBorderColor(colorBottom.getIndex());
		if (colorLeft != null) this.cellStyle.setLeftBorderColor(colorLeft.getIndex());
		return this;
	}
	
	/**
	 * Sets the type of border to use for the bottom border of the cell
	 * @param {Number} border - any of the BORDER enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorderBottom = function(border) {
		this.cellStyle.setBorderBottom(border);
		return this;
	}	
	
	/**
	 * Sets the type of border to use for the top border of the cell
	 * @param {Number} border - any of the BORDER enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorderTop = function(border) {
		this.cellStyle.setBorderTop(border);
		return this;
	}
	
	/**
	 * Sets the type of border to use for the right border of the cell
	 * @param {Number} border - any of the BORDER enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorderRight = function(border) {
		this.cellStyle.setBorderRight(border);
		return this;		
	}
	
	/**
	 * Sets the type of border to use for the left border of the cell
	 * @param {Number} border - any of the BORDER enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBorderLeft = function(border) {
		this.cellStyle.setBorderLeft(border);
		return this;
	}
	
	/**
	 * Sets the color to use for the left border
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setLeftBorderColor = function(color) {
		this.cellStyle.setLeftBorderColor(color.getIndex());
		return this;		
	}
	
	/**
	 * Sets the color to use for the right border
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setRightBorderColor = function(color) {
		this.cellStyle.setRightBorderColor(color.getIndex());
		return this;		
	}
	
	/**
	 * Sets the color to use for the top border
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setTopBorderColor = function(color) {
		this.cellStyle.setTopBorderColor(color.getIndex());
		return this;		
	}
	
	/**
	 * Sets the color to use for the bottom border
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setBottomBorderColor = function(color) {
		this.cellStyle.setBottomBorderColor(color.getIndex());
		return this;		
	}
	
	/**
	 * Clones all the style information from another CellStyle, onto this one.<br>
	 * This CellStyle will then have all the same properties as the source,<br>
	 * but the two may be edited independently. Any stylings on this CellStyle will be lost!
	 *
	 * @param {ExcelCellStyle} originalStyle
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.cloneStyleFrom = function(originalStyle) {
		this.cellStyle.cloneStyleFrom(originalStyle.getCellStyle());
		return this;
	}
	
	/**
	 * Sets whether the text should be wrapped
	 * @param {Boolean} wrapped
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setWrapText = function(wrapped) {
		this.cellStyle.setWrapText(wrapped);
		return this;		
	}
	
	/**
	 * Sets the cell's using this style to be hidden
	 * @param {Boolean} hidden
	 * @return {ExcelCellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setHidden = function(hidden) {
		this.cellStyle.setHidden(hidden);
		return this;		
	}
	
	/**
	 * Returns the internal cell style object
	 * @return {Packages.org.apache.poi.ss.usermodel.CellStyle}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.getCellStyle = function() {
		return this.cellStyle;
	}
	
	/**
	 * Returns the font of this CellStyle
	 * @return {ExcelFont}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.getFont = function() {
		var result = this.fontInternal;
		if (!this.fontInternal) {
			var fIndex = this.cellStyle.getFontIndex();
			var f = this.workbook.getFontAt(fIndex);
			result = this.fontInternal = new ExcelFont(f);
		}
		return result;
	}
	
	/**
	 * Clones the font used in this style
	 * @return {ExcelFont}
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.cloneFont = function() {
		/** @type {Packages.org.apache.poi.ss.usermodel.Font} */
		var original = this.getFont().getFont();
		/** @type {Packages.org.apache.poi.ss.usermodel.Font} */
		var result = this.workbook.createFont();
		result.setBoldweight(original.getBoldweight());
		result.setCharSet(original.getCharSet());
		result.setColor(original.getColor());
		result.setFontHeight(original.getFontHeight());
		result.setFontName(original.getFontName());
		result.setItalic(original.getItalic());
		result.setStrikeout(original.getStrikeout());
		result.setTypeOffset(original.getTypeOffset());
		result.setUnderline(original.getUnderline());
		var retval = new ExcelFont(result);
		this.cellStyle.setFont(retval.getFont());
		this.fontInternal = retval;
		return retval;
	}	
	
	/**
	 * Sets the cell's using this style to be locked
	 * @param {Boolean} locked
	 * @this {ExcelCellStyle}
	 */
	ExcelCellStyle.prototype.setLocked = function(locked) {
		this.cellStyle.setLocked(locked);
	}
	
}());

/**
 * A font
 *
 * @constructor
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.Font} font
 *
 * @properties={typeid:24,uuid:"8E8E4EDE-67AB-440E-8BB9-E2DA34F3C630"}
 */
function ExcelFont(font) {

	/**
	 * Whether to use a strikeout horizontal line through the text or not
	 * @type {Boolean}
	 */
	this.strikeout = font.getStrikeout();
	Object.defineProperty(this, "strikeout", {
			get: function() {
				return font.getStrikeout();
			},
			set: function(x) {
				font.setStrikeout(x);
			}
		});

	/**
	 * Gets / sets the underline style as any of the FONT_UNDERLINE enum values
	 */
	this.underline = font.getUnderline();
	Object.defineProperty(this, "underline", {
			get: function() {
				return font.getUnderline();
			},
			set: function(x) {
				font.setUnderline(x);
			}
		});

	/**
	 * Whether the font is bold or not
	 * @type {Boolean}
	 */
	this.isBold = (font.getBoldweight() == Packages.org.apache.poi.ss.usermodel.Font.BOLDWEIGHT_BOLD);
	Object.defineProperty(this, "isBold", {
			get: function() {
				return (font.getBoldweight() == Packages.org.apache.poi.ss.usermodel.Font.BOLDWEIGHT_BOLD);
			},
			set: function(x) {
				if (x === true) {
					font.setBoldweight(Packages.org.apache.poi.ss.usermodel.Font.BOLDWEIGHT_BOLD);
				} else {
					font.setBoldweight(Packages.org.apache.poi.ss.usermodel.Font.BOLDWEIGHT_NORMAL);
				}
			}
		});

	/**
	 * Whether the font is italic or not
	 * @type {Boolean}
	 */
	this.isItalic = font.getItalic();
	Object.defineProperty(this, "isItalic", {
			get: function() {
				return font.getItalic();
			},
			set: function(x) {
				if (x === true) {
					font.setItalic(true);
				} else {
					font.setItalic(false);
				}
			}
		});

	/**
	 * Get / set the size of the font in points
	 * @type {Number}
	 */
	this.fontSize = font.getFontHeightInPoints();
	Object.defineProperty(this, "fontSize", {
			get: function() {
				return font.getFontHeightInPoints();
			},
			set: function(x) {
				font.setFontHeightInPoints(x);
			}
		});

	/**
	 * Get / set the name for the font (i.e. Arial)
	 * @type {String}
	 */
	this.fontName = font.getFontName();
	Object.defineProperty(this, "fontName", {
			get: function() {
				return font.getFontName();
			},
			set: function(x) {
				font.setFontName(x);
			}
		});

	/**
	 * Set the color for the font
	 * @param {Packages.org.apache.poi.ss.usermodel.IndexedColors} color - any of the INDEXED_COLOR enum values
	 */
	this.setColor = function(color) {
		font.setColor(color.getIndex());
	}

	/**
	 * Returns the internal font object
	 * @return {Packages.org.apache.poi.ss.usermodel.Font}
	 */
	this.getFont = function() {
		return font;
	}
}

/**
 * A row in a workbook's sheet
 *
 * @constructor
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.Row} row
 *
 * @properties={typeid:24,uuid:"47C6A849-062F-413F-81EC-6B2E90386133"}
 */
function ExcelRow(row) {

	/**
	 * The internal row object
	 * @type {Packages.org.apache.poi.ss.usermodel.Row}
	 */
	this.row = row;
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"F4E16CD1-88F9-42FD-8A1E-FC8A7D73C2FD",variableType:-4}
 */
var initExcelRow = (function() {
	ExcelRow.prototype = Object.create(Object.prototype, {});
	ExcelRow.prototype.constructor = ExcelRow;
	
	/**
	 * Returns a cell reference string for this row (e.g. "A1:K1")
	 * @return {String}
	 * @this {ExcelRow}
	 */
	ExcelRow.prototype.getCellReference = function() {
		var range = new Packages.org.apache.poi.ss.util.CellRangeAddress(this.row.getRowNum(), this.row.getRowNum(), this.row.getFirstCellNum(), this.row.getLastCellNum());
		return range.formatAsString();
	}
	
	/**
	 * Returns the cell in the given column. If you ask for a cell that is not defined then you get a null.
	 * @return {ExcelCell} cell
	 * @this {ExcelRow}
	 */
	ExcelRow.prototype.getCell = function(column) {
		var c = this.row.getCell(column - 1);
		if (!c) return null;
		return new ExcelCell(c);
	}
	/**
	 * Creates a cell in the given column, optionally setting the given style
	 * @param {Number} column - the column index - one based
	 * @param {ExcelCellStyle} [style]
	 * @return {ExcelCell} cell
	 * @this {ExcelRow}
	 */
	ExcelRow.prototype.createCell = function(column, style) {
		var result = new ExcelCell(this.row.createCell(column - 1));
		if (style) {
			result.setCellStyle(style);
		}
		return result;
	}
	
	/**
	 * Returns the data in this row as an Array
	 * @return {Array}
	 * @this {ExcelRow}
	 */
	ExcelRow.prototype.getRowData = function() {
		var result = [];
		/** @type {Packages.org.apache.poi.ss.usermodel.Row} */
		var r = this.row;
		for (var it = r.cellIterator(); it.hasNext();) {
			/** @type {Packages.org.apache.poi.ss.usermodel.Cell} */
			var cell = it.next();
			var cellType = cell.getCellType();
			if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_STRING) {
				result.push(cell.getStringCellValue());
			} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC) {
				result.push(cell.getNumericCellValue());
			} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN) {
				result.push(cell.getBooleanCellValue() ? 1 : 0);
			} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC) {
				if (Packages.org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
					result.push(new Date(cell.getDateCellValue().getTime()));
				} else {
					result.push(cell.getNumericCellValue());
				}
			} else {
				result.push(null);
			}
		}
		return result;
	}
}());

/**
 * A call in a workbook's sheet
 *
 * @constructor
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.Cell} cell
 *
 * @properties={typeid:24,uuid:"4F79B7F3-BD7C-47A0-93B5-97485319FEE2"}
 */
function ExcelCell(cell) {
	
	/**
	 * The internal cell object
	 * @type {Packages.org.apache.poi.ss.usermodel.Cell}
	 */
	this.cell = cell;
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"7A311E58-DF12-467E-9A83-F01BF1DC7FA9",variableType:-4}
 */
var initExcelCell = (function() {
	ExcelCell.prototype = Object.create(Object.prototype, {});
	ExcelCell.prototype.constructor = ExcelCell;
	
	/**
	 * Sets formula for this cell.<p>
	 * Note, this method only sets the formula string and does not calculate the formula value. To set the precalculated value use setCellValue()
	 * @param {String} formula
	 * @param {ExcelCellStyle} [style] optional style
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.setCellFormula = function(formula, style) {
		this.cell.setCellFormula(formula);
		if (style) {
			this.setCellStyle(style);
		}
	}
	
	/**
	 * Returns a formula for the cell, for example, SUM(C4:E4)
	 * @return {String} formula
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getCellFormula = function() {
		return this.cell.getCellFormula();
	}
	
	/**
	 * Returns the value cell<p>
	 * 
	 * Blank cells return null, boolean cells integers,
	 * formula and error cells null
	 * 
	 * @return {Object} value
	 * 
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getCellValue = function() {
		var cellType = this.cell.getCellType();
		if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BLANK) {
			return null;
		} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN) {
			return this.cell.getBooleanCellValue() ? 1 : 0;
		} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC) {
			return this.cell.getNumericCellValue();
		} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_STRING) {
			return this.cell.getStringCellValue();
		} else {
			return null;
		}
	}
	
	/**
	 * Returns the type of cell as any of the CELL_TYPE enum values
	 * @return {Number} 
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getCellType = function() {
		return this.cell.getCellType();
	}
	
	/**
	 * Returns the boolean cell value if the cell is a boolean type cell, null otherwise
	 * @return {Boolean} 
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getBooleanCellValue = function() {
		if (this.cell.getCellType() == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN) {
			return this.cell.getBooleanCellValue();
		} else {
			return null;
		}
	}	
	
	/**
	 * Returns the numeric cell value as a Date if the cell is a numeric type cell, null otherwise
	 * @return {Date} 
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getDateCellValue = function() {
		if (this.cell.getCellType() == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC) {
			return new Date(this.cell.getDateCellValue().getTime());
		} else {
			return null;
		}
	}	
	
	/**
	 * Returns the comment of the cell as an object
	 * @return {{author: String, comment: String, isVisible: Boolean}} 
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getCellComment = function() {
		var comment = this.cell.getCellComment();
		if (!comment) {
			return null;
		}
		var result = {author: null, comment: null, isVisible: false};
		result.author = comment.getAuthor();
		result.isVisible = comment.isVisible();
		var commentString = comment.getString();
		if (commentString) {
			result.comment = commentString.getString();
		}
		return result;
	}	
	
	/**
	 * Sets the value of this cell
	 * @param {String|Number|Date} value
	 * @param {ExcelCellStyle} [style] optional style
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.setCellValue = function(value, style) {
		if (value instanceof Date) {
			/** @type {java.util.Date} */
			var dateValue = new java.util.Date(value.getTime());
			this.cell.setCellValue(dateValue);
		} else if (value instanceof String) {
			/** @type {String} */
			var stringValue = value;
			this.cell.setCellValue(stringValue);
		} else if (value instanceof Number) {
			/** @type {Number} */
			var numberValue = value;
			this.cell.setCellValue(numberValue);
		}
		if (style) {
			this.setCellStyle(style);
		}
	}
	
	/**
	 * Sets the style of this cell
	 * @param {ExcelCellStyle} style
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.setCellStyle = function(style) {
		/** @type {Packages.org.apache.poi.ss.usermodel.CellStyle} */
		var cs = style.getCellStyle();
		this.cell.setCellStyle(cs);
	}
	
	/**
	 * Returns a cell reference (e.g. "A4") for this cell
	 * @return {String} cellReference
	 * @this {ExcelCell}
	 */
	ExcelCell.prototype.getCellReference = function() {
		var range = new Packages.org.apache.poi.ss.util.CellRangeAddress(this.cell.getRowIndex(), this.cell.getRowIndex(), this.cell.getColumnIndex(), this.cell.getColumnIndex());
		return range.formatAsString();
	}
	
}());

/**
 * @private 
 * @properties={typeid:24,uuid:"CC5515E0-17A5-4BFB-9FC1-EBD3905BED3B"}
 */
function PrintSetup() {
	
	/**
	 * The number of copies
	 * @type {Number}
	 */
	this.copies = null;
	
	/**
	 * Whether it is in draft mode
	 * @type {Boolean}
	 */
	this.draft = null;
	
	/**
	 * The number of pages high to fit the sheet in
	 * @type {Number}
	 */
	this.fitHeight = null;
	
	/**
	 * The number of pages high to fit the sheet in
	 * @type {Number}
	 */
	this.fitWidth = null;
	
	/**
	 * Whether to print in landscape
	 * @type {Boolean}
	 */
	this.landscape = null;
	
	/**
	 * Whether it is black and white
	 * @type {Boolean}
	 */
	this.noColor = null;
	
	/**
	 * The paper size
	 * @type {Number}
	 */
	this.paperSize = null;
}

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"14D0D0B4-7177-4710-BF29-B3148E41E5DD",variableType:-4}
 */
var initPrintSetup = (function() {
	PrintSetup.prototype = Object.create(Object.prototype, {});
	PrintSetup.prototype.constructor = PrintSetup;
	
	/**
	 * Sets the number of copies
	 * @param {Number} x
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setCopies = function(x) {
		if (x instanceof Number && x > 0) {
			this.copies = x;
		}
		return this;
	}
	
	/**
	 * Set whether it is in draft mode
	 * @param {Boolean} isDraft
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setDraft = function(isDraft) {
		this.draft = isDraft;
		return this;
	}
	
	/**
	 * Set the number of pages high to fit the sheet in
	 * @param {Number} numberOfPagesHigh
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setFitHeight = function(numberOfPagesHigh) {
		this.fitHeight = numberOfPagesHigh;
		return this;
	}	
	
	/**
	 * Set the number of pages wide to fit the sheet in
	 * @param {Number} numberOfPagesWide
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setFitWidth = function(numberOfPagesWide) {
		this.fitWidth = numberOfPagesWide;
		return this;
	}	
	
	/**
	 * Set whether to print in landscape
	 * @param {Boolean} isLandscape
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setLandscape = function(isLandscape) {
		this.landscape = isLandscape;
		return this;
	}	
	
	/**
	 * Set whether it is black and white
	 * @param {Boolean} mono
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setNoColor = function(mono) {
		this.noColor = mono;
		return this;
	}	
	
	/**
	 * Set the paper size as any of the PAPER_SIZE enum values
	 * @param {Number} size
	 * @return {PrintSetup}
	 * @this {PrintSetup}
	 */
	PrintSetup.prototype.setPaperSize = function(size) {
		this.paperSize = size;
		return this;
	}	

}());

/**
 * Converts a cell reference (e.g. "B4:AK234" or "C6") to an object holding first and last row and column
 * 
 * @public 
 * 
 * @param {String} cellReference
 * @return {{firstRow: Number, lastRow: Number, firstColumn: Number, lastColumn: Number}}
 *
 * @properties={typeid:24,uuid:"6F1E0C82-F77B-4B82-B85B-9E948EDAB799"}
 */
function getRangeFromCellReference(cellReference) {
	var range = Packages.org.apache.poi.ss.util.CellRangeAddress.valueOf(cellReference);
	var result = {
		firstRow: range.getFirstRow() + 1,
		lastRow : range.getLastRow() + 1,
		firstColumn: range.getFirstColumn() + 1,
		lastColumn: range.getLastColumn() + 1
	}
	return result;
}

/**
 * Creates a cell reference (e.g. "A4:C92") from the given range
 * 
 * @public 
 * 
 * @param {Number} firstRow
 * @param {Number} lastRow
 * @param {Number} firstColumn
 * @param {Number} lastColumn
 * 
 * @return {String} cellReference
 *
 * @properties={typeid:24,uuid:"2244D4F6-1BC9-482A-AD82-9103D78389D8"}
 */
function getCellReferenceFromRange(firstRow, lastRow, firstColumn, lastColumn) {
	var range = new Packages.org.apache.poi.ss.util.CellRangeAddress(firstRow - 1, lastRow - 1, firstColumn - 1, lastColumn - 1);
	return range.formatAsString();
}

/**
 * Creates a PrintSetup object that can be used in ExcelSheet.setPrintSetup() 
 * or to set the default print setup used when workbooks are created from
 * FoundSet or DataSet
 * 
 * @public 
 * 
 * @return {PrintSetup}
 * 
 * @properties={typeid:24,uuid:"4F18E917-4B3D-48F5-ADEE-A3F6B9183B3E"}
 */
function createPrintSetup() {
	return new PrintSetup();
}

/**
 * Sets the default print setup used when workbooks are created from FoundSet or DataSet
 * 
 * @public 
 * 
 * @param {PrintSetup} setup
 *
 * @properties={typeid:24,uuid:"AD3003E7-10F1-4FC5-92A9-F484437C58BD"}
 */
function setDefaultPrintSetup(setup) {
	defaultPrintSetup = setup;
}

/**
 * Gets the value of a cell depending on its data type
 * 
 * @private
 *
 * @param {Packages.org.apache.poi.ss.usermodel.Cell} cell
 *
 * @properties={typeid:24,uuid:"48AB76B6-8112-465E-8262-DBCC725C770C"}
 */
function getCellData(cell) {
	var result = null;
	var cellType = cell.getCellType();
	if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_STRING || (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_FORMULA && cell.getCachedFormulaResultType() == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_STRING)) {
		result = cell.getStringCellValue();
	} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN || (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_FORMULA && cell.getCachedFormulaResultType() == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_BOOLEAN)) {
		result = cell.getBooleanCellValue() ? 1 : 0;
	} else if (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC || (cellType == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_FORMULA && cell.getCachedFormulaResultType() == Packages.org.apache.poi.ss.usermodel.Cell.CELL_TYPE_NUMERIC)) {
		if (Packages.org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
			result = new Date(cell.getDateCellValue().getTime());
		} else {
			result = cell.getNumericCellValue();
		}
	}
	return result;
}

/**
 * @private
 * 
 * @param {Packages.org.apache.poi.ss.usermodel.Workbook} workbook
 * @param {String} fontString
 *
 * @properties={typeid:24,uuid:"D4B36866-2A56-4144-A0C1-826652CC8A76"}
 */
function createExcelFontFromString(workbook, fontString) {
	if (!fontString) return null;
	var font = workbook.createFont();

	/** @type {Array<String>} */
	var fontStringParts = fontString ? fontString.split(",") : null;

	var fontFamily = fontStringParts && fontStringParts.length > 0 ? fontStringParts[0] : "Arial";
	var fontSize = fontStringParts && fontStringParts.length > 2 ? parseInt(fontStringParts[2]) : 10;

	font.setFontName(fontFamily);
	font.setFontHeightInPoints(fontSize);
	if (fontStringParts && fontStringParts.length > 1 && fontStringParts[1] == "2" || fontStringParts[1] == "3") {
		font.setItalic(true);
	}
	if (fontStringParts && fontStringParts.length > 1 && fontStringParts[1] == "1" || fontStringParts[1] == "3") {
		font.setBoldweight(Packages.org.apache.poi.ss.usermodel.Font.BOLDWEIGHT_BOLD);
	}

	return new ExcelFont(font);
}

/**
 * If true, all required libraries are present and the scope can be used
 * @public  
 * @properties={typeid:24,uuid:"0E11FB23-7B52-43BE-AE30-2775FE0FA02B"}
 */
function isLoaded() {
	try {
		var context = Packages.org.mozilla.javascript.Context.getCurrentContext();
		var cl = context.getApplicationClassLoader();
		var c = java.lang.Class.forName("org.apache.poi.ss.usermodel.Cell", false, cl);
		return c != null;
	} catch(e) {
		return false;
	}
}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"D1AA3C12-91F1-40DF-888E-6775900C71F1",variableType:-4}
 */
var init = (function() {
	if (!isLoaded()) {
		logger.warn("svyExcelUtils cannot be used because the Apache POI package cannot be found");
	}
}());
