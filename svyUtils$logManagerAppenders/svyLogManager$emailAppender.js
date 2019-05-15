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
 * 		plugins: 'scopes.svyLogManager$emailAppender.EmailAppender',
 * 		appenders: [{
 * 			type: "ApplicationOutputAppender",
 * 			name: "ApplicationOutput",
 * 			PatternLayout: {
 * 				pattern: "%5level %logger{1.} - %msg"
 * 			}
 * 		}, {
 * 			type: "scopes.svyLogManager$emailAppender.EmailAppender",
 * 			name: "EmailAppender",
 * 			toAddress: "john@doe.com",
 * 			fromAddress: "john@doe.com",
 * 			subject: "Logging message from Servoy solution",
 * 			customFields: [{name: "userName", value: security.getUserName()}, {name: "ipAddress", value: application.getIPAddress()}],
 * 			PatternLayout: {
 * 				pattern: "Date: %date\nSolution: %s\nClient type: %t\nLevel: %level\nLogger: %logger\nMessage: %msg\nUser: %f{1}\nIP Address: %f{2}"		
 * 			}
 * 		}],
 * 		loggers: {
 * 			root: {
 * 				level: "warn",
 * 				AppenderRef: [{ref: "EmailAppender"}, {ref: "ApplicationOutput"}]
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
 * @param {String} toAddress
 * @param {String} fromAddress
 * @param {String} [subject]
 *
 * @properties={typeid:24,uuid:"340000E8-BD97-4501-BEF6-AB0F4172082D"}
 */
function EmailAppender(toAddress, fromAddress, subject) {
	scopes.svyLogManager.AbstractAppender.call(this);

	/**
	 * to Address
	 * @type {String}
	 */
	this.toAddress = toAddress;
	
	/**
	 * to Address
	 * @type {String}
	 */
	this.fromAddress = fromAddress;
	
	/**
	 * Static subject
	 * @type {String}
	 */
	this.subject = subject ? subject : null;
	
	/** @type {Packages.com.servoy.j2db.plugins.IClientPluginAccess} */
	this.clientPluginAccess = null;
	
}

/**
 * @private
 *
 * @type {Object}
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"679EF4BC-4CEE-40F7-A1E4-A36684085150",variableType:-4}
 */
var initEmailAppender = (/** @constructor */ function() {
	EmailAppender.prototype = Object.create(scopes.svyLogManager.AbstractAppender.prototype);
	EmailAppender.prototype.constructor = EmailAppender;

	/**
	 * @this {EmailAppender}
	 * @param {scopes.svyLogManager.LoggingEvent} loggingEvent
	 */
	EmailAppender.prototype.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return
		}

		try {
			var msgText = this.layout.format(loggingEvent);
			var from = this.fromAddress;
			var to = this.toAddress;
			var subject = this.subject;
			
			var r = new java.lang.Runnable({ 
				run: function () { 
					try {
						var success = plugins.mail.sendMail(to, from, subject, msgText);
						if (!success) {
							scopes.svyLogManager.getStatusLogger().error("Failed to send log to \"" + to + "\"");
						}
					} catch (e) {
						scopes.svyLogManager.getStatusLogger().error("EmailAppender error sending log to \"" + to + "\"", e);
					}
				}
			});
			var executor = this.clientPluginAccess;
			executor.getExecutor().execute(r);
			
		} catch (e) {
			scopes.svyLogManager.getStatusLogger().error("EmailAppender error sending log to \"" + to + "\"", e);
		}
	}

	EmailAppender.prototype.toString = function() {
		return 'EmailAppender'
	}

	EmailAppender.PluginFactory = {
		parameters: [{
			configName: 'name',
			type: 'string'
		}, {
			configName: 'Layout',
			type: scopes.svyLogManager.AbstractLayout
		}, {
			configName: 'toAddress',
			type: 'string'
		}, {
			configName: 'fromAddress',
			type: 'int'
		}, {
			configName: 'subject',
			type: 'int'
		}, {
			configName: 'customFields',
			type: 'object'
		}],

		/**
		 * @param {String} name
		 * @param {scopes.svyLogManager.AbstractLayout} layout
		 * @param {String} toAddress
		 * @param {String} [fromAddress]
		 * @param {String} [subject]
		 * @param {Array<{name: String, value: String}>} [customFields]
		 * @return {EmailAppender}
		 */
		create: function(name, layout, toAddress, fromAddress, subject, customFields) {
			var retval = new EmailAppender(toAddress, fromAddress, subject);
			retval.setName(name)
			retval.setLayout(layout)
			retval.toAddress = toAddress;
			retval.fromAddress = fromAddress;
			retval.subject = subject;
			
			if (customFields) {
				for (var i = 0; i < customFields.length; i++) {
					retval.layout.setCustomField(customFields[i].name, customFields[i].value);
				}
			}
			
			var x = new Packages.org.mozilla.javascript.NativeJavaObject(globals, plugins.window, new Packages.org.mozilla.javascript.JavaMembers(globals, Packages.com.servoy.extensions.plugins.window.WindowProvider));
			retval.clientPluginAccess = x['getClientPluginAccess']();
			
			return retval
		}
	}
}())