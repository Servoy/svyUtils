/**
 * @properties={typeid:35,uuid:"9C9EFB05-7958-4EA1-85DB-1BE6B3CB8EF7",variableType:-4}
 */
var EventManager = scopes.modUtils$eventManager

/**
 * @properties={typeid:35,uuid:"DF564340-781C-46B9-86E5-67D80C90EF39",variableType:-4}
 */
var EVENT_TYPES = {
	MY_CUSTOM_EVENT: 'myCustomEvent'
}

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D6BC4906-1780-4FBA-ABB0-A2C4DB0AE6ED"}
 */
var invokeCount

/**
 * Test adding and removing listeners and passing arguments
 * @properties={typeid:24,uuid:"EB26E8F5-292B-4E8B-992D-07F61423EF62"}
 */
function testEventManager() {
	invokeCount = 0
	EventManager.addListener(this, EVENT_TYPES.MY_CUSTOM_EVENT, MyCustomEventHandler)
	EventManager.fireEvent(this,EVENT_TYPES.MY_CUSTOM_EVENT,[true, 1, 'hello'])
	EventManager.removeListener(this, EVENT_TYPES.MY_CUSTOM_EVENT, MyCustomEventHandler)
	EventManager.fireEvent(this,EVENT_TYPES.MY_CUSTOM_EVENT,[true, 1, 'hello'])
	jsunit.assertEquals(1,invokeCount)
}

/**
 * @properties={typeid:24,uuid:"849B151F-FD09-47BF-ACBD-6BC34E9B719E"}
 */
function MyCustomEventHandler() {
	jsunit.assertEquals(3, arguments.length)
	jsunit.assertEquals(true, arguments[0])
	jsunit.assertEquals(1, arguments[1])
	jsunit.assertEquals('hello', arguments[2])
	
	invokeCount++
}

/**
 * Tests that firing an event doesn't trigger the loading of an unloaded form if the listener method is a Form method on the onloaded form
 * @properties={typeid:24,uuid:"0D2349AC-A371-4E34-BDEF-7B2AB1C30025"}
 */
function testEventFiringOnUnloadedForm() {
	invokeCount = 0
	var eventType = 'myEvent'
	EventManager.addListener(this, eventType, forms.testEventFiringOnUnloadedForm.MyEventHandler)
	EventManager.fireEvent(this, eventType)
	history.removeForm('testEventFiringOnUnloadedForm')
	EventManager.fireEvent(this, eventType)
	forms.testEventFiringOnUnloadedForm
	EventManager.fireEvent(this, eventType)	
	
	jsunit.assertEquals(2,invokeCount)
}

/**
 * @properties={typeid:24,uuid:"9D3CF470-912D-471D-BC0E-D53480DEB924"}
 */
function testAddingSameListenerMultipletimes() {
	invokeCount = 0
	var eventType = 'myEvent'
	EventManager.addListener(this, eventType, forms.testEventFiringOnUnloadedForm.MyEventHandler)
	EventManager.addListener(this, eventType, forms.testEventFiringOnUnloadedForm.MyEventHandler)
	EventManager.addListener(this, eventType, forms.testEventFiringOnUnloadedForm.MyEventHandler)
	EventManager.addListener(this, eventType, forms.testEventFiringOnUnloadedForm.MyEventHandler)
	EventManager.fireEvent(this, eventType)
	
	
	jsunit.assertEquals(1,invokeCount)
}