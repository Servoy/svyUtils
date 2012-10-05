/**
 * Returns all JSForms that are instances of a certain JSForm
 *
 * @param {JSForm} superForm
 *
 * @return {Array<JSForm>}
 *
 * @properties={typeid:24,uuid:"4E5567AB-4BE9-406F-ABDF-5807EF930E09"}
 */
function getJSFormInstances(superForm) {
	/**@type {Array<JSForm>}*/
	var retval = []
	var smForms = solutionModel.getForms()
	var smForm, instances
	for (var i = 0; i < smForms.length; i++) {
		smForm = smForms[i]
		instances = []
		if (retval.indexOf(smForm) != -1) continue //FIXME: this check doesn't work due to SVY-2711
		while (smForm.extendsForm != null) {
			instances.push(smForm)
			if (smForm.extendsForm.name == superForm.name || retval.indexOf(smForm.extendsForm) != -1) { //FIXME: first clause should compare object, not name and second clause doesn't work due to SVY-2711
				retval = retval.concat(instances)
				break;
			}
			smForm = smForm.extendsForm
		}
	}
	return retval
}

/**
 * Tries to connect to the provided hostname. If connection is successful, true is returned, otherwise false. (time)
 * @private
 * @param {String} hostname
 * @param {Number} [timeout] timeout for the connection check (in milliseconds). Default: 200ms
 *
 * @properties={typeid:24,uuid:"E307CC91-7CAA-4618-8CE8-20CFA72C08BB"}
 */
function testHostName(hostname, timeout) {
	var timeOut = timeout || 200
	var socket
	var reachable = false;
	try {
		var addr = java.net.InetAddress.getByName(hostname);
		var port = 80;
		//Setting type to super class to prevent warnings
		/**@type {Packages.java.net.SocketAddress}*/ 
		var sockaddr = new java.net.InetSocketAddress(addr, port);

		// Create an unbound socket
		socket = new java.net.Socket();

		// If the timeout occurs, SocketTimeoutException is thrown.
		socket.connect(sockaddr, timeOut);
		reachable = true;
	} catch (e if e.javaException instanceof java.net.UnknownHostException) {
		application.output('Host "' + hostname + '" cannot be reached, might not exist', LOGGINGLEVEL.DEBUG)
	} catch (e if e.javaException instanceof java.net.SocketTimeoutException) {
		application.output('Timeout checking host "' + hostname + '"', LOGGINGLEVEL.DEBUG)
	} catch (e if e.javaException instanceof java.io.IOException) {
		application.output('Network issue checking host "' + hostname + '"', LOGGINGLEVEL.DEBUG)
	} catch (e) {
		application.output(e)
	} finally {
		if (socket != null) {
			try {
				socket.close()
			} catch (e) {
			}
		}
	}

	if (reachable) {
		application.output('Host ' + hostname + ' exists', LOGGINGLEVEL.DEBUG)
		return true
	}
	return false
}

/**
 * Function to parse urls and retrieve the different parts of it. Taken from http://blog.stevenlevithan.com/archives/parseuri
 * 
 * FIXME: A queryString with multiple values for the same parameter is not supported. The queryKey only returns the last value: ?x=1&x=2 becomes ...,"queryKey":{"x":"2"}
 * 
 * @param {String} url
 * @param {Boolean} [strictMode] Default false
 * @return {{anchor: String, query: String, file: String, directory: String, path: String, relative: String, port: Number, host: String, password:String, user: String, userInfo: String, authority: String, protocol:String, source: String, queryKey: Object<String>}}
 *
 * @properties={typeid:24,uuid:"9E13D36E-F214-4B44-A13A-644256B077D3"}
 */
function parseUrl(url, strictMode) {
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	var o = { }
	o.strictMode = strictMode;
	o.key = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	o.q = { };
	o.q.name = "queryKey";
	o.q.parser = /(?:^|&)([^&=]*)=?([^&]*)/g
	o.parser = { };
	o.parser.strict = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
	o.parser.loose = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/

	var m = o.parser[o.strictMode ? "strict" : "loose"].exec(url);
	/**@type {{anchor: String, query: String, file: String, directory: String, path: String, relative: String, port: Number, host: String, password:String, user: String, userInfo: String, authority: String, protocol:String, source: String, queryKey: Object<String>}}*/
	var uri = { };
	var i = 14;
	while (i--) uri[o.key[i]] = m[i] || "";
	uri[o.q.name] = { };
	uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) { 
			if ($1) uri[o.q.name][$1] = $2;
		});
	return uri;
}

/**
 * Tests if a given value for the given dataprovider<br>
 * is unique in the table of the given foundset or record
 * 
 * @param {JSRecord|JSFoundSet} foundsetOrRecord
 * @param {String} dataproviderName
 * @param {Object} value
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 * 
 * @author patrick
 * @since 2012-10-04
 *
 * @properties={typeid:24,uuid:"FDA0FED5-7A26-46BF-B090-8626CA0C665A"}
 */
function isValueUnique(foundsetOrRecord, dataproviderName, value) {
	if (!foundsetOrRecord || !dataproviderName) {
		throw new scopes.svyExceptions.IllegalArgumentException("no parameters provided to scopes.svyUtils.isValueUnique(foundsetOrRecord, dataproviderName, value)");
	}
	var dataSource = foundsetOrRecord.getDataSource();
	var pkNames = databaseManager.getTable(dataSource).getRowIdentifierColumnNames();
	var query = databaseManager.createSelect(dataSource);
	for (var i = 0; i < pkNames.length; i++) {
		query.result.add(query.getColumn(pkNames[i]).count);
	}
	if (value == null) {
		query.where.add(query.getColumn(dataproviderName).isNull);
	} else {
		query.where.add(query.getColumn(dataproviderName).eq(value));
	}
	var dataset = databaseManager.getDataSetByQuery(query,1);
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
	
	this.styleName = styleName;
	
	var style = solutionModel.getStyle(styleName);
	
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
	 * Returns a java.awt.Font from the given font string
	 * 
	 * @param {String} colorString
	 * 
	 * @return {java.awt.Color} color
	 */
	this.getJavaColor = function(colorString) {
		return Packages.com.servoy.j2db.util.PersistHelper.createColor(colorString);
	}
	
}
