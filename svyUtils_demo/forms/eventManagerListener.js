/**
 * @properties={typeid:35,uuid:"B292226F-177E-493D-A53E-694AD1D6A874",variableType:-4}
 */
var EventManager = scopes.svyEventManager;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"A05B7818-0BE5-46B6-9F89-8804C1082775",variableType:8}
 */
var isListeningSampleEvent;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"620493DF-CB76-4D82-8151-3FD0E588EF49",variableType:8}
 */
var isListeningMyCustomEvent;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"293D7DF7-CEB2-4477-8E7D-1CF7ABE703E3"}
 */
var text = "";

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"667DE411-0AD4-4B1D-9A64-C4CB6B7C89BE"}
 */
function onLoad(event) {
	subscriveToSampleEvent()
}

/**
 * Callback method when form is destroyed.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"632856FB-D49F-4D34-A3C0-215E484C492E"}
 */
function onUnload(event) {
	// remove all listener when unloading the form
	unsubscriveFromSampleEvent()
	unsubscriveFromMyCustomEvent()
}

/**
 * Perform the element default action.
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"CEEB15CE-AACB-4752-8FE2-FA25D68589FD"}
 */
function subscriveToSampleEvent() { 
	EventManager.addListener("demoEventManager", scopes.demo.EVENT_TYPES.SAMPLE_EVENT, callbackEventHandler)
	isListeningSampleEvent = 1
}

/**
 * Perform the element default action.
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"649682E8-E142-4262-B297-C31D0F41F66E"}
 */
function unsubscriveFromSampleEvent() { 
	EventManager.removeListener("demoEventManager", scopes.demo.EVENT_TYPES.SAMPLE_EVENT, callbackEventHandler)
	isListeningSampleEvent = 0
}

/**
 * Perform the element default action.
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3061447F-FE8B-45FF-9914-6ACE7C578FC1"}
 */
function subscriveToMyCustomEvent() { 
	EventManager.addListener("demoEventManager", scopes.demo.EVENT_TYPES.MY_CUSTOM_EVENT, callbackEventHandler)
	isListeningMyCustomEvent = 1
}

/**
 * Perform the element default action.
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4D5F209E-CBED-47CC-9F37-82CFDB6C21D9"}
 */
function unsubscriveFromMyCustomEvent() { 
	EventManager.removeListener("demoEventManager", scopes.demo.EVENT_TYPES.MY_CUSTOM_EVENT, callbackEventHandler)
	isListeningMyCustomEvent = 0
}

/**
 * @param {EventManager.Event} eventObj
 * 
 * @properties={typeid:24,uuid:"21828D7A-2595-42AE-BC26-01AEC4207283"}
 */
function callbackEventHandler(eventObj) {
	// update the text for received messages whenever an event is sent
	var data = eventObj.data

	if (data.isImportant) {
		text += 'IMPORTANT - '
	} else {
		text += 'not important - '
	}
	text += 'Event Type: ' + eventObj.getType() + ', '
	text += 'Event Source: ' + eventObj.getSource() + ', '
	text += 'message: ' + data['message']
	text += '\n'
}
