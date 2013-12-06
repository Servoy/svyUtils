/**
 * @properties={typeid:24,uuid:"0AEFCB90-5651-4A2D-B0F8-18E7C2F114E7"}
 */
function test_getFormHeight() {
	jsunit.assertEquals(50, scopes.modUtils$UI.getJSFormHeight("test_svyUI$getFormParts_base_base"));
	jsunit.assertEquals(90, scopes.modUtils$UI.getJSFormHeight("test_svyUI$getFormParts_base"));
	jsunit.assertEquals(120, scopes.modUtils$UI.getJSFormHeight("test_svyUI$getFormParts"));
}

/**
 * @properties={typeid:24,uuid:"C9041184-6880-454A-AD73-7F938808472A"}
 */
function test_getFormParts() {
	var parts = solutionModel.getForm("test_svyUI$getFormParts_base_base").getParts(true);
	if (!parts) jsunit.fail("no parts returned");
	jsunit.assertEquals(1, parts.length);

	parts = solutionModel.getForm("test_svyUI$getFormParts_base").getParts(true);
	if (!parts) jsunit.fail("no parts returned");
	jsunit.assertEquals(2, parts.length);

	parts = solutionModel.getForm("test_svyUI$getFormParts").getParts(true);
	if (!parts) jsunit.fail("no parts returned");
	jsunit.assertEquals(3, parts.length);
}

/**
 * @properties={typeid:24,uuid:"8BEE99FF-F6E7-467B-AA63-C9FEEF88C660"}
 */
function test_getJSFormForInput() {
	var id = application.getUUID().toString()
	var smForm = solutionModel.newForm(id, null, null, false, 100,100)
	
	jsunit.assertTrue(application.createNewFormInstance(id, id + '_2'))
	jsunit.assertTrue(application.createNewFormInstance(id, id + '_3'))
	
	jsunit.assertEquals(smForm, scopes.modUtils$UI.getJSFormForReference(id + '_3'))
	jsunit.assertEquals(smForm, scopes.modUtils$UI.getJSFormForReference(forms[id + '_3']))
	
	jsunit.assertTrue(forms[id + '_3'] instanceof forms[id + '_2'])
	jsunit.assertTrue(forms[id + '_2'] instanceof forms[id + '_3'])
	jsunit.assertTrue(forms[id + '_3'] instanceof forms[id])
}

/**
 * @properties={typeid:24,uuid:"87D57F8D-9D8B-4578-8EE4-11E78A3856B5"}
 */
function test_getRuntimeFormInstanceNames() {
	var id = application.getUUID().toString()
	var smForm = solutionModel.newForm(id, null, null, false, 100,100)
	
	jsunit.assertTrue(application.createNewFormInstance(id, id + '_2'))
	jsunit.assertTrue(application.createNewFormInstance(id, id + '_3'))
	
	jsunit.assertEquals(0, scopes.modUtils$UI.getRuntimeFormInstanceNames(smForm).length)
	forms[id]
	jsunit.assertEquals(1, scopes.modUtils$UI.getRuntimeFormInstanceNames(smForm).length)
	forms[id + '_2']
	jsunit.assertEquals(2, scopes.modUtils$UI.getRuntimeFormInstanceNames(smForm).length)
	forms[id + '_3']
	jsunit.assertEquals(3, scopes.modUtils$UI.getRuntimeFormInstanceNames(smForm).length)

}