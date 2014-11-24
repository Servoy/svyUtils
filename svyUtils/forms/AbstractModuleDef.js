/**
 * @deprecated Override getVersion instead. Will be removed in version 6
 * @type {String}
 * @protected
 * 
 * @properties={typeid:35,uuid:"AED8037B-EC52-44EA-AB22-970A86920B39"}
 */
var version = '';

/**
 * Returns the module version. User semantic versions {@link http://semver.org/}
 * @abstract
 * @return {String} version
 * @properties={typeid:24,uuid:"41972CEF-FA17-497C-9877-AB6CB2746784"}
 */
function getVersion() {
	throw new scopes.svyExceptions.AbstractMethodInvocationException('Abstract method getVersion() must be implemented on instances of AbstractModuleDef');
}

/**
 * @deprecated Override getId instead. Will be removed in version 6
 * @type {String}
 * @protected
 * 
 * @properties={typeid:35,uuid:"C167F619-4190-44D7-BDE7-BF7FC40B74A5"}
 */
var id = '';

/**
 * Returns the module identifier
 * @abstract
 * @return {String} id
 * @properties={typeid:24,uuid:"CD7EEB45-2503-495F-AAD4-61792FA4AC38"}
 */
function getId() {
	throw new scopes.svyExceptions.AbstractMethodInvocationException('Abstract method getId() must be implemented on instances of AbstractModuleDef');
}

/**
 * Override to invoke module initialization code
 * 
 * @param {Object.<String,String>} [startupArguments] all startup arguments with which the solution is opened
 * 
 * @properties={typeid:24,uuid:"71B8F981-8A56-430D-82DA-80D4C28EACDA"}
 */
function moduleInit(startupArguments) {}

/**
 * If the module depends on other modules being initialized first, return the ID's of those modules as an Array of Strings
 * @return {Array<{id: String}>}
 *
 * @properties={typeid:24,uuid:"ED122704-21D6-4F51-BB50-0B917B0D10B7"}
 */
function getDependencies() {
	return null
}
