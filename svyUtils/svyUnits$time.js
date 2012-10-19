/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"09E1BA23-6D1D-491D-A621-2080A50BD7F7",variableType:4}
 */
var DAY = 200;
/**
 * @type {Number}
 * 
 * just a comment to test
 *
 * @properties={typeid:35,uuid:"3CE95EC7-4590-4661-9881-B535CDEF5F74",variableType:4}
 */
var HOUR = 100;
/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"0DF2D56D-5E06-4C6F-8F56-29E1244BD44D",variableType:4}
 */
var MONTH = 400;
/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9619E82D-3F69-4674-96AF-A8F36636C85A",variableType:4}
 */
var QUARTER = 500;
/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D5AC36B2-F2BD-4B00-A705-B00853A92357",variableType:4}
 */
var WEEK = 300;
/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"62313D54-23B9-4129-9CDF-0961DB6CD7EB",variableType:4}
 */
var YEAR = 600;

/**
 * Transposes a date object by the amount specified and returns a new date object
 * 
 * @param {Date} date
 * @param {Number} amount
 * @param {Number} units
 * @return {Date}
 * @author Sean
 * @properties={typeid:24,uuid:"664A3D5F-DFBD-419C-B084-904920DF4A92"}
 */
function transpose(date, amount, units) {
	if(!date) throw new scopes.svyExceptions.IllegalArgumentException('date cannot be null/undefined',null,null);
	if(!amount) throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined',null,null);
	if(!units) throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined',null,null);
	date = new Date(date.toDateString());
	switch (units) {
		case HOUR:
			date.setHours(date.getHours() + amount);
			break;
		case DAY:
			date.setDate(date.getDate()+amount);
			break;
		case WEEK:
			date.setDate(date.getDate()+(amount*7));
			break;
		case MONTH:
			date.setMonth(date.getMonth()+amount);
			break;
		case YEAR:
			date.setFullYear(date.getFullYear()+amount);
			break;
		default:
			throw new scopes.svyExceptions.IllegalArgumentException('Unsupported value for units',null,null);
	}
	return date;
}
