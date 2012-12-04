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