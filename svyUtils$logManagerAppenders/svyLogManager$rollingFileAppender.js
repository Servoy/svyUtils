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
 * Example configuration for logging to a file. The configuration below
 * will write all logging output of any logger to the console and the log file
 * 
 * Please make sure the datasource and dbMapping match your table
 * 
 * scopes.svyLogManager.loadConfig({
 * 		status: "error",
 * 		plugins: 'scopes.svyLogManager$rollingFileAppender.RollingFileAppender',
 * 		appenders: [{
 * 			type: "ApplicationOutputAppender",
 * 			name: "ApplicationOutput",
 * 			PatternLayout: {
 * 				pattern: "%5level %logger{1.} - %msg"
 * 			}
 * 		}, {
 * 			type: "scopes.svyLogManager$rollingFileAppender.RollingFileAppender",
 * 			name: "RollingFileAppender",
 * 			fileName: "logs/application.log",
 * 			maxFileSize: 10 * 1024 * 1024,
 * 			maxBackupIndex: 5,
 * 			PatternLayout: {
 * 				pattern: "%date %5level %30logger - %msg"
 * 			}
 * 		}],
 * 		loggers: {
 * 			root: {
 * 				level: "warn",
 * 				AppenderRef: [{ref: "RollingFileAppender"}, {ref: "ApplicationOutput"}]
 * 			}
 * 		}
 * 	});
 * 
 */

/**
 * Simple Appender that logs to files, optionally keeping a number of backups when the max file size is reached<br>
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * @constructor
 * @extends {scopes.svyLogManager.AbstractAppender}
 *
 * @param {String} fileName
 * @param {Number} maxFileSize
 * @param {Number} maxBackupIndex
 *
 * @properties={typeid:24,uuid:"9C2D8753-F61A-4638-8D39-0ECE80CD1CCE"}
 */
function RollingFileAppender(fileName, maxFileSize, maxBackupIndex) {
	scopes.svyLogManager.AbstractAppender.call(this);

	/**
	 * Log file name
	 */
	this.fileName = fileName;
	
	/**
	 * Maximum file size
	 */
	this.maxFileSize = maxFileSize ? maxFileSize : 10485760;
	
	/**
	 * Maximum number of backups
	 */
	this.maxBackupIndex = maxBackupIndex >= 0 ? maxBackupIndex : 5;
	
	/**
	 * Next rollover
	 */
	this.nextRollover = 0;
	
	/**
	 * The current size of the file
	 */
	this.fileSize = 0;
	
	/**
	 * @type {java.io.OutputStreamWriter}
	 */
	this.writer = null;
	
}

/**
 * @private
 *
 * @type {Object}
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"135811BC-7D8F-4233-BF25-54F7314895FC",variableType:-4}
 */
var initRollingFileAppender = (/** @constructor */ function() {
		RollingFileAppender.prototype = Object.create(scopes.svyLogManager.AbstractAppender.prototype);
		RollingFileAppender.prototype.constructor = RollingFileAppender;

		/**
		 * @this {RollingFileAppender}
		 * @param {String} fileName
		 * @param {boolean} append
		 */
		RollingFileAppender.prototype.setFile = function(fileName, append) {
			try {
				var logger = scopes.svyLogManager.getStatusLogger();
				if (this.writer != null) {
					this.writer.close();
				}
				this.fileName = utils.stringTrim(fileName);
				var file = plugins.file.convertToJSFile(this.fileName);
				if (append) {
					this.fileSize = file.size();
				} else {
					logger.debug("No backups set; deleting log file " + file);
					file.deleteFile();
					this.fileSize = 0;
				}
				var fos = new java.io.FileOutputStream(this.fileName, true);
				this.writer = new java.io.OutputStreamWriter(fos, "UTF-8");
				logger.debug("Now using file " + this.fileName + " at " + file.getAbsolutePath());
			} catch (e) {
				var parentName = file.getParent();
				if (parentName != null) {
					var parentDir = plugins.file.convertToJSFile(parentName);
					if (!parentDir.exists() && parentDir.mkdirs()) {
						fos = new java.io.FileOutputStream(this.fileName, append);
						this.writer = new java.io.OutputStreamWriter(fos, "UTF-8");
					} else {
						throw e;
					}
				} else {
					throw e;
				}
			}
		}

		/**
		 * @this {RollingFileAppender}
		 */
		RollingFileAppender.prototype.rollOver = function() {
			var target;
			var file;

			var logger = scopes.svyLogManager.getStatusLogger();

			logger.debug("rolling over count=" + this.fileSize);
			// if operation fails, do not roll again until
			// maxFileSize more bytes are written
			this.nextRollover = this.fileSize + this.maxFileSize;
			logger.debug("maxBackupIndex=" + this.maxBackupIndex);

			var renameSucceeded = true;
			// If maxBackups <= 0, then there is no file renaming to be done.
			if (this.maxBackupIndex > 0) {
				// Delete the oldest file
				file = plugins.file.convertToJSFile(this.fileName + '.' + this.maxBackupIndex);
				if (file.exists()) {
					logger.debug("Deleting oldest backup file " + file);
					renameSucceeded = file.deleteFile();
				}
				// Map {(maxBackupIndex - 1), ..., 2, 1} to {maxBackupIndex, ..., 3, 2}
				for (var i = this.maxBackupIndex - 1; i >= 1 && renameSucceeded; i--) {
					file = plugins.file.convertToJSFile(this.fileName + "." + i);
					if (file.exists()) {
						target = plugins.file.convertToJSFile(this.fileName + '.' + (i + 1));
						logger.debug("Renaming file " + file + " to " + target);
						renameSucceeded = file.renameTo(target);
					}
				}

				if (renameSucceeded) {
					// Rename fileName to fileName.1
					target = plugins.file.convertToJSFile(this.fileName + "." + 1);

					this.writer.close(); // keep windows happy.

					file = plugins.file.convertToJSFile(this.fileName);
					logger.debug("Renaming file " + file + " to " + target);
					renameSucceeded = file.renameTo(target);
					// if file rename failed, reopen file with append = true
					if (!renameSucceeded) {
						try {
							this.setFile(this.fileName, true);
						} catch (e) {
							logger.error("setFile(" + this.fileName + ", true) call failed.", e);
						}
					}
				}
			}

			// if all renames were successful, then
			if (renameSucceeded) {
				try {
					this.setFile(this.fileName, false);
					this.nextRollover = 0;
				} catch (e) {
					logger.error("setFile(" + this.fileName + ", false) call failed.", e);
				}
			}
		}

		/**
		 * @this {RollingFileAppender}
		 * @param {scopes.svyLogManager.LoggingEvent} loggingEvent
		 */
		RollingFileAppender.prototype.append = function(loggingEvent) {
			var lvl = loggingEvent.level.intLevel
			if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
				lvl = LOGGINGLEVEL.DEBUG
			} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
				return
			}

			try {
				var msgToWrite = this.layout.format(loggingEvent) + "\r\n";
				this.writer.append(msgToWrite);
				this.fileSize += msgToWrite.length;
				this.writer.flush();
				if (this.fileSize >= this.maxFileSize && this.fileSize >= this.nextRollover) {
					this.rollOver();
				}
			} catch (e) {
				scopes.svyLogManager.getStatusLogger().error("RollingFileAppender error writing to log file", e);
			}
		}

		RollingFileAppender.prototype.toString = function() {
			return 'RollingFileAppender'
		}

		RollingFileAppender.PluginFactory = {
			parameters: [{
				configName: 'name',
				type: 'string'
			}, {
				configName: 'Layout',
				type: scopes.svyLogManager.AbstractLayout
			}, {
				configName: 'fileName',
				type: 'string'
			}, {
				configName: 'maxFileSize',
				type: 'int'
			}, {
				configName: 'maxBackupIndex',
				type: 'int'
			}],

			/**
			 * @param {String} name
			 * @param {scopes.svyLogManager.AbstractLayout} layout
			 * @param {String} fileName
			 * @param {Number} [maxFileSize]
			 * @param {Number} [maxBackupIndex]
			 * @return {RollingFileAppender}
			 */
			create: function(name, layout, fileName, maxFileSize, maxBackupIndex) {
				var retval = new RollingFileAppender(fileName, maxFileSize, maxBackupIndex);
				retval.setName(name)
				retval.setLayout(layout)
				retval.setFile(fileName, true);
				return retval
			}
		}
}())