/**
 * @enum {{DATASOURCE: String, FIELDS: Array<{FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}>, ATTRIBUTES: Array}|{}}
 * @properties={typeid:35,uuid:"1E5133A9-B3B2-449C-A8FF-1811F65FF96D",variableType:-4}
 */
var TAG_FIELDS = {
	SAMPLE: {
		DATASOURCE: 'startDatasourceName',
		FIELDS: [
			{DB_TITLE: 'alternative title for db field', FIELD: 'dbfield name', RELATION: 'servoyRelationName', ONE_TO_ONE: false },
		]
	}
}

/**
 * @public 
 * @enum {String}
 * @properties={typeid:35,uuid:"E23F943C-3349-4356-AC98-A28B6DE4ED1C",variableType:-4}
 */
var TAGS = {
	REPEAT: '$',
	TAG: '#'
}
/**
 * @public  
 * @enum {String}
 * @properties={typeid:35,uuid:"D5232E2E-EC94-4EA2-B91A-63FD8A6EB319",variableType:-4}
 */
var DEFAULT_REPEATER = {
	START: 'startRepeater',
	STOP: 'endRepeater'
}
/**
 * @public
 *
 * @param {{DATASOURCE: String, FIELDS: Array<{FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}>, ATTRIBUTES: Array}|Object} tagSource
 *
 * @properties={typeid:24,uuid:"38121A08-C072-470E-AD89-20768DEBE1A6"}
 */
function generateFieldTags(tagSource) {
	var ds = databaseManager.createEmptyDataSet(0, 2);
	var mainTable = databaseManager.getTable(tagSource.DATASOURCE);
	tagSource.FIELDS.forEach(/**@param {{DB_TITLE: String, FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}} field */function(field) {
		if (!field.RELATION) {
			ds.addRow([getColumnDisplay(mainTable, field), field.FIELD]);
		} else {
			var relationTable = databaseManager.getTable(scopes.svyDataUtils.getRelationForeignDataSource(field.RELATION));
			ds.addRow([getColumnDisplay(relationTable, field), field.RELATION + '.' + field.FIELD]);
		}
	})
	application.setValueListItems('svyDoc_fieldTags', ds);
}

/**
 * @public
 * @return {Array<String>}
 * @properties={typeid:24,uuid:"402FCF2C-848D-439D-8623-CEC4BC99A764"}
 */
function getFieldTagsData() {
	var dsTags = application.getValueListItems('svyDoc_fieldTags');
	return dsTags.getColumnAsArray(2);
}

/**
 * @param {{DATASOURCE: String, FIELDS: Array<{FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}>, ATTRIBUTES: Array}|Object} tagSource
 * @public
 *
 * @properties={typeid:24,uuid:"01B19619-A925-4821-BEDE-CB9629CB59A3"}
 */
function generateSystemTags(tagSource) {
	var ds = databaseManager.createEmptyDataSet(0, 2);
	ds.addRow([DEFAULT_REPEATER.STOP]);

	tagSource.FIELDS.forEach(/**@param {{FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}} field */function(field) {
		if (field.RELATION && !field.ONE_TO_ONE) {
			if (ds.getColumnAsArray(2).indexOf(DEFAULT_REPEATER.START + '-' + field.RELATION) == -1) {
				var foreignTable = databaseManager.getTable(scopes.svyDataUtils.getRelationForeignDataSource(field.RELATION));
				ds.addRow([DEFAULT_REPEATER.START + '.' + utils.stringReplace(utils.stringInitCap(foreignTable.getSQLName().split('_').join(' ')), ' ', ''), DEFAULT_REPEATER.START + '-' + field.RELATION]);
			}
		}
	})

	application.setValueListItems('svyDoc_systemTags', ds);
}

/**
 * @public
 * @return {Array<String>}
 * @properties={typeid:24,uuid:"E9F250C4-BADB-4CD4-8271-CE44B1E0DFB2"}
 */
function getRepeatTagsData() {
	var dsTags = application.getValueListItems('svyDoc_systemTags');
	return dsTags.getColumnAsArray(2);
}

/**
 * @private
 *
 * @param {JSTable} table
 * @param {{DB_TITLE: String, FIELD: String, RELATION: String, ONE_TO_ONE: Boolean}} column
 *
 * @return {String}
 * @properties={typeid:24,uuid:"12685162-5CAF-4FA9-88B1-8884957EEA0D"}
 */
function getColumnDisplay(table, column) {
	var jsColumn = table.getColumn(column.FIELD);
	var title = jsColumn ? jsColumn.getTitle() : column.FIELD;
	var dbPrefix = column.DB_TITLE ? column.DB_TITLE : utils.stringReplace(utils.stringInitCap(table.getSQLName().split('_').join(' ')), ' ', '')
	return dbPrefix + '.' + utils.stringReplace(utils.stringInitCap(title.split('_').join(' ')), ' ', '');
}
