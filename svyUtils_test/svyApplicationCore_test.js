/**
 * @properties={typeid:24,uuid:"A4AF18FF-AD10-49ED-B07C-523F652083BF"}
 */
function testModuleDefinitions() {
	//Test for not overriding final methods
	//Test for implementing mandatory methods
	
	var mods = scopes.svyUI.getJSFormInstances(solutionModel.getForm('AbstractModuleDef')) 

	for (var i = 0; i < mods.length; i++) {
		mods[i].getMethods(false).indexOf('')
	}
}

/**
 * @properties={typeid:35,uuid:"3F92F44F-EE52-47F4-9F8E-C4A6FB61B990",variableType:-4}
 */
var moduleInitRetval = []

/**
 * TODO add testcases for duplicate ID's, empty ID's and unknown IDs
 * @properties={typeid:24,uuid:"1B0A33F3-CDD0-448B-8C9D-4E469BFBD6BC"}
 */
function testModuleInit() {
	var config = {
		status: "error",
		plugins: 'scopes.svyUnitTestUtils.TestAppender',
		appenders: [{
			type: "scopes.svyUnitTestUtils.TestAppender",
			name: "TestAppender",
			PatternLayout: {
				pattern: "%5level %logger{1.} - %msg"
			}
		}],
		loggers: {
			root: {
				level: "error",
				AppenderRef: {
					ref: "TestAppender"
				}
			}
		}
	}
	scopes.svyLogManager.loadConfig(config)
	if (scopes.svyUnitTestUtils.logMessages.TestAppender) {
		scopes.svyUnitTestUtils.logMessages.TestAppender.length = 0
	}
	
	var namePrefix = 'moduleInitTest'
	var abstractModuleDefJSForm = solutionModel.getForm('AbstractModuleDef')
	

	var jsForm
	/*
	 * Setting up the following dependancies
	 * ModA
	 * 	ModB
	 *  ModC
	 *  	ModD
	 *  		ModA
	 */
	jsForm = solutionModel.newForm(namePrefix + 'A', abstractModuleDefJSForm)
	jsForm.newMethod('function getId(){return "mod.a"}')
	jsForm.newMethod('function getVersion(){return "1.0.0"}')
	jsForm.newMethod('function getDependencies(){return [{id: "mod.b"}]}')
	jsForm.newMethod('function moduleInit(){scopes.svyApplicationCore_test.moduleInitRetval.push("a")}')
	
	jsForm = solutionModel.newForm(namePrefix + 'B', abstractModuleDefJSForm)
	jsForm.newMethod('function getId(){return "mod.b"}')
	jsForm.newMethod('function getVersion(){return "1.0.0"}')
	jsForm.newMethod('function getDependencies(){return [{id: "mod.c"}]}')
	jsForm.newMethod('function moduleInit(){scopes.svyApplicationCore_test.moduleInitRetval.push("b")}')
	
	jsForm = solutionModel.newForm(namePrefix + 'C', abstractModuleDefJSForm)
	jsForm.newMethod('function getId(){return "mod.c"}')
	jsForm.newMethod('function getVersion(){return "1.0.0"}')
	jsForm.newMethod('function getDependencies(){return [{id: "mod.d"}]}')
	jsForm.newMethod('function moduleInit(){scopes.svyApplicationCore_test.moduleInitRetval.push("c")}')
	
	jsForm = solutionModel.newForm(namePrefix + 'D', abstractModuleDefJSForm)
	jsForm.newMethod('function getId(){return "mod.d"}')
	jsForm.newMethod('function getVersion(){return "1.0.0"}')
	jsForm.newMethod('function getDependencies(){return [{id: "mod.a"}]}')
	jsForm.newMethod('function moduleInit(){scopes.svyApplicationCore_test.moduleInitRetval.push("d")}')	
	
	jsForm = solutionModel.newForm(namePrefix + 'E', abstractModuleDefJSForm)
	jsForm.newMethod('function getId(){return "mod.e"}')
	jsForm.newMethod('function getVersion(){return "1.0.0"}')
	jsForm.newMethod('function getDependencies(){return [{id: "mod.d"}]}')
	jsForm.newMethod('function moduleInit(){scopes.svyApplicationCore_test.moduleInitRetval.push("e")}')	

	scopes.svyApplicationCore.initModules()
	
	jsunit.assertEquals('dcbae', moduleInitRetval.join(''))
	jsunit.assertEquals(scopes.svyUnitTestUtils.logMessages.TestAppender.join('\n'), 1, scopes.svyUnitTestUtils.logMessages.TestAppender.length)
}

/*
 * Start testcode for {@link #scopes#svyApplicationCore#addDataBroadcastListener()}
 */
/**
 * Stores a reference to a JSFoundSet on the svy_framework/log table, so the test client received incoming databroadcasts for this table
 * @type {JSFoundSet}
 *
 * @properties={typeid:35,uuid:"184736C9-1B71-4932-80F0-78AED77341A0",variableType:-4}
 */
var emptyFSReferenceForDatabroadcast

/**
 * Method called in HC to fire a dataChange Notification
 * @properties={typeid:24,uuid:"69FE5122-45FD-4DCE-8CB4-9513A38EA08A"}
 */
function fireDataBroadcastNotificication() {
	var pkDS = databaseManager.convertToDataSet([-10])
	plugins.rawSQL.notifyDataChange('svy_framework','log', pkDS, SQL_ACTION_TYPES.UPDATE_ACTION)
}

/**
 * Dummy method needed for HC.queueMethod
 *
 * @properties={typeid:24,uuid:"27FAD5B7-BEED-4595-B56A-03F9DEC960C3"}
 */
function fireDataBroadcastNotificationCallbackHandler() {}

/**
 * @properties={typeid:35,uuid:"31D73FD2-D93E-4945-83BC-935F7820D7A6",variableType:-4}
 */
var fired = false

/**
 * @param {String} dataSource
 * @param {Number} action
 * @param {JSDataSet} pks
 * @param {Boolean} cached
 *
 * @properties={typeid:24,uuid:"F4B57EB1-914A-4EE4-B101-CFF0A8520B54"}
 */
function dataBroadcastEventHandler(dataSource, action, pks, cached) {
	if (dataSource == 'db:/svy_framework/log' &&
		action == SQL_ACTION_TYPES.UPDATE_ACTION &&
		pks.getValue(1,1) == -10) {
		fired = true
	}
}

/**
 * @properties={typeid:24,uuid:"D4C28EFE-B01F-4CD1-A5C3-0396A63AD651"}
 */
function testDataBroadcastListener() {
	// jsunit.assertTrue(fired)
}

/**
 * Callback method for when solution is opened.
 *
 * @properties={typeid:24,uuid:"4EBB37D5-B4FC-4655-8A4F-544BE6E598FD"}
 */
function onSolutionOpen() {
	if (application.getApplicationType() != APPLICATION_TYPES.HEADLESS_CLIENT) { //So code is only executed when it's in the Test Client
		scopes.svyApplicationCore.addDataBroadcastListener(dataBroadcastEventHandler)
		// TODO fix the resource issue. The application core requires a a log table to test the broadcastHandler for the onDataChange
		//emptyFSReferenceForDatabroadcast = databaseManager.getFoundSet('db:/svy_framework/log')
		//emptyFSReferenceForDatabroadcast.clear()
		var client = plugins.headlessclient.createClient(application.getSolutionName(),null,null,null)
		client.queueMethod('scopes.svyApplicationCore_test','fireDataBroadcastNotificication', null, fireDataBroadcastNotificationCallbackHandler)
	}
}

/*
 * End testcode for {@link #scopes#svyApplicationCore#addDataBroadcastListener()}
 */
