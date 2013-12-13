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
 * @properties={typeid:35,uuid:"7EBC4113-8B59-4A6D-9F4E-D717DFE5F374",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils')

/**
 * @param {String} qualifiedName
 * @param {*} [context]
 * @return {*}
 *
 * @properties={typeid:24,uuid:"11E5F873-B2AC-4644-9032-0382FE9F483C"}
 */
function getObject(qualifiedName, context) {
	if (!qualifiedName) {
		throw scopes.svyExceptions.IllegalArgumentException('\'qualifiedName\' parameter must be specified')
	}
	var bits = qualifiedName.split('.')
	var scope = context
	if (!scope || !scope[bits[0]]) {
		switch (bits[0]) {
			case 'forms':
				bits.shift()
				scope = forms[bits.shift()]
				break;
			case 'scopes':
				bits.shift()
				scope = scopes[bits.shift()]
				break;
			case 'globals':
				bits.shift()
				scope = globals
				break;
			default:
				scope = null
		}
	}
	while (scope != null && bits.length) {
		scope = scope[bits.shift()]
	}
	return scope
}

/**
 * Calls a method based on a qualified name String.
 * TODO: add example code, also how to apply this for invocation on the same form
 * @public
 *
 * @param {String} qualifiedName
 * @param {*} [args]
 * @param {*} [context] Optional context from where to start evaluating the qualifiedName
 * 
 * @return {*}
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 *
 * @see For getting a qualified name String for a Servoy method: {@link convertServoyMethodToQualifiedName}
 *
 * @properties={typeid:24,uuid:"28F6D882-B1B4-4B23-BCC8-71E2DE44F10E"}
 */
function callMethod(qualifiedName, args, context) {
	var bits = qualifiedName.split('.')
	var methodName = bits.pop()
	var scope = getObject(bits.join('.'), context)
	
	if (!scope || !(scope[methodName] instanceof Function)) {
		throw scopes.svyExceptions.IllegalArgumentException('\'' + qualifiedName + '\' cannot be resolved to a method')
	}
	return scope[methodName].apply(scope, args ? Array.isArray(args) ? args : [args] : null)
}

/**
 * Converts a Servoy method reference to a qualified name String
 * 
 * @public
 * 
 * @version 5.0
 * @since 18.07.2013
 * @author patrick
 *
 * @param {Function} method
 * 
 * @return {String} The qualified name for the provided method. Returns null if the provided method was not a function or not a Servoy method
 * 
 * @see For calling a Servoy method based on a qualified name String: {@link callMethod}
 *
 * @properties={typeid:24,uuid:"05B65961-68C6-42BA-9FB9-12BE068892AD"}
 */
function convertServoyMethodToQualifiedName(method) {
	if (method instanceof Function) {
		try {
			var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(method)
			if (fd.getFormName()) {
				return 'forms.' + fd.getFormName() + '.' + fd.getMethodName()
			} else if (fd.getScopeName()) {
				return 'scopes.' + fd.getScopeName() + '.' + fd.getMethodName()
			} else { //TODO: got all variations covered with the above logic?
				return null
			}
		} catch (e) {
			log.warn(e.message)
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
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 * 
 * @author patrick
 * @since 2012-10-04
 *
 * @properties={typeid:24,uuid:"460E5007-852E-4143-82FD-6840DA430FC0"}
 */
function isValueUnique(foundsetRecordOrDataSource, dataproviderName, value, extraQueryColumns, extraQueryValues) {
	if (!foundsetRecordOrDataSource || !dataproviderName) {
		throw new scopes.svyExceptions.IllegalArgumentException("no parameters provided to scopes.modUtils.isValueUnique(foundsetOrRecord, dataproviderName, value)");
	}
	/** @type {String} */
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

/**
 * TODO: Shouldn't this go into modUtils$data?
 * Retrieve a valuelist display-value for a real-value.<p>
 * 
 * This method will also find values from type ahead value<br>
 * lists with more than 500 values and related value lists<p>
 * 
 * NOTE: In case of a related value list the main record has<br>
 * to be provided as well. The related foundset will be fully<br>
 * walked through until the value is found!
 * 
 * TODO: remove when SVY-5213 is implemented
 *
 * @param {String} valueListName the name of the value list
 * @param {Object} realValue the real value
 * @param {JSRecord} [record] main record for related value lists
 * 
 * @version 5.0
 * @since 08.10.2013
 * @author patrick
 *
 * @properties={typeid:24,uuid:"DA69C5D2-0559-4B78-89F2-061442137E30"}
 */
function getValueListDisplayValue(valueListName, realValue, record) {
	if (!realValue) {
		return realValue;
	}
	var result = application.getValueListDisplayValue(valueListName, realValue);
	if (!result) {
		var jsValueList = solutionModel.getValueList(valueListName);
		var displayValues = jsValueList.getDisplayDataProviderIds();		
		var returnValues = jsValueList.getReturnDataProviderIds();
		if (returnValues.length > 1) {
			application.output("getValueListDisplayValue does not work for value lists with more than one real value", LOGGINGLEVEL.ERROR);
			return null;
		}
		
		if (jsValueList.relationName) {
			if (!record) {
				throw scopes.svyExceptions.IllegalArgumentException("getValueListDisplayValue is called for a valueList that uses a relation but no record is given");
			}
			if (utils.hasRecords(record[jsValueList.relationName])) {
				for (var rr = 1; rr <= record[jsValueList.relationName].getSize(); rr++) {
					var relatedRecord = record[jsValueList.relationName].getRecord(rr);
					if (relatedRecord[returnValues[0]] == realValue) {
						result = new Array();
						for (var rdv = 0; rdv < displayValues.length; rdv++) {
							result.push(relatedRecord[displayValues[rdv]]);
						}
						result = result.join(jsValueList.separator);
						break;
					}
				}
			}
		} else {
			var dataSource = jsValueList.dataSource;
			var query = databaseManager.createSelect(dataSource);
			for (var dv = 0; dv < displayValues.length; dv++) {
				query.result.add(query.getColumn(displayValues[dv]));
			}
			query.where.add(query.getColumn(returnValues[0]).eq(realValue));
			var dataset = databaseManager.getDataSetByQuery(query, 1);
			result = dataset.getRowAsArray(1);
			if (result && result.length > 0) {
				result = result.join(jsValueList.separator);
			}
		}
	}
	
	return result;
}

/**
 * Returns true if the supplied argument is a JavaScript object. Returns false for non-objects, including subclasses like Array, Date or Regex
 * @param {*} object
 *
 * @properties={typeid:24,uuid:"D36599C0-AD8F-402F-9F09-D891C87805B0"}
 */
function isObject(object) {
	return Object.prototype.toString.call(object) == '[object Object]'
}

//TODO add replacer function for JSON.stringify that handles circular references or a custom object stringifier that does this and also removes the quotes around the keys

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
