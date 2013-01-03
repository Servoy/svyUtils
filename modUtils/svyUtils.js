/**
 * Tests if a given value for the given dataprovider<br>
 * is unique in the table of the given foundset or record
 * 
 * @param {JSRecord|JSFoundSet|String} foundsetRecordOrDataSource
 * @param {String} dataproviderName - the name of the dataprovider that should be tested for uniqueness
 * @param {Object} value - the value that should be unique in the given dataprovider
 * @param {String[]} [extraQueryColumns] - optional array of additional dataproviders that can be used in the unique query
 * @param {Object[]} [extraQueryValues] - optional array of additional values that can be used in the unique query
 * 
 * @throws {scopes.modUtils$exceptions.IllegalArgumentException}
 * 
 * @author patrick
 * @since 2012-10-04
 *
 * @properties={typeid:24,uuid:"FDA0FED5-7A26-46BF-B090-8626CA0C665A"}
 */
function isValueUnique(foundsetRecordOrDataSource, dataproviderName, value, extraQueryColumns, extraQueryValues) {
	if (!foundsetRecordOrDataSource || !dataproviderName) {
		throw new scopes.modUtils$exceptions.IllegalArgumentException("no parameters provided to scopes.svyUtils.isValueUnique(foundsetOrRecord, dataproviderName, value)");
	}
	var dataSource = (foundsetRecordOrDataSource instanceof String) ? foundsetRecordOrDataSource : foundsetRecordOrDataSource.getDataSource();
	var pkNames = databaseManager.getTable(dataSource).getRowIdentifierColumnNames();
	var query = databaseManager.createSelect(dataSource);
	for (var i = 0; i < pkNames.length; i++) {
		query.result.add(query.getColumn(pkNames[i]).count);
	}
	if (value == null) {
		query.where.add(query.getColumn(dataproviderName).isNull);
	} else if (value instanceof UUID) {
		query.where.add(query.getColumn(dataproviderName).eq(value.toString()));
	} else {
		query.where.add(query.getColumn(dataproviderName).eq(value));
	}
	if (extraQueryColumns && extraQueryValues && extraQueryColumns.length == extraQueryValues.length) {
		for (var j = 0; j < extraQueryColumns.length; j++) {
			if (extraQueryValues[j] == null) {
				query.where.add(query.getColumn(extraQueryColumns[j]).isNull);
			} else if (extraQueryValues[j] instanceof UUID) {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j].toString()));
			} else {
				query.where.add(query.getColumn(extraQueryColumns[j]).eq(extraQueryValues[j]));
			}
		}
	}
	var dataset = databaseManager.getDataSetByQuery(query, 1);
	if (dataset.getValue(1,1) == 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * Returns true if a given object has a property with the given value
 * 
 * @param {Object} object
 * @param {Object} value
 * 
 * @author patrick
 * @since 2012-10-04
 *
 * @properties={typeid:24,uuid:"1EF0D951-510C-4411-BD58-68E8515728AE"}
 */
function objectHasValue(object, value) {
	for (var i in object) {
		if (object[i] === value) {
			return true;
		}
	}
	return false;
}

/**
 * Returns the width of a text for the given font in pixels
 * 
 * @param {String} font
 * @param {String} text
 * 
 * @return {Number} pixelWidth
 * 
 * @author patrick
 * @since 2012-10-05
 * 
 * @properties={typeid:24,uuid:"43B8A885-F8BA-46A8-BE47-EF0F0C2E5DDC"}
 */
function getTextWidth(font, text) {
	var fontParts = font.split(",");
	var javaFont = new java.awt.Font(fontParts[0], fontParts[1], fontParts[2]);
	var tlkt = Packages.java.awt.Toolkit.getDefaultToolkit(); 
	var metrics = tlkt.getFontMetrics(javaFont);
	if (text.substr(0,5) == "i18n:") {
		text = i18n.getI18NMessage(text);
	}
	return metrics.stringWidth(text);
}

/**
 * Returns the height of any text for the given font in pixels
 * 
 * @param {String} font
 * 
 * @return {Number} pixelHeight
 * 
 * @author patrick
 * @since 2012-10-05
 * 
 * @properties={typeid:24,uuid:"9CA1941E-51B9-41E8-807A-98BD277051D8"}
 */
function getTextHeight(font) {
	if (!font) {
		return 20;
	}
	var fontParts = font.split(",");
	var javaFont = new java.awt.Font(fontParts[0], fontParts[1], fontParts[2]);
	var tlkt = Packages.java.awt.Toolkit.getDefaultToolkit(); 
	var metrics = tlkt.getFontMetrics(javaFont);
	return metrics.getHeight();
}

/**
 * A StyleParser that can be used to access a number of style class properties from a given style
 * 
 * @param {String} styleName
 * 
 * @constructor 
 * 
 * @author patrick
 * @since 2012-10-05
 *
 * @properties={typeid:24,uuid:"77CDFED0-AB73-4663-A4E3-464917CFF0DE"}
 */
function StyleParser(styleName) {
	
	/**
	 * The name of this style
	 * 
	 * @type {String}
	 */
	this.styleName = styleName;
	
	/**
	 * Style
	 * 
	 * @type {JSStyle}
	 */
	var style = solutionModel.getStyle(styleName);
	
	/**
	 * ServoyStyleSheet
	 * 
	 * @type {Packages.com.servoy.j2db.util.ServoyStyleSheet}
	 */
	var styleSheet = new Packages.com.servoy.j2db.util.ServoyStyleSheet(style.text, styleName);
	
	/**
	 * Returns the font of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} font
	 */
	this.getFontString = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var font = styleSheet.getFont(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createFontString(font);
	}
	
	/**
	 * Returns the background color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} backgroundColor
	 */
	this.getBackgroundColor = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var color = styleSheet.getBackground(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createColorString(color);
	}
	
	/**
	 * Returns the foreground color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} foregroundColor
	 */
	this.getForegroundColor = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var color = styleSheet.getForeground(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createColorString(color);
	}	
	
	/**
	 * Returns the border of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} border
	 */
	this.getBorder = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var border = styleSheet.getBorder(rule);
		return Packages.com.servoy.j2db.util.ComponentFactoryHelper.createBorderString(border);
	}	
	
	/**
	 * Returns the foreground color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} font
	 */
	this.getMargins = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var margins = styleSheet.getMargin(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createInsetsString(margins);
	}	
	
	/**
	 * Returns the horizontal alignment of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {Number} horizontalAlignment
	 */
	this.getHorizontalAlignment = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		return styleSheet.getHAlign(rule);
	}	
	
	/**
	 * Returns the vertical alignment of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {Number} verticalAlignment
	 */
	this.getVerticalAlignment = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		return styleSheet.getVAlign(rule);
	}
	
	/**
	 * Returns a java.awt.Font from the given font string
	 * 
	 * @param {String} fontString
	 * 
	 * @return {java.awt.Font} font
	 */
	this.getJavaFont = function(fontString) {
		return Packages.com.servoy.j2db.util.PersistHelper.createFont(fontString);
	}
	
	/**
	 * Returns a java.awt.Color from the given color string
	 * 
	 * @param {String} colorString
	 * 
	 * @return {java.awt.Color} color
	 */
	this.getJavaColor = function(colorString) {
		return Packages.com.servoy.j2db.util.PersistHelper.createColor(colorString);
	}
	
}

/**
 * Replaces dataprovider tags such as %%companyname%% in Word, Open Office or Pages documents
 * 
 * @param {plugins.file.JSFile} document
 * @param {JSRecord} record
 * 
 * @return {Boolean} success
 * 
 * @author patrick
 * @since 2012-10-15
 *
 * @properties={typeid:24,uuid:"512CAE03-E646-4191-A2E5-58620598B2BE"}
 */
function replaceTagsInWordProcessingDocument(document, record) {

	/**
	 * @param {plugins.file.JSFile} dir
	 */
	function deleteDirectory(dir) {
		if (dir.isDirectory()) {
			var files = dir.listFiles();
			for (var i = 0; i < files.length; i++) {
				if (files[i].isDirectory()) {
					deleteDirectory(files[i]);
				} else {
					files[i].deleteFile();
				}
			}
			dir.deleteFile();
		} else {
			dir.deleteFile();
		}
	}
	
	var docType = document.getName().substr(document.getName().lastIndexOf(".") + 1);
	var tmpFile = plugins.file.convertToJSFile(java.lang.System.getProperty("java.io.tmpdir") + java.io.File.separator + application.getUUID().toString());
	tmpFile.mkdirs();
	var unzippedDir = scopes.svyIO.unzip(document, tmpFile);
	
	if (!unzippedDir) {
		return false;
	}
	
	var contentFilePath;
	var content;
	if (docType == "docx") {
		contentFilePath = unzippedDir + java.io.File.separator + "word" + java.io.File.separator + "document.xml";
	} else if (docType == "odt") {
		contentFilePath = unzippedDir + java.io.File.separator + "content.xml";
	} else if (docType == "pages") {
		contentFilePath = unzippedDir + java.io.File.separator + "index.xml";
	} else {
		// Exception
		return false;
	}
	
	content = plugins.file.readTXTFile(contentFilePath);
	content = utils.stringReplaceTags(content, record);
	plugins.file.writeTXTFile(contentFilePath, content, "UTF-8");
	scopes.svyIO.zip(unzippedDir, document);
	deleteDirectory(unzippedDir);
	unzippedDir.deleteFile();
	
	return true;
}

/**
 * Converts a value to JSON
 *
 * @param displayedValue The displayed value.
 * @param {String} dbType The type of the database column. Can be one of "TEXT", "INTEGER", "NUMBER", "DATETIME" or "MEDIA".
 *
 * @returns {Object} the database value.
 * 
 * @author patrick
 * @date 25.10.2012
 *
 * @properties={typeid:24,uuid:"0786C8EC-B388-485E-8017-2B45A68047A8"}
 */
function jsonConvertFromObject(displayedValue, dbType) {
	if (displayedValue instanceof Array) {
		// in case we receive a Native Array here, 
		// try to convert it to a JS array
		displayedValue = displayedValue.concat(new Array());
	}
	if (displayedValue instanceof UUID) {
		displayedValue = displayedValue.toString();
	}
	return JSON.stringify(displayedValue);
}

/**
 * Converts a value from JSON
 *
 * @param databaseValue The database value.
 * @param {String} dbType The type of the database column. Can be one of "TEXT", "INTEGER", "NUMBER", "DATETIME" or "MEDIA".
 *
 * @returns {Object} the displayed value.
 * 
 * @author patrick
 * @since 25.10.2012
 *
 * @properties={typeid:24,uuid:"4842EB94-BB21-4F75-A069-4F42898A0014"}
 */
function jsonConvertToObject(databaseValue, dbType) {
	if (databaseValue == null) return null;
	return JSON.parse(databaseValue)
}
