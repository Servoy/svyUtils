/**
 * @properties={typeid:24,uuid:"9A19D2B3-0124-4C45-9A13-F8ADC7982B70"}
 */
function testExceptions() {
	//for the used technique here, see: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	var e = new scopes.modUtils$exceptions.IllegalArgumentException('test');
	jsunit.assertTrue(e instanceof scopes.modUtils$exceptions.SvyException);
	jsunit.assertEquals(e.getMessage(),'test'); // TODO: This warning should be fixed in Svy 7.0
	e = new scopes.modUtils$exceptions.IllegalStateException('test');
	jsunit.assertTrue(e instanceof scopes.modUtils$exceptions.SvyException);
	jsunit.assertEquals(e.getMessage(),'test'); // TODO: This warning should be fixed in Svy 7.0
	e = new scopes.modUtils$exceptions.UnsupportedOperationException('test');
	jsunit.assertTrue(e instanceof scopes.modUtils$exceptions.SvyException);
	jsunit.assertEquals(e.getMessage(),'test'); // TODO: This warning should be fixed in Svy 7.0
}