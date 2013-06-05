/**
 * Utility method to take off the wrapper on Servoy elements and access the underlying Java component
 * @private
 * @param {RuntimeComponent} element
 *
 * @return {Packages.java.swing.Component}
 *
 * @properties={typeid:24,uuid:"EB054514-911B-477C-B060-FB1BB8C6367F"}
 */
function unwrapElement(element) {
	var list = new Packages.java.util.ArrayList();
	list.add(element)

	/**@type {Packages.java.swing.Component}*/
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

/**
 * TODO: write unit test, as this uses non-public API
 * Adding the bin directory of the media library to the classpath, in order to load & instantiate Java classes stored in the media library.
 *
 * Note: also tried using custom URLClassLoaders, but while that works, you end up with a class object of type java.lang.Class (http://comments.gmane.org/gmane.comp.mozilla.devel.jseng.rhino/467)
 * @properties={typeid:24,uuid:"0810F655-72E3-4357-A541-59C402FFF2AA"}
 */
function addMediaBinDirectoryToClassPath() {
	/** @type {Packages.com.servoy.j2db.util.ExtendableURLClassLoader} */
	var cl = getSmartClientPluginAccess().getBeanManager().getClassLoader()
	cl.addURL(new java.net.URL("media:///bin/"))
}