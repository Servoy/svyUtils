/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"09E1BA23-6D1D-491D-A621-2080A50BD7F7",variableType:4}
 */
var DAY = 200;
/**
 * @type {Number}
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
 * Checks if a value is one of the defined time units
 * @param {Number} value
 * @return {Boolean}
 * @properties={typeid:24,uuid:"F9AC08C4-A8F8-40F7-8753-39D0A133EA06"}
 */
function isValueTimeUnit(value){
	if(!value){
		throw new scopes.svyExceptions.IllegalArgumentException('Value is required');
	}
	var values = [
		HOUR,
		DAY,
		WEEK,
		MONTH,
		QUARTER,
		YEAR
	];
	for(i in values){
		if(value == values[i]){
			return true;
		}
	}
	return false;
}