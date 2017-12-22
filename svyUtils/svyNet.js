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

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"511CDD43-7074-4F6E-98DB-76C8436DCB9E",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.net');

/**
 * @public
 * 
 * @enum
 * 
 * @properties={typeid:35,uuid:"20686801-4B73-4915-B354-4FE30E40B35A",variableType:-4}
 */
var IP_VERSIONS = {
	IPv6: 6,
	IPv4: 4
};

/**
 * A Regular Expression to match any IP address which is deemed to be private by the RFC-1918 Standard for IPv4.<br>
 * Uses the following ranges<br>
 * <ul>
 * <li>127.0.0.1</li>
 * <li>10.0.0.0 – 10.255.255.255</li>
 * <li>172.16.0.0 – 172. 31.255.255</li>
 * <li>192.168.0.0 – 192.168.255.255</li>
 * </ul>
 * 
 * @private
 * 
 * @type {RegExp}
 * 
 * @properties={typeid:35,uuid:"628B24C3-F308-4599-9749-AC0FD9EECFA8",variableType:-4}
 */
var RFC_1918_RANGES = /(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

/**
 * Tests if a given IP Address matches the most common internal IP patterns. Uses RFC 1918 standard for determination.<br>
 * NOTE: This method is only valid for IPv4 addresses
 * 
 * @public
 * 
 * @param {String} ipAddress
 * 
 * @return {Boolean}
 * 
 * @see http://en.wikipedia.org/wiki/Private_network
 * 
 * @properties={typeid:24,uuid:"26648F56-9E34-4830-AA96-DAA58B393051"}
 */
function isInternalIPAddress(ipAddress){
	if (!ipAddress) {
		throw new scopes.svyExceptions.IllegalArgumentException('IP Address is required');
	}
	return RFC_1918_RANGES.test(ipAddress);
}

/**
 * Gets the IP version of a given IP Address. Easy to know if it's v6 or v4 
 * 
 * @public
 * 
 * @param {String} ipAddress
 * 
 * @return {Number} version, on of the constants - IPv4, IPv6
 * 
 * @see IPv4
 * @see IPv6
 * 
 * @example if(scopes.svyNet.getIPVersion(myAddress) == scopes.svyNet.IPv6){application.output('Version 6');}
 * 
 * @properties={typeid:24,uuid:"0C61EBBD-B390-45E4-831B-F7E987407804"}
 */
function getIPVersion(ipAddress){
	if (!ipAddress) {
		throw new scopes.svyExceptions.IllegalArgumentException('IP Address is required');
	}
	var iNetAddress = java.net.InetAddress.getByName(ipAddress);
	if (iNetAddress instanceof java.net.Inet6Address) {
		return IP_VERSIONS.IPv6;
	}
	if (iNetAddress instanceof java.net.Inet4Address) {
		return IP_VERSIONS.IPv4;
	}
	return null;
}

/**
 * Tries to connect to the provided hostname. If connection is successful, true is returned, otherwise false. (time)
 * 
 * @public
 * 
 * @param {String} hostname
 * @param {Number} [timeout] timeout for the connection check (in milliseconds). Default: 200ms
 *
 * @return {Boolean} whether the host could be reached
 *  
 * @properties={typeid:24,uuid:"DFC17BE6-96D4-4FF8-A4E3-AB510B5C51A4"}
 */
function isHostAccessible(hostname, timeout) {
	var timeOut = timeout || 200;
	var socket;
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
	} catch (e) {
		if (e['javaException'] instanceof java.net.UnknownHostException) {
			log.debug('Host "{}" cannot be reached, might not exist', hostname);
		} else if (e['javaException'] instanceof java.net.SocketTimeoutException) {
			log.debug('Timeout checking host "{}"', hostname);
		} else if (e['javaException'] instanceof java.io.IOException) {
			log.debug('Network issue checking host "{}"', hostname);
		} else {
			log.debug(e);
		}
	} finally {
		if (socket != null) {
			try {
				socket.close();
			} catch (e) {
			}
		}
	}

	if (reachable) {
		return true;
	}
	return false;
}

/**
 * Tests whether the given serverAddress is reachable and returns the time it took to reach it.<p>
 * 
 * Best effort is made by the implementation to try to reach the host, but firewalls and server <br>
 * configuration may block requests resulting in a unreachable status while some specific ports <br>
 * may be accessible. A typical implementation will use ICMP ECHO REQUESTs if the privilege can <br>
 * be obtained, otherwise it will try to establish a TCP connection on port 7 (Echo) of the <br>
 * destination host. <p>
 * 
 * If the address provided contains a specific port, a socket connection is attempted on that port.
 * 
 * @public
 * 
 * @param {String} serverAddress
 * @param {Number} [iterations] optional number of iterations, when given, the average time is returned
 * @param {Number} [timeout] optional number of timeout milliseconds (defaults to 5000)
 * 
 * @return {Number} (average) ping or connection time or -1 when an error occurs
 *
 * @properties={typeid:24,uuid:"F192BB16-7E36-4615-9ADD-133AE05988C9"}
 */
function pingHost(serverAddress, iterations, timeout) {
	var uri = new java.net.URI(serverAddress);
	var host = uri.getHost();
	if (host) {
		serverAddress = host;
		log.warn('Host found as ' + serverAddress);
	}
	var port = uri.getPort();
	log.warn('Port found as ' + port);
	var inetAddress = null;
	if (!timeout) {
		timeout = 5000;
	}
	if (!iterations) {
		iterations = 1;
	}
	try {
		inetAddress = java.net.InetAddress.getByName(serverAddress);
	} catch (/** @type {java.net.UnknownHostException} */ e) {
		log.debug('Unknown host: ' + serverAddress, e);
		return -1;
	}

	var pingTimes = 0;
	var start, stop, result, i;

	var isJava8OrLater = parseFloat(java.lang.System.getProperty('java.specification.version')) >= 1.8;

	if (port !== -1 && isJava8OrLater) {
		//connect using socket (layer4)
		try {
			var socketAddress = new java.net.InetSocketAddress(inetAddress, port);
		} catch (e) {
			log.debug('Problem obtaining socket address, port may be invalid', e);
			return -1;
		}
		for (i = 1; i <= iterations; i++) {
			start = new Date();
			try {
				var sc = java.nio.channels.SocketChannel.open();
				sc.configureBlocking(true);
				if (sc.connect(socketAddress)) {
					stop = new Date();
					result = (stop.getTime() - start.getTime());
					log.debug('Socket connection to ' + serverAddress + ' took ' + result + 'ms');
					pingTimes += result;
				}
				return pingTimes / iterations;
			} catch (e) {
				log.warn('A network error has occurred', e);
				return -1;
			} finally {
				if (sc != null) {
					try {
						sc.close();
					} catch (e) {
					}
				}
			}
		}
	} else {
		//simple ping (layer3)
		try {
			for (i = 1; i <= iterations; i++) {
				start = new Date();
				if (inetAddress.isReachable(timeout)) {
					stop = new Date();
					result = (stop.getTime() - start.getTime());
					log.debug('Ping to ' + serverAddress + ' took ' + result + 'ms');
					pingTimes += result;
				}
			}
			return pingTimes / iterations;
		} catch (/** @type {java.io.IOException} */ e) {
			log.debug('A network error has occurred', e);
			return -1;
		}
	}
}

/**
 * Function to parse urls and retrieve the different parts of it. Taken from http://blog.stevenlevithan.com/archives/parseuri
 * 
 * @public
 * 
 * @param {String} url
 * @param {Boolean} [strictMode] Default false
 * 
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
	// TODO: add toString method to get back a url string after updating the parsed results
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	var o = { }
	o.strictMode = strictMode;
	o.key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];
	o.q = { };
	o.q.name = 'queryKey';
	o.q.parser = /(?:^|&)([^&=]*)=?([^&]*)/g
	o.parser = { };
	o.parser.strict = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
	o.parser.loose = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	var m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(url);
	/**@type {{anchor: String, query: String, file: String, directory: String, path: String, relative: String, port: Number, host: String, password:String, user: String, userInfo: String, authority: String, protocol:String, source: String, queryKey: Object<String>}}*/
	var uri = { };
	var i = 14;
	while (i--) uri[o.key[i]] = m[i] || '';
	uri[o.q.name] = { };
	uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) { 
			if ($1) {
				if (uri[o.q.name].hasOwnProperty($1)) {
					uri[o.q.name][$1].push($2);
				} else {
					uri[o.q.name][$1] = [$2];
				}
			}
		});

	//Attempt to add a toString function so it becomes easy to alter a parsed url (for example change port) and get the updated URL, but logic is quite complex, see Result List http://stevenlevithan.com/demo/parseuri/js/
	//TODO: update authority & relative values when setting one of their parts
	//TODO: support queryParams
	//TODO: test all variations
	uri.toString = function() {
		var retval = uri.protocol ? uri.protocol + '://' : ''
		if (uri.user) {
			retval += uri.user
			if (uri.password) {
				retval += uri.user.lastIndexOf(':') != uri.user.length ? ':' : ''
				retval += uri.password
			}
			retval += '@'
		}
		if (uri.host) retval += uri.host
		if (uri.port) retval += ':' + uri.port
		if (uri.directory) retval += uri.directory
		if (uri.file) retval += uri.file
		if (uri.query) retval += '?' + uri.query
		if (uri.anchor) retval += '#' + uri.anchor
		return retval
	}
	return uri;
}

/**
 * Raised when a there is an error in an HTTP operation, most commonly a failed request (status code != SC_OK)
 * 
 * @public
 *
 * @param {String} errorMessage
 * @param {Number} [httpCode]
 * @param {String} [httpResponseBody]
 *
 * @constructor
 * 
 * @extends {scopes.svyExceptions.SvyException}
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

	scopes.svyExceptions.SvyException.call(this, errorMessage || 'Error in HTTP operation');
}

/**
 * Thrown when an email message could not be sent
 * 
 * @public
 *
 * @param {String} [errorMessage] - usually taken from plugins.mail.getLastSendMailExceptionMsg()
 *
 * @constructor
 * 
 * @extends {scopes.svyExceptions.SvyException}
 *
 * @properties={typeid:24,uuid:"73C704EB-7D7D-4B4B-AD05-88068C478184"}
 */
function SendMailException(errorMessage) {
	scopes.svyExceptions.SvyException.call(this, errorMessage || 'Failed to send mail');
}

/**
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"C8500A7A-4B67-49CF-AEE7-3B23B180E695"}
 */
function getRemoteIPAddress() {
	try {
		var url = 'http://checkip.amazonaws.com';
		var connection = new java.net.URL(url);
		var data = connection.openConnection();
		var reader = new java.io.BufferedReader(new java.io.InputStreamReader(data.getInputStream()));
		return reader.readLine();
	} catch(e) {
		throw new scopes.svyExceptions.SvyException('Cannot get remote ip address, check internet connection');
	}
}
/**
 * Point prototypes to superclasses
 * 
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"FF2A5C77-1609-4E22-A3A2-2A40910BC57E",variableType:-4}
 */
var init = function() {
	HTTPException.prototype = Object.create(scopes.svyExceptions.SvyException.prototype);
	HTTPException.prototype.constructor = HTTPException;

	SendMailException.prototype =  Object.create(scopes.svyExceptions.SvyException.prototype);
	SendMailException.prototype.constructor = SendMailException;
}();
