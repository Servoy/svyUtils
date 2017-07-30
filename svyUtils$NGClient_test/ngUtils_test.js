/**
 * 
 * @private 
 * @properties={typeid:24,uuid:"506DD4A2-AA27-481E-884B-3CD3DE970E70"}
 */
function test_hasStyleClass() { 
	
	var styleClass = "btn"
	var name = "btn"
	jsunit.assertTrue("styleClass " + styleClass + " has class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	styleClass = "btn-primary btn btn-default"
	jsunit.assertTrue("styleClass " + styleClass + " has class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	styleClass = "btn btn-default"
	jsunit.assertTrue("styleClass " + styleClass + " has class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	styleClass = "btn-default btn"
	jsunit.assertTrue("styleClass " + styleClass + " has class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	name = "btn-default"
	styleClass = "btn btn-default"
	jsunit.assertTrue("styleClass " + styleClass + " has class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	name = "btn"
	styleClass = "btn-default"
	jsunit.assertFalse("styleClass " + styleClass + " does not have class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
	
	styleClass = "btn-default btn-btn"
	jsunit.assertFalse("styleClass " + styleClass + " does not have class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));

	styleClass = "btn-default btn-btn btn-primary"
	jsunit.assertFalse("styleClass " + styleClass + " does not have class " + name + " but method returns false", scopes.ngUtils.hasStyleClass(styleClass, name));
}

/**
 * @properties={typeid:24,uuid:"667EE1E9-6452-492C-89DE-CF247CAF93DB"}
 */
function test_removeStyleClass() { 
	
	var styleClass = "btn"
	var className = "btn"
	jsunit.assertEquals("", scopes.ngUtils.removeStyleClass(styleClass, className));
	
	styleClass = "btn-primary btn btn-default"
	jsunit.assertEquals("btn-primary btn-default", scopes.ngUtils.removeStyleClass(styleClass, className));

	styleClass = "btn btn-default"
	jsunit.assertEquals(" btn-default", scopes.ngUtils.removeStyleClass(styleClass, className));

	styleClass = "btn-default btn"
	jsunit.assertEquals("btn-default", scopes.ngUtils.removeStyleClass(styleClass, className));

	className = "btn-default"
	styleClass = "btn btn-default"
	jsunit.assertEquals("btn", scopes.ngUtils.removeStyleClass(styleClass, className));

	// should not change
	className = "btn"
	styleClass = "btn-default"
	jsunit.assertEquals(styleClass, scopes.ngUtils.removeStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn"
	jsunit.assertEquals(styleClass, scopes.ngUtils.removeStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn btn-primary"
	jsunit.assertEquals(styleClass, scopes.ngUtils.removeStyleClass(styleClass, className));
	
}


/**
 * @properties={typeid:24,uuid:"0050A629-6E26-4FD1-AB64-B34F76138323"}
 */
function test_addStyleClass() { 
	
	var styleClass = "btn"
	var className = "btn"
		
	// should not change
	jsunit.assertEquals(styleClass, scopes.ngUtils.addStyleClass(styleClass, className));
	
	styleClass = "btn-primary btn btn-default"
	jsunit.assertEquals(styleClass, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn btn-default"
	jsunit.assertEquals(styleClass, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn"
	jsunit.assertEquals(styleClass, scopes.ngUtils.addStyleClass(styleClass, className));

	className = "btn-default"
	styleClass = "btn btn-default"
	jsunit.assertEquals(styleClass, scopes.ngUtils.addStyleClass(styleClass, className));

	className = "btn"
	styleClass = "btn-default"
	jsunit.assertEquals(styleClass + " " + className, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn"
	jsunit.assertEquals(styleClass + " " + className, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn btn-primary"
	jsunit.assertEquals(styleClass + " " + className, scopes.ngUtils.addStyleClass(styleClass, className));
	
	className = "btn"
	styleClass = "btn-default "
	jsunit.assertEquals(styleClass + className, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn "
	jsunit.assertEquals(styleClass + className, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn btn-primary "
	jsunit.assertEquals(styleClass + className, scopes.ngUtils.addStyleClass(styleClass, className));

	styleClass = "btn-default btn-btn btn-primary "
	jsunit.assertEquals(styleClass + className, scopes.ngUtils.addStyleClass(styleClass, className));
}