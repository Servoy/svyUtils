/**
 * Opens a file from the file system using the default viewer for the fileType on the current platform. (.txt with editor, .pdf with pdf reader, .doc with word, etc.)
 * TODO: Support opening in the WC: either plugins.file.writeFile, but required to read the content first or showUrl, if file is accessible from the outside
 * TODO: test Linux support: SampleCode suggests using xdg-open here: https://www.servoy.com/forum/viewtopic.php?f=15&t=15237&p=81646&hilit=application+getosname+and+linux#p81653
 * @param {plugins.file.JSFile|String} file The file that will be opened
 * @param {String} [mimeType] Required for usage in the Web Client. Used by the browser to determine how to open the file
 *
 * @properties={typeid:24,uuid:"024F1389-E679-43A1-8DE6-F8F1493D072D"}
 */
function openFileWithDefaultViewer(file, mimeType) {
	var _OS = application.getOSName();
	if (/Windows/.test(_OS)) {
		application.executeProgram('rundll32', 'url.dll, FileProtocolHandler', file);
	} else if (/Linux|Freebsd/.test(_OS)) {
		application.executeProgram('mozilla', file);
	} else if (/Mac/.test(_OS)) {
		application.executeProgram('open', file);
	}
	//What if no match?
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
 * @properties={typeid:24,uuid:"757E9367-14BB-4488-883E-BD79E6531B0B"}
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
			var zipEntryName = zipEntry.getName();
			zipEntryName = utils.stringReplace(zipEntryName, "/", java.io.File.separator);
			if (zipEntry.isDirectory()) {
				var zipDir = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntryName);
				zipDir.mkdirs();
				continue;
			} else {
				var zipFile = plugins.file.convertToJSFile(targetFile.getAbsolutePath() + fileSeparator + zipEntryName);
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
				outputChannel.close();
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
 * Zips the given file or directory<p>
 * 
 * The zip file will either be written to the given target file
 * or a zip file is created using the same name and location as the original file<p>
 * 
 * Note: if the target file already exists, it will be <b>deleted</b>
 * 
 * @param {plugins.file.JSFile} fileToZip
 * @param {plugins.file.JSFile} [targetFile]
 * @param {Array<String>} [filenamesToStoreUncompressed] array of file names that should be stored uncompressed in the archive
 * 
 * @return {plugins.file.JSFile} zipFile
 * 
 * @throws {Error}
 * 
 * @author patrick
 * @since 2012-10-15
 *
 * @properties={typeid:24,uuid:"7483C635-ACD5-42D9-9109-9B97DDE9E5AD"}
 */
function zip(fileToZip, targetFile, filenamesToStoreUncompressed) {
	var filePath = fileToZip.getAbsolutePath();
	if (!targetFile) {
		targetFile = plugins.file.convertToJSFile(filePath + ".zip");
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
					zipOutputStream.putNextEntry(new java.util.zip.ZipEntry(file.getPath().substring(base.getPath().length + 1) + "/"));
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
				entryPath = utils.stringReplace(entryPath, java.io.File.separator, "/");
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
	}
	catch(e) {
		application.output("Error zipping file \"" + fileToZip.getAbsolutePath() + "\": " + e, LOGGINGLEVEL.ERROR);
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
 * Copies streams
 * 
 * @param {java.nio.channels.ReadableByteChannel} src
 * @param {java.nio.channels.WritableByteChannel} dest
 * 
 * @private 
 * 
 * @author patrick
 * @since 2012-10-15
 *
 * @properties={typeid:24,uuid:"C59BD222-0EAF-4A35-8778-BA8D3B18B985"}
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
 * Reads the content of a file line by line, without reading the entire file into memory
 * TODO: rethrow exceptions
 * @param {plugins.file.JSFile} file
 * @param {Function} lineCallback function that gets called for each line. Receives the line content as first argument. Return false from the callback to stop further reading
 * 
 * @example <pre>
 * 
 * </pre>
 *
 * @properties={typeid:24,uuid:"46688F48-D290-464B-990F-15D28B8E3C13"}
 */
function readFile(file, lineCallback) {
    var fis = new Packages.java.io.FileInputStream(file);
    var isr = new Packages.java.io.InputStreamReader(fis, "UTF8");
    var br = new Packages.java.io.BufferedReader(isr);
    var line;
    try {
        while ((line = br.readLine())) {
            if(lineCallback(line) === false) {
            	break
            }
        }
     } catch (_oErr) {
        application.output("ERROR: " + file.getName() + " at row " + _nReadLine, LOGGINGLEVEL.ERROR);
        application.output("ERROR: " + _oErr, LOGGINGLEVEL.ERROR);
     } finally {
        br.close();
     	fis = null;
     	isr = null;
     	br = null;
     }
}

/**
 * @param {plugins.file.JSFile} file
 * @return {Number}
 * @properties={typeid:24,uuid:"E062A7C4-2347-40D4-9B1D-D8F25549B305"}
 */
function getLineCountForFile(file) {
	try {
		var fr = new Packages.java.io.FileReader(file);
		var lnr = new Packages.java.io.LineNumberReader(fr)
		while (lnr.readLine() != null) {}

	    return lnr.getLineNumber(); 
	} finally {
		lnr.close();
		fr.close()
	}
}



/**
 * Returns true if the given file is currently opened by the user
 * 
 * @param {plugins.file.JSFile} _file
 * 
 * @author patick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"F7B2C1A8-3961-48DD-89BA-D41CFE4836E9"}
 */
function isFileOpen(_file) {
	var _osName = application.getOSName();
	var _result;
	if (_osName.toLowerCase().indexOf("windows") != -1) {
		// Windows
		if (!_file.canWrite()) {
			return true;
		}
		var _originalfilePath = _file.getAbsolutePath();
		var _parentFolder = _file.getParentFile().getAbsolutePath();
		var _testFileName = application.getUUID().toString();
		var _newName = _parentFolder + "\\" + _testFileName;
		var _newFile = plugins.file.convertToJSFile(_newName);
		_result = _file.renameTo(_newName);
		if (_result) {
			_newFile.renameTo(_originalfilePath);
			return false;
		} else {
			return true;
		}
	} else {
		// Unix
		_result = application.executeProgram("lsof", _file.getAbsolutePath());
		if (_result && _result.length > 0) {
			return true;
		} else {
			return false;
		}
	}
}

/*
 * TODO: add file writer stuff:
 * - https://www.servoy.com/forum/viewtopic.php?f=22&t=13866&p=72648&hilit=java.io.filewriter#p72637
 * - https://www.servoy.com/forum/viewtopic.php?t=6391
 */