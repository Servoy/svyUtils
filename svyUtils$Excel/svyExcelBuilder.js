/**
 * @private
 * @constructor
 * @this {AbstractExcelBuilder}
 * @properties={typeid:24,uuid:"534F747F-6DCD-44AF-BE41-69C04EECF158"}
 * @AllowToRunInFind
 */
function AbstractExcelBuilder() {

	/**
	 * @protected
	 * @type {Array<ExcelColumn>}
	 */
	this.excelColumns = [];
}

/**
 *
 * @param {JSFoundSet} foundset
 *
 * @constructor
 * @properties={typeid:24,uuid:"7E189939-F7FF-41BE-80F3-1D333A84BEA9"}
 * @extends {AbstractExcelBuilder}
 *
 * @private
 *
 * @this {FoundSetExcelBuilder}
 */
function FoundSetExcelBuilder(foundset) {

	//first set the table component as it is needed when creating default search
	AbstractExcelBuilder.call(this);

	/**
	 * Returns the foundset to be exported
	 *
	 * @protected 
	 * @return {JSFoundSet}
	 *
	 * @this {AbstractExcelBuilder}
	 */
	this.getFoundSet = function() {
		return foundset;
	}
}

/**
 *
 * @constructor
 *
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} tableComponent
 * @param {Boolean} [useTableColumnState] Default false
 *
 * @extends {AbstractExcelBuilder}
 *
 * @private
 *
 * @this {NgGridExcelBuilder}
 *
 * @properties={typeid:24,uuid:"BB9E7D05-0A64-4D4F-B0DC-9799C3705C3A"}
 */
function NgGridExcelBuilder(tableComponent, useTableColumnState) {
	if (tableComponent.getElementType() != "aggrid-groupingtable") {
		throw "The given table element should be an element of type aggrid-groupingtable component; check the 'Data Grid' from the NG Grids package";
	}

	//first set the table component as it is needed when creating default search
	AbstractExcelBuilder.call(this);

	/**
	 * @protected
	 * @type {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>}
	 */
	this.element = tableComponent;

	/**
	 * @protected
	 * @type {Boolean}
	 */
	this.useTableColumnState = useTableColumnState === true ? true : false;

	/**
	 * @protected
	 * @type {Array<ExcelColumn>}
	 */
	this.excelColumns = this.getExcelColumns();
}

/**
 *
 * @param {JSFoundSet} foundset
 *
 * @returns {FoundSetExcelBuilder}
 * @public
 * @example <pre>
 * var excelBuilder = scopes.svyExcelBuilder.createFoundSetExcelBuilder(foundset);
 * excelBuilder.addExcelColumn('customerid').setHeaderText('Customer')
 * excelBuilder.addExcelColumn('orderdate').setHeaderText('Date').setFormat('dd-MM-yyyy')
 * var wb = excelBuilder.createWorkbook();
 * wb.openFile('excel_export');
 * </pre>
 *
 * @properties={typeid:24,uuid:"68BC1302-822B-4273-A0C8-E7A185F627F7"}
 */
function createFoundSetExcelBuilder(foundset) {
	return new FoundSetExcelBuilder(foundset);
}

/**
 *
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} tableComponent
 * @param {Boolean} [useTableColumnState] Default: false
 *
 * @returns {NgGridExcelBuilder}
 * @public
 * @example <pre>
 * var excelBuilder = scopes.svyExcelBuilder.createNgGridExcelBuilder(elements.table, true);
 * var workbook = excelBuilder.createWorkbook(scopes.svyExcelUtils.FILE_FORMAT.XLSX);
 * workbook.openFile('excel_export');
 * </pre>
 *
 * @properties={typeid:24,uuid:"08C4A34F-D87D-4FA0-AC6B-B1B6F47C19C1"}
 */
function createNgGridExcelBuilder(tableComponent, useTableColumnState) {
	return new NgGridExcelBuilder(tableComponent, useTableColumnState);
}

/**
 *
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} tableComponent
 * @param {Boolean} [useTableColumnState] Default: false
 * @param {Number} [templateOrFileType]
 *
 * @returns {scopes.svyExcelUtils.FoundSetExcelWorkbook}
 * @public
 * @example <pre>
 * var workbook = scopes.svyExcelBuilder.createWorkbookFromNgGrid(elements.table, true, scopes.svyExcelUtils.FILE_FORMAT.XLSX);
 * workbook.writeToFile('C:/excel.xlsx');
 * </pre>
 *
 * @properties={typeid:24,uuid:"E4BE2907-A124-4968-9702-75C50DD8B081"}
 */
function createWorkbookFromNgGrid(tableComponent, useTableColumnState, templateOrFileType) {
	var excelBuilder = new NgGridExcelBuilder(tableComponent, useTableColumnState);
	return excelBuilder.createWorkbook(templateOrFileType)
}

/**
 * @constructor
 * @param {String} dataprovider Dataprovider to use for filtering the data
 * @param {String} titleText Display text to show as header
 * @param {String} [format] Format to use
 * @param {String} [alias] column identifier
 *
 * @private
 *
 * @properties={typeid:24,uuid:"0E21530B-4EAF-4255-8A8C-66C61F5103FD"}
 */
function ExcelColumn(dataprovider, titleText, format, alias) {
	/**
	 * @protected
	 * @type {String}
	 */
	this.id = alias ? alias : dataprovider;

	/**
	 * @protected
	 * @type {String}
	 */
	this.dataprovider = dataprovider;

	/**
	 * @protected
	 * @type {String}
	 */
	this.text = titleText;

	/**
	 * @protected
	 * @type {String}
	 */
	this.format = format;

	/**
	 * @protected
	 * applicable to Date filters only; true if the Date uses the format useLocalDateTime
	 * @type {Boolean}
	 */
	this.useLocalDateTime = false;

	/**
	 * TODO use valuelists in Excel Export to substitue values !?
	 * @protected
	 * @type {String}
	 */
	this.valuelist = null;

	/**
	 * TODO Footer Text
	 * @protected
	 * @type {String}
	 */
	this.footer = null;

	// TODO use setter/getter

	return this;
}

/**
 * @private
 * @param headerTitle
 * @return {String}
 *
 * @properties={typeid:24,uuid:"F4616606-A704-4084-82F1-921D6EA6F712"}
 */
function getI18nText(headerTitle) {
	/** @type {String} */
	var text = headerTitle;
	if (text && text.indexOf("i18n:") == 0) {
		text = i18n.getI18NMessage(text.replace("i18n:", ""))
	}
	return text;
}

/**
 * @constructor
 * @this {ExcelColumn}
 * @private
 * @properties={typeid:24,uuid:"AF236F7D-94CB-4095-A470-264B78E71B0F"}
 */
function initExcelColumn() {
	ExcelColumn.prototype = Object.create(ExcelColumn.prototype);
	ExcelColumn.prototype.constructor = ExcelColumn;

	/**
	 *
	 * @public
	 * @return {String}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.getAlias = function() {
		return this.id;
	}

	/**
	 *
	 * @public
	 * @return {String}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.getDataProvider = function() {
		return this.dataprovider;
	}

	/**
	 * @param {String} dataProvider
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.setDataProvider = function(dataProvider) {
		this.dataprovider = dataProvider;
		return this;
	}

	/**
	 *
	 * @public
	 * @return {String}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.getHeaderText = function() {
		return this.text;
	}

	/**
	 * @param {String} headerText
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.setHeaderText = function(headerText) {
		this.text = headerText;
		return this;
	}

	/**
	 *
	 * @public
	 * @return {String}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.getFormat = function() {
		return this.format;
	}

	/**
	 * @param {String} format
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.setFormat = function(format) {
		this.format = format;
		return this;
	}

	/**
	 *
	 * @public
	 * @return {Boolean}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.getUseLocalDateTime = function() {
		return this.useLocalDateTime;
	}

	/**
	 * @param {Boolean} useLocalDateTime
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {ExcelColumn}
	 */
	ExcelColumn.prototype.setUseLocalDateTime = function(useLocalDateTime) {
		this.useLocalDateTime = useLocalDateTime;
		return this;
	}
}

/**
 * @constructor
 * @private
 * @properties={typeid:24,uuid:"F2C639E6-E20D-49F6-9200-57975D75D3CA"}
 * @AllowToRunInFind
 */
function initAbstractExcelBuilder() {
	AbstractExcelBuilder.prototype = Object.create(AbstractExcelBuilder.prototype);
	AbstractExcelBuilder.prototype.constructor = AbstractExcelBuilder;

	/**
	 * Returns the foundset to be exported<p>
	 * This method can be overwritten by subclasses to return for example the foundset of an NG Grid
	 *
	 * @protected 
	 * @return {JSFoundSet}
	 *
	 * @this {AbstractExcelBuilder}
	 */
	AbstractExcelBuilder.prototype.getFoundSet = function() {
		throw "Must implement getFoundSet"
	}

	/**
	 * @param {String|plugins.file.JSFile|Number} [templateOrFileType] either file or media URL pointing to an existing Excel to be used as templateOrFileType or one of the FILE_FORMAT constants when creating empty workbooks
	 * @public
	 * @return {scopes.svyExcelUtils.FoundSetExcelWorkbook}
	 *
	 * @this {AbstractExcelBuilder}
	 */
	AbstractExcelBuilder.prototype.createWorkbook = function(templateOrFileType) {

		var foundset = this.getFoundSet();

		if (!foundset) {
			return null;
		}

		var column;
		var dataproviders = [];
		var headers = [];

		// get dataproviders & headers
		for (var i = 0; i < this.excelColumns.length; i++) {
			column = this.excelColumns[i];
			dataproviders.push(column.getDataProvider());
			headers.push(column.getHeaderText());
		}

		var workbook = scopes.svyExcelUtils.createWorkbookFromFoundSet(foundset, dataproviders, headers, templateOrFileType);

		// set format for columns
		for (i = 0; i < this.excelColumns.length; i++) {

			column = this.excelColumns[i];

			/** @type {String} */
			var format = column.getFormat();
			if (format) {
				workbook.setFormatForColumn(i + 1, format, column.getUseLocalDateTime());
			}

			// TODO should look at format property in DataSource to set a default format !?
		}

		this.workbook = workbook;

		return workbook;
	}

	/**
	 * @param {String} alias
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {AbstractExcelBuilder}
	 */
	AbstractExcelBuilder.prototype.getExcelColumn = function(alias) {

		for (var i = 0; i < this.excelColumns.length; i++) {
			var excelCol = this.excelColumns[i];
			if (excelCol.getAlias() == alias) {
				return excelCol;
			}
		}
		return null;
	}

	/**
	 * @param {String} dataProvider
	 * @param {Number} [index] 0-based index
	 * @param {String} [headerTitle]
	 * @param {String} [format]
	 * @param {String} [alias] if undefined will use dataprovider as an alias to identify the ExcelColumn
	 * @public
	 * @return {ExcelColumn}
	 *
	 *
	 * @this {AbstractExcelBuilder}
	 */
	AbstractExcelBuilder.prototype.addExcelColumn = function(dataProvider, index, headerTitle, format, alias) {

		var excelCol = new ExcelColumn(dataProvider, headerTitle, format, alias);

		if (index || index == 0) {
			scopes.svyJSUtils.arrayInsert(this.excelColumns, index, excelCol)
		} else {
			this.excelColumns.push(excelCol);
		}

		return excelCol;
	}

	/**
	 * @param {String} alias
	 * @public
	 * @return {AbstractExcelBuilder}
	 *
	 * @this {AbstractExcelBuilder}
	 */
	AbstractExcelBuilder.prototype.removeExcelColumn = function(alias) {

		// TODO should remove it by ID instead !?

		for (var i = 0; i < this.excelColumns.length; i++) {
			var excelCol = this.excelColumns[i];
			if (excelCol.getAlias() == alias) {
				this.excelColumns.splice(i, 1);
				return this;
			}
		}

		return this;
	}

	// TODO should consider to get excelColumn by Index !? How !?
}

/**
 * @constructor
 * @extends {AbstractExcelBuilder}
 * @private
 * @properties={typeid:24,uuid:"CCEE7954-024D-49D0-A0D1-DF010323C092"}
 * @AllowToRunInFind
 */
function initFoundSetExcelBuilder() {
	FoundSetExcelBuilder.prototype = Object.create(AbstractExcelBuilder.prototype);
	FoundSetExcelBuilder.prototype.constructor = FoundSetExcelBuilder;
}

/**
 * @constructor
 * @extends {AbstractExcelBuilder}
 * @private
 * @properties={typeid:24,uuid:"9A08B6F2-F06A-49FC-BF59-7848EA5D0E0C"}
 * @AllowToRunInFind
 */
function initNgGridExcelBuilder() {
	NgGridExcelBuilder.prototype = Object.create(AbstractExcelBuilder.prototype);
	NgGridExcelBuilder.prototype.constructor = NgGridExcelBuilder;

	/**
	 * TODO do i need this ?
	 * Returns the datasource to be filtered as the datasource of the NG Grid
	 *
	 * @protected  
	 * @return {String}
	 *
	 * @this {NgGridExcelBuilder}
	 */
	NgGridExcelBuilder.prototype.getDataSource = function() {
		var tableComponent = this.element;

		if (!tableComponent) {
			return null;
		}

		var tableFoundset = tableComponent.myFoundset.foundset;
		var tableDataSource;

		var jsForm = solutionModel.getForm(tableComponent.getFormName());
		var jsTable = jsForm.findWebComponent(tableComponent.getName());
		var foundsetSelector = jsTable.getJSONProperty("myFoundset").foundsetSelector;

		try {
			if (foundsetSelector) {
				if (databaseManager.getTable(foundsetSelector)) {
					tableDataSource = foundsetSelector;
				} else if (foundsetSelector.split('.').length > 1) {
					tableDataSource = scopes.svyDataUtils.getRelationForeignDataSource(foundsetSelector)
				} else if (solutionModel.getRelation(foundsetSelector)) {
					var jsRel = solutionModel.getRelation(foundsetSelector);
					tableDataSource = jsRel.foreignDataSource;
				}
			}
		} catch (e) {
			application.output(e, LOGGINGLEVEL.ERROR);
		}

		if (tableDataSource) {
			// do nothing
		} else if (tableFoundset) {
			tableDataSource = tableFoundset.getDataSource();
		} else {
			var form = forms[tableComponent.getFormName()];
			tableDataSource = form ? form.foundset.getDataSource() : null;
		}

		return tableDataSource || null;
	}

	/**
	 * @param {String} id excel column identified
	 * @public
	 * @return {ExcelColumn}
	 *
	 * @this {NgGridExcelBuilder}
	 */
	NgGridExcelBuilder.prototype.getExcelColumn = function(id) {
		return AbstractExcelBuilder.prototype.getExcelColumn.call(this, id);
	}

	/**
	 * @protected 
	 * @return {JSFoundSet}
	 *
	 * @this {NgGridExcelBuilder}
	 *  */
	NgGridExcelBuilder.prototype.getFoundSet = function() {
		return this.element.myFoundset.foundset;
	}

	/**
	 * @public
	 * @return {Array<ExcelColumn>}
	 *
	 * @this {NgGridExcelBuilder}
	 *  */
	NgGridExcelBuilder.prototype.getExcelColumns = function() {

		if (this.useTableColumnState) {
			return this.getExcelColumnsFromColumnState()
		}

		return this.getExcelColumnsFromDesign();
	}

	/**
	 * @protected
	 * @return {Array<ExcelColumn>}
	 *
	 * @this {NgGridExcelBuilder}
	 *  */
	NgGridExcelBuilder.prototype.getExcelColumnsFromDesign = function() {
		var excelColumns = [];
		var columns = this.element.columns;
		for (var i = 0; i < columns.length; i++) {

			var col = columns[i];
			var headerTitle = col.headerTitle ? getI18nText(col.headerTitle) : null;
			/** @type {String} */
			var format = col.format ? (col.format.indexOf('displayFormat') > -1 ? JSON.parse(col.format)['displayFormat'] : col.format) : null;
			if (format && format.indexOf('|') > -1) {
				format = format.substring(0, format.indexOf('|'));
			}
			var useLocalDateTime = col.format ? (col.format.indexOf('useLocalDateTime') > -1 ? JSON.parse(col.format)['useLocalDateTime'] : false) : false;

			format = getI18nText(format)
			var dataprovider = col.dataprovider;

			if (dataprovider) {

				// TODO should use ID to identify columns
				var excelColumn = new ExcelColumn(dataprovider, headerTitle, format);
				excelColumn.setUseLocalDateTime(useLocalDateTime);
				excelColumns.push(excelColumn);

			} else {
				// TODO shall look at styleClassDataprovider !?
			}
		}

		return excelColumns;
	}

	/**
	 * @protected
	 * @return {Array<ExcelColumn>}
	 *
	 * @this {NgGridExcelBuilder}
	 *  */
	NgGridExcelBuilder.prototype.getExcelColumnsFromColumnState = function() {

		var table = this.element;

		/** @type {Array}*/
		var colstates = (table.getColumnState()) ? JSON.parse(table.getColumnState())['columnState'] : null;
		if (!colstates) {
			return this.getExcelColumnsFromDesign();
		}

		var excelColumns = [];

		var column;
		var columnIndexes = [];
		if (colstates) {
			for (var i = 0; i < colstates.length; i++) {
				if (!colstates[i].hide) {
					column = table.getColumn(table.getColumnIndex(colstates[i]['colId']));
					if (column) {
						columnIndexes.push(table.getColumnIndex(colstates[i]['colId']));
					}
				}
			}
		} else {
			for (var j = 0; j < table.getColumnsCount(); j++) {
				column = table.getColumn(j);
				if (column.visible) {
					columnIndexes.push(j);
				}
			}
		}

		for (var index = 0; index < columnIndexes.length; index++) {
			/** @type {Number}*/
			var realIndex = columnIndexes[index];

			var col = table.getColumn(realIndex);
			if (col) {

				var headerTitle = col.headerTitle ? getI18nText(col.headerTitle) : null;
				/** @type {String} */
				var format = col.format ? (col.format.indexOf('displayFormat') > -1 ? JSON.parse(col.format)['displayFormat'] : col.format) : null;
				if (format && format.indexOf('|') > -1) {
					format = format.substring(0, format.indexOf('|'));
				}
				var useLocalDateTime = col.format ? (col.format.indexOf('useLocalDateTime') > -1 ? JSON.parse(col.format)['useLocalDateTime'] : false) : false;

				format = getI18nText(format)
				var dataprovider = col.dataprovider;

				if (dataprovider) {

					// TODO should use ID to identify columns
					var excelColumn = new ExcelColumn(dataprovider, headerTitle, format);
					excelColumn.setUseLocalDateTime(useLocalDateTime);
					excelColumns.push(excelColumn);

				} else {
					// TODO shall look at styleClassDataprovider !?
				}
			}
		}

		return excelColumns;
	}
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"76DFB61A-BCD0-4E84-B918-CBF7650F924B",variableType:-4}
 */
var init = (function() {
		initExcelColumn();
		initAbstractExcelBuilder();
		initFoundSetExcelBuilder();
		initNgGridExcelBuilder();
	}());
