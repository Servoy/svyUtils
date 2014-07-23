
/**
 * Callback method for when solution is closed, force boolean argument tells if this is a force (not stoppable) close or not.
 *
 * @param {Boolean} force if false then solution close can be stopped by returning false
 *
 * @returns {Boolean}
 *
 * @properties={typeid:24,uuid:"54E8EB4C-CBDF-4AD2-BDBF-972D43FA1B9B"}
 */
function onSolutionClose(force) {
	var log = scopes.svyLogManager.getLogger('bap.utils.jenkins.istanbul')

	// write coverage json object.
	var coverageExists = false;
	try {
		if (__coverage__) {
			coverageExists = true;
		}
	} catch (e) {
		log.info('__coverage__ is not defined')
	}
	
	if (coverageExists) {
		// TODO change file path
		var filePath = "C:\\Program Files (x86)\\Jenkins\\jobs\\svyUtils\\workspace\\JenkinsConfig\\svyJenkinsConfig\\CBI_config\\report_coverage\\coverage.json"
		var jsFile = plugins.file.createFile(filePath)
		if (!plugins.file.writeTXTFile(jsFile,JSON.stringify(__coverage__),'UTF-8','json')) {
			log.error('Cannot write file ' + filePath)
		} else {
			log.info('coverage file ' + filePath + ' written with success')
		}
		
//		try {
//			scopes.istanbul_scope.initIstanbul();
//		} catch (e) {
//			application.output('C: cannot init istanbul_scope')
//			application.output(e)
//		}
	} 
	return true
}

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"4E14F1C2-C4DB-46FF-A83B-A340D75BB1E7"}
 */
function onSolutionOpen(arg, queryParams) {
	try {
		scopes.istanbul_scope.initIstanbul();
	} catch (e) {
		application.output('cannot init istanbul_scope')
		application.output(e)
	}
}
