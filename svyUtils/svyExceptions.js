/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

/*
 * Scope with base exceptions.
 *
 * Note: when adding new exceptions, also set the prototype accordingly through the init function
 * Also always call the super constructor from within the sub-class constructor: http://www.bennadel.com/blog/1566-Using-Super-Constructors-Is-Critical-In-Prototypal-Inheritance-In-Javascript.htm
 * 
 */

/**
 * @private 
 *
 * @properties={typeid:35,uuid:"CB850A67-F8C0-4C1A-A55B-302810E36FA9",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.exceptions')

/**
 * General exception holding exception message, i18n key and arguments
 * 
 * @public
 * Subclassed by specific exceptions
 *
 * @param {String} errorMessage
 *
 * @constructor
 * @extends {Error}
 *
 * @properties={typeid:24,uuid:"8D4DBBD3-4162-4F23-A61E-5875936E8AAB"}
 */
function SvyException(errorMessage) {
	if (!(this instanceof SvyException)) {
		log.error('SvyException subclass called without the \'new\' keyword')
	}
	this.message = errorMessage.substr(0,5) === 'i18n:' ? i18n.getI18NMessage(errorMessage) : errorMessage
	this.name = this.constructor['name']
}

/**
 * Raised when an argument is not legal
 * 
 * @public
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
	if (!(this instanceof IllegalArgumentException)) {
		return new IllegalArgumentException(errorMessage)
	}
	SvyException.call(this, errorMessage);
}

/**
 * Raised when performing an operation that is not supported
 * 
 * @public
 * @param {String} errorMessage
 *
 * @constructor
 * @extends {SvyException}
 *
 * @properties={typeid:24,uuid:"4B19C306-E4D7-40F2-BE89-DF369F489094"}
 */
function UnsupportedOperationException(errorMessage) {
	if (!(this instanceof UnsupportedOperationException)) {
		return new UnsupportedOperationException(errorMessage)
	}
	SvyException.call(this, errorMessage);
}

/**
 * Raised when a runtime state is not legal
 *
 * @public
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
	if (!(this instanceof IllegalStateException)) {
		return new IllegalStateException(errorMessage)
	}
	SvyException.call(this, errorMessage);
}

/**
 * Raised when a method marked as @abstract is called
 * 
 * @public
 * @param {String} [errorMessage]
 *
 * @constructor
 * @extends {IllegalStateException}
 *
 * @properties={typeid:24,uuid:"1B51ABB6-289A-4CCB-A029-73B7D7B9660E"}
 */
function AbstractMethodInvocationException(errorMessage) {
	if (!(this instanceof AbstractMethodInvocationException)) {
		return new AbstractMethodInvocationException(errorMessage)
	}
	
	if (!errorMessage) {
		var ex
		try {
			throw new Error()
		} catch (e) {
			ex = e
		}
		var stack = ex.stack.split('\n', 2)
		if (stack.length > 1) {
			errorMessage = 'Abstract method ' + stack[1].slice(stack[1].lastIndexOf('(') + 1, -2) + ' is not implemented'
		}
	}

	IllegalStateException.call(this, errorMessage);
}

/**
 * Wrapper around ServoyException to make it a JavaScript Error instance
 * @public
 * @constructor 
 * @extends {SvyException}
 * @param {ServoyException|Packages.java.lang.Exception} exception
 *
 * @properties={typeid:24,uuid:"6A71126C-BFF3-422A-ADB4-2574AB0BFEF2"}
 */
function ServoyError(exception) {
	if (!(this instanceof ServoyError)) {
		return new ServoyError(exception)
	}
	/**
	 * @protected 
	 */
	this.ex = exception
	SvyException.call(this, exception.getMessage());
	this.name = exception instanceof DataException ? 'DataException' : exception instanceof ServoyException ? 'ServoyException' : 'Exception'
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"36364157-A05A-4806-B13E-DA08DD8C27D6",variableType:-4}
 */
var init = function() {
	SvyException.prototype = Object.create(Error.prototype);
	SvyException.prototype.constructor = SvyException
	
	/**
	 * Returns the exception message
	 *
	 * @return {String}
	 */
	SvyException.prototype.getMessage = function() {
		return this.message
	}
	
	IllegalArgumentException.prototype = Object.create(SvyException.prototype)
	IllegalArgumentException.prototype.constructor = IllegalArgumentException
	
	IllegalStateException.prototype = Object.create(SvyException.prototype)
	IllegalStateException.prototype.constructor = IllegalStateException
		
	UnsupportedOperationException.prototype = Object.create(SvyException.prototype)
	UnsupportedOperationException.prototype.constructor = UnsupportedOperationException
		
	AbstractMethodInvocationException.prototype = Object.create(IllegalStateException.prototype)
	AbstractMethodInvocationException.prototype.constructor = AbstractMethodInvocationException
	
	ServoyError.prototype = Object.create(SvyException.prototype)
	ServoyError.prototype.constructor = ServoyError
	
	Object.defineProperty(ServoyError.prototype, 'stack', {
		get: function() {
			if (typeof this.ex.getScriptStackTrace === 'function') {
				return this.ex.getScriptStackTrace()
			} else if (typeof this.ex.getStackTrace === 'function') {
				return this.ex.getStackTrace()
			} else {
				return undefined;
			}
		}
	})
	ServoyError.prototype.unwrap = function() {
		return this.ex
	}
	
	ServoyError.prototype.toString = function() {
		return this.getMessage()
	}
}()