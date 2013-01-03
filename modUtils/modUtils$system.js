/*
 * TODO: Support Mobile Client where applocable in Servoy >7.0
 */

/**
 * @properties={typeid:24,uuid:"CA076FBF-D0BE-4C43-8264-0A9B87D52CC0"}
 */
function isWebClient() {
	return application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT
}

/**
 * @properties={typeid:24,uuid:"F7529082-605B-4ADC-A010-84936034B364"}
 */
function isSmartClient() {
	return application.getApplicationType() == APPLICATION_TYPES.SMART_CLIENT
}

/**
 * @properties={typeid:24,uuid:"B37DF176-F87D-49EF-8558-BD6D993C1A8F"}
 */
function isRuntimeClient() {
	return application.getApplicationType() == APPLICATION_TYPES.RUNTIME_CLIENT
}

/**
 * Returns true if the client is either the Smart or Runtime Client
 * @properties={typeid:24,uuid:"C7915F79-3B6C-4F99-B898-D1287B6A7D36"}
 */
function isSwingClient() {
	return [APPLICATION_TYPES.SMART_CLIENT, APPLICATION_TYPES.RUNTIME_CLIENT].indexOf(application.getApplicationType()) 
}

//TODO: uncomment in Servoy 7.0
///**
// * @properties={typeid:24,uuid:"15818D17-D669-4173-AC74-9F44FD67A168"}
// */
//function isMobileClient() {
//	return application.getApplicationType() == APPLICATION_TYPES.MOBILE_CLIENT
//}

/**
 * @properties={typeid:24,uuid:"D7B84F92-ACFB-48F0-9880-30111887DA75"}
 */
function isWindowsPlatform() {
	return /Windows/.test(application.getOSName())
}

/**
 * @properties={typeid:24,uuid:"9AFA3C4F-A513-4F5E-A3F7-FD3B370D07F4"}
 */
function isOSXPlatform() {
	return /Mac/.test(application.getOSName())
}

/**
 * @properties={typeid:24,uuid:"2C7CEF33-6B1A-427D-8DD2-3E98F3926014"}
 */
function isLinuxPlatform() {
	return /FreeBSD|Linux/.test(application.getOSName())
	
}

/**
 * Tests if the User Agent indicates an iPhone, iPad or iPod device (in Servoy Web Client)
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
 * @properties={typeid:24,uuid:"3B743FE3-088D-4754-BEDD-1A8FD059121A"}
 */
function isMobilePlatform() {
	if([APPLICATION_TYPES.WEB_CLIENT].indexOf(application.getApplicationType()) == -1) {
		return false
	}
	
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo} */
	var clientInfo = Packages.org.apache.wicket.Session.get().getClientInfo()
	var userAgent = clientInfo.getUserAgent()
	return /iPhone|iPad|Android/.test(userAgent)
}

/**
 * Gets the Smart Client deep link URL for the specified solution
 * 
 * @param {String} [solutionName]
 * @param {String} [methodName]
 * @param {Object} [args]
 * @return {String}
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
		for(name in args){
			/** @type {Array<String>} */
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
		for(name in args){
			/** @type {Array<String>} */
			var values = args[name];
			for(j in values){
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
 * Sets the value for the defined user property. Setting is persistent. Persistence is implementation-specific
 * @param {String} name
 * @param {String} value
 *
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
 * @properties={typeid:24,uuid:"4FA111EE-21DC-4EB1-B2B4-AB17D8C191C1"}
 */
function getUserProperty(name){
	return getUserPropertyPersistenceImpl().getUserProperty(name);
}

/**
 * Gets the service provider implementation for the user property persistence mechanism
 * TODO: This returns only the FIRST subform which is registered and so assumes only ONE custom impl is registered. Can this be improved with some kind of hints?
 * 
 * @private 
 * @return {RuntimeForm<defaultUserPropertyPersistenceImpl>}
 * @properties={typeid:24,uuid:"1773B6BA-B1DF-41DA-BADC-5D8D65FE4C4E"}
 */
function getUserPropertyPersistenceImpl(){
	var impl = 'defaultUserPropertyPersistenceImpl';
	var implementations = scopes.modUtils$UI.getJSFormInstances(solutionModel.getForm(impl));
	if(implementations.length){
		if(implementations.length > 1){
			application.output('User Property Persistence SPI: More than one service providers for User Property Persistence. Using first implementation encountered',LOGGINGLEVEL.WARNING);
		}
		impl = implementations[0].name;
	}
	/** @type {RuntimeForm<defaultUserPropertyPersistenceImpl>} */
	var form = forms[impl];
	persistFormInMemory(form);
	return form;
}
/**
 * Used by persistFormInMemory()/desistFormInMemory() to store references to forms so they are not automatically unloaded
 * @private 
 * @properties={typeid:35,uuid:"CB9D19C2-CD8D-4654-A193-95E83848E4AC",variableType:-4}
 */
var persistentForms = []

/**
 * Prevents a form from being automatically unloaded
 * @param {RuntimeForm} form
 *
 * @see Also see {@link #desistFormInMemory()}
 * @properties={typeid:24,uuid:"119B971F-3D85-4EB6-AC32-5AF5511BA701"}
 */
function persistFormInMemory(form) {
	if (persistentForms.indexOf(form) == -1) {
		persistentForms.push(form)
	}
}

/**
 * Allow a form previously marked to not be automatically unloaded using {@link #persistFormInMemory(form)} to be automatically unloaded again
 * @param {RuntimeForm} form
 * @see Also see {@link #persistFormInMemory(form)}
 *
 * @properties={typeid:24,uuid:"D95CC74A-84B2-4B20-8F19-F56B8964E1E5"}
 */
function desistFormInMemory(form) {
	var idx = persistentForms.indexOf(form)
	if (idx != -1) {
		persistentForms.splice(idx, 1)
	}
}


