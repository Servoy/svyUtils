/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
/*
 * TODO:
 * - Add option to stream blobs from Database to client, see https://www.servoy.com/forum/viewtopic.php?p=107753#p107753
 * - Add option to stream files from serverside filesystem to Web Client, see https://www.servoy.com/forum/viewtopic.php?p=107753#p107753
 */

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"663420E6-0054-46C0-A328-5257365E0057",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.io');

/**
 * Opens a file from the file system using the default viewer for the fileType on the current platform. (.txt with editor, .pdf with pdf reader, .doc with word, etc.)
 * 
 * @public
 * 
 * @param {plugins.file.JSFile|String} file The file that will be opened
 *
 * @properties={typeid:24,uuid:"95C45F79-F469-4542-BB8B-BE226010D8B1"}
 */
function openFileWithDefaultViewer(file) {
	// TODO: Support opening in the WC: either plugins.file.writeFile, but required to read the content first or showUrl, if file is accessible from the outside (see deprecated globals.svy_utl_open_file())
	// TODO: test Linux support: SampleCode suggests using xdg-open here: https://www.servoy.com/forum/viewtopic.php?f=15&t=15237&p=81646&hilit=application+getosname+and+linux#p81653
	// TODO param {String} [mimeType] Required for usage in the Web Client. Used by the browser to determine how to open the file
	if (!scopes.svySystem.isSwingClient()) {
		throw new scopes.svyExceptions.UnsupportedOperationException('Operation only supported in Smart or Runtime Client');
	}
	var osName = application.getOSName();
	/** @type {String} */
	var filePath = file;
	if (file instanceof plugins.file.JSFile) {
		filePath = file.getAbsolutePath();
	}
	if (/Windows/.test(osName)) {
		application.executeProgram('rundll32', ['url.dll,FileProtocolHandler', filePath]);
	} else if (/Linux|Freebsd/.test(osName)) {
		application.executeProgram('mozilla', [filePath]);
	} else if (/Mac/.test(osName)) {
		application.executeProgram('open', [filePath]);
	}
	// What if no match?
}

/**
 * Unzips the given file to the given target file<br>
 * <br>
 * If no target file is given, all files in fileToUnzip will<br>
 * be extracted to a directory with the same name as the zip file
 * 
 * @public
 * 
 * @param {plugins.file.JSFile} fileToUnzip
 * @param {plugins.file.JSFile} [targetFile]
 * 
 * @return {plugins.file.JSFile} targetFile
 * 
 * @properties={typeid:24,uuid:"1453D732-A0CE-46B0-9EEE-81D656E61940"}
 */
function unzip(fileToUnzip, targetFile) {
	var zipFilePath = fileToUnzip.getAbsolutePath();
	var fileSeparator = java.io.File.separator;
	if (!targetFile) {
		targetFile = plugins.file.convertToJSFile(zipFilePath.substr(0, zipFilePath.lastIndexOf('.')));
		if (targetFile.exists()) {
			do {
				targetFile = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + '-1');
			} while (targetFile.exists());
		}
	}

	if (!targetFile.exists()) {
		targetFile.mkdirs();
	}

	try {
		var zipFile = new java.util.zip.ZipFile(fileToUnzip.getAbsolutePath());
		var zipEntries = zipFile.entries();

		while (zipEntries.hasMoreElements()) {
			/** @type {java.util.zip.ZipEntry} */
			var zipEntry = zipEntries.nextElement();
			var zipEntryName = zipEntry.getName();
			zipEntryName = utils.stringReplace(zipEntryName, '/', java.io.File.separator);
			if (zipEntry.isDirectory()) {
				var zipDir = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntryName);
				zipDir.mkdirs();
				continue;
			} else {
				var jsFile = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntryName);
				if (!jsFile.getParentFile().exists()) {
					jsFile.getParentFile().mkdirs();
				}
				var is = zipFile.getInputStream(zipEntry);
				/** @type {java.io.OutputStream} */
				var fos = new java.io.FileOutputStream(jsFile.getAbsolutePath());

				/** @type {java.nio.channels.ReadableByteChannel} */
				var inputChannel = java.nio.channels.Channels.newChannel(is);
				/** @type {java.nio.channels.WritableByteChannel} */
				var outputChannel = java.nio.channels.Channels.newChannel(fos);

				channelCopy(inputChannel, outputChannel);

				is.close();
				outputChannel.close();
				fos.close();
			}
		}
	} catch (e) {
		// IO Exception
		log.error('Failed to unzip file "{}": {}', fileToUnzip.getAbsolutePath(), e.message);
		return null;
	} finally {
		if (zipFile) {
			try {
				zipFile.close();
			} catch (e) {
			}
		}
	}

	return targetFile;
}


/**
 * Zips the given file or directory<br>
 * <br>
 * The zip file will either be written to the given target file<br>
 * or a zip file is created using the same name and location as the original file<br>
 * <br>
 * NOTE: if the target file already exists, it will be <b>deleted</b>
 * 
 * @public
 * 
 * @param {plugins.file.JSFile} fileToZip
 * @param {plugins.file.JSFile} [targetFile]
 * @param {Array<String>} [filenamesToStoreUncompressed] array of file names that should be stored uncompressed in the archive
 * 
 * @return {plugins.file.JSFile} zipFile
 * 
 * @throws {Error}
 *
 * @properties={typeid:24,uuid:"9D6CECAE-ACD0-497F-9994-355861A2DE24"}
 */
function zip(fileToZip, targetFile, filenamesToStoreUncompressed) {
	var filePath = fileToZip.getAbsolutePath();
	if (!targetFile) {
		targetFile = plugins.file.convertToJSFile(filePath + '.zip');
	}
	
	if (targetFile.exists()) {
		if (!targetFile.deleteFile()) {
			return null;
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
				if (!files || files.length == 0) {
					// empty directory
					zipOutputStream.putNextEntry(new java.util.zip.ZipEntry(file.getPath().substring(base.getPath().length + 1) + '/'));
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
				entryPath = utils.stringReplace(entryPath, java.io.File.separator, '/');
				var entry = new java.util.zip.ZipEntry(entryPath);
				
				if (filenamesToStoreUncompressed && filenamesToStoreUncompressed.indexOf(file.getName()) != -1) {
					entry.setMethod(java.util.zip.ZipEntry.STORED);
					entry.setSize(file.size());
					var crc = new java.util.zip.CRC32();
					crc.update(file.getBytes());
					entry.setCrc(crc.getValue());
				}
				
				zipOutputStream.putNextEntry(entry);
				
				/** @type {java.nio.channels.ReadableByteChannel} */
				var inputChannel = java.nio.channels.Channels.newChannel(is);
				
				channelCopy(inputChannel, outputChannel);
				
				is.close();
			}
		}
			
		zipFile(fileToZip, fileToZip, zos);
		
		outputChannel.close();
		outputChannel = null;
		
		zos.close();
		zos = null;
	} catch(e) {
		log.error('Error zipping file "{}": {}', fileToZip.getAbsolutePath(), e.message);
		throw e;
	} finally {
		try {
			if (outputChannel != null) {
				outputChannel.close();
			}
			if (zos != null) {
				zos.close();
			}
		} catch(e) {
		}
	}
	
	return targetFile;
}

/**
 * Creates a MD5 or SHA1 hash of a given file
 * 
 * @public
 *  
 * @param {String|plugins.file.JSFile} file - the file to calculate a hash for
 * @param {String} [algorithm] - one of the HASH_ALGORITHM constants, defaults to SHA1
 * 
 * @return {String} hash
 *
 * @properties={typeid:24,uuid:"02BA9E89-FD80-4C2A-AE16-4CE3F105302C"}
 */
function calculateHash(file, algorithm) {
	if (!algorithm) algorithm = 'SHA-1';

	try {
		var jsSourceFile;
		if (file instanceof String) {
			jsSourceFile = plugins.file.convertToJSFile(file);
		} else {
			jsSourceFile = file;
		}
		
		if (!jsSourceFile.exists()) {
			return null;
		}

		var md = java.security.MessageDigest.getInstance(algorithm);
		md.update(jsSourceFile.getBytes());
		var digestBytes = md.digest();

		var HEXES = '0123456789abcdef';
		var hex = new java.lang.StringBuilder(2 * digestBytes.length);
		for (var i = 0; i < digestBytes.length; i++) {
			hex.append(HEXES.charAt((digestBytes[i] & 0xF0) >> 4)).append(HEXES.charAt((digestBytes[i] & 0x0F)));
		}

		return hex.toString();
	} catch (e) {
		log.error('Error calculating Hash for file "' + file.getAbsolutePath() + '": ' + e.message);
		return null;
	}
}

/**
 * Hash algorithms that are supported in calculateHash()
 * 
 * @public
 * 
 * @enum
 *
 * @properties={typeid:35,uuid:"DA2141EB-E8D0-431D-9241-0392E2051BC9",variableType:-4}
 */
var HASH_ALGORITHM = {
	MD2: "MD2",	
	MD5: "MD5",
	SHA1: "SHA-1",
	SHA256: "SHA-256",
	SHA384: "SHA-384",	
	SHA512: "SHA-512"
};

/**
 * Copies streams
 * 
 * @private
 * 
 * @param {java.nio.channels.ReadableByteChannel} src
 * @param {java.nio.channels.WritableByteChannel} dest
 * 
 * @properties={typeid:24,uuid:"8E3DD438-43FB-4499-A7B4-0D00F4956E90"}
 */
function channelCopy(src, dest) {
	var buffer = java.nio.ByteBuffer.allocateDirect(16 * 1024);
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
 * @public
 * 
 * @enum
 * 
 * @properties={typeid:35,uuid:"C217D4B1-1E19-439C-B056-8CE6D4C0C14F",variableType:-4}
 */
var CHAR_SETS = {
	/** Seven-bit ASCII, a.k.a. ISO646-US, a.k.a. the Basic Latin block of the Unicode character set.*/
	US_ASCII: 'US-ASCII',
	/**ISO Latin Alphabet No. 1, a.k.a. ISO-LATIN-1.*/
	ISO_8859_1: 'ISO-8859-1',
	/**Eight-bit Unicode Transformation Format.*/
	UTF_8: 'UTF-8',
	/**Sixteen-bit Unicode Transformation Format, big-endian byte order.*/
	UTF_16BE: 'UTF-16BE',
	/**Sixteen-bit Unicode Transformation Format, little-endian byte order.*/
	UTF_16LE: 'UTF-16LE',
	/**Sixteen-bit Unicode Transformation Format, byte order specified by a mandatory initial byte-order mark (either order accepted on input, big-endian used on output.)*/	
	UTF_16: 'UTF-16'
};

/**
 * Reads the content of a file line by line, without reading the entire file into memory
 * 
 * @public
 * 
 * @param {plugins.file.JSFile} file
 * @param {Function} lineCallback function that gets called for each line. Receives the line content as first argument. Return false from the callback to stop further reading
 * @param {String} [charset] See {@link CHAR_SETS}. Default CHAR_SETS.UTF_8
 * 
 * @throws {IOException}
 * 
 * @example <pre>
 *  var file = plugins.file.convertToJSFile('C:/myCSVFile.csv')
 *  readFile(file, function(text) {
 *  	application.output(text)
 *  })
 * </pre>
 *
 * @properties={typeid:24,uuid:"B288B4EC-BC90-4ABA-9C2E-E45E600BF7D6"}
 */
function readFile(file, lineCallback, charset) {
	if (!file.exists() || !file.isFile()) {
		throw new FileNotFoundException(null, file)
	}
    var fis = new Packages.java.io.FileInputStream(file);
    var isr = new Packages.java.io.InputStreamReader(fis, charset||CHAR_SETS.UTF_8);
    var br = new Packages.java.io.BufferedReader(isr);
    var line;
    try {
        while ((line = br.readLine())) {
            if(lineCallback(line) === false) {
            	break;
            }
        }
     } catch (e) {
        throw new IOException('ERROR reading file \'' + file.getName() + '\': ' + e);
     } finally {
        br.close();
     	fis = null;
     	isr = null;
     	br = null;
     }
}

/**
 * @public
 * 
 * @param {plugins.file.JSFile} file
 * 
 * @return {Number} The number of lines in the file. -1 in case of an issue getting the number of lines in the file
 * 
 * @throws {IOException}
 * 
 * @properties={typeid:24,uuid:"EEFD9AA1-68B5-4DD9-8C4D-AE0EE2488F28"}
 */
function getLineCountForFile(file) {
	if (!file.exists() || !file.isFile()) {
		throw new FileNotFoundException(null, file);
	}
	try {
		var fr = new Packages.java.io.FileReader(file);
		var lnr = new Packages.java.io.LineNumberReader(fr);
		while (lnr.readLine() != null) {
		}
	    return lnr.getLineNumber(); 
	} catch (e) {
		log.error('Error getting max lines for file "{}"', file.getName(), e);
	} finally {
		lnr.close();
		fr.close();
	}
	return -1;
}

/**
 * Buffered file writer that can be used to write to a file in chunks instead of holding the file's content completely in memory
 * 
 * @public
 * 
 * @param {String|plugins.file.JSFile} pathOrFile
 * @param {Boolean} [append] if true (default), then data will be written to the end of the file rather than the beginning
 * 
 * @throws {java.io.IOException}
 * 
 * @constructor
 * 
 * @example <pre>
 * var fs = datasources.db.example_data.customers.getFoundSet();
 * var colNames = datasources.db.example_data.customers.getColumnNames();
 * 
 * fs.loadAllRecords();
 * 
 * try {
 *     // get a buffered writer overwriting a possibly existing file
 *     var bufferedWriter = new scopes.svyIO.BufferedWriter("D:\\test.txt", false);
 *     for (var i = 1; i <= fs.getSize(); i++) {
 *          var record = fs.getRecord(i);
 *          for (var c = 0; c < colNames.length; c++) {
 *               // write the value in double quotes adding a comma if not the last column
 *               bufferedWriter.write("\"" + record[colNames[c]] + "\"" + (c < (colNames.length - 1) ? "," : ""));
 *          }
 *          if (i < fs.getSize()) {
 *               // add new lines for any record other than the last
 *               bufferedWriter.newLine();
 *          }
 *     }
 * } catch(e) {
 *     // Problem
 *     application.output(e.message);
 * } finally {
 *     if (bufferedWriter) {
 *          // close the file if a writer could be created at all
 *          bufferedWriter.close();
 *     }
 * }</pre>
 *
 * @properties={typeid:24,uuid:"9F518CA2-AF03-4B84-8AD3-87059862C8F0"}
 */
function BufferedWriter(pathOrFile, append) {
	if (!(this instanceof BufferedWriter)) {
		log.warn('scopes.svyIO.BufferedWriter: Constructor functions should be called with the "new" keyword!');
		return new BufferedWriter(pathOrFile, append);
	}

	if (append === undefined) {
		append = true;
	}

	var filePath = null;
	if (pathOrFile instanceof String) {
		filePath = pathOrFile;
	} else {
		/** @type {plugins.file.JSFile} */
		var jsFile = pathOrFile;
		filePath = jsFile.getAbsolutePath();
	}

	try {
		var fileWriter = new Packages.java.io.FileWriter(filePath, append);
		var bufferedFileWriter = new Packages.java.io.BufferedWriter(fileWriter);
	} catch (e) {
		throw e;
	}
	
	/**
	 * Writes the given String if the given value is a Date or a Number
	 * 
	 * @param stringToWrite
	 * 
	 * @public
	 * 
	 * @throws {java.io.IOException}
	 */
	this.write = function(stringToWrite) {
		try {
			if (stringToWrite instanceof Date) {
				/** @type {Date} */
				var dateValue = stringToWrite;
				stringToWrite = utils.dateFormat(dateValue, i18n.getDefaultDateFormat());
			} else if (stringToWrite instanceof Number) {
				/** @type {Number} */
				var numValue = stringToWrite;
				stringToWrite = utils.numberFormat(numValue, i18n.getDefaultNumberFormat());
			}
			if (stringToWrite && stringToWrite instanceof String) {
				bufferedFileWriter.write(stringToWrite);
			}
		} catch (e) {
			throw e;
		}
	}
	
	/**
	 * Writes the platform's own notion of line separator as defined by the system property line.separator.<br>
	 * Not all platforms use the newline character ('\n') to terminate lines. Calling this method to terminate<br>
	 * each output line is therefore preferred to writing a newline character directly.
	 * 
	 * @public
	 * 
	 * @throws {java.io.IOException}
	 */
	this.newLine = function() {
		try {
			bufferedFileWriter.newLine();
		} catch (e) {
			throw e;
		}
	}
	
	/**
	 * Closes the stream
	 * 
	 * @public
	 * 
	 * @throws {java.io.IOException}
	 */
	this.close = function() {
		try {
			// don't flush, because that is done by close already and would result in an error on closed streams while close does not
			bufferedFileWriter.close();
		} catch (e) {
			throw e;
		}
	}
}

/**
 * Returns true if the given file is currently opened by the user
 * 
 * @public
 * 
 * @param {plugins.file.JSFile} file
 * 
 * @properties={typeid:24,uuid:"61CAFF50-B7A8-499D-8008-4B8457A3E2F6"}
 */
function isFileOpen(file) {
	if (!file.exists() || !file.isFile()) {
		throw new FileNotFoundException(null, file);
	}
	var result;
	if (scopes.svySystem.isWindowsPlatform()) {
		if (!file.canWrite()) {
			return true;
		}
		var originalfilePath = file.getAbsolutePath();
		var parentFolder = file.getParentFile().getAbsolutePath();
		var testFileName = application.getUUID().toString();
		var newName = parentFolder + '\\' + testFileName;
		var newFile = plugins.file.convertToJSFile(newName);
		result = file.renameTo(newName);
		if (result) {
			newFile.renameTo(originalfilePath);
			return false;
		} else {
			return true;
		}
	} else {
		//Unix
		result = application.executeProgram('lsof', [file.getAbsolutePath()]);
		if (result && result.length > 0) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * Creates a readable file size from the given number of bytes
 * 
 * @public
 * 
 * @param {Number} size
 * @param {Number} [numberOfDigits]
 * 
 * @return {String} formattedFileSize
 *
 * @properties={typeid:24,uuid:"B6CB0207-DA2E-4EE7-88D7-7F66D39A6D6F"}
 */
function humanizeFileSize(size, numberOfDigits) {
	if (!size || size < 0) {
		return '0 bytes';
	}
	if (numberOfDigits == null || numberOfDigits < 0) {
		numberOfDigits = 1;
	}
	if (size >= (1024 * 1024 * 1024 * 1024 * 1024)) {
		return utils.numberFormat(size / (1024 * 1024 * 1024 * 1024 * 1024), numberOfDigits) + ' PB';
	} else if (size >= (1024 * 1024 * 1024 * 1024)) {
		return utils.numberFormat(size / (1024 * 1024 * 1024 * 1024), numberOfDigits) + ' TB';
	} else if (size >= (1024 * 1024 * 1024)) {
		return utils.numberFormat(size / (1024 * 1024 * 1024), numberOfDigits) + ' GB';		
	} else if (size >= (1024 * 1024)) {
		return utils.numberFormat(size / (1024 * 1024), numberOfDigits) + ' MB';			
	} else if (size >= 1024) {
		return utils.numberFormat(size / 1024, numberOfDigits) + ' kB';		
	} else {
		return size + 'bytes';
	}
}

/**
 * Raised for failed or interrupted I/O operations
 * 
 * @public
 * 
 * @param {String} [errorMessage]
 * 
 * @constructor
 * 
 * @extends {scopes.svyExceptions.SvyException}
 *
 * @properties={typeid:24,uuid:"E0E2B56B-84B6-4A26-940A-A9EBB9F20CC3"}
 */
function IOException(errorMessage) {
	scopes.svyExceptions.SvyException.call(this, errorMessage || 'IO Exception');
}

/**
 * The given file could not be found
 * 
 * @public
 *
 * @param {String} [errorMessage]
 * @param {plugins.file.JSFile} [file]
 *
 * @constructor
 * 
 * @extends {IOException}
 * 
 * @properties={typeid:24,uuid:"9C109983-5E2B-4549-9431-E039E7CFACCD"}
 */
function FileNotFoundException(errorMessage, file) {
	/**
	 * The file that could not be found
	 * 
	 * @public
	 * 
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	IOException.call(this, errorMessage || 'File not found');
}

/**
 * Point prototypes to superclasses
 * 
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"DAF325B1-1E2C-46A6-92C8-D4B2631B15E1",variableType:-4}
 */
var init = function() {
	IOException.prototype = Object.create(scopes.svyExceptions.SvyException.prototype);
	IOException.prototype.constructor = IOException;
	
	FileNotFoundException.prototype = Object.create(IOException.prototype);
	FileNotFoundException.prototype.constructor = FileNotFoundException;
}();

/*
 * TODO: add file writer stuff:
 * - https://www.servoy.com/forum/viewtopic.php?f=22&t=13866&p=72648&hilit=java.io.filewriter#p72637
 * - https://www.servoy.com/forum/viewtopic.php?t=6391
 */

/**
 * This method is useful for doing simple base64 encoding.<br/>
 * For example when you want to use basic HTTP authorization you can use this method to encode the userName and password as a header.
 *
 * @public 
 * @param {String} inputString
 * @return {String} the given string encoded Base64.
 * @example <pre>var getRequest = http.createGetRequest(url);
 *getRequest.addHeader('Authorization', 'Basic ' + scopes.svyIO.encodeBase64(user + ':' + passwordOrToken));</pre>
 *
 * @properties={typeid:24,uuid:"0B0B4F09-09F4-4D11-9DD7-E64E40E3A968"}
 */
function encodeStringToBase64(inputString) {
    return Packages.org.apache.commons.codec.binary.Base64.encodeBase64String(new Packages.java.lang.String(inputString).getBytes());
}

/**
 * Execute method on separate thread
 * @param {Function} method
 * @param {Number} [priority]
 * @properties={typeid:24,uuid:"A8572B12-7C3D-4786-8BC6-7C7FA9478A8C"}
 */
function executeMethodAsync(method, priority) {
	var r = new java.lang.Runnable({
			run: function() {
				Packages.javax.swing.SwingUtilities.invokeLater(new java.lang.Runnable({
					run: function() {
						method()
					}
				}))
			}
		});
	var thread = new java.lang.Thread(r)
	var pr = java.lang.Thread.NORM_PRIORITY;
	switch (priority) {
	case 0:
		pr = java.lang.Thread.MIN_PRIORITY;
		break;
	case 1:
		pr = java.lang.Thread.NORM_PRIORITY;
		break;
	case 2:
		pr = java.lang.Thread.MAX_PRIORITY;
		break;
	}
	thread.setPriority(pr)
	thread.start()
}

/**
 * Get the path seperator based on system ( / or \ )
 * 
 * @public
 * @return {String}
 * @properties={typeid:24,uuid:"96C9F8A4-23A9-4138-8EAB-E7BB0F24122D"}
 */
function getFileSeperator()
{
	return java.io.File.separator;
}
