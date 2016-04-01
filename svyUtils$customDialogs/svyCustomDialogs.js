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
 * @type {scopes.svyLogManager.Logger}
 * @private 
 * @properties={typeid:35,uuid:"60E1A6F2-6450-40A1-93BA-2B48477A5517",variableType:-4}
 */
var logger = scopes.svyLogManager.getLogger("com.servoy.bap.customdialogs");

/**
 * The button orientation
 * @enum 
 * @properties={typeid:35,uuid:"59FE4D9A-8BD5-4330-B3F9-C1EFF7D9E0D8",variableType:-4}
 */
var BUTTON_ORIENTATION = {
	RIGHT: 4,
	BOTTOM: 3
}

/**
 * Alignment properties for the buttons
 * @enum 
 * @properties={typeid:35,uuid:"055E2C22-8284-4FCB-A876-2A7FC3B78219",variableType:-4}
 */
var LAYOUT_ALIGNMENT = {
	CENTER: 1,
	LEFT: 0,
	RIGHT: 2
}

/**
 * Enum used to control the onClose behaviour of a dialog when the user closes the dialog via the close box
 * @enum 
 * @properties={typeid:35,uuid:"8DEF2F80-FE90-435A-A179-A45FB5F54180",variableType:-4}
 */
var ON_CLOSE = {
	CLOSE: 2,
	IGNORE: 0
}

/**
 * Enum of default icons
 * @enum
 * @properties={typeid:35,uuid:"14F54688-BC2A-4650-88A8-86DCD4814C53",variableType:-4}
 */
var DEFAULT_ICON = {
	INFO: "media:///svyCustomDialogs/info.png",
	WARNING: "media:///svyCustomDialogs/warning.png",
	ERROR: "media:///svyCustomDialogs/error.png"
}
	
/**
 * @private 
 * @properties={typeid:35,uuid:"0884BCC2-48E9-4B22-8747-FE2098DBA343",variableType:-4}
 */
var terminator = (application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT ? new Continuation() : null);

/**
 * @private
 * 
 * @type {Array<String>}
 *
 * @properties={typeid:35,uuid:"407A0348-1735-47A4-B977-E8F7E566A1C6",variableType:-4}
 */
var formStack = [];

/**
 * Method to terminate the current method execution after capturing a Continuation.
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"9F2C9A6A-218C-4E90-975B-848D40D6E84A"}
 */
function terminateCurrentMethodExecution() {
	terminator();
}

/**
 * A CustomDialog
 * 
 * @constructor 
 * 
 * @param {String} styleName
 * @param {String} [dialogTitle]
 * @param {String} [dialogMessage]
 * @param {String|byte[]|plugins.file.JSFile} [dialogIcon]
 * @param {Array<Button>} [dialogButtons]
 * @param {Array<DialogComponent>} [dialogComponents]
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"8E4F261E-0EF9-4DBA-A6B1-858BB49F8AE8"}
 */
function CustomDialog(styleName, dialogTitle, dialogMessage, dialogIcon, dialogButtons, dialogComponents) {
	
	/**
	 * The name of the form
	 * 
	 * @type {String}
	 */
	this.formName = "svyCustomDialog_" + application.getUUID().toString().replace(/-/g, "_");
	
	/**
	 * The JSForm
	 *  
	 * @type {JSForm} 
	 */
	this.jsForm = null;
	
	/**
	 * Gets / Sets the alignment of the buttons. Possible values are the LAYOUT_ALIGNMENT enum constants (e.g. scopes.DialogPro.LAYOUT_ALIGNMENT.RIGHT)
	 * 
	 * @type {Number}
	 */
	this.buttonAlignment = LAYOUT_ALIGNMENT.CENTER;
	
	/**
	 * The button clicked
	 * 
	 * @type {Button}
	 */
	this.buttonClicked = null;
	
	/**
	 * The text of the button clicked
	 * 
	 * @type {String}
	 */
	this.buttonClickedText = null;	
	
	/**
	 * Gets / Sets the spacing in pixel between the dialog's content and the buttons
	 * 
	 * @type {Number}
	 */
	this.buttonOffset = 10;
	
	/**
	 * Gets / Sets the spacing in pixel between the dialog's buttons
	 * 
	 * @type {Number}
	 */
	this.buttonSpacing = 10;
	
	/**
	 * Places the buttons either on the bottom (BUTTON_ORIENTATION.BOTTOM) or on the right side (BUTTON_ORIENTATION.RIGHT) of the dialog
	 * 
	 * @type {Number}
	 */
	this.buttonOrientation = BUTTON_ORIENTATION.BOTTOM;
	
	/**
	 * Gets / Sets an array of all buttons added to the dialog
	 * 
	 * @type {Array<Button>}
	 */
	this.buttons = dialogButtons || [];
	
	/**
	 * Gets / Sets the horizontal spacing between the labels and the fields of the dialog. The default is 10.
	 * 
	 * @type {Number}
	 */
	this.columnSpacing = 10;
	
	/**
	 * Gets / Sets an array of all components added to the dialog
	 * 
	 * @type {Array<DialogComponent>}
	 */
	this.components = dialogComponents || [];
	
	/**
	 * The default height of components
	 * 
	 * @type {Number}
	 */
	this.defaultFieldHeight = 25;
	
	/**
	 * The default width of components
	 * 
	 * @type {Number} 
	 */
	this.defaultFieldWidth = 80;
	
	/**
	 * Sets the header part of the dialog to the given component. The header spans the whole dialog and is shown above the first component or the icon. Usually, this area is set to an HtmlArea.
	 * 
	 * @type {DialogComponent} 
	 */
	this.header = null;
	
	/**
	 * The dialog's icon
	 * 
	 * @type {JSMedia}
	 */
	this.iconMedia = dialogIcon ? getIconFromArgs(dialogIcon) : null;
	
	/**
	 * The insets of the dialog's content in pixels. Default is 10 pixel.
	 * 
	 * @type {{top: Number, right: Number, bottom: Number, left: Number}}
	 */
	this.insets = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10
	}
	
	/**
	 * Sets the behavior when the user clicks on the close box to either "CLOSE" or "IGNORE" (see Constants). In the case of "IGNORE" the dialog will not be closed.
	 * 
	 * @type {Number}
	 */
	this.onClose = ON_CLOSE.CLOSE;
	
	/**
	 * Gets / Sets the resizable property of the dialog (defaults to true)
	 * 
	 * @type {Boolean}
	 */
	this.resizable = true;
	
	/**
	 * Gets / Sets the vertical spacing between the components of the dialog. Defaults to 5 pixel.
	 * 
	 * @type {Number}
	 */
	this.rowSpacing = 5;
	
	/**
	 * The style to use
	 * 
	 * @type {String}
	 */
	this.styleName = styleName ? styleName : null;
	
	/**
	 * Gets / Sets the title of the dialog (defaults to the solution name)
	 * 
	 * @type {String}
	 */
	this.title = dialogTitle ? dialogTitle : application.getSolutionName();

	/**
	 * The message of the dialog
	 * 
	 * @type {String}
	 */
	this.message = dialogMessage;
	
	/**
	 * An object that can be used to store any kind of data
	 * 
	 * @type {Object}
	 */
	this.customProperties = null;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"D81DB060-EBE1-49A6-8812-A59E25CF6821",variableType:-4}
 */
var init_CustomDialog = (function() {
	CustomDialog.prototype = Object.create(CustomDialog.prototype);
	CustomDialog.prototype.constructor = CustomDialog;
	
	Object.defineProperty(CustomDialog.prototype, 'buttonClickedText', {
		get: function() {
			if (this.buttonClicked) {
				return this.buttonClicked.text;
			} else {
				return null;
			}
		}
	});

	/**
	 * Adds a button to this dialog
	 * 
	 * @param {String} text
	 * @param {Function} [onActionMethod]
	 * @param {Object} [onActionMethodArgs] optional arguments for the onAction method
	 * @param {String|byte[]|plugins.file.JSFile} [icon]
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addButton = function(text, onActionMethod, onActionMethodArgs, icon) {
		var b = createButton(text, onActionMethod, onActionMethodArgs, icon);
		this.buttons.push(b);
		return b;
	}
	
	/**
	 * Adds a component to this dialog
	 * 
	 * @param {DialogComponent} component
	 * @return {CustomDialog}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addComponent = function(component) {
		this.components.push(component);
		return this;
	}
	
	/**
	 * Adds a custom property to this dialog
	 * 
	 * @param {String} key
	 * @param {Object} value
	 * @return {CustomDialog}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addCustomProperty = function(key, value) {
		if (this.customProperties == null) {
			this.customProperties = {};
		}
		this.customProperties[key] = value;
		return this;
	}
	
	/**
	 * Returns the custom property with the given key
	 * 
	 * @param {String} key
	 * @return {Object}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.getCustomPropertyValue = function(key) {
		if (this.customProperties == null) {
			return null;
		}
		return this.customProperties[key];
	}
	
	/**
	 * Returns the custom properties as an Object<key, value>
	 * 
	 * @return {Object}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.getCustomProperties = function() {
		return this.customProperties;
	}	
	
	/**
	 * Adds a label to this dialog
	 * 
	 * @param {String} text
	 * @return {Label}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addLabel = function(text) {
		var l = createLabel(text);
		this.addComponent(l);
		return l;
	}
	
	/**
	 * Adds a message to this dialog
	 * 
	 * A message is a Label that spans the whole dialog
	 * 
	 * @param {String} text
	 * @return {Label}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addMessage = function(text) {
		var l = createMessage(text);
		this.addComponent(l);
		return l;
	}
	
	/**
	 * Adds a label to this dialog
	 * 
	 * @return {Separator}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addSeparator = function() {
		var s = createSeparator();
		this.addComponent(s);
		return s;
	}	
	
	/**
	 * Adds a text field to this dialog
	 * 
	 * @param {String} [label]
	 * @param {Object} [initialValue]
	 * @param {Number} [dataType]
	 * @return {TextField}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addTextField = function(label, initialValue, dataType) {
		var tf = createTextField(label, initialValue, dataType);
		this.addComponent(tf);
		return tf;
	}
	
	/**
	 * Adds a text field to this dialog
	 * 
	 * @param {String} [label]
	 * @param {Object} [initialValue]
	 * @return {PasswordField}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addPasswordField = function(label, initialValue) {
		var pf = createPasswordField(label, initialValue);
		this.addComponent(pf);
		return pf;
	}	
	
	/**
	 * Adds a message to this dialog
	 * 
	 * A message is a Label that spans the whole dialog
	 * 
	 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
	 * @param {Array<String>|JSDataSet} [values] values for a custom value list as either display/real values arrays or a JSDataSet containing both
	 * @param {Array} [realValues] return values for a custom value list if <code>values</code> is an array and not a JSDataSet
	 * @return {RadioButtonGroup}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addRadioButtonGroup = function(label, values, realValues) {
		var r = createRadioButtonGroup(label, values, realValues);
		this.addComponent(r);
		return r;
	}	
	
	/**
	 * Adds a text field to this dialog
	 * 
	 * @param {String} [label]
	 * @param {Date} [initialValue]
	 * @return {Calendar}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addCalendar = function(label, initialValue) {
		var c = createCalendar(label, initialValue);
		this.addComponent(c);
		return c;
	}	
	
	/**
	 * Adds a TextArea to this dialog
	 * 
	 * @param {String} label
	 * @param {String} initialValue
	 * @return {TextArea}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addTextArea = function(label, initialValue) {
		var ta = new TextArea();
		ta.label = label;
		ta.initialValue = initialValue;
		this.addComponent(ta);
		return ta;
	}	
	
	/**
	 * @param {String} text
	 * @param {String} [label]
	 * @param {Boolean} [isChecked]
	 * @return {Checkbox}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addCheckbox = function(text, label, isChecked) {
		var cb = createCheckbox(text, label, isChecked)
		this.addComponent(cb);
		return cb;
	}
	
	/**
	 * Adds a Combobox to this dialog
	 * 
	 * @param {String} [label]
	 * @param {Array<String>|JSDataSet} [values]
	 * @param {Array} [realValues]
	 * @param {Object} [initialValue]
	 * @return {Combobox}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.addCombobox = function(label, values, realValues, initialValue) {
		var cb = createCombobox(label, values, realValues);
		if (initialValue) {
			cb.setInitialValue(initialValue);
		}
		this.addComponent(cb);
		return cb;
	} 
	
	/**
	 * Returns the component with the given name
	 * @param {String} componentName
	 * @return {DialogComponent}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.getComponent = function(componentName) {
		for (var i = 0; i < this.components.length; i++) {
			if (this.components[i].name == componentName) {
				return this.components[i];
			}
		}
		return null;
	}
	
	/**
	 * Returns the runtimeForm of the dialog once the form has been built, null other wise
	 * 
	 * @return {RuntimeForm}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.getRuntimeForm = function() {
		if (this.formName in forms) {
			return forms[this.formName];
		} else {
			return null;
		}
	}
	
	/**
	 * Returns true once the form has been built
	 * 
	 * @return {Boolean}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.isFormBuilt = function() {
		return (this.formName in forms);
	}
	
	/**
	 * Sets the icon used for this dialog
	 * 
	 * @param {String|byte[]|plugins.file.JSFile} iconArgs
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.setIcon = function(iconArgs) { 
		this.iconMedia = getIconFromArgs(iconArgs);
	}
	
	/**
	 * Builds the form and shows it in a dialog
	 * 
	 * @param {Number} [x] optional x coordinate
	 * @param {Number} [y] optional y coordinate
	 * @param {Number} [width] optional width
	 * @param {Number} [height] optional height
	 * @param {Number} [windowType] optional windowType as one of the JSWindow constants, defaults to modal dialog
	 * 
	 * @return {CustomDialog} returns this CustomDialog
	 *
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.showDialog = function(x,y,width,height,windowType) {
		buildDialogForm(this);
		if (windowType == null) windowType = JSWindow.MODAL_DIALOG;
		var window = application.createWindow(this.jsForm.name, windowType);
		if (x == null) x = -1;
		if (y == null) y = -1;
		if (width == null) width = -1;
		if (height == null) height = -1;
		window.setInitialBounds(x, y, width, height);
		window.title = this.title;
		window.resizable = this.resizable;
		if (application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT) {
			forms[this.jsForm.name]["continuation"] = new Continuation();
			window.show(this.jsForm.name);
			/** @type {CustomDialog} */
			var cont = terminateCurrentMethodExecution();
			return cont;
		} else {
			window.show(this.jsForm.name);
			return this;
		}
	}
	
	/**
	 * Closes this dialog and destroys its window
	 * 
	 * @return {CustomDialog} returns this CustomDialog
	 * 
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.closeDialog = function() {
		var window = application.getWindow(this.jsForm.name);
		if (window) {
			window.destroy();
		}
		return this;
	}
	
	/**
	 * Creates and returns the form built
	 * 
	 * @return {JSForm}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.createForm = function() {
		buildDialogForm(this);
		return this.jsForm;
	}	
	
	/**
	 * Returns the result of the dialog as an Array of the components' values
	 * 
	 * @return {Array}
	 * @this {CustomDialog}
	 */
	CustomDialog.prototype.getResult = function() {
		var result = [];
		for (var i = 0; i < this.components.length; i++) {
			var comp = this.components[i];
			if (comp instanceof Label || comp instanceof Separator) continue;
			result.push(comp.value);
		}
		return result;
	}
}());

/**
 * @constructor
 * 
 * @private
 * 
 * @properties={typeid:24,uuid:"870B6340-74AC-485C-A67B-5FC95B0C961D"}
 */
function DialogComponent() {
	
	/**
	 * The ID of this instance
	 * The value of the component is stored in a form variable of the same name
	 * 
	 * @type {String}
	 */
	this.instanceId = application.getUUID().toString().replace(/-/g, "_");
	
	/**
	 * The JSComponent
	 *  
	 * @type {JSComponent} 
	 * @protected 
	 */
	this.component = null;
	
	/**
	 * A reference to the CustomDialog this component has been added to
	 * This is only filled once the form has been built
	 * 
	 * @type {CustomDialog}
	 * @protected 
	 */
	this.customDialog = null;
	
	/**
	 * The anchors of this component as any of the SM_ANCHOR constants
	 * 
	 * @type {Number}
	 */
	this.anchors = null;
	
	/**
	 * The data type of the component as any of the JSVariable constants
	 * 
	 * @type {Number}
	 */
	this.dataType = JSVariable.TEXT;
	
	/**
	 * The enabled state of the component, default true<p>
	 * 
	 * This property is also supported at runtime (once the form is already been built)
	 * 
	 * @type {Boolean}
	 */
	this.enabled = null;
	var _enabled = true;
	
	Object.defineProperty(this, "enabled", {
		set: function(x) {
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				/** @type {RuntimeForm} */
				var form = this.customDialog.getRuntimeForm();
				/** @type {RuntimeTextField} */
				var runtimeTextField = form.elements[this.name];
				runtimeTextField.enabled = x;
			}
			_enabled = x;
		},
		get: function() {
			return _enabled;
		}
	});		
	
	/** 
	 * The label component for this component
	 * 
	 * @type {JSLabel} 
	 * @protected 
	 */
	this.labelComponent = null;
	
	/**
	 * The height in pixels of the component
	 * 
	 * @type {Number}
	 */
	this.height = 0;
	
	/**
	 * The label text of this component
	 * 
	 * @type {String}
	 */
	this.label = null;
	var _label = null;
	
	Object.defineProperty(this, "label", {
		get: function() {
			return _label;
		},
		set: function(x) {
			if (x && x.indexOf("\n") != -1) {
				x = "<html>" + x.replace(/\n/g, "<br>") + "<html>";
			}
			_label = resolveText(x);
		}
	});	
	
	/**
	 * The vertical alignment of the label text as any of the SM_ALIGNMENT constants
	 * 
	 * @type {Number}
	 */
	this.labelAlignment = SM_ALIGNMENT.CENTER;
	
	/**
	 * The name of the component. Through this name it can also accessed in methods
	 * 
	 * @type {String}
	 */
	this.name = null;
	
	/**
	 * Custom style class for this component
	 * 
	 * @type {String}
	 */
	this.styleClass = null;
	
	/**
	 * The width in pixels of the component
	 * 
	 * @type {Number}
	 */
	this.width = 0;
	
	/**
	 * The initial value of this component
	 * 
	 * @type {Object}
	 */
	this.initialValue = null;
	var _initialValue = null;
	
	Object.defineProperty(this, "initialValue", {
		get: function() {
			return _initialValue;
		},
		set: function(x) {
			if (x instanceof String) {
				x = resolveText(x);
			}
			_initialValue = x;
			_value = x;
		}
	});	
	
	/**
	 * The value of the component<p>
	 * 
	 * This property is also supported at runtime (once the form is already been built)
	 * 
	 * @type {Object}
	 */
	this.value = null;
	var _value;
	
	Object.defineProperty(this, "value", {
		get: function() {
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				_value = forms[this.customDialog.jsForm.name][this.instanceId];
			}
			return _value;
		},
		set: function(x) {
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				forms[this.customDialog.jsForm.name][this.instanceId] = x;
			}
			_value = x;
		}
	});
	
	/**
	 * The visible property of the component<p>
	 * 
	 * This property is also supported at runtime (once the form is already been built)
	 * 
	 * @type {Boolean}
	 */
	this.visible = null;
	var _visible = true;
	
	Object.defineProperty(this, "visible", {
		set: function(x) {
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				/** @type {RuntimeForm} */
				var form = this.customDialog.getRuntimeForm();
				/** @type {RuntimeTextField} */
				var runtimeTextField = form.elements[this.name];
				runtimeTextField.visible = x;
			}
			_visible = x;
		},
		get: function() {
			return _visible;
		}
	});	
}


/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"228E7C87-874F-464C-A6CE-D8BFA04FFD85",variableType:-4}
 */
var init_DialogComponent = (function() {
	DialogComponent.prototype = Object.create(DialogComponent.prototype);
	DialogComponent.prototype.constructor = Checkbox;
	
	/**
	 * @param {CustomDialog} customDialog
	 * @param {Number} lastY
	 * @param {Number} maxLabelWidth
	 * @return {Number} x
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.addComponentToForm = function(customDialog, lastY, maxLabelWidth) { 
		var jsForm = customDialog.jsForm;
		this.customDialog = customDialog;
		var jsVar = jsForm.newVariable(this.instanceId, this.dataType);
		if (!this.name) {
			this.name = "fld_" + jsVar.name;
		}
		var height = this.height ? this.height : customDialog.defaultFieldHeight;
		if (this.label != null) {
			this.component = this.createComponent(customDialog, jsVar.name, customDialog.insets.left + maxLabelWidth + customDialog.columnSpacing, lastY, this.width ? this.width : customDialog.defaultFieldWidth, height);
			this.labelComponent = jsForm.newLabel(this.label, customDialog.insets.left, lastY, maxLabelWidth, this.component.height);
			this.labelComponent.transparent = true;
			this.labelComponent.verticalAlignment = this.labelAlignment;
			this.labelComponent.labelFor = this.name;
		} else {
			this.component = this.createComponent(customDialog, jsVar.name, customDialog.insets.left, lastY, (this.width ? this.width : customDialog.defaultFieldWidth) + maxLabelWidth + customDialog.columnSpacing, height);
		}
		this.component.name = this.name;
		this.component.enabled = this.enabled;
		this.component.visible = this.visible;
		this.component.anchors = this.anchors ? this.anchors : SM_ANCHOR.EAST | SM_ANCHOR.NORTH | SM_ANCHOR.WEST;
		this.setAdditionalComponentProperties(this.component);
		if (this.styleClass) this.component.styleClass = this.getStyleClass();
		return (lastY + this.component.height);
	}
	
	/**
	 * Override this method to create the right component according to its type
	 * 
	 * @param {CustomDialog} customDialog
	 * @param {String} dataprovider
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @return {JSComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.createComponent = function(customDialog, dataprovider, x, y, width, height) {
		return customDialog.jsForm.newTextField(dataprovider, x, y, width, height);
	}
	
	/**
	 * Returns the value of this component
	 * 
	 * @return {Object}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.getValue = function() {
		return this.value;
	}
	
	/**
	 * Can be overriden by any subclass to add extra properties needed by the specific component
	 * @param {JSComponent} dialogComponent
	 */
	DialogComponent.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		
	}
	
	/**
	 * Method that returns the style class for each component e.g. "label"
	 * @return {String} styleClass
	 */
	DialogComponent.prototype.getStyleClass = function() { 
		throw new scopes.svyExceptions.AbstractMethodInvocationException("The method getStyleClass needs to be overriden by each component subclass");
	}
	
	/**
	 * Sets the anchors of this component as any of the SM_ANCHOR constants
	 * 
	 * @param {Number} anchors
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setAnchors = function(anchors) {
		this.anchors = anchors;
		return this;
	}	
	
	/**
	 * Sets the dataType of this component as any of the JSVariable constants
	 * 
	 * @param {Number} dataType
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setDataType = function(dataType) {
		this.dataType = dataType;
		return this;
	}
	
	/**
	 * Sets the displayType of this component as any of the JSField constants
	 * 
	 * @param {Number} displayType
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setDisplayType = function(displayType) {
		this.displayType = displayType;
		return this;
	}	
	
	/**
	 * Sets the enabled property of this component
	 * 
	 * @param {Boolean} enabled
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
		return this;
	}	
	
	/**
	 * Sets the height of this component
	 * 
	 * @param {Number} height
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setHeight = function(height) {
		this.height = height;
		return this;
	}	
	
	/**
	 * Sets the label text for this component
	 * 
	 * @param {String} labelText
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setLabel = function(labelText) {
		this.label = labelText;
		return this;
	}		
	
	/**
	 * Sets the vertical text alignment of the label as any of the SM_ALIGNMENT constants
	 * 
	 * @param {Number} alignment
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setLabelAlignment = function(alignment) {
		this.labelAlignment = alignment;
		return this;
	}			
	
	/**
	 * Sets the name of this component
	 * 
	 * @param {String} name
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setName = function(name) {
		this.name = name;
		return this;
	}				
	
	/**
	 * Sets the style class of this component
	 * 
	 * @param {String} styleClass
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setStyleClass = function(styleClass) {
		this.styleClass = styleClass;
		return this;
	}
	
	/**
	 * Sets the visible property of this component
	 * 
	 * @param {Boolean} visible
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setVisible = function(visible) {
		this.visible = visible;
		return this;
	}		
	
	/**
	 * Sets the (maximum) width of this component
	 * 
	 * @param {Number} width
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setWidth = function(width) {
		this.width = width;
		return this;
	}	
	
	/**
	 * Sets the initial value of this component
	 * 
	 * @param {Object} initialValue
	 * @return {DialogComponent}
	 * @this {DialogComponent}
	 */
	DialogComponent.prototype.setInitialValue = function(initialValue) {
		this.initialValue = initialValue;
		return this;
	}	
	
}());

/**
 * @constructor
 * 
 * @extends {Label}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"4DEAF625-2B4E-41D5-822B-0D200FDC333B"}
 */
function Button() {
	Label.apply(this, arguments);
	
	/**
	 * When true, the button will close the dialog
	 * 
	 * @type {Boolean}
	 */
	this.closeDialogOnMethodCall = true;
	
	/**
	 * @type {JSMedia}
	 */
	this.imageMedia = null;
	
	/**
	 * When set, the element will show the clicked state when selected. Applies to labels and buttons and images only.
	 * 
	 * @type {Boolean}
	 */
	this.showClick = true;
	
	/**
	 * When set the text of an element will showfocus when selected. Applies to labels and buttons only. 
	 * The text property for the element MUST be filled in first. NOTE: The TAB key may also be used to 
	 * select the element, depending on the operating system being used and the selected LAF.
	 * 
	 * @type {Boolean}
	 */
	this.showFocus = true;
	
	/**
	 * Method to be performed on action; the method receives a JSEvent, the CustomDialog and the optional methodArguments as arguments
	 * @type {String}
	 */
	this.onActionMethod = null;
	var _onActionMethod = null;
	
	Object.defineProperty(this, "onActionMethod", {
		get: function() {
			return _onActionMethod;
		},
		set: function(x) {
			_onActionMethod = scopes.svySystem.convertServoyMethodToQualifiedName(x);
		}
	});	
	
	/**
	 * Optional arguments for the onActionMethod
	 * @type {Array}
	 */
	this.onActionMethodArgs = null;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"CC2027E6-3775-4D87-A773-482685BAB4C8",variableType:-4}
 */
var init_Button = (function() {
	Button.prototype = Object.create(Label.prototype);
	Button.prototype.constructor = Button;

	/**
	 * @return {String} styleClass
	 * @override 
	 * @this {TextField}
	 */
	Button.prototype.getStyleClass = function() { 
		return "button" + (this.styleClass ? "." + this.styleClass : "");
	}
	
	/**
	 * Sets the icon of this button
	 * 
	 * @param {String|byte[]|plugins.file.JSFile} iconArgs
	 * @return {Button}
	 * @this {Button}
	 */
	Button.prototype.setIcon = function(iconArgs) { 
		this.imageMedia = getIconFromArgs(iconArgs);
		return this;
	}	
	
	/**
	 * Sets the showClick property of this button
	 * 
	 * @param {Boolean} showClick
	 * @return {Button}
	 * @this {Button}
	 */
	Button.prototype.setShowClick = function(showClick) { 
		this.showClick = showClick;
		return this;
	}	
	
	/**
	 * Sets the showFocus property of this button
	 * 
	 * @param {Boolean} showFocus
	 * @return {Button}
	 * @this {Button}
	 */
	Button.prototype.setShowFocus = function(showFocus) { 
		this.showFocus = showFocus;
		return this;
	}	
	
	/**
	 * Sets the onActionMethod of this button; the method receives a JSEvent, the CustomDialog and the optional methodArguments as arguments
	 * 
	 * @param {Function} onActionMethod
	 * @return {Button}
	 * @this {Button}
	 */
	Button.prototype.setOnActionMethod = function(onActionMethod) { 
		this.onActionMethod = onActionMethod;
		return this;
	}		
	
	/**
	 * Sets the extra arguments for the onActionMethod
	 * 
	 * @param {Array} onActionMethodArgs
	 * @return {Button}
	 * @this {Button}
	 */
	Button.prototype.setOnActionMethodArguments = function(onActionMethodArgs) { 
		this.onActionMethodArgs = onActionMethodArgs;
		return this;
	}	
	
	
}());

/**
 * @constructor
 * 
 * @extends {DialogComponent}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"4E4B23AE-A118-461F-BD53-DD3C51F258FD"}
 */
function Label() {
	DialogComponent.apply(this, arguments);
	
	/**
	 * The label's text<p>
	 * 
	 * This property is also supported at runtime (once the form is already been built)
	 * 
	 * @type {String}
	 */
	this.text = null;
	var _text = null;
	
	Object.defineProperty(this, "text", {
		get: function() {
			return _text;
		},
		set: function(x) {
			if (x && x.indexOf("\n") != -1) {
				x = "<html>" + x.replace(/\n/g, "<br>") + "<html>";
			}
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				/** @type {RuntimeForm} */
				var form = this.customDialog.getRuntimeForm();
				/** @type {RuntimeLabel} */
				var runtimeLabel = form.elements[this.name];
				runtimeLabel.text = x;
			}
			_text = resolveText(x);
		}
	});
	
	/**
	 * The label's vertical text alignment as any of the SM_ALIGNMENT constants
	 * 
	 * @type {Number}
	 */
	this.verticalAlignment = null;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"07FDBC5B-68E1-419C-902C-A5454A687643",variableType:-4}
 */
var init_Label = (function() {
	Label.prototype = Object.create(DialogComponent.prototype);
	Label.prototype.constructor = Label;
	
	/**
	 * @param {JSLabel} dialogComponent
	 * @override 
	 * @this {Label}
	 */
	Label.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		dialogComponent.text = this.text;
		dialogComponent.transparent = true;
		if (!this.label && this.verticalAlignment == null) {
			dialogComponent.verticalAlignment = SM_ALIGNMENT.TOP;
		} else if (this.verticalAlignment != null) {
			dialogComponent.verticalAlignment = this.verticalAlignment;
		}
	}
	
	/**
	 * @param {CustomDialog} customDialog
	 * @param {String} dataprovider
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @return {JSComponent}
	 * @override
	 */
	Label.prototype.createComponent = function(customDialog, dataprovider, x, y, width, height) {
		return customDialog.jsForm.newLabel(dataprovider, x, y, width, height);
	}	
	
	/**
	 * @return {String} styleClass
	 * @this {Label}
	 */
	Label.prototype.getStyleClass = function() { 
		return "label" + (this.styleClass ? "." + this.styleClass : "");
	}
	
	Object.defineProperty(Label.prototype, "label", {
		//make sure the label of the label is always null to make it span over the whole dialog
		set: function(x) {
		},
		get: function() {
			return null;
		}
	});
	
}());


/**
 * @constructor
 * 
 * @extends {Label}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"7CB3D409-0346-4D72-B268-A98A5E7E9BD8"}
 */
function Separator() {
	Label.apply(this, arguments);
	
	/**
	 * The Separator's border used to draw the separator line
	 * 
	 * @type {String}
	 */
	this.border = solutionModel.createMatteBorder(0,0,1,0,"#efefef");
	
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"EDEBB787-649B-4678-87A9-EBB53FE3B37D",variableType:-4}
 */
var init_Separator = (function() {
	Separator.prototype = Object.create(Label.prototype);
	Separator.prototype.constructor = Separator;
	
	/**
	 * @param {JSLabel} dialogComponent
	 * @this {Separator}
	 * @override 
	 */
	Separator.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		dialogComponent.text = null;
		dialogComponent.transparent = true;
		dialogComponent.borderType = this.border;
		dialogComponent.y = dialogComponent.y - dialogComponent.height / 2;
	}
	
	/**
	 * @param {CustomDialog} customDialog
	 * @param {String} dataprovider
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @return {JSComponent}
	 * @override
	 */
	Separator.prototype.createComponent = function(customDialog, dataprovider, x, y, width, height) {
		return customDialog.jsForm.newLabel(dataprovider, x, y, width, height);
	}	
	
	/**
	 * @return {String} styleClass
	 * @this {Label}
	 */
	Separator.prototype.getStyleClass = function() { 
		return "label" + (this.styleClass ? "." + this.styleClass : "");
	}
	
	Object.defineProperty(Separator.prototype, "label", {
		//make sure the label of the label is always null to make it span over the whole dialog
		set: function(x) {
		},
		get: function() {
			return null;
		}
	})
}());

/**
 * @constructor
 * 
 * @extends {DialogComponent}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"4FDB0C76-0D60-4C17-87E6-9E99D57BF1E2"}
 */
function TextField() {
	DialogComponent.apply(this, arguments);
	
	/**
	 * The display type of the component
	 * 
	 * @type {Number}
	 */
	this.displayType = JSField.TEXT_FIELD;	
	
	/**
	 * Whether the field is editable or not<p>
	 * 
	 * This property is also supported at runtime (once the form is already been built)
	 * 
	 * @type {Boolean}
	 */
	this.editable = true;	
	var _editable = true;
	
	Object.defineProperty(this, "editable", {
		set: function(x) {
			if (this.customDialog && this.customDialog.isFormBuilt()) {
				/** @type {RuntimeForm} */
				var form = this.customDialog.getRuntimeForm();
				/** @type {RuntimeTextField} */
				var runtimeTextField = form.elements[this.name];
				runtimeTextField.editable = x;
			}
			_editable = x;
		},
		get: function() {
			return _editable;
		}
	});
	
	/**
	 * The field's format
	 * 
	 * @type {String}
	 */
	this.format = null;
	
	/**
	 * The horizontal alignment
	 * 
	 * @type {Number}
	 */
	this.horizontalAlignment = null;
	
	/**
	 * The onDataChangeMethod for this component
	 * 
	 * @type {String}
	 */
	this.onDataChangeMethod = null;
	var _onDataChangeMethod = null;
	
	Object.defineProperty(this, "onDataChangeMethod", {
		get: function() {
			return _onDataChangeMethod;
		},
		set: function(x) {
			_onDataChangeMethod = scopes.svySystem.convertServoyMethodToQualifiedName(x);
		}
	});	
	
	/**
	 * The component's titleText
	 * 
	 * @type {String}
	 */
	this.titleText = null;	
	var _titleText = null;
	
	Object.defineProperty(this, "titleText", {
		get: function() {
			return _titleText;
		},
		set: function(x) {
			_titleText = resolveText(x);
		}
	});	
	
	/**
	 * The name of the value list to be used (if no custom values are provided)
	 * 
	 * @type {String}
	 */
	this.valueListName = null;
	
	/**
	 * Values for a custom value list
	 * 
	 * @type {String}
	 */
	this.valueListValues = "";
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"14D0E66A-C3A3-4722-B751-54001F2C23F0",variableType:-4}
 */
var init_TextField = (function() {
	TextField.prototype = Object.create(DialogComponent.prototype);
	TextField.prototype.constructor = TextField;
	
	/**
	 * Can be overriden by any subclass to add extra properties needed by the specific component
	 * @param {JSField} dialogComponent
	 * @this {TextField}
	 */
	TextField.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		
	}
	
	/**
	 * @param {CustomDialog} customDialog
	 * @param {String} dataprovider
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @return {JSComponent}
	 * @this {TextField}
	 * @override 
	 */
	TextField.prototype.createComponent = function(customDialog, dataprovider, x, y, width, height) {
		var textField = customDialog.jsForm.newTextField(dataprovider, x, y, width, height);
		textField.displayType = this.displayType;
		if (this.titleText) {
			textField.titleText = this.titleText;
		}
		if (this.format) {
			textField.format = this.format;
		}
		if (this.horizontalAlignment != null) {
			textField.horizontalAlignment = this.horizontalAlignment;
		}		
		if (this.editable) {
			textField.editable = true;
		} else {
			textField.editable = false;
		}
		
		//value list?
		if (this.valueListName) {
			textField.valuelist = solutionModel.getValueList(this.valueListName);
		} else if (this.valueListValues.length > 0) {
			var jsValueList = solutionModel.newValueList("svyCustomDialog_valuelist_" + this.instanceId, JSValueList.CUSTOM_VALUES);
			jsValueList.customValues = this.valueListValues
			textField.valuelist = jsValueList;
			//make sure a component with value list shows all values
			if (this.valueListValues.length > 0 && [JSField.CHECKS, JSField.LISTBOX, JSField.MULTISELECT_LISTBOX, JSField.RADIOS].indexOf(this.displayType) != -1) {
				if ([JSField.LISTBOX, JSField.MULTISELECT_LISTBOX].indexOf(this.displayType) != -1) {
					//list boxes don't need to be that high; 15pixels per row is an estimate...
					textField.height = 15 * this.valueListValues.split("\n").length + 5;
				} else {
					textField.height = textField.height * this.valueListValues.split("\n").length;
				}
				this.labelAlignment = SM_ALIGNMENT.TOP;
			} else if (!(this instanceof Checkbox)) {
				//when not a checkbox, do not allow empty values; if wanted, developers can add an empty entry in their value list data
				jsValueList.addEmptyValue = JSValueList.EMPTY_VALUE_NEVER;
			}
		}
		
		//onDataChange method?
		if (this.onDataChangeMethod) {
			var jsOnDataChangeMethod = customDialog.jsForm.newMethod("function onDataChange_" + this.instanceId + "(oldValue, newValue, event) { return scopes.svySystem.callMethod('" + this.onDataChangeMethod + "', [oldValue, newValue, event, customDialog, customDialog.getComponent(event.getElementName())]) }");
			textField.onDataChange = jsOnDataChangeMethod;
		}
		return textField;
	}	
	
	/**
	 * @return {String} styleClass
	 * @this {TextField}
	 */
	TextField.prototype.getStyleClass = function() { 
		return "field" + (this.styleClass ? "." + this.styleClass : "");
	}

	/**
	 * Sets the onDataChange method for this component<p>
	 * The onDataChange method receives the CustomDialog and the DialogComponent object as last parameters
	 * 
	 * @param {Function} onDataChangeMethod
	 * @this {TextField}
	 * @return {TextField}
	 */
	TextField.prototype.setOnDataChangeMethod = function(onDataChangeMethod) {
		this.onDataChangeMethod = onDataChangeMethod;
		return this;
	}	
	
	/**
	 * Sets the given items as value list values from either the given dataset or display/real values arrays
	 * 
	 * @param {Array<String>|JSDataSet} values
	 * @param {Array<Object>} [realValues]
	 * @return {TextField}
	 * @this {TextField}
	 */
	TextField.prototype.setValueListItems = function(values, realValues) { 
		var customValues = [];
		if (values instanceof JSDataSet) {
			/** @type {JSDataSet} */
			var ds = values;
			for (var i = 1; i <= ds.getMaxRowIndex(); i++) {
				var row = ds.getRowAsArray(i);
				if (row.length == 1) {
					customValues.push(row[0]);
				} else {
					customValues.push(row[0] + "|" + row[1]);
				}
			}
		} else {
			var hasRealValues = realValues && realValues.length == values.length;
			for (var v = 0; v < values.length; v++) {
				if (hasRealValues) {
					customValues.push(values[v] + "|" + realValues[v]);
					if (realValues[v] instanceof Number) {
						this.dataType = JSVariable.INTEGER;
					}
				} else {
					customValues.push(values[v]);
				}
			}
		}
		this.valueListValues = customValues.join("\n");
		this.dataType = JSVariable.TEXT;
		return this;
	}
	
	/**
	 * Sets the editable property of this component
	 * 
	 * @param {Boolean} editable
	 * @return {TextField}
	 * @this {TextField}
	 */
	TextField.prototype.setEditable = function(editable) {
		this.editable = editable;
		return this;
	}
	
	/**
	 * Sets the format of this component
	 * 
	 * @param {String} format
	 * @return {TextField}
	 * @this {TextField}
	 */
	TextField.prototype.setFormat = function(format) {
		this.format = format;
		return this;
	}
	
	/**
	 * Sets the horizontal alignment of this component
	 * 
	 * @param {Number} alignment
	 * @return {TextField}
	 * @this {TextField}
	 */
	TextField.prototype.setHorizontalAlignment = function(alignment) {
		this.horizontalAlignment = alignment;
		return this;
	}	
	
	/**
	 * Sets the value list of this component
	 * 
	 * @param {String} valueListName
	 * @return {TextField}
	 * @this {TextField}
	 */
	TextField.prototype.setValueListName = function(valueListName) {
		this.valueListName = valueListName;
		return this;
	}		
	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"6B222BF2-A51C-4B90-A716-1B1399F70F54"}
 */
function Checkbox() {
	TextField.apply(this, arguments);
	
	/**
	 * The data type of the component as any of the JSVariable constants
	 * 
	 * @type {Number}
	 */
	this.dataType = JSVariable.NUMBER;	
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"27EC2FB4-9C8F-470C-8FDE-98A3FF242B66",variableType:-4}
 */
var init_Checkbox = (function() {
	Checkbox.prototype = Object.create(TextField.prototype);
	Checkbox.prototype.constructor = Checkbox;
	
	/**
	 * @return {String} styleClass
	 * @this {TextField}
	 */
	Checkbox.prototype.getStyleClass = function() { 
		return "check" + (this.styleClass ? "." + this.styleClass : "");
	}	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"B39118A3-8D6B-4E30-AC65-A4C762803583"}
 */
function Calendar() {
	TextField.apply(this, arguments);
	
	/**
	 * The data type of the calendar is always DATETIME and cannot be changed
	 */
	this.dataType = JSVariable.DATETIME;
	
	/**
	 * The display type of the calendar is always CALENDAR and cannot be changed
	 */
	this.displayType = JSField.CALENDAR;
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"3CAD4297-95A8-47C0-B2F9-540C1238A118",variableType:-4}
 */
var init_Calendar = (function() {
	Calendar.prototype = Object.create(TextField.prototype);
	Calendar.prototype.constructor = Calendar;
	
	//datatype cannot be changed
	Object.defineProperty(Calendar.prototype, "dataType", {
		get: function() {
			return JSVariable.DATETIME;
		},
		set: function(x) {
			
		}
	})
	
	//displayType cannot be changed
	Object.defineProperty(Calendar.prototype, "displayType", {
		get: function() {
			return JSField.CALENDAR;
		},
		set: function(x) {
			
		}
	})
	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"E4800501-526E-40F3-A32F-58B9E831C9AC"}
 */
function PasswordField() {
	TextField.apply(this, arguments);
	
	/**
	 * The display type of the password field is always PASSWORD and cannot be changed
	 */
	this.displayType = JSField.PASSWORD;		
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"9E1AC8BE-99D8-4F37-9F82-00DD18A74914",variableType:-4}
 */
var init_PasswordField = (function() {
	PasswordField.prototype = Object.create(TextField.prototype);
	PasswordField.prototype.constructor = PasswordField;
	
	//displayType cannot be changed
	Object.defineProperty(PasswordField.prototype, "displayType", {
		get: function() {
			return JSField.PASSWORD;
		},
		set: function(x) {
			
		}
	})		
	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"5F06EF0B-CE64-46D5-B836-1CEA0AE2280D"}
 */
function RadioButtonGroup() {
	TextField.apply(this, arguments);
	
	/**
	 * The data type of the component as any of the JSVariable constants
	 * 
	 * @type {Number}
	 */
	this.dataType = JSVariable.NUMBER;	
	
	/**
	 * The display type of the RadioButtonGroup is always RADIOS and cannot be changed
	 */
	this.displayType = JSField.RADIOS;	
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"DA565522-CCE4-45B7-A0C5-1B51EE74EB20",variableType:-4}
 */
var init_RadioButtonGroup = (function() {
	RadioButtonGroup.prototype = Object.create(TextField.prototype);
	RadioButtonGroup.prototype.constructor = RadioButtonGroup;
	
	//displayType cannot be changed
	Object.defineProperty(RadioButtonGroup.prototype, "displayType", {
		get: function() {
			return JSField.RADIOS;
		},
		set: function(x) {
			
		}
	})	
	
	/**
	 * @param {JSField} dialogComponent
	 */
	RadioButtonGroup.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		dialogComponent.scrollbars = SM_SCROLLBAR.VERTICAL_SCROLLBAR_NEVER;
	}
	
	/**
	 * @return {String} styleClass
	 * @this {TextField}
	 */
	Checkbox.prototype.getStyleClass = function() { 
		return "radio" + (this.styleClass ? "." + this.styleClass : "");
	}	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"748CC5FC-5957-4583-BBAE-BD97A765F2BC"}
 */
function TextArea() {
	TextField.apply(this, arguments);
	
	/**
	 * The display type of the text area is always TEXT_AREA and cannot be changed
	 */
	this.displayType = JSField.TEXT_AREA;	
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"E3A90455-9142-4049-AC7D-4F75C0E5B818",variableType:-4}
 */
var init_TextArea = (function() {
	TextArea.prototype = Object.create(TextField.prototype);
	TextArea.prototype.constructor = TextArea;
	
	//displayType cannot be changed
	Object.defineProperty(TextArea.prototype, "displayType", {
		get: function() {
			return JSField.TEXT_AREA;
		},
		set: function(x) {
			
		}
	})	
	
	/**
	 * @param {JSField} dialogComponent
	 * @override 
	 */
	TextArea.prototype.setAdditionalComponentProperties = function(dialogComponent) {
		dialogComponent.scrollbars = SM_SCROLLBAR.HORIZONTAL_SCROLLBAR_NEVER;
	}	
	
	/**
	 * @return {String} styleClass
	 * @this {TextField}
	 */
	TextArea.prototype.getStyleClass = function() { 
		return "field" + (this.styleClass ? "." + this.styleClass : "");
	}
	
}());

/**
 * @constructor
 * 
 * @extends {TextField}
 * 
 * @private 
 * 
 * @properties={typeid:24,uuid:"08400CB3-E828-42DB-B0EB-0E90C7978E4F"}
 */
function Combobox() {
	TextField.apply(this, arguments);
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"7590FEE6-3A69-4360-B909-3F9FE9A52912",variableType:-4}
 */
var init_Combobox = (function() {
	Combobox.prototype = Object.create(TextField.prototype);
	Combobox.prototype.constructor = Combobox;	
	
	/**
	 * @return {String} styleClass
	 * @this {Combobox}
	 */
	Combobox.prototype.getStyleClass = function() { 
		return "combobox" + (this.styleClass ? "." + this.styleClass : "");
	}
}());

/**
 * Builds the form
 * @param {CustomDialog} customDialog
 * @private 
 *
 * @properties={typeid:24,uuid:"41A91613-3F93-4EC1-AA9D-6CD79497A725"}
 */
function buildDialogForm(customDialog) {
	if (customDialog.jsForm) {
		return customDialog.jsForm;
	}
	
	var styleHelper = getStyleHelper(customDialog.styleName ? customDialog.styleName : null);
	
	if (customDialog.message) {
		customDialog.components.unshift(createMessage(customDialog.message));
	}
	
	var jsForm = solutionModel.newForm(customDialog.formName, null, null, false, 10, 10);
	customDialog.jsForm = jsForm;
	
	addToFormStack(customDialog.formName);
		
	var y = customDialog.insets.top + (customDialog.header ? customDialog.header.height : 0);
	var webclientExtraPixels = application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT ? 5 : 0;
	
	/**
	 * @param {Label} labelComp
	 * @param {String} font
	 */
	function calculateLabelWidth(labelComp, font) {
		var labelText = labelComp.text;
		if (!labelText) return 0;
		var plainText = labelText;
		if (labelText.substr(0,6) == "<html>") {
			//replace <br> with \n
			plainText = plainText.replace(/<br>/g, "\n");
			//remove all tags
			plainText = plainText.replace(/(<([^>]+)>)/ig, "");
		}
		var labelTextParts = plainText.split("\n");
		
		var maxLength = 0;
		for (var i = 0; i < labelTextParts.length; i++) {
			var w = styleHelper.getTextWidth(font, labelTextParts[i]) + webclientExtraPixels;
			if (w > maxLength) maxLength = w;
		}
		
		//adjust the height when multi-line
		if (labelTextParts.length > 1) {
			if (!labelComp.height) {
				if (styleHelper) {
					labelComp.height = (styleHelper.getFontHeight(font) + 2) * labelTextParts.length + customDialog.rowSpacing;
				} else {
					labelComp.height = customDialog.defaultFieldHeight * labelTextParts.length
				}
			}
		}
		
		return maxLength;
	}
	
	//calculate max label and field width
	var comp, c, maxLabelWidth = 0, maxFieldWidth = customDialog.defaultFieldWidth, maxContentWidth = 0;
	for (c = 0; c < customDialog.components.length; c++) {
		comp = customDialog.components[c];
		var labelWidth = comp.label && styleHelper ? styleHelper.getTextWidth(styleHelper.getFontString("label"), comp.label) : 0;
		labelWidth += webclientExtraPixels;
		if (labelWidth > maxLabelWidth) maxLabelWidth = labelWidth;
		if (comp.width > maxFieldWidth) maxFieldWidth = comp.width;
		
		//make sure a checkbox text fits the box
		if (comp instanceof Checkbox) {
			/** @type {Checkbox} */
			var checkComp = comp;
			labelWidth = styleHelper ? styleHelper.getTextWidth(styleHelper.getFontString(checkComp.getStyleClass()), checkComp.titleText) : 0;
			labelWidth += webclientExtraPixels;
			//leave space for checkbox
			labelWidth += 30;
			if (labelWidth > (maxLabelWidth + maxFieldWidth)) maxFieldWidth = labelWidth - maxLabelWidth;
		}
		
		//make sure a label text fits the box
		if (comp instanceof Label) {
			/** @type {Label} */
			var labelComp = comp;
			labelWidth = styleHelper ? calculateLabelWidth(labelComp, styleHelper.getFontString(labelComp.getStyleClass())) : 0;
			labelWidth += webclientExtraPixels;
			//when a label has its label set to null, it should span the whole dialog
			//when its label is an empty string, it should align in the fields column
			if (labelComp.label == null && labelWidth > maxContentWidth) {
				//make sure it spans the whole dialog
				maxContentWidth = labelWidth;
			} else if (labelWidth > maxFieldWidth) {
				//make sure the label fits the field column
				maxFieldWidth = labelWidth;
			}
		}
	}
	
	//the max content width could be bigger than label and field columns together
	//that space is added to the field column then
	if (maxContentWidth > maxLabelWidth + maxFieldWidth + customDialog.columnSpacing) {
		maxFieldWidth = maxContentWidth - maxLabelWidth - customDialog.columnSpacing;
	}
	
	//fields that don't have a specific width set get the max width of any field
	customDialog.defaultFieldWidth = maxFieldWidth;
	
	//calculate max button width
	var maxButtonWidth = 0, b, button, buttonWidth;
	if (customDialog.buttonOrientation == BUTTON_ORIENTATION.RIGHT) {
		//TODO
	} else {
		for (b = 0; b < customDialog.buttons.length; b++) {
			button = customDialog.buttons[b];
			buttonWidth = button.text && styleHelper ? styleHelper.getTextWidth(styleHelper.getFontString(button.getStyleClass()), button.text) : 0;
			if (buttonWidth) {
				//add 20px spacing on each side
				buttonWidth += 40;
			}
			if (button.imageMedia) {
				buttonWidth += plugins.images.getImage(button.imageMedia.bytes).getWidth();
			}
			maxButtonWidth += buttonWidth + ((b < customDialog.buttons.length- 1) ? customDialog.buttonSpacing : 0);
			button.width = buttonWidth;
		}
	}

	//add icon
	if (customDialog.iconMedia) {
		var jsIcon = jsForm.newLabel("", customDialog.insets.left, customDialog.insets.top, 32, 32);
		jsIcon.transparent = true;
		jsIcon.imageMedia = customDialog.iconMedia;
		jsIcon.mediaOptions = SM_MEDIAOPTION.ENLARGE | SM_MEDIAOPTION.REDUCE;
		jsIcon.verticalAlignment = SM_ALIGNMENT.CENTER;
		jsIcon.horizontalAlignment = SM_ALIGNMENT.CENTER;
		// Increase left inset so everything starts after the icon
		customDialog.insets.left += 32 + customDialog.columnSpacing*2
	}
	
	var compWidth = maxLabelWidth + customDialog.columnSpacing + maxFieldWidth;
	var formWidth = customDialog.insets.left + (maxButtonWidth > compWidth ? maxButtonWidth : compWidth) + customDialog.insets.right;

	//add header
	if (customDialog.header) {
		// TODO
	}

	//add components
	for (c = 0; c < customDialog.components.length; c++) {
		comp = customDialog.components[c];
		y = comp.addComponentToForm(customDialog, y, maxLabelWidth);
		y += customDialog.rowSpacing;
	}
	
	//create button onAction
	var jsOnAction = jsForm.newMethod("\
		function onAction(event) { \
			var btnNum = event.getElementName().replace('btn_', ''); \
			var button = customDialog.buttons[btnNum]; \
			customDialog.buttonClicked = button; \
			if (button.closeDialogOnMethodCall) { \
				var window = application.getWindow(controller.getName()); \
				if (window) window.destroy(); \
			} \
			if (button.onActionMethod) { \
				var args = [event, customDialog]; \
				if (button.onActionMethodArgs) args = args.concat(button.onActionMethodArgs); \
				scopes.svySystem.callMethod(button.onActionMethod, args); \
			} \
			if (continuation) { \
				continuation(customDialog); \
			} \
		}");
	
	//add buttons
	var buttonX;
	var buttonAnchors;
	if (customDialog.buttonAlignment == LAYOUT_ALIGNMENT.LEFT) {
		buttonX = customDialog.insets.left;
		buttonAnchors = SM_ANCHOR.WEST | SM_ANCHOR.SOUTH;
	} else if (customDialog.buttonAlignment == LAYOUT_ALIGNMENT.CENTER) {
		buttonX = (formWidth - maxButtonWidth) / 2;
		buttonAnchors = SM_ANCHOR.SOUTH;
	} else if (customDialog.buttonAlignment == LAYOUT_ALIGNMENT.RIGHT) {
		buttonX = formWidth - customDialog.insets.right - maxButtonWidth;
		buttonAnchors = SM_ANCHOR.EAST | SM_ANCHOR.SOUTH;		
	} 
	
	var buttonHeight = 0;
	y = y - customDialog.rowSpacing + customDialog.buttonOffset;
	for (b = 0; b < customDialog.buttons.length; b++) {
		button = customDialog.buttons[b];
		var jsButton = jsForm.newButton(button.text, buttonX, y, button.width, button.height ? button.height : 25, null);
		jsButton.name = "btn_" + b;
		jsButton.onAction = jsOnAction;
		if (jsButton.height > buttonHeight) buttonHeight = jsButton.height;
		if (button.enabled == false) jsButton.enabled = false;
		if (button.imageMedia) jsButton.imageMedia = button.imageMedia;
		if (button.showClick == false) jsButton.showClick = false;
		if (button.showFocus == false) jsButton.showFocus = false;
		jsButton.anchors = buttonAnchors;
		buttonX += jsButton.width + customDialog.buttonSpacing;
	}
	y += buttonHeight;
	
	jsForm.navigator = SM_DEFAULTS.NONE;
	jsForm.styleName = customDialog.styleName;
	jsForm.width = formWidth;	
	jsForm.getBodyPart().height = y + customDialog.insets.bottom;
	jsForm.newVariable("customDialog", JSVariable.MEDIA);
	jsForm.newVariable("continuation", JSVariable.MEDIA);
	
	if (customDialog.onClose == ON_CLOSE.IGNORE) {
		var onHide = jsForm.newMethod("function onHide(event) { if (!customDialog.buttonClicked) { return false; } else { return true; } }");
		jsForm.onHide = onHide;
	}
	
	//set default values
	for (c = 0; c < customDialog.components.length; c++) {
		comp = customDialog.components[c];
		forms[jsForm.name][comp.instanceId] = comp.initialValue;
	}
	
	forms[jsForm.name]["customDialog"] = customDialog;
	
	return jsForm;
}

/**
 * Creates and returns a CustomDialog
 * 
 * @param {String} [styleName] the name of the style to be used
 * @param {String} [title] the title of the dialog
 * @param {String} [message] an optional message that is shown on top of the dialog
 * @param {String|byte[]|plugins.file.JSFile} [icon] an optional dialog icon (see the DEFAULT_ICON constant for pre-defined icons)
 * @param {Array<Button>|Array<String>} [buttons] an optional array of buttons
 * @param {Array<DialogComponent>} [components] an optional array of components
 * 
 * @example 
 * var customDialog = scopes.svyCustomDialogs.createCustomDialog("myStyle", "Title of my dialog", "This is an important message", scopes.svyCustomDialogs.DEFAULT_ICON.INFO);<br>
 * //don't allow the user to NOT click a button to close the dialog<br>
 * customDialog.onClose = scopes.svyCustomDialogs.ON_CLOSE.IGNORE;<br>
 * <br>
 * //add components<br>
 * customDialog.addTextField("Some text");<br>
 * customDialog<br>
 * &nbsp;&nbsp;&nbsp;.addCalendar("A date field", new Date())<br>
 * &nbsp;&nbsp;&nbsp;.setFormat("yyyy-MM-dd|yyyy-MM-dd");<br>
 * customDialog.addCheckbox("This is a checkbox that fully spans the dialog", null, true);<br>
 * customDialog.addCheckbox("This is a normal checkbox", "", false);<br>
 * customDialog.addSeparator();<br>
 * customDialog.addMessage("Here are some more components you can fill out:");<br>
 * customDialog
 * &nbsp;&nbsp;&nbsp;.addCombobox("Do you like this?", ["Yes", "No", "Maybe"])
 * &nbsp;&nbsp;&nbsp;.setEditable(false)
 * &nbsp;&nbsp;&nbsp;.setInitialValue("Maybe");<br>
 * customDialog.addPasswordField("Please enter your password");<br>
 * customDialog
 * &nbsp;&nbsp;&nbsp;.addRadioButtonGroup("Do you like this now?", ["Yes", "Maybe"])
 * &nbsp;&nbsp;&nbsp;.setInitialValue("Yes");<br>
 * customDialog.addTextArea("Some more text", "Lorem Ipsum is simply dummy text of the\nprinting and typesetting industry. Lorem Ipsum\nhas been the industry's standard dummy\ntextever since the 1500s, when an unknown\nprinter took a galley of type and scrambled\nit to make a type specimen book.")<br>
 * &nbsp;&nbsp;&nbsp;.setHeight(70)<br>
 * &nbsp;&nbsp;&nbsp;.setWidth(300)<br>
 * &nbsp;&nbsp;&nbsp;.setLabelAlignment(SM_ALIGNMENT.TOP);<br>
 * <br>
 * //make a listbox<br>
 * customDialog<br>
 * &nbsp;&nbsp;&nbsp;.addTextField("A list box")<br>
 * &nbsp;&nbsp;&nbsp;.setValueListItems(["a","b","c","d","e"])<br>
 * &nbsp;&nbsp;&nbsp;.setDisplayType(JSField.LISTBOX);<br>
 * <br>
 * //add buttons<br>
 * customDialog.addButton("My own action", myOwnActionMethod, ["myExtraArgs", 123]);<br>
 * customDialog.addButton("Cancel this");<br>
 * customDialog.addButton("Done");<br>
 * <br>
 * var dialogResult = customDialog.showDialog();<br>
 * <br>
 * var buttonClicked = dialogResult.buttonClicked.text;<br>
 * var dialogValues = dialogResult.getResult();<br>
 * <br>
 * application.output("User clicked button \"" + buttonClicked + "\"");<br>
 * for (var i = 0; i < dialogValues.length; i++) {<br>
 * &nbsp;&nbsp;&nbsp;application.output("component " + i + " has value " + dialogValues[i]);<br>
 * }<br>
 *
 * @properties={typeid:24,uuid:"9C095F21-2C15-4E12-870A-5D63B8F7BB1A"}
 */
function createCustomDialog(styleName, title, message, icon, buttons, components) {
	/** @type {Array<Button>} */
	var btnsToAdd = [];
	if (buttons instanceof Array && buttons.length > 0 && buttons[0] instanceof String) {
		for (var s = 0; s < buttons.length; s++) {
			/** @type {String} */
			var buttonLabel = buttons[s];
			btnsToAdd.push(createButton(buttonLabel));
		}
	} else {
		btnsToAdd = buttons;
	}
	return new CustomDialog(styleName, title, message, icon, btnsToAdd, components);
}

/**
 * Creates and returns a Button
 * 
 * @param {String} text the button text
 * @param {Function} [onActionMethod] the method to be performed when the user clicks the button; the method receives a JSEvent, the CustomDialog and the optional methodArguments as arguments
 * @param {Object} [onActionMethodArgs] optional arguments for the onAction method
 * @param {String|byte[]|plugins.file.JSFile} [icon] optional button icon
 * 
 * @return {Button}
 *
 * @properties={typeid:24,uuid:"61AA273E-A452-4A4C-9EE1-AC616FE107FE"}
 */
function createButton(text, onActionMethod, onActionMethodArgs, icon) {
	var btn = new Button();
	btn.text = text;
	if (onActionMethod) btn.onActionMethod = onActionMethod;
	if (onActionMethodArgs) btn.onActionMethodArgs = onActionMethodArgs;
	if (icon) btn.setIcon(icon);
	return btn;
}

/**
 * Creates and returns a Label
 * 
 * @param {String} text the label text
 * 
 * @return {Label}
 *
 * @properties={typeid:24,uuid:"7041444C-0F3C-4BF5-9DA7-03CFFDDC80B1"}
 */
function createLabel(text) {
	var label = new Label();
	label.text = text;
	return label;
}

/**
 * Creates and returns a Message label, which is a Label that spans the whole dialog
 * 
 * @param {String} text the label text
 * 
 * @return {Label}
 *
 * @properties={typeid:24,uuid:"3AA03258-0833-44BF-BC7E-93F60842E89C"}
 */
function createMessage(text) {
	var label = new Label();
	label.text = text;
	label.label = null;
	label.verticalAlignment = SM_ALIGNMENT.CENTER;
	return label;
}

/**
 * Creates and returns a Separator
 * 
 * @return {Separator}
 *
 * @properties={typeid:24,uuid:"1DBA340E-DE4E-4C76-90A8-B3211517D74B"}
 */
function createSeparator() {
	var s = new Separator();
	return s;
}

/**
 * Creates and returns a TextField
 * 
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Object} [initialValue] an optional initial value
 * @param {Number} [dataType] the data type of the dataprovider of the field (any of the JSVariable constants)
 * 
 * @return {TextField}
 *
 * @properties={typeid:24,uuid:"10C2CD8F-892E-4229-8D68-76488FC91420"}
 */
function createTextField(label, initialValue, dataType) {
	var field = new TextField();
	if (label) field.label = label;
	if (dataType != null) field.dataType = dataType;
	if (initialValue != null) field.initialValue = initialValue;
	return field;
}

/**
 * Creates and returns a TextArea
 * 
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Object} [initialValue] an optional initial value
 * 
 * @return {TextArea}
 *
 * @properties={typeid:24,uuid:"67C5E472-3689-4676-AF62-1598EEC7E888"}
 */
function createTextArea(label, initialValue) {
	var textArea = new TextArea();
	textArea.displayType = JSField.TEXT_AREA;
	if (label) textArea.label = label;
	if (initialValue != null) textArea.initialValue = initialValue;
	return textArea;
}

/**
 * Creates and returns a PasswordField
 * 
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Object} [initialValue] an optional initial value
 * 
 * @return {PasswordField}
 *
 * @properties={typeid:24,uuid:"30EF4D8A-EAB8-4A9A-A22E-800A30E95791"}
 */
function createPasswordField(label, initialValue) {
	var field = new PasswordField();
	if (label) field.label = label;
	if (initialValue != null) field.initialValue = initialValue;
	return field;
}

/**
 * Creates and returns a PasswordField
 * 
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Array<String>|JSDataSet} [values] values for a custom value list as either display/real values arrays or a JSDataSet containing both
 * @param {Array} [realValues] return values for a custom value list if <code>values</code> is an array and not a JSDataSet
 * 
 * @return {RadioButtonGroup}
 *
 * @properties={typeid:24,uuid:"3B7BE401-1FF8-4163-94D5-C4D00B37E360"}
 */
function createRadioButtonGroup(label, values, realValues) {
	var radios = new RadioButtonGroup();
	radios.displayType = JSField.RADIOS;
	if (label) radios.label = label;
	if (values && realValues) {
		radios.setValueListItems(values, realValues);
	} else if (values) {
		radios.setValueListItems(values);		
	}
	return radios;
}

/**
 * Creates and returns a Calendar
 * 
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Object} [initialValue] an optional initial value
 * 
 * @return {Calendar}
 *
 * @properties={typeid:24,uuid:"9D3D98DF-9B6E-4115-9842-332058326DA6"}
 */
function createCalendar(label, initialValue) {
	var cal = new Calendar();
	if (label) cal.label = label;
	if (initialValue != null) cal.initialValue = initialValue;
	return cal;
}

/**
 * Creates and returns a Checkbox
 * 
 * @param {String} [text] the text of the checkbox shown when no value list is assigned to it
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Boolean} [isChecked] whether the checkbox is checked initially
 * 
 * @return {Checkbox}
 *
 * @properties={typeid:24,uuid:"DFACE525-4BDF-411C-9204-724471C13795"}
 */
function createCheckbox(text, label, isChecked) {
	var check = new Checkbox();
	check.displayType = JSField.CHECKS;
	if (text != null) check.titleText = text;
	check.label = label;
	if (isChecked != null) check.initialValue = isChecked ? 1 : 0;
	return check;
}

/**
 * @param {String} [label] optional label for the component; if set to null, the component will span the whole dialog, if set to an empty string, the label will be empty, but the field is shown in the fields column
 * @param {Array<String>|JSDataSet} [values] values for a custom value list as either display/real values arrays or a JSDataSet containing both
 * @param {Array} [realValues] return values for a custom value list if <code>values</code> is an array and not a JSDataSet
 *
 * @properties={typeid:24,uuid:"0EED282D-E8BE-499C-A5A3-08E7674E5EAD"}
 */
function createCombobox(label, values, realValues) {
	var cb = new Combobox();
	cb.displayType = JSField.COMBOBOX;
	if (label) cb.label = label;
	if (values && realValues) {
		cb.setValueListItems(values, realValues);
	} else if (values) {
		cb.setValueListItems(values);		
	}
	return cb;
}

/**
 * Show a form in a modal dialog
 *
 * @param {String|RuntimeForm} formToShow
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {String} [title]
 * @param {Boolean} [resizable]
 * @param {Boolean} [showTextToolbar]
 * @param {String} [windowName]
 *
 * @properties={typeid:24,uuid:"BD1320BF-A042-4C45-B609-7B8A0340A7EA"}
 */
function showFormInDialog(formToShow, x, y, width, height, title, resizable, showTextToolbar, windowName) {
	if (!windowName) windowName = "svyCustomDialog_" + application.getUUID().toString().replace(/-/g, "_");
	
	var window = application.createWindow(windowName, JSWindow.MODAL_DIALOG);
	if (x == null) x = -1;
	if (y == null) y = -1;
	if (width == null) width = -1;
	if (height == null) height = -1;
	
	window.setInitialBounds(x, y, width, height);
	window.title = title;
	if (resizable != undefined) window.resizable = resizable;
	if (showTextToolbar === true) window.showTextToolbar(showTextToolbar);
	
	if (application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT) {
		/** @type {String} */
		var originalFormName = formToShow;
		if (formToShow instanceof RuntimeForm) {
			originalFormName = formToShow.controller.getName();
		}
		var jsFormOriginal = solutionModel.getForm(originalFormName);
		var jsForm = solutionModel.newForm(windowName, jsFormOriginal);
		jsForm.newVariable("continuation", JSVariable.MEDIA);
		var onHide = jsForm.newMethod("function onHide(event) { _super.onHide(); if (continuation) { continuation(); } }");
		jsForm.onHide = onHide;
		
		addToFormStack(windowName);
		
		forms[windowName]["continuation"] = new Continuation();
		
		window.show(forms[windowName]);
		return terminateCurrentMethodExecution();
	} else {
		window.show(formToShow);
		return this;
	}
}


/**
 * Shows a message dialog with the specified title, message and a customizable set of buttons.
 * 
 * @param {String} title the dialog title
 * @param {String} message the message to show
 * @param {...String} buttons the buttons
 *
 * @properties={typeid:24,uuid:"20CA7B49-684E-4698-A26F-0EEFE1662889"}
 */
function showInfoDialog(title, message, buttons) {
	if (application.getApplicationType() != APPLICATION_TYPES.WEB_CLIENT) {
		/** @type {Array<String>} */
		var buttonArgs = Array.prototype.slice.call(arguments);
		buttonArgs.splice(0, 2);
		buttons = buttonArgs;
		return plugins.dialogs.showInfoDialog(title, message, buttons);
	} else {
		return showDefaultDialog(arguments, DEFAULT_ICON.INFO);
	}
}

/**
 * Shows a message dialog with the specified title, message and a customizable set of buttons.
 * 
 * @param {String} title the dialog title
 * @param {String} message the message to show
 * @param {...String} buttons the buttons
 *
 * @properties={typeid:24,uuid:"7101235B-6191-448F-82DE-8C8E722C431C"}
 */
function showQuestionDialog(title, message, buttons) {
	if (application.getApplicationType() != APPLICATION_TYPES.WEB_CLIENT) {
		/** @type {Array<String>} */
		var buttonArgs = Array.prototype.slice.call(arguments);
		buttonArgs.splice(0, 2);
		buttons = buttonArgs;
		return plugins.dialogs.showQuestionDialog(title, message, buttons);
	} else {
		var questionIcon = javaIconToByteArray(Packages.javax.swing.UIManager.getIcon("OptionPane.questionIcon"));
		return showDefaultDialog(arguments, questionIcon);
	}
}

/**
 * Shows a message dialog with the specified title, message and a customizable set of buttons.
 * 
 * @param {String} title the dialog title
 * @param {String} message the message to show
 * @param {...String} buttons the buttons
 *
 * @properties={typeid:24,uuid:"A640E147-B068-458B-8578-0DAF431E0AD4"}
 */
function showWarningDialog(title, message, buttons) {
	if (application.getApplicationType() != APPLICATION_TYPES.WEB_CLIENT) {
		/** @type {Array<String>} */
		var buttonArgs = Array.prototype.slice.call(arguments);
		buttonArgs.splice(0, 2);
		buttons = buttonArgs;
		return plugins.dialogs.showWarningDialog(title, message, buttons);
	} else {
		return showDefaultDialog(arguments, DEFAULT_ICON.WARNING);
	}
}

/**
 * Shows a message dialog with the specified title, message and a customizable set of buttons.
 * 
 * @param {String} title the dialog title
 * @param {String} message the message to show
 * @param {...String} buttons the buttons
 *
 * @properties={typeid:24,uuid:"6387273F-868D-424E-9164-EDAFF7052A53"}
 */
function showErrorDialog(title, message, buttons) {
	if (application.getApplicationType() != APPLICATION_TYPES.WEB_CLIENT) {
		return plugins.dialogs.showErrorDialog(title, message, buttons);
	} else {
		return showDefaultDialog(arguments, DEFAULT_ICON.ERROR);
	}
}

/**
 * Shows an input dialog where the user can enter data. Returns the entered data, or nothing when canceled.
 * 
 * @param {String} title the dialog title
 * @param {String} message the message to show
 * @param {String} initialValue initial value for the input field
 *
 * @properties={typeid:24,uuid:"475D9BA4-0945-445B-AB64-C9A9C8F44BA3"}
 */
function showInputDialog(title, message, initialValue) {
	if (application.getApplicationType() != APPLICATION_TYPES.WEB_CLIENT) {
		return plugins.dialogs.showInputDialog(title, message, initialValue)
	} else {
		var questionIcon = javaIconToByteArray(Packages.javax.swing.UIManager.getIcon("OptionPane.questionIcon"));
		var cd = createCustomDialog("svyFrameworkStyle", title, message, questionIcon);
		cd.addTextField(null, initialValue).setWidth(250);
		cd.addButton(i18n.getI18NMessage('servoy.button.ok'));
		cd.addButton(i18n.getI18NMessage('servoy.button.cancel'));
		var result = cd.showDialog();
		return result.getResult() ? result.getResult()[0] : null;
	}
}

/**
 * @private
 *
 * @param {String} formName
 *
 * @properties={typeid:24,uuid:"7DBD9017-B29B-4C9D-A869-BDEE3CD7B3B5"}
 */
function addToFormStack(formName) {
	var success;
	for (var i = 0; i < formStack.length; i++) {
		success = history.removeForm(formStack[i]);
		if (!success) {
			logger.warn('Couldn\'t remove form "' + formStack[i] + '" from history');
			continue;
		}
		success = solutionModel.removeForm(formStack[i]);
		if (!success) {
			logger.warn('Couldn\'t remove form "' + formStack[i] + '"');
			continue;
		}
		logger.debug('Cleaned up customDialog form "' + formStack[i] + '"');
		formStack.splice(i, 1);
	}
	formStack.push(formName);
}

/**
 * @param aArguments
 * @param {String|byte[]} icon
 * @private 
 *
 * @properties={typeid:24,uuid:"49B6D9FD-8962-49B0-ACF2-39600F13C161"}
 */
function showDefaultDialog(aArguments, icon) {
	/** @type {Array<String>} */
	var args = Array.prototype.slice.call(arguments);
	args = args[0];
	var title = args[0];
	var message = args[1];
	
	var btns = [];
	for (var i = 2; i < args.length; i++) {
		btns.push(createButton(args[i]));
	}
	var cd = createCustomDialog("svyFrameworkStyle", title, message, icon, btns);
	var result = cd.showDialog();
	return result.buttonClicked ? result.buttonClicked.text : null;
}

/**
 * @param {String|byte[]|plugins.file.JSFile} iconArgs
 * @return {JSMedia}
 * @private 
 *
 * @properties={typeid:24,uuid:"9F7C4EF8-0974-4EAD-8BB5-5E3260639C5E"}
 */
function getIconFromArgs(iconArgs) {
	if (!iconArgs) {
		return null;
	}
	
	/** @type {JSMedia} */
	var media;
	if (iconArgs instanceof String) {
		/** @type {String} */
		var iconArgsString = iconArgs;
		if (utils.stringLeft(iconArgsString, 9) == "media:///") {
			iconArgsString = iconArgsString.replace("media:///", "");
			media = solutionModel.getMedia(iconArgsString);
			if (!media) {
				throw new scopes.svyExceptions.IllegalArgumentException("Can't find media \"" + iconArgs + "\"");
			}
		} else {
			//file path
			var jsFileFromString = plugins.file.convertToJSFile(iconArgsString);
			if (!jsFileFromString.exists()) {
				throw new scopes.svyExceptions.IllegalArgumentException("Can't find media \"" + iconArgs + "\"");
			}
			media = solutionModel.newMedia("svyCustomDialog_media_" + application.getUUID().toString().replace(/-/g, "_"), jsFileFromString.getBytes());
		}
	} else if (iconArgs instanceof Array) {
		/** @type {byte[]} */
		var iconArgsBytes = iconArgs;
		media = solutionModel.newMedia("svyCustomDialog_media_" + application.getUUID().toString().replace(/-/g, "_"), iconArgsBytes);
	} else if (iconArgs instanceof plugins.file.JSFile) {
		/** @type {plugins.file.JSFile} */
		var iconArgsFile = iconArgs;
		if (!iconArgsFile.exists()) {
			throw new scopes.svyExceptions.IllegalArgumentException("Can't find media \"" + iconArgs + "\"");
		}
		media = solutionModel.newMedia("svyCustomDialog_media_" + application.getUUID().toString().replace(/-/g, "_"), iconArgsFile.getBytes());
	} else {
		throw new scopes.svyExceptions.IllegalArgumentException("Can't get media from arguments " + iconArgs);
	}
	
	return media;
}

/**
 * Resolves i18n when provided
 * 
 * @param textToResolve
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"0E362742-5B51-455B-AEF7-FD7336412689"}
 */
function resolveText(textToResolve) {
	if (textToResolve && textToResolve.substring(0, 5) == "i18n:") {
		var i18nText = i18n.getI18NMessage(textToResolve);
		if (i18nText.substring(0,1) != "!") {
			return i18nText;
		}
	}
	return textToResolve;
}

/**
 * @return {StyleHelper}
 * @private 
 * @properties={typeid:24,uuid:"7F89E7EC-AD7E-4276-8ADF-899FA04E11FC"}
 */
function getStyleHelper(styleName) {
	var style;
	if (styleName) {
		style = solutionModel.getStyle(styleName);
		if (!style) {
			logger.error("Can't find style \"" + styleName + "\"");
		}
	}
	
	return new StyleHelper(style ? style.text : "", styleName);
}

/**
 * Gets the bytes of an ImageIcon
 * @param {Packages.javax.swing.Icon} icon
 * @return {byte[]}
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"DB1EF9C2-F6B3-45C0-8E69-C87FB983EDCF"}
 */
function javaIconToByteArray(icon) {
	var bufferedImage;
	if (icon instanceof Packages.java.swing.ImageIcon) {
		/** @type {Packages.javax.swing.ImageIcon} */
		var imageIcon = icon;
	    var awtImage = imageIcon.getImage();
	    bufferedImage = new java.awt.image.BufferedImage(awtImage.getWidth(null), awtImage.getHeight(null), java.awt.image.BufferedImage.TYPE_INT_RGB);
	    var graphics2D = bufferedImage.createGraphics();
        graphics2D.drawImage(awtImage, null, null);
	} else {
	    var iconWidth = icon.getIconWidth();
	    var iconHeight = icon.getIconHeight();
	    var graphicsEnvironment = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment();
	    var defaultScreenDevice = graphicsEnvironment.getDefaultScreenDevice();
	    var defaultScreenConfiguration = defaultScreenDevice.getDefaultConfiguration();
	    bufferedImage = defaultScreenConfiguration.createCompatibleImage(iconWidth, iconHeight, java.awt.Transparency.TRANSLUCENT);
	    var graphics = bufferedImage.createGraphics();
	    icon.paintIcon(null, graphics, 0, 0);
	    graphics.dispose();
	}
	var baos = new java.io.ByteArrayOutputStream();
    Packages.javax.imageio.ImageIO.write(bufferedImage, "png", baos);
    return baos.toByteArray();
}

/**
 * @constructor 
 * @param styleText
 * @param styleName
 * @private 
 *
 * @properties={typeid:24,uuid:"FD868948-50E0-447E-A431-8B2B69884271"}
 */
function StyleHelper(styleText, styleName) {
	var defaultFont = "Arial,0,12";
	
	if (styleName == null) styleName = "";
	if (styleText == null) styleText = "";
	
	var styleSheet = new Packages.com.servoy.j2db.util.ServoyStyleSheet(styleText, styleName);
	
	this.getFontString = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		if (!rule) return defaultFont;
		var font = styleSheet.getFont(rule);
		if (!font) return defaultFont;
		return Packages.com.servoy.j2db.util.PersistHelper.createFontString(font);
	}
	
	this.getTextWidth = function(font, text) {
		if (!text) {
			return 0;
		}
		if (!font) {
			font = defaultFont;
		}
		try {
			var fontParts = font.split(",");
			var javaFont = new java.awt.Font(fontParts[0], fontParts[1], fontParts[2]);
			var tlkt = java.awt.Toolkit.getDefaultToolkit();
			var metrics = tlkt.getFontMetrics(javaFont);
			if (text.substr(0, 5) == "i18n:") {
				text = i18n.getI18NMessage(text);
			}
			return metrics.stringWidth(text);
		} catch (e) {
			logger.error("Error getting text width for font \"" + font + "\"", e);
			return 0;
		}
	}
	
	this.getFontHeight = function(font) {
		if (!font) {
			font = defaultFont;
		}
		try {
			var fontParts = font.split(",");
			var javaFont = new java.awt.Font(fontParts[0], fontParts[1], fontParts[2]);
			var tlkt = java.awt.Toolkit.getDefaultToolkit();
			var metrics = tlkt.getFontMetrics(javaFont);
			return metrics.getHeight();
		} catch (e) {
			logger.error("Error getting text height for font \"" + font + "\"", e);
			return 0;
		} 
	}
}