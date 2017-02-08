/**
 * Flag to indicate if using a key
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"10F42FD9-FCBD-4580-AB40-D2B18DFC5624",variableType:4}
 */
var useKey = 1;


/**
 * Flag to indicate if using a secret passphrase
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"1B08E6D1-E629-4E5D-987B-C6075C7F4F67",variableType:4}
 */
var usePassphrase = 0;

/**
 * The algorithm to use (default to AES)
 * @private 
 * @type {String}
 * @properties={typeid:35,uuid:"B0F3CDE4-3D22-4676-A971-B24BEB7828AA"}
 */
var algorithm = scopes.svyCrypto.ALGORITHM_NAMES.AES;

/**
 * The plain text to encrypt
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7ABD622C-B35B-43C6-A52B-25B13A69A893"}
 */
var plainText = 'Hello World';

/**
 * The encrypted value
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"354DCBDD-A5CA-4A11-8B62-159B9FA275CF"}
 */
var encrypted = '';

/**
 * The key as a base64-encoded string
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1D8175E6-E387-4CEF-83F6-D59660163B9D"}
 */
var key = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"05F4F19C-17D5-4E69-BE9C-FA6A632D0E7B"}
 */
var initializationVector = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1CD6FC49-2476-45EC-9B22-84949A130537"}
 */
var secretPassPhrase = null;


/**
 * @private 
 * @properties={typeid:35,uuid:"8A4E44D8-6A68-4C69-A357-D6D3A158FCE2",variableType:-4}
 */
var toastrOptions = {
	"closeButton": true,
	"positionClass": "toast-top-center",
	"timeOut": "8000",
	"showMethod": "slideDown",
	"hideMethod": "slideUp",
	"hideDuration": "300"
	
};
/**
 * @properties={typeid:24,uuid:"B066A1EC-DDD3-4BB6-9B4E-0692152D743A"}
 */
function generateKey(){
	key = scopes.svyCrypto.createOptions().setAlgorithmName(algorithm).generateKey().getKeyAsString();
}

/**
 * @properties={typeid:24,uuid:"225B64FB-D8F9-480C-87D4-25319D05D6AC"}
 */
function encrypt(){
	
	// validate key
	if(useKey && !key){
		plugins.webnotificationsToastr.error('Please enter or generate a valid key','No Key Specified',toastrOptions);
		return;
	}
	
	// validate passphrase
	if(usePassphrase && !secretPassPhrase){
		plugins.webnotificationsToastr.error('Please enter a secret passphrase','No Passphrase',toastrOptions);
		return;
	}
	
	// encryption options
	var options = scopes.svyCrypto.createOptions()
		.setAlgorithmName(algorithm)
		.setKey(key);
	
	// Here's where the magic happens
	var message = scopes.svyCrypto.encrypt(plainText,options,secretPassPhrase);
	encrypted = message.getValue();
	initializationVector = message.getIVString();
	
	// clear plain text
	plainText = null;
}

/**
 * @properties={typeid:24,uuid:"BB4D6FBC-161F-4160-AC68-83881DCE538B"}
 */
function decrypt(){
	var options = scopes.svyCrypto.createOptions()
	.setAlgorithmName(algorithm)
	.setKey(key);

	plainText = scopes.svyCrypto.decryptAsString(encrypted,options,secretPassPhrase,initializationVector);
	encrypted = null;
	initializationVector = null;
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {String} oldValue old value
 * @param {String} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"BDFE8286-1403-4F3D-8567-2047001FA552"}
 */
function onDataChangeAlgorithm(oldValue, newValue, event) {
	key = null;
	updateUI();
	return true
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"973155CD-6BC2-4464-8B81-81EF94925F05"}
 */
function onActionUseKey(event) {
	usePassphrase = !useKey ? 1 : 0;
	secretPassPhrase = null;
	updateUI();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E6D0195C-DDF3-4B2B-ACB2-812AD3601AF0"}
 */
function onActionUsePass(event) {
	useKey = !usePassphrase ? 1 : 0;
	key = null;
	updateUI();
	if(usePassphrase){
		elements.secretPassPhrase.requestFocus();
	}
}

/**
 * @properties={typeid:24,uuid:"8FB34FC7-41DD-445C-A88B-31C149966375"}
 */
function updateUI(){
	var keyEnabled = useKey == 1;
	elements.key.enabled = keyEnabled;
	elements.generateKey.enabled = keyEnabled;
	elements.secretPassPhrase.enabled = !keyEnabled;
	
	var showIV = algorithm == scopes.svyCrypto.ALGORITHM_NAMES.AES && !keyEnabled;
	elements.initializationVector.visible = showIV;
	elements.ivInfo.visible = showIV;
}
/**
 * Show info about IV
 * @private
 *
 * @properties={typeid:24,uuid:"915F2408-5D05-43CA-BD4A-02B7A5266A3A"}
 */
function showIVInfo() {
	
	var msg = 'Initialization Vector is a random block of bytes which is generated for each message.<br><br>' +
	'It ensures that patterns are obfuscated in the encrypted message.<br><br>' +
	'It must be used when using AES algorithm in combination with secret passphrase (non-key) encryption';
	
	var title = 'What is Initialization Vector?';
	
	
	
	plugins.webnotificationsToastr.info(msg,title, toastrOptions);
}
