/**
 * @private 
 * 
 * @properties={typeid:24,uuid:"8CA14C75-A1C2-42D1-9A37-9DB8162A0B16"}
 */
function test_hasColumnClass() {
	
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("col-md-6"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("col-md-visible col-md-6"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("col-md-visible col-md-6"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("col-md-visible col-md-6"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("col-md-hidden col-md-6 col-xs"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("btn-default col-md-1"));
	jsunit.assertTrue(scopes.ng12grid.hasColumnClass("btn btn-default col-lg-10"));
	
	// this tests should fail
	jsunit.assertFalse(scopes.ng12grid.hasColumnClass("col-md"));
	jsunit.assertFalse(scopes.ng12grid.hasColumnClass("col col-md-xs col-md-13 col-md-91"));
	jsunit.assertFalse(scopes.ng12grid.hasColumnClass("col-xs col-md- col-gg-4"));
}