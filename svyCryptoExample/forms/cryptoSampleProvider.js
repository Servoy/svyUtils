
/**
 * @public 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"6BB2CCB7-84B4-4627-9BEF-F68BA0616D74"}
 */
function getDescription() {
	return 'Example of Cryptographic APIs supported by this extension';
}


/**
* @public 
* @return {String} Download URL
*
* @properties={typeid:24,uuid:"D86941E9-A145-4112-BE95-FA457F24F696"}
*/
function getDownloadURL() {
	return 'https://github.com/Servoy/svyUtils/releases/download/v1.2.0/svyCryptoExample.servoy';
}



/**
* @public 
* @return {String}
*
* @properties={typeid:24,uuid:"B8D90AB8-7041-420F-98E7-0A017281F1EE"}
*/
function getIconStyleClass() {
	return 'fa-lock';
}

/**
*
* @return {String} Additioanl info (wiki markdown supported)
*
* @properties={typeid:24,uuid:"906A1A95-9352-4337-8F0A-7A6D7532D15E"}
*/
function getMoreInfo() {
	return plugins.http.getPageData('https://raw.github.com/wiki/Servoy/svyUtils/svyCrypto.md')
}

/**
* @public 
* @return {String}
*
* @properties={typeid:24,uuid:"2447690B-1EA3-46CE-B12A-69BEA77FD962"}
*/
function getName() {
	return 'Cryptography';
}

/**
*
* @return {RuntimeForm<AbstractMicroSample>}
*
* @properties={typeid:24,uuid:"8F8FBFE6-CEBE-444E-9DE9-18FB40D728D8"}
*/
function getParent() {
	return forms.extensionSamples;
}

/**
* @public 
* @return {Array<String>} code lines
*
* @properties={typeid:24,uuid:"46E7EA89-713E-4C36-8F55-225A00973656"}
*/
function getSampleCode() {
	return printMethodCode(forms.exampleCrypto.encrypt)
	.concat(printMethodCode(forms.exampleCrypto.decrypt));
}

/**
*
* @return {String} Website URL
*
* @properties={typeid:24,uuid:"9B79B0CD-7561-4C26-80B4-7E7B18A78CF3"}
*/
function getWebSiteURL() {
	return 'https://github.com/Servoy/svyUtils/wiki/svyCrypto';
}
