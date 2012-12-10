/*
 * Scope with UI related utility methods
 * 
 * TODO: add method that gets the JSForm for any RuntimeForm instance, also instances created with application.createNewFormInstance()
 */

/**
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return {Object} addedItem
 * @properties={typeid:24,uuid:"42F033EE-939F-4E4B-BFE8-02DF8B31B677"}
 */
function getCheckBoxValueListItemAdded(oldValue,newValue){
	var oldItems = (oldValue) ? oldValue.toString().split('\n') : [];
	var newItems = (newValue) ? newValue.toString().split('\n') : [];
	if(newItems.length <= oldItems.length) return null;
	newItems.sort();
	oldItems.sort();
    for(i in oldItems){
        if(oldItems[i] != newItems[i])
        	return newItems[i];
    }
    return newItems[newItems.length - 1];
}

/**
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return {Object} addedItem
 * @properties={typeid:24,uuid:"F9B3D03A-1738-4B88-B7D8-F925504A7453"}
 */
function getCheckBoxValueListItemRemoved(oldValue,newValue){
	var oldItems = (oldValue) ? oldValue.toString().split('\n') : [];
	var newItems = (newValue) ? newValue.toString().split('\n') : [];
	if(newItems.length >= oldItems.length) return null;
	newItems.sort();
	oldItems.sort();
    for(i in newItems){
        if(newItems[i] != oldItems[i])
        	return oldItems[i];
    }
    return oldItems[oldItems.length - 1];
}

/**
 * @param {JSForm|String} form
 * @properties={typeid:24,uuid:"46688892-4A91-4364-8FBE-E39F4FEAEB64"}
 */
function getJSFormHeight(form) {
	/** @type {JSForm} */
	var smform = typeof form == 'string' ? solutionModel.getForm(form) : form
	var parts = smform.getParts(true)
	return parts.length ? parts.pop().height : 0;
}

/**
 * Sets the visibility of all toolbars at once
 * @param {Boolean} state
 * 
 * @see Also see {@link #plugins#window#setToolBarAreaVisible()}: hides/shows the entire toolbar area
 *
 * @properties={typeid:24,uuid:"52775802-43B7-423D-95CB-6EBE9719EC41"}
 */
function setAllToolbarsVisibility(state) {
	plugins.window.getToolbarNames().forEach(function(value){
		application.setToolbarVisible(value, state);
	})
}

/**
 * @param {RuntimeForm} form
 * 
 * @return {String} Returns the current parent form of a form or null when the form is not showing
 *
 * @properties={typeid:24,uuid:"C7294BCC-5F06-49EB-967A-191B8F604153"}
 */
function getParentFormName(form) {
	var ctx = form.controller.getFormContext()
	return ctx.getMaxRowIndex() > 0 ? ctx.getValue(ctx.getMaxRowIndex() - 1, 2) : null
}

/**
 * Clones a JSForm, but also makes clones for all forms contained in (nested) tabpanels
 * 
 * @see Also see {@link #deepCopyRuntimeForm}: more lightweight, but less ideal when using the SolutionModel on the copied
 * 
 * @param {String} newFormName the name to use for the clone
 * @param {JSForm} original the JSForm to clone
 * @param {String} [prefix] Optional prefix to use for the forms 
 * 
 * @return {JSForm} The clone
 * 
 * @properties={typeid:24,uuid:"1B86199D-6CBF-418A-AB58-4FFAE0B9FDD4"}
 */
function deepCopyJSForm(newFormName, original, prefix) {
	var clone = solutionModel.cloneForm(newFormName, original)
	var tabPanels = clone.getTabPanels()
	var formName;
	for (var i = 0; i < tabPanels.length; i++) {
		var tabs = tabPanels[i].getTabs()
		for (var j = 0; j < tabs.length; j++) {
			formName = prefix ? prefix + tabs[j].containsForm.name.replace(original.name, "") : tabs[j].containsForm.name + application.getUUID();
			tabs[j].containsForm = deepCopyJSForm(formName, tabs[j].containsForm, prefix)
		}
	}
	return clone
}

/**
 * @param newFormName
 * @param original
 * @param prefix
 *
 * @properties={typeid:24,uuid:"407BD3F5-6D07-4E12-98B8-C2CA31322DA5"}
 */
//function deepCopyRuntimeForm(newFormName, original, prefix) {
//	//TODO implement. similar as above, but then use application.createNewFormInstance()
//	//Has less overhead, as the SM doesn't get extended, but troublesome when doing stuff in those copies using the SM
//}

/**
 * @properties={typeid:24,uuid:"C8D4A06A-7D47-44F5-A5FE-BA25D29D3F5B"}
 */
//function globalRecreateUI() {
//	//TODO implement: function to call recreateUI on all instances of a certain form
//}