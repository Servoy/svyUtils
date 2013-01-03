/**
 * @enum
 * @properties={typeid:35,uuid:"0B65A4C8-2FDF-429A-BDB6-4AB89BD0431F",variableType:-4}
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
 * @properties={typeid:35,uuid:"90150791-6CF0-4FEA-961C-B4A366AA6278",variableType:-4}
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
 * @properties={typeid:24,uuid:"523E5A3F-E202-4DF4-9115-06786712E64E"}
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
 * @see scopes.svyNet.IPv4
 * @see scopes.svyNet.IPv6
 * @example if(scopes.svyNet.getIPVersion(myAddress) == scopes.svyNet.IPv6){application.output('Version 6');}
 * @properties={typeid:24,uuid:"B2102E81-89F8-408B-A22E-2A0FA89C4BBC"}
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
 * @properties={typeid:24,uuid:"9D72F66F-3712-4DFE-BAAF-C85F3E821E72"}
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
	} catch (e if e.javaException instanceof java.net.UnknownHostException) {
		application.output('Host "' + hostname + '" cannot be reached, might not exist', LOGGINGLEVEL.DEBUG)
	} catch (e if e.javaException instanceof java.net.SocketTimeoutException) {
		application.output('Timeout checking host "' + hostname + '"', LOGGINGLEVEL.DEBUG)
	} catch (e if e.javaException instanceof java.io.IOException) {
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
 * FIXME: A queryString with multiple values for the same parameter is not supported. The queryKey only returns the last value: ?x=1&x=2 becomes ...,"queryKey":{"x":"2"}
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
 * @properties={typeid:24,uuid:"EE60CFA1-0E5E-4457-899F-45CB3E9271F3"}
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