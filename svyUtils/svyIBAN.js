/**
 * @enum
 * @properties={typeid:35,uuid:"CB95534E-31BC-439C-B451-232E0D7FC28C",variableType:-4}
 */
var NON_ALPHANUM = /[^a-zA-Z0-9]/g;

/**
 * @enum
 * @properties={typeid:35,uuid:"6B685C99-AEFA-42EB-BDE9-38F4CD84D3B4",variableType:-4}
 */
var EVERY_FOUR_CHARS = /(.{4})(?!$)/g;

/**
 * @protected 
 * @type {Object<{countryCode:String, length:Number, structure:String, example:String, _regex:Function, isValid:Function, toBBAN:Function, isValidBBAN:Function, fromBBAN:Function}>}
 * @properties={typeid:35,uuid:"FEE6BDA0-3A82-4F2C-9B03-2680A0DE847B",variableType:-4}
 */
var countries = { }

/**
 * @param {String} iban
 * Check if IBAN is valid
 * @properties={typeid:24,uuid:"2DAFA4D4-3858-4F79-9BC3-48896C4A828E"}
 */
function isValidIBAN(iban) {
	iban = IBANElectronicFormat(iban);
	var countryISO = countries[iban.slice(0, 2)]
	return !!countryISO && countryISO.isValid(iban)
}

/**
 * @param {String} iban
 * @return {String}
 * @properties={typeid:24,uuid:"7A754FB5-BEEC-440C-89C9-883411DE80A0"}
 */
function IBANElectronicFormat(iban) {
	return iban.replace(NON_ALPHANUM, '').toUpperCase()
}

/**
 * @param {String} iban
 * @param {String} [separator] optional
 * @return {Boolean}
 * @properties={typeid:24,uuid:"E2DF4EFE-BF67-40E9-AB43-EDC23E983290"}
 */
function IBANToBBAN(iban, separator){
    if (typeof separator == 'undefined'){
        separator = ' ';
    }
    iban = IBANElectronicFormat(iban);
    var countryISO = countries[iban.slice(0,2)];
    if (!countryISO) {
        throw new Error('No country with code ' + iban.slice(0,2));
    }
    return countryISO.toBBAN(iban, separator);
}

/**
 * @param {Number} countryCode
 * @param {String} bban
 * @return {Boolean}
 * @properties={typeid:24,uuid:"8E631656-1B74-4E32-9FE7-6FF19D8FA93B"}
 */
function BBANToIBAN(countryCode, bban){
    var country = countries[countryCode];
    if (!country) {
        throw new Error('No country with code ' + countryCode);
    }
    return country.fromBBAN(this.electronicFormat(bban));
}

/**
 * @param {Number} countryCode
 * @param {String} bban
 * @return {Boolean}
 * @properties={typeid:24,uuid:"059603A1-FD52-424A-9F8B-4019E2B5A384"}
 */
function isValidBBAN(countryCode, bban){
	
    var countryStructure = countries[countryCode];
    return countryStructure && countryStructure.isValidBBAN(this.electronicFormat(bban));
}

/**
 * @param {String} iban
 * @param {String} [separator] optional
 * @return {String}
 * @properties={typeid:24,uuid:"AB2D7EB0-E7B5-4152-BA54-E55E026E0C60"}
 */
function IBANPrintFormat(iban, separator){
    if (typeof separator == 'undefined'){
        separator = ' ';
    }
    return IBANElectronicFormat(iban).replace(EVERY_FOUR_CHARS, "$1" + separator);
}

/**
 * Prepare an IBAN for mod 97 computation by moving the first 4 chars to the end and transforming the letters to
 * numbers (A = 10, B = 11, ..., Z = 35), as specified in ISO13616.
 * @private 
 * @param {string} iban the IBAN
 * @returns {string} the prepared IBAN
 *
 * @properties={typeid:24,uuid:"59E68A42-526F-4A32-9895-FC7D57BE5636"}
 */
function iso13616Prepare(iban) {
	iban = iban.toUpperCase();
	iban = iban.substr(4) + iban.substr(0, 4);

	return iban.split('').map(function(n) {
		var code = n.charCodeAt(0);
		if (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) {
			// A = 10, B = 11, ... Z = 35
			return code - 'A'.charCodeAt(0) + 10;
		} else {
			return n;
		}
	}).join('');
}

/**
 * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
 * @private 
 * @param {String} iban
 * @returns {number}
 *
 * @properties={typeid:24,uuid:"378932F9-22E7-4D05-8889-AF6184CD672A"}
 */
function iso7064Mod97_10(iban) {
	var remainder = iban,
		block;

	while (remainder.length > 2) {
		block = remainder.slice(0, 9);
		remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
	}

	return parseInt(remainder, 10) % 97;
}

/**
 * Parse the BBAN structure used to configure each IBAN Specification and returns a matching regular expression.
 * A structure is composed of blocks of 3 characters (one letter and 2 digits). Each block represents
 * a logical group in the typical representation of the BBAN. For each group, the letter indicates which characters
 * are allowed in this group and the following 2-digits number tells the length of the group.
 * @private 
 * @param {string} structure the structure to parse
 * @returns {RegExp}
 *
 * @properties={typeid:24,uuid:"A4BB5F10-E4B6-4543-9701-D123CE87AAD7"}
 */
function parseStructure(structure) {
	// split in blocks of 3 chars
	var regex = structure.match(/(.{3})/g).map(function(block) {

		// parse each structure block (1-char + 2-digits)
		var format,
			pattern = block.slice(0, 1),
			repeats = parseInt(block.slice(1), 10);

		switch (pattern) {
		case "A":
			format = "0-9A-Za-z";
			break;
		case "B":
			format = "0-9A-Z";
			break;
		case "C":
			format = "A-Za-z";
			break;
		case "F":
			format = "0-9";
			break;
		case "L":
			format = "a-z";
			break;
		case "U":
			format = "A-Z";
			break;
		case "W":
			format = "0-9a-z";
			break;
		}

		return '([' + format + ']{' + repeats + '})';
	});

	return new RegExp('^' + regex.join('') + '$');

}
/**
 * Create a new Specification for a valid IBAN number.
 *
 * @param countryCode the code of the country
 * @param length the length of the IBAN
 * @param structure the structure of the undernying BBAN (for validation and formatting)
 * @param example an example valid IBAN
 * @constructor
 * @private 
 * @properties={typeid:24,uuid:"4185B33E-F976-493B-A6D9-2E89EA82CF19"}
 */
function IBANSpecification(countryCode, length, structure, example) {

	this.countryCode = countryCode;
	this.length = length;
	this.structure = structure;
	this.example = example;
	this._regex = function() {
		return this._cachedRegex || (this._cachedRegex = parseStructure(this.structure))
	};

	this.isValid = function(iban) {
		return this.length == iban.length && this.countryCode === iban.slice(0, 2) && this._regex().test(iban.slice(4)) && iso7064Mod97_10(iso13616Prepare(iban)) == 1;
	};

	this.toBBAN = function(iban, separator) {
		return this._regex().exec(iban.slice(4)).slice(1).join(separator);
	};

	this.isValidBBAN = function(bban) {
		return this.length - 4 == bban.length && this._regex().test(bban);
	};

	this.fromBBAN = function(bban) {
		if (!this.isValidBBAN(bban)) {
			throw new Error('Invalid BBAN');
		}

		var remainder = iso7064Mod97_10(iso13616Prepare(this.countryCode + '00' + bban)),
			checkDigit = ('0' + (98 - remainder)).slice(-2);

		return this.countryCode + checkDigit + bban;
	};

}

/**
 * @protected
 * @properties={typeid:35,uuid:"5195EE37-A09D-4CCA-ABF5-B41D7B656A01",variableType:-4}
 */
var init = function() {
	
	function addIBANSpec(IBAN) {
		countries[IBAN.countryCode] = IBAN
	}

	addIBANSpec(new IBANSpecification("AE", 23, "F03F16", "AE070331234567890123456"));
	addIBANSpec(new IBANSpecification("AL", 28, "F08A16", "AL47212110090000000235698741"));
	addIBANSpec(new IBANSpecification("AT", 20, "F05F11", "AT611904300234573201"));
	addIBANSpec(new IBANSpecification("AZ", 28, "U04A20", "AZ21NABZ00000000137010001944"));
	addIBANSpec(new IBANSpecification("BA", 20, "F03F03F08F02", "BA391290079401028494"));
	addIBANSpec(new IBANSpecification("BE", 16, "F03F07F02", "BE68539007547034"));
	addIBANSpec(new IBANSpecification("BG", 22, "U04F04F02A08", "BG80BNBG96611020345678"));
	addIBANSpec(new IBANSpecification("BH", 22, "U04A14", "BH67BMAG00001299123456"));
	addIBANSpec(new IBANSpecification("CH", 21, "F05A12", "CH9300762011623852957"));
	addIBANSpec(new IBANSpecification("CR", 21, "F03F14", "CR0515202001026284066"));
	addIBANSpec(new IBANSpecification("CY", 28, "F03F05A16", "CY17002001280000001200527600"));
	addIBANSpec(new IBANSpecification("CZ", 24, "F04F06F10", "CZ6508000000192000145399"));
	addIBANSpec(new IBANSpecification("DE", 22, "F08F10", "DE89370400440532013000"));
	addIBANSpec(new IBANSpecification("DK", 18, "F04F09F01", "DK5000400440116243"));
	addIBANSpec(new IBANSpecification("DO", 28, "U04F20", "DO28BAGR00000001212453611324"));
	addIBANSpec(new IBANSpecification("EE", 20, "F02F02F11F01", "EE382200221020145685"));
	addIBANSpec(new IBANSpecification("ES", 24, "F04F04F01F01F10", "ES9121000418450200051332"));
	addIBANSpec(new IBANSpecification("FI", 18, "F06F07F01", "FI2112345600000785"));
	addIBANSpec(new IBANSpecification("FO", 18, "F04F09F01", "FO6264600001631634"));
	addIBANSpec(new IBANSpecification("FR", 27, "F05F05A11F02", "FR1420041010050500013M02606"));
	addIBANSpec(new IBANSpecification("GB", 22, "U04F06F08", "GB29NWBK60161331926819"));
	addIBANSpec(new IBANSpecification("GE", 22, "U02F16", "GE29NB0000000101904917"));
	addIBANSpec(new IBANSpecification("GI", 23, "U04A15", "GI75NWBK000000007099453"));
	addIBANSpec(new IBANSpecification("GL", 18, "F04F09F01", "GL8964710001000206"));
	addIBANSpec(new IBANSpecification("GR", 27, "F03F04A16", "GR1601101250000000012300695"));
	addIBANSpec(new IBANSpecification("GT", 28, "A04A20", "GT82TRAJ01020000001210029690"));
	addIBANSpec(new IBANSpecification("HR", 21, "F07F10", "HR1210010051863000160"));
	addIBANSpec(new IBANSpecification("HU", 28, "F03F04F01F15F01", "HU42117730161111101800000000"));
	addIBANSpec(new IBANSpecification("IE", 22, "U04F06F08", "IE29AIBK93115212345678"));
	addIBANSpec(new IBANSpecification("IL", 23, "F03F03F13", "IL620108000000099999999"));
	addIBANSpec(new IBANSpecification("IS", 26, "F04F02F06F10", "IS140159260076545510730339"));
	addIBANSpec(new IBANSpecification("IT", 27, "U01F05F05A12", "IT60X0542811101000000123456"));
	addIBANSpec(new IBANSpecification("KW", 30, "U04A22", "KW81CBKU0000000000001234560101"));
	addIBANSpec(new IBANSpecification("KZ", 20, "F03A13", "KZ86125KZT5004100100"));
	addIBANSpec(new IBANSpecification("LB", 28, "F04A20", "LB62099900000001001901229114"));
	addIBANSpec(new IBANSpecification("LI", 21, "F05A12", "LI21088100002324013AA"));
	addIBANSpec(new IBANSpecification("LT", 20, "F05F11", "LT121000011101001000"));
	addIBANSpec(new IBANSpecification("LU", 20, "F03A13", "LU280019400644750000"));
	addIBANSpec(new IBANSpecification("LV", 21, "U04A13", "LV80BANK0000435195001"));
	addIBANSpec(new IBANSpecification("MC", 27, "F05F05A11F02", "MC5811222000010123456789030"));
	addIBANSpec(new IBANSpecification("MD", 24, "U02F18", "MD24AG000225100013104168"));
	addIBANSpec(new IBANSpecification("ME", 22, "F03F13F02", "ME25505000012345678951"));
	addIBANSpec(new IBANSpecification("MK", 19, "F03A10F02", "MK07250120000058984"));
	addIBANSpec(new IBANSpecification("MR", 27, "F05F05F11F02", "MR1300020001010000123456753"));
	addIBANSpec(new IBANSpecification("MT", 31, "U04F05A18", "MT84MALT011000012345MTLCAST001S"));
	addIBANSpec(new IBANSpecification("MU", 30, "U04F02F02F12F03U03", "MU17BOMM0101101030300200000MUR"));
	addIBANSpec(new IBANSpecification("NL", 18, "U04F10", "NL91ABNA0417164300"));
	addIBANSpec(new IBANSpecification("NO", 15, "F04F06F01", "NO9386011117947"));
	addIBANSpec(new IBANSpecification("PK", 24, "U04A16", "PK36SCBL0000001123456702"));
	addIBANSpec(new IBANSpecification("PL", 28, "F08F16", "PL61109010140000071219812874"));
	addIBANSpec(new IBANSpecification("PS", 29, "U04A21", "PS92PALS000000000400123456702"));
	addIBANSpec(new IBANSpecification("PT", 25, "F04F04F11F02", "PT50000201231234567890154"));
	addIBANSpec(new IBANSpecification("RO", 24, "U04A16", "RO49AAAA1B31007593840000"));
	addIBANSpec(new IBANSpecification("RS", 22, "F03F13F02", "RS35260005601001611379"));
	addIBANSpec(new IBANSpecification("SA", 24, "F02A18", "SA0380000000608010167519"));
	addIBANSpec(new IBANSpecification("SE", 24, "F03F16F01", "SE4550000000058398257466"));
	addIBANSpec(new IBANSpecification("SI", 19, "F05F08F02", "SI56263300012039086"));
	addIBANSpec(new IBANSpecification("SK", 24, "F04F06F10", "SK3112000000198742637541"));
	addIBANSpec(new IBANSpecification("SM", 27, "U01F05F05A12", "SM86U0322509800000000270100"));
	addIBANSpec(new IBANSpecification("TN", 24, "F02F03F13F02", "TN5910006035183598478831"));
	addIBANSpec(new IBANSpecification("TR", 26, "F05A01A16", "TR330006100519786457841326"));
	addIBANSpec(new IBANSpecification("VG", 24, "U04F16", "VG96VPVG0000012345678901"));

}();
