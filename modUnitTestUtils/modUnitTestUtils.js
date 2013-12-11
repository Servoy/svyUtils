/**
 * @type {Object<Array<String>>}
 * @properties={typeid:35,uuid:"B83D37F7-2FCD-4789-8095-60FA6C885DB6",variableType:-4}
 */
var logMessages = {
	DEFAULT: []
}

/**
 * Appender to writes log messages to this scope's logMessages variable<br>
 * </br>
 * The name of the appender as specified in the config will be used to namespace the log messages inside the logMessages variable
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * @constructor 
 * @extends {scopes.svyLogManager.AbstractAppender}
 *
 * @properties={typeid:24,uuid:"71696ECF-E366-4C6B-9424-11D6065CEA9F"}
 */
function TestAppender() {
	scopes.svyLogManager.AbstractAppender.call(this);
	
	/**
	 * @param {scopes.svyLogManager.LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return 
		}
        var msg = this.layout.format(loggingEvent)
        if (loggingEvent.exception) {
        	msg += '\n' + loggingEvent.exception.name + ': ' + loggingEvent.exception.message + '\n' + loggingEvent.exception['stack']
        }
        if (this.getName() && !logMessages.hasOwnProperty(this.getName())) {
        	logMessages[this.getName()] = []
        }
        var name = this.getName()||'DEFAULT'
        logMessages[name].push(msg)
    }
	
    this.toString = function() {
    	return 'TestAppender'
    }
}

/**
 * @private
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"19146600-DC76-4AD8-9928-31EAF0AE404A",variableType:-4}
 */
var initTestAppender = (function(){
	TestAppender.prototype = new scopes.svyLogManager.AbstractAppender() 
	TestAppender.prototype.constructor = TestAppender
	
	TestAppender.PluginFactory = {
		parameters: [{
				configName: 'name',
				type: 'string'
			},
			{
				configName: 'Layout',
				type: scopes.svyLogManager.AbstractLayout
			}
		],
		/**
		 * @param {scopes.svyLogManager.AbstractLayout} layout
		 */
		create: function(name, layout) {
			var retval = new TestAppender()
			retval.setName(name)
			retval.setLayout(layout)
			return retval
		}
	}
}())
