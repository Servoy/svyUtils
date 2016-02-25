/**
 * @private
 *
 * @properties={typeid:35,uuid:"FB9322CA-0755-4D1D-862F-D7AED65E358D",variableType:-4}
 */
var logger = scopes.svyLogManager.getLogger("com.servoy.bap.svywordutils");

/**
 * Reads a docx document and returns a new instance of a Docx
 *
 * @param {String|plugins.file.JSFile|byte[]} [sourceFile]
 * @return {Docx}
 *
 * @properties={typeid:24,uuid:"FBBB8132-A762-4FCB-B374-7CE126B6B61D"}
 */
function createDocx(sourceFile) {
	var docx = new Docx();
	docx.readTemplate(sourceFile);
	return docx;
}

/**
 * @constructor
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E142529A-A18C-42E9-9D1B-790A37F1B30B"}
 */
function Docx() {

	/**
	 * The POI Java instance
	 *
	 * @type {Packages.org.apache.poi.xwpf.usermodel.XWPFDocument}
	 */
	this.xwpf = null;
	
	/**
	 * The source of this Docx as either a JSFile or a byte[]
	 * 
	 * @type {plugins.file.JSFile|byte[]}
	 */
	this.source = null;
	
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"5275F4BA-168F-4831-A950-5F96F1B5DE60",variableType:-4}
 */
var init_Docx = (function() {
	Docx.prototype = Object.create(Object.prototype, { });
	Docx.prototype.constructor = Docx;

	/**
	 * Returns a two dimensional array with the full placeholder on 
	 * position [0] and the placeholder name on position [1] of each entry
	 * 
	 * @param {String} [placeholderStartTag] starting tag of a placeholder; defaults to %%
	 * @param {String} [placeholderEndTag] ending tag of a placeholder; defaults to starting tag
	 * @return {Array<Array<String>>} array holding placeholder tag, placeholder name
	 * @this {Docx}
	 */
	Docx.prototype.findPlaceholders = function(placeholderStartTag, placeholderEndTag) {
		var extractor = new Packages.org.apache.poi.xwpf.extractor.XWPFWordExtractor(this.xwpf);
		var content = extractor.getText();

		if (!placeholderStartTag) placeholderStartTag = "%%";
		if (!placeholderEndTag) placeholderEndTag = placeholderStartTag;
		placeholderStartTag = regExpEscape(placeholderStartTag);
		placeholderEndTag = regExpEscape(placeholderEndTag);

		var regExp = new RegExp(placeholderStartTag + '(.*?)' + placeholderEndTag, 'g');

		var placeholdersFound = [];
		var result = [];
		var matchArray;
		while ( (matchArray = regExp.exec(content)) !== null) {
			if (placeholdersFound.indexOf(matchArray[0]) >= 0) {
				continue;
			}
			placeholdersFound.push(matchArray[0]);
			result.push([matchArray[0], matchArray[1]]);
		}

		return result;
	}

	/**
	 * Returns the plain textual content of this document
	 * 
	 * @return {String}
	 * @this {Docx}
	 */
	Docx.prototype.extractText = function() {
		try {
			if (!this.xwpf) {
				return null;
			}
			var extractor = new Packages.org.apache.poi.xwpf.extractor.XWPFWordExtractor(this.xwpf);
			return extractor.getText();
		} catch (e) {
			logger.error(e);
		}
		return null;
	}

	/**
	 * Writes this Docx to the given file or file path
	 * 
	 * @param {String|plugins.file.JSFile} targetFile
	 * @return {Boolean} success
	 * @this {Docx}
	 */
	Docx.prototype.writeToFile = function(targetFile) {
		if (!this.xwpf) {
			return false;
		}
		try {
			var filePath = targetFile;
			if (targetFile instanceof plugins.file.JSFile) {
				filePath = targetFile.getAbsolutePath();
			}
			var os = new java.io.FileOutputStream(new java.io.File(filePath));
			this.xwpf.write(os);
			os.close();
			os = null;
			return true;
		} catch (exception) {
			logger.error(exception);
		} finally {
			if (os) {
				os.close();
			}
		}
		return false;
	};

	/**
	 * Returns this document as a byte[]
	 * 
	 * @return {byte[]}
	 * @this {Docx}
	 */
	Docx.prototype.getBytes = function() {
		if (!this.xwpf) {
			return null;
		}
		try {
			var baos = new java.io.ByteArrayOutputStream();
			this.xwpf.write(baos);
			var result = baos.toByteArray();
			baos.close();
			return result;
		} catch (exception) {
			logger.error(exception);
		}
		return null;
	};

	/**
	 * Returns this document as a PDF byte[]
	 * 
	 * @param {Packages.org.apache.poi.xwpf.converter.pdf.PdfOptions} [pdfOptions]
	 * @return {byte[]}
	 * @this {Docx}
	 */
	Docx.prototype.getBytesAsPdf = function(pdfOptions) {
		if (!this.xwpf) {
			return null;
		}
		try {
			var pdfConverter = Packages.org.apache.poi.xwpf.converter.pdf.PdfConverter.getInstance();
			if (!pdfOptions) {
				pdfOptions = Packages.org.apache.poi.xwpf.converter.pdf.PdfOptions.create();
			}
			var baos = new java.io.ByteArrayOutputStream();
			pdfConverter.convert(this.xwpf, baos, pdfOptions);
			var result = baos.toByteArray();
			baos.close();
			return result;
		} catch (exception) {
			logger.error(exception);
		}
		return null;
	};

	/**
	 * Writes this document as a PDF to the given file or file path
	 * 
	 * @param {String|plugins.file.JSFile} targetFile
	 * @param {Packages.org.apache.poi.xwpf.converter.pdf.PdfOptions} [pdfOptions]
	 * @return {Boolean}
	 * @this {Docx}
	 */
	Docx.prototype.writeToFileAsPdf = function(targetFile, pdfOptions) {
		if (!this.xwpf) {
			return null;
		}
		try {
			var pdfConverter = Packages.org.apache.poi.xwpf.converter.pdf.PdfConverter.getInstance();
			if (!pdfOptions) {
				pdfOptions = Packages.org.apache.poi.xwpf.converter.pdf.PdfOptions.create();
			}
			var filePath = targetFile;
			if (targetFile instanceof plugins.file.JSFile) {
				filePath = targetFile.getAbsolutePath();
			}
			var fos = new java.io.FileOutputStream(new java.io.File(filePath));
			pdfConverter.convert(this.xwpf, fos, pdfOptions);
			fos.close();
			return true;
		} catch (exception) {
			logger.error(exception);
		}
		return false;
	};
	
	/**
	 * Reads the given template
	 * Note: all changes made to the document prior to this call are lost
	 * 
	 * @param {String|plugins.file.JSFile|byte[]} sourceFile
	 * @this {Docx}
	 */
	Docx.prototype.readTemplate = function(sourceFile) {
		try {
			/** @type {java.io.InputStream} */
			var is = null;
			if (sourceFile instanceof String) {
				is = new java.io.FileInputStream(new java.io.File(sourceFile));
				this.source = plugins.file.convertToJSFile(sourceFile);
			} else if (sourceFile instanceof plugins.file.JSFile) {
				is = new java.io.FileInputStream(new java.io.File(sourceFile.getAbsolutePath()));
				this.source = plugins.file.convertToJSFile(sourceFile);
			} else if (sourceFile instanceof Array) {
				is = new java.io.ByteArrayInputStream(sourceFile);
				this.source = sourceFile;
			}
			if (!is) {
				return null;
			}
			this.xwpf = new Packages.org.apache.poi.xwpf.usermodel.XWPFDocument(is);
		} catch (exception) {
			logger.error(exception);
		} finally {
			if (is) {
				is.close();
			}
		}
		return null;
	}
	
	/**
	 * Reads the template again and replaces all placeholders
	 * Note: all changes made to the document prior to this call are lost
	 * 
	 * @param {Object} scriptable
	 * @param {String} [placeholderStartTag]
	 * @param {String} [placeholderEndTag]
	 * @this {Docx}
	 */
	Docx.prototype.readAndReplaceTags = function(scriptable, placeholderStartTag, placeholderEndTag) {
		this.readTemplate(this.source);
		this.replaceTags(scriptable, placeholderStartTag, placeholderEndTag);
	}

	/**
	 * Replaces all placeholders with the values from the scriptable object provided
	 * @param {Object} scriptable - object holding placeholder values (e.g. {company: 'Servoy', ceo: 'Jan Aleman'})
	 * @param {String} [placeholderStartTag] - starting tag of a placeholder in the document
	 * @param {String} [placeholderEndTag] - end tag of a placeholder in the document
	 * @this {Docx}
	 */
	Docx.prototype.replaceTags = function(scriptable, placeholderStartTag, placeholderEndTag) {

		if (!placeholderStartTag) placeholderStartTag = '%%';
		if (!placeholderEndTag) placeholderEndTag = '%%';

		/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFRun} */
		var run = null;

		function replaceInParagraph() {

			var beforePlaceHolderText = null;
			var afterPlaceHolderText = null;

			/** @type {String} */
			var placeHolderName = null;

			var placeHolderOpenend = false;
			var placeHolderClosed = false;

			var runList = paragraph.getRuns();
			
			function getImageType(contentType) {
				if (contentType == 'image/png') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_PNG;
				} else if (contentType == 'image/jpg') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_JPEG;
				} else if (contentType == 'image/tif') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_TIFF;
				} else if (contentType == 'image/tiff') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_TIFF;
				} else if (contentType == 'image/bmp') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_BMP;
				} else if (contentType == 'image/gif') {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_GIF;
				} else {
					return Packages.org.apache.poi.xwpf.usermodel.XWPFDocument.PICTURE_TYPE_PNG;
				}
			}
			
			function replaceValue(name) {
				var value = scriptable[name];
				var bais;
				var jsImage;
				if (!value) {
					run.setText(beforePlaceHolderText + '' + afterPlaceHolderText, 0);
				} else if (value instanceof Number) {
					/** @type {Number} */
					var numValue = value;
					value = utils.numberFormat(numValue, i18n.getDefaultNumberFormat());
					runTextInternal = beforePlaceHolderText + value + afterPlaceHolderText;
					run.setText(runTextInternal, 0);
				} else if (value instanceof Date) {
					/** @type {Date} */			
					var dateValue = value;
					value = utils.dateFormat(dateValue, i18n.getDefaultNumberFormat());
					runTextInternal = beforePlaceHolderText + value + afterPlaceHolderText;
					run.setText(runTextInternal, 0);					
				} else if (value instanceof Array || value instanceof plugins.file.JSFile) {
					//byte array or file
					jsImage = plugins.images.getImage(value);
					bais = new java.io.ByteArrayInputStream(value);
					run.setText(beforePlaceHolderText, 0);
					run.addPicture(
						bais, 
						getImageType(jsImage.getContentType()),
						'image',
						jsImage.getWidth() * 9525,
						jsImage.getHeight()) * 9525;
					if (afterPlaceHolderText) run.setText(afterPlaceHolderText, 0);
				} else if (value instanceof String && value.substring(0, 9) == 'media:///') {
					//image media
					var jsMedia = solutionModel.getMedia(value);
					bais = new java.io.ByteArrayInputStream(jsMedia.bytes);
					run.setText(beforePlaceHolderText, 0);
					run.addPicture(
						bais, 
						getImageType(jsImage.getContentType()),
						'image',
						Packages.org.apache.poi.util.Units.toEMU(jsImage.getWidth()),
						Packages.org.apache.poi.util.Units.toEMU(jsImage.getHeight()));
					if (afterPlaceHolderText) run.setText(afterPlaceHolderText, 1);
				} else {
					var stringParts = value.split("\n");
					runTextInternal = beforePlaceHolderText;
					if (runTextInternal) run.setText(beforePlaceHolderText, 0);
					for (var sp = 0; sp < stringParts.length; sp++) {
						if (!runTextInternal) {
							run.setText(stringParts[sp], 0);
						} else {
							run.setText(stringParts[sp]);
						}
						runTextInternal += stringParts[sp];
						if (stringParts.length > 1 && sp < stringParts.length - 1) {								
							run.addBreak();
						}
					}
					runTextInternal += afterPlaceHolderText;
					run.setText(afterPlaceHolderText);
				}
			}

			for (var r = 0; r < runList.size(); r++) {
				run = runList.get(r);
				var runTextInternal = run.getText(0);

				/**
				 * loop over the run's text as long as
				 *
				 * 1. the text is not null
				 * 2. we have an opening or closing placeholder tag
				 * 3. or we have found a placeholder that is not yet closed (in case the placeholder is split over several runs)
				 */
				while (runTextInternal && (runTextInternal.indexOf(placeholderStartTag) >= 0 || runTextInternal.indexOf(placeholderEndTag) >= 0 || placeHolderOpenend)) {
					if (!placeHolderOpenend && runTextInternal.indexOf(placeholderStartTag) >= 0) {
						/**
						 * we found an opening tag
						 * 1. save the text before that
						 * 2. replace everything until the tag
						 */
						beforePlaceHolderText = runTextInternal.substring(0, runTextInternal.indexOf(placeholderStartTag));
						runTextInternal = runTextInternal.substring(runTextInternal.indexOf(placeholderStartTag) + placeholderStartTag.length);
						placeHolderOpenend = true;
					}

					if (placeHolderOpenend && runTextInternal.indexOf(placeholderEndTag) >= 0) {
						/**
						 * We already found an opening tag and now see an end tag
						 * 1. add the text before the end tag to the placeholder's name
						 * 2. remove that from the run's text
						 * 3. set the afterPlaceHolderText to the remaining text of the run
						 */
						placeHolderName += runTextInternal.substring(0, runTextInternal.indexOf(placeholderEndTag));
						runTextInternal = runTextInternal.substring(runTextInternal.indexOf(placeholderEndTag) + placeholderEndTag.length);
						afterPlaceHolderText = runTextInternal;
						placeHolderClosed = true;
					} else if (placeHolderOpenend) {
						/**
						 * We already found an opening tag but don't see an end tag; it must be part of the placeholder's name then
						 */
						placeHolderName += runTextInternal
					}

					if (placeHolderOpenend && placeHolderClosed) {
						/**
						 * placeholder is complete
						 *
						 * 1. replace placeholder with value from scriptable
						 * 2. create the run's text as text before, replaced placeholder and text after
						 * 3. set the run's text
						 * 4. reset variables used
						 */
						placeHolderOpenend = false;
						if (runTextInternal.indexOf(placeholderStartTag) >= 0) {
							replaceValue(placeHolderName);
						} else {
							replaceValue(placeHolderName);
						}
						beforePlaceHolderText = null;
						placeHolderName = null;
						afterPlaceHolderText = null;
						placeHolderClosed = false;
					} else if (placeHolderOpenend) {
						/**
						 * Placeholder is "open", but run is finished
						 *
						 * 1. set the run's text to the before placeholder text
						 * 2. reset the before placeholder text and exit loop
						 */
						run.setText(beforePlaceHolderText ? beforePlaceHolderText : '', 0);
						beforePlaceHolderText = null;
						break;
					}
				}
			}
		}

		var paragraphList = this.xwpf.getParagraphs();
		var p;
		/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFParagraph} */
		var paragraph;

		//walk over all text paragraphs
		for (p = 0; p < paragraphList.size(); p++) {
			paragraph = paragraphList.get(p);
			replaceInParagraph();
		}

		//walk over all tables, their rows and cells
		var tableList = this.xwpf.getTables();
		for (var t = 0; t < tableList.size(); t++) {
			/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFTable} */
			var table = tableList.get(t);
			var rowList = table.getRows();
			for (var tr = 0; tr < rowList.size(); tr++) {
				/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFTableRow} */
				var row = rowList.get(tr);
				var cellList = row.getTableCells();
				for (var tc = 0; tc < cellList.size(); tc++) {
					/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFTableCell} */
					var cell = cellList.get(tc);
					paragraphList = cell.getParagraphs();
					for (p = 0; p < paragraphList.size(); p++) {
						paragraph = paragraphList.get(p);
						replaceInParagraph();
					}
				}
			}
		}

		//walk over all headers
		var headers = this.xwpf.getHeaderList();
		for (var h = 0; h < headers.size(); h++) {
			/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFHeader} */
			var header = headers.get(h);
			paragraphList = header.getParagraphs();
			for (p = 0; p < paragraphList.size(); p++) {
				paragraph = paragraphList.get(p);
				replaceInParagraph();
			}
		}

		//walk over all footers
		var footers = this.xwpf.getFooterList();
		for (var f = 0; f < footers.size(); f++) {
			/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFFooter} */
			var footer = footers.get(f);
			paragraphList = footer.getParagraphs();
			for (p = 0; p < paragraphList.size(); p++) {
				paragraph = paragraphList.get(p);
				replaceInParagraph();
			}
		}
	}

}());

/**
 * Escapes all regular expression special characters
 *
 * @param text
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1244EA21-E517-409A-9322-49EE6A5C0599"}
 */
function regExpEscape(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * @properties={typeid:24,uuid:"2433AEA1-FFAD-41E5-8F53-8902FCF3C64A"}
 */
function testWordReplacement() {
	try {
		var docx = createDocx("c:\\Temp\\test.docx");
		
		var placeholders = {
			date: utils.dateFormat(new Date(), 'EEE, dd. MMM yyyy'),
			companyname: 'Apple Computer Inc.\nCompaq\nIBM',
			contactname: 'Tim Cook',
			address: '1, Infinite Loop',
			postalcode: 12345,
			city: 'Cupertino',
			salutation: 'Dear Tim',
			from_name: 'Servoy B.V.',
			from_address: 'Fred. Roeskestraat 97c',
			from_postalcode: '1076 EC',
			from_city: 'Amsterdam',
			from_phone: '+31 33 455 9877',
			from_email: '+31 84 883 2297',
			date$timestamp: utils.dateFormat(new Date(), 'dd.MM.yyyy HH:mm'),
			image: plugins.file.readFile(plugins.file.convertToJSFile('c:\\Temp\\image.png'))
		}
		
		var placeholdersInDoc = docx.findPlaceholders('%%');
		for (var p = 0; p < placeholdersInDoc.length; p++) {
			application.output('Found placeholder ' + placeholdersInDoc[p][1]);
		}
		
		docx.replaceTags(placeholders);
		docx.writeToFile('c:\\Temp\\replaced.docx');
		docx.writeToFileAsPdf('c:\\Temp\\replaced.pdf');
		
	} catch (e) {
		application.output(e.message);
	}
}

/**
 * Experimental and currently not used
 *
 * @param {Packages.org.apache.poi.xwpf.usermodel.XWPFParagraph} clone
 * @param {Packages.org.apache.poi.xwpf.usermodel.XWPFParagraph} source
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"C3F1180D-A395-40A0-9257-9F8C0BAEF7D0"}
 */
function cloneParagraph(clone, source) {
	/** @type {Packages.org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPPr} */
	var pPr = clone.getCTP().isSetPPr() ? clone.getCTP().getPPr() : clone.getCTP().addNewPPr();
	pPr.set(source.getCTP().getPPr());

	var runs = source.getRuns();
	for (var r = 0; r < runs.size(); r++) {
		/** @type {Packages.org.apache.poi.xwpf.usermodel.XWPFRun} */
		var sourceRun = runs.get(r);
		var run = clone.createRun();
		cloneRun(sourceRun, run);
	}
}

/**
 * Experimental and currently not used
 * 
 * @param {Packages.org.apache.poi.xwpf.usermodel.XWPFRun} originalRun
 * @param {Packages.org.apache.poi.xwpf.usermodel.XWPFRun} newRun
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"971C1954-3192-46B6-B450-8BB64D75C6F5"}
 */
function cloneRun(originalRun, newRun) {
	var rPr = newRun.getCTR().isSetRPr() ? newRun.getCTR().getRPr() : newRun.getCTR().addNewRPr();
	rPr.set(originalRun.getCTR().getRPr());
}
