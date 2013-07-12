/*
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2013 Servoy BV 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
 * Raised when a method marked as @abstract is called
 *
 * @param {String} errorMessage
 *
 * @constructor
 * @extends {IllegalStateException}
 *
 * @properties={typeid:24,uuid:"1B51ABB6-289A-4CCB-A029-73B7D7B9660E"}
 */
function AbstractMethodInvocationException(errorMessage) {
	IllegalStateException.call(this, errorMessage);
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
	AbstractMethodInvocationException.prototype = new IllegalStateException("Abstract method called");
}()