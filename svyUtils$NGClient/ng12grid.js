/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"3E246B52-7E89-439B-82EF-F640319400FB"}
 */
var PACKAGE_NAME = "12grid";

/**
 * @private
 * @enum
 * @properties={typeid:35,uuid:"4185FB61-3245-42F1-903E-0F8C9FB1D737",variableType:-4}
 */
var TAG_TYPES = {
	DIV: "div"
}

/**
 * @enum
 * @private
 * @properties={typeid:35,uuid:"9158885B-9FED-49EC-8001-A726EDD2C14D",variableType:-4}
 */
var SPEC_NAMES = {
	CONTAINER: "container",
	ROW: "row",
	COLUMN: "column",
	CUSTOM_DIV: "div"
}

/**
 * @public
 * @enum
 * @properties={typeid:35,uuid:"0ED7FB14-F5A7-42C2-B84F-746DA2FAB23E",variableType:-4}
 */
var CONTAINERS = {
	CONTAINER: "container",
	CONTAINER_FLUID: "container-fluid"
}

/**
 * @public
 * @param {JSLayoutContainer|JSForm} layoutContainer
 * @param {Number} index
 * @param {String} [name]
 * @param {String} [containerType] default scopes.ng12grid.CONTAINERS.CONTAINER_FLUID
 *
 * @return {JSLayoutContainer}
 *
 * @example
 * <pre> // create a responsive form
 var jsForm = solutionModel.newForm("responsiveSample", null , true);
 // add a container fluid
 var container = scopes.ng12grid.newContainer(jsForm, 1, "myContainer", scopes.ng12grid.CONTAINERS.CONTAINER_FLUID);
 // add a row
 var row = scopes.ng12grid.newRow(container, 1, "myRow");
 // add column in row
 var column = scopes.ng12grid.newColumn(row, 1, "myColumn1", "col-md-6");
 // add a second column in the row
 var column2 = scopes.ng12grid.newColumn(row, 2, "myColumn2", "col-md-6");</pre>
 *
 * @properties={typeid:24,uuid:"5E9B11A6-DE63-413F-9542-70D7193BFA4D"}
 */
function newContainer(layoutContainer, index, name, containerType) {
	var container = layoutContainer.newLayoutContainer(index);
	container.name = name;
	container.tagType = TAG_TYPES.DIV;
	container.packageName = PACKAGE_NAME;
	container.specName = SPEC_NAMES.CONTAINER;
	container.cssClasses = CONTAINERS.CONTAINER_FLUID;
	return container;
}

/**
 * @public
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} [name]
 * @return {JSLayoutContainer}
 *
 * @example
 * <pre> // create a responsive form
 var jsForm = solutionModel.newForm("responsiveSample", null , true);
 // add a container fluid
 var container = scopes.ng12grid.newContainer(jsForm, 1, "myContainer", scopes.ng12grid.CONTAINERS.CONTAINER_FLUID);
 // add a row
 var row = scopes.ng12grid.newRow(container, 1, "myRow");
 // add column in row
 var column = scopes.ng12grid.newColumn(row, 1, "myColumn1", "col-md-6");
 // add a second column in the row
 var column2 = scopes.ng12grid.newColumn(row, 2, "myColumn2", "col-md-6");</pre>
 *
 * @properties={typeid:24,uuid:"22B81AE3-4A10-4D49-861F-5E6F2BA5D46C"}
 */
function newRow(layoutContainer, index, name) {
	var row = layoutContainer.newLayoutContainer(index);
	row.tagType = TAG_TYPES.DIV;
	row.packageName = PACKAGE_NAME;
	row.specName = SPEC_NAMES.CONTAINER;
	row.cssClasses = "row";
	if (name) row.name = name;
	return row;
}

/**
 * @public
 * @param {JSLayoutContainer} layoutContainer
 * @param {Number} index
 * @param {String} [name]
 * @param {String} [columnClasses] if no valid 12grid column is provided default "col-md-12" is applied.
 *
 * @return {JSLayoutContainer}
 *
 * @example
 * <pre> // create a responsive form
 var jsForm = solutionModel.newForm("responsiveSample", null , true);
 // add a container fluid
 var container = scopes.ng12grid.newContainer(jsForm, 1, "myContainer", scopes.ng12grid.CONTAINERS.CONTAINER_FLUID);
 // add a row
 var row = scopes.ng12grid.newRow(container, 1, "myRow");
 // add column in row
 var column = scopes.ng12grid.newColumn(row, 1, "myColumn1", "col-md-6");
 // add a second column in the row
 var column2 = scopes.ng12grid.newColumn(row, 2, "myColumn2", "col-md-6");</pre>
 *
 * @properties={typeid:24,uuid:"CFE198FA-1A04-4455-95BB-3739DE676052"}
 */
function newColumn(layoutContainer, index, name, columnClasses) {
	var column = layoutContainer.newLayoutContainer(index);
	column.name = name;
	column.tagType = TAG_TYPES.DIV;
	column.packageName = PACKAGE_NAME;
	column.specName = SPEC_NAMES.COLUMN;

	// TODO configurable option
	var defaultClass = "col-md-12";

	// check if has a valid bootstrap column
	if (!columnClasses) { // set default styleClass
		columnClasses = defaultClass;
	} else if (columnClasses && !hasColumnClass(columnClasses)) { // set default styleClass if not provided
		columnClasses = scopes.ngUtils.addStyleClass(columnClasses, defaultClass);
	}
	column.cssClasses = columnClasses;
	return column;
}

/**
 * @param {String} columnClasses
 * @private
 * @properties={typeid:24,uuid:"C44C9773-9994-4C8D-A913-E9A03917B0BB"}
 */
function hasColumnClass(columnClasses) {
	var regex = new RegExp('(^|\\s)\\bcol-(xs|sm|md|lg)-([1-9]|1[0-2])\\b((?=\\s)|$)', 'g');
	return regex.test(columnClasses);
}
