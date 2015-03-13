/*
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2013 Servoy BV 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @private
 * 
 * @type {scopes.svyLogManager.Logger}
 *
 * @properties={typeid:35,uuid:"5AF56C14-530F-4513-99EE-3F8943EF0A7E",variableType:-4}
 */
var logger = scopes.svyLogManager.getLogger("com.servoy.bap.datasetgrid");

/**
 * Creates a TableGrid from the given dataset
 * 
 * @version 6.0
 * @since 07.06.2014
 * @author patrick
 *
 * @param {JSDataSet} dataset
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 * @param {Array<Number>} [columnTypes]
 *
 * @properties={typeid:24,uuid:"1120352D-21A4-4D1E-B93C-EB1FC853A444"}
 */
function createTableGridFromDataset(dataset, columnHeaders, dataproviders, columnTypes) {
	try {
		var datasource;
		if (!columnTypes) {
			columnTypes = new Array();
			for (var x = 1; x <= dataset.getMaxColumnIndex(); x++) {
				if (!dataset.getColumnType(x)) {
					throw new scopes.svyDataUtils.SvyDataException("Failed to create TableGrid because no column types were given");
				}
				this.columnTypes.push(dataset.getColumnType(x));
			}
		}
		var formName = "tablegrid_" + utils.stringReplace(application.getUUID().toString(), "-", "_");
		if (columnTypes) {
			datasource = dataset.createDataSource(formName + "_datasource", columnTypes);
		} else {	
			datasource = dataset.createDataSource(formName + "_datasource");
		}
		return new TableGrid(datasource, columnHeaders, dataproviders);
	} catch(e) {
		logger.error("Error creating TableGrid from dataset: " + e.message, e);
		return null;
	}
}

/**
 * Creates a TableGrid from the given QBSelect query
 * 
 * @version 6.0
 * @since 07.06.2014
 * @author patrick
 *
 * @param {QBSelect} query
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 * @param {Array<Number>} [columnTypes]
 * @param {Number} [maxReturnedRows]
 *
 * @properties={typeid:24,uuid:"CC1ACB5B-8071-49B6-8A60-03070F2793EB"}
 */
function createTableGridFromQBSelect(query, columnHeaders, dataproviders, columnTypes, maxReturnedRows) {
	try {
		if (maxReturnedRows == undefined || maxReturnedRows == null) {
			maxReturnedRows = -1;
		}
		var formName = "tablegrid_" + utils.stringReplace(application.getUUID().toString(), "-", "_");
		var datasource;
		if (columnTypes) {
			datasource = databaseManager.createDataSourceByQuery(formName + "_datasource", query, maxReturnedRows, columnTypes);
		} else {
			datasource = databaseManager.createDataSourceByQuery(formName + "_datasource", query, maxReturnedRows);
		}
		return new TableGrid(datasource, columnHeaders, dataproviders);
	} catch(e) {
		logger.error("Error creating TableGrid from query: " + e.message, e);
		return null;
	}
}

/**
 * Creates a TableGrid from the given query
 * 
 * @version 6.0
 * @since 07.06.2014
 * @author patrick
 * 
 * @param {String} serverName
 * @param {String} query
 * @param {Array<*>} [queryArguments]
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 * @param {Array<Number>} [columnTypes]
 * @param {Number} [maxReturnedRows]
 *
 * @properties={typeid:24,uuid:"20DEBF57-1873-492A-8F75-21A278ECAAEA"}
 */
function createTableGridFromQuery(serverName, query, queryArguments, columnHeaders, dataproviders, columnTypes, maxReturnedRows) {
	try {
		if (maxReturnedRows == undefined || maxReturnedRows == null) {
			maxReturnedRows = -1;
		}
		if (queryArguments == undefined) {
			queryArguments = null;
		}
		var formName = "tablegrid_" + utils.stringReplace(application.getUUID().toString(), "-", "_");
		var datasource;
		if (columnTypes) {
			datasource = databaseManager.createDataSourceByQuery(formName + "_datasource", serverName, query, queryArguments, maxReturnedRows, columnTypes);
		} else {
			datasource = databaseManager.createDataSourceByQuery(formName + "_datasource", serverName, query, queryArguments, maxReturnedRows);
		}
		return new TableGrid(datasource, columnHeaders, dataproviders);
	} catch(e) {
		logger.error("Error creating TableGrid from query: " + e.message, e);
		return null;
	}
}

/**
 * 
 * @version 6.0
 * @since 30.07.2014
 * @author patrick
 *
 * @param {JSFoundSet} foundset
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 *
 * @properties={typeid:24,uuid:"AD0DC30F-6E69-4A0A-A434-14F1EB3B2251"}
 */
function createTableGridFromFoundSet(foundset, columnHeaders, dataproviders) {
	try {
		return new TableGrid(foundset.getDataSource(), columnHeaders, dataproviders);
	} catch(e) {
		logger.error("Error creating TableGrid from query: " + e.message, e);
		return null;
	}
}

/**
 * 
 * @version 6.0
 * @since 30.07.2014
 * @author patrick
 *
 * @param {JSDataSource|String} datasource
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 *
 * @properties={typeid:24,uuid:"0F8F3539-34DE-4506-BBD0-643FD7895B05"}
 */
function createTableGrid(datasource, columnHeaders, dataproviders) {
	try {
		if (datasource instanceof JSDataSource) {
			/** @type {JSDataSource} */
			var jsDs = datasource;
			return new TableGrid(jsDs.getDatasource(), columnHeaders, dataproviders);
		} else {
			/** @type {String} */
			var stringDs = datasource;
			return new TableGrid(stringDs, columnHeaders, dataproviders);
		}
	} catch(e) {
		logger.error("Error creating TableGrid from query: " + e.message, e);
		return null;
	}
}

/**
 * TableGrid constructor<p>
 * 
 * A TableGrid object takes a datasource and creates a table view form that can be added to a tab panel
 * 
 * @constructor 
 * @private 
 * 
 * @param {String} datasource to show
 * @param {Array<String>} [columnHeaders] column headers to display
 * @param {Array<String>} [dataproviders] dataproviders to show on form
 * 
 * @throws {scopes.svyDataUtils.SvyDataException} when no column types were given for manually created datasets
 * 
 * @version 5.0
 * @author patrick
 *
 * @properties={typeid:24,uuid:"5738DD1A-37EE-4EE1-B6A7-1E5DCB3BF17D"}
 * @AllowToRunInFind
 */
function TableGrid(datasource, columnHeaders, dataproviders) {
	
	if (!datasource || !(datasource instanceof String)) {
		throw new scopes.svyExceptions.IllegalArgumentException("No datasource provided");
	}
	
	if (!databaseManager.dataSourceExists(datasource)) {
		throw new scopes.svyExceptions.IllegalArgumentException("Datasource \"" + datasource + "\" does not exist");
	}
	
	if (!(this instanceof TableGrid)) {
		logger.warn("scopes.modUtils$datasetGrid.TableGrid: Constructor functions should be called with the \"new\" keyword!");
		return new TableGrid(datasource, columnHeaders, dataproviders);
	}
	
	/** 
	 * Array of GridColumns to show
	 * 
	 * @type {Array<GridColumn>} 
	 */
	var gridColumns = new Array();
	
	this.baseFormName = "svyUtils$tableGridBase";
	
	/**
	 * Sets the base form used when the form is created<p>
	 * 
	 * The form needs to inherit from forms.datasetGridBase
	 * 
	 * @param {String|RuntimeForm} baseForm - the name or a reference to the base form to be used
	 */
	this.setBaseFormName = function(baseForm) {
		/** @type {JSForm} */		
		var jsBaseForm = scopes.svyUI.getJSFormForReference(baseForm);
		if (jsBaseForm) {
			if (!scopes.svyUI.isJSFormInstanceOf(jsBaseForm, "svyUtils$tableGridBase")) {
				throw new scopes.svyExceptions.IllegalArgumentException("Form \"" + baseForm + "\" is not an intance of \"datasetGridBase\"");
			}
			this.baseFormName = jsBaseForm.name;
		}
	}
	
	/**
	 * The style of the grid
	 * 
	 * @type {String}
	 */
	this.style = null;
	
	/**
	 * Sets the style of this grid
	 * @param {String} [style]
	 * @return {TableGrid}
	 */
	this.setStyle = function(style) {
		this.style = style;
		return this;
	}
	
	/**
	 * The width of the form
	 * 
	 * @type {Number}
	 */
	this.width = 800;
	
	/**
	 * Sets the width of the form
	 * @param {Number} [width]
	 * @return {TableGrid}
	 */
	this.setWidth = function(width) {
		this.width = width;
		return this;
	}
	
	/**
	 * The height of the form
	 * 
	 * @type {Number}
	 */
	this.height = 40;
	
	/**
	 * Sets the height of the form
	 * @param {Number} [height]
	 * @return {TableGrid}
	 */
	this.setHeight = function(height) {
		this.height = height;
		return this;
	}
	
	/**
	 * The scrollbar property of the form<p>
	 * 
	 * Use any of the SM_SCROLLBAR constants
	 * 
	 * @type {Number}
	 */
	this.scrollbars = SM_SCROLLBAR.HORIZONTAL_SCROLLBAR_NEVER | SM_SCROLLBAR.VERTICAL_SCROLLBAR_AS_NEEDED;
	
	/**
	 * Sets the scrollbar property of the form<p>
	 * Use any of the SM_SCROLLBAR constants
	 * @param {Number} [scrollbars]
	 * @return {TableGrid}
	 */
	this.setScrollbars = function(scrollbars) {
		this.scrollbars = scrollbars;
		return this;
	}
	
	/**
	 * The height of the table header
	 * @type {Number}
	 */
	this.headerHeight = 20;
	
	/**
	 * Gets / Sets the height of the table header
	 * @param {Number} [headerHeight]
	 * @return {TableGrid}
	 */
	this.setHeaderHeight = function(headerHeight) {
		this.headerHeight = headerHeight;
		return this;
	}
	
	/**
	 * The height of the table rows
	 * @type {Number}
	 */
	this.rowHeight = 20;
	
	/**
	 * Sets the height of the table rows
	 * @param {Number} [rowHeight]
	 * @return {TableGrid}
	 */
	this.setRowHeight = function(rowHeight) {
		this.rowHeight = rowHeight;
		return this;
	}
	
	/**
	 * Style class used for the header labels
	 * @type {String}
	 */
	this.headerStyleClass = null;
	
	/**
	 * Gets / Sets the style class used for the header labels
	 * @param {String} [headerStyleClass]
	 * @return {String|TableGrid}
	 */
	this.setHeaderStyleClass = function(headerStyleClass) {
		this.headerStyleClass = headerStyleClass;
		return this;
	}
	
	/**
	 * Style class used for the fields of the table
	 * @type {String}
	 */
	this.rowStyleClass = null;
	
	/**
	 * Sets the style class used for the fields of the table
	 * @param {String} rowStyleClass
	 * @return {TableGrid}
	 */
	this.setRowStyleClass = function(rowStyleClass) {
		this.rowStyleClass = rowStyleClass;
		return this;
	}	
	
	/**
	 * The transparent property of this form
	 * @type {Boolean}
	 */
	this.transparent = false;
	
	/**
	 * Sets the transparent property of this form
	 * @param {Boolean} [transparent]
	 * @return {Boolean|TableGrid}
	 */
	this.setTransparent = function(transparent) {
		this.transparent = transparent;
		return this;
	}
	
	this.editable = false;
	
	/**
	 * Sets the editable property of grid<p>
	 * This can be overriden for certain GridColumns
	 * 
	 * @return {TableGrid}
	 */
	this.setEditable = function(editable) {
		this.editable = editable;
		return this;
	}
	
	/**
	 * The name of the form
	 * @type {String}
	 */
	this.formName = null;
	
	/**
	 * Gets / Sets the name of the form
	 * @param {String} name
	 * @return {String|TableGrid}
	 */
	this.setFormName = function(name) {
		this.formName = name;
		return this;
	}		
	
	/**
	 * onShow method
	 * @type {String}
	 */
	this.onShow = null;
	
	/**
	 * Sets the onShow method of this form<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onShowFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnShow = function(onShowFunctionOrCode) {
		if (onShowFunctionOrCode instanceof String) {
			this.onShow = onShowFunctionOrCode;
		} else if (onShowFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onShowFunctionOrCode;
			this.onShow = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onSort method
	 * @type {String}
	 */
	this.onSort = null;
	
	/**
	 * Sets the onSort method of this form<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onSortFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnSort = function(onSortFunctionOrCode) {
		if (onSortFunctionOrCode instanceof String) {
			this.onSort = onSortFunctionOrCode;
		} else if (onSortFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onSortFunctionOrCode;
			this.onSort = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * Method to be called after the form is created
	 * @type {String}
	 */
	this.onFormCreated = null;
	
	/**
	 * Sets a method that is fired when the actual runtime form is created<p>
	 * 
	 * When the method is fired it receives the RuntimeForm created as parameter<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onFormCreatedFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnFormCreated = function(onFormCreatedFunctionOrCode) {
		if (onFormCreatedFunctionOrCode instanceof String) {
			this.onFormCreated = onFormCreatedFunctionOrCode;
		} else if (onFormCreatedFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onFormCreatedFunctionOrCode;
			this.onFormCreated = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}	
	
	/**
	 * onHide method
	 * @type {String}
	 */
	this.onHide = null;
	
	/**
	 * Sets the onHide method of this form<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onHideFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnHide = function(onHideFunctionOrCode) {
		if (onHideFunctionOrCode instanceof String) {
			this.onHide = onHideFunctionOrCode;
		} else if (onHideFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onHideFunctionOrCode;
			this.onHide = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * recordSelection method
	 * @type {String}
	 */
	this.onRecordSelection = null;	
	
	/**
	 * Sets the recordSelection method<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onRecordSelectionFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnRecordSelection = function(onRecordSelectionFunctionOrCode) {
		if (onRecordSelectionFunctionOrCode instanceof String) {
			this.onRecordSelection = onRecordSelectionFunctionOrCode;
		} else if (onRecordSelectionFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onRecordSelectionFunctionOrCode;
			this.onRecordSelection = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onRender method
	 * @type {String}
	 */
	this.onRender = null;
	
	/**
	 * Sets the onRender method<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onRenderFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnRender = function(onRenderFunctionOrCode) {
		if (onRenderFunctionOrCode instanceof String) {
			this.onRender = onRenderFunctionOrCode;
		} else if (onRenderFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onRenderFunctionOrCode;
			this.onRender = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onRightClick method
	 * @type {String}
	 */
	this.onRightClick = null;	
	
	/**
	 * Sets the onRightClick method<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onRightClickFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnRightClick = function(onRightClickFunctionOrCode) {
		if (onRightClickFunctionOrCode instanceof String) {
			this.onRightClick = onRightClickFunctionOrCode;
		} else if (onRightClickFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onRightClickFunctionOrCode;
			this.onRightClick = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onDataChange method
	 * @type {String}
	 */
	this.onDataChange = null;	
	
	/**
	 * Sets the onDataChange method<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onDataChangeFunctionOrCode
	 * @return {Function|String|TableGrid}
	 */
	this.setOnDataChange = function(onDataChangeFunctionOrCode) {
		if (onDataChangeFunctionOrCode instanceof String) {
			this.onDataChange = onDataChangeFunctionOrCode;
		} else if (onDataChangeFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onDataChangeFunctionOrCode;
			this.onDataChange = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onDoubleClick method
	 * 
	 * @type {String}
	 */
	this.onDoubleClick = null;		
	
	/**
	 * Sets a method that is called on double click<p>
	 * 
	 * If set, all fields will be rendered as labels and some <br>
	 * functionality such as onDataChange will not work<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onDoubleClickFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnDoubleClick = function(onDoubleClickFunctionOrCode) {
		if (onDoubleClickFunctionOrCode instanceof String) {
			this.onDoubleClick = onDoubleClickFunctionOrCode;
		} else if (onDoubleClickFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onDoubleClickFunctionOrCode;
			this.onDoubleClick = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * onAction method
	 * @type {String}
	 */
	this.onAction = null;
	
	/**
	 * Sets a method that is called on action of any of the fields of the grid<p>
	 * 
	 * The method can be any form or scope method or is created using the given code
	 * 
	 * @param {Function|String} onActionFunctionOrCode
	 * @return {TableGrid}
	 */
	this.setOnAction = function(onActionFunctionOrCode) {
		if (onActionFunctionOrCode instanceof String) {
			this.onAction = onActionFunctionOrCode;
		} else if (onActionFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onActionFunctionOrCode;
			this.onAction = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * Adds a column to the grid
	 * 
	 * @param {String} dataproviderName
	 * @param {String} headerText
	 * 
	 * @return {GridColumn}
	 */
	function addColumn(dataproviderName, headerText) {
		var newColumn = new GridColumn(dataproviderName, gridColumns.length + 1);
		if (headerText) {
			newColumn.setHeaderText(headerText);
		}
		gridColumns.push(newColumn);
		return newColumn;
	}
	
	/**
	 * Returns the column with the given dataprovider name
	 * 
	 * @param {String} dataproviderName
	 * 
	 * @return {GridColumn}
	 */
	this.column = function(dataproviderName) {
		for (var gc = 0; gc < gridColumns.length; gc++) {
			if (gridColumns[gc].dataprovider == dataproviderName) {
				return gridColumns[gc];
			}
		}
		return null;
	}
	
	/**
	 * Removes the column with the given dataprovider from the list of columns to show
	 * 
	 * @param {String} dataproviderName
	 * @return {TableGrid}
	 */
	this.removeColumn = function(dataproviderName) {
		for (var gc = 0; gc < gridColumns.length; gc++) {
			if (gridColumns[gc].dataprovider == dataproviderName) {
				gridColumns.splice(gc, 1);
			}
		}
		return this;
	}
	
	/**
	 * Refreshes the data of the grid with the data from the given dataset
	 * 
	 * @this {TableGrid}
	 * 
	 * @param {QBSelect|JSDataSet|String} queryOrDataset
	 * @param {String} [serverName] when queryOrDataset is a query string, a serverName is required
	 * @param {Array} [queryArguments] optional arguments for a query string
	 */
	this.refreshData = function(queryOrDataset, serverName, queryArguments) {
		if (queryOrDataset instanceof JSDataSet) {
			/** @type {JSDataSet} */
			var dataset = queryOrDataset;
			if (columnTypes) {
				dataset.createDataSource(utils.stringReplace(datasource, "mem:", ""), columnTypes);
			} else {
				dataset.createDataSource(utils.stringReplace(datasource, "mem:", ""));
			}
		} else if (queryOrDataset instanceof QBSelect) {
			/** @type {QBSelect} */
			var query = queryOrDataset;
			databaseManager.createDataSourceByQuery(utils.stringReplace(datasource, "mem:", ""), query, -1);
		} else if (queryOrDataset instanceof String) {
			/** @type {String} */
			var queryString = queryOrDataset;
			databaseManager.createDataSourceByQuery(utils.stringReplace(datasource, "mem:", ""), serverName, queryString, queryArguments, -1);
		} else {
			throw new scopes.svyExceptions.IllegalArgumentException("Illegal arguments provided for refreshData");
		}
		
		if (this.formName && forms[this.formName]) {
			var fs = databaseManager.getFoundSet(datasource);
			fs.loadAllRecords();
			forms[this.formName].controller.loadRecords(fs);
		} 
	}	
	
	var useHeaders;
	var jsTable = databaseManager.getTable(databaseManager.getFoundSet(datasource));
	if (!dataproviders) {
		var columnNames = jsTable.getColumnNames();
		if (columnNames.indexOf("_sv_rowid") != -1) {
			columnNames.splice(columnNames.indexOf("_sv_rowid"), 1);
		}
		useHeaders = false;
		if (columnHeaders && columnHeaders.length == columnNames.length) {
			useHeaders = true;
		}
		for (var colIndex = 0; colIndex < columnNames.length; colIndex++) {
			/** @type {GridColumn} */
			var newCol = new GridColumn(columnNames[colIndex], colIndex);
			if (useHeaders) {
				newCol.setHeaderText(columnHeaders[colIndex]);
			}
			gridColumns.push(newCol);
		}
	} else {
		useHeaders = false;
		if (columnHeaders && columnHeaders.length >= dataproviders.length) {
			useHeaders = true;
		}
		for (var i = 0; i < dataproviders.length; i++) {
			var headerName = useHeaders ? columnHeaders[i] : dataproviders[i];
			addColumn(dataproviders[i], headerName);
		}
	}
	
	var columnTypes = [];
	var colNames = jsTable.getColumnNames();
	for (var cn = 0; cn < colNames.length; cn++) {
		columnTypes.push(jsTable.getColumn(colNames[cn]).getType());
	}
	
	/**
	 * Returns an array of JSColumn column types constants
	 * 
	 * @return {Array<Number>}
	 */
	this.getColumnTypes = function() {
		return columnTypes;
	}
	
	/**
	 * Returns the dataSource of this TableGrid
	 * 
	 * @return {String}
	 */
	this.getDataSource = function() {
		return datasource;
	}
	
	/**
	 * Returns either the current foundset of the form built <br>
	 * or an empty foundset of the datasource of this TableGrid <br>
	 * if no form has been created yet
	 * 
	 * @return {JSFoundSet}
	 */
	this.getFoundSet = function() {
		if (forms[this.formName]) {
			return forms[this.formName].foundset;
		} else {
			return databaseManager.getFoundSet(datasource);
		}
	}
	
	/**
	 * Returns a dataset with all the data of the datasource
	 * 
	 * @return {JSDataSet}
	 */
	this.getDataSet = function() {
		var query = databaseManager.createSelect(datasource);
		/** @type {Array<String>} */
		var columns = query.columns["allnames"];
		for (var c = 0; c < columns.length; c++) {
			query.result.add(query.getColumn(columns[c]));
		}
		var result = databaseManager.getDataSetByQuery(query, -1);
		return result;
	}
	
	/**
	 * Creates and returns the grid form<p>
	 * 
	 * The form created has a variable <code>tableGrid</code> that<br>
	 * contains a reference to this TableGrid object that can be used<br>
	 * to further interact with the grid (e.g. refreshData())
	 * 
	 * @this {TableGrid}
	 * 
	 * @param {String} [formName] the name of the form to be created
	 * 
	 * @return {RuntimeForm<svyUtils$tableGridBase>}
	 */
	this.createForm = function(formName) {
		
		if (!formName) {
			formName = "tablegrid_" + utils.stringReplace(application.getUUID().toString(), "-", "_");
		}
		this.formName = formName;
		
		history.removeForm(this.formName);
		solutionModel.removeForm(this.formName);
		
		var jsForm = solutionModel.newForm(this.formName, datasource, this.style, false, this.width, this.height);
		jsForm.view = JSForm.LOCKED_TABLE_VIEW;
		jsForm.scrollbars = this.scrollbars;
		jsForm.transparent = this.transparent;
		jsForm.extendsForm = solutionModel.getForm(this.baseFormName);
		
		if (this.onShow) jsForm.onShow = createFunctionCallMethod(jsForm, this.onShow);
		if (this.onHide) jsForm.onHide = createFunctionCallMethod(jsForm, this.onHide);
		if (this.onRecordSelection) jsForm.onRecordSelection = createFunctionCallMethod(jsForm, this.onRecordSelection);
		if (this.onRender) jsForm.onRender = createFunctionCallMethod(jsForm, this.onRender);
		if (this.onSort) jsForm.onSortCmd = createFunctionCallMethod(jsForm, this.onSort);
		
		var onDataChangeMethod = createFunctionCallMethod(jsForm, this.onDataChange);
		var onActionMethod = createFunctionCallMethod(jsForm, this.onAction);
		var onDoubleClickMethod = createFunctionCallMethod(jsForm, this.onDoubleClick);
		var onRightClickMethod = createFunctionCallMethod(jsForm, this.onRightClick);
		
		var jsComponent;
		var jsHeaderLabel;
		var startX = 0;
		if (gridColumns && gridColumns.length > 0) {
			for (var c = 0; c < gridColumns.length; c++) {
				var gridColumn = gridColumns[c];
				
				if (gridColumn.isLabel || onDoubleClickMethod || gridColumn.onDoubleClick) {
					// if the column is wanted as a label or a double click is needed, create as label
					gridColumn.setIsLabel(true);
					jsComponent = jsForm.newLabel("", startX, this.headerHeight, gridColumn.width, this.rowHeight);
					jsComponent.dataProviderID = gridColumn.dataprovider;
				} else {
					jsComponent = jsForm.newField(gridColumn.dataprovider, gridColumn.displayType, startX, this.headerHeight, gridColumn.width, this.rowHeight);
				}
				
				jsComponent.name = gridColumn.dataprovider;
				jsComponent.anchors = gridColumn.anchors;
				jsComponent.styleClass = gridColumn.styleClass ? gridColumn.styleClass : this.rowStyleClass;
				jsComponent.format = gridColumn.format;
				jsComponent.toolTipText = gridColumn.tooltipText;
				
				jsComponent.background = gridColumn.backgroundColor;
				jsComponent.fontType = gridColumn.font;
				jsComponent.foreground = gridColumn.foreground;
				jsComponent.borderType = gridColumn.border;
				
				if (gridColumn.horizontalAlignment != null) {
					jsComponent.horizontalAlignment = gridColumn.horizontalAlignment;
				}
				
				if (!gridColumn.isLabel) {
					// It's a field; can have value list, scrollbars and dataChange events
					jsComponent.editable = this.editable ? (gridColumn.editable === false ? false : true) : (gridColumn.editable === true ? true : false);
					if (gridColumn.valueListName) {
						jsComponent.valuelist = solutionModel.getValueList(gridColumn.valueListName);
					}
					if (gridColumn.scrollbars) {
						jsComponent.scrollbars = gridColumn.scrollbars;
					}
					if (gridColumn.onDataChange) {
						jsComponent.onDataChange = createFunctionCallMethod(jsForm, gridColumn.onDataChange);	
					} else if (onDataChangeMethod) {					
						jsComponent.onDataChange = onDataChangeMethod;
					}
				} else {
					/** @type {JSLabel} */
					var jsLabel = jsComponent;
					// It's a label; can have media options, double click and vertical alignment
					if (gridColumn.mediaOptions) {
						jsLabel.mediaOptions = gridColumn.mediaOptions;
					}
					if (gridColumn.onDoubleClick) {
						jsComponent.onDoubleClick = createFunctionCallMethod(jsForm, gridColumn.onDoubleClick);
					} else if (onDoubleClickMethod) {
						jsLabel.onDoubleClick = onDoubleClickMethod;
					}
					if (gridColumn.verticalAlignment) {
						jsLabel.verticalAlignment = gridColumn.verticalAlignment;
					}
				}
				// Click action
				if (gridColumn.onAction) {
					jsComponent.onAction = createFunctionCallMethod(jsForm, gridColumn.onAction);
				} else if (onActionMethod) {
					jsComponent.onAction = onActionMethod;
				}
				// Right click
				if (gridColumn.onRightClick) {
					jsComponent.onRightClick = createFunctionCallMethod(jsForm, gridColumn.onRightClick);
				} else if (onRightClickMethod) {
					jsComponent.onRightClick = onRightClickMethod;
				}
				
				if (!gridColumn.showClick) {
					jsComponent.showClick = gridColumn.showClick;
				}
				
				if (!gridColumn.showFocus) {
					jsComponent.showFocus = gridColumn.showFocus;
				}				
				
				jsHeaderLabel = jsForm.newLabel(gridColumn.headerText, startX, 0, gridColumn.width, this.headerHeight);
				jsHeaderLabel.name = "lbl_" + jsComponent.name;
				jsHeaderLabel.styleClass = gridColumn.headerStyleClass ? gridColumn.headerStyleClass : this.headerStyleClass;
				
				if (!jsHeaderLabel.styleClass) {
					jsHeaderLabel.transparent = true;
				}
				
				if (gridColumn.headerHorizontalAlignment != null) {
					jsHeaderLabel.horizontalAlignment = gridColumn.headerHorizontalAlignment;
				}
				
				if (gridColumn.headerVerticalAlignment != null) {
					jsHeaderLabel.verticalAlignment = gridColumn.headerVerticalAlignment;
				}
				
				jsHeaderLabel.labelFor = jsComponent.name;
				
				startX += gridColumn.width;
			}
		}
		
		/** @type {RuntimeForm<svyUtils$tableGridBase>} */
		var runtimeForm = forms[jsForm.name];
		runtimeForm.tableGrid = this;
		
		if (this.onFormCreated) {
			scopes.svySystem.callMethod(this.onFormCreated, [runtimeForm]);
		}
		
		return runtimeForm;
	}
	
	/**
	 * Adds the grid to the given tab panel
	 * 
	 * @param {RuntimeTabPanel} panel
	 * @param {String} [formName]
	 * @param {String} [tabText]
	 * @param {Number} [index]
	 * 
	 * @return {RuntimeForm<svyUtils$tableGridBase>}
	 */
	this.addToPanel = function(panel, formName, tabText, index) {
		if (!formName && this.formName) {
			formName = this.formName;
		}
		if (formName) {
			// try to remove form from panel
			if (panel.getMaxTabIndex()) {
				for (var t = 1; t <= panel.getMaxTabIndex(); t++) {
					if (panel.getTabFormNameAt(t) == formName) {
						panel.removeTabAt(t);
						if (!index) {
							index = t;
						}
						break;
					}
				}
			}
		}
		var runtimeForm = this.createForm(formName);
		runtimeForm.controller.loadAllRecords();
		panel.addTab(runtimeForm, formName ? formName : null, tabText ? tabText : null, null, null, null, null, null, index >= 0 ? index : -1);
		return runtimeForm;
	}
	
	/**
	 * Returns the JSColumn type of a given column
	 * @param {String} colName
	 * @return {Number} dataType
	 */
	function findColType(colName) {
		var jsColumn = jsTable.getColumn(colName);
		if (jsColumn) {
			return jsColumn.getType();
		} else {
			return JSColumn.TEXT;
		}
	}

	
	/**
	 * Returns the data of the grid as shown in the form
	 * 
	 * @param {Boolean} [includeMediaColumns] if true, media columns will be included
	 * @return {JSDataSet} visible dataset
	 */
	this.getVisibleData = function(includeMediaColumns) {
		var visibleDataproviders = new Array();
		var fs = null;
		if (forms[this.formName]) {
			fs = forms[this.formName].foundset;
		} else {
			fs = databaseManager.getFoundSet(datasource);
			fs.loadAllRecords();
		}
		for (var gc = 0; gc < gridColumns.length; gc++) {
			if (!includeMediaColumns && findColType(gridColumns[gc].dataprovider) == JSColumn.MEDIA) {
				continue;
			}
			visibleDataproviders.push(gridColumns[gc].dataprovider);
		}
		var result = databaseManager.createEmptyDataSet(0, visibleDataproviders);
		for (var d = 1; d <= fs.getSize(); d++) {
			var rowData = [];
			for (gc = 0; gc < visibleDataproviders.length; gc++) {
				rowData.push(fs.getRecord(d)[visibleDataproviders[gc]]);
			}
			result.addRow(rowData);
		}
		return result;
	}
	
	/**
	 * Returns all column headers of the grid as shown in the form
	 * 
	 * @param {Boolean} [includeMediaColumns] if true, media columns will be included
	 * @return {Array<String>} column headers
	 */
	this.getVisibleColumnHeaders = function(includeMediaColumns) {
		var result = new Array();
		for (var gc = 0; gc < gridColumns.length; gc++) {
			if (includeMediaColumns && findColType(gridColumns[gc].dataprovider) == JSColumn.MEDIA) {
				continue;
			}
			result.push(gridColumns[gc].headerText);
		}
		return result;
	}
	
	/**
	 * Returns all data providers of the grid as shown in the form
	 * 
	 * @param {Boolean} [includeMediaColumns] if true, media columns will be included
	 * @return {Array<String>} data providers
	 */
	this.getVisibleDataProviders = function(includeMediaColumns) {
		var result = new Array();
		for (var gc = 0; gc < gridColumns.length; gc++) {
			if (includeMediaColumns && findColType(gridColumns[gc].dataprovider) == JSColumn.MEDIA) {
				continue;
			}			
			result.push(gridColumns[gc].dataprovider);
		}
		return result;
	}
	
	/**
	 * Enum with all column display types
	 * @enum 
	 */
	this.DISPLAY_TYPES = {
		"CALENDAR": JSField.CALENDAR,
		"CHECKS": JSField.CHECKS,
		"COMBOBOX": JSField.COMBOBOX,
		"HTML_AREA": JSField.HTML_AREA,
		"IMAGE_MEDIA": JSField.IMAGE_MEDIA,
		"PASSWORD": JSField.PASSWORD,
		"RADIOS": JSField.RADIOS,
		"RTF_AREA": JSField.RTF_AREA,
		"TEXT_AREA": JSField.TEXT_AREA,
		"TEXT_FIELD": JSField.TEXT_FIELD,
		"TYPE_AHEAD": JSField.TYPE_AHEAD
	}
	
	/**
	 * Creates a form method that will call the given method and return the result to the grid
	 * 
	 * @param {JSForm} formToAddTo
	 * @param {Function|String} method
	 * 
	 * @return {JSMethod}
	 *
	 */
	function createFunctionCallMethod(formToAddTo, method) {
		if (method instanceof Function) {
			try {
				var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(method);
				var methodName = fd.getMethodName();
				var jsFormMethod;
				if (fd.getFormName()) {
					var formName = fd.getFormName();
					jsFormMethod = formToAddTo.newMethod("function " + methodName + "() { return forms." + formName + "." + methodName + ".apply(forms." + formName + ", arguments); } ");
					return jsFormMethod;
				} else if (fd.getScopeName()) {
					jsFormMethod = formToAddTo.newMethod("function callGlobal_" + methodName + "() { return " + fd.getScopeName() + "." + methodName + ".apply(" + fd.getScopeName() + ", arguments); } ");
					return jsFormMethod;
				} else {
					return null;
				}
			} catch (e) {
				logger.error(e.message);
				return null;
			}
		} else if (method instanceof String) {
			/** @type {String} */
			var methodString = method;
			if (utils.stringLeft(utils.stringTrim(methodString), 8) == "function") {
				/** @type {String} */
				var methodCode = method;
				try {
					return formToAddTo.newMethod(methodCode);
				} catch(e) {
					logger.error(e.message);
					return null;
				}
			} else {
				var bits = methodString.split('.');
				var mName = bits.pop();
				jsFormMethod = formToAddTo.getMethod(mName);
				if (jsFormMethod) return jsFormMethod;
				jsFormMethod = formToAddTo.newMethod("function " + mName + "() { return " + bits.join(".") + "." + mName + ".apply(" + bits.join(".") + ", arguments); } ");
				return jsFormMethod;
			}
		} else {
			return null;
		}
	}
	
	Object.seal(this);
	
	return this;
}

/**
 * GridColumn object
 * 
 * @constructor 
 * 
 * @private 
 * 
 * @param {String} dataProviderName
 * @param {Number} columnIndex
 *
 * @properties={typeid:24,uuid:"8C3D6A23-9939-4158-B4D2-9E14B8D62622"}
 */
function GridColumn(dataProviderName, columnIndex) {
	
	/**
	 * The column index of this column
	 * @type {Number}
	 */
	this.columnIndex = columnIndex;
	
	/**
	 * The background color of this column
	 * @type {String}
	 */
	this.backgroundColor = null;
	
	/**
	 * Sets the background color of this column
	 * @param {String} bgcolor
	 * @return {GridColumn} 
	 */
	this.setBackgroundColor = function(bgcolor) {
		this.backgroundColor = bgcolor;
		return this;
	}
	
	/**
	 * The border of this column
	 * @type {String}
	 */
	this.border = null;
	
	/**
	 * Sets the border of this column
	 * @param {String} border
	 * @return {GridColumn} 
	 */
	this.setBorder = function(border) {
		this.border = border;
		return this;
	}
	
	/**
	 * The dataprovider name
	 * @type {String}
	 */
	this.dataprovider = dataProviderName;
	
	/**
	 * Sets the data provider of this column
	 * @param {String} dataProvider
	 * @return {String|GridColumn}
	 */
	this.setDataprovider = function(dataProvider) {
		this.dataprovider = dataProviderName;
		return this;
	}
	
	/**
	 * The width of this column (defaults to 80)
	 * @type {Number}
	 */
	this.width = 80;
	
	/**
	 * Sets the width of this column (defaults to 80)
	 * @param {Number} width
	 * @return {GridColumn} 
	 */
	this.setWidth = function(width) {
		if (width instanceof Number && width >= 0) {
				this.width = width;
			}
			return this;
	}
	
	/**
	 * The anchors of this column (defaults to Top-Left-Right)
	 * @type {Number}
	 */
	this.anchors = SM_ANCHOR.NORTH | SM_ANCHOR.EAST | SM_ANCHOR.WEST;
	
	/**
	 * Sets the anchors of this column (defaults to Top-Left-Right)<p>
	 * Use the SM_ANCHORS constants to provide the anchors
	 * @param {Number} anchors
	 * @return {GridColumn} 
	 */
	this.setAnchors = function(anchors) {
		if (anchors instanceof Number) {
			this.anchors = anchors;
		}
		return this;
	}
	
	/**
	 * If true, the field will be placed as label
	 * @type {Boolean}
	 */
	this.isLabel = false;
	
	/**
	 * If true, the field will be placed as label
	 * @param {Boolean} isLabel
	 * @return {Boolean|GridColumn}
	 */
	this.setIsLabel = function(isLabel) {
		this.isLabel = isLabel;
		return this;
	}
	
	/**
	 * The display type of this column (defaults to TEXT_FIELD)
	 * @type {Number}
	 */
	this.displayType = JSField.TEXT_FIELD;
	
	/**
	 * Sets the display type of this column (if not shown as label)<p>
	 * Use any of the JSField constants or any value from the DISPLAY_TYPE enum of the grid
	 * @param {Number} displayType
	 * @return {GridColumn}
	 */
	this.setDisplayType = function(displayType) {
		this.displayType = displayType;
		return this;
	}
	
	/**
	 * The header text of this column (defaults to the column name)
	 * @type {String}
	 */
	this.headerText = dataProviderName;
	
	/**
	 * Sets the header text of this column (defaults to the column name)
	 * @param {String} headerText
	 * @return {GridColumn} 
	 */
	this.setHeaderText = function(headerText) {
		this.headerText = headerText;
		return this;
	}
	
	/**
	 * The style class of this column (overrides the rowStyleClass property of the grid)
	 * @type {String}
	 */
	this.styleClass = null;
	
	/**
	 * Sets the style class of this column (overrides the rowStyleClass property of the grid)
	 * @param {String} styleClass
	 * @return {GridColumn} 
	 */
	this.setStyleClass = function(styleClass) {
		this.styleClass = styleClass;
		return this;
	}
	
	/**
	 * The header style class for this column (overrides the headerStyleClass of  the grid)
	 * @type {String}
	 */
	this.headerStyleClass = null;
	
	/**
	 * Sets the header style class of this column (overrides the headerStyleClass property of the grid)
	 * @param {String} headerStyleClass
	 * @return {GridColumn} 
	 */
	this.setHeaderStyleClass = function(headerStyleClass) {
		this.headerStyleClass = headerStyleClass;
		return this;
	}	
	
	/**
	 * The foreground color of this column
	 * @type {String}
	 */
	this.foreground = null;
	
	/**
	 * Sets the foreground color of this column
	 * @param {String} foreground
	 * @return {GridColumn} 
	 */
	this.setForeground = function(foreground) {
		this.foreground = foreground;
		return this;
	}	
	
	/**
	 * The font of this column
	 * @type {String}
	 */
	this.font = null;
	
	/**
	 * Sets the font of this column
	 * @param {String} font
	 * @return {GridColumn} 
	 */
	this.setFont = function(font) {
		this.font = font;
		return this;
	}	
	
	/**
	 * The format of this column
	 * @type {String}
	 */
	this.format = "";
	
	/**
	 * Sets the format of this column
	 * @param {String} format
	 * @return {GridColumn} 
	 */
	this.setFormat = function(format) {
		this.format = format;
		return this;
	}	
	
	/**
	 * The editable property of this column (defaults to false)
	 * @type {Boolean}
	 */
	this.editable = null;
	
	/**
	 * Sets the editable property of this column (defaults to false)
	 * @param {Boolean} editable
	 * @return {GridColumn}
	 */
	this.setEditable = function(editable) {
		if (editable instanceof Boolean) {
			this.editable = editable;
		}
		return this;
	}	
	
	/**
	 * The name of the value list of this column
	 * @type {String}
	 */
	this.valueListName = null;
	
	/**
	 * Sets the name of the value list of this column
	 * @param {String} valueListName
	 * @return {String|GridColumn} 
	 */
	this.setValueListName = function(valueListName) {
		this.valueListName = valueListName;
		return this;
	}	
	
	/**
	 * The onAction method of this column (overrides the onAction method of the grid)<p>
	 * The method can be any form or scope method
	 * @type {String}
	 */
	this.onAction = null;
	
	/**
	 * Sets the onAction method of this column (overrides the onAction method of the grid)<p>
	 * The method can be any form or scope method
	 * 
	 * @param {Function|String} onActionFunctionOrCode
	 * @return {GridColumn}
	 */
	this.setOnAction = function(onActionFunctionOrCode) {
		if (onActionFunctionOrCode instanceof String) {
			this.onAction = onActionFunctionOrCode;
		} else if (onActionFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onActionFunctionOrCode;
			this.onAction = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}
	
	/**
	 * The onRightClick method of this column (overrides the onRightClick method of the grid)<p>
	 * The method can be any form or scope method
	 * @type {String}
	 */
	this.onRightClick = null;
	
	/**
	 * Sets the onRightClick method of this column (overrides the onRightClick method of the grid)<p>
	 * The method can be any form or scope method
	 * 
	 * @param {Function|String} onRightClickFunctionOrCode
	 * @return {GridColumn}
	 */
	this.setOnRightClick = function(onRightClickFunctionOrCode) {
		if (onRightClickFunctionOrCode instanceof String) {
			this.onRightClick = onRightClickFunctionOrCode;
		} else if (onRightClickFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onRightClickFunctionOrCode;
			this.onRightClick = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}	
	
	/**
	 * The onDoubleClick method of this column (overrides the onDoubleClick method of the grid)<p>
	 * If set, this column will be shown as a label and some other methods like onDataChange will no longer work<p>
	 * The method can be any form or scope method
	 * @type {String}
	 */
	this.onDoubleClick = null;
	
	/**
	 * The onDoubleClick method of this column (overrides the onDoubleClick method of the grid)<p>
	 * If set, this column will be shown as a label and some other methods like onDataChange will no longer work<p>
	 * The method can be any form or scope method
	 * 
	 * @param {Function|String} onDoubleClickFunctionOrCode
	 * @return {GridColumn}
	 */
	this.setOnDoubleClick = function(onDoubleClickFunctionOrCode) {
		if (onDoubleClickFunctionOrCode instanceof String) {
			this.onDoubleClick = onDoubleClickFunctionOrCode;
		} else if (onDoubleClickFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onDoubleClickFunctionOrCode;
			this.onDoubleClick = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}	
	
	/**
	 * The onDataChange method of this column (overrides the onDataChange method of the grid)<p>
	 * The method can be any form or scope method
	 * @type {String}
	 */
	this.onDataChange = null;
	
	/**
	 * The onDataChange method of this column (overrides the onDataChange method of the grid)<p>
	 * The method can be any form or scope method
	 * 
	 * @param {Function|String} onDataChangeFunctionOrCode
	 * @return {GridColumn}
	 */
	this.setOnDataChange = function(onDataChangeFunctionOrCode) {
		if (onDataChangeFunctionOrCode instanceof String) {
			this.onDataChange = onDataChangeFunctionOrCode;
		} else if (onDataChangeFunctionOrCode instanceof Function) {
			/** @type {Function} */
			var functionRef = onDataChangeFunctionOrCode;
			this.onDataChange = scopes.svySystem.convertServoyMethodToQualifiedName(functionRef);
		}
		return this;
	}	
	
	/**
	 * The horizontal alignment of the column
	 * @type {Number}
	 */
	this.horizontalAlignment = null;
	
	/**
	 * Sets the horizontal alignment of the column
	 * @param {Number} horizontalAlignment
	 * @return {GridColumn}
	 */
	this.setHorizontalAlignment = function(horizontalAlignment) {
		this.horizontalAlignment = horizontalAlignment;
		return this;
	} 
	
	/**
	 * The horizontal alignment of the column header label
	 * @type {Number}
	 */
	this.headerHorizontalAlignment = null;
	
	/**
	 * Sets the horizontal alignment of the column
	 * @param {Number} headerHorizontalAlignment
	 * @return {GridColumn}
	 */
	this.setHeaderHorizontalAlignment = function(headerHorizontalAlignment) {
		this.headerHorizontalAlignment = headerHorizontalAlignment;
		return this;
	}	
	
	/**
	 * The vertical alignment of the column<p>
	 * This is only applied to labels
	 * @type {Number}
	 */
	this.verticalAlignment = null;
	
	/**
	 * Sets the vertical alignment of the column<p>
	 * This is only applied to labels
	 * @param {Number} verticalAlignment
	 * @return {GridColumn}
	 */
	this.setVerticalAlignment = function(verticalAlignment) {
		this.verticalAlignment = verticalAlignment;
		return this;
	}		
	
	/**
	 * The vertical alignment of the column header
	 * @type {Number}
	 */
	this.headerVerticalAlignment = null;
	
	/**
	 * Sets the vertical alignment of the column<p>
	 * This is only applied to labels
	 * @param {Number} headerVerticalAlignment
	 * @return {GridColumn}
	 */
	this.setHeaderVerticalAlignment = function(headerVerticalAlignment) {
		this.headerVerticalAlignment = headerVerticalAlignment;
		return this;
	}
	
	/**
	 * Whether this column should be resizable or not
	 * @param {Boolean} resizable
	 * @return {GridColumn} this
	 */
	this.columnResizable = function(resizable) {
		if (!resizable) {
			this.anchors = this.anchors &= ~SM_ANCHOR.EAST;
		} else {
			this.anchors = this.anchors |= SM_ANCHOR.EAST;
			this.anchors = this.anchors |= SM_ANCHOR.WEST;		
		}
		return this;
	}
	
	/**
	 * Whether this column should be reorderable
	 * @param {Boolean} reorderable
	 * @return {GridColumn} this
	 */
	this.columnReorderable = function(reorderable) {
		if (!reorderable) {
			this.anchors = this.anchors |= SM_ANCHOR.SOUTH;
		} else {
			this.anchors = this.anchors &= ~SM_ANCHOR.SOUTH;
		}
		return this;
	}
	
	/**
	 * If set to true, the column will be shown as a label instead of a field
	 * @param {Boolean} createAsLabel
	 * @return {GridColumn} this
	 */
	this.createAsLabel = function(createAsLabel) {
		this.isLabel = createAsLabel;
		return this;
	}
	
	/**
	 * Media options for this column
	 * @type {Number}
	 */
	this.mediaOptions = null;
	
	/**
	 * Sets the media options for this column<p>
	 * Use any of the SM_MEDIAOPTION constants to set this
	 * @param {Number} mediaOptions
	 * @return {GridColumn} this
	 */
	this.setMediaOptions = function(mediaOptions) {
		this.mediaOptions = mediaOptions;
		return this;
	}
	
	/**
	 * The scrollbars of this column
	 * @type {Number}
	 */
	this.scrollbars = null;
	
	/**
	 * Sets the scrollbars of this column<p>
	 * Use any of the SM_SCROLLBAR constants or a combination
	 * @param {Number} scrollBars
	 * @return {GridColumn} this
	 */
	this.setScrollbars = function(scrollBars) {
		this.scrollbars = scrollBars;
		return this;
	}
	
	/**
	 * The tooltip text of this column
	 * @type {String}
	 */
	this.tooltipText = null;
	
	/**
	 * Sets the tooltip text of this column
	 * @param {String} tooltipText
	 * @return {GridColumn} 
	 */
	this.setTooltipText = function(tooltipText) {
		this.tooltipText = tooltipText;
		return this;
	}	
	
	/**
	 * Show click property of this column
	 * @type {Boolean}
	 */
	this.showClick = true;
	
	/**
	 * Sets the show click property of this column
	 * @param {Boolean} showClick
	 * @return {GridColumn} 
	 */
	this.setShowClick = function(showClick) {
		this.showClick = showClick;
		return this;
	}
	
	/**
	 * Show focus property of this column
	 * @type {Boolean}
	 */
	this.showFocus = true;
	
	/**
	 * Sets the show focus property of this column
	 * @param {Boolean} showFocus
	 * @return {GridColumn} 
	 */
	this.setShowFocus = function(showFocus) {
		this.showFocus = showFocus;
		return this;
	}	
}
