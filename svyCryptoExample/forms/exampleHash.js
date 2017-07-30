/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"238CE460-A2B4-4CF0-B6F7-7C5313609413"}
 */
var algorithm = scopes.svyCrypto.HASH_ALGORITHM_NAMES.MD5;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"4150CBEB-7FE2-4215-A5C1-8E546A39923F"}
 */
var input = 'Hello World';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8193F864-C871-4D13-B823-25826C93C740"}
 */
var output = '';
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"3A2CF6F8-753E-4E02-A887-8F08C2191F64"}
 */
function hash(event) {
	output = scopes.svyCrypto.getHash(input,algorithm);
	
	/*
	 * The above code is more convenient in this case.
	 * But it is also possible to explicitly call the algorithm by name for convenience
	 * See Below...
	 */
	
	/*
	switch (algorithm) {
		case scopes.svyCrypto.HASH_ALGORITHM_NAMES.MD5:
			output = scopes.svyCrypto.getMD5(input);
			break;
		case scopes.svyCrypto.HASH_ALGORITHM_NAMES.SHA_1:
			output = scopes.svyCrypto.getSHA1(input);
			break;
		case scopes.svyCrypto.HASH_ALGORITHM_NAMES.SHA_256:
			output = scopes.svyCrypto.getSHA256(input);
			break;
		default:
			break;
	}
	*/
}
