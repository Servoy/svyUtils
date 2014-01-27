/**
 * @properties={typeid:24,uuid:"D053F14A-4CCD-493F-90DE-A2699169F1B7"}
 */
function testLogManager() {
	var config = {
		status: "error",
		plugins: 'scopes.svyUnitTestUtils.TestAppender',
		appenders: [{
			type: "scopes.svyUnitTestUtils.TestAppender",
			name: "ApplicationOutputAppender",
			PatternLayout: {
				pattern: "%5level %logger{1.} - %msg"
			}
		}],
		loggers: {
			logger: [{
				name: "com.servoy.bap.test",
				level: "debug",
				additivity: false,
				AppenderRef: {
					ref: "ApplicationOutputAppender"
				}
			}, {
				name: "com.servoy.bap.test.2",
				level: "info",
				additivity: true,
				AppenderRef: {
					ref: "ApplicationOutputAppender"
				}
			}],
			root: {
				level: "error",
				AppenderRef: {
					ref: "ApplicationOutputAppender"
				}
			}
		}
	}
	scopes.svyLogManager.loadConfig(config)

	var parentLogger = scopes.svyLogManager.getLogger('com.servoy.bap')
	var testLogger = scopes.svyLogManager.getLogger('com.servoy.bap.test')
	var testLogger2 = scopes.svyLogManager.getLogger('com.servoy.bap.test.2')
	var childLogger = scopes.svyLogManager.getLogger('com.servoy.bap.test.child')

	//Test plain debug message
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	testLogger.debug('hello')
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])

	//Test additivity and level filtering
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	testLogger2.info('hello')
	/* Fails because the testLogger2 logs directly to the appender of the RootLogger, bypassing any level checks based on the config of the RootLogger.
	 * Looking at the info on the web, this is correct through.
	 * If info messages are not needed in the appender attached to the RootLogger, a ThresholdFilter could be added to the Appender config,
	 * but we don;t support Filters right now
	 * Another option is adding a level to the AppenderRef, but it is then possible that 2 Loggers use the same named Appender with a different Level settings...
	 * See https://issues.apache.org/jira/browse/LOG4J2-60 and http://stackoverflow.com/questions/16042628/log4j2-configuration
	 */
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)

	//Test additivity and level filtering
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	testLogger2.error('hello')
	jsunit.assertEquals(2, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
}
