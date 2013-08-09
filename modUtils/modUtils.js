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
 * TODO: add example code, also how to apply this for invocation on the same form
 * @param {String} qualifiedName
 * @param {*} [args]
 * @return {*}
 * @throws {scopes.modUtils$exceptions.IllegalArgumentException}
 *
 * @properties={typeid:24,uuid:"28F6D882-B1B4-4B23-BCC8-71E2DE44F10E"}
 */
function callServoyMethod(qualifiedName, args) {
	if (!qualifiedName) {
		throw scopes.modUtils$exceptions.IllegalArgumentException('\'qualifiedName\' parameter must be specified')
	}
	var methodParts = qualifiedName.split('.')
	var methodName = methodParts.pop()

	/** @type {Function} */
	var f
	var scope
	if (!methodParts.length || ['forms', 'scopes', 'globals'].indexOf(methodParts[0]) == -1) {
		scope = this
	} else {
		switch (methodParts.shift()) {
		case 'forms':
			scope = forms[methodParts.shift()]
			break;
		case 'scopes':
			scope = scopes[methodParts.shift()]
			break;
		case 'globals':
			scope = globals
			break;
		default:
		//Cannot happen
		}

		while (scope != null && methodParts.length) {
			scope = scope[methodParts.shift()]
		}
	}
	if (scope) {
		f = scope[methodName]
	}
	if (! (f instanceof Function)) throw scopes.modUtils$exceptions.IllegalArgumentException('\'' + qualifiedName + '\' cannot be resoled to a method')

	return f.apply(scope, args ? Array.isArray(args) ? args : [args] : null)
}

/**
 * Converts a method reference to a String
 * 
 * @public
 * 
 * @version 5.0
 * @since 18.07.2013
 * @author patrick
 *
 * @param {Function} functionToConvert
 * 
 * @return {String} methodString
 *
 * @properties={typeid:24,uuid:"05B65961-68C6-42BA-9FB9-12BE068892AD"}
 */
function convertFunctionToString(functionToConvert) {
	if (functionToConvert instanceof Function) {
		try {
			var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(functionToConvert)
			if (fd.getFormName()) {
				return 'forms.' + fd.getFormName() + '.' + fd.getMethodName()
			} else if (fd.getScopeName()) {
				return 'scopes.' + fd.getScopeName() + '.' + fd.getMethodName()
			} else { //TODO: got all variations covered with the above logic?
				return null
			}
		} catch (e) {
			application.output(e.message, LOGGINGLEVEL.ERROR)
			return null;
		}
	}
	return null;
}

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
 * @properties={typeid:24,uuid:"460E5007-852E-4143-82FD-6840DA430FC0"}
 */
function isValueUnique(foundsetRecordOrDataSource, dataproviderName, value, extraQueryColumns, extraQueryValues) {
	if (!foundsetRecordOrDataSource || !dataproviderName) {
		throw new scopes.modUtils$exceptions.IllegalArgumentException("no parameters provided to scopes.modUtils.isValueUnique(foundsetOrRecord, dataproviderName, value)");
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
 * @properties={typeid:24,uuid:"7B878A8A-B3D1-4DB7-A135-59B7AFCAF05D"}
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
 * Replaces dataprovider tags such as %%companyname%% in Word, Open Office or Pages documents
 * 
 * @param {plugins.file.JSFile} file
 * @param {JSRecord} record
 * 
 * @return {Boolean} success
 * 
 * @author patrick
 * @since 2012-10-15
 *
 * @properties={typeid:24,uuid:"0ED064BB-72AF-42A9-BD3A-4E85F278C364"}
 */
function replaceTagsInWordProcessingDocument(file, record) {

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
	var unzippedDir = scopes.modUtils$IO.unzip(document, tmpFile);
	
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
	scopes.modUtils$IO.zip(unzippedDir, document);
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
 * @properties={typeid:24,uuid:"05C86822-ED67-480C-8269-A29A9536A7C8"}
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
 * @properties={typeid:24,uuid:"426197D9-5989-477C-82C8-25A4319907AC"}
 */
function jsonConvertToObject(databaseValue, dbType) {
	if (databaseValue == null) return null;
	return JSON.parse(databaseValue)
}

/*Attempt to replace globals.svy_utl_getTypeOf, but doesn't work that well (yet)
 * =>scopes.modUtils.getType(undefined)
 * global
 * =>scopes.modUtils.getType(null)
 * global
 * =>var x = databaseManager.createEmptyDataSet()
 * =>scopes.modUtils.getType(x)
 * jsdataset
 * =>scopes.modUtils.getType(databaseManager.getFoundSet('db:/svy_framework/log'))
 * foundset
 * =>scopes.modUtils.getType(solutionModel.getForm('AbstractModuleDef'))
 * javaobject
 * =>scopes.modUtils.getType(plugins)
 * pluginscope
 * =>scopes.modUtils.getType(forms)
 * creationalprototype
 * =>scopes.modUtils.getType(forms.AbstractModuleDef.controller)
 * javaobject
 * =>scopes.modUtils.getType(forms.AbstractModuleDef.getId())
 * global
 * =>scopes.modUtils.getType(forms.AbstractModuleDef.getId)
 * function
 */
///**
// * based on http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator
// * @param {*} object
// *
// * @properties={typeid:24,uuid:"05736CB2-5541-4656-833F-CDCF1B879462"}
// */
//function getType(object) {
//	return {}.toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
//}
