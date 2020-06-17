/**
 * @properties={typeid:24,uuid:"8BC12B43-179B-4733-96E3-43494F0901D1"}
 */
function test_svySystem() {
	//test to prevent java deprecation issues in totalPhysicalMemory
	var sysProps = scopes.svySystem.getSystemProperties();
	jsunit.assertTrue('Total memory should be greater than 0', sysProps.totalPhysicalMemory > 0);
}