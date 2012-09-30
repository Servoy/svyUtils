/**
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 *
 * @properties={typeid:24,uuid:"B5C94D85-CC71-44A2-B728-99252273A4FF"}
 */
function SvyException(errorMessage, i18nKey, i18nArguments) {
	
	var message = errorMessage;
	
	var localeMessage = i18nKey ? (i18nArguments ? i18n.getI18NMessage(i18nKey, i18nArguments) : i18n.getI18NMessage(i18nKey)) : errorMessage;
	
	this.getMessage = function() {
		return message;
	}
	
	this.getLocaleMessage = function() {
		return localeMessage;
	}
	
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
 * @properties={typeid:24,uuid:"B22507E5-510C-4365-B71D-4376200D8FC7"}
 */
function NoRecordException() {
	
	NoRecordException.prototype = new SvyException("No record was given or the foundset is empty");
	
}

/**
 * No owner set
 * 
 * @param {JSRecord} record
 * @properties={typeid:24,uuid:"C64D9C03-D0FF-4064-A9EE-978057A63BA7"}
 */
function NoOwnerException(record) {
	
	/**
	 * The record where the problem occured
	 * @type {JSRecord}
	 */
	this.record = record;
	
	NoOwnerException.prototype = new SvyException("There is no owner for the current record.");
	
}

/**
 * Thrown when a password does not comply to the rules set for the owner
 * 
 * @param {JSRecord<db:/svy_framework/sec_user>} record
 * @param {String} message
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 *
 * @properties={typeid:24,uuid:"D31D1A18-4D09-421C-B288-4DEEA554B637"}
 */
function PasswordRuleViolationException(record, message, i18nKey, i18nArguments) {
	
	/**
	 * The record where the problem occured
	 * @type {JSRecord<db:/svy_framework/sec_user>}
	 */
	this.record = record;
	
	PasswordRuleViolationException.prototype = new SvyException(message, i18nKey, i18nArguments);
}

/**
 * The user is not part of the organization with the given ID
 * 
 * @param {JSRecord<db:/svy_framework/sec_user>} record
 * @param {UUID|String} organizationId
 *
 * @properties={typeid:24,uuid:"2CA76922-50A3-405E-AAD1-A430C3DA4479"}
 */
function UserNotMemberOfOrganizationException(record, organizationId) {
	
	/**
	 * The record where the problem occured
	 * @type {JSRecord<db:/svy_framework/sec_user>}
	 */
	this.record = record;
	
	/**
	 * The ID of the organization the user does not belong to
	 */
	this.organizationId = organizationId;
	
	UserNotMemberOfOrganizationException.prototype = new SvyException("User not part of organization");
}

/**
 * The given file could not be found
 * 
 * @param {plugins.file.JSFile} file
 *
 * @properties={typeid:24,uuid:"294FA011-F0BA-4AAA-A2EB-D25492367723"}
 */
function FileNotFoundException(file) {
	
	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	
	FileNotFoundException.prototype = new SvyException("File not found");
}

/**
 * Raised when an argument is not legal
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @author Sean
 * @properties={typeid:24,uuid:"CA8E2117-F6BF-45EB-8A87-4F48ABA1C4EA"}
 */
function IllegalArgumentException(errorMessage, i18nKey, i18nArguments){
	IllegalArgumentException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}

/**
 * Raised when a runtime state is not legal
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @author Sean
 * @properties={typeid:24,uuid:"9BD81D8F-A3FC-48BF-823A-E34D979DBCD9"}
 */
function IllegalStateException(errorMessage, i18nKey, i18nArguments){
	IllegalStateException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}

/**
 * Raised when JSFoundSet.newRecord() failed
 * 
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet} [foundset]
 * @author Sean
 * @properties={typeid:24,uuid:"A119ED1E-0AFB-4797-AD92-A54A3CC14EC5"}
 */
function NewRecordFailedException(errorMessage, i18nKey, i18nArguments, foundset){
	/**
	 *  The Foundset that was used to attempt record creation
	 *   @type {JSFoundSet} 
	 */
	this.foundset = foundset;
	
	NewRecordFailedException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}
/**
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet} [foundset]
 * @author Sean
 * @properties={typeid:24,uuid:"64C7062A-FFB8-4933-8556-4D035387F003"}
 */
function FindModeFailedException(errorMessage, i18nKey, i18nArguments, foundset){
	/**
	 *  The Foundset that was used to attempt to enter find mode
	 *   @type {JSFoundSet} 
	 */
	this.foundset = foundset;
	
	FindModeFailedException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}

/**
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null),foundset, or record
 * @author Sean
 *
 * @properties={typeid:24,uuid:"561FDA43-B94A-4133-98B6-D98B50ACD0C9"}
 */
function SaveDataFailedException(errorMessage, i18nKey, i18nArguments, foundsetOrRecord){
	/**
	 *  The Foundset that was used to attempt record creation
	 *   @type {JSFoundSet} 
	 */
	this.foundsetOrRecord = foundsetOrRecord;
	
	SaveDataFailedException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}

/**
 * @param {String} errorMessage
 * @param {String} [i18nKey]
 * @param {Array} [i18nArguments]
 * @param {JSFoundSet|JSRecord} [foundsetOrRecord] saves can be on anything (null),foundset, or record
 * @author Sean
 *
 * @properties={typeid:24,uuid:"BD31A2D1-C1FD-41C0-98F7-76F36BC8ED57"}
 */
function DeleteRecordFailedException(errorMessage, i18nKey, i18nArguments, foundsetOrRecord){
	/**
	 *  The Foundset that was used to attempt record creation
	 *   @type {JSFoundSet} 
	 */
	this.foundsetOrRecord = foundsetOrRecord;
	
	DeleteRecordFailedException.prototype = new SvyException(errorMessage,i18nKey,i18nArguments);
}

/**
 * Raised when the dataprovider needs to be unique
 * 
 * @param {JSRecord} record
 * @param {String} dataprovider
 * 
 * @author patrick
 * @since 30.09.2012
 *
 * @properties={typeid:24,uuid:"A5938C9A-A680-4A21-9C58-30899C38DE47"}
 */
function ValueNotUniqueException(record, dataprovider) {

	/**
	 * The record that violates a unique constraint
	 * 
	 * @type {JSRecord}
	 */
	this.record = record;
	
	/**
	 * The dataprovider that is not unique
	 * 
	 * @type {String}
	 */
	this.dataprovider = dataprovider;
	
	// TODO: i18n with argument dataprovider
	ValueNotUniqueException.prototype = new SvyException("Dataprovider not unique");
	
}
