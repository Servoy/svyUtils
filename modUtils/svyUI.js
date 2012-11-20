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