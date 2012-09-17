/**
 * @param {String} errorMessage
 *
 * @properties={typeid:24,uuid:"2109A3AB-80C0-4129-B1FC-9E781CF476F4"}
 */
function SvyException(errorMessage) {
	
	var message = errorMessage;
	
	this.getMessage = function() {
		return message;
	}
	
	Object.defineProperty(this, "message", {
		get: function() {
			return message;
		},
		set: function(x) {
			
		}
	});
}

/**
 * @param {plugins.file.JSFile} file
 *
 * @properties={typeid:24,uuid:"780D3D61-EC15-44EE-92DB-2F85786C91A5"}
 */
function FILE_NOT_FOUND(file) {
	
	/**
	 * The file that could not be found
	 * @type {plugins.file.JSFile}
	 */
	this.file = file;
	
	FILE_NOT_FOUND.prototype = new SvyException("File not found");
}

/**
 * @properties={typeid:24,uuid:"6EF711FF-7845-46FA-9671-0AC54413A667"}
 */
function test() {
	new Error();
	var _exc = new FILE_NOT_FOUND(plugins.file.convertToJSFile("F:\\test.xls"));
	application.output(_exc.message);
	for ( var i in _exc) {
		application.output(i + " " + _exc[i])
	}
}