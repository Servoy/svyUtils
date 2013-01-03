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