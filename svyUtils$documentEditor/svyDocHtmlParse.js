/**
 * @protected 
 * @enum {RegExp}
 * @properties={typeid:35,uuid:"A2D9F578-180B-43CC-963B-098A0B39D55E",variableType:-4}
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
 * @public
 * @param {String} html
 * @param {JSRecord} record
 *
 * @return {String}
 *
 * @properties={typeid:24,uuid:"21A28374-C786-446C-94DA-270F8D84C6D7"}
 */
function processHTML(html, record) {
	html = processRepeaters(html, record);
	html = processMentions(html, record);

	return html
}

/**
 * @private
 *
 * @param {String} html
 * @param {JSRecord} record
 * @param {Number} [relationIndex]
 *
 * @return {String}
 * @properties={typeid:24,uuid:"2420C5B5-B538-4C12-B53B-922E6AD3E476"}
 */
function processMentions(html, record, relationIndex) {
	return html.replace(REGEX.MENTION, function(matchItem) {
			var mention = new createParsedMention(matchItem);
			if (!mention.isValidTag()) {
				throw Error("Invalid tag item, tag item doesn't exist in valuelist for realValue: " + mention.realValue)
			}

			var data;
			if (mention.tag == scopes.svyDocTagValuelists.TAGS.TAG) {
				if (mention.realValue.includes('.')) {
					var relationName = mention.getRelationBasedOnRecord(record);
					var dataProvider = mention.getDataProvider()
					if (utils.hasRecords(record, relationName) && dataProvider) {
						data = record[relationName].getRecord( (relationIndex || 1))[dataProvider];
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
 * @properties={typeid:24,uuid:"CCB23F0C-2180-4BA8-9BEB-471EECD3D658"}
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
 * @properties={typeid:24,uuid:"F6873CF1-8AFC-44E4-A919-C6C2253765F2"}
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
			return (scopes.svyDocTagValuelists.getRepeatTagsData().indexOf(this.parsedMention.tag + this.parsedMention.realValue) == -1)
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
	if (this.parsedMention && this.parsedMention.tag == scopes.svyDocTagValuelists.TAGS.REPEAT) {
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
 * @properties={typeid:24,uuid:"6EDE52BB-5BD5-4533-97D7-9D8F7365E30A"}
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
			return (scopes.svyDocTagValuelists.getFieldTagsData().indexOf(this.tag + this.realValue) == -1)
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
			self.realValue = value.split(scopes.svyDocTagValuelists.DEFAULT_REPEATER.START + '-').pop();
		}
	});
}
