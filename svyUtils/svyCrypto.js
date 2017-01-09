/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

/**
 * @private 
 * @properties={typeid:35,uuid:"25729878-C7ED-4A75-8151-80BDFA9C71C2",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger("com.servoy.bap.svyCrypto");

/**
 * Supported algorithms
 * 
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"E2451988-579B-49F0-81C6-ECB6843D26FD",variableType:-4}
 */
var ALGORITHM_NAMES = {
	AES:"AES",
	DES:"DES"
};

/**
 * BASE-64-ENCODED KEYS (used internally)
 * @private 
 * 
 * @properties={typeid:35,uuid:"188CE9F7-1FD1-4ADB-87B2-E78D926C9678",variableType:-4}
 */
var INTERNAL_KEYS = {
	AES:"Hheq+OO753QxiBwUvf0ROQ==",
	DES:"V0liO0kq0Js="
}

/**
 * @private 
 * @properties={typeid:35,uuid:"A79A63EA-B556-408A-A499-5D64ED5D1D17",variableType:-4}
 */
var PBE_DEFAULTS = {
	iterations : 65536,
	/** @type {Array<byte>} */
	salt : [ -9, 122, -17, -112, -113, -94, -50, -100]
}

/**
 * @public 
 * 
 * @param {String} value
 * @param {EncryptionOptions} [options]
 * @param {String} [secretPassPhrase]
 * 
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"79C23D58-B7F8-4332-8F8F-444FD4BB5DB9"}
 */
function encrypt(value, options, secretPassPhrase){
	if(secretPassPhrase){
		return encryptPBE(value,secretPassPhrase,options);
	}
	return encryptInternal(value,options);
}

/**
 * @public 
 * 
 * @param {String} value
 * @param {EncryptionOptions} [options]
 * @param {String} [secretPassPhrase]
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"5945176E-30A8-4BF9-A13C-3D2CF9819CF7"}
 */
function decrypt(value, options, secretPassPhrase){
	if(secretPassPhrase){
		return decryptPBE(value,secretPassPhrase,options);
	}
	return decryptInternal(value,options);
}

/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 * 
 * TODO Assumes a DES algorithm for PBE. Add support for AES
 * @properties={typeid:24,uuid:"BBBCBDCE-B995-4FC8-99DA-F2CB48992F9F"}
 */
function encryptPBE(value, secretPassPhrase, options){
	if(!options){
		options = createOptions();
		options.setAlgorithmName(ALGORITHM_NAMES.DES);
		log.debug("Algorithm set to DES for PBE as AES is not supported");
	}
	switch(options.getAlgorithmName()){
		case ALGORITHM_NAMES.AES :
			return encryptPBEWithAES(value,secretPassPhrase,options);
		case ALGORITHM_NAMES.DES :
			return encryptPBEWithDES(value,secretPassPhrase,options);
		default :
			throw "Invalid Algorithm: " + options.getAlgorithmName();
	}
}

/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 *
 * @properties={typeid:24,uuid:"900E310F-4F7A-4313-9100-D30F50E276C3"}
 */
function encryptPBEWithDES(value, secretPassPhrase, options){
	var password = new java.lang.String(secretPassPhrase);
	var factory = Packages.javax.crypto.SecretKeyFactory.getInstance("PBEWithMD5AndDES");
    var spec = new Packages.javax.crypto.spec.PBEKeySpec(password.toCharArray(), options.getSalt(), options.getIterations(), 256);
    var secret = factory.generateSecret(spec);
    var paramSpec = new Packages.javax.crypto.spec.PBEParameterSpec(options.getSalt(), options.getIterations());    
    var cipher = Packages.javax.crypto.Cipher.getInstance(secret.getAlgorithm());
    cipher.init(Packages.javax.crypto.Cipher.ENCRYPT_MODE, secret, paramSpec);
    var encryptedBytes = cipher.doFinal(string2Bytes(value));
    return new Packages.sun.misc.BASE64Encoder().encode(encryptedBytes);
}

/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 *
 * @properties={typeid:24,uuid:"FE255415-6900-45B9-BC95-1BCC3A6E5979"}
 */
function decryptPBEWithDES(value, secretPassPhrase, options){
	var password = new java.lang.String(secretPassPhrase);
	var factory = Packages.javax.crypto.SecretKeyFactory.getInstance("PBEWithMD5AndDES");
    var spec = new Packages.javax.crypto.spec.PBEKeySpec(password.toCharArray(), options.getSalt(), options.getIterations(), 256);
    var secret = factory.generateSecret(spec);
    var paramSpec = new Packages.javax.crypto.spec.PBEParameterSpec(options.getSalt(), options.getIterations());
	var decipher = Packages.javax.crypto.Cipher.getInstance(secret.getAlgorithm());
    decipher.init(Packages.javax.crypto.Cipher.DECRYPT_MODE, secret, paramSpec);
    var bytesToDecrypt = new Packages.sun.misc.BASE64Decoder().decodeBuffer(value);
    var decryptedBytes = decipher.doFinal(bytesToDecrypt);
    return new java.lang.String(decryptedBytes, "UTF-8").toString();
}


/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 *
 * @properties={typeid:24,uuid:"08876BC7-900E-4026-A97F-A833CEEBB906"}
 */
function encryptPBEWithAES(value, secretPassPhrase, options){
	throw "Unsupported: PBE w/ AES is not (yet) supported"
//	var password = new java.lang.String(secretPassPhrase);
//	var factory = Packages.javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
//    var spec = new Packages.javax.crypto.spec.PBEKeySpec(password.toCharArray(), options.getSalt(), options.getIterations(), 128);
//    var tmp = factory.generateSecret(spec);
//    var secret = new Packages.javax.crypto.spec.SecretKeySpec(tmp.getEncoded(), "AES");
//    var cipher = Packages.javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
//    cipher.init(Packages.javax.crypto.Cipher.ENCRYPT_MODE, secret);
//    var bytes = cipher.doFinal(string2Bytes(value));
//    return base64EncodeAsString(bytes);
}

/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 *
 * @properties={typeid:24,uuid:"13667F5C-020B-4E47-BDF4-EE13FD4467F2"}
 */
function decryptPBEWithAES(value, secretPassPhrase, options){
	throw "Unsupported: PBE w/ AES is not (yet) supported"
//	var password = new java.lang.String(secretPassPhrase);
//	var factory = Packages.javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
//    var spec = new Packages.javax.crypto.spec.PBEKeySpec(password.toCharArray(), options.getSalt(), options.getIterations(), 128);
//    var tmp = factory.generateSecret(spec);
//    var secret = new Packages.javax.crypto.spec.SecretKeySpec(tmp.getEncoded(), "AES");
//
//    var paramSpec = new Packages.javax.crypto.spec.IvParameterSpec(iv);
//    
//    var decipher = Packages.javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
//    decipher.init(Packages.javax.crypto.Cipher.DECRYPT_MODE, secret, paramSpec);
//    
//    var bytesToDecrypt = base64DecodeAsBytes(value)
//    var decryptedBytes = decipher.doFinal(bytesToDecrypt);
//    return new java.lang.String(decryptedBytes, "UTF-8").toString();
}
/**
 * @private  
 * 
 * @param {String} value
 * @param {String} secretPassPhrase
 * @param {EncryptionOptions} [options]
 * @return {String}
 * 
 * TODO Assumes a DES algorithm for PBE. Add support for AES
 * @properties={typeid:24,uuid:"80990ED5-A4D1-425E-8A97-283F06FCE571"}
 */
function decryptPBE(value, secretPassPhrase, options){
	if(!options){
		options = createOptions();
		options.setAlgorithmName(ALGORITHM_NAMES.DES);
		log.debug("Algorithm set to DES for PBE as AES is not supported");
	}
	switch(options.getAlgorithmName()){
		case ALGORITHM_NAMES.AES :
			return decryptPBEWithAES(value,secretPassPhrase,options);
		case ALGORITHM_NAMES.DES :
			return decryptPBEWithDES(value,secretPassPhrase,options);
		default :
			throw "Invalid Algorithm: " + options.getAlgorithmName();
	}
}

/**
 * @private  
 * @param {String} value
 * @param {EncryptionOptions} [options]
 * @return {String}
 * @properties={typeid:24,uuid:"B9D632D6-B698-4973-AD8B-DC371D1E5ED3"}
 * @SuppressWarnings(wrongparameters)
 */
function encryptInternal(value, options){	
	if(!options){
		options = createOptions();
	}
	log.info(options)
	var bytes = string2Bytes(value);
	var key = getKey(options.getKey(),options);
	var cipher = getCipher(options);
	cipher.init(Packages.javax.crypto.Cipher.ENCRYPT_MODE, key);
	var encrypted = cipher.doFinal(bytes);
	var result = base64EncodeAsString(encrypted);
	return result;
}

/**
 * @private  
 * 
 * @param {String} value
 * @param {EncryptionOptions} [options]
 * @return {String}
 * 
 *
 * @properties={typeid:24,uuid:"A6155116-0B3C-47F2-9D1A-099D8C1A9666"}
 */
function decryptInternal(value, options){
	if(!options){
		options = createOptions();
	}
	var bytes = base64DecodeAsBytes(value);
	var cipher = getCipher(options);
	var key = getKey(options.getKey(),options);
	cipher.init(Packages.javax.crypto.Cipher.DECRYPT_MODE, key);
	var result = new java.lang.String(cipher.doFinal(bytes)).toString();
//	log.debug("Decrypted <"+result+"> from <"+value+">");
	return result;
}

/**
 * @public 
 * @return {EncryptionOptions}
 * @properties={typeid:24,uuid:"73257B00-A805-4FEA-9955-4C08A78A10BE"}
 */
function createOptions(){
	var o = new EncryptionOptions();
		o.setAlgorithmName(ALGORITHM_NAMES.AES)
		.setKey(INTERNAL_KEYS.AES)
		.setIterations(PBE_DEFAULTS.iterations)
		.setSalt(PBE_DEFAULTS.salt)
	return o;
}

/**
 * @private 
 * @constructor 
 * @properties={typeid:24,uuid:"DFC5508B-330C-4E02-AE6C-FC5130085E2B"}
 */
function EncryptionOptions(){
	
	var algorithmName = null;
	var key = null;
	var salt = null;
	var iterations = 1;
	var iv = null;
	/**
	 * @public 
	 * @return {String}
	 */
	this.getAlgorithmName = function(){
		return algorithmName;
	}
	
	/**
	 * @public 
	 * @param {String} name
	 * @return {EncryptionOptions} This options object
	 */
	this.setAlgorithmName = function(name){
		algorithmName = name;	// TODO: validate input
		return this;
	}
	
	/**
	 * Returns the base-64-encoded String version of the key
	 * @public 
	 * @return {String} 
	 */
	this.getKey = function(){
		return base64EncodeAsString(key.getEncoded());
	}
	
	/**
	 * @public 
	 * @param {String} keyString The base-64-encoded String version of this key
	 * @return {EncryptionOptions} This options object
	 */
	this.setKey = function(keyString){
		key = getKey(keyString,this);
		return this;
	}
	
	/**
	 * @public 
	 * @return {Array<byte>} The salt used
	 */
	this.getSalt = function(){
		return salt;
	}
	
	/**
	 * @public 
	 * @param {Array<byte>} bytes The Byte Array used for the salt
	 * @return {EncryptionOptions} This options object
	 */
	this.setSalt = function(bytes){
		salt = bytes;	// TODO: Validate Input
		return this;
	}
	
	/**
	 * @public 
	 * @return {Number} The number of iterations used
	 */
	this.getIterations = function(){
		return iterations;
	}
	
	/**
	 * @public 
	 * @param {Number} i The number of iterations to use
	 * @return {EncryptionOptions} This options object
	 */
	this.setIterations = function(i){
		iterations = i;	// TODO: Validate Input
		return this;
	}
	
	/**
	 * Securely & Randomly generates a new key and stores it in this options object
	 * When using this method, one should keep the key/options result to use for decrypting
	 * @public 
	 * @return {EncryptionOptions} This options object
	 */
	this.generateKey = function(){
		var generator = Packages.javax.crypto.KeyGenerator.getInstance(algorithmName);
		key = generator.generateKey();
		return this;
	}
	
	/**
	 * Generates the salt for encryption and stores in this options object
	 * When using this method, one should keep the key/options result to use for decrypting
	 * 
	 * @public 
	 * @return {EncryptionOptions} This options object
	 */
	this.generateSalt = function(){
		//	 TODO generate salt
		return this;
	}
	
	/**
	 * Sets the Initialization Vector used in PBE/AES operations
	 * @public  
	 * @param {Array<byte>} bytes
	 * @return {EncryptionOptions} This options object
	 */
	this.setIV = function(bytes){
		iv = bytes;
		return this;
	}
	/**
	 * gets the Initialization Vector used in PBE/AES operations
	 * @public  
	 * @return {Array<byte>}
	 */
	this.getIV = function(){
		return iv
	}
	
	/**
	 * Convert this options object to a string representation, ideal for serialization/persistence
	 * @public 
	 * @return {String}
	 */
	this.toJSON = function(){
		//	TODO: Implement
		return null;
	}
	
	/**
	 * Update this options object from a string representation, ideal for de-serialization
	 * @public 
	 * @param {String} json
	 * @return {EncryptionOptions}
	 */
	this.fromJSON = function(json){
		//	TODO: implement
		return this;
	}
}

/**
 * @private 
 * @param str
 * @return {Array<byte>}
 * @properties={typeid:24,uuid:"73E8A428-BFE1-4B3B-9A8E-2D29645F7B8B"}
 */
function string2Bytes(str){
	return new java.lang.String(str).getBytes();
}

/**
 * @private 
 * @param {Array<byte>} bytes
 * @return {String}
 * @properties={typeid:24,uuid:"99EDA1C0-B92D-4BFD-976C-6406386C06CC"}
 */
function base64EncodeAsString(bytes){
	var b64 = new Packages.org.apache.commons.codec.binary.Base64();
	return b64.encodeAsString(bytes);
}

/**
 * @private 
 * @param {String} encodedStr
 * @return {Array<byte>}
 * @properties={typeid:24,uuid:"B94FC7D2-63AC-4CAB-9A14-26F400C06842"}
 */
function base64DecodeAsBytes(encodedStr){
	var b64 = new Packages.org.apache.commons.codec.binary.Base64();
	return b64.decode(encodedStr);
}

/**
 * @private 
 * @param {String} str
 * @param {EncryptionOptions} [options]
 * @return {Packages.javax.crypto.SecretKey}
 * @properties={typeid:24,uuid:"ECE26AC1-99BA-48B7-B9DF-7E60263D04B6"}
 */
function getKey(str, options){
	if(!options){
		options = createOptions();
	}
	return new Packages.javax.crypto.spec.SecretKeySpec(base64DecodeAsBytes(str), options.getAlgorithmName());
}

/**
 * @private 
 * @param {EncryptionOptions} options
 * @return {Packages.javax.crypto.Cipher}
 * 
 * @properties={typeid:24,uuid:"14A022E5-1369-4660-ADA8-91604C05B73F"}
 */
function getCipher(options){
	switch (options.getAlgorithmName()) {
		case ALGORITHM_NAMES.AES:		
			return Packages.javax.crypto.Cipher.getInstance("AES/ECB/PKCS5Padding");
		case ALGORITHM_NAMES.DES:
			return Packages.javax.crypto.Cipher.getInstance("DES/ECB/PKCS5Padding");
		default:
			throw "Unsupported Algorithm: " + options.getAlgorithmName();
	}
}