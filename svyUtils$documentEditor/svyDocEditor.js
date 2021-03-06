
/**
 * Orientation options for PDF export
 * @public 
 * @enum
 * @see Exporter.setOrientation 
 * @properties={typeid:35,uuid:"5FF39323-777B-4B3F-930D-F2B6BE25F9AD",variableType:-4}
 */
 var ORIENTATION = {
	PORTRAIT:'Portrait',
	LANDSCAPE:'Landscape'
}

/**
 * Page size options for PDF export
 * @public 
 * @enum 
 * @see Exporter.setPageSize
 * @properties={typeid:35,uuid:"0CEC1095-8E27-4568-B972-EB0B26869C85",variableType:-4}
 */
var PAGE_SIZE = {
	A4 : 'A4'
}

/**
 * @public   
 * @enum {String}
 * @properties={typeid:35,uuid:"45646E48-A651-4EE5-9824-B33A2452062C",variableType:-4}
 */
var TAGS = {
	REPEAT: '$',
	TAG: '#'
}
/**
 * @private   
 * @enum {String}
 * @properties={typeid:35,uuid:"45A567D0-9184-4613-A30B-CF3023CF79D4",variableType:-4}
 */
var DEFAULT_REPEATER = {
	START: 'startRepeater',
	STOP: 'endRepeater'
}

/**
 * @private  
 * @enum {RegExp}
 * @properties={typeid:35,uuid:"3CFFA067-6A8D-402E-B69D-4953037D26EC",variableType:-4}
 */
var REGEX = {
	MENTION: /<span[^>]+\ssvy-mention\b[^>]*>.*?<\/span>(&nbsp;)?/gm,
	START_REPEAT: /^<span[^>]+\ssvy-mention\b[^>]*>\$startRepeater\b[^<]*<\/span>(\s|&nbsp;|<br>)*/gm,
	START_REPEAT_TABLE: /^<span[^>]+\ssvy-mention\b[^>]*>\$startRepeater\b[^<]*<\/span>(&nbsp;|<\/p>)*?(<figure class="table">)?<table>/gm,
	END_REPEAT: /<span[^>]+\ssvy-mention\b[^>]*>\$endRepeater<\/span>(&nbsp;)?$/gm,
	END_REPEAT_TABLE: /<\/table>(<\/figure>)?(<p>)?<span[^>]+\ssvy-mention\b[^>]*>\$endRepeater<\/span>(&nbsp;|<\/p>|<br>)*$/gm,
	FULL_REPEAT_BLOCK: /(<span[^>]+\ssvy-mention\b[^>]*>\$startRepeater\b[^<]*<\/span>(&nbsp;)?(<\/p>)?(<figure class="table">)?(<table>)?).*((<\/table>)?(<\/figure>)?(<p>)?<span[^>]+\ssvy-mention\b[^>]*>\$endRepeater<\/span>(&nbsp;)?)/gm,
	FULL_TABLE_ROW: /<tr>.*<\/tr>/gm,
	FULL_TABLE_HEADER: /<tr>.*<\/thead><tbody>/gm,
	BR_END: /<br>$/gm
}

/**
 * @private 
 * @type {plugins.http.HttpClient}
 * @properties={typeid:35,uuid:"6DFF7804-B4FF-4ECA-B4B1-82683FF14762",variableType:-4}
 */
var httpClient = plugins.http.createNewHttpClient();

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FE971052-0410-49C1-BEE6-717C8D5C6680"}
 */
var apiKey = '';

/**
 * Default export service url, overridden by properties
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B52F7503-9FA9-4235-B9A9-BA0552E8F5DB"}
 */
var exportServiceURL = 'http://admin.servoy-cloud.eu:4000/generatePDF';

/**
 * Get a new instance of a document editor
 * @public 
 * @param {RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor_abs>|RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor>} component The editor component
 * @return {DocumentEditor}
 * 
 * @example<pre>
 * function onLoad(event) {
 *	// GET NE INSTANCE OF THE DOCUMENT EDITOR
 *	docEditor = scopes.svyDocEditor.getInstance(elements.smartDoc);
 * 
 *	// POPULATE THE TAG FIELDS LIST
 *	var tagBuilder = docEditor.tagBuilder(datasources.db.example_data.orders.getDataSource());
 *	tagBuilder.addField('orderid');
 *	tagBuilder.addField('displayAddressHTML', 'Address');
 *	tagBuilder.addField('displayOrderDate', 'Order Date');
 *	tagBuilder.addField('displayShippedDate', 'Shipped Date');
 *	tagBuilder.addField('displayOrderTotal', 'Total');
 *	tagBuilder.addField('orders_to_customers.companyname', 'Customer.Company', false);
 *	tagBuilder.addField('orders_to_order_details.quantity', 'OrderDetails.Quantity');
 *	tagBuilder.addField('orders_to_order_details.unitprice', 'OrderDetails.Unit Price');
 *	tagBuilder.addField('orders_to_order_details.subtotal', 'OrderDetails.Subtotal');
 *	tagBuilder.addField('orders_to_order_details.order_details_to_products.productname', 'Product.Name', false);
 *  
 *	// BUILD THE TAG LIST
 *	tagBuilder.build();
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"47C90943-797B-4F20-9D1F-25FBF200808C"}
 */
function getInstance(component){
	return new DocumentEditor(component);
}

/**
 * @private 
 * @constructor 
 * @param {RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor_abs>|RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor>} editor
 * @properties={typeid:24,uuid:"71EE688D-E2AD-4705-9247-F3FD5231FE74"}
 */
function DocumentEditor(editor){

	/**
	 * Gets a tag builder object to set the lag libs for the editor component
	 * 
	 * @public 
	 * @param {JSDataSource|String} dataSource The data source for the tag libs
	 * @return {TagBuilder} The tag builder object
	 */
	this.tagBuilder = function(dataSource){
		return new TagBuilder(dataSource,editor);
	}
	
	/**
	 * Merges tags with data and returns the content
	 * 
	 * @public 
	 * @param {JSRecord} record The record object from which to get data values
	 * @param {Boolean} [withInlineCSS] Optionally in-line the CSS so content is self-contained
	 * @param {String} [filterStylesheetName] Optionally filter by style sheet name
	 * @return {String} The merged content
	 */
	this.mergeTags = function(record, withInlineCSS,filterStylesheetName){
		return mergeTags(editor.getHTMLData(withInlineCSS,filterStylesheetName),record);
	}
	
	/**
	 * Gets the content in the editor component
	 * 
	 * @public 
	 * @param {Boolean} [withInlineCSS] Optionally in-line the CSS so content is self-contained
	 * @param {String} [filterStylesheetName] Optionally filter by style sheet name
	 * @return {String}
	 */
	this.getContent = function(withInlineCSS, filterStylesheetName){
		return editor.getHTMLData(withInlineCSS,filterStylesheetName);
	}
	
	/**
	 * Gets the default print css
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getDefaultPrintCSS = function() {
		return editor.getPrintCSSData();
	}
	
	/**
	 * Gets the form component / element
	 * 
	 * @public 
	 * @return {RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor_abs>|RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor>}
	 */
	this.getElement = function() {
		return editor;
	}
}

/**
 * @private 
 * @constructor 
 * @param {JSDataSource|String} dataSource
 * @param {RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor_abs>|RuntimeWebComponent<smartdocumenteditor-smartdocumenteditor>} editor
 * @properties={typeid:24,uuid:"6E4E90A1-165A-43BD-887D-9A678DD85DD9"}
 */
function TagBuilder(dataSource, editor){
	
	/** @type {String} */
	var dsName = dataSource instanceof String ? dataSource : dataSource.getDataSource();

	/** @type {Array<{displayValue:String,realValue:String}>} */
	var fieldTags = [];
	
	/** @type {Array<String>} */
	var fieldRepeats = [];
	
	// build the system tags
	//this.build();
	
	/**
	 * Add a field to the tag lib
	 * 
	 * @public 
	 * @param {String} dataProviderID The field, can be a column, calc, aggregate or related value
	 * @param {String} [displayTag] The display value for the tag. Default is derrived from the column or title property
	 * @param {Boolean} [repeats] true if the related field does repeat over multiple records. Default: true for all related fields.
	 * @return {TagBuilder}
	 */
	this.addField = function(dataProviderID, displayTag, repeats){
		
		// TODO dataprovider is a form variable or a scope variable
		var jsColumn = scopes.svyDataUtils.getDataProviderJSColumn(dsName, dataProviderID);
		if (!jsColumn) {
			application.output('Field cannot be added, because no column was found for: dataSource=' + dsName + ', dataProvider=' + dataProviderID, LOGGINGLEVEL.WARNING);
			return this;
		}
		
		if (!displayTag) {
			// dataprovider may be a calculation or an aggregation
			if (jsColumn) {
				displayTag = jsColumn.getTitle();
				if (dataProviderID.includes('.')){
					displayTag = jsColumn.getTable().getSQLName() + '.' + displayTag; 
				}
			} else {
				displayTag = jsColumn.getTable().getSQLName() + '.' + scopes.svyDataUtils.getUnrelatedDataProviderID(dataProviderID);
			}
		}
		
		if (dataProviderID.includes('.') && repeats !== false) {
			fieldRepeats.push(dataProviderID);
		}
		
		fieldTags.push({displayValue:displayTag, realValue:dataProviderID});
		
		return this;
	}
	
	/**
	 * @public   
	 * @return {JSDataSet<displayValue:String, realValue:String>}
	 */
	this.getSystemTags = function(){
		var systemTags = {};
		for(var i in fieldRepeats){
			var fieldTag = fieldRepeats[i];
			var jsColumn = scopes.svyDataUtils.getDataProviderJSColumn(dsName, fieldTag);
			if (fieldTag.includes('.')){
				var relationName = fieldTag.split('.')
					relationName.pop();
				var displayTag = DEFAULT_REPEATER.START + '.' + utils.stringReplace(utils.stringInitCap(jsColumn.getTable().getSQLName().split('_').join(' ')), ' ', '');
				var tagValue = DEFAULT_REPEATER.START + '-' + relationName.pop();
				systemTags[displayTag] = tagValue;
			}
			
		}
		/** @type {JSDataSet<displayValue:String, realValue:String>} */
		var dataset = databaseManager.createEmptyDataSet(0,["displayValue", "realValue"])
			dataset.addRow([DEFAULT_REPEATER.STOP, DEFAULT_REPEATER.STOP])
		
		for(var display in systemTags){
			dataset.addRow([display, systemTags[display]])
		}

		return dataset;
	}

	/**
	 * Function to convert dataset to array (multi column)
	 * 
	 * @param {JSDataSet<displayValue:String, realValue:String>} dataset
	 * 
	 * @return {Array<{displayValue:String, realValue:String}>}
	 * @protected 
	 */
	this.convertDataSetToArray = function(dataset) {
		/**@type {Array<{displayValue:String, realValue:String}>} */
		var valueArray = [];
		for(var i = 1; i <= dataset.getMaxRowIndex(); i++) {
			valueArray.push({displayValue: dataset.getValue(i,1), realValue: dataset.getValue(i,2)})
		}
		return valueArray;
	}
	
	/**
	 * Applies the tag lib to the component (replacing existing tags)
	 * @public 
	 */
	this.build = function(){

		// TODO shall add/amend the markers or fully replace them ?
		var mentionFeeds = [
			{
				marker:TAGS.REPEAT,
				feedItems: this.convertDataSetToArray(this.getSystemTags())
			},
			{
				marker:TAGS.TAG,
				feedItems:fieldTags
			}
		]
		editor.setMentionFeeds(mentionFeeds);
		
	}
	
	/**
	 * 
	 * @public 
	 * @return {JSDataSet<displayValue:String, realValue:String>}
	 *  */
	this.getFields = function() {
		/** @type {JSDataSet<displayValue:String, realValue:String>} */
		var dataset = databaseManager.createEmptyDataSet(0,["displayValue", "realValue"])
		for (var i = 0; i < fieldTags.length; i++) {
			var fieldTag = fieldTags[i];
			dataset.addRow([fieldTag.displayValue, fieldTag.realValue])
		}
		
		return dataset;
	}
	
}

/**
 * Merges tags with data and returns the merged content
 * 
 * @public
 * @param {String} content The document's content
 * @param {JSRecord} record The data to merge
 *
 * @return {String} The merged content
 * 
 * @example <pre>
 *	// MERGE TAGS WITH THE RECORD DATA
 *	var displayContent = scopes.svyDocEditor.mergeTags(content, record);
 *
 * 	// GET THE EXPORTER AND SET THE CONTENT
 *	var docExporter = scopes.svyDocEditor.getExporter();
 *	docExporter.setContent(displayContent);
 *	
 *	try { // throws an exception if the API key isn't registered.
 *		var bytes = docExporter.exportToPDF();
 *		if (bytes) {
 *			var pdf = plugins.file.createFile('export.pdf');
 *			plugins.file.writeFile(pdf,bytes);
 *			plugins.file.openFile(pdf);
 *		} else {
 *			plugins.dialogs.showErrorDialog("Print Failed","Sorry cannot print the document.")
 *		}
 *	} catch (e) {
 *		plugins.dialogs.showWarningDialog("Print Failed", "API Key required for export");
 *	}
 * </pre>
 *
 * @properties={typeid:24,uuid:"B956081F-DA96-4E4B-AD6E-13F9264D5000"}
 */
function mergeTags(content, record) {
	content = processRepeaters(content, record);
	content = processMentions(content, record);
	return content;
}

/**
 * @private
 *
 * @param {String} html
 * @param {JSRecord} record
 * @param {Number} [relationIndex]
 *
 * @return {String}
 * @properties={typeid:24,uuid:"782A1187-99C9-4BB4-995B-D7D282730EDA"}
 */
function processMentions(html, record, relationIndex) {
	return html.replace(REGEX.MENTION, function(matchItem) {
			var mention = new createParsedMention(matchItem);
			if (!mention.isValidTag()) {
				throw Error("Invalid tag item, tag item doesn't exist in valuelist for realValue: " + mention.realValue)
			}

			var data;
			if (mention.tag == TAGS.TAG) {
				if (mention.realValue.includes('.')) {
					
					var dataProvider = mention.getDataProvider();
					var relationName = mention.getRelationBasedOnRecord(record);
					var path = relationName.split('.')
					var recordRelationName = path.shift();	// it assumes the first the relation is the one to be iterated
					var childRelationName = path.join('.');
					
					// FIXME may go wrong with nested relations
					if (utils.hasRecords(record, recordRelationName) && dataProvider) {
						// in case of nested relations. Iterate over the first relation
						var relatedRecord = record[recordRelationName].getRecord( (relationIndex || 1));
						// data for nested relations
						if (relatedRecord && childRelationName && utils.hasRecords(relatedRecord, childRelationName)) {
							data = relatedRecord[childRelationName][dataProvider];
						} else if (relatedRecord && ! childRelationName) {
							data = relatedRecord[dataProvider];
						}
					}
					//Skip for now it is a relation dataprovider;
				} else {
					data = record[mention.realValue];
				}
				if (data instanceof Date) {
					return utils.dateFormat(data, 'dd-MM-yyyy HH:mm')
				}
				return data == null ? '' : data;
			}
			return matchItem;
		})
}

/**
 * @private
 * @param {String} html
 * @param {JSRecord} record
 * @return {String}
 * @properties={typeid:24,uuid:"4D3C4CE2-8B01-4FDD-8C56-2541C7427305"}
 */
function processRepeaters(html, record) {
	var repeatItem
	return html.replace(REGEX.FULL_REPEAT_BLOCK, /** @param {String} matchItem */ function(matchItem) {
			repeatItem = new createParsedRepeat(matchItem, record);
			if (!repeatItem.isValidRepeat()) {
				throw Error("Invalid repeat item, repeat item doesn't exist in valuelist for relation: " + repeatItem.relationName)
			}
			//Clean first & last repeater tag
			matchItem = matchItem.replace(REGEX.START_REPEAT, '');
			matchItem = matchItem.replace(REGEX.END_REPEAT, '');

			//Build repeated items
			if (repeatItem.numberOfRepeats == 0) {
				return '';
			} else {
				var newValue = '';
				var toRepeat = matchItem;
				if (repeatItem.isTableStartEndRepeat()) {
					toRepeat = matchItem.match(REGEX.FULL_TABLE_ROW)[0].replace(REGEX.FULL_TABLE_HEADER, '');
					newValue = matchItem.match(REGEX.FULL_TABLE_HEADER) ? matchItem.match(REGEX.FULL_TABLE_HEADER)[0] : '';
				}

				for (var i = 1; i <= repeatItem.numberOfRepeats; i++) {
					var processedRepeat = toRepeat;
					if (matchItem.match(REGEX.FULL_REPEAT_BLOCK)) {
						processedRepeat = processRepeaters(toRepeat, record[repeatItem.getRelationBasedOnRecord(record)].getRecord(i));
					}
					newValue += processMentions(processedRepeat, record, i);
				}

				//Clean latest enter
				var returnValue = (repeatItem.isTableStartEndRepeat() ? matchItem.replace(REGEX.FULL_TABLE_ROW, newValue) : newValue).trim().replace(REGEX.BR_END, '');
				return returnValue;
			}
		})
}

/**
 * @private
 * @constructor
 *
 * @param {String} html
 * @param {JSRecord} record
 *
 * @properties={typeid:24,uuid:"AA1FC697-2CDB-4506-9890-834DDA8A80DF"}
 */
function createParsedRepeat(html, record) {
	/** @type {String} */
	this.relationName = '';

	/** @type {Number} */
	this.numberOfRepeats = 0;

	/** @type {Boolean} */
	this.hasTableStartRepeat = !!html.match(REGEX.START_REPEAT_TABLE);

	/** @type {Boolean} */
	this.hasTableEndRepeat = !!html.match(REGEX.END_REPEAT_TABLE);

	/** @type {createParsedMention} */
	this.parsedMention = new createParsedMention(html.match(REGEX.START_REPEAT)[0]);

	/**
	 * @return {Boolean}
	 */
	this.isTableStartEndRepeat = function() {
		return (this.hasTableStartRepeat && this.hasTableEndRepeat);
	}

	/**
	 * @return {Boolean}
	 */
	this.isValidRepeat = function() {
		if (this.relationName) {
			return true;
		}

		return false;
	}

	/**
	 * @param {JSRecord} currentRecord
	 * @return {String}
	 */
	this.getRelationBasedOnRecord = function(currentRecord) {
		var hasMatch = false;
		if (this.relationName.includes('.')) {
			return this.relationName.split('.').filter(function(relation) {
				if (!hasMatch) {
					hasMatch = (scopes.svyDataUtils.getRelationPrimaryDataSource(relation) == currentRecord.getDataSource())
				}
				return hasMatch;
			}).join('.');
		} else {
			return this.relationName;
		}
	}

	//Setup calculated properties based on input
	if (this.parsedMention && this.parsedMention.tag == TAGS.REPEAT) {
		this.relationName = this.parsedMention.realValue;
		if (utils.hasRecords(record, this.getRelationBasedOnRecord(record))) {
			this.numberOfRepeats = databaseManager.getFoundSetCount(record[this.getRelationBasedOnRecord(record)]);
		}
	}
}

/**
 * @private
 * @constructor
 *
 * @param {String} mention
 *
 * @properties={typeid:24,uuid:"3B7C71E4-2B7F-493F-B622-08F53962BEE1"}
 */
function createParsedMention(mention) {
	/** @type {String} */
	this.display = '';

	/** @type {String} */
	this.realValue = '';

	/** @type {String} */
	this.tag = '';

	/**
	 * @return {Boolean}
	 */
	this.isValidTag = function() {
		if (this.realValue) {
			return true;
		}

		return false;
	}

	/**
	 * @param {JSRecord} record
	 * @return {String}
	 */
	this.getRelationBasedOnRecord = function(record) {
		var hasMatch = false;
		if (this.realValue.includes('.')) {
			return scopes.svyDataUtils.getDataProviderRelationName(this.realValue).split('.').filter(function(relation) {
				if (!hasMatch) {
					hasMatch = (scopes.svyDataUtils.getRelationPrimaryDataSource(relation) == record.getDataSource())
				}
				return hasMatch;
			}).join('.');
		} else {
			return this.realValue;
		}
	}

	/**
	 * @return {String}
	 */
	this.getDataProvider = function() {
		return scopes.svyDataUtils.getUnrelatedDataProviderID(this.realValue);
	}

	var value = '';
	var match = mention.match(/data-.*?\s/gm);
	var self = this;
	match.forEach(/**@param {String} matchItem */ function(matchItem) {
		if (matchItem.startsWith('data-mention=')) {
			value = matchItem.trim().replace('data-mention="', '').replace(new RegExp('"$'), '');
			self.tag = value.substr(0, 1);
			self.display = value.substr(1);
		} else if (matchItem.startsWith('data-real-value=')) {
			value = matchItem.trim().replace('data-real-value="', '').replace(new RegExp('"$'), '');
			self.realValue = value.split(DEFAULT_REPEATER.START + '-').pop();
		}
	});
}

/**
 * Get's an exporter which can generate PDF exports
 * 
 * @public 
 * @return {Exporter}
 * @example <pre>
 * 	// GET THE EXPORTER AND SET THE CONTENT
 *	var docExporter = scopes.svyDocEditor.getExporter();
 *	docExporter.setContent(displayContent);
 *	
 *	try { // throws an exception if the API key isn't registered.
 *		var bytes = docExporter.exportToPDF();
 *		if (bytes) {
 *			var pdf = plugins.file.createFile('export.pdf');
 *			plugins.file.writeFile(pdf,bytes);
 *			plugins.file.openFile(pdf);
 *		} else {
 *			plugins.dialogs.showErrorDialog("Print Failed","Sorry cannot print the document.")
 *		}
 *	} catch (e) {
 *		plugins.dialogs.showWarningDialog("Print Failed", "API Key required for export");
 *	}
 * </pre>
 * 
 * @properties={typeid:24,uuid:"E8B1F610-7727-4661-8B56-1F38F0583A81"}
 */
function getExporter(){
	return new Exporter();
}

/**
 * @private  
 * @constructor 
 * @properties={typeid:24,uuid:"F3899FE4-3E92-4806-87D8-F1FE7166E5E8"}
 */
function Exporter() {
	
	/** @protected **/
	this.content = '';
	
	/** @protected **/
	this.css = '';
	
	/** @protected **/
	this.headTags = [];
	
	/** @protected **/
	this.imageURL = application.getServerURL();
	
	/** @protected **/
	this.margin = {"bottom": 20, "left": 12, "right": 12, "top": 20}
	
	/** @protected **/
	this.pageSize = 'A4';
	
	/** @protected **/
	this.orientation = 'Portrait';
	
	/**
	 * Set/Override the css in the exporter
	 * 
	 * @public 
	 * @param {String} css The CSS to set
	 * @return {Exporter} This exporter object for call chaining
	 */
	this.setCSS = function(css){
		this.css = css;
		return this;
	}
	
	/**
	 * Sets the content to be exported
	 * @public 
	 * @param {String} content
	 * @return {Exporter} This exporter object for call chaining
	 * @see DocumentEditor.getContent
	 */
	this.setContent = function(content){
		this.content = content;
		return this;
	}
	
	/**
	 * Adds additional head tags to the exported content
	 * 
	 * @public 
	 * @param {String} headTag The head tag to be added
	 * @return {Exporter} This exporter object for call chaining
	 */
	this.addHeadTag = function(headTag){
		this.headTags.push(headTag);
		return this;
	}
	
	/**
	 * Sets the image URL
	 * @protected  
	 * @param {String} imageURL The Image URL
	 * @return {Exporter} This exporter object for call chaining
	 */
	this.setImageURL = function(imageURL){
		this.imageURL = imageURL;
		return this;
	}
	
	/**
	 * Sets the page margins
	 * 
	 * @public 
	 * @param {Number} top
	 * @param {Number} right
	 * @param {Number} bottom
	 * @param {Number} left
	 * @return {Exporter} This exporter object for call chaining
	 */
	this.setMargin = function(top,right,bottom,left){
		this.margin = {top:top, right:right, bottom:bottom, left:left};
		return this;
	}
	
	/**
	 * Sets the page size
	 * @public 
	 * @param {String} pageSize Page size, must be one of enum PAGE_SIZE
	 * @return {Exporter} This exporter object for call chaining
	 * @see PAGE_SIZE
	 */
	this.setPageSize = function(pageSize){
		this.pageSize = pageSize;
		return this;
	}
	
	/**
	 * Sets the page orientation
	 * 
	 * @public 
	 * @param {String} orientation The page orientation, must be one of enum ORIENTATION
	 * @return {Exporter} This exporter object for call chaining
	 * @see ORIENTATION
	 */
	this.setOrientation = function(orientation){
		this.orientation = orientation;
		return this;
	}
	
	/**
	 * Exports the content to PDF. An API key must already be registered or an error is thrown.
	 * 
	 * @public 
	 * @return {Array<byte>} The PDF file bytes
	 * @see registerAPIKey
	 * @throws {Error} if no API key is registered
	 */
	this.exportToPDF = function(){
		if(!apiKey){
			throw 'No API found';
		}
		var post = httpClient.createPostRequest(exportServiceURL);
		post.setBodyContent(JSON.stringify(this.serialize()));
		var result = post.executeRequest();
		if (result.getStatusCode() == 200) {
			return result.getMediaData();
		} else {
			application.output('Connection Error: ' + result.getStatusCode() + ' with error: ' + result.getResponseBody(), LOGGINGLEVEL.ERROR);
			return null;
		}
	}
	
	/**
	 * @protected  
	 * @return {Object}
	 */
	this.serialize = function() {
		return {
			"key": apiKey,
			"html": this.content,
			"css": this.css,
			"additionalHead": this.headTags,
			"imageURL": this.imageURL,
			"margin": this.margin,
			"paperSize": this.pageSize,
			"orientation": this.orientation
		}
	}
}

/**
 * Register the API key required for PDF export. 
 * This method is best used for testing purposes only.
 * For deployment purposes, the key can be loaded from configuration using property "user.svyDocumentEditorAPIKey" 
 * 
 * @param {String} key
 * @public 
 *
 * @properties={typeid:24,uuid:"0C251095-663C-4F8A-9F85-57983C04989F"}
 */
function registerAPIKey(key) {
	apiKey = key;
	application.setUserProperty('svyDocumentEditorAPIKey', key);
	if(application.isInDeveloper()){
		application.output('Key is set, but when in developer, user properties are not persisted until the IDE is closed',LOGGINGLEVEL.INFO);
	} else {
		application.output('svyDocumentEditorAPIKey set at runtime',LOGGINGLEVEL.INFO);
	}
}

/**
 * Scope initialization. DO NOT put any code below this declaration
 * ----------------------------------------------------------------
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"4C1849DF-4498-4307-86AB-EA247E1C0384",variableType:-4}
 */
var init = function(){
	var key = application.getUserProperty('svyDocumentEditorAPIKey');
	if(key){
		application.output('svyDocumentEditorAPIKey loaded from configuration',LOGGINGLEVEL.INFO);
		apiKey = key;
	}
	var url = application.getUserProperty('svyDocumentExportServiceURL');
	if(url){
		exportServiceURL = url;
		application.output('svyDocumentExportServiceURL loaded from configuration',LOGGINGLEVEL.INFO)
	}
}();