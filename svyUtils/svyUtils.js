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
 * @properties={typeid:24,uuid:"FDA0FED5-7A26-46BF-B090-8626CA0C665A"}
 */
function isValueUnique(foundsetOrRecord, dataproviderName, value, extraQueryColumns, extraQueryValues) {
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

/**
 * Unzips the given file to the given target file<p>
 * 
 * If no target file is given, all files in fileToUnzip will<br>
 * be extracted to a directory with the same name as the zip file
 * 
 * @param {plugins.file.JSFile} fileToUnzip
 * @param {plugins.file.JSFile} [targetFile]
 * 
 * @return {plugins.file.JSFile} targetFile
 * 
 * @author patrick
 * @since 2012-10-15
 * 
 * @properties={typeid:24,uuid:"4009C6AA-9264-426A-8137-21F360891949"}
 */
function unzip(fileToUnzip, targetFile) {
	var zipFilePath = fileToUnzip.getAbsolutePath();
	var fileSeparator = java.io.File.separator;
	if (!targetFile) {
		targetFile = plugins.file.convertToJSFile(zipFilePath.substr(0, zipFilePath.lastIndexOf(".")));
		if (targetFile.exists()) {
			do {
				targetFile = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + "-1");
			} while (targetFile.exists());
		}
	}
	
	if (!targetFile.exists()) {
		targetFile.mkdirs();
	}
	
	try {
		var zip = new java.util.zip.ZipFile(fileToUnzip.getAbsolutePath());
		var zipEntries = zip.entries();
		
		while (zipEntries.hasMoreElements()) {
			/** @type {java.util.zip.ZipEntry} */
			var zipEntry = zipEntries.nextElement();
			if (zipEntry.isDirectory()) {
				var zipDir = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntry.getName());
				zipDir.mkdirs();
				continue;
			} else {
				var zipFile = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntry.getName());
				if (!zipFile.getParentFile().exists()) {
					zipFile.getParentFile().mkdirs();
				}
				var is = zip.getInputStream(zipEntry);
				/** @type {java.io.OutputStream} */
				var fos = new java.io.FileOutputStream(zipFile.getAbsolutePath());
				
				/** @type {java.nio.channels.ReadableByteChannel} */
				var inputChannel = java.nio.channels.Channels.newChannel(is);
				/** @type {java.nio.channels.WritableByteChannel} */
				var outputChannel = java.nio.channels.Channels.newChannel(fos);		

				channelCopy(inputChannel, outputChannel);

				is.close();
				fos.close();
			}
		}
	} catch (e) {
		// IO Exception
		application.output("Failed to unzip file \"" + fileToUnzip.getAbsolutePath() + "\": " + e.message);
		return null;
	}
	
	return targetFile;
}

/**
 * Zips the given file<p>
 * 
 * The zip file will either be written to the given target file
 * or a zip file is created using the same name and location as the original file<p>
 * 
 * Note: if the target file already exists, it will be <b>deleted</b>
 * 
 * @param {plugins.file.JSFile} fileToZip
 * @param {plugins.file.JSFile} [targetFile]
 * 
 * @author patrick
 * @since 2012-10-15
 *
 * @properties={typeid:24,uuid:"86DDDAC8-1D6F-49FE-BD70-8611F7000D17"}
 */
function zip(fileToZip, targetFile) {
	var filePath = fileToZip.getAbsolutePath();
	if (!targetFile) {
		targetFile = plugins.file.convertToJSFile(filePath + ".zip");
	}
	
	if (targetFile.exists()) {
		if (!targetFile.deleteFile()) {
			return;
		}
	}
	
	try {
		/** @type {java.util.zip.ZipOutputStream} */
		var zos = new java.util.zip.ZipOutputStream(new java.io.FileOutputStream(targetFile.getAbsolutePath()));
		/** @type {java.nio.channels.WritableByteChannel} */
		var outputChannel = java.nio.channels.Channels.newChannel(zos);		
		
		/**
		 * @param {plugins.file.JSFile} file
		 * @param {plugins.file.JSFile} base
		 * @param {java.util.zip.ZipOutputStream} zipOutputStream
		 */
		function zipFile(file, base, zipOutputStream) {
			if (file.isDirectory()) {
				var files = file.listFiles();
				for (var i = 0; i < files.length; i++) {
					var singleFile = files[i];
					zipFile(singleFile, base, zipOutputStream);
				}
			} else {
				/** @type {java.io.InputStream} */
				var is = new java.io.FileInputStream(file);
				var entryPath;
				if (file.getAbsolutePath() == base.getAbsolutePath()) {
					entryPath = file.getName();
				} else {
					entryPath = file.getPath().substring(base.getPath().length + 1);
				}
				var entry = new java.util.zip.ZipEntry(entryPath);
				
				zipOutputStream.putNextEntry(entry);
				
				/** @type {java.nio.channels.ReadableByteChannel} */
				var inputChannel = java.nio.channels.Channels.newChannel(is);
				
				channelCopy(inputChannel, outputChannel);
				
				is.close();
			}
		}
		
		zipFile(fileToZip, fileToZip, zos);
		outputChannel.close();
		zos.close();
		
		zos = null;
	}
	catch(e) {
		application.output("Error zipping file \"" + fileToZip.getAbsolutePath() + "\": " + e, LOGGINGLEVEL.ERROR);
	} finally {
		try {
			if (zos != null) {
				zos.close();
			}
		} catch(e) {
		}
	}
}

/**
 * Copies streams
 * 
 * @param {java.nio.channels.ReadableByteChannel} src
 * @param {java.nio.channels.WritableByteChannel} dest
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"1E7D6817-F26F-4947-A99C-57930C483FC5"}
 */
function channelCopy(src, dest) {
	var buffer = java.nio.ByteBuffer.allocateDirect(8 * 1024);
	while (src.read(buffer) != -1) {
		// prepare the buffer to be drained
		buffer.flip();
		// write to the channel, may block
		dest.write(buffer);
		// If partial transfer, shift remainder down
		// If buffer is empty, same as doing clear()
		buffer.compact();
	}
	// EOF will leave buffer in fill state
	buffer.flip();
	// make sure the buffer is fully drained.
	while (buffer.hasRemaining()) {
		dest.write(buffer);
	}

	src.close();
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
	var unzippedDir = unzip(document, tmpFile);
	
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
	zip(unzippedDir, document);
	deleteDirectory(unzippedDir);
	unzippedDir.deleteFile();
	
	return true;
}
