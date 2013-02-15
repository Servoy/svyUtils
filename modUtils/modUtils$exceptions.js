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
 *
 * @constructor
 *
 * @properties={typeid:24,uuid:"8D4DBBD3-4162-4F23-A61E-5875936E8AAB"}
 */
function SvyException(errorMessage) {

	/**
	 * Returns the exception message
	 *
	 * @return {String}
	 */
	this.getMessage = function() {
		return errorMessage;
	}

	/**
	 * Returns the exception message
	 * @override
	 */
	this.toString = function() {
		return errorMessage;
	}

	Object.defineProperty(this, "message", {
			get: function() {
				return errorMessage;
			},
			set: function(x) {}
		});
}

/**
 * No record present
 *
 * @constructor
 * @param {String} [errorMessage]
 *
 * @properties={typeid:24,uuid:"3FB6A57B-817A-412F-ABCF-5B35057E27EB"}
 */
function NoRecordException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * No related record present
 *
 * @constructor
 * @param {String} [errorMessage]
 *
 * @properties={typeid:24,uuid:"99684648-AB5F-404D-918D-A45FC36270BD"}
 */
function NoRelatedRecordException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * Thrown when an email message could not be sent
 *
 * @param {String} [errorMessage] - usually taken from plugins.mail.getLastSendMailExceptionMsg()
 *
 * @constructor
 *
 * @properties={typeid:24,uuid:"73C704EB-7D7D-4B4B-AD05-88068C478184"}
 */
function SendMailException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * The given file could not be found
 *
 * @param {String} [errorMessage]
 * @param {plugins.file.JSFile} [file]
 *
 * @constructor
 *
 * @properties={typeid:24,uuid:"F452FF14-FB87-4A1B-936D-EBC9DD13D61E"}
 */
function FileNotFoundException(errorMessage, file) {

	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	SvyException.call(this, errorMessage);
}

/**
 * Raised for failed or interrupted I/O operations
 * 
 * @param {String} [errorMessage]
 * 
 * @constructor
 * 
 * @author patrick
 *
 * @properties={typeid:24,uuid:"06077E24-B9FF-481D-919B-0E6CBD64267B"}
 */
function IOException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * Raised when an argument is not legal
 *
 * @param {String} errorMessage
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"8E3EBB8D-1397-4444-8E0C-3F9D3E036CC7"}
 */
function IllegalArgumentException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * Raised when performing an operation that is not supported
 *
 * @param {String} errorMessage
 *
 * @constructor
 *
 * @properties={typeid:24,uuid:"4B19C306-E4D7-40F2-BE89-DF369F489094"}
 */
function UnsupportedOperationException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * Raised when a runtime state is not legal
 *
 * @param {String} errorMessage
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"04C9606C-70C0-4C03-854F-7BE2B09FF44C"}
 */
function IllegalStateException(errorMessage) {
	SvyException.call(this, errorMessage);
}

/**
 * Raised when JSFoundSet.newRecord() failed
 *
 * @param {String} errorMessage
 * @param {JSFoundSet} [foundset]
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"F169D722-2B2F-41F5-87CF-EA7EF58ADD65"}
 */
function NewRecordFailedException(errorMessage, foundset) {

	/**
	 * The Foundset that was used to attempt record creation
	 *
	 * @type {JSFoundSet}
	 */
	this.foundset = foundset;

	SvyException.call(this, errorMessage);
}

/**
 * Raised when JSFoundSet.find() fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet} [foundset]
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"530D13F3-440F-4059-B00A-96D3689C92EB"}
 */
function FindModeFailedException(errorMessage, foundset) {

	/**
	 * The Foundset that was used to attempt to enter find mode
	 * @type {JSFoundSet}
	 */
	this.foundset = foundset;

	SvyException.call(this, errorMessage);
}

/**
 * Raised when databaseManager.saveData() fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null), foundset, or record
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"4B09EF6B-D100-4BF1-B90B-00BD4D9F814B"}
 */
function SaveDataFailedException(errorMessage, foundsetOrRecord) {

	/**
	 * The Foundset that was used to attempt record creation
	 * @type {JSFoundSet}
	 */
	this.foundsetOrRecord = foundsetOrRecord;

	SvyException.call(this, errorMessage);
}

/**
 * Raised when a delete fails
 *
 * @param {String} errorMessage
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null), foundset, or record
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"0325165D-2736-4BAE-BE13-F3FE685A98D1"}
 */
function DeleteRecordFailedException(errorMessage, foundsetOrRecord) {

	/**
	 * The Foundset that was used to attempt record creation
	 * @type {JSFoundSet}
	 */
	this.foundsetOrRecord = foundsetOrRecord;

	SvyException.call(this, errorMessage);
}

/**
 * Raised when the dataprovider needs to be unique
 *
 * @param {String|JSRecord|JSFoundSet} foundsetRecordOrDatasource
 * @param {String} dataprovider
 *
 * @constructor
 *
 * @author patrick
 * @since 30.09.2012
 *
 * @properties={typeid:24,uuid:"B855809D-DE16-4398-B2C3-0D2324E33FE5"}
 */
function ValueNotUniqueException(foundsetRecordOrDatasource, dataprovider) {

	var ds = foundsetRecordOrDatasource;
	if (foundsetRecordOrDatasource instanceof JSRecord || foundsetRecordOrDatasource instanceof JSFoundSet) {
		ds = foundsetRecordOrDatasource.getDataSource();
	}
	
	/**
	 * The datasource where a unique constraint was violated
	 * @type {JSRecord}
	 */
	this.datasource = ds;

	/**
	 * The dataprovider that is not unique
	 * @type {String}
	 */
	this.dataprovider = dataprovider;

	SvyException.call(this, "Value not unique for: " + dataprovider);

}

/**
 * Raised when a there is an error in an HTTP operation, most commonly a failed request (status code != SC_OK)
 *
 * @param {String} errorMessage
 * @param {Number} [httpCode]
 * @param {String} [httpResponseBody]
 *
 * @constructor
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"81CF0FE3-F3C4-4203-B934-6936C37BED65"}
 */
function HTTPException(errorMessage, httpCode, httpResponseBody) {

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

	SvyException.call(this, errorMessage);
}

/**
 * Set all prototypes to super class
 *
 * @protected
 *
 * @properties={typeid:35,uuid:"36364157-A05A-4806-B13E-DA08DD8C27D6",variableType:-4}
 */
var init = function() {
	NoRecordException.prototype = new SvyException("No record was given or the foundset is empty");
	NoRelatedRecordException.prototype = new SvyException("No related record found");
	SendMailException.prototype = new SvyException("Failed to send mail");
	FileNotFoundException.prototype = new SvyException("File not found");
	IOException.prototype = new SvyException("IO Exception");
	IllegalArgumentException.prototype = new SvyException("Illegal argument");
	IllegalStateException.prototype = new SvyException("Illegal state");
	UnsupportedOperationException.prototype = new SvyException("Unsupported operation");
	NewRecordFailedException.prototype = new SvyException("Failed to create new record");
	FindModeFailedException.prototype = new SvyException("Failed to enter find mode");
	SaveDataFailedException.prototype = new SvyException("Failed to save data");
	DeleteRecordFailedException.prototype = new SvyException("Failed to delete data");
	ValueNotUniqueException.prototype = new SvyException("Value not unique");
	HTTPException.prototype = new SvyException("Error in HTTP operation");
}()