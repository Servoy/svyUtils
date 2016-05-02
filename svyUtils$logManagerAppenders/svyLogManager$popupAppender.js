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
 * 		plugins: 'scopes.svyLogManager$popupAppender.PopupAppender',
 * 		appenders: [{
 * 			type: "ApplicationOutputAppender",
 * 			name: "ApplicationOutput",
 * 			PatternLayout: {
 * 				pattern: "%5level %logger{1.} - %msg"
 * 			}
 * 		}, {
 *			type: "scopes.svyLogManager$popupAppender.PopupAppender",
 *			name: "PopupAppender",
 *			style: 'test',
 *			maxMessages: 200,
 *			lazyInit: true,
 *			initiallyMinimized: false,
 *			newestMessageAtTop: false,
 *			PatternLayout: {
 *				pattern: "%d{HH:mm:ss,SSS} %8level %20logger{5.} - %msg"
 *			}
 * 		}],
 * 		loggers: {
 * 			root: {
 * 				level: "warn",
 * 				AppenderRef: [{ref: "PopupAppender"}, {ref: "ApplicationOutput"}]
 * 			}
 * 		}
 * 	});
 * 
 */

/**
 * @private
 * 
 * @type {Object<{isShown: Boolean, appender: PopupAppender, window: JSWindow}>}
 *
 * @properties={typeid:35,uuid:"5E5E4E7D-DCB2-4D11-A63E-170CBAE9B4EE",variableType:-4}
 */
var popups = {};

/**
 * Simple Appender that logs to files, optionally keeping a number of backups when the max file size is reached<br>
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * @constructor
 * @extends {scopes.svyLogManager.AbstractAppender}
 *
 * @properties={typeid:24,uuid:"209CBC1F-CBF9-4EFE-866C-74A11495E376"}
 */
function PopupAppender() {
	scopes.svyLogManager.AbstractAppender.call(this);

	/**
	 * Set this to true to open the pop-up only when the first log 
	 * message reaches the appender. Otherwise, the pop-up window 
	 * opens as soon as the appender is created. If not specified, 
	 * defaults to false.
	 * @type {Boolean}
	 */
	this.lazyInit = false;
	
	/**
	 * Whether the console window should start off hidden / minimized. 
	 * If not specified, defaults to false.
	 */
	this.initiallyMinimized = false;
	
	/**
	 * The outer width in pixels of the pop-up window. 
	 * If not specified, defaults to 600
	 * @type {Number}
	 */
	this.width = 600;
	
	/**
	 * The outer height in pixels of the pop-up window. 
	 * If not specified, defaults to 400.
	 * @type {Number}
	 */
	this.height = 400;
	
	/**
	 * The name of the style of the form
	 * @type {String}
	 */
	this.styleName = null;
	
	/**
	 * The name of the style class of the form
	 * @type {String}
	 */
	this.styleClass = null;
	
	/**
	 * Whether to display new log messages at the top inside the pop-up window
	 * @type {Boolean}
	 */
	this.newestMessageAtTop = false;
	
	/**
	 * The maximum number of messages held in the stack
	 * Set this to 0 or -1 if you want unlimited messages 
	 * @type {Number}
	 */
	this.maxMessages = 1000;
	
	/**
	 * The message stack
	 * @type {Array<String>}
	 */
	this.msgStack = [];
	
}

/**
 * @private
 * @param {PopupAppender} appender
 *
 * @properties={typeid:24,uuid:"44DC43AE-DDE2-40D8-AF4C-AD97D39A8A2A"}
 */
function buildPopupForm(appender) {
	if (popups && popups.hasOwnProperty(appender.appenderName)) {
		return;
	}
	var jsForm = solutionModel.newForm('svyLogManager_' + appender.getName(), null, null, false, appender.width, appender.height);
	jsForm.navigator = SM_DEFAULTS.NONE;
	jsForm.newVariable('popupAppenderMessages', JSVariable.TEXT);
	jsForm.newField('popupAppenderMessages', JSField.TEXT_AREA, 0, 0, appender.width, appender.height);
	if (appender.styleName) jsForm.styleName = appender.styleName;
	if (appender.styleClass) jsForm.styleClass = appender.styleClass;
	popups[appender.appenderName] = {isShown: false, appender: appender, window: application.createWindow('svyLogManager_' + appender.appenderName, JSWindow.WINDOW)};
}

/**
 * @private
 *
 * @type {Object}
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"A94BF9BD-944A-4642-9F3D-D5EDC0521510",variableType:-4}
 */
var initPopupAppender = (function() {
	PopupAppender.prototype = Object.create(scopes.svyLogManager.AbstractAppender.prototype);
	PopupAppender.prototype.constructor = PopupAppender;

	/**
	 * @this {PopupAppender}
	 * @param {scopes.svyLogManager.LoggingEvent} loggingEvent
	 */
	PopupAppender.prototype.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return
		}

		var msgToWrite = this.layout.format(loggingEvent);
		if (this.newestMessageAtTop) {
			if (this.msgStack.length >= this.maxMessages) {
				this.msgStack.pop();
			} 
			this.msgStack.unshift(msgToWrite);
		} else {
			if (this.msgStack.length >= this.maxMessages) {
				this.msgStack.shift();
			}
			this.msgStack.push(msgToWrite);
		}
		
		if (!popups[this.appenderName]) {
			buildPopupForm(this);
		}
		
		if (popups[this.appenderName] && popups[this.appenderName].window.isVisible()) {
			if (this.newestMessageAtTop) {
				forms['svyLogManager_' + this.appenderName]['popupAppenderMessages'] = msgToWrite + '\n' + forms['svyLogManager_' + this.appenderName]['popupAppenderMessages']
			} else {
				forms['svyLogManager_' + this.appenderName]['popupAppenderMessages'] += (forms['svyLogManager_' + this.appenderName]['popupAppenderMessages'] == null ? '' : '\n') + msgToWrite
			}
		}
		
		if (popups[this.appenderName] && !popups[this.appenderName].isShown && this.initiallyMinimized == false) {
			this.show();
		}
	}

	/**
	 * @this {PopupAppender}
	 */
	PopupAppender.prototype.show = function() {
		buildPopupForm(this);
		if (popups[this.appenderName].window) {
			application.output(this.msgStack.length);
			forms['svyLogManager_' + this.appenderName]['popupAppenderMessages'] = this.msgStack.join('\n');
			popups[this.appenderName].window.show(forms['svyLogManager_' + this.appenderName]);
			popups[this.appenderName].isShown = true;
		}
	}

	/**
	 * Returns the message stack
	 * @return {Array<String>}
	 * @this {PopupAppender}
	 */
	PopupAppender.prototype.getMessageStack = function() {
		return this.msgStack;
	}	

	/**
	 * Hides the popup window
	 * @this {PopupAppender}
	 */
	PopupAppender.prototype.hide = function() {
		if (popups[this.appenderName].window) popups[this.appenderName].window.hide();
	}

	/**
	 * Set this to true to open the pop-up only when the first log 
	 * message reaches the appender. Otherwise, the pop-up window 
	 * opens as soon as the appender is created. If not specified, 
	 * defaults to false.
	 * @param {Boolean} lazyInit
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setLazyInit = function(lazyInit) {
		this.lazyInit = lazyInit;
		return this;		
	}

	/**
	 * Whether the console window should start off hidden / minimized. 
	 * If not specified, defaults to false.
	 * @param {Boolean} initiallyMinimized
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setInitiallyMinimized = function(initiallyMinimized) {
		this.initiallyMinimized = initiallyMinimized;
		return this;		
	}

	/**
	 * The maximum number of messages held in the stack
	 * Set this to 0 or -1 if you want unlimited messages 
	 * @param {Number} maxMessages
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setMaxMessages = function(maxMessages) {
		this.maxMessages = maxMessages;
		return this;
	}	

	/**
	 * Whether to display new log messages at the top inside the pop-up window
	 * @param {Boolean} newestMessageAtTop
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setNewestMessageAtTop = function(newestMessageAtTop) {
		this.newestMessageAtTop = newestMessageAtTop;
		return this;
	}	

	/**
	 * The outer width in pixels of the pop-up window. If not specified, defaults to 600
	 * @param {Number} width
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setWidth = function(width) {
		this.width = width;
		return this;		
	}	

	/**
	 * The outer height in pixels of the pop-up window. If not specified, defaults to 400. 
	 * @param {Number} height
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setHeight = function(height) {
		this.height = height;
		return this;		
	}	

	/**
	 * The name of the style of the form
	 * @param {String} style
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setStyle = function(style) {
		this.styleName = style;
		return this;		
	}	

	/**
	 * The name of the style class of the form
	 * @param {String} styleClass
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setStyleClass = function(styleClass) {
		this.styleClass = styleClass;
		return this;		
	}	

	/**
	 * The outer height in pixels of the pop-up window. If not specified, defaults to 400.
	 * @param {Number} height
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.setHeight = function(height) {
		this.height = height;
		return this;			
	}	
	
	/**
	 * Clears the message stack
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.clear = function() {
		this.msgStack = [];
		if (popups[this.appenderName]) forms['svyLogManagerPopupAppender']['popupAppenderMessages'] = '';
		return this;			
	}

	/**
	 * Brings the window to front
	 * @this {PopupAppender}
	 * @return {PopupAppender}
	 */
	PopupAppender.prototype.focus = function() {
		if (popups[this.appenderName].window) popups[this.appenderName].window.toFront();
		return this;
	}
	
	/**
	 * @this {PopupAppender}
	 */
	PopupAppender.prototype.toString = function() {
		return 'PopupAppender'
	}

	PopupAppender.PluginFactory = {
		parameters: [{
			configName: 'name',
			type: 'string'
		}, {
			configName: 'Layout',
			type: scopes.svyLogManager.AbstractLayout
		}, {
			configName: 'style',
			type: 'string'
		}, {
			configName: 'styleClass',
			type: 'string'
		}, {
			configName: 'lazyInit',
			type: 'boolean'
		}, {
			configName: 'initiallyMinimized',
			type: 'boolean'
		}, {
			configName: 'width',
			type: 'number'
		}, {
			configName: 'height',
			type: 'number'
		}, {
			configName: 'maxMessages',
			type: 'number'
		}, {
			configName: 'newestMessageAtTop',
			type: 'boolean'
		}],

		/**
		 * @param {String} name
		 * @param {scopes.svyLogManager.AbstractLayout} layout
		 * @param {String} [style]
		 * @param {String} [styleClass]
		 * @param {Boolean} [lazyInit]
		 * @param {Boolean} [initiallyMinimized]
		 * @param {Number} [width]
		 * @param {Number} [height]
		 * @param {Number} [maxMessages]
		 * @return {PopupAppender}
		 */
		create: function(name, layout, style, styleClass, lazyInit, initiallyMinimized, width, height, maxMessages) {
			var retval = new PopupAppender();
			retval.setName(name)
			if (layout) retval.setLayout(layout)
			if (lazyInit instanceof Boolean) retval.setLazyInit(lazyInit);
			if (initiallyMinimized instanceof Boolean) retval.setInitiallyMinimized(initiallyMinimized);
			if (width) retval.setWidth(width);
			if (height) retval.setHeight(height);
			if (style) retval.setStyle(style);
			if (styleClass) retval.setStyleClass(styleClass);
			if (maxMessages) retval.setMaxMessages(maxMessages);
			if (lazyInit == false) {
				retval.show();
			}
			return retval
		}
	}
}())

/**
 * Shows the given appender's popup window
 * 
 * @param {String} appenderName
 * @public 
 *
 * @properties={typeid:24,uuid:"5E9D2255-DE63-4CD8-AAEC-D7EA21B91624"}
 */
function showPopup(appenderName) {
	var appender = getAppenderByName(appenderName);
	if (appender) {
		buildPopupForm(appender);
		appender.show();
	}
}

/**
 * Hides the given appender's popup window
 * 
 * @param {String} appenderName
 * @public 
 *
 * @properties={typeid:24,uuid:"0BA0CAD8-A886-43FE-ACA0-EDEE11B96D40"}
 */
function hidePopup(appenderName) {
	var appender = getAppenderByName(appenderName);
	if (appender) appender.hide();
}

/**
 * Clears the message stack of the given appender
 * 
 * @param {String} appenderName
 * @public 
 *
 * @properties={typeid:24,uuid:"D6A7E238-791E-4F30-A95E-E66FE93E1D0F"}
 */
function clearStack(appenderName) {
	var appender = getAppenderByName(appenderName);
	if (appender) appender.clear();
}

/**
 * @private
 * @param {String} appenderName
 * @return {PopupAppender}
 * @properties={typeid:24,uuid:"A9192887-AFAB-4371-AAE0-0671E8D9F473"}
 */
function getAppenderByName(appenderName) {
	if (!popups.hasOwnProperty(appenderName)) {
		if (Object.keys(popups).length > 0) {
			return popups[0].appender;
		} else {
			return null;
		}
	} else {
		return popups[appenderName].appender;
	}
}