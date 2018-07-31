/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1742961E-AAFD-4A43-B10C-507A469A6BEE"}
 */
var broadcastLog = "";

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"53EB0727-8273-49BD-887A-FA27498ABBEB"}
 */
function onShow(firstShow, event) {
	scopes.svyApplicationCore.addDataBroadcastListener(broadcastListener, foundset.getDataSource());
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"EDE5C6C6-AA03-4815-A3A4-9E928A3FD4DB"}
 */
function onHide(event) {
	scopes.svyApplicationCore.removeDataBroadcastListener(broadcastListener, foundset.getDataSource());
	return true
}

/**
 * @param {String} dataSource
 * @param {Number} action
 * @param {JSDataSet} pks
 * @param {Boolean} cached
 * @properties={typeid:24,uuid:"F3507800-6733-4FBD-A5CC-DBBC8021FF39"}
 */
function broadcastListener(dataSource, action, pks, cached) {

	var actionText;
	switch (action) {
	case SQL_ACTION_TYPES.INSERT_ACTION:
		actionText = "insert";
		break;
	case SQL_ACTION_TYPES.DELETE_ACTION:
		actionText = "delete";
		break;
	case SQL_ACTION_TYPES.UPDATE_ACTION:
		actionText = "update";
		break;
	case SQL_ACTION_TYPES.SELECT_ACTION:
		actionText = "select";
		break;
	default:
		actionText = "no Action";
		break;
	}

	var msg = "Broadcast action " + actionText + " received for record " + dataSource + " pks " + pks.getColumnAsArray(1).join(",") + " cached " + cached;

	broadcastLog += msg + "\n";
	
	if (pks) {
		
	}
	

}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"858B6FE3-FFCB-4226-90B4-0E241FA8CE98"}
 */
function onActionPrev(event) {
	//gets the current record index in the current foundset
	var current = foundset.getSelectedIndex();
	//sets the next record in the foundset
	foundset.setSelectedIndex(current-1);

}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @private
 *
 * @properties={typeid:24,uuid:"0F0FFAAB-9D30-499F-86C6-BC0171FDB916"}
 */
function onActionNext(event) {
	//gets the current record index in the current foundset
	var current = foundset.getSelectedIndex();
	//sets the next record in the foundset
	foundset.setSelectedIndex(current+1);
}
