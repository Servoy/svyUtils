/**
 * @properties={typeid:35,uuid:"711ADCE1-0C10-43F7-AD05-6AB0A526DB91",variableType:-4}
 */
var EventManager = scopes.svyEventManager;

/**
 * default event type
 * @type {String}
 *
 * @properties={typeid:35,uuid:"5341F0EE-C5CF-4786-91C6-A393AAAF7010"}
 */
var eventType = scopes.demo.EVENT_TYPES.SAMPLE_EVENT;

/**
 * mark if is an important message
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"8A23A302-F606-43B7-A929-A2C4D036767F",variableType:4}
 */
var isImportant = 0;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"23C49854-A878-4CB8-A273-7A4CA8493DF1"}
 */
var text = "This is a sample message";

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"1C42198A-A160-4783-98AA-B1D464AC7C96"}
 */
function sendNotification(event) {
	
	// Any object can be send to all listener when event is fired.
	var messageObj = {
		isDemo: true,
		isImportant: isImportant,
		message: text
	}
	var eventObj = new EventManager.Event(eventType, "demoEventManager", messageObj)
	EventManager.fireEvent("demoEventManager", eventType, eventObj)
}
