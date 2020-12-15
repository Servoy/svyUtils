/**
 * @private 
 * @properties={typeid:35,uuid:"D637E7BC-550A-4347-BB23-42BD6B3BC29C",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.ngutils');

/**
 * @param {String} styleClass
 * @param {String} className
 *
 * @return {String}
 *
 * @public
 * @properties={typeid:24,uuid:"6FC6238B-ED6D-4AA4-8FD1-185E57619FEA"}
 */
function addStyleClass(styleClass, className) {
	if (!className) {
		return styleClass;
	}

	if (!styleClass) { // no styleClass
		styleClass = className;
	} else {
		if (hasStyleClass(styleClass, className)) {
			return styleClass;
		} else {
			var regex = new RegExp('\\s$', 'g')
			if (!regex.test(styleClass)) {
				styleClass += " ";
			}
			styleClass += className;
		}
	}
	return styleClass;
}

/**
 * @param {String} styleClass
 * @param {String} className
 *
 * @return {String}
 *
 * @public
 * @properties={typeid:24,uuid:"86011A42-0A86-45CF-8D96-D9540EC05E00"}
 */
function removeStyleClass(styleClass, className) {

	if (styleClass && className) {
		if (hasStyleClass(styleClass, className)) {
			var regex = getRegEx(className);
			styleClass = styleClass.replace(regex, '');
		}
	}
	return styleClass;
}

/**
 * @param {String} styleClass
 * @param {String} className
 *
 * @return {Boolean}
 *
 * @public
 *
 * @properties={typeid:24,uuid:"4F796975-C5E6-4C89-B33B-DB0AD22CF99C"}
 */
function hasStyleClass(styleClass, className) {
	var regex = getRegEx(className)
	return regex.test(styleClass);

}

/**
 * @private
 * @param {String} className
 * @return {RegExp}
 *
 * @properties={typeid:24,uuid:"1EEC6A39-0766-46E7-9714-4FE3CA62F956"}
 */
function getRegEx(className) {
	// /(^|\s)\bword\b((?=\s)|$)/g string start or whitespace before className. ends with whitespace or end of string
	// var regex = new RegExp('(^|\\s)\\b' + className + '\\b((?=\\s)|$)', 'g');

	// string start or whitespace before className. ends with whitespace or end of string. (?=\\s).) is used as a positive lookbehind (white space before btn)
	return new RegExp('(^|(?=\\s).)\\b' + className + '\\b((?=\\s)|$)', 'g');
}



/**
 * @param {String} mediaFileName
 * 
 * @return {String}
 * @public 
 *
 * @properties={typeid:24,uuid:"B3E8F172-2A48-4D22-9829-FECA3799B179"}
 */
function getMediaURL(mediaFileName) {
	if (!solutionModel.getMedia(mediaFileName)) {
		log.error("Cannot find the media file " + mediaFileName);
		return null;
	}
	
	return "resources/fs/" + application.getSolutionName() + "/" + mediaFileName;
}