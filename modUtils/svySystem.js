/*
 * TODO: Support Mobile Client where applocable in Servoy >7.0
 */

/**
 * @properties={typeid:24,uuid:"3F795733-507C-479E-8F8B-986347223050"}
 */
function isWebClient() {
	return application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT
}

/**
 * @properties={typeid:24,uuid:"38954B44-9139-44ED-BD26-E0D56457199D"}
 */
function isSmartClient() {
	return application.getApplicationType() == APPLICATION_TYPES.SMART_CLIENT
}

/**
 * @properties={typeid:24,uuid:"109575EA-F6B4-4798-AF4B-E3067E59E166"}
 */
function isRuntimeClient() {
	return application.getApplicationType() == APPLICATION_TYPES.RUNTIME_CLIENT
}

/**
 * Returns true if the client is either the Smart or Runtime Client
 * @properties={typeid:24,uuid:"C68E5945-465D-452D-9A75-CE78E891917F"}
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
 * @properties={typeid:24,uuid:"886FAEB2-6882-4D24-860B-F3804A98986E"}
 */
function isWindowsPlatform() {
	return /Windows/.test(application.getOSName())
}

/**
 * @properties={typeid:24,uuid:"3856C8FE-CEA6-4DD3-99F5-02D253DCB5DC"}
 */
function isOSXPlatform() {
	return /Mac/.test(application.getOSName())
}

/**
 * @properties={typeid:24,uuid:"BB1D7D24-32C6-4CFF-BAF9-0E682FAA751C"}
 */
function isLinuxPlatform() {
	return /FreeBSD|Linux/.test(application.getOSName())
	
}

/**
 * Tests if the User Agent indicates an iPhone, iPad or iPod device (in Servoy Web Client)
 * @properties={typeid:24,uuid:"1CADF998-D886-4DE1-B43D-FAB7A7A14AFB"}
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
 * @properties={typeid:24,uuid:"95486154-ADC9-49E7-B9EB-12E1B14347FF"}
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
 * @properties={typeid:24,uuid:"B3F3DDE2-4582-4E01-A28D-97DD9AE6CEA8"}
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
 * @param {String} arg1
 * @param {Object} [additionalArgs]
 * @return {String}
 * @properties={typeid:24,uuid:"1AA45C9D-2295-42A1-BDF8-E35C62C97CAD"}
 */
function getSolutionDeepLinkSmartClient(solutionName, methodName, arg1, additionalArgs){
	if(!solutionName){
		solutionName = application.getSolutionName();
	}
	var params = [];
	if(methodName){
		params.push('m='+methodName);
	}
	if(arg1){
		params.push('a='+arg1);
	}
	if(additionalArgs){
		if(!arg1){
			throw new scopes.svyExceptions.IllegalArgumentException('Arg1 is not specified, but there is additional arguments')
		}
		for(name in additionalArgs){
			params.push(name+'='+additionalArgs[name]);
		}
	}
	var link = application.getServerURL() + '/servoy-client/' + solutionName + '.jnlp';
	if(params.length){
		link += '?' + params.join('&');
	}
	return link
}
/**
 * Gets the Web Client deep link URL for the specified solution
 * 
 * @param {String} [solutionName]
 * @param {String} [methodName]
 * @param {String} [arg1]
 * @param {Object} [additionalArgs]
 * @return {String}
 * @properties={typeid:24,uuid:"4E33E145-C058-40E9-AD26-3D52F3C2E351"}
 */
function getSolutionDeepLinkWebClient(solutionName, methodName, arg1, additionalArgs){
	if(!solutionName){
		solutionName = application.getSolutionName();
	}
	var params = [];
	if(methodName){
		params.push('m/'+methodName);
	}
	if(arg1){
		params.push('a/'+arg1);
	}
	if(additionalArgs){
		if(!arg1){
			throw new scopes.svyExceptions.IllegalArgumentException('Arg1 is not specified, but there is additional arguments')
		}
		for(name in additionalArgs){
			params.push(name+'/'+additionalArgs[name]);
		}
	}
	var link = application.getServerURL() + '/servoy-webclient/ss/s/' + solutionName;
	if(params.length){
		link += '/' + params.join('/');
	}
	return link;
}