
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"A73B289A-C166-426F-8B94-53868E8DDD5D"}
 */
function btnBuildSolutionModel(event) {
	//var formName = "sample"
	//createForm(formName);
	//elements.tabless.addTab(formName);
	test();
}


/**
 * @public 
 * @return {Array}
 * 
 * @properties={typeid:24,uuid:"E8CF2E45-8AA5-4097-8255-BB4547B9B728"}
 */
function getFields() {
	/** @type {Array} */
	var fields = [];

	for (var i = 0; i < 50; i++) {
		addItems(i);
	}

	function addItems(index) {
		fields.push({type: scopes.ngBootstrapcomponents.BTS_COMPONENTS.LABEL, text: "label_" + index});
		fields.push({type: scopes.ngBootstrapcomponents.BTS_COMPONENTS.TYPEAHEAD, text: "field_"+ index, valuelist: 34325378629633 + index});
	}
	
	return fields;
}



/**
 * @param {String} formName
 * 
 * @properties={typeid:24,uuid:"EDC202FC-80EF-4277-A6AE-11213BDF8467"}
 */
function createForm(formName) {
	var jsForm = solutionModel.newForm(formName, null , true);
	var container = scopes.ng12grid.newContainer(jsForm, 1, "container");
	
	var index = 1;
	
	/** @type {scopes.metadata.Item} */
	var item;
	var items = getFields();
	for (var i = 0; i < items.length; i++) {
		item = items[i];
		newItemTemplate(container, index, item);
		index++;
	}	
	
	// servoyDeveloper.save(formName)
	return jsForm;
}


/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {scopes.metadata.Item} item
 *
 * @properties={typeid:24,uuid:"5B7D6FF6-EC71-4769-BF14-407A7BA523DA"}
 */
function newWebComponent(layoutContainer, index, item) {
	var type = item.type;
	var fieldName = "field_" + item.text; 
	switch (type) {
	case scopes.ngBootstrapcomponents.BTS_COMPONENTS.LABEL:
		scopes.ngBootstrapcomponents.newLabel(layoutContainer, index, fieldName, item.text)
		break;
	case scopes.ngBootstrapcomponents.BTS_COMPONENTS.TYPEAHEAD:
		scopes.ngBootstrapcomponents.newTypeahead(layoutContainer, index, fieldName)
		break;
	default:
		break;
	}
}


/**
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {scopes.metadata.Item} item
 *
 * @properties={typeid:24,uuid:"5D5B83E3-CB34-420B-BD28-727BE5F0B8D6"}
 */
function newItemTemplate(layoutContainer, index, item) {
	
	var rowName = "row_" + item.text;
	var row = scopes.ng12grid.newRow(layoutContainer,index, rowName);
	var colName = "column_" + item.text;
	var column = scopes.ng12grid.newColumn(row, 1, colName, "col-md-6");
	newWebComponent(column, 1, item);
	
}

/**
 * @properties={typeid:24,uuid:"D9169374-4876-49D4-954F-0FEF79C6216C"}
 */
function test() {
	// create a responsive form
	var jsForm = solutionModel.newForm("responsiveSample", null , true);
	// add a container fluid
	var container = scopes.ng12grid.newContainer(jsForm, 1, "myContainer", scopes.ng12grid.CONTAINERS.CONTAINER_FLUID);
	// add a row
	var row = scopes.ng12grid.newRow(container, 1, "myRow");
	// add column in row
	var column = scopes.ng12grid.newColumn(row, 1, "myColumn1", "col-md-6");
	// add a second column in the row
	var column2 = scopes.ng12grid.newColumn(row, 2, "myColumn2", "col-md-6");
	
	elements.tabless.addTab("responsiveSample");
}