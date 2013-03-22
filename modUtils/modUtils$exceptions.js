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
 * Raised when an argument is not legal
 *
 * @param {String} errorMessage
 *
 * @constructor
 * @extends {SvyException}
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
 * @extends {SvyException}
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
 * @extends {SvyException}
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"04C9606C-70C0-4C03-854F-7BE2B09FF44C"}
 */
function IllegalStateException(errorMessage) {
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

	IllegalArgumentException.prototype = new SvyException("Illegal argument");
	IllegalStateException.prototype = new SvyException("Illegal state");
	UnsupportedOperationException.prototype = new SvyException("Unsupported operation");

}()