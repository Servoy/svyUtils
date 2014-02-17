
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FC615FD8-3DB1-4684-B1ED-9786D14BB032"}
 */
function gotoWebClientCallbackTestForm(event) {
	forms.webClientCallbackTests.controller.show()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F3A7356E-01DC-4DF1-AC3B-74EDB411E5AE"}
 */
function onAction(event) {
	elements.label.text = 'First update, now wating 5 seconds'
	scopes.svyWebClientUtils.updateUI()
	application.sleep(5000)
	elements.label.text = 'Second update, now finished'
}
