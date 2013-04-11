/**
 * @enum
 * @properties={typeid:35,uuid:"20686801-4B73-4915-B354-4FE30E40B35A",variableType:-4}
 */
var IP_VERSIONS = {
	IPv6:6,
	IPv4:4
};

/**
 * A Regular Expression to match any IP address which is deemed to be private by the RFC-1918 Standard for IPv4.
 * Uses the following ranges
 * 
 * 127.  0.0.1
 * 10.   0.0.0 –  10.255.255.255
 * 172. 16.0.0 – 172. 31.255.255
 * 192.168.0.0 – 192.168.255.255
 * 
 * @type {RegExp}
 * @private
 * @properties={typeid:35,uuid:"628B24C3-F308-4599-9749-AC0FD9EECFA8",variableType:-4}
 */
var RFC_1918_RANGES = /(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

/**
 * Tests if a given IP Address matches the most common internal IP patterns. Uses RFC 1918 standard for determination. 
 * NOTE: This method is only valid for IPv4 addresses
 * 
 * @param {String} ipAddress
 * @return {Boolean}
 * 
 * @see http://en.wikipedia.org/wiki/Private_network 
 * @properties={typeid:24,uuid:"26648F56-9E34-4830-AA96-DAA58B393051"}
 */
function isInternalIPAddress(ipAddress){
	if(!ipAddress){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('IP Address is required');
	}
	return RFC_1918_RANGES.test(ipAddress);
}

/**
 * Gets the IP version of a given IP Address. Easy to know if it's v6 or v4 
 * @param {String} ipAddress
 * @return {Number} version, on of the constants - IPv4, IPv6
 * @see IPv4
 * @see IPv6
 * @example if(scopes.modUtils$net.getIPVersion(myAddress) == scopes.modUtils$net.IPv6){application.output('Version 6');}
 * @properties={typeid:24,uuid:"0C61EBBD-B390-45E4-831B-F7E987407804"}
 */
function getIPVersion(ipAddress){
	if(!ipAddress){
		throw new scopes.modUtils$exceptions.IllegalArgumentException('IP Address is required');
	}
	var iNetAddress = java.net.InetAddress.getByName(ipAddress);
	if(iNetAddress instanceof java.net.Inet6Address){
		return IP_VERSIONS.IPv6;
	}
	if(iNetAddress instanceof java.net.Inet4Address){
		return IP_VERSIONS.IPv4;
	}
	return null;
}

/**
 * Tries to connect to the provided hostname. If connection is successful, true is returned, otherwise false. (time)
 * 
 * @param {String} hostname
 * @param {Number} [timeout] timeout for the connection check (in milliseconds). Default: 200ms
 *
 * @return {Boolean} whether the host could be reached 
 * @properties={typeid:24,uuid:"DFC17BE6-96D4-4FF8-A4E3-AB510B5C51A4"}
 */
function isHostAccessible(hostname, timeout) {
	var timeOut = timeout || 200
	var socket
	var reachable = false;
	try {
		var addr = java.net.InetAddress.getByName(hostname);
		var port = 80;
		//Setting type to super class to prevent warnings
		/**@type {Packages.java.net.SocketAddress}*/ 
		var sockaddr = new java.net.InetSocketAddress(addr, port);

		// Create an unbound socket
		socket = new java.net.Socket();

		// If the timeout occurs, SocketTimeoutException is thrown.
		socket.connect(sockaddr, timeOut);
		reachable = true;
	} catch (e if e['javaException'] instanceof java.net.UnknownHostException) {
		application.output('Host "' + hostname + '" cannot be reached, might not exist', LOGGINGLEVEL.DEBUG)
	} catch (e if e['javaException'] instanceof java.net.SocketTimeoutException) {
		application.output('Timeout checking host "' + hostname + '"', LOGGINGLEVEL.DEBUG)
	} catch (e if e['javaException'] instanceof java.io.IOException) {
		application.output('Network issue checking host "' + hostname + '"', LOGGINGLEVEL.DEBUG)
	} catch (e) {
		application.output(e)
	} finally {
		if (socket != null) {
			try {
				socket.close()
			} catch (e) {
			}
		}
	}

	if (reachable) {
		return true
	}
	return false
}

/**
 * Function to parse urls and retrieve the different parts of it. Taken from http://blog.stevenlevithan.com/archives/parseuri
 * 
 * TODO: A queryString with multiple values for the same parameter is not supported. The queryKey only returns the last value: ?x=1&x=2 becomes ...,"queryKey":{"x":"2"}
 * 
 * @param {String} url
 * @param {Boolean} [strictMode] Default false
 * @return {{
 * 	anchor: String, 
 * 	query: String, 
 * 	file: String, 
 * 	directory: String, 
 * 	path: String, 
 * 	relative: String, 
 * 	port: Number, 
 * 	host: String, 
 * 	password:String, 
 * 	user: String, 
 * 	userInfo: String, 
 * 	authority: String, 
 * 	protocol:String, 
 * 	source: String, 
 * 	queryKey: Object<String>
 * }}
 *
 * @properties={typeid:24,uuid:"B8CC3376-A5FA-45E5-80C5-C6860B94B9DF"}
 */
function parseUrl(url, strictMode) {
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	var o = { }
	o.strictMode = strictMode;
	o.key = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	o.q = { };
	o.q.name = "queryKey";
	o.q.parser = /(?:^|&)([^&=]*)=?([^&]*)/g
	o.parser = { };
	o.parser.strict = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
	o.parser.loose = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/

	var m = o.parser[o.strictMode ? "strict" : "loose"].exec(url);
	/**@type {{anchor: String, query: String, file: String, directory: String, path: String, relative: String, port: Number, host: String, password:String, user: String, userInfo: String, authority: String, protocol:String, source: String, queryKey: Object<String>}}*/
	var uri = { };
	var i = 14;
	while (i--) uri[o.key[i]] = m[i] || "";
	uri[o.q.name] = { };
	uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) { 
			if ($1) uri[o.q.name][$1] = $2;
		});
	return uri;
}

/**
 * Raised when a there is an error in an HTTP operation, most commonly a failed request (status code != SC_OK)
 *
 * @param {String} errorMessage
 * @param {Number} [httpCode]
 * @param {String} [httpResponseBody]
 *
 * @constructor
 * @extends {scopes.modUtils$exceptions.SvyException}
 *
 * @author Sean
 *
 * @properties={typeid:24,uuid:"1BA6E44B-4467-4057-AE26-7A0F49D9B826"}
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

	scopes.modUtils$exceptions.SvyException.call(this, errorMessage);
}


/**
 * Thrown when an email message could not be sent
 *
 * @param {String} [errorMessage] - usually taken from plugins.mail.getLastSendMailExceptionMsg()
 *
 * @constructor
 * @extends {scopes.modUtils$exceptions.SvyException}
 *
 * @properties={typeid:24,uuid:"73C704EB-7D7D-4B4B-AD05-88068C478184"}
 */
function SendMailException(errorMessage) {
	scopes.modUtils$exceptions.SvyException.call(this, errorMessage);
}

/**
 * Point prototypes to superclasses
 * @protected 
 *
 * @properties={typeid:35,uuid:"FF2A5C77-1609-4E22-A3A2-2A40910BC57E",variableType:-4}
 */
var init = function() {
	HTTPException.prototype = new scopes.modUtils$exceptions.SvyException("Error in HTTP operation");
	SendMailException.prototype = new scopes.modUtils$exceptions.SvyException("Failed to send mail");
}();