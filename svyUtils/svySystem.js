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
 * TODO: Support Mobile Client where applicable in Servoy > 7.0
 */

/**
 * @private 
 *
 * @properties={typeid:35,uuid:"2BBF34E6-2B0E-4C0E-8453-4A0530CEFC16",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.system')
 
/**
 * Returns the platform specific line separator: \n on Unix systems and \r\n\ on Windows systems
 * @public 
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"F50B6DEE-B591-4691-934C-64F76B86A9AC"}
 */
var LINE_SEPARATOR = Packages.java.lang.System.getProperty("line.separator");

/**
 * Tests if the current client is Web Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"CA076FBF-D0BE-4C43-8264-0A9B87D52CC0"}
 */
function isWebClient() {
	return application.getApplicationType() === APPLICATION_TYPES.WEB_CLIENT
}

/**
 * Test is the current client is a Smart Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"F7529082-605B-4ADC-A010-84936034B364"}
 */
function isSmartClient() {
	return application.getApplicationType() === APPLICATION_TYPES.SMART_CLIENT
}

/**
 * Test if the current client is a Runtime Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"B37DF176-F87D-49EF-8558-BD6D993C1A8F"}
 */
function isRuntimeClient() {
	return application.getApplicationType() === APPLICATION_TYPES.RUNTIME_CLIENT
}

/**
 * Test if the current client is a Headless Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"8848A72B-257F-4D53-8B93-67141285CB18"}
 */
function isHeadlessClient(){
	return application.getApplicationType() === APPLICATION_TYPES.HEADLESS_CLIENT;
}

/**
 * Returns true if the client is either the Smart or Runtime Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"C7915F79-3B6C-4F99-B898-D1287B6A7D36"}
 */
function isSwingClient() {
	return [APPLICATION_TYPES.SMART_CLIENT, APPLICATION_TYPES.RUNTIME_CLIENT].indexOf(application.getApplicationType()) !== -1;
}

/**
 * Returns true if the client is either a Headless or Web Client, both of which execute their logic serverside
 * @public 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"AB51A99C-5262-4CF4-B338-CE549D417683"}
 */
function isServersideClient() {
	return [APPLICATION_TYPES.WEB_CLIENT, APPLICATION_TYPES.HEADLESS_CLIENT].indexOf(application.getApplicationType()) !== -1;
}

/**
 * Test if the current client is a Mobile Client
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"15818D17-D669-4173-AC74-9F44FD67A168"}
 */
function isMobileClient() {
	return application.getApplicationType() === APPLICATION_TYPES.MOBILE_CLIENT;
}

/**
 * Test if the current client is running Windows OS
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"D7B84F92-ACFB-48F0-9880-30111887DA75"}
 */
function isWindowsPlatform() {
	return /Windows/.test(application.getOSName())
}

/**
 * Test if current client is running Mac OS
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"9AFA3C4F-A513-4F5E-A3F7-FD3B370D07F4"}
 */
function isOSXPlatform() {
	return /Mac/.test(application.getOSName())
}

/**
 * Test if current client is running Linux OS
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"2C7CEF33-6B1A-427D-8DD2-3E98F3926014"}
 */
function isLinuxPlatform() {
	return /FreeBSD|Linux/.test(application.getOSName())
}

/**
 * Tests if the User Agent indicates an iPhone, iPad or iPod device (in Servoy Web Client)
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"00D7B1A3-72BF-4A1A-9994-133C8545DBCC"}
 */
function isIOSPlatform() {
	if([APPLICATION_TYPES.WEB_CLIENT].indexOf(application.getApplicationType()) == -1) {
		return false
	}
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo} */
	var clientInfo = Packages.org.apache.wicket.Session.get().getClientInfo()
	var userAgent = clientInfo.getUserAgent()
	return /iPhone|iPad|iPod/.test(userAgent)
}

/**
 * Tests if the User Agent indicates an Android device (in Servoy Web Client)
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"A3AEA4D4-DA10-4C6B-AC27-35E706C4ED75"}
 */
function isAndroidPlatform() {
	if([APPLICATION_TYPES.WEB_CLIENT].indexOf(application.getApplicationType()) == -1) {
		return false
	}
	
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo} */
	var clientInfo = Packages.org.apache.wicket.Session.get().getClientInfo()
	var userAgent = clientInfo.getUserAgent()
	return /Android/.test(userAgent)
}

/**
 * Tests if the User Agent indicates an Android or iOS device (in Servoy Web Client)
 * 
 * @return {Boolean}
 * @public 
 * @properties={typeid:24,uuid:"3B743FE3-088D-4754-BEDD-1A8FD059121A"}
 */
function isMobilePlatform() {
	if([APPLICATION_TYPES.WEB_CLIENT].indexOf(application.getApplicationType()) == -1) {
		return false
	}
	
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo} */
	var clientInfo = Packages.org.apache.wicket.Session.get().getClientInfo()
	var userAgent = clientInfo.getUserAgent()
	return /iPhone|iPad|iPod|Android/.test(userAgent)
}

/**
 * Returns the build number of the Servoy version
 * @public
 * @return {Number}
 * 
 * @properties={typeid:24,uuid:"B6FB2E27-B892-4B21-B911-A3F336FFA581"}
 */
function getServoyBuildNumber() {
	var x = new Packages.org.mozilla.javascript.NativeJavaObject(globals, plugins.window, new Packages.org.mozilla.javascript.JavaMembers(globals, Packages.com.servoy.extensions.plugins.window.WindowProvider));
	/** @type {Packages.com.servoy.j2db.plugins.IClientPluginAccess} */
	var clientAccess = x['getClientPluginAccess']()
	return clientAccess.getReleaseNumber()
}

/**
 * Regex for parsing the java.version string
 * @private 
 *
 * @see http://www.oracle.com/technetwork/java/javase/versioning-naming-139433.html
 * @properties={typeid:35,uuid:"EE2F825B-3B91-407D-B3EF-AC686FD0451B",variableType:-4}
 */
var javaVersionParseRegex = /^\d+\.(\d+)\.(\d+)_(\d+).*$/gm

/**
 * Returns 8.0 when running Java 8 (java.version=1.8.1_45-ea)
 * @public
 * @return {Number}
 * @properties={typeid:24,uuid:"47D1C559-29D0-4518-B56D-9A353EC08886"}
 */
function getJavaMajorVersion() {
	/**@type {String}*/
	var val = javaVersionParseRegex.exec(java.lang.System.getProperty('java.version'))[1]
	javaVersionParseRegex.lastIndex = 0
	return parseInt(val)
}

/**
 * Returns 1.0 when running Java 8.1 (java.version=1.8.1_45-ea)
 * @public
 * @return {Number}
 * @properties={typeid:24,uuid:"E6BE2E46-6F33-4640-8540-A2706931DAB1"}
 */
function getJavaMinorVersion() {
	/**@type {String}*/
	var val = javaVersionParseRegex.exec(java.lang.System.getProperty('java.version'))[2]
	javaVersionParseRegex.lastIndex = 0
	return parseInt(val)
}

/**
 * Returns 45.0 when running Java 8 update 45 (java.version=1.8.1_45-ea)
 * @public
 * @return {Number}
 * @properties={typeid:24,uuid:"BAB91917-C4BD-4AB0-8510-1C6019F20145"}
 */
function getJavaUpdateVersion() {
	/**@type {String}*/
	var val = javaVersionParseRegex.exec(java.lang.System.getProperty('java.version'))[3]
	javaVersionParseRegex.lastIndex = 0
	return parseInt(val)
}

/**
 * Gets the Smart Client deep link URL for the specified solution
 * 
 * @param {String} [solutionName]
 * @param {String} [methodName]
 * @param {Object<Array<String>>} [args]
 * @return {String}
 * @public 
 * @properties={typeid:24,uuid:"4E7BDFBE-B409-4F3D-9D16-EE298EE58DA8"}
 */
function getSolutionDeepLinkSmartClient(solutionName, methodName, args){
	if(!solutionName){
		solutionName = application.getSolutionName();
	}
	var params = [];
	if(methodName){
		params.push('m='+methodName);
	}
	if(args){
		for(var name in args){
			var values = args[name];
			params.push(name +'=' + values.join('|'));
		}
	}	
	var link = application.getServerURL() + '/servoy-client/' + solutionName + '.jnlp';
	if(params.length){
		link += '?' + params.join('&');
	}
	return link;
}

/**
 * Gets the Web Client deep link URL for the specified solution
 * 
 * @param {String} [solutionName]
 * @param {String} [methodName]
 * @param {Object} [args]
 * @return {String}
 * @public 
 * @properties={typeid:24,uuid:"493977A5-FC79-4123-B73A-C64A224E166B"}
 */
function getSolutionDeepLinkWebClient(solutionName, methodName, args){
	if(!solutionName){
		solutionName = application.getSolutionName();
	}
	var params = [];
	if(methodName){
		params.push('m/'+methodName);
	}
	if(args){
		for(var name in args){
			/** @type {Array<String>} */
			var values = args[name];
			for(var j in values){
				params.push(name +'/' + values[j]);
			}
		}
	}
	var link = application.getServerURL() + '/servoy-webclient/ss/s/' + solutionName;
	if(params.length){
		link += '/' + params.join('/');
	}
	return link;
}

/**
 * Gets the NG Client deep link URL for the specified solution
 * 
 * @param {String} warName
 * @param {String} [solutionName]
 * @param {String} [methodName]
 * @param {Object} [args]
 * @return {String}
 * @public 
 * @properties={typeid:24,uuid:"493977A5-AB79-4123-B73A-C64A224E166B"}
 */
function getSolutionDeepLinkNGClient(warName, solutionName, methodName, args){
	if(!solutionName){
		solutionName = application.getSolutionName();
	}
	var params = [];
	if(methodName){
		params.push('m='+methodName);
	}
	if(args){
		for(var name in args){
			/** @type {Array<String>} */
			var values = args[name];
			for(var j in values){
				params.push(name +'=' + values[j]);
			}
		}
	}
	var link = application.getServerURL() + '/'+warName+'/solutions/'+solutionName+'/index.html?' ;
	if(params.length){
		link +=   params.join('&');
	}
	return link;
}

/**
 * Sets the value for the defined user property. Setting is persistent. Persistence is implementation-specific
 * @param {String} name
 * @param {String} value
 * @public 
 * @properties={typeid:24,uuid:"F87CEA54-6C6D-4906-90B5-E909E0AD97B7"}
 */
function setUserProperty(name, value){
	getUserPropertyPersistenceImpl().setUserProperty(name,value);
}

/**
 * Gets the value for the defined user property
 *  
 * @param {String} name
 * @return {String}
 * @public 
 * @properties={typeid:24,uuid:"4FA111EE-21DC-4EB1-B2B4-AB17D8C191C1"}
 */
function getUserProperty(name){
	return getUserPropertyPersistenceImpl().getUserProperty(name);
}

/**
 * Cached form for default user properties persistence implementation
 * @private 
 * @type {RuntimeForm<defaultUserPropertyPersistenceImpl>}
 * @properties={typeid:35,uuid:"0CAD5724-7CE4-49EA-8B42-783BCB68FA5F",variableType:-4}
 */
var userPropPersistenceImpl;

/**
 * Gets the service provider implementation for the user property persistence mechanism
 * TODO: This returns only the FIRST subform which is registered and so assumes only ONE custom impl is registered. Can this be improved with some kind of hints?
 * 
 * @private 
 * @return {RuntimeForm<defaultUserPropertyPersistenceImpl>}
 * @properties={typeid:24,uuid:"1773B6BA-B1DF-41DA-BADC-5D8D65FE4C4E"}
 */
function getUserPropertyPersistenceImpl(){
	if(!userPropPersistenceImpl){
		var impl = 'defaultUserPropertyPersistenceImpl';
		var implementations = scopes.svyUI.getJSFormInstances(solutionModel.getForm(impl));
		if(implementations.length){
			if(implementations.length > 1){
				log.warn('User Property Persistence SPI: More than one service providers for User Property Persistence. Using first implementation encountered');
			}
			impl = implementations[0].name;
		}
		/** @type {RuntimeForm<defaultUserPropertyPersistenceImpl>} */
		userPropPersistenceImpl = forms[impl];
		persistFormInMemory(userPropPersistenceImpl);
	}
	return userPropPersistenceImpl;
}

/**
 * Used by persistFormInMemory()/desistFormInMemory() to store references to forms so they are not automatically unloaded
 * 
 * @private 
 * @properties={typeid:35,uuid:"CB9D19C2-CD8D-4654-A193-95E83848E4AC",variableType:-4}
 */
var persistentForms = []

/**
 * Prevents a form from being automatically unloaded
 * @param {RuntimeForm} form
 *
 * @see Also see {@link #desistFormInMemory()}
 * @public 
 * @properties={typeid:24,uuid:"119B971F-3D85-4EB6-AC32-5AF5511BA701"}
 */
function persistFormInMemory(form) {
	if (persistentForms.indexOf(form) == -1) {
		persistentForms.push(form)
	}
}

/**
 * Allow a form previously marked to not be automatically unloaded using {@link #persistFormInMemory(form)} to be automatically unloaded again
 * 
 * @param {RuntimeForm} form
 * @see Also see {@link #persistFormInMemory(form)}
 * @public 
 * @properties={typeid:24,uuid:"D95CC74A-84B2-4B20-8F19-F56B8964E1E5"}
 */
function desistFormInMemory(form) {
	var idx = persistentForms.indexOf(form)
	if (idx != -1) {
		persistentForms.splice(idx, 1)
	}
}
/**
 * Calls a method based on a qualified name String.
 * TODO: add example code, also how to apply this for invocation on the same form
 * @public
 *
 * @param {String} qualifiedName
 * @param {*} [args] If the value is an array, the entries in the array will be send into the method as separate arguments.
 * @param {*} [context] Optional context from where to start evaluating the qualifiedName
 * 
 * @return {*}
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 *
 * @see For getting a qualified name String for a Servoy method: {@link convertServoyMethodToQualifiedName}
 *
 * @properties={typeid:24,uuid:"33D899FA-8AC0-4E6C-BB21-46DC7EE3153A"}
 */
function callMethod(qualifiedName, args, context) {
	var bits = qualifiedName.split('.')
	var methodName = bits.pop()
	var scope = bits.length ? getObject(bits.join('.'), context) : context
	
	if (!scope || !(scope[methodName] instanceof Function)) {
		throw scopes.svyExceptions.IllegalArgumentException('\'' + qualifiedName + '\' cannot be resolved to a method')
	}
	return scope[methodName].apply(scope, args ? Array.isArray(args) ? args : [args] : null)
}

/**
 * @public
 * @param {String} qualifiedName
 * @param {*} [context]
 * @return {*}
 *
 * @properties={typeid:24,uuid:"C17D0CB5-FB9A-45BA-BEE7-9E203ED07DC5"}
 */
function getObject(qualifiedName, context) {
	if (!qualifiedName) {
		throw scopes.svyExceptions.IllegalArgumentException('\'qualifiedName\' parameter must be specified')
	}
	var bits = qualifiedName.split('.')
	var scope = context
	if (!scope || !scope[bits[0]]) {
		switch (bits[0]) {
			case 'forms':
				bits.shift()
				scope = forms[bits.shift()]
				break;
			case 'scopes':
				bits.shift()
				scope = scopes[bits.shift()]
				break;
			case 'globals':
				bits.shift()
				scope = globals
				break;
			default:
				scope = null
		}
	}
	while (scope != null && bits.length) {
		scope = scope[bits.shift()]
	}
	return scope
}

/**
 * Converts a Servoy method reference to a qualified name String
 * 
 * @public
 * 
 * @version 5.0
 * @since 18.07.2013
 * @author patrick
 *
 * @param {Function} method
 * 
 * @return {String} The qualified name for the provided method. Returns null if the provided method was not a function or not a Servoy method
 * 
 * @see For calling a Servoy method based on a qualified name String: {@link callMethod}
 *
 * @properties={typeid:24,uuid:"01FD6255-7730-45F0-8B4D-F1209F5AB5BE"}
 */
function convertServoyMethodToQualifiedName(method) {
	if (method instanceof Function) {
		try {
			var fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(method)
			if (fd.getFormName()) {
				return 'forms.' + fd.getFormName() + '.' + fd.getMethodName()
			} else if (fd.getScopeName()) {
				return 'scopes.' + fd.getScopeName() + '.' + fd.getMethodName()
			} else { //TODO: got all variations covered with the above logic?
				return null
			}
		} catch (e) {
			log.warn(e.message)
			return null;
		}
	}
	return null;
}