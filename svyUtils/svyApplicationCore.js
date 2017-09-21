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
 * @properties={typeid:35,uuid:"09288A13-7587-40CD-B8DF-36AD6EEC8D34",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.application.core')

/**
 * @private
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"8E4C4D0D-F783-47C5-A223-7114044680BE",variableType:-4}
 */
var APPLICATION_EVENT_TYPES = {
	DATABROADCAST: 'svy.databroadcast',
	ERROR: 'svy.error',
	MODULE_INITIALIZED: 'bap.moduleinitialized'
}

/**
 * Method to call from the onOpen method of a solution (can be used directly as the onOpen event handler).
 *
 * The method will invoke the moduleInit method on all instances of the AbstractModuleDef class
 *
 * @param {Object<Array<String>>} [startupArguments] all startup arguments with which the solution is opened
 *
 * @properties={typeid:24,uuid:"6BF49C3D-F3BF-426E-AE0F-B7017D5D7939"}
 */
function initModules(startupArguments) {
	//TODO: more severe logging on mods without ID
	var processed = {}
	/** @type {Array<String>} */
	var stack = []

	var mods = scopes.svyUI.getJSFormInstances(solutionModel.getForm('AbstractModuleDef'))
	var moduleDefNameById = {}
	
	/** @type {RuntimeForm<AbstractModuleDef>}*/
	var form
	for (var i = 0; i < mods.length; i++) {
		var id = forms[mods[i].name].getId()
		if (!id) {
			log.error("Module ID not provided on '{}'. Skipping the Module definition", mods[i].name)
			continue
		}
		if (moduleDefNameById.hasOwnProperty(id)) {
			log.error("Duplicate module ID '{}' found: '{}' and '{}' use the same ID. Skipping the latter", id, moduleDefNameById[id], mods[i].name)
			continue
		}
		moduleDefNameById[forms[mods[i].name].getId()] = mods[i].name
	}
	
	for (i = 0; i < mods.length; i++) {
		stack.length = 0
		stack.push(mods[i].name)
		
		stack: while (stack.length) {
			var moduleDefName = stack.slice(-1)[0]
			log.trace('Processing moduleDefinition "{}"', moduleDefName)
			
			if (moduleDefName in processed) {
				stack.pop()
				continue
			}
			
			form = forms[moduleDefName];
			var dependencies = form.getDependencies()
			if (dependencies) {
				dependencies: for (var j = 0; j < dependencies.length; j++) {
					var name = moduleDefNameById[dependencies[j].id]
					if (!name) {
						log.error("Module with ID '{}' not found. Referenced by '{}'", dependencies[j].id, moduleDefNameById[form.getId()])
						continue dependencies
					}
					if (name in processed) { //already processed
						continue dependencies
					}
					if (stack.indexOf(name) !== -1 || name === moduleDefName) { //circular reference
						var ids = stack.map(function(value) {
							return forms[value].getId()
						})
						ids.push(dependencies[j].id)
						log.error('Circuclar module dependancies detected: {}', ids.join(' > '))
						continue dependencies
					}
					stack.push(name)
					continue stack
				}
			}
			
			//Process module with error handling
			try {
				form.moduleInit.call(null, startupArguments);
				scopes.svyEventManager.fireEvent(this, APPLICATION_EVENT_TYPES.MODULE_INITIALIZED, [form])
				log.debug('Initialized module {} version {}', (form.getId() ? form.getId() : "[no ID provided for moduleDefinition \"" + moduleDefName + "\"]"), form.getVersion());
			} catch(e) {
				log.error("Error initializing module '{}'. Application may not function properly", moduleDefName, e)
			}
			stack.pop()
			processed[moduleDefName] = null
		}
	}
	
	//Forced unload of the AbstractModuleDef instances
	for (i = 0; i < mods.length; i++) {
		history.removeForm(mods[i].name);
	}
}

/**
 * @param {function(RuntimeForm<AbstractModuleDef>)} listener
 *
 * @properties={typeid:24,uuid:"069FCBF4-94B9-4D0D-A5DF-D099CF8ACBF5"}
 */
function addModuleInitListener(listener) {
	scopes.svyEventManager.addListener(this, APPLICATION_EVENT_TYPES.MODULE_INITIALIZED, listener)
}

/**
 * Method to assign to or call from the solution's onDataBroadcast event
 * 
 * @param {String} dataSource table data source
 * @param {Number} action see SQL_ACTION_TYPES constants
 * @param {JSDataSet} pks affected primary keys
 * @param {Boolean} cached data was cached
 * 
 * @properties={typeid:24,uuid:"13806A84-2961-4119-BBE4-F6FA72CC7261"}
 */
function fireDataBroadcastEvent(dataSource, action, pks, cached) {
	//Fire it for global databroadcast listeners
	scopes.svyEventManager.fireEvent(this, APPLICATION_EVENT_TYPES.DATABROADCAST, Array.prototype.slice.call(arguments, 0))

	//Fire it for a specific DataSource
	scopes.svyEventManager.fireEvent(dataSource, APPLICATION_EVENT_TYPES.DATABROADCAST, Array.prototype.slice.call(arguments, 0))
	
	//Fire it for a specific JSRecord
	for (var i = 1; i <= pks.getMaxRowIndex(); i++) {
		var row = pks.getRowAsArray(i);
		var id = dataSource + '/'
		for (var j = 0; j < row.length; j++) {
			id += '/' + (row[j] + '').replace(/\./g, '%2E').replace(/\//g, '%2F') //Encoding .'s and /-es 
		}
		scopes.svyEventManager.fireEvent(id, APPLICATION_EVENT_TYPES.DATABROADCAST, Array.prototype.slice.call(arguments, 0))
	}
}

/**
 * Registers a listener for incoming databroadcast events.<br><br>
 * NOTE: this method requires {@link #fireDataBroadcastEvent} to be hooked up or be called from the Solutions onDatabroadCast event<br>
 * NOTE: a Client only receives databroadcast events for datasources to which is holds a reference, for example has a form loaded connected to the datasource<br>
 * <br>
 * 
 * @param {Function} listener
 * @param {String|JSRecord} [obj] Listen to just databroadcasts on a specific datasource or JSRecord
 * 
 * @example <pre> &#47;**
 *  * Var holding a reference to a foundset on the contacts table of the udm database, so this client receives databroadcast events for this table
 *  * &#64;private
 *  * @type {JSFoundSet}
 *  *&#47;
 * var fs
 *
 * function onLoad() {
 * 	fs = databaseManager.getFoundSet('db:/udm/contacts')
 * 	fs.clear()
 * 	scopes.svyApplicationCore.addDataBroadcastListener(dataBroadcastEventListener)
 * }
 *
 * &#47;**
 *  * @param {String} dataSource
 *  * @param {Number} action
 *  * @param {JSDataSet} pks
 *  * @param {Boolean} cached
 *  *&#47;
 * function dataBroadcastEventListener(dataSource, action, pks, cached) {
 * 	if (dataSource == 'db:/udm/contacts' && action & (SQL_ACTION_TYPES.INSERT_ACTION | SQL_ACTION_TYPES.DELETE_ACTION)) {
 * 		//Your business logic here
 * 	}
 * }
 *</pre>
 * 
 * @properties={typeid:24,uuid:"61D4FBB5-F109-4BA6-B4F6-BBAABE4C5B91"}
 */
function addDataBroadcastListener(listener, obj) {
	var context = this
	if (obj) {
		if (!(obj instanceof JSRecord || typeof obj === 'string')) {
			throw scopes.svyExceptions.IllegalArgumentException('obj param value passed into addDatabroadcastListener must be either a JSRecord or a String representing a datasource')
		} else if (obj instanceof JSRecord) {
			var pks = obj.getPKs()
			context = obj.getDataSource() + '/'
			for (var j = 0; j < pks.length; j++) {
				context += '/' + (pks[j] + '').replace(/\./g, '%2E').replace(/\//g, '%2F') //Encoding .'s and /-es 
			}
		} else {
			context = obj.toString();
		}
	}
	//TODO: add option to hold a reference to an empty foundset on the datasource, so the client gets the databroadcast for that entity
	scopes.svyEventManager.addListener(context, APPLICATION_EVENT_TYPES.DATABROADCAST, listener)
}

/**
 * Method to assign to or call from the solution's onError event handler<br>
 * <br>
 * Will fire all attached eventHandlers until one returns false
 * 
 * @param {*} exception exception to handle
 *
 * @returns {Boolean} False when the exception was handled, otherwise true
 * 
 * @see See {@link #onErrorHandler} for a default onErrorHandler impl.
 *
 * @properties={typeid:24,uuid:"89A7F9F7-96BA-49F0-A69D-3B6D91BDEEFE"}
 */
function executeErrorHandlers(exception) {
	//workaround to get to the throw exception in JavaScript. See SVY-5618
	if (exception instanceof Packages.org.mozilla.javascript.JavaScriptException) {
		exception = exception['getValue']()
 	}
	try {
		scopes.svyEventManager.fireEvent(this, APPLICATION_EVENT_TYPES.ERROR, arguments, true)		
	} catch (e if e instanceof scopes.svyEventManager.VetoEventException) {
		return false
	}
	return true
}

/**
 * To handle uncaught exceptions that propagate through to the solutions onError handler<br>
 * <br>
 * If the handler handles the exception, it can throw a {@link #scopes#svyEventManager#VetoEventException} to cancel event propagation<br>
 * <br>
 * If an error is handled by an errorHandler, other errorHandlers will not be invoked anymore<br>
 * <br>
 * NOTE: For the errorHandlers to be called the {@link #executeErrorHandlers} or {@link #onErrorHandler} method needs to be hooked up to or be called from the solutions onError event<br>
 * <br>
 * @param {function(*):Boolean} handler Returning false will stop further errorHandlers form being called
 * @properties={typeid:24,uuid:"0957F336-5AD6-4EB5-A912-6D29EA8F0809"}
 */
function addErrorHandler(handler) {
	//TODO: allow registering listeners for specific Exceptions
	scopes.svyEventManager.addListener(this, APPLICATION_EVENT_TYPES.ERROR, handler)
}

/**
 * Default onError handler implementation to attach to the Solutions onError event property<br>
 * Will call all registered ErrorHandlers (see {@link #addErrorHandler}<br>
 * <br>
 * If the error is not handled after invoking all the registered handlers, the {@link #uncaughtExceptionCallback} will be invoked<br>
 * If there is no callback registered or the callback does not return false, the default handling of uncaught exceptions of Servoy will take place<br>
 * <br>
 * @param {ServoyException|Error|*} e
 *
 * @properties={typeid:24,uuid:"178BE2A9-2E37-49CD-A18F-38900B5109C0"}
 */
function onErrorHandler(e) {
	//workaround to get to the thrown exception object from JavaScript prior to Servoy 7.4. See SVY-5618
	if (e instanceof Packages.org.mozilla.javascript.JavaScriptException) {
 		e = e['getValue']()
 	}
 	var notHandled = true
	try {
		notHandled = executeErrorHandlers(e)
	} catch (ex if ex instanceof scopes.svyEventManager.VetoEventException) {
		notHandled = false
	} catch (ex) {
		e = ex
	}
	
	if (notHandled === true && uncaughtExceptionCallback) {
		notHandled = scopes.svySystem.callMethod(uncaughtExceptionCallback, e)
	}
	/* Returning anything but a Boolean true will make Servoy consider the exception handled.
	 * 
	 * When returning an explicit true, the exception will be "reported"
	 * In the Smart Client this will mean that the exception will be reported to the user via a dialog
	 * In the Web Client the exception will be logged to the serverside log file
	 */
	return !(notHandled === false)
}

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"55550FAA-85A7-4A80-B99A-4C7FA2A7E552"}
 */
var uncaughtExceptionCallback

/**
 * Allows setting a callback method which gets invoked in case of an unhandled exception<br>
 * <br>
 * NOTE: The calling of the callback method is dependent on {@link #onErrorHandler} being used as the event handler for the Solution onError event<br>
 * <br>
 * An unhandled exception is an exception that is send into the solutions onError handler and is not handled by any of the added ErrorHandlers (see {@link #addErrorHandler})<br>
 * <br>
 * This callback could be used for example to take a snapshot of the current state of the application and email the snapshot to the development team for inspection<br>
 * <br>
 * @param {function(ServoyException|Error|*):Boolean} callback Return false to prevent the Servoy default action for unhandled exceptions to be executed
 * @return {Boolean} true is setting the callback was successful
 * 
 * @properties={typeid:24,uuid:"71F36C85-8941-4698-8BE8-41051B27B6B8"}
 */
function setUncaughtExceptionCallback(callback) {
	uncaughtExceptionCallback = scopes.svySystem.convertServoyMethodToQualifiedName(callback)
	return uncaughtExceptionCallback || callback == null ? true : false
}

/**
 * Remove a listener for incoming databroadcast events previously registered using scopes.svyApplicationCore.addDataBroadcastListener.
 * 
 * @param {Function} listener
 * @param {String|JSRecord} [obj] Listen to just databroadcasts on a specific datasource or JSRecord
 * 
 * @example <pre> &#47;**
 *  * Var holding a reference to a foundset on the contacts table of the udm database, so this client receives databroadcast events for this table
 *  * &#64;private
 *  * @type {JSFoundSet}
 *  *&#47;
 * var fs
 *
 * function onShow() {
 * 	fs = databaseManager.getFoundSet('db:/udm/contacts')
 * 	fs.clear()
 * 	scopes.svyApplicationCore.addDataBroadcastListener(dataBroadcastEventListener);
 * }
 * 
 * function onHide() {
 * 	scopes.svyApplicationCore.removeDataBroadcastListener(dataBroadcastEventListener);
 * }
 *
 * &#47;**
 *  * @param {String} dataSource
 *  * @param {Number} action
 *  * @param {JSDataSet} pks
 *  * @param {Boolean} cached
 *  *&#47;
 * function dataBroadcastEventListener(dataSource, action, pks, cached) {
 * 	if (dataSource == 'db:/udm/contacts' && action & (SQL_ACTION_TYPES.INSERT_ACTION | SQL_ACTION_TYPES.DELETE_ACTION)) {
 * 		//Your business logic here
 * 	}
 * }
 *</pre>
 * 
 * @properties={typeid:24,uuid:"DCDBE018-B0A8-4778-9130-2CBCCF895A33"}
 */
function removeDataBroadcastListener(listener, obj) {
	var context = this
	if (obj) {
		if (!(obj instanceof JSRecord || typeof obj === 'string')) {
			throw scopes.svyExceptions.IllegalArgumentException('obj param value passed into addDatabroadcastListener must be either a JSRecord or a String representing a datasource')
		} else if (obj instanceof JSRecord) {
			var pks = obj.getPKs()
			context = obj.getDataSource() + '/'
			for (var j = 0; j < pks.length; j++) {
				context += '/' + (pks[j] + '').replace(/\./g, '%2E').replace(/\//g, '%2F') //Encoding .'s and /-es 
			}
		} else {
			context = obj.toString();
		}
	}
	scopes.svyEventManager.removeListener(context, APPLICATION_EVENT_TYPES.DATABROADCAST, listener)
}

/**
 * Fire the DataBroadcast even after a record insert.
 * Since the onDataBrodcast is not fired for the client triggering the data change, this method can be used to simulate the onDataBrodcast within the client.
 * Trigger this method at the onAfterRecordInsert event of the datasource to notify the client itself of the data change.
 * 
 * @param {JSRecord} record
 * @public 
 *
 * @properties={typeid:24,uuid:"9A1382E8-63D1-44C5-87C3-CA262F044AE6"}
 */
function fireDataBroadcastEventAfterRecordInsert(record) {
	var pks = databaseManager.createEmptyDataSet();
	pks.addRow(record.getPKs());
	fireDataBroadcastEvent(record.getDataSource(), SQL_ACTION_TYPES.INSERT_ACTION, pks, true);
}

/**
 * Fire the DataBroadcast even after a record update.
 * Since the onDataBrodcast is not fired for the client triggering the data change, this method can be used to simulate the onDataBrodcast within the client.
 * Trigger this method at the onAfterRecordUpdate event of the datasource to notify the client itself of the data change.
 * 
 * @param {JSRecord} record
 * @public 
 *
 * @properties={typeid:24,uuid:"6C0871FA-A83A-472F-B44D-FFFB3C23D3A1"}
 */
function fireDataBroadcastEventAfterRecordUpdate(record) {
	var pks = databaseManager.createEmptyDataSet();
	pks.addRow(record.getPKs());
	fireDataBroadcastEvent(record.getDataSource(), SQL_ACTION_TYPES.UPDATE_ACTION, pks, true);
}

/**
 * Fire the DataBroadcast even after a record delete.
 * Since the onDataBrodcast is not fired for the client triggering the data change, this method can be used to simulate the onDataBrodcast within the client.
 * Trigger this method at the onAfterRecordUpdate event of the datasource to notify the client itself of the data delete.
 * 
 * @param {JSRecord} record
 * @public 
 *
 * @properties={typeid:24,uuid:"106DBDF4-36CB-4141-B04F-579486C48C89"}
 */
function fireDataBroadcastEventAfterRecordDelete(record) {
	var pks = databaseManager.createEmptyDataSet();
	pks.addRow(record.getPKs());
	fireDataBroadcastEvent(record.getDataSource(), SQL_ACTION_TYPES.DELETE_ACTION, pks, true);
}