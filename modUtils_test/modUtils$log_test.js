/**
 * @properties={typeid:35,uuid:"B83D37F7-2FCD-4789-8095-60FA6C885DB6",variableType:-4}
 */
var logMessages = []

/**
 * Simple Appender that performs application.output<br>
 * <br>
 * Logs the Level.ALL and Level.TRACE as Level.DEBUG<br>
 * <br>
 * @private 
 * @constructor 
 * @extends {scopes.modUtils$log.AbstractAppender}
 *
 * @properties={typeid:24,uuid:"71696ECF-E366-4C6B-9424-11D6065CEA9F"}
 */
function TestAppender() {
	 scopes.modUtils$log.AbstractAppender.call(this);
	
	/**
	 * @param {scopes.modUtils$log.LoggingEvent} loggingEvent
	 */
	this.append = function(loggingEvent) {
		var lvl = loggingEvent.level.intLevel
		if (lvl < LOGGINGLEVEL.DEBUG) { //All or TRACE
			lvl = LOGGINGLEVEL.DEBUG
		} else if (lvl > LOGGINGLEVEL.FATAL) { //OFF
			return 
		}
		/*
         * By default Servoy logs in different way, depending on the type of client and the type of output
         * - In Smart Client (J2DBClient.java) System.out/err.println is used
         * - In Web Client (SessionClient.java) it is delegated to Debug.java, which instantiates a log4j Logger, through org.apache.commons.logging.LogFactory for the com.servoy.j2db.util.Debug class
         * - In Debug clients output is also redirected to the DBPGDebugger, which prints it to the console in Eclipse
         * 
         * This appender should use internal API directly to reduce overhead:
         * - If in Developer post formatted message directly to DBPGDebugger using the defined format
         * - If in Smart Client, post formatted message directly to System.out/err.println
         * - If in Web Client, post through relevant Debug method directly
         * 
         * Then there's also the Public Java API to report errors/warnings etc.
         */
        var msg = this.layout.format(loggingEvent)
        if (loggingEvent.exception) {
        	msg += '\n' + loggingEvent.exception.name + ': ' + loggingEvent.exception.message + '\n' + loggingEvent.exception['stack']
        }
        logMessages.push(msg)
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
	TestAppender.prototype = new scopes.modUtils$log.AbstractAppender() 
	TestAppender.prototype.constructor = TestAppender
	
	TestAppender.PluginFactory = {
		parameters: [{
				configName: 'Layout',
				type: scopes.modUtils$log.AbstractLayout
			}
		],
		/**
		 * @param {scopes.modUtils$log.AbstractLayout} layout
		 */
		create: function(layout) {
			var retval = new TestAppender()
			retval.setLayout(layout)
			return retval
		}
	}
}())

/**
 * @properties={typeid:24,uuid:"D053F14A-4CCD-493F-90DE-A2699169F1B7"}
 */
function testLogManager() {
	var config = {
	 status: "error", 
	 plugins: 'scopes.modUtils$log_test.TestAppender',
	 appenders: [
	   {
	     type: "scopes.modUtils$log_test.TestAppender", 
	     name: "ApplicationOutputAppender", 
	     PatternLayout: { 
	       pattern: "%5level %logger{1.} - %msg" 
	     }
	   }
	 ],
	 loggers: {
	   logger: [
	     {
	       name: "com.servoy.bap.test", 
	       level: "debug", 
	       additivity: false, 
	       AppenderRef: {
	         ref: "ApplicationOutputAppender"
	       }
	     },
	     {
		       name: "com.servoy.bap.test.2", 
		       level: "info", 
		       additivity: true, 
		       AppenderRef: {
		         ref: "ApplicationOutputAppender"
		       }
		     }
	   ],
	   root: { 
	     level: "error", 
	       AppenderRef: { 
	         ref: "ApplicationOutputAppender" 
	       }
	     }
	   }
	 }
	scopes.modUtils$log.loadConfig(config)

	var parentLogger = scopes.modUtils$log.getLogger('com.servoy.bap')
	var testLogger = scopes.modUtils$log.getLogger('com.servoy.bap.test')
	var testLogger2 = scopes.modUtils$log.getLogger('com.servoy.bap.test.2')
	var childLogger = scopes.modUtils$log.getLogger('com.servoy.bap.test.child')
	
	//Test plain debug message
	logMessages.length = 0
	testLogger.debug('hello')
	jsunit.assertEquals(1, logMessages.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello', logMessages[0])

	//Test additivity and level filtering
	logMessages.length = 0
	testLogger2.info('hello')
	/* Fails because the testLogger2 logs directly to the appender of the RootLogger, bypassing any level checks based on the config of the RootLogger.
	 * Looking at the info on the web, this is correct through.
	 * If info messages are not needed in the appender attached to the RootLogger, a ThresholdFilter could be added to the Appender config,
	 * but we don;t support Filters right now
	 * Another option is adding a level to the AppenderRef, but it is then possible that 2 Loggers use the same named Appender with a different Level settings...
	 * See https://issues.apache.org/jira/browse/LOG4J2-60 and http://stackoverflow.com/questions/16042628/log4j2-configuration 
	 */
	jsunit.assertEquals(1, logMessages.length) 

	//Test additivity and level filtering
	logMessages.length = 0
	testLogger2.error('hello')
	jsunit.assertEquals(2, logMessages.length)
}
