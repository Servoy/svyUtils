/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"832829DD-DBEB-4EBF-8C0F-EB0898B941EA"}
 */
var dataprovider = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8F45448D-EFF2-4117-A763-162BA4AE4A45"}
 */
var text = "";

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B67F0C05-C1CF-405C-B106-33399A00F0AF"}
 */
function check(event) {
	checkDataprovider()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"26D5D9BF-451C-4CBD-ACB1-04807EA6D44E"}
 */
function tryAndCheck(event) {
	try {
		checkDataprovider()
	} catch (e) {
		text += 'Error: ' + e.name
		text += ' message: ' + e.message + '\n'
	}
}

/**
 * Perform the element default action.
 *
 * @protected
 *
 * @throws {scopes.svyExceptions.IllegalStateException}
 *
 * @properties={typeid:24,uuid:"87174CE0-8769-4B52-84CF-DBFB1BF50679"}
 */
function checkDataprovider() {
	if (!dataprovider) {
		throw new scopes.svyExceptions.IllegalStateException('exception: dataprovider is null or empty, please provide a valid value')
	}
}
