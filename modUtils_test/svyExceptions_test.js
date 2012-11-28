/**
 * @properties={typeid:24,uuid:"9A19D2B3-0124-4C45-9A13-F8ADC7982B70"}
 */
function testExceptionHierarchy() {
	//for the used technique here, see: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	
	function TestException(message) {
		scopes.svyExceptions.SvyException.call(this, message);
	}

	TestException.prototype = new scopes.svyExceptions.SvyException();

	var x = new TestException('testing')
	
	jsunit.assertTrue(x instanceof TestException)
	jsunit.assertTrue(x instanceof scopes.svyExceptions.SvyException)
	
	
	jsunit.assertEquals('testing',x.message)
}