/**
 * Tests inheritance
 *
 * @param {String} errorMessage
 * @param {Number} code
 *
 * @constructor
 * @extends {scopes.svyExceptions.IllegalArgumentException}
 *
 *
 * @properties={typeid:24,uuid:"36352A57-C0A7-491F-B614-03A1CF75D58C"}
 */
function TestException(errorMessage, code) {
	this.code = code
	scopes.svyExceptions.IllegalArgumentException.call(this, errorMessage);
}

/**
 * Tests inheritance
 *
 * @param {String} errorMessage
 * @param {Number} code
 *
 * @constructor
 * @extends {TestException}
 *
 *
 * @properties={typeid:24,uuid:"042CCEAC-4579-43AC-9B4F-969D4EF0B376"}
 */
function ExtendedTestException(errorMessage, code) {
	TestException.call(this, errorMessage, code);
}

/**
 * @properties={typeid:35,uuid:"E21D3998-7FF8-4A87-8773-15F6B3C41094",variableType:-4}
 */
var initTestExceptions = (function(){
	TestException.prototype = Object.create(scopes.svyExceptions.IllegalArgumentException.prototype);
	TestException.prototype.constructor = scopes.svyExceptions.IllegalArgumentException
	ExtendedTestException.prototype = Object.create(TestException.prototype); //new TestException;
	ExtendedTestException.prototype.constructor = ExtendedTestException
}())

/**
 * @properties={typeid:24,uuid:"9A19D2B3-0124-4C45-9A13-F8ADC7982B70"}
 */
function testExceptions() {
	//for the used technique here, see: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	var e = new scopes.svyExceptions.IllegalArgumentException('test');
	jsunit.assertTrue(e instanceof scopes.svyExceptions.SvyException);
	jsunit.assertEquals('test', e.getMessage()); 

	e = new scopes.svyExceptions.IllegalArgumentException('test');
	jsunit.assertTrue(e instanceof Error);
	jsunit.assertEquals('test', e.getMessage()); 
	
	e = new scopes.svyExceptions.IllegalStateException('test');
	jsunit.assertTrue(e instanceof scopes.svyExceptions.SvyException);
	jsunit.assertEquals('test', e.getMessage()); 
	
	e = new scopes.svyExceptions.UnsupportedOperationException('test');
	jsunit.assertTrue(e instanceof scopes.svyExceptions.SvyException);
	jsunit.assertEquals('test', e.getMessage()); 
	
	e = new TestException('test', 1);
	jsunit.assertTrue(e instanceof scopes.svyExceptions.SvyException);
	jsunit.assertTrue(e instanceof scopes.svyExceptions.IllegalArgumentException);
	jsunit.assertTrue(e instanceof TestException);
	jsunit.assertEquals('test', e.getMessage()); 
	jsunit.assertEquals(1, e.code); 

	e = new ExtendedTestException('test', 1);
	jsunit.assertTrue(e instanceof scopes.svyExceptions.SvyException);
	jsunit.assertTrue(e instanceof scopes.svyExceptions.IllegalArgumentException);
	jsunit.assertTrue(e instanceof TestException);
	jsunit.assertEquals('test', e.getMessage()); 
	jsunit.assertEquals(1, e.code); 
	jsunit.assertEquals('ExtendedTestException', e.constructor['name']); 
	
	try {
		throw e;
	} catch (ex) {
		jsunit.assertEquals('ExtendedTestException: test', ex.toString())
		jsunit.assertTrue('Stack property filled', ex.stack !== null)
		application.output(ex.stack)
		var stack = ex.stack.split(/\r\n|\n|\r/)

		/** @type {String} */
		var path = stack[0]
		jsunit.assertNotNull(path.match(/^\tat/))
		jsunit.assertNotNull(path.match(/svyExceptions_test/g)) //Checks for the presence of the scopeName
		jsunit.assertNotNull(path.match(/:\d+/g)) //Check if a lineNumber is present (contains a colon followed by an integer)
		jsunit.assertNotNull(path.match(/\(testExceptions\)$/g)) //Check if ends with the methodName between parenthesis
		
		jsunit.assertEquals('ExtendedTestException', e.name);
		jsunit.assertEquals('test', e.getMessage());
		jsunit.assertEquals('test', e.message);
		jsunit.assertEquals(1, e.code);
		
//		application.output(ex.fileName)
//		application.output(ex.lineNumber)
//		application.output(ex.columnNumber)
	}
}