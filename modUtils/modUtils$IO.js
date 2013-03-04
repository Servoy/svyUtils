/**
 * <pre>Opens a file from the file system using the default viewer for the fileType on the current platform. (.txt with editor, .pdf with pdf reader, .doc with word, etc.)
 * 
 * TODO: Support opening in the WC: either plugins.file.writeFile, but required to read the content first or showUrl, if file is accessible from the outside (see deprecated globals.svy_utl_open_file())
 * TODO: test Linux support: SampleCode suggests using xdg-open here: https://www.servoy.com/forum/viewtopic.php?f=15&t=15237&p=81646&hilit=application+getosname+and+linux#p81653
 * TODO param {String} [mimeType] Required for usage in the Web Client. Used by the browser to determine how to open the file
 * </pre> 
 * @param {plugins.file.JSFile|String} file The file that will be opened
 *
 * @properties={typeid:24,uuid:"95C45F79-F469-4542-BB8B-BE226010D8B1"}
 */
function openFileWithDefaultViewer(file) {
	if (!scopes.modUtils$system.isSwingClient()) {
		throw new scopes.modUtils$exceptions.UnsupportedOperationException('Operation only supported in Smart or Runtime Client')
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
 * @properties={typeid:24,uuid:"1453D732-A0CE-46B0-9EEE-81D656E61940"}
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
		var zipFile = new java.util.zip.ZipFile(fileToUnzip.getAbsolutePath());
		var zipEntries = zipFile.entries();
		
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
 * @properties={typeid:24,uuid:"9D6CECAE-ACD0-497F-9994-355861A2DE24"}
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
 * Reads the content of a file line by line, without reading the entire file into memory
 * TODO: rethrow exceptions
 * @param {plugins.file.JSFile} file
 * @param {Function} lineCallback function that gets called for each line. Receives the line content as first argument. Return false from the callback to stop further reading
 * 
 * @example <pre>
 * 
 * </pre>
 *
 * @properties={typeid:24,uuid:"B288B4EC-BC90-4ABA-9C2E-E45E600BF7D6"}
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
     } catch (e) {
        application.output('ERROR reading file "' + file.getName() + '": ' + e, LOGGINGLEVEL.ERROR);
     } finally {
        br.close();
     	fis = null;
     	isr = null;
     	br = null;
     }
}

/**
 * @param {plugins.file.JSFile} file
 * @return {Number} The number of lines in the file. -1 in case of an issue getting the number of lines in the file
 * @properties={typeid:24,uuid:"EEFD9AA1-68B5-4DD9-8C4D-AE0EE2488F28"}
 */
function getLineCountForFile(file) {
	try {
		var fr = new Packages.java.io.FileReader(file);
		var lnr = new Packages.java.io.LineNumberReader(fr)
		while (lnr.readLine() != null) {
		}
	    return lnr.getLineNumber(); 
	} catch (e) {
        application.output('ERROR getting max lines for file "' + file.getName() + '": ' + e, LOGGINGLEVEL.ERROR);
	} finally {
		lnr.close();
		fr.close()
	}
	return -1
}

/**
 * Returns true if the given file is currently opened by the user
 * 
 * @param {plugins.file.JSFile} file
 * 
 * @author patick
 * @since 11.09.2012
 *
 * @properties={typeid:24,uuid:"61CAFF50-B7A8-499D-8008-4B8457A3E2F6"}
 */
function isFileOpen(file) {
	var result;
	if (scopes.modUtils$system.isWindowsPlatform()) {
		if (!file.canWrite()) {
			return true;
		}
		var originalfilePath = file.getAbsolutePath();
		var parentFolder = file.getParentFile().getAbsolutePath();
		var testFileName = application.getUUID().toString();
		var newName = parentFolder + "\\" + testFileName;
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
		result = application.executeProgram("lsof", [file.getAbsolutePath()]);
		if (result && result.length > 0) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * The given file could not be found
 *
 * @param {String} [errorMessage]
 * @param {plugins.file.JSFile} [file]
 *
 * @constructor
 * @this {FileNotFoundException}
 * @properties={typeid:24,uuid:"9C109983-5E2B-4549-9431-E039E7CFACCD"}
 */
function FileNotFoundException(errorMessage, file) {

	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	scopes.modUtils$exceptions.SvyException.call(this, errorMessage);
}

/*
 * TODO: add file writer stuff:
 * - https://www.servoy.com/forum/viewtopic.php?f=22&t=13866&p=72648&hilit=java.io.filewriter#p72637
 * - https://www.servoy.com/forum/viewtopic.php?t=6391
 */