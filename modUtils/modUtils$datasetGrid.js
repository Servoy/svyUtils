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
 * Creates a DatasetGrid object that creates a table view form from a dataset that can be added to a tab panel
 * 
 * @public
 * 
 * @version 5.0
 * @since 
 * @author patrick
 * 
 * @param {JSDataSet} dataset
 * @param {Array<String>} [columnHeaders]
 * @param {Array<String>} [dataproviders]
 * @param {Array<Number>} [columnTypes]
 *
 * @example <pre>
 * var query = "select companyname, contactname, address, city, postalcode FROM customers";
 * var dataset = databaseManager.getDataSetByQuery("example_data", query, null, -1);
 * var grid = scopes.modUtils$datasetGrid.createDatasetGrid(dataset, ["Company", "Contact", "Address", "City", "Postal code"]);
 * 
 * // set styling
 * grid.style = "pv";
 * grid.headerStyleClass = "table";
 * grid.rowStyleClass = "table";
 * grid.headerHeight = 30;
 * 
 * // assign methods
 * grid.onRecordSelection = onRecordSelectionGrid;
 * grid.onDataChange = onDataChangeGrid;
 * 
 * // customize some columns
 * grid.column("companyname").
 * 	setEditable(true).
 * 	setHeaderText("Company name").
 * 	setWidth(200);
 * 	
 * grid.removeColumn("address").removeColumn("postalcode");
 * 
 * // Add the grid to a tab panel
 * grid.addToPanel(elements.tabless,"customerTable");</pre>
 *
 * @properties={typeid:24,uuid:"1FE0935A-0825-4BE5-AE50-DA22C3CA5AD0"}
 */
function createDatasetGrid(dataset, columnHeaders, dataproviders, columnTypes) {
	return new DatasetGrid(dataset, columnHeaders, dataproviders, columnTypes);
}

/**
 * DatasetGrid constructor<p>
 * 
 * A DatasetGrid object takes a dataset and creates a table view form that can be added to a tab panel
 * 
 * 
 * 
 * @constructor 
 *
 * @properties={typeid:24,uuid:"5738DD1A-37EE-4EE1-B6A7-1E5DCB3BF17D"}
 */
function DatasetGrid(dataset, columnHeaders, dataproviders, columnTypes) {
	
	/** 
	 * Array of GridColumns to show
	 * 
	 * @type {Array<GridColumn>} 
	 */
	var gridColumns = new Array();	
	
	/**
	 * The dataset of this grid
	 * 
	 * @type {JSDataSet}
	 */
	this.data = dataset;
	
	/**
	 * The style of the grid
	 * 
	 * @type {String}
	 */
	this.style = null;
	
	/**
	 * The width of the form
	 * 
	 * @type {Number}
	 */
	this.width = 800;
	
	/**
	 * The height of the form
	 * 
	 * @type {Number}
	 */
	this.height = 40;
	
	/**
	 * The scrollbar property of the form<p>
	 * 
	 * Use any of the SM_SCROLLBAR constants
	 * 
	 * @type {Number}
	 */
	this.scrollbars = SM_SCROLLBAR.HORIZONTAL_SCROLLBAR_NEVER | SM_SCROLLBAR.VERTICAL_SCROLLBAR_AS_NEEDED;
	
	/**
	 * The height of the table header
	 * 
	 * @type {Number}
	 */
	this.headerHeight = 20;
	
	/**
	 * The height of the table rows
	 * 
	 * @type {Number}
	 */
	this.rowHeight = 20;
	
	/**
	 * Style class used for the header labels
	 * 
	 * @type {String}
	 */
	this.headerStyleClass = null;
	
	/**
	 * Style class used for the fields of the table
	 * 
	 * @type {String}
	 */
	this.rowStyleClass = null;
	
	/**
	 * The name of the form
	 * 
	 * @type {String}
	 */
	this.formName = null;
	
	/**
	 * Sets the onShow method<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onShow = null;		
	
	/**
	 * Sets the onHide method<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onHide = null;		
	
	/**
	 * Sets the recordSelection method<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onRecordSelection = null;	
	
	/**
	 * Sets the onRender method<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onRender = null;	
	
	/**
	 * Sets the onDataChange method for any editable field<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onDataChange = null;	
	
	/**
	 * Sets a method that is called on double click<p>
	 * 
	 * If set, all fields will be rendered as labels and some <br>
	 * functionality such as onDataChange will not work<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onDoubleClick = null;	
	
	/**
	 * Sets a method that is called on action of any of the fields of the grid<p>
	 * 
	 * The method can be any form or scope method
	 * 
	 * @type {Function}
	 */
	this.onAction = null;		
	
	/**
	 * @param {String} dataproviderName
	 * @param {String} [headerText]
	 * 
	 * @return {GridColumn}
	 */
	function addColumn(dataproviderName, headerText) {
		var newColumn = new GridColumn(dataproviderName);
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
	 * @param {String} dataproviderName
	 * @return {DatasetGrid}
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
	 * @this {DatasetGrid}
	 * 
	 * @param {JSDataSet} newDataset
	 */
	this.refreshData = function(newDataset) {
		if (this.formName && forms[this.formName]) {
			var ds = newDataset.createDataSource(this.formName + "_datasource");
			var fs = databaseManager.getFoundSet(ds);
			fs.loadAllRecords();
			forms[this.formName].controller.loadRecords(fs);
		} else {
			this.data = dataset;
		}
	}	
	
	/**
	 * GridColumn object
	 * 
	 * @param {String} dataprovider
	 * @constructor 
	 */
	function GridColumn(dataprovider) {
		
		/**
		 * The dataprovider name
		 * @type {String}
		 */
		this.dataprovider = dataprovider;
		
		/**
		 * The width of this column (defaults to 80)
		 * @type {Number}
		 */
		this.width = 80;
		
		/**
		 * The anchors of this column (defaults to Top-Left-Right)
		 * @type {Number}
		 */
		this.anchors = SM_ANCHOR.NORTH | SM_ANCHOR.EAST | SM_ANCHOR.WEST;
		
		/**
		 * If true, the field will be placed as label
		 * @type {Boolean}
		 */
		this.isLabel = false;
		
		/**
		 * The display type of this column (defaults to TEXT_FIELD)
		 * @type {Number}
		 */
		this.displayType = JSField.TEXT_FIELD;
		
		/**
		 * The header text of this column (defaults to the column name)
		 * @type {String}
		 */
		this.headerText = dataprovider;
		
		/**
		 * The style class of this column (overrides the rowStyleClass property of the grid)
		 * @type {String}
		 */
		this.styleClass = null;
		
		/**
		 * The header style class for this column (overrides the headerStyleClass of  the grid)
		 * @type {String}
		 */
		this.headerStyleClass = null;
		
		/**
		 * The format of this column
		 * @type {String}
		 */
		this.format = "";
		
		/**
		 * The editable property of this column (defaults to false)
		 * @type {Boolean}
		 */
		this.editable = false;
		
		/**
		 * The name of the value list of this column
		 * @type {String}
		 */
		this.valueListName = null;
		
		/**
		 * The onAction method of this column (overrides the onAction method of the grid)<p>
		 * The method can be any form or scope method
		 * @type {Function}
		 */
		this.onAction = null;
		
		/**
		 * The onDoubleClick method of this column (overrides the onDoubleClick method of the grid)<p>
		 * If set, this column will be shown as a label and some other methods like onDataChange will no longer work<p>
		 * The method can be any form or scope method
		 * @type {Function}
		 */
		this.onDoubleClick = null;
		
		/**
		 * The onDataChange method of this column (overrides the onDataChange method of the grid)<p>
		 * The method can be any form or scope method
		 * @type {Function}
		 */
		this.onDataChange = null;
		
		/**
		 * The horizontal alignment of the column
		 * @type {Number}
		 */
		this.horizontalAlignment = SM_ALIGNMENT.LEFT;
		
		/**
		 * The horizontal alignment of the column header label
		 * @type {Number}
		 */
		this.headerHorizontalAlignment = SM_ALIGNMENT.LEFT;
		
		/**
		 * The vertical alignment of the column<p>
		 * 
		 * This is only applied to labels
		 * @type {Number}
		 */
		this.verticalAlignment = null;
		
		/**
		 * The vertical alignment of the column header
		 * @type {Number}
		 */
		this.headerVerticalAlignment = null;
		
		/**
		 * Sets the width of the column
		 * @param {Number} width
		 */
		this.setWidth = function(width) {
			this.width = width;
			return this;
		}
		
		/**
		 * Whether this column should be resizable or not
		 * @param {Boolean} resizable
		 */
		this.columnResizable = function(resizable) {
			if (!resizable) {
				this.anchors &= ~SM_ANCHOR.EAST;
			} else {
				this.anchors |= SM_ANCHOR.EAST;
			}
			return this;
		}
		
		/**
		 * Whether this column should be reorderable
		 * @param {Boolean} reorderable
		 */
		this.columnReorderable = function(reorderable) {
			if (!reorderable) {
				this.anchors |= SM_ANCHOR.SOUTH;
			} else {
				this.anchors &= ~SM_ANCHOR.SOUTH;
			}
			return this;
		}
		
		/**
		 * If set to true, the column will be shown as a label instead of a field
		 * @param {Boolean} createAsLabel
		 */
		this.createAsLabel = function(createAsLabel) {
			this.isLabel = createAsLabel;
			return this;
		}
		
		/**
		 * Sets the display type of this column (if not shown as label)<p>
		 * Use any of the JSField constants or any value from the DISPLAY_TYPE enum of the grid
		 * @param {Number} displayType
		 */
		this.setDisplayType = function(displayType) {
			this.displayType = displayType;
			return this;
		}
		
		/**
		 * Sets the header text for this column
		 * @param {String} headerText
		 */
		this.setHeaderText = function(headerText) {
			this.headerText = headerText;
			return this;			
		}
		
		/**
		 * Sets the horizontal alignment for this column
		 * @param {Number} horizontalAlignment
		 */
		this.setHorizontalAlignment = function(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;			
		}	
		
		/**
		 * Sets the vertical alignment for this column
		 * @param {Number} verticalAlignment
		 */
		this.setVerticalAlignment = function(verticalAlignment) {
			this.verticalAlignment = verticalAlignment;
			return this;			
		}	
		
		/**
		 * Sets the horizontal alignment for this column's header
		 * @param {Number} horizontalAlignment
		 */
		this.setHeaderHorizontalAlignment = function(horizontalAlignment) {
			this.headerHorizontalAlignment = horizontalAlignment;
			return this;			
		}	
		
		/**
		 * Sets the vertical alignment for this column
		 * @param {Number} verticalAlignment
		 */
		this.setHeaderVerticalAlignment = function(verticalAlignment) {
			this.headerVerticalAlignment = verticalAlignment;
			return this;			
		}		
		
		/**
		 * Sets the style class of this column, overriding the rowStyleClass property of the grid
		 * @param {String} styleClass
		 */
		this.setStyleClass = function(styleClass) {
			this.styleClass = styleClass;
			return this;			
		}
		
		/**
		 * Sets the style class of the header of this column, overriding the headerStyleClass property of the grid
		 */
		this.setHeaderStyleClass = function(headerStyleClass) {
			this.headerStyleClass = headerStyleClass;
			return this;			
		}		
		
		/**
		 * Sets the format of this column
		 * @param {String} format
		 */
		this.setFormat = function(format) {
			this.format = format;
			return this;			
		}
		
		/**
		 * Whether this column should be editable or not
		 * @param {Boolean} editable
		 */
		this.setEditable = function(editable) {
			this.editable = editable;
			return this;			
		}
		
		/**
		 * Sets the value list of this column
		 * @param {String} valueListName
		 */
		this.setValueList = function(valueListName) {
			this.valueListName = valueListName;
			return this;			
		}
		
		/**
		 * onAction method of this column (overrides the onAction method of the grid)<p>
		 * The method can be any form or scope method
		 * @param {Function} onActionMethod
		 */
		this.setOnActionMethod = function(onActionMethod) {
			this.onAction = onActionMethod;
			return this;			
		}	
		
		/**
		 * onDoubleClick method of this column (overrides the onDoubleClick method of the grid)<p>
		 * If set, this column will be shown as a label and some other methods like onDataChange will no longer work<p>
		 * The method can be any form or scope method
		 * @param {Function} onDoubleClickMethod
		 */
		this.setOnDoubleClickMethod = function(onDoubleClickMethod) {
			this.onDoubleClick = onDoubleClickMethod;
			return this;			
		}	
		
		/**
		 * onDataChange method of this column (overrides the onDataChange method of the grid)<p>
		 * The method can be any form or scope method
		 * @param {Function} onDataChangeMethod
		 */
		this.setOnDataChangeMethod = function(onDataChangeMethod) {
			this.onDataChange = onDataChangeMethod;
			return this;			
		}
	}
	
	var useHeaders;
	if (!dataproviders) {
		useHeaders = false;
		if (columnHeaders && columnHeaders.length == this.data.getMaxColumnIndex()) {
			useHeaders = true;
		}
		for (var colIndex = 1; colIndex <= this.data.getMaxColumnIndex(); colIndex++) {
			/** @type {GridColumn} */
			var newCol = new GridColumn(this.data.getColumnName(colIndex));
			if (useHeaders) {
				newCol.headerText = columnHeaders[colIndex-1];
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
	/**
	 * Creates and returns the grid form<p>
	 * 
	 * The form created has a variable <code>datasetGrid</code> that<br>
	 * contains a reference to this DatasetGrid object that can be used<br>
	 * to further interact with the grid (e.g. refreshData())
	 * 
	 * @this {DatasetGrid}
	 * 
	 * @param {String} [formName] the name of the form to be created
	 * 
	 * @return {RuntimeForm}
	 */
	this.createForm = function(formName) {
		
		if (!formName) {
			formName = "datasetGrid_" + utils.stringReplace(application.getUUID().toString(), "-", "_");
		}
		this.formName = formName;
		
		var datasource;
		if (columnTypes) {
			datasource = this.data.createDataSource(formName + "_datasource", columnTypes);
		} else {
			datasource = this.data.createDataSource(formName + "_datasource");
		}
		
		history.removeForm(formName);
		solutionModel.removeForm(formName);
		
		var jsForm = solutionModel.newForm(formName, datasource, this.style, false, this.width, this.height);
		jsForm.view = JSForm.LOCKED_TABLE_VIEW;
		jsForm.scrollbars = this.scrollbars;
		
		jsForm.newVariable("datasetGrid", JSVariable.MEDIA);
		
		if (this.onShow) {
			jsForm.onShow = createFunctionCallMethod(jsForm, this.onShow);
		}
		
		if (this.onHide) {
			jsForm.onHide = createFunctionCallMethod(jsForm, this.onHide);
		}
		
		if (this.onRecordSelection) {
			jsForm.onRecordSelection = createFunctionCallMethod(jsForm, this.onRecordSelection);
		}
		
		if (this.onRender) {
			jsForm.onRender = createFunctionCallMethod(jsForm, this.onRender);
		}
		
		var onDataChangeMethod;
		if (this.onDataChange) {
			onDataChangeMethod = createFunctionCallMethod(jsForm, this.onDataChange);
		}
		
		var onActionMethod;
		if (this.onAction) {
			onActionMethod = createFunctionCallMethod(jsForm, this.onAction);
		}
		
		var onDoubleClickMethod;
		if (this.onDoubleClick) {
			onDoubleClickMethod = createFunctionCallMethod(jsForm, this.onDoubleClick);
		}
		
		var jsComponent;
		var jsHeaderLabel;
		var startX = 0;
		if (gridColumns && gridColumns.length > 0) {
			for (var c = 0; c < gridColumns.length; c++) {
				/** @type {GridColumn} */
				var gridColumn = gridColumns[c];
				if (gridColumn.isLabel || this.onDoubleClick || gridColumn.onDoubleClick) {
					gridColumn.isLabel = true;
					jsComponent = jsForm.newLabel("", startX, this.headerHeight, gridColumn.width, this.rowHeight);
					jsComponent.dataProviderID = gridColumn.dataprovider;
				} else {
					jsComponent = jsForm.newField(gridColumn.dataprovider, gridColumn.displayType, startX, this.headerHeight, gridColumn.width, this.rowHeight);
				}
				jsComponent.name = gridColumn.dataprovider;
				jsComponent.anchors = gridColumn.anchors;
				jsComponent.styleClass = gridColumn.styleClass ? gridColumn.styleClass : this.rowStyleClass;
				jsComponent.format = gridColumn.format;
				
				jsComponent.horizontalAlignment = gridColumn.horizontalAlignment;
				
				if (!gridColumn.isLabel) {
					jsComponent.editable = gridColumn.editable;
					if (gridColumn.valueListName) {
						jsComponent.valuelist = solutionModel.getValueList(gridColumn.valueListName);
					}
					if (onDataChangeMethod && !gridColumn.onDataChange) {
						jsComponent.onDataChange = onDataChangeMethod;
					} else if (gridColumn.onDataChange) {
						jsComponent.onDataChange = createFunctionCallMethod(jsForm, gridColumn.onDataChange);
					}
				} else {
					if (onDoubleClickMethod && !gridColumn.onDoubleClick) {
						jsComponent.onDoubleClick = onDoubleClickMethod;
					} else if (gridColumn.onDoubleClick) {
						jsComponent.onDoubleClick = createFunctionCallMethod(jsForm, gridColumn.onDoubleClick);
					}
					if (gridColumn.verticalAlignment) {
						jsComponent.verticalAlignment = gridColumn.verticalAlignment;
					}
				}
				if (onActionMethod && !gridColumn.onAction) {
					jsComponent.onAction = onActionMethod;
				} else if (gridColumn.onAction) {
					jsComponent.onAction = createFunctionCallMethod(jsForm, gridColumn.onAction);
				}
				
				jsHeaderLabel = jsForm.newLabel(gridColumn.headerText, startX, 0, gridColumn.width, this.headerHeight);
				jsHeaderLabel.name = "lbl_" + jsComponent.name;
				jsHeaderLabel.styleClass = gridColumn.headerStyleClass ? gridColumn.headerStyleClass : this.headerStyleClass;
				if (!jsHeaderLabel.styleClass) {
					jsHeaderLabel.transparent = true;
				}
				jsHeaderLabel.horizontalAlignment = gridColumn.headerHorizontalAlignment;
				jsHeaderLabel.verticalAlignment = gridColumn.headerVerticalAlignment;
				jsHeaderLabel.labelFor = jsComponent.name;
				
				startX += gridColumn.width;
			}
		}
		
		forms[jsForm.name]["datasetGrid"] = this;
		return forms[jsForm.name];
	}
	
	/**
	 * Adds the grid to the given tab panel
	 * 
	 * @param {RuntimeTabPanel} panel
	 * @param {String} [formName]
	 * @param {String} [tabText]
	 * @param {Number} [index]
	 * 
	 * @return {RuntimeForm}
	 */
	this.addToPanel = function(panel, formName, tabText, index) {
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
		panel.addTab(runtimeForm, formName, tabText ? tabText : null, null, null, null, null, null, index ? index : panel.getMaxTabIndex() + 1);
		return runtimeForm;
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
	 * Creates a JSMethod for scope methods or
	 * a new form method that calls the given form method
	 * 
	 * @param {JSForm} formToAddTo
	 * @param {Function} method
	 *
	 */
	function createFunctionCallMethod(formToAddTo, method) {
		try {
			var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(method);
			var methodName = fd.getMethodName();
			if (fd.getFormName()) {
				var formName = fd.getFormName();
				var jsFormMethod = formToAddTo.newMethod("function " + methodName + "() { forms." + formName + "." + methodName + ".apply(forms." + formName + ", arguments); } ");
				return jsFormMethod;
			} else if (fd.getScopeName()) {
				return solutionModel.getGlobalMethod(fd.getScopeName(), methodName);
			} else {
				return null
			}
		} catch (e) {
			application.output(e, LOGGINGLEVEL.ERROR)
			return null
		}
	}
	
	Object.seal(this);
}