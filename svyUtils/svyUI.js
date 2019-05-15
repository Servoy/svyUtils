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

/*
 * Scope with UI related utility methods
 * 
 */

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 * 
 * @properties={typeid:35,uuid:"7C41BEF4-1A96-499B-8851-43A9A9B31E85",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.ui');

/**
 * @deprecated
 * 
 * @public
 * 
 * @param {Object} oldValue
 * @param {Object} newValue
 * 
 * @return {Object} addedItem
 * 
 * @properties={typeid:24,uuid:"54636DFE-0DEE-42B9-BF37-47F3C2649876"}
 */
function getCheckBoxValueListItemAdded(oldValue, newValue){
	var oldItems = (oldValue) ? oldValue.toString().split('\n') : [];
	var newItems = (newValue) ? newValue.toString().split('\n') : [];
	if (newItems.length <= oldItems.length) {
		return null;
	}
	
	newItems.sort();
	oldItems.sort();
    for (var i in oldItems) {
        if (oldItems[i] != newItems[i]) {
        	return newItems[i];
        }
    }
    
    return newItems[newItems.length - 1];
}

/**
 * @deprecated
 * 
 * @public
 * 
 * @param {Object} oldValue
 * @param {Object} newValue
 * 
 * @return {Object} addedItem
 * 
 * @properties={typeid:24,uuid:"51C03A03-A22A-489A-B5E0-024D88BD52BE"}
 */
function getCheckBoxValueListItemRemoved(oldValue, newValue){
	var oldItems = (oldValue) ? oldValue.toString().split('\n') : [];
	var newItems = (newValue) ? newValue.toString().split('\n') : [];
	if (newItems.length >= oldItems.length) {
		return null;
	}
	
	newItems.sort();
	oldItems.sort();
    for (var i in newItems) {
        if (newItems[i] != oldItems[i]) {
        	return oldItems[i];
        }
    }
    
    return oldItems[oldItems.length - 1];
}

/**
 * Gets the JSForm for any type of form 'reference' (formName String, RuntimeForm or JSform (the latter for convenience)), regardless how the form was created
 * Solves the scenario of not being able to get the JSForm representation of forms created using {@link #application#createNewForminstance(...)}
 * This method should be deprecated and removed after https://support.servoy.com/browse/SVY-3642 gets implemented
 * 
 * @public
 * 
 * @param {JSForm|RuntimeForm|String} form 
 *
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"D683B1F6-4BD7-42A7-A9BD-E47E1EE7BAB4"}
 */
function getJSFormForReference(form) {
	if (form instanceof JSForm) {
		/** @type {JSForm} */
		var jsForm = form;
		return jsForm;
	}
	
	/** @type {String} */
	var formName;
	if (form instanceof RuntimeForm) {
		formName = form.controller.getName();
	} else if (form instanceof String) {
		formName = form;
	}
	var retval = solutionModel.getForm(formName);
	if (retval !== null) { //really null, not undefined
		return retval;
	}

	if (!(formName in forms)) { //It's not a loaded form, so the value of 'form' must be wrong
		throw new scopes.svyExceptions.IllegalArgumentException('The value provided for the "form" parameter is not a valid Form identifier: ' + form);
	}
	//It must be a form created with application.createNewFormInstance
	var list = new Packages.java.util.ArrayList();
	list.add(Packages.com.servoy.j2db.FormController);
	formName = list.get(0)['getMethod']('getForm').invoke(forms[form]).getName();
	return solutionModel.getForm(formName);
}

/**
 * Returns the JSForm hierarchy for the given form, from it's utmost base form up to and including the specified form itself
 * 
 * @public
 * 
 * @param {JSForm|RuntimeForm|String} form
 * 
 * @return {Array<JSForm>} super forms first, given form included as last entry in the returned Array)
 *
 * @properties={typeid:24,uuid:"4E77988E-55A6-45FD-8D96-1DD5BAACFEEE"}
 */
function getJSFormHierarchy(form) {
	var curForm = getJSFormForReference(form);
	/** @type {Array<JSForm>} */
	var retval = [curForm];
	while ((curForm = curForm.extendsForm)) {
		retval.push(curForm);
	}
	
	return retval.reverse();
}

/**
 * 
 * Returns true if the form is extending the parent form
 * 
 * @public
 * 
 * @param {RuntimeForm|JSForm|String} form
 * @param {RuntimeForm|JSForm|String} parentForm
 * 
 * @return {Boolean}
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 *
 * @properties={typeid:24,uuid:"ABCE89C0-9151-4CD7-AF58-38D0913BD738"}
 */
function isJSFormInstanceOf(form, parentForm) {
	// TODO: cleanup, use utility functions, extend to also take RuntimeForm (just to be complete)
	
	form = getJSFormForReference(form);
	parentForm = getJSFormForReference(parentForm);
	
	if (!form) {
		throw new scopes.svyExceptions.IllegalArgumentException('Provide valid form');
	}
	if (!parentForm) {
		throw new scopes.svyExceptions.IllegalArgumentException('Provide valid parentForm');
	}
	
	//Go up the hierarchy until the parentForm is found or until there is no more parent.
	while (form && form != parentForm) {
		form = form.extendsForm;
	}
	
	return form == parentForm;
}

/**
 * Returns all JSForms that are instances of a certain JSForm
 * 
 * @public
 *
 * @param {JSForm|RuntimeForm|String} superForm
 *
 * @return {Array<JSForm>}
 *
 * @properties={typeid:24,uuid:"38527628-D0D4-4EEE-9EF0-87D65AAEF013"}
 */
function getJSFormInstances(superForm) {
	superForm = getJSFormForReference(superForm);
	
	/** @type {Array<JSForm>} */
	var retval = [];
	var smForms = solutionModel.getForms(); //Getting this once and holding a reference to it is faster
	var smForm, instances;
	for (var i = 0; i < smForms.length; i++) {
		smForm = smForms[i];
		instances = [];
		if (retval.indexOf(smForm) != -1) {
			continue;
		}
		
		while (smForm.extendsForm != null) {
			instances.push(smForm);
			
			if (smForm.extendsForm == superForm || retval.indexOf(smForm.extendsForm) != -1) {
				retval = retval.concat(instances);
				break;
			}
			smForm = smForm.extendsForm;
		}
	}
	
	return retval;
}

/**
 * @public
 * 
 * @param {RuntimeForm|String} superForm
 * 
 * @return {Array<RuntimeForm>}
 * 
 * @properties={typeid:24,uuid:"D1414A95-D82D-467B-84E2-77A9028C6674"}
 */
function getRuntimeFormInstances(superForm){
	var runtimeInstances = [];
	var instances = getJSFormInstances(superForm);
	for(var i in instances ){
		var formName = instances[i].name;
		var form = forms[formName];
		if (form) {
			runtimeInstances.push(form);
		} else {
			log.warn('Unexpected untime form not found by getRuntimeFormInstances: ' + formName);
		}
	}
	
	return runtimeInstances;
}

/**
 * Returns all components of the given form that have the given designtime property (set with the optional value)
 * 
 * @public
 * 
 * @param {JSForm|RuntimeForm|String} form - the form to analyze
 * @param {String} propertyName - the name of the designtime property to filter for
 * @param {Object} [propertyValue] - the value of the designtime property to filter for (if not given, the matching property is returned regardless its value)
 * @param {Boolean} [includeInherited] Whether or not to include inherited elements. Default: true
 * 
 * @return {Array<JSComponent>}
 *
 * @properties={typeid:24,uuid:"0312A093-0703-4832-8332-FA7FE7FB4C1B"}
 */
function getElementsByDesigntimeProperty(form, propertyName, propertyValue, includeInherited) {
	try {
		var jsForm = getJSFormForReference(form);
	} catch (e) {
		return [];
	}
	
	/**
	 * @param {JSComponent} element
	 */
	function filterComponents(element) {
		if ((propertyValue === null || propertyValue === undefined) && element.getDesignTimePropertyNames().indexOf(propertyName) >= 0) {
			return true;
		}
		var dtp = element.getDesignTimeProperty(propertyName);
		if (!dtp) return false; // What about values that evaluate to false?
		return dtp == propertyValue;
	}
	
	var components = jsForm.getComponents(includeInherited === false ? false : true);
	return components.filter(filterComponents);
}

/**
 * Returns the JSLabel that acts as a labelFor label for the given element on the given form>br>
 * <br>
 * This method uses the solutionModel to find the labelFor element, because at runtime labelFor<br>
 * elements no longer exist in table views
 * 
 * @public
 * 
 * @param {JSForm|RuntimeForm|String} form the form on which the element is located
 * @param {JSComponent|RuntimeComponent|String} element the element to get the labelFor label for
 * 
 * @return {Array<JSLabel>} labelFor elements
 *
 * @properties={typeid:24,uuid:"6D69CB0F-0EC9-49BB-9FDE-FA69DCC8A1C7"}
 */
function getLabelForElements(form, element) {
	/** @type {JSForm} */
	try {
		var jsForm = getJSFormForReference(form);
	} catch (e) {
		throw e;
	}
	
	/** @type {String} */
	var elementName;
	if (element instanceof String) {
		/** @type {String} */
		var elementNameStr = element;
		elementName = elementNameStr;
	} else if (element instanceof RuntimeComponent) {
		/** @type {RuntimeComponent} */
		var runtimeComp = element;
		elementName = runtimeComp.getName();
	} else if (element instanceof JSComponent) {
		elementName = element.name;
	} else {
		throw new scopes.svyExceptions.IllegalArgumentException('Wrong parameter provided for "getLabelForElementName"');
	}
	var mainComponent = jsForm.getComponent(elementName);
	var allLabels = jsForm.getLabels(true);
	
	var labelForElements = [];
	for (var i = 0; i < allLabels.length; i++) {
		if (allLabels[i].labelFor == mainComponent.name) {
			labelForElements.push(allLabels[i]);
		}
	}
	
	return labelForElements;
}

/**
 * Determines the JSForm for given input and returns the names of all RuntimeForm instances based on the JSForm
 * 
 * @public
 * 
 * @param {RuntimeForm|JSForm|String} form
 *
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"05F00D04-160F-4489-A24F-395D122C0586"}
 */
function getRuntimeFormInstanceNames(form) {
	var retval = [];
	var jsForm = getJSFormForReference(form);
	
	for (var i = 0; i < forms.length; i++) {
		var f = getJSFormForReference(forms[i]);
		var parents = getJSFormHierarchy(f);
		if (parents.indexOf(jsForm) != -1) {
			retval.push(forms[i].controller.getName());
		}
	}
	
	return retval;
}

/**
 * Calculates the designtime height of a form. By default the Form parts that are only used when showing the form in Print mode are excluded<br>
 * <br>
 * NOTE: the returned height currently does NOT include the top and bottom border width if the form has a border
 * 
 * @public
 * 
 * @param {JSForm|String} form
 * @param {Boolean} [includePrintParts] whether or not to also take into account form parts that are only visible in print mode (default false)
 * 
 * @return {Number} height in pixels, excluding the forms top/bottom border
 * 
 * @properties={typeid:24,uuid:"4EC9D579-FAD3-4C56-8F34-2891379AF31E"}
 */
function getJSFormHeight(form, includePrintParts) {
	var printParts = [JSPart['LEADING_SUBSUMMARY'], JSPart['TRAILING_SUBSUMMARY'], JSPart['TITLE_FOOTER']];
	
	var smform = getJSFormForReference(form);
	var parts = smform.getParts(true);
	var height = parts.length ? parts[parts.length-1].height : 0;
	
	if (!includePrintParts) {
		for (var i = 0; i < parts.length; i++) {
			if (printParts.indexOf(parts[i].getPartType()) != -1) {
				height -= parts[i].height - parts[i].getPartYOffset();
			}
		}
	}
	
	return height;
}

/**
 * Gets the row height of a table view at runtime
 * 
 * @public
 * 
 * @param {JSForm|RuntimeForm|String} form identifier of or reference to a form in TableView view
 *
 * @properties={typeid:24,uuid:"53065728-B0C1-449C-91A4-D79B2271723A"}
 */
function getRuntimeTableViewRowHeight(form) {
	var jsForm = getJSFormForReference(form)
	if (jsForm.view !== JSForm.LOCKED_TABLE_VIEW) {
		throw new scopes.svyExceptions.IllegalArgumentException('Must be called with a form in TableView view');
	}
	
	var body = jsForm.getPart(JSPart.BODY);
	var start = body.getPartYOffset();
	var end = body.height;
	
	var rowHeight = 0;
	var jsElements = jsForm.getComponents(true);
	for (var i = 0; i < jsElements.length; i++) {
		if (jsElements[i].y < start || jsElements[i].y > end) {
			continue;
		}
		if (jsElements[i] instanceof JSLabel) {
			/** @type {JSLabel} */
			var label = jsElements[i];
			if (label.labelFor != null) { //TODO: needs further check to see if the labelFor property is set to a actually existing element
				continue;
			}
		}
		rowHeight = Math.max(rowHeight, jsElements[i].height);
	}
	
	return rowHeight;
}

/**
 * Sets the visibility of all toolbars at once<br>
 * <br>
 * NOTE: This is Smart Client compatible only
 * 
 * @public
 * 
 * @param {Boolean} state
 * 
 * @see Also see {@link #plugins#window#setToolBarAreaVisible()}: hides/shows the entire toolbar area
 *
 * @properties={typeid:24,uuid:"BF888281-F9E0-4907-89FD-ECAAA037C4CB"}
 */
function setAllToolbarsVisibility(state) {
	if (application.getApplicationType() === APPLICATION_TYPES.SMART_CLIENT) {
		/** @type {Function} */
		var setToolbarVisFunction = application['setToolbarVisible'];
		plugins.window.getToolbarNames().forEach(function(value){
			setToolbarVisFunction.apply(this, [value, state]);
		});
	}
}

/**
 * Returns the current parent form of a form or null when the form is not showing
 * 
 * @public
 * 
 * @param {RuntimeForm} form
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"13529874-DBDA-4655-B6CB-8DAF94DC6CDE"}
 */
function getParentFormName(form) {
	var ctx = form.controller.getFormContext();
	return ctx.getMaxRowIndex() > 0 ? ctx.getValue(ctx.getMaxRowIndex() - 1, 2) : null;
}

/**
 * Returns the closest parent form instance of the given form instance
 * 
 * @public
 * 
 * @param {RuntimeForm} form
 * @param {RuntimeForm|JSForm|String} formInstance
 * 
 * @return {String}
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 * 
 *
 * @properties={typeid:24,uuid:"1A8601AE-D72E-4916-B55D-2550D5757DFD"}
 */
function getParentFormNameInstanceOf(form, formInstance) {
	var ctx = form.controller.getFormContext();
	
	for (var i = ctx.getMaxRowIndex() - 1; i > 0; i--) {
		var parentFormName = ctx.getValue(i, 2);
		if (isJSFormInstanceOf(parentFormName, formInstance)) {
			return parentFormName;
		}
	}
	
	return ctx.getMaxRowIndex() > 0 ? ctx.getValue(ctx.getMaxRowIndex() - 1, 2) : null;
}

/**
 * Clones a JSForm, including all forms contained in (nested) tabpanels (at designtime)
 * 
 * @public
 * 
 * @see Also see {@link #deepCopyRuntimeForm}: more lightweight, but less ideal when using the SolutionModel on the copied
 * 
 * @param {String} newFormName the name to use for the clone
 * @param {JSForm} original the JSForm to clone
 * @param {String} [prefix] Optional prefix to use for the forms 
 * 
 * @return {JSForm} The clone
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 * 
 * @properties={typeid:24,uuid:"0B4DE5CF-0B58-44F2-B344-3E3B656E549D"}
 */
function deepCopyJSForm(newFormName, original, prefix) {
	if (solutionModel.getForm(newFormName)) {
		throw new scopes.svyExceptions.IllegalArgumentException('Value provided for the newFormName parameter is already in use by an existing form: ' + newFormName);
	}
	
	var clone = solutionModel.cloneForm(newFormName, original);
	var tabPanels = clone.getTabPanels();
	var formName;
	for (var i = 0; i < tabPanels.length; i++) {
		var tabs = tabPanels[i].getTabs();
		for (var j = 0; j < tabs.length; j++) {
			formName = prefix ? prefix + tabs[j].containsForm.name.replace(original.name, "") : tabs[j].containsForm.name + application.getUUID();
			tabs[j].containsForm = deepCopyJSForm(formName, tabs[j].containsForm, prefix);
		}
	}
	
	return clone;
}

/**
 * @deprecated To be moved to another new Servoy extension
 * 
 * Convenient method to set multiple properties of a SplitPane in one go
 * 
 * @public
 * 
 * @param {String} formName
 * @param {String} elementName
 * @param {Number} resizeWeight
 * @param {Number} dividerLocation
 * @param {Number} dividerSize
 * @param {Boolean} continuousLayout
 * @param {String} [bgColor] If omitted, the SplitPane will be made transparent
 * @param {Number} [leftFormMinSize] Minimum size of the left/top form
 * @param {Number} [rightFormMinSize] Minimum size of the right/bottom form
 * 
 * @SuppressWarnings(deprecated)
 * 
 * @properties={typeid:24,uuid:"B94825F2-EB16-49FD-BEBB-AA9A10EF65C1"}
 */
function initSplitPane(formName, elementName, resizeWeight, dividerLocation, dividerSize, continuousLayout, bgColor, leftFormMinSize, rightFormMinSize) {
	/** @type {RuntimeSplitPane} */
	var splitPane = forms[formName].elements[elementName];

	if (!(splitPane instanceof RuntimeSplitPane)) {
		return;
	}

	if (resizeWeight instanceof Number) {
		splitPane.resizeWeight = resizeWeight;
	}
	if (dividerLocation instanceof Number) {
		restoreSplitPaneDividerPosition(formName, elementName, dividerLocation);
	}
	if (dividerSize instanceof Number) {
		splitPane.dividerSize = dividerSize;
	}
	if (continuousLayout) {
		splitPane.continuousLayout = continuousLayout;
	}
	
	if (bgColor && bgColor != 'transparent') {
		splitPane.transparent = false;
		splitPane.bgcolor = bgColor;
	} else {
		splitPane.transparent = true;
	}
	if (leftFormMinSize instanceof Number) {
		splitPane.leftFormMinSize = leftFormMinSize
	}
	if (rightFormMinSize instanceof Number) {
		splitPane.rightFormMinSize = rightFormMinSize;
	}
}

/**
 * @deprecated To be moved to another new Servoy extension
 * 
 * @public
 * 
 * Persists the position of the splitpane divider to be used by {@link #restoreSplitPaneDividerPosition()} in a next user session
 * 
 * @param {String} formName
 * @param {String} elementName
 * 
 * @SuppressWarnings(deprecated)
 *
 * @properties={typeid:24,uuid:"F335B47A-2FFC-4A39-BE4F-19B31C5108B6"}
 */
function persistSplitPaneDividerPosition(formName, elementName) {
	if (!formName || !elementName) {
		log.error('persistSplitPaneDividerPosition called without mandatory params');
		return;
	}
	var pos = forms[formName].elements[elementName].dividerLocation;
	application.setUserProperty(application.getSolutionName() + '.' + formName + '.' + elementName + '.divLoc', pos)
}

/**
 * @deprecated To be moved to another new Servoy extension
 * 
 * Restores the position of the splitpane divider persisted by {@link #persistSplitPaneDividerPosition()} between user sessions
 * 
 * @public
 * 
 * @param {String} formName
 * @param {String} elementName
 * @param {Number} position
 * 
 * @SuppressWarnings(deprecated)
 *
 * @properties={typeid:24,uuid:"04FC34AA-629F-43BC-9C1E-6A7ED9735DA8"}
 */
function restoreSplitPaneDividerPosition(formName, elementName, position) {
	if (!formName || !elementName) {
		log.error('restoreSplitPaneDividerPosition called without mandatory params');
		return;
	}
	/** @type {String} */
	var pos = application.getUserProperty(application.getSolutionName() + '.' + formName + '.' + elementName + '.divLoc');
	pos = utils.stringToNumber(pos);
	forms[formName].elements[elementName]['dividerLocation'] = pos ? pos : position;
}

/**
 * Return forms (1-level depth) which are contained in the specified form
 * 
 * @public
 * 
 * @param {RuntimeForm} form
 * 
 * @return {Array<RuntimeForm>}
 * 
 * @properties={typeid:24,uuid:"855AF950-2627-42DB-BCD5-AC49F3233840"}
 */
function getContainedForms(form){
	var containerElements = getContainerElements(form);
	var containedForms = [];
	for (var c = 0; c < containerElements.length; c++) {
		for (var t = 1; t <= containerElements[c].getMaxTabIndex(); t++) {
			var containedForm = forms[containerElements[c].getTabFormNameAt(t)];
			containedForms.push(containedForm);
			var furtherContainedForms = getContainedForms(containedForm);
			if (furtherContainedForms.length > 0) {
				containedForms = containedForms.concat(furtherContainedForms);
			}
		}
	}
	return containedForms;
}

/**
 * @public
 * 
 * @param {RuntimeForm} form
 * 
 * @return {Array<RuntimeTabPanel|RuntimeSplitPane|RuntimeAccordionPanel>}
 * 
 * @properties={typeid:24,uuid:"6457D6B0-0AEF-4C2B-B791-D13244DC132A"}
 */
function getContainerElements(form) {
	/** @type {Array<RuntimeComponent>} */
	var elem = [];
	for (var e = 0; e < form.elements.length; e++) {
		elem.push(form.elements[e]);
	}
	function filterElements(el) {
		return el instanceof RuntimeTabPanel || el instanceof RuntimeSplitPane || el instanceof RuntimeAccordionPanel
	}
	/** @type {Array<RuntimeTabPanel|RuntimeSplitPane|RuntimeAccordionPanel>} */
	var result = elem.filter(filterElements);
	return result;
}

/**
 * @since 2019-01-05
 * TODO add description
 * @public 
 * @param {String} formName
 * @param {String} elementName
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"99483402-227E-483A-8FBE-5370ECE3FB6F"}
 */
function getFormComponentRelationName(formName, elementName) {

	var relationName = null;
	var startIndex = 0;
	var fcIndex = -1;
	
	// search for nested list form component
	do {
		fcIndex = elementName.indexOf("$containedForm$", startIndex);

		if (fcIndex > -1) {
			// TODO should i make this configurable !?
			// should i search for nested list component too !?!?
			var fcName = elementName.substring(startIndex, fcIndex);
			var jsForm = solutionModel.getForm(formName);
			var jsFormComponent = jsForm.findWebComponent(fcName);
			if (jsFormComponent) {
				var jsFoundset = jsFormComponent.getJSONProperty("foundset");
				if (jsFoundset && jsFoundset.foundsetSelector) {
					// TODO search nested form component with nested foundsets. e.g. 2 list nested on each other with their own foundset selection
					relationName = jsFoundset.foundsetSelector;
					return relationName;
				} else {
					var jsContainedForm = jsFormComponent.getJSONProperty("containedForm");
					if (jsContainedForm && jsContainedForm.name) {
						formName = jsContainedForm.name;
					}
				}
			}
		}
		
		startIndex = fcIndex + 15;
	} while (fcIndex > -1);

	return relationName;
}

/**
 * @public 
 * @param {String} formName
 * @param {String} elementName
 * 
 * @return {RuntimeElementSource}
 *
 * @properties={typeid:24,uuid:"7D45880D-D161-4136-A31B-15B58208A0F3"}
 */
function getRuntimeElementSource(formName, elementName) {
	return new RuntimeElementSource(formName,elementName);
}

/**
 * @since 2019-01-05
 * @constructor 
 * @protected 
 * @param {String} formName
 * @param {String} elementName
 *
 * @properties={typeid:24,uuid:"7D1C586E-E8EE-45AE-893C-01A078F68B67"}
 */
function RuntimeElementSource(formName, elementName) {
	/** @protected   */
	this.formName = formName;
	
	/** @protected   */
	this.elementName = elementName;
	
	// TODO should throw a warning if no elementName !?
}

/**
 * @since 2019-01-05
 * @constructor
 * @private 
 * @properties={typeid:24,uuid:"76C229C0-5569-4D03-BDB0-243AB6CC01F1"}
 */
function setupRuntimeElementSource() {

	RuntimeElementSource.prototype = Object.create(Object.prototype);
	RuntimeElementSource.prototype.constructor = RuntimeElementSource;
	
	/** 
	 * @public 
	 * @return {String}
	 * */
	RuntimeElementSource.prototype.getFormName = function () {
		return this.formName;
	}
	
	/** 
	 * @public 
	 * @return {String}
	 * */
	RuntimeElementSource.prototype.getElementName = function () {
		return this.elementName;
	}
	
	/** 
	 * @public 
	 * @return {String}
	 * */
	RuntimeElementSource.prototype.getRelationName = function () {
		var form = forms[this.formName];
		var name = this.elementName;
		
		if (name && form) {
			/** @type {RuntimeTextField} */
			var component = form.elements[name];
			if (component.getDataProviderID) {
				var dataProvider = component.getDataProviderID();
				
				// TODO should i really look into special components such as listcomponent etc.. !?
				var fcRelationName = scopes.svyUI.getFormComponentRelationName(form.controller.getName() ,name);
				if (fcRelationName) {
					dataProvider = fcRelationName + "." + dataProvider;
				}
				
				return scopes.svyDataUtils.getDataProviderRelationName(dataProvider)
			} else { //	TODO custom components that have data change ?

			}
			
		} else { // TODO un-named components not supported ?

		}
		return null;
	}
	
	
	/** 
	 * @public 
	 * @return {String}
	 * */
	RuntimeElementSource.prototype.getUnrelatedDataProviderID = function () {
		var form = forms[this.formName];
		var name = this.elementName;
		
		if (name && form) {
			/** @type {RuntimeTextField} */
			var component = form.elements[name];
			if (component.getDataProviderID) {
				var dataProvider = component.getDataProviderID();
				return scopes.svyDataUtils.getUnrelatedDataProviderID(dataProvider);
			}
		}
		return null;
	}
	
	/** 
	 * @public
	 * @return {JSRecord}
	 * */
	RuntimeElementSource.prototype.getRecord = function () {
		var form = forms[this.formName];
		var elementName = this.elementName;
		
	    /** @type {JSFoundSet} */
	    var fs;
		var relationName = this.getRelationName(form, elementName);
		if (relationName) {
			/** @type {JSFoundSet} */
			fs = form.foundset[relationName];
		} else {
			fs = form.foundset;
		}
				
	    if (fs) {
	        return fs.getSelectedRecord();
	    }
	    return null;
	}
}

/**
 * Initializes the module.
 * NOTE: This var must remain at the BOTTOM of the file.
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"C46DF3A7-19AE-40C2-B9E7-853679258556",variableType:-4}
 */
var init = (function() {
	setupRuntimeElementSource();
}());