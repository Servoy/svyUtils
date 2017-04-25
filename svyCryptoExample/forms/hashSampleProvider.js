/**
 * @public 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"BF5EF4B3-817C-4A0D-8E29-DAD0D8C0475D"}
 */
function getDescription() {
	return 'Example of Hashing APIs supported by this extension';
}

/**
* @public 
* @return {String} Download URL
*
* @properties={typeid:24,uuid:"A42E1A26-2289-46BE-AE70-B4F98184429F"}
*/
function getDownloadURL() {
	return 'https://github.com/Servoy/svyUtils/releases/download/v1.2.0/svyCryptoExample.servoy';
}

/**
* @public 
* @return {String}
*
* @properties={typeid:24,uuid:"B75A1D8F-3DB7-44E4-83A2-60472FCB893C"}
*/
function getIconStyleClass() {
	return 'fa-hashtag';
}

/**
*
* @return {String} Additioanl info (wiki markdown supported)
*
* @properties={typeid:24,uuid:"9A13D5D7-82AF-4C3D-8AD0-9FDE7057A09E"}
*/
function getMoreInfo() {
	return plugins.http.getPageData('https://raw.github.com/wiki/Servoy/svyUtils/svyCrypto.md')
}

/**
* @public 
* @return {String}
*
* @properties={typeid:24,uuid:"8F261C79-801B-47C9-AEF3-B00ED68AC3ED"}
*/
function getName() {
	return 'Secure Hashing';
}

/**
*
* @return {RuntimeForm<AbstractMicroSample>}
*
* @properties={typeid:24,uuid:"5FDABD53-B45D-4DCF-928F-84FD3CCD065E"}
*/
function getParent() {
	return forms.extensionSamples;
}

/**
* @public 
* @return {Array<String>} code lines
*
* @properties={typeid:24,uuid:"07E24FE6-BADB-464A-8CE1-770A2C02B301"}
*/
function getSampleCode() {
	return printMethodCode(forms.exampleHash.hash);
}

/**
*
* @return {String} Website URL
*
* @properties={typeid:24,uuid:"C3EC3208-C8D3-4CED-8D79-B5AB5E4AF3BA"}
*/
function getWebSiteURL() {
	return 'https://github.com/Servoy/svyUtils/wiki/svyCrypto';
}
