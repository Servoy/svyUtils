/**
 * @override
 * @return {String}
 * @properties={typeid:24,uuid:"58AE6677-2C19-4C22-A2F1-1191A44AD5F4"}
 */
function getId() {
	return 'com.servoy.bap.utils.unittest'
}

/**
 * @override
 * @return {String}
 * @properties={typeid:24,uuid:"7121DBE3-46A2-4538-B1F3-06E26BC0BD3D"}
 */
function getVersion() {
	return application.getVersionInfo()['svyUtils$unitTest'];
}
