/**
 * Utility method to take off the wrapper on Servoy elements and access the underlying Java component
 * @private
 * @param {RuntimeComponent} element
 *
 * @return {Packages.javax.swing.JComponent}
 *
 * @properties={typeid:24,uuid:"EB054514-911B-477C-B060-FB1BB8C6367F"}
 */
function unwrapElement(element) {
	var list = new Packages.java.util.ArrayList();
	list.add(element)

	/**@type {Packages.javax.swing.JComponent}*/
	var unwrappedElement = list.get(0) 
	return unwrappedElement
}

/**
 * Utility method to get PluginAccess
 * @private
 * @return {Packages.com.servoy.j2db.smart.ISmartClientPluginAccess}
 * @SuppressWarnings(wrongparameters)
 *
 * @properties={typeid:24,uuid:"99ADF5CF-1C4D-4C30-B2E2-CE48138B0E74"}
 */
function getSmartClientPluginAccess() {
	//TODO: make this saver, in case the window plugin is not installed. Either just try the first plugin available or the plugins node itself or some other way and in all else fails, raise warnings
	//Same for the WebClient impl.
	return unwrapElement(plugins.window)['getClientPluginAccess']()
}