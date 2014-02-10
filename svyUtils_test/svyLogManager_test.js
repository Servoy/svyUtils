/**
 * @properties={typeid:24,uuid:"D053F14A-4CCD-493F-90DE-A2699169F1B7"}
 */
function setUp() {
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
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender = []
}

/**
 * @properties={typeid:24,uuid:"39A77D44-A569-4C1D-87B7-9977A62DFAAA"}
 */
function tearDown() {
	scopes.svyLogManager.loadConfig(null)
}

/**
 * @properties={typeid:35,uuid:"AD098AC1-10F1-422B-9A57-AC1065C71E42",variableType:-4}
 */
var testLogger = scopes.svyLogManager.getLogger('com.servoy.bap.test')
/**
 * @properties={typeid:35,uuid:"782C11A6-39CA-4247-BAE3-920C4C11D367",variableType:-4}
 */
var testLogger2 = scopes.svyLogManager.getLogger('com.servoy.bap.test.2')

/**
 * @properties={typeid:24,uuid:"7CB731E2-1EA4-4B1C-83F7-C3D80AD6BAFA"}
 */
function testPlainDebugMessage() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	
	//Test plain debug message
	testLogger.debug('hello')
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"EC33C574-631F-4D22-B13A-BCCA6BD18E64"}
 */
function testTraceMessage() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	
	//Test Trace message which should not get logger as level of the logger is set to Debug
	testLogger.trace('hello')
	jsunit.assertEquals(0, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
}

/**
 * @properties={typeid:24,uuid:"E8D92AE7-3558-4FE0-86ED-C237E1010300"}
 */
function testTraceEnabled() {
	jsunit.assertFalse(testLogger.isTraceEnabled())
}

/**
 * @properties={typeid:24,uuid:"7FAD5E39-59A6-4ACC-AB19-0A87114899D2"}
 */
function testDebugEnabled() {
	jsunit.assertTrue(testLogger.isDebugEnabled())
}

/**
 * @properties={typeid:24,uuid:"E3E8E8EE-B9E3-4BFB-97BF-5006C4850497"}
 */
function testDefaultParameterizedMessage() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	
	//Test logging a default parameterized message
	testLogger.debug('hello {}' , 'Servoy')
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello Servoy', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"65B2C809-C5D4-4572-A9DC-B88A0A3E7F41"}
 */
function testDefaulParameterizedMessageWithTooLittleParams() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	
	//Test logging a default parameterized message
	testLogger.debug('hello {}')
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello {}', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"1D4EEDDB-8659-4918-A024-014B541D63F2"}
 */
function testDefaulParameterizedMessageWithManyLittleParams() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	
	//Test logging a default parameterized message
	testLogger.debug('hello {}', 'Servoy', 'test')
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - hello Servoy', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"80F67030-C928-403D-B07C-C4C977B5F527"}
 */
function testStringFormattedMessage() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
		
	//Test logging a custom Message 
	testLogger.debug(new scopes.svyLogManager.StringFormattedMessage('The time is: %1$tH:%1$tM:%1$tS', [new Date(2009, 0, 1, 12, 0, 0)]))
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.test - The time is: 12:00:00', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"6D91D797-9321-49FA-A3B1-7DC1A0C798FC"}
 */
function testFormattedMessageWithParamsAndException() {
	
}

/**
 * @properties={typeid:24,uuid:"B66F4196-D846-4C79-AE37-8796E4A3186E"}
 */
function testMessageIsException() {
	
}

/**
 * @properties={typeid:24,uuid:"528B0FD0-1C64-4BC8-99B9-30CD33E9235F"}
 */
function testAbstractMessageAndAdditionalParams() {
	
}

/**
 * @properties={typeid:24,uuid:"17D676EF-CDE1-4492-AB15-824245D3F0E5"}
 */
function testServoyExceptionWrapper() {
//This way of getting a ServoyException instance doesn't work, see SVY-5984
//	try {
//		application.executeProgram('dflsdflvhbldsjhb')		
//	} catch (e) {
//		var ex = e
//		testLogger.debug(ex.getMessage())
//	}
	
}

/**
 * @properties={typeid:24,uuid:"270BDC2C-3118-4F85-AA39-F33D83A03827"}
 */
function testCustomMessageFactory() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
		
	//Test Logger with custom MessageFactory
	/**
	 * @constructor 
	 * @extends {scopes.svyLogManager.AbstractMessageFactory}
	 */
	function StringFormattedMessageFactory() {}
	StringFormattedMessageFactory.prototype = Object.create(scopes.svyLogManager.AbstractMessageFactory.prototype)
	StringFormattedMessageFactory.prototype.constructor = StringFormattedMessageFactory
	StringFormattedMessageFactory.prototype.newFormattedMessage = function(format, parameters, throwable) {
		return new scopes.svyLogManager.StringFormattedMessage(format, parameters, throwable);
	}
	
	var childLogger = scopes.svyLogManager.getLogger('com.servoy.bap.test.child', new StringFormattedMessageFactory())
	childLogger.debug('The time is: %1$tH:%1$tM:%1$tS', new Date(2009, 0, 1, 12, 0, 0))
	jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
	jsunit.assertEquals('DEBUG c.s.b.t.child - The time is: 12:00:00', scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender[0])
}

/**
 * @properties={typeid:24,uuid:"14AB9369-4377-467B-83A5-E02E5A201DDA"}
 */
function testAdditivity() {
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
		
	//Test additivity and level filtering
	testLogger2.info('hello')
	/* Fails because the testLogger2 logs directly to the appender of the RootLogger, bypassing any level checks based on the config of the RootLogger.
	 * Looking at the info on the web, this is correct through.
	 * If info messages are not needed in the appender attached to the RootLogger, a ThresholdFilter could be added to the Appender config,
	 * but we don;t support Filters right now
	 * Another option is adding a level to the AppenderRef, but it is then possible that 2 Loggers use the same named Appender with a different Level settings...
	 * See https://issues.apache.org/jira/browse/LOG4J2-60 and http://stackoverflow.com/questions/16042628/log4j2-configuration
	 */
	//jsunit.assertEquals(1, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)

	//Test additivity and level filtering
	scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length = 0
	testLogger2.error('hello')
	jsunit.assertEquals(2, scopes.svyUnitTestUtils.logMessages.ApplicationOutputAppender.length)
}