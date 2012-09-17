/**
 * @param {String} propertyName
 * @param {UUID|String} [userId]
 * 
 * @return {Property} propertyValue
 * 
 * @author patrick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"B24F2B80-DCBF-42AB-9DC8-9F1FB280692F"}
 */
function getProperty(propertyName, userId) {
	/** @type {QBSelect<db:/svy_framework/nav_properties>} */	
	var query = databaseManager.createSelect("db:/" + globals["nav_db_framework"] + "/nav_properties");
	query.result.addPk();
	query.where.add(query.columns.property_name.eq(propertyName));
	if (userId) {
		query.where.add(query.columns.user_id.eq(userId.toString()));
	}
	
	/** @type {JSFoundSet<db:/svy_framework/nav_properties>} */
	var fs = databaseManager.getFoundSet(query);
	
	if (fs && fs.getSize() == 1) {
		return new Property(fs.getRecord(1));
	} else {
		return null;
	}
}

/**
 * @param {UUID|String} [userId]
 * 
 * @return {Array<Property>} properties
 * 
 * @author patrick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"30CA161E-C568-42AF-8D13-B6585CC5FAC5"}
 */
function getProperties(userId) {
	/** @type {QBSelect<db:/svy_framework/nav_properties>} */	
	var query = databaseManager.createSelect("db:/" + globals["nav_db_framework"] + "/nav_properties");
	query.result.addPk();
	if (userId) {
		query.where.add(query.columns.user_id.eq(userId.toString()));
	}
	
	/** @type {JSFoundSet<db:/svy_framework/nav_properties>} */
	var fs = databaseManager.getFoundSet(query);
	
	if (fs && utils.hasRecords(fs)) {
		/** @type {Array<Property>} */
		var result = new Array();
		for (var i = 1; i <= fs.getSize(); i++) {
			var record = fs.getRecord(i);
			result.push(new Property(record));
		}
		return result;
	} else {
		return null;
	}
}

/**
 * Returns the value of the given property (optionally for the given userId) or null if not found<br><br>
 * 
 * This function should only be called if the property is known to have only one value; otherwise use scopes.svyProperties.getPropertyValues()
 * 
 * @param {String} propertyName
 * @param {UUID|String} [userId]
 * 
 * @return {Object} propertyValue
 * 
 * @author patrick
 * @since 06.09.2012
 *
 * @properties={typeid:24,uuid:"58FFEDC9-85DF-422E-BCDF-25F1CB1AADFD"}
 */
function getPropertyValue(propertyName, userId) {
	var values = getPropertyValues(propertyName, userId);
	if (values && values.length > 0) {
		return values[0];
	} else {
		return null;
	}
}

/**
 * Returns the values of the given property (optionally for the given userId) or null if not found
 * 
 * @param {String} propertyName
 * @param {UUID|String} [userId]
 * 
 * @return {Array} propertyValues
 * 
 * @author patrick
 * @since 06.09.2012
 *
 * @properties={typeid:24,uuid:"303BE5BF-CA23-4A44-8899-828EA09FAD5D"}
 */
function getPropertyValues(propertyName, userId) {
	/** @type {QBSelect<db:/svy_framework/nav_properties>} */	
	var query = databaseManager.createSelect("db:/" + globals["nav_db_framework"] + "/nav_properties");
	query.result.addPk();
	query.where.add(query.columns.property_name.eq(propertyName));
	if (userId) {
		query.where.add(query.columns.user_id.eq(userId.toString()));
	}
	
	/** @type {JSFoundSet<db:/svy_framework/nav_properties>} */
	var fs = databaseManager.getFoundSet(query);
	
	if (fs && fs.getSize() == 1) {
		return getValueArray(fs.getRecord(1).property_value);
	} else {
		application.output("Requested property \"" + propertyName + "\" is missing in the properties", LOGGINGLEVEL.WARNING);
		return null;
	}
}

/**
 * Sets the values of the given property (optionally for the given userId)<br>
 * 
 * <b>Important:</b> All existing property values are removed!
 * 
 * @param {String} propertyName
 * @param {Array} propertyValues
 * @param {UUID|String} userId
 * 
 * @author patrick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"6931B4A4-D950-43DA-8EBF-1A2116D6FA79"}
 */
function setPropertyValues(propertyName, propertyValues, userId) {
	/** @type {QBSelect<db:/svy_framework/nav_properties>} */	
	var query = databaseManager.createSelect("db:/" + globals["nav_db_framework"] + "/nav_properties");
	query.result.addPk();
	query.where.add(query.columns.property_name.eq(propertyName));
	if (userId) {
		query.where.add(query.columns.user_id.eq(userId.toString()));
	}
	
	// create String array
	var values = new Array();
	for (var i = 0; i < propertyValues.length; i++) {
		var _propValue = propertyValues[i];
		if (_propValue instanceof String) {
			values.push(_propValue);
		} else if (_propValue instanceof Boolean) {
			values.push(_propValue ? "true" : "false");
		} else {
			values.push(_propValue);
		}
	}
	
	/** @type {JSFoundSet<db:/svy_framework/nav_properties>} */
	var fs = databaseManager.getFoundSet(query);
	if (fs && fs.getSize() == 1) {
		var record = fs.getRecord(1);
		record.property_value = values;
		databaseManager.saveData(record);
	} else {
		application.output("Requested property \"" + propertyName + "\" is missing in the properties", LOGGINGLEVEL.WARNING);
	}
}

/**
 * Sets the value of the given property (optionally for the given userId)<br>
 * 
 * @param {String} propertyName
 * @param {Array} propertyValue
 * @param {UUID|String} userId
 * 
 * @author patrick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"E0C597C9-C163-4C3F-8230-57A41D639067"}
 */
function setPropertyValue(propertyName, propertyValue, userId) {
	setPropertyValues(propertyName, [propertyValue], userId);
}

/**
 * @param {JSRecord<db:/svy_framework/nav_properties>} propertyRecord
 *
 * @properties={typeid:24,uuid:"4113A9FA-33CC-4657-A748-FBF1747A608F"}
 */
function Property(propertyRecord) {
	
	var record = propertyRecord;
	
	/**
	 * The name of this property
	 * 
	 * @type {String}
	 */
	this.name = propertyRecord.property_name;
	
	/**
	 * The ID of this property
	 * 
	 * @type {UUID}
	 */
	this.propertyId = propertyRecord.nav_property_id;
	
	/**
	 * The values of this property
	 * 
	 * @type {Array}
	 */
	this.values = getValueArray(propertyRecord.property_value);
	
	/**
	 * The user ID of this property
	 * 
	 * @type {UUID}
	 */
	this.userId = propertyRecord.user_id;
	
	/**
	 * The modification date of this property
	 * 
	 * @type {Date}
	 */
	this.lastModified = propertyRecord.modification_date;
	
	/**
	 * If true, the property is a user property
	 * 
	 * @type {Boolean}
	 */
	this.isUserProperty = propertyRecord.user_id ? true : false;
	
	/**
	 * Returns the user of this property as a scopes.svySecurityManager.User object
	 * 
	 * @type {Object}
	 */
	this.getUser = function() {
		if (!record.user_id) {
			return null;
		} else {
			return scopes.svySecurityManager.getUserById(record.user_id);
		}
	}
	
	Object.defineProperty(this, "name", { 
		get: function() {
			return record.property_name;
		},
		set: function(x) {
			
		}
	});
	
	Object.defineProperty(this, "propertyId", { 
		get: function() {
			return record.nav_property_id;
		},
		set: function(x) {
			
		}
	});
	
	Object.defineProperty(this, "values", { 
		get: function() {
			var _result = getValueArray(record.property_value);
			return _result;
		},
		set: function(x) {
			setPropertyValues(record.property_name, x, record.user_id);
		}
	});
	
	Object.defineProperties(this, {
		"getUser": {
			enumerable: false
		}
	});
	
	Object.seal(this);
	
}

/**
 * Creates a value array from the serialized array
 * 
 * @param {String} _values
 * @return {Array}
 * 
 * @private
 * 
 * @author patrick
 * @since 11.09.2012
 * 
 * @properties={typeid:24,uuid:"1D1EC016-657C-48C0-B40C-548D78980D01"}
 */
function getValueArray(_values) {
	/** @type {Array} */	
	var result = new Array();
	if (!_values || !(_values instanceof Array)) {
		return result;
	}
	for (var i = 0; i < _values.length; i++) {
		var entry = _values[i];
		if (parseInt(entry) && utils.numberFormat(parseInt(entry),"####") == entry) {
			result.push(parseInt(entry))
		} else if (entry == "true") {
			result.push(true);
		} else if (entry == "false") {
			result.push(false);
		} else if (entry == "") {
			result.push(null);
		} else {
			result.push(entry);
		}
	}
	return result;
}

/**
 * Creates properties as given<br>
 * 
 * The method will only create the properties that do not already exist
 * 
 * @param {Array} properties - Array<{name: String, value: Object}>
 *
 * @properties={typeid:24,uuid:"D373C17C-EDF6-488B-AC75-FAB1D0FC88CE"}
 */
function setDefaultProperties(properties) {
	if (!properties || properties.length == 0) {
		return;
	}
	
	var propertyNames = new Array();
	for (var pp = 0; pp < properties.length; pp++) {
		propertyNames.push(properties[pp].name);
	}
	
	/** @type {QBSelect<db:/svy_framework/nav_properties>} */	
	var query = databaseManager.createSelect("db:/" + globals["nav_db_framework"] + "/nav_properties");
	query.result.addPk();
	query.where.add(query.columns.property_name.isin(propertyNames));
	
	/** @type {JSFoundSet<db:/svy_framework/nav_properties>} */
	var fs = databaseManager.getFoundSet(query);
	
	if (utils.hasRecords(fs)) {
		for (var fsi = 1; fsi <= fs.getSize(); fsi++) {
			var record = fs.getRecord(fsi);
			var index = propertyNames.indexOf(record.property_name);
			if (index > -1) {
				propertyNames.splice(index,1);
				properties.splice(index,1);
			}
		}
	}
	
	for (var i = 0; i < properties.length; i++) {
		var prop = properties[i];
		record = fs.getRecord(fs.newRecord());
		record.property_name = prop.name;
		record.property_value = prop.value instanceof Array ? prop.value : [prop.value];
		if (databaseManager.saveData(record)) {
			application.output("Created new property \"" + prop.name + "\" with value " + record.property_value, LOGGINGLEVEL.INFO);
		} else {
			application.output("Failed to create new property \"" + prop.name + "\"", LOGGINGLEVEL.WARNING);
		}
	}
}