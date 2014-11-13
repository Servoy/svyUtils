/**
 * 
 * @type {scopes.svyLogManager.Logger}
 * 
 * @properties={typeid:35,uuid:"35C82DCF-B27D-4DBB-A15E-959358FA8771",variableType:-4}
 */
var log = scopes.demo.log;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"4250FB90-3464-454B-8B35-A5355A243135"}
 */
var text = "This is a sample log message";

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"051E959D-54F0-417F-93F2-E460354DE393"}
 */
function logMessage(event) {
	log.debug(text)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"6D5E5A76-03EF-485C-8667-46ABC24C8EA2"}
 */
function warningMessage(event) {
	log.warn(text)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"74EEF732-DFF6-4002-B2F4-E1E4B977C612"}
 */
function errorMessage(event) {
	log.error(text)
}
