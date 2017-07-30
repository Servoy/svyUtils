
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9A6BC9E6-0838-4006-8366-1D5F64B7D7A9"}
 */
function test(event) {
	var dialog = scopes.svyCustomDialogs.createCustomDialog(null,'Foobar','This is foo-tastic');
	
	dialog.addTextField('Foo','bar');
	dialog.addCheckbox('Foolio','',true);
	dialog.addButton('OK')
		.value = 'OK'
	dialog.addButton('Cancel')
		.
	
	dialog.showDialog();
	application.output(dialog.getResult());
}
