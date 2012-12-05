/*
 * Scope with base exceptions.
 * 
 * Note: when adding new exceptions, also set the prototype accordingly through the init function
 */

/**
 * General exception holding exception message, i18n key and arguments
 * 
 * Subclassed by specific exceptions
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * 
 * @constructor 
 *
 * @properties={typeid:24,uuid:"B5C94D85-CC71-44A2-B728-99252273A4FF"}
 */
function SvyException(errorMessage, i18nKey, i18nArguments) {
	
	var message = errorMessage;
	
	var localeMessage = i18nKey ? (i18nArguments ? i18n.getI18NMessage(i18nKey, i18nArguments) : i18n.getI18NMessage(i18nKey)) : errorMessage;
	
	/**
	 * Returns the exception message
	 * 
	 * @return {String}
	 */
	this.getMessage = function() {
		return message;
	}
	
	/**
	 * Returns the i18n translated exception message
	 * 
	 * @return {String}
	 */
	this.getLocaleMessage = function() {
		return localeMessage;
	}
	
	/**
	 * Returns the i18n translated message if an i18n<br>
	 * key was provided, errorMessage if not
	 * 
	 * @override
	 */
	this.toString = function(){
		return localeMessage;
	}
	
	Object.defineProperty(this, "message", {
		get: function() {
			return message;
		},
		set: function(x) {
		}
	});
	
	Object.defineProperty(this, "localeMessage", {
		get: function() {
			return localeMessage;
		},
		set: function(x) {
		}
	});	
}

/**
 * No record present
 * 
 * @constructor 
 * 
 * @properties={typeid:24,uuid:"B22507E5-510C-4365-B71D-4376200D8FC7"}
 */
function NoRecordException() {
	
}

/**
 * No related record present
 * 
 * @constructor
 * 
 * @properties={typeid:24,uuid:"001EBC86-83A1-4E96-A77D-81317C07F503"}
 */
function NoRelatedRecordException() {
	
}

/**
 * Thrown when an email message could not be sent
 * 
 * @param {String} [lastSendMailExceptionMessage] - usually taken from plugins.mail.getLastSendMailExceptionMsg()
 * 
 * @constructor 
 * 
 * @properties={typeid:24,uuid:"08D88894-91B8-4A02-9230-3F57D8A43123"}
 */
function SendMailException(lastSendMailExceptionMessage)
{
	if (lastSendMailExceptionMessage) {
		scopes.svyExceptions.SvyException.call(this, lastSendMailExceptionMessage);
	}
}

/**
 * The given file could not be found
 * 
 * @param {plugins.file.JSFile} [file]
 * 
 * @constructor 
 *
 * @properties={typeid:24,uuid:"294FA011-F0BA-4AAA-A2EB-D25492367723"}
 */
function FileNotFoundException(file) {
	
	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	
}

/**
 * Raised when an argument is not legal
 *
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"CA8E2117-F6BF-45EB-8A87-4F48ABA1C4EA"}
 */
function IllegalArgumentException(errorMessage, i18nKey, i18nArguments) {
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when performing an operation that is not supported
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * 
 * @constructor 
 * 
 * @properties={typeid:24,uuid:"0A15039E-D104-4453-B461-3C2927DA66F4"}
 */
function UnsupportedOperationException(errorMessage, i18nKey, i18nArguments){
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when a runtime state is not legal
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * 
 * @constructor 
 * 
 * @author Sean
 * 
 * @properties={typeid:24,uuid:"9BD81D8F-A3FC-48BF-823A-E34D979DBCD9"}
 */
function IllegalStateException(errorMessage, i18nKey, i18nArguments){
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when JSFoundSet.newRecord() failed
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet} [foundset]
 * 
 * @constructor 
 * 
 * @author Sean
 * 
 * @properties={typeid:24,uuid:"A119ED1E-0AFB-4797-AD92-A54A3CC14EC5"}
 */
function NewRecordFailedException(errorMessage, i18nKey, i18nArguments, foundset) {
	
	/**
	 * The Foundset that was used to attempt record creation
	 *  
	 * @type {JSFoundSet}
	 */
	this.foundset = foundset;

	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when JSFoundSet.find() fails
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet} [foundset]
 * 
 * @constructor 
 * 
 * @author Sean
 * 
 * @properties={typeid:24,uuid:"64C7062A-FFB8-4933-8556-4D035387F003"}
 */
function FindModeFailedException(errorMessage, i18nKey, i18nArguments, foundset){
	
	/**
	 * The Foundset that was used to attempt to enter find mode
	 * @type {JSFoundSet} 
	 */
	this.foundset = foundset;
	
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when databaseManager.saveData() fails
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null), foundset, or record
 * 
 * @constructor 
 * 
 * @author Sean
 *
 * @properties={typeid:24,uuid:"561FDA43-B94A-4133-98B6-D98B50ACD0C9"}
 */
function SaveDataFailedException(errorMessage, i18nKey, i18nArguments, foundsetOrRecord){
	
	/**
	 * The Foundset that was used to attempt record creation
	 * @type {JSFoundSet} 
	 */
	this.foundsetOrRecord = foundsetOrRecord;
	
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when a delete fails
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null), foundset, or record
 * 
 * @constructor 
 * 
 * @author Sean
 *
 * @properties={typeid:24,uuid:"BD31A2D1-C1FD-41C0-98F7-76F36BC8ED57"}
 */
function DeleteRecordFailedException(errorMessage, i18nKey, i18nArguments, foundsetOrRecord){
	
	/**
	 * The Foundset that was used to attempt record creation
	 * @type {JSFoundSet} 
	 */
	this.foundsetOrRecord = foundsetOrRecord;
	
	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Raised when the dataprovider needs to be unique
 * 
 * @param {JSRecord} record
 * @param {String} dataprovider
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * 
 * @constructor 
 * 
 * @author patrick
 * @since 30.09.2012
 *
 * @properties={typeid:24,uuid:"A5938C9A-A680-4A21-9C58-30899C38DE47"}
 */
function ValueNotUniqueException(record, dataprovider, i18nKey, i18nArguments) {

	/**
	 * The record that violates a unique constraint
	 * @type {JSRecord}
	 */
	this.record = record;
	
	/**
	 * The dataprovider that is not unique
	 * @type {String}
	 */
	this.dataprovider = dataprovider;
	
	scopes.svyExceptions.SvyException.call(this, "Value not unique for: " + dataprovider, i18nKey, i18nArguments);
	
}

/**
 * Raised when a there is an error in an HTTP operation, most commonly a failed request (status code != SC_OK)
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {Number} [httpCode]
 * @param {String} [httpResponseBody]
 * 
 * @constructor 
 * 
 * @author Sean
 *
 * @properties={typeid:24,uuid:"F1C95D28-6967-4FAE-B319-6D1D732FF734"}
 */
function HTTPException(errorMessage, i18nKey, i18nArguments, httpCode, httpResponseBody) {

	/**
	 * The HTTP Response Code
	 * @type {Number}
	 */
	this.httpCode = httpCode;

	/**
	 * The Response of the
	 * @type {String}
	 */
	this.httpResponseBody = httpResponseBody;

	scopes.svyExceptions.SvyException.call(this, errorMessage, i18nKey, i18nArguments);
}

/**
 * Set all prototypes to super class
 * 
 * @protected  
 * 
 * @properties={typeid:35,uuid:"2D41F2C6-1601-4A25-9AF1-F451EC371F3D",variableType:-4}
 */
var init = function() {
	NoRecordException.prototype = 				new SvyException("No record was given or the foundset is empty");
	NoRelatedRecordException.prototype = 		new SvyException("No related record found");
	SendMailException.prototype = 				new SvyException("Failed to send mail");
	FileNotFoundException.prototype = 			new SvyException("File not found");
	IllegalArgumentException.prototype = 		new SvyException("Illegal argument");
	IllegalStateException.prototype = 			new SvyException("Illegal state");
	UnsupportedOperationException.prototype = 	new SvyException("Unsupported operation");
	NewRecordFailedException.prototype = 		new SvyException("Failed to create new record");
	FindModeFailedException.prototype = 		new SvyException("Failed to enter find mode");
	SaveDataFailedException.prototype = 		new SvyException("Failed to save data");
	DeleteRecordFailedException.prototype = 	new SvyException("Failed to delete data");
	ValueNotUniqueException.prototype = 		new SvyException("Value not unique");
	HTTPException.prototype = 					new SvyException("Error in HTTP operation");
}()