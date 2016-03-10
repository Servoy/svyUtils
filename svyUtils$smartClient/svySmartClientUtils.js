/*
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2013 Servoy BV 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @private
 *
 * @properties={typeid:24,uuid:"38714D53-CA5A-4E36-B1F0-F93EE01EFB61"}
 */
 function checkOperationSupported() {
 	if (!scopes.svySystem.isSwingClient()) {
 		throw new scopes.svyExceptions.UnsupportedOperationException('Only supported in Web Client')
 	}
 }

/**
 * Utility method to take off the wrapper on Servoy elements and access the underlying Java component
 * @private
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 *
 * @return {Packages.javax.swing.JComponent}
 *
 * @properties={typeid:24,uuid:"EB054514-911B-477C-B060-FB1BB8C6367F"}
 */
function unwrapElement(component) {
	/**@type {Packages.javax.swing.JComponent}*/
	var unwrappedElement
	
	var list = new Packages.java.util.ArrayList()
	if (component instanceof RuntimeForm) {
		list.add(0, Packages.com.servoy.j2db.FormController)
		/**@type {Packages.java.lang.Class}*/
		var fc = list.get(0)
		unwrappedElement = fc.getMethod('getFormUI').invoke(component)
	} else {
		list.add(component)
		unwrappedElement = list.get(0) 
	}
	
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
	var x = new Packages.org.mozilla.javascript.NativeJavaObject(globals, plugins.window, new Packages.org.mozilla.javascript.JavaMembers(globals, Packages.com.servoy.extensions.plugins.window.WindowProvider));
	return x['getClientPluginAccess']();
}

/**
 * TODO: deprecate as of Servoy 8, see {@link https://support.servoy.com/browse/SVY-7804}
 * @param {RuntimeComponent} element
 * @return {String}

 * @SuppressWarnings(wrongparameters)
 * @properties={typeid:24,uuid:"E5CD9513-415E-4F78-86CC-8ABD9EE07260"}
 */
function getFormName(element) {
	checkOperationSupported()
	var component = unwrapElement(element)
	
	/** @type {Packages.com.servoy.j2db.IFormUIInternal} */
	var parent = component.getParent()
	while (parent && !(parent instanceof Packages.com.servoy.j2db.IFormUIInternal)) {
		 parent = parent.getParent()
	}
	
	if (parent) {
		return parent.getFormContext().getValue(1,2).toString()
	}
	return null
}

/**
 * Allow runtime updating the height of the body part of a form in RECORD_VIEW<br/> 
 * <br/>
 * This allows to mimic the behavior of the Web Client when placing elements at runtime using element.setLocation() below the bounds of the designtime form<br/> 
 * In the Web Client this will automatically cause scrollbars to appear, but not so in the Smart Client<br/>
 * </br>
 * This method allows the height of the BODY part to be set at Runtime, without having to go through the SolutionModel and having to do a controller.recreateUI()
 * 
 * @param {RuntimeForm} form A form in RECORD_VIEW
 * @param {Number} height 
 *
 * @properties={typeid:24,uuid:"96CEA78A-7153-4BFD-A608-078E3B6CE486"}
 */
function setFormHeight(form, height) {
	checkOperationSupported()
	
	if (!(form instanceof RuntimeForm)) {
		throw scopes.svyExceptions.IllegalArgumentException('form argument is not an instance of RuntimeForm')
	}
	if (form.controller.view !== JSForm.RECORD_VIEW && form.controller.view !== JSForm.LOCKED_RECORD_VIEW) {
		throw scopes.svyExceptions.IllegalArgumentException('form argument is not a form in Record View')		
	}

	/**@type {Packages.com.servoy.j2db.smart.SwingForm}*/
	var unwrappedForm = unwrapElement(form)

	var panel = unwrappedForm.getViewport().getComponents()[0]
	
	var preferredWidth = panel.getPreferredSize().width
	panel.setPreferredSize(new Packages.java.awt.Dimension(preferredWidth, height))
	panel.revalidate()
}

/**
 * Sets the caret color of a TextField or TextArea<br>
 * <br>
 * @param {RuntimeTextField|RuntimeTextArea} element
 * @param {String} [color] A CSS Hex Color value, like #45A38F. When not specified, the fgcolor of the element is used by default.
 *
 * @properties={typeid:24,uuid:"806E5302-B6C7-4F08-8FA5-9075971FD587"}
 */
function setCaretColor(element, color) {
	checkOperationSupported()
	
	/**@type {Packages.javax.swing.JTextField}*/
	var textField = unwrapElement(element)
	textField.setCaretColor(java.awt.Color.decode(color||element.fgcolor))	
}

/**
 * Sets the foreground color of the placeholder text on an element
 * 
 * @param {RuntimeTextField|RuntimeTextArea|RuntimeHtmlArea|RuntimePassword|RuntimeRtfArea} element
 * @param {String} color A hex representation of a color, like #FF0096
 * 
 * @return {boolean} whether the font color was set succesfully
 *
 * @properties={typeid:24,uuid:"ADF4C5CE-349B-4A2D-B2B5-C002E62D4EED"}
 */
function setPlaceholderFontColor(element, color) {
	checkOperationSupported()
	
	/**@type {Packages.javax.swing.JTextComponent}*/
	var el = unwrapElement(element)
	if (el instanceof Packages.javax.swing.JTextComponent) {
		Packages.org.jdesktop.xswingx.PromptSupport.setForeground(java.awt.Color.decode(color), el)
		return true
	}
	return false
}

/**
 * Shows a busy cursor until {@link #releaseGUI()} is called<br>
 * <br>
 * When calling blockGUI multple times, {@link #releaseGUI()} needs to be called an equal number of times before the normal cursor is restored<br>
 * <br>
 * @param {String} [reason] Optional text to display in the statusbar
 *
 * @properties={typeid:24,uuid:"19760794-E5D8-47A2-988B-92744749E035"}
 */
function blockGUI(reason) {
	checkOperationSupported()
	getSmartClientPluginAccess().blockGUI(reason||'')
}

/**
 * See {@link #blockGUI()}
 * @properties={typeid:24,uuid:"56CAC498-BB6F-4F05-8DEE-FF1FC0D81A65"}
 */
function releaseGUI() {
	checkOperationSupported()
	getSmartClientPluginAccess().releaseGUI()
}