
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
		var filePath = "C:\\Program Files (x86)\\Jenkins\\jobs\\svyUtils\\report_coverage\\coverage.json"
		var jsFile = plugins.file.createFile(filePath)
		if (!plugins.file.writeTXTFile(jsFile,JSON.stringify(__coverage__),'UTF-8','json')) {
			log.error('Cannot write file ' + filePath)
		} else {
			log.info('coverage file ' + filePath + ' written with success')
		}
	} 
	return true
}
