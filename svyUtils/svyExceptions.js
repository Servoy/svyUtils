/**
 * @param {String} _message
 *
 * @properties={typeid:24,uuid:"2109A3AB-80C0-4129-B1FC-9E781CF476F4"}
 */
function SvyException(_message) {
	
	var exceptionMessage = _message;
	
//	this.getMessage = function() {
//		return exceptionMessage;
//	}
	
	SvyException.prototype = {
		getMessage : function() {
			return exceptionMessage;
		}
	}
}

/**
 * @param {Object} _file
 *
 * @properties={typeid:24,uuid:"780D3D61-EC15-44EE-92DB-2F85786C91A5"}
 */
function FILE_NOT_FOUND(_file) {
	
	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = _file;
	
	FILE_NOT_FOUND.prototype = Object.create(new SvyException("File not found"), {
		file : { value : null, enumerable: true, configurable: true, writable: true }  
	});	
	
}

/**
 * @properties={typeid:24,uuid:"6EF711FF-7845-46FA-9671-0AC54413A667"}
 */
function test() {
	var _exc = new FILE_NOT_FOUND(plugins.file.convertToJSFile("F:\\test.xls"));
	application.output(_exc.getMessage());
	for ( var i in _exc) {
		application.output(i + " " + _exc[i])
	}
}