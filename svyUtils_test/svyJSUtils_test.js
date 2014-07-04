/**
 * @properties={typeid:24,uuid:"4F9BFF73-B0AE-43AE-A330-2AE9228F7FA7"}
 */
function testIsObject() {
	jsunit.assertTrue(scopes.svyJSUtils.isObject({}))
	jsunit.assertFalse(scopes.svyJSUtils.isObject([]))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(new Date()))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(1))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(''))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(/ /))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(false))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(forms))
	jsunit.assertFalse(scopes.svyJSUtils.isObject(scopes))
}

/**
 * @properties={typeid:24,uuid:"1069DB4B-E915-4E05-A688-20C3E565BE03"}
 */
function testOjectHasValue(){
	jsunit.assertTrue(scopes.svyJSUtils.objectHasValue({x: 1, y:'one'},'one'))
	
}