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
 * @param {Object} [args]
 * @return {String}
 * @properties={typeid:24,uuid:"1AA45C9D-2295-42A1-BDF8-E35C62C97CAD"}
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
 * @properties={typeid:24,uuid:"4E33E145-C058-40E9-AD26-3D52F3C2E351"}
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
 * @properties={typeid:24,uuid:"11429A0F-77E8-42D0-91CD-7DFC2E81EB5A"}
 */
function setUserProperty(name, value){
	getUserPropertyPersistanceImpl().setUserProperty(name,value);
}

/**
 * Gets the value for the defined user property
 *  
 * @param {String} name
 * @return {String}
 * @properties={typeid:24,uuid:"5590FDC7-1E21-4D35-9EEE-DC34A63F78D4"}
 */
function getUserProperty(name){
	return getUserPropertyPersistanceImpl().getUserProperty(name);
}

/**
 * Gets the service provider implementation for the user property persistence mechanism
 * TODO: This returns only the FIRST subform which is registered and so assumes only ONE custom impl is registered. Can this be improved with some kind of hints?
 * 
 * @private 
 * @return {RuntimeForm<defaultUserPropertyPersistanceImpl>}
 * @properties={typeid:24,uuid:"48047CB6-B07F-466C-85B9-77317B651EB8"}
 */
function getUserPropertyPersistanceImpl(){
	var impl = 'defaultUserPropertyPersistanceImpl';
	var implementations = scopes.svyUI.getJSFormInstances(solutionModel.getForm(impl));
	if(implementations.length){
		if(implementations.length > 1){
			application.output('User Property Persistence SPI: More than one service providers for User Property Persistence. Using first implementation encountered',LOGGINGLEVEL.WARNING);
		}
		impl = implementations[0].name;
	}
	/** @type {RuntimeForm<defaultUserPropertyPersistanceImpl>} */
	var form = forms[impl];
	persistFormInMemory(form);
	return form;
}
/**
 * Used by persistFormInMemory()/desistFormInMemory() to store references to forms so they are not automatically unloaded
 * @private 
 * @properties={typeid:35,uuid:"F444A6BF-1B5F-4745-A287-202CDE6AB020",variableType:-4}
 */
var persistentForms = []

/**
 * Prevents a form from being automatically unloaded
 * @param {RuntimeForm} form
 *
 * @see Also see {@link #desistFormInMemory()}
 * @properties={typeid:24,uuid:"DE32565B-093F-418F-8A91-446E6BD03ABE"}
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
 * @properties={typeid:24,uuid:"3FEB59D8-CD26-4184-93CC-77819ED03F33"}
 */
function desistFormInMemory(form) {
	var idx = persistentForms.indexOf(form)
	if (idx != -1) {
		persistentForms.splice(idx, 1)
	}
}


