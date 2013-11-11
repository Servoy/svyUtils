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
 * Returns the width of a text for the given font in pixels
 * 
 * @param {String} font
 * @param {String} text
 * 
 * @return {Number} pixelWidth
 * 
 * @author patrick
 * @since 2012-10-05
 * 
 * @properties={typeid:24,uuid:"243D0F21-3DC6-4F46-84D0-1AB600F78169"}
 */
function getTextWidth(font, text) {
	if (!font || !text) {
		return 0;
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
		application.output("Error getting text width for font \"" + font + "\": " + e, LOGGINGLEVEL.ERROR);
		return 0;
	}
}

/**
 * Returns the height of any text for the given font in pixels
 * 
 * @param {String} font
 * 
 * @return {Number} pixelHeight
 * 
 * @author patrick
 * @since 2012-10-05
 * 
 * @properties={typeid:24,uuid:"101D10F0-F50F-444B-B968-C007CF9F9811"}
 */
function getTextHeight(font) {
	if (!font) {
		return 20;
	}
	try {
		var fontParts = font.split(",");
		var javaFont = new java.awt.Font(fontParts[0], fontParts[1], fontParts[2]);
		var tlkt = java.awt.Toolkit.getDefaultToolkit();
		var metrics = tlkt.getFontMetrics(javaFont);
		return metrics.getHeight();
	} catch (e) {
		application.output("Error getting text height for font \"" + font + "\": " + e, LOGGINGLEVEL.ERROR);
		return 0;
	} 
}

/**
 * A StyleParser that can be used to access a number of style class properties from a given style
 * 
 * @param {String} styleName
 * 
 * @constructor 
 * 
 * @author patrick
 * @since 2012-10-05
 *
 * @properties={typeid:24,uuid:"7CDB5817-FA9D-48BA-BF65-7A5C573A5704"}
 */
function StyleParser(styleName) {
	
	if (!(this instanceof StyleParser)) {
		application.output("scopes.modUtils$styles.StyleParser: Constructor functions should be called with the \"new\" keyword!", LOGGINGLEVEL.WARNING);
		return new StyleParser(styleName);
	}
	
	/**
	 * The name of this style
	 * 
	 * @type {String}
	 */
	this.styleName = styleName;
	
	/**
	 * Style
	 * 
	 * @type {JSStyle}
	 */
	var style = solutionModel.getStyle(styleName);
	
	/**
	 * ServoyStyleSheet
	 * 
	 * @type {Packages.com.servoy.j2db.util.ServoyStyleSheet}
	 */
	var styleSheet = new Packages.com.servoy.j2db.util.ServoyStyleSheet(style.text, styleName);
	
	/**
	 * Returns the font of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} font
	 */
	this.getFontString = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var font = styleSheet.getFont(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createFontString(font);
	}
	
	/**
	 * Returns the background color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} backgroundColor
	 */
	this.getBackgroundColor = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var color = styleSheet.getBackground(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createColorString(color);
	}
	
	/**
	 * Returns the foreground color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} foregroundColor
	 */
	this.getForegroundColor = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var color = styleSheet.getForeground(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createColorString(color);
	}	
	
	/**
	 * Returns the border of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} border
	 */
	this.getBorder = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var border = styleSheet.getBorder(rule);
		return Packages.com.servoy.j2db.util.ComponentFactoryHelper.createBorderString(border);
	}	
	
	/**
	 * Returns the foreground color of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {String} font
	 */
	this.getMargins = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		var margins = styleSheet.getMargin(rule);
		return Packages.com.servoy.j2db.util.PersistHelper.createInsetsString(margins);
	}	
	
	/**
	 * Returns the horizontal alignment of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {Number} horizontalAlignment
	 */
	this.getHorizontalAlignment = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		return styleSheet.getHAlign(rule);
	}	
	
	/**
	 * Returns the vertical alignment of the given style class
	 * 
	 * @param {String} styleClass
	 * @return {Number} verticalAlignment
	 */
	this.getVerticalAlignment = function(styleClass) {
		var rule = styleSheet.getCSSRule(styleClass);
		return styleSheet.getVAlign(rule);
	}
	
	/**
	 * Returns a java.awt.Font from the given font string
	 * 
	 * @param {String} fontString
	 * 
	 * @return {java.awt.Font} font
	 */
	this.getJavaFont = function(fontString) {
		return Packages.com.servoy.j2db.util.PersistHelper.createFont(fontString);
	}
	
	/**
	 * Returns a java.awt.Color from the given color string
	 * 
	 * @param {String} colorString
	 * 
	 * @return {java.awt.Color} color
	 */
	this.getJavaColor = function(colorString) {
		return Packages.com.servoy.j2db.util.PersistHelper.createColor(colorString);
	}
	
}