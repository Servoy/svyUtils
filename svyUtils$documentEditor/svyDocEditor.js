
/**
 * @protected
 * @type {plugins.http.HttpClient}
 * @properties={typeid:35,uuid:"63B02A38-7F6A-48AD-8332-EC3FA53976A1",variableType:-4}
 */
var httpClient = plugins.http.createNewHttpClient();

/**
 * @public 
 * @constructor 
 * @properties={typeid:24,uuid:"5CB62940-6757-4B32-8145-999AC1B82F03"}
 */
function exportObject() {
	/**
	 * Key to allow unlimited PDF Export
	 * @type {String}
	 */
	this.key = '';
	
	/**
	 * HTML to convert
	 * @type {String}
	 */
	this.html = '';
	
	/**
	 * OPTIONAL: CSS to use when rendering the HTML
	 * @type {String}
	 */
	this.css = '';
	
	/**
	 * OPTIONAL: Array with additional head tags
	 * @type {Array<String>}
	 */
	this.additionalHead = [];
	
	/**
	 * OPTIONAL: Remote image URL to use for parsing the images (only when no inline images)
	 * @type {String}
	 */
	this.imageURL = application.getServerURL();
	
	/**
	 * OPTIONAL: Margins for page to print, will default to: {"bottom": 20, "left": 12, "right": 12, "top": 20}
	 * @type {Object}
	 */
	this.margin = {"bottom": 20, "left": 12, "right": 12, "top": 20}
	
	/**
	 * OPTIONAL: paperSize to print, will default to: A4
	 * @type {String}
	 */
	this.paperSize = 'A4';
	
	/**
	 * OPTIONAL: orientation to print, will default to: Portrait
	 * @type {String}
	 */
	this.orientation = 'Portrait';
	
	/**
	 * @public 
	 * @return {Object}
	 */
	this.getJSON = function() {
		return {
			"key": this.key,
			"html": this.html,
			"css": this.css,
			"additionalHead": this.additionalHead,
			"imageURL": this.imageURL,
			"margin": this.margin,
			"paperSize": this.paperSize,
			"orientation": this.orientation
		}
	}
}

/**
 * @public
 *  
 * @param {exportObject} exportConfig
 * @return {Array<byte>}
 * 
 * @properties={typeid:24,uuid:"297DCD9D-5897-4A8B-98C8-7C676B666203"}
 */
function generatePDF(exportConfig) {
	var postURL = application.isInDeveloper() ? 'http://admin-dev.servoy-cloud.eu:4000/generatePDF' : 'http://localhost:4000/generatePDF';
	var post = httpClient.createPostRequest(postURL);
	post.setBodyContent(JSON.stringify(exportConfig.getJSON()));
	var result = post.executeRequest();
	if (result.getStatusCode() == 200) {
		return result.getMediaData();
	} else {
		application.output('Connection Error: ' + result.getStatusCode() + ' with error: ' + result.getResponseBody(), LOGGINGLEVEL.ERROR);
		return null;
	}
}
