/**
 * @override
 * @return {String}
 * @properties={typeid:24,uuid:"3B9C8B8E-94EF-47C1-ABE0-0E76251A74E1"}
 */
function getId() {
	return 'com.servoy.bap.utils'
}

/**
 * @override
 * @return {String}
 * @properties={typeid:24,uuid:"A50D16C1-B07F-4D49-B22C-6888D8843E9B"}
 */
function getVersion() {
	return application.getVersionInfo()['svyUtils'];
}