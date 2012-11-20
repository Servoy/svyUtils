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