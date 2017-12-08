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
 * All kind of utilities when running the Web Client.
 * Note that these utilities do not necessarily check if they are being called in a Web Client!
 * 
 * Some interesting resources that were used for some of the utility methods:
 * - http://chillenious.wordpress.com/2006/05/03/wicket-header-contributions-with-behaviors/
 * - http://spatula.net/blog/2006/11/better-than-ajax-adding-client-side.html
 * - http://www.codesmell.org/blog/2010/01/playing-with-wickets-templates/
 * - http://karthikg.wordpress.com/2008/01/24/developing-a-custom-apache-wicket-component/
 * 
 * TODO: document the exact behavior of the different ways to include some custom JS (when fired, how often) and remove @experimental tags when done
 * TODO: support Arrays of elements/components besides single elements/components to attach certain behaviors to.
 * TODO: callback behaviors
 * TODO: add methods to remove stuff that was added 
 * TODO: inject logic into the WC that output wicket Debug console messages (at least Error and Warning messages) to the Console of the browser (take care of IE versions that do not support the console)
 */

/**
 * @private
 * @properties={typeid:35,uuid:"ED9695A7-D5AD-4EC0-9F5D-9F85C9A3FC19",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.webclient')

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F34BB5F4-0E95-4F6B-9C42-3B1DC2B4DC95"}
 */
var MEDIA_URL_PREFIX = 'media:///'

/**
 * @private
 * @properties={typeid:24,uuid:"9287AC01-F11F-4949-BC4C-1C01F04D41D4"}
 */
function checkOperationSupported() {
	if (!scopes.svySystem.isWebClient()) {
		throw new scopes.svyExceptions.UnsupportedOperationException('Only supported in Web Client')
	}
}

/**
 * Helper method to get the wrapper div component on elements if the element has one
 * 
 * @private 
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @return {Packages.org.apache.wicket.Component}
 *
 * @properties={typeid:24,uuid:"CFBBDB4C-5616-4974-A180-4A66C98D4209"}
 */
function getUwrappedComponentOrWrapperComponent(component) {
	/** @type {Packages.org.apache.wicket.Component} */
	var unwrappedElement = unwrapElement(component)
	var parent = unwrappedElement.getParent()
	if (parent instanceof Packages.com.servoy.j2db.server.headlessclient.WrapperContainer) {
		return parent;
	} else {
		return unwrappedElement;
	}
//	return parent instanceof Packages.com.servoy.j2db.server.headlessclient.WrapperContainer ? parent : unwrappedElement //See SVY-8013 for warning
}

/**
 * Centers a (tab)panel within its container through CSS. Tabpanel should left anchored only
 * TODO: checks to see if tabpanel is not left/right anchored and if it that supported orientation
 * @param {RuntimeTabPanel} element
 *
 * @properties={typeid:24,uuid:"7B201980-B19F-4B56-AD61-1BCA3582EE3E"}
 */
function centerPanel(element) {
	checkOperationSupported()
	element = getUwrappedComponentOrWrapperComponent(element)
	var model = Packages.org.apache.wicket.model.Model('left: 50%;margin-left:-' + element.getWidth() / 2 + 'px;')
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, ';')
	unwrapElement(element).add(behavior)
}

//TODO: see if we can make a better implementation like setAlwaysRenderMarkup() so visibility is still controlled by RuntimeComponent.visible
/**
 * Sets the visibility of components in the browser. This means that all the markup is included, but is also hidden.
 * Note: uses the CSS display property and not the CSS visibility property, as Servoy uses the visibility property internally
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {Boolean} visibility
 *
 * @properties={typeid:24,uuid:"8421ED23-0497-4D0F-9CEE-71F543FF0838"}
 */
function setComponentVisibility(component, visibility) {
	checkOperationSupported()
	var style = visibility ? 'display: block' : 'display: none'
	var model = Packages.org.apache.wicket.model.Model(style)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, ';')
	addBehavior(behavior, component)
}

/**
 * Adds a CSS className to the component
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {String} className
 * @param {Boolean} [addToWrapper] See {@link #addStyle()} for parameter details. Default=false
 *
 * @properties={typeid:24,uuid:"BEF22467-35CD-4397-B10C-4BBE9789DD17"}
 */
function addClass(component, className, addToWrapper) {
	checkOperationSupported()
	
	if (addToWrapper) {
		component = getUwrappedComponentOrWrapperComponent(component)
	}
	
	var model = Packages.org.apache.wicket.model.Model(className)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('class', true, model, ' ')
	addBehavior(behavior, component)
}

/**
 * Provides a way to dynamically add extra CSS classes to an element or form<br>
 * <br>
 * Can be used to conditionally include a CSS class on an element or form
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {function():String} provider
 * @param {Boolean} [addToWrapper] See {@link #addStyle()} for parameter details. Default=false
 *	
 *
 * @properties={typeid:24,uuid:"E1477EED-6F18-4979-8D19-F58D90952903"}
 */
function addDynamicClass(component, provider, addToWrapper) {
	checkOperationSupported()
	
	if (addToWrapper) {
		component = getUwrappedComponentOrWrapperComponent(component)
	}
	
	var model = new Packages.org.mozilla.javascript.JavaAdapter(Packages.org.apache.wicket.model.Model, { //See SVY-7933 for warning
		getObject: function() {return provider()}
	})
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('class', model, ' ')
	addBehavior(behavior, component)
}

/**
 * Adds additional Style attributes to the component<br/>
 * <br/>
 * Note that certain elements are encapsulated in a wrapper for positioning purposes.<br/>
 * This means that if the desired changes are related to positioning of the element,<br/>
 * they need to be made on the wrapper.<br/>
 * In order to do so, specify true for the addToWrapper parameter<br/>
 * <br/>
 * 
 * @example <pre>//Changing positioning of an element
 * scopes.svyWebClientUtils.addStyle(elements.myElement, 'top: 10%, left: 10%, right: 10%, bottom: 10%', true)
 * </pre>
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {String} style
 * @param {Boolean} [addToWrapper] Whether or not to apply the style to the positioning wrapper div if the component has one. Default=false
 *
 * @properties={typeid:24,uuid:"4552B165-A0C8-48A8-883B-FA447ABBA68B"}
 */
function addStyle(component, style, addToWrapper) {
	checkOperationSupported()
	
	if (addToWrapper) {
		component = getUwrappedComponentOrWrapperComponent(component)
	}
	
	var model = Packages.org.apache.wicket.model.Model(style)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', true, model, ';')
	addBehavior(behavior, component)
}

/**
 * Provides a way to dynamically extend the style attribute of an element or form<br>
 * <br>
 * Can be used to conditionally add extra style properties on an element or form
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {function():String} provider
 * @param {Boolean} [addToWrapper] See {@link #addStyle()} for parameter details. Default=false
 *
 * @properties={typeid:24,uuid:"8CFC45C9-55A2-4D6F-9E5F-3E1042721767"}
 */
function addDynamicStyle(component, provider, addToWrapper) {
	checkOperationSupported()
	
	if (addToWrapper) {
		component = getUwrappedComponentOrWrapperComponent(component)
	}
	
	var model = new Packages.org.mozilla.javascript.JavaAdapter(Packages.org.apache.wicket.model.Model, { //See SVY-7933 for warning
		getObject: function() {return provider()}
	})
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, ';')
	addBehavior(behavior, component)
}

/**
 * Provides a way to dynamically extend the value of any attribute on an element or form<br>
 * <br>
 * Can be used to conditionally add or extend the value of any attribute on elements or forms
 *
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {String} attribute
 * @param {function():String} provider
 * @param {String} [separator] Value by which to separate multiple values for the specified attribute. Default: ''
 *
 * @properties={typeid:24,uuid:"0B13457D-23E8-485B-B15A-BCAC456876D7"}
 */
function addDynamicAttribute(component, attribute, provider, separator) {
	checkOperationSupported()
	
	var model = new Packages.org.mozilla.javascript.JavaAdapter(Packages.org.apache.wicket.model.Model, { //See SVY-7933 for warning
		getObject: function() {return provider()}
	})
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender(attribute, model, separator||'')
	addBehavior(behavior, component)
}

/**
 * Overwrites the type attribute of HTML Inputs. Allows to take advantage of the new HTL5 input types<br>
 * <br>
 * <b>Note that support in different browsers vary and setting the input type might conflict with Servoy formatting and validation</b><br>
 * <br>
 * @see http://html5doctor.com/html5-forms-input-types/
 * 
 * @experimental: untested
 * 
 * @param {RuntimeTextField} element
 * @param {String} type See {@link #setFieldHtmlType#TYPES}
 *
 * @properties={typeid:24,uuid:"05D360BF-8922-4EF9-B672-80B05AA5BB05"}
 */
function setFieldHtmlType(element, type) {
	checkOperationSupported()
	var behavior = new Packages.org.apache.wicket.behavior.SimpleAttributeModifier('type', type)
	unwrapElement(element).add(behavior)
}

/**
 * @protected 
 * @properties={typeid:35,uuid:"A01241DE-FB9B-4CA7-B1AA-E34500EABD34",variableType:-4}
 */
var initSetFieldHtmlType = function(){
	if (!scopes.svySystem.isWebClient()) return;
	//TODO: Remove this code after upgrading to newer Wicket version (this "patch is for wicket 1.4))
	addJavaScriptDependancy('media:///svyWebClientUtils/wicketAdditions.js')
	
	setFieldHtmlType.TYPES = {
		TEXT: 'text',
		PASSWORD: 'password',
		HIDDEN: 'hidden',
		TEXTAREA: 'textarea',
		SEARCH: 'search',
		EMAIL: 'email',
		URL: 'url',
		TEL: 'tel',
		NUMBER: 'number',
		RANGE: 'range',
		DATE: 'date',
		MONTH: 'month',
		WEEK: 'week',
		TIME: 'time',
		DATETIME: 'datetime',
		DATETIME_LOCAL: 'datetime-local',
		COLOR: 'color'
	}
}()

///**
// * @param element
// * @param transformer
// *
// * @properties={typeid:24,uuid:"3E793967-80F4-4531-A66B-A3009CA538FD"}
// */
//function addMarkupTransformerBehavior(element, transformer) {
//	var behavior = new Packages.org.apache.wicket.markup.transformer.AbstractTransformerBehavior({
//		transform: transformer
//	})
//	unwrapElement(element).add(behavior)
//}

/**
 * @param {String} url
 * @param {RuntimeComponent|RuntimeForm} [element]
 * @param {Boolean} [disableAutoAdjustProtocol] Disable auto adjustment of http or https protocols in the URL to match the protocol under which the Web Client runs. Default: false
 *
 * @properties={typeid:24,uuid:"3FFD6F91-CE66-4337-9E52-2A7CC5ECF295"}
 */
function addJavaScriptDependancy(url, element, disableAutoAdjustProtocol) {
	addResourceDependancy(url, element, disableAutoAdjustProtocol, true)
}

/**
 * @param {String} url
 * @param {RuntimeComponent|RuntimeForm} [element]
 * @param {Boolean} [disableAutoAdjustProtocol] Disable auto adjustment of http or https protocols in the URL to match the protocol under which the Web cLient runs. Default: false
 *
 * @properties={typeid:24,uuid:"84B8B212-C873-465F-8F2C-EE74A466CEC6"}
 */
function addCSSDependancy(url, element, disableAutoAdjustProtocol) {
	addResourceDependancy(url, element, disableAutoAdjustProtocol, false)
}

//function removeCSSDependancy(url, element) {
//	checkOperationSupported()
//
//	//branching based on existence of addGlobalResourceReference on the page contributor to inject resources globally or on the current pageContributor
//	if (!element && getWebClientPluginAccess().getPageContributor().addGlobalJSResourceReference) {
//		if (url.indexOf(MEDIA_URL_PREFIX) != 0) {
//			url = convertToExternalURL(url, disableAutoAdjustProtocol)
//		}
//		getWebClientPluginAccess().getPageContributor().removeGlobalResourceReference(url)
//	} else {	
//		var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
//				renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
//					if (isJSResource) {
//						response.renderJavascriptReference(convertToExternalURL(url, disableAutoAdjustProtocol))
//					} else {
//						response.renderCSSReference(convertToExternalURL(url, disableAutoAdjustProtocol))
//					}
//				}
//			})
//		)
//		
//		/**@type {Packages.org.apache.wicket.Component}*/
//		var target = element ? unwrapElement(element) : getWebClientPluginAccess().getPageContributor()
//		target.getBehaviors()
//		target.removeBehavior(arg0)
//	}	
//}

/**
 * @private
 * @param {String} url
 * @param {RuntimeComponent|RuntimeForm} element
 * @param {Boolean} disableAutoAdjustProtocol
 * @param {Boolean} isJSResource
 * 
 * @properties={typeid:24,uuid:"7E5B794B-3BDD-4A17-86E7-7E14BCC6D94A"}
 */
function addResourceDependancy(url, element, disableAutoAdjustProtocol, isJSResource) {
	checkOperationSupported()
	
	//branching based on existence of addGlobalResourceReference on the page contributor to inject resources globally or on the current pageContributor
	if (!element) {
		if (getWebClientPluginAccess().getPageContributor().addGlobalJSResourceReference) {
			if (url.indexOf(MEDIA_URL_PREFIX) === 0) {
				url = convertToExternalURL(url, disableAutoAdjustProtocol)
			}
			if (isJSResource) {
				getWebClientPluginAccess().getPageContributor().addGlobalJSResourceReference(url)
			} else {
				getWebClientPluginAccess().getPageContributor().addGlobalCSSResourceReference(url)
			}
		} else {
			log.warn('Resource "' + url + '" is added to the current JSWindow only. Requires Servoy 7.3 to add the resource to all current and future JSWindows')
		}
	} else {	
		var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
				renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
					if (isJSResource) {
						response.renderJavascriptReference(convertToExternalURL(url, disableAutoAdjustProtocol))
					} else {
						response.renderCSSReference(convertToExternalURL(url, disableAutoAdjustProtocol))
					}
				}
			})
		)
		
		addBehavior(contributor, element)
		
	}
}

/**
 * Converts Media URL's to relative URL's for usage inside the Web CLient
 * @param {String} mediaUrl
 * @return {String}
 *
 * @properties={typeid:24,uuid:"B8C949DD-494F-4352-9BC7-1DA7FE0A404E"}
 */
function getExternalUrlForMedia(mediaUrl) {
	if (mediaUrl.indexOf(MEDIA_URL_PREFIX) !== 0) {
		return mediaUrl
	}
	var media = solutionModel.getMedia(mediaUrl.substr(MEDIA_URL_PREFIX.length))
	if (media === null) {
		log.warn('Could not locate "' + mediaUrl + '" in the media library for inclusion in the Web Client markup')
		return '#'
	} 
	
	/**@type {java.lang.Object}*/
	var bytes = media.bytes
	
	var resourceReference = new Packages.org.apache.wicket.ResourceReference("media");
	var request = Packages.org.apache.wicket.RequestCycle.get().getRequest();
	var requestParameters = request.getRequestParameters();
	var urlDept = requestParameters.getUrlDepth();
	var baseUrl
	try {
		// set the url dept to 0, it should always just be ?xxx without ../../
		requestParameters.setUrlDepth(0);
		if (request instanceof Packages.org.apache.wicket.protocol.http.servlet.ServletWebRequest) {
			request['setWicketRedirectUrl']("");
		}
		baseUrl = Packages.org.apache.wicket.RequestCycle.get().urlFor(resourceReference)
	} finally {
		requestParameters.setUrlDepth(urlDept);
	}
	
	//Branching based on Build Number: as of Servoy 7.4 Final Servoy supports directory URL's for media lib entries, allowing relative urls's in for example stylesheets referencing an image in a subfolder
	if (getWebClientPluginAccess().getReleaseNumber() <= 2025) {
		mediaUrl += '&amp;hc=' + bytes.hashCode()
		return mediaUrl.replace(MEDIA_URL_PREFIX, baseUrl + '?s=' + application.getSolutionName() + '&amp;id=')
	} else {
		mediaUrl += '?hc=' + bytes.hashCode()
		return mediaUrl.replace(MEDIA_URL_PREFIX, baseUrl + '/' + application.getSolutionName() + '/')		
	}
}

/**
 * @private 
 * @param {String} url
 * @param {Boolean} [disableAutoAdjustProtocol] Disable auto adjustment of http or https protocols in the URL to match the protocol under which the Web cLient runs. Default: false
 *
 * @return {String}
 *
 * @properties={typeid:24,uuid:"C6EC0C48-2E49-46A7-A630-E162626FB362"}
 */
function convertToExternalURL(url, disableAutoAdjustProtocol) { 
	//Maybe instead we should use protocol-less URLS, like mentioned here: http://stackoverflow.com/questions/12069156/protocol-less-urls
	if (url.indexOf(MEDIA_URL_PREFIX) !== 0) {
		//Replace http with https when the WC is running under https, to prevent mixed content warnings in the browser
		if (!disableAutoAdjustProtocol && url.substr(0,4) === 'http') {
			var requiredProtocol = scopes.svyNet.parseUrl(application.getServerURL()).protocol
			var usedProtocol = scopes.svyNet.parseUrl(url).protocol
			if (usedProtocol !== requiredProtocol) {
				return requiredProtocol + url.substr(usedProtocol.length)
			}
		}
		return url
	}
	return getExternalUrlForMedia(url)
}

/**
 * Executes the supplied JavaScript code string in the browser on the next render cycle
 * @param {String} script
 * @param {JSWindow|String} [window] The specific JSWindow to execute the code in
 *
 * @properties={typeid:24,uuid:"125243AB-90B0-424A-8CFD-338584E0E10A"}
 */
function executeClientsideScript(script, window) {
	checkOperationSupported()
	if (!script) return
	script = utils.stringTrim(script)
	if (script.charAt(-1) !== ';') {
		script += ';'
	}
	//TODO: test passing null value for main window
	//TODO: write unittest for non-public API usage
	if (typeof window !== 'undefined') {
		/** @type {String} */
		var windowName = window instanceof JSWindow ? window.getName() : window === 'null' ? null : window
		/** @type {Packages.com.servoy.j2db.FormManager} */
		var fm = getWebClientPluginAccess().getFormManager()
		/** @type {Packages.com.servoy.j2db.server.headlessclient.MainPage} */
		var mp = fm.getMainContainer(windowName)
		mp.getPageContributor().addDynamicJavaScript(script)
	} else {
		getWebClientPluginAccess().getPageContributor().addDynamicJavaScript(script);
	}
}

/**
 * @experimental: implementation might change
 * TODO: determine if ID can be optional and then auto generate one
 * TODO: figure out how to generate small unique ID's (how does Servoy do this?)
 * @param {String} code
 * @param {String} id
 * @param {RuntimeComponent|RuntimeForm} element
 *
 * @properties={typeid:24,uuid:"7E3B4734-F5C3-454E-B239-7EC81DC4F9D9"}
 */
function addDynamicJavaScript(code, id, element) {
	checkOperationSupported()
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderJavascript(code, id) 
			}
		})
	)
	addBehavior(contributor, element)
}

/**
 * @experimental: implementation might change
 * Executes JavaScript right after the DOM is built, before external resources (e.g. images) are loaded.
 * 
 * TODO: figure out if correctly implemented: every ajax update executed the code again, so no good for init logic like keyboard shortcuts for example
 * @param {String} code
 * @param {RuntimeComponent|RuntimeForm} [element]
 *
 * @properties={typeid:24,uuid:"A37ACBC3-8F68-48E8-AEC5-C1F00739CDAA"}
 */
function addOnDOMReadyScript(code, element) {
	checkOperationSupported()
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderOnDomReadyJavascript(code) 
			}
		})
	)
	addBehavior(contributor, element)
}

/**
 * @experimental: implementation might change
 * Executes JavaScript after the entire page is loaded.
 * TODO: figure out if correctly implemented: every ajax update executed the code again, so no good for init logic like keyboard shortcuts for example
 * @param {String} code
 * @param {RuntimeComponent|RuntimeForm} [element]
 *
 * @properties={typeid:24,uuid:"DB2D9CFF-410E-489A-BE5B-2EF83F8FFC18"}
 */
function addOnLoadScript(code, element) {
	checkOperationSupported()
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderOnLoadJavascript(code) 
			}
		})
	)
	addBehavior(contributor, element)
}

/**
 * Marks an element as rendered, which means that Wicket will disregard any changes made to the element up to this point since the last render cycle when it is time to render the element again<br>
 * <br>
 * Can be useful when syncing the element state from the browser to the server and then to prevent Wicket from updating the browser representation of the element again
 * 
 * @param {RuntimeComponent} element
 *
 * @properties={typeid:24,uuid:"C42BB2DB-ECAE-4DFE-BD61-FF1A13EE30EB"}
 */
function setRendered(element) {
	var tmp = unwrapElement(element)
	if (tmp instanceof Packages.com.servoy.j2db.ui.IProviderStylePropertyChanges) {
		/** @type {Packages.com.servoy.j2db.ui.IProviderStylePropertyChanges} */
		var tmp2 = tmp
		tmp2.getStylePropertyChanges().setRendered()
	}
}

/**
 * Returns the value of the ID attribute of the element in the browser
 * @param {RuntimeComponent|RuntimeForm} element
 * @return {String}
 *
 * @properties={typeid:24,uuid:"B705A7B3-CA51-4494-A207-1C31559DA437"}
 */
function getElementMarkupId(element) {
	checkOperationSupported()
	return unwrapElement(element).getMarkupId()
}

/**
 * TODO: deprecate as of Servoy 8, see {@link https://support.servoy.com/browse/SVY-7804}
 * @param {RuntimeComponent} element
 * @return {String}
 *
 * @properties={typeid:24,uuid:"3BB9D4B3-CA3F-4EC7-AF5A-90895FD701FF"}
 * @SuppressWarnings(wrongparameters)
 */
function getFormName(element) {
	checkOperationSupported()
	var component = unwrapElement(element)
	/** @type {Packages.com.servoy.j2db.server.headlessclient.WebForm}*/
	var form = component.findParent(Packages.com.servoy.j2db.IFormUIInternal)
	if (form) {
		return form.getFormContext().getValue(1,2).toString()
	}
	return null
}

/* 
 * Goal of the callbacks:
 * - don't rely on WCUtils plugin
 * - Don't expose values set serverside to be included in the callback on the clientside
 * - allow adding/removing
 * - support any possible value in the queryString
 * - Support returning values back to the client
 * - Allow developers to control every aspect of the response
 * 
 * http://stackoverflow.com/questions/162911/how-do-i-call-java-code-from-javascript-code-in-wicket
 */
/**
 * @experimental: Is not covered by tests and signature might change in the future
 *
 * Generates a URL that can be used from within the browser in a Web Client to invoke a method in the serverside part of the same Web Client<br/>
 * <br/>
 * The generated URL can be used for example using JQuery's Ajax API to call a method on the server and get the returnValue from the invoked method back as response<br>
 * <br>
 * This method is low level, allowing a lot of control. For a more straightforward callback, see {@link #getCallbackScript}<br/>
 * @param {function|String} callback Either a Servoy method or a qualifiedName string pointing to a method. Method's first argument receives the bodyContent, second argument the requestParams
 * 
 * @example <pre>
 * \/\/On the Server
 * var url = scopes.svyWebClientUtils.getCallbackUrl(myMethod)
 * 
 * \/\/On the client
 * $.ajax({
 *   type: "POST",
 *   url: callbackUrl,
 *   data: 'hello',
 *   success: function(data, textStatus,  jqXHR) {
 * 	  alert(data)
 *   }
 * });
 * </pre
 * 
 * @properties={typeid:24,uuid:"958C4A78-CE1A-479C-B9BE-711B1AACAD5D"}
 */
function getCallbackUrl(callback) {
	checkOperationSupported()
	var callbackObject = generateCallback(callback, null, {returnCallbackReturnValue: true, supplyBody: true,supplyAllArguments: true})
	return callbackObject.url + "&" + callbackObject.methodHash
}

/**
 * @experimental: Is not covered by tests and signature might change in the future
 *  
 * Generates a JavaScript code snippet that when invoked in the client (browser) executes the supplied callback method on the server
 * 
 * @param {String|function} callback Either a Servoy method or a qualifiedName string pointing to a method.
 * @param {Array<String|Number|Boolean>} [args] String values are considered references to browser-side variables. To pass hardcoded String literals the String value needs to be quoted: '"myvalue"' or "'myValue'". All other values are considered hardcoded values as well and will get serialized using JSON
 * @param {Boolean} [options.showLoading] Whether or not to show the Loading indicator
 * @param {String} [options.mimeType] Forces a certain mimeType in the response
 *
 * @properties={typeid:24,uuid:"A16EEE7F-85BE-4649-8E84-1CE50E9C96A6"}
 */
function getCallbackScript(callback, args, options) {
	checkOperationSupported()
	options = options||{}
	options.returnCallbackReturnValue = false
	
	//using POST because the final callback might contain more data than the URL size limit
	//wicketAjaxPost(url, body, successHandler, failureHandler, preCondition, channel)
	var callbackParts = generateCallback(callback, args, options)
	var script = "wicketAjaxPost('" + callbackParts.url + "','" + callbackParts.methodHash + "'" + callbackParts.parameterCode
	if (options.showLoading) {
		var handler = ', function(){Wicket.hideIncrementally(\'indicator\')}'
		script += handler + handler + ',' + 'function(){Wicket.showIncrementally(\'indicator\');return true}'
	}
	return script + ')'
}

/**
 * @private 
 * @type {{getUrlForCallback: function(String, Array<Object>, Object):{url:String,methodHash:String,parameterCode:String}}}
 * @extends {Packages.org.apache.wicket.behavior.AbstractAjaxBehavior}
 *
 * @properties={typeid:35,uuid:"12E48C24-04C6-4B95-B07F-4E3174AC0045",variableType:-4}
 */
var callBackBehavior

/**
 * @private
 * @return {{getUrlForCallback: function(String, Array<Object>, Object):{url:String,methodHash:String,parameterCode:String}}}
 * @properties={typeid:24,uuid:"0A075A5F-4951-485E-BA4A-611ACD31CC13"}
 */
function getCallbackBehavior() {
	if (callBackBehavior) {
		return callBackBehavior
	} else {
		var AjaxBehaviorImpl = {
			/**
			 * TODO: add Date support for the args param?
			 * @param {String} qualifiedName
			 * 
			 * @param {Array<String|Boolean|Number>} args Quoted string values are considered hardcoded String values. Non-quoted String values are considered variable names to be evaluated clientside. All other values are considered hardcoded values as well and will get serialized using JSON
			 * 
			 * @param {String} [options.id]
			 * 
			 * @param {String} [options.mimeType] To force a certain mimeType in the response
			 * 
			 * @param {Boolean} [options.returnCallbackReturnValue] Whether or not to return the returnValue of the callback method as body in the HTTPResponse. 
			 * If set to true, options.disableImmediateUpdate will be ignored 
			 * 
			 * @param {Boolean} [options.disableImmediateUpdate] If true, the callback will not result in a Wicket response to update the UI in the client
			 * 
			 * @param {Boolean} [options.supplyAllArguments] By default only the array passed in for the "args" parameter will be applied to the callback. 
			 * If this option is set to true, any queryParameter appended to the callback URL will also be returned.
			 * This does change the structure of the arguments passed into the callback from an Array<> to Object<Array>
			 * 
			 * @param {Boolean} [options.supplyBody] whether or not to supply the content of the body as first param
			 */
			getUrlForCallback: function(qualifiedName, args, options) {
				var settings = {m: qualifiedName, f:0}
				if (options.hasOwnProperty('mimeType')) {
					settings.mt = options.mimeType
				}
				if (options.disableImmediateUpdate === true) {
					settings.f = settings.f | 1
				}
				if (options.returnCallbackReturnValue === true) {
					settings.f = settings.f | 2
				}
				if (options.supplyAllArguments === true) {
					settings.f = settings.f | 4
				}
				if (options.supplyBody === true) {
					settings.f = settings.f | 8
				}
				
				var paramString = '';
				if (args !== null) {
					if (Array.isArray(args)) {
						settings.a = [] //Array holding hardcoded param values 
						settings.p = [] //Array holding positions of params that need to be evaluated clientside. Storing the positions so their values can be merged into the arguments array in onRequest
						for (var index = 0; index < args.length; index++) {
							/** @type {Object}*/
							var value = args[index]
							if (value !== null) {
								try {
									var val = utils.stringTrim(value.toString());
									if (val.slice(0, 1) === val.slice(-1) && ["'",'"'].indexOf(val.slice(0,1)) !== -1) { //Double quoted String value, considered a String literal
										settings.a[index] = val.slice(1,-1)
									} else if ('string' !== typeof value) { //non-string value
										settings.a[index] = val
									} else { //String value: considered to be the name of a variable to be resolved clientside
										paramString += "+\'&p='+encodeURIComponent(" + val + ")"; 
										settings.p.push(index)
									}
								} catch (ex) {
									log.debug(ex);
								}
							}
						}
					} else {
						//TODO: support for passing an object as argument
					}
				}

				//** @type {Packages.org.apache.wicket.protocol.http.WebRequest} */
				var request = Packages.org.apache.wicket.RequestCycle.get().getRequest();
				
				var requestParameters = request.getRequestParameters();
				var urlDept = requestParameters.getUrlDepth();
				try {
					// set the url dept to 0, it should always just be ?xxx without ../../
					requestParameters.setUrlDepth(0);
					if (request instanceof Packages.org.apache.wicket.protocol.http.servlet.ServletWebRequest) {
						request['setWicketRedirectUrl'](""); //TODO: use inline typing if available
					}
					
					//Encryption
					var urlCrypt = Packages.org.apache.wicket.Application.get().getSecuritySettings().getCryptFactory().newCrypt()
					var cryptedString = Packages.org.apache.wicket.protocol.http.WicketURLEncoder.QUERY_INSTANCE.encode(urlCrypt.encryptUrlSafe(JSON.stringify(settings)))
					return {
						url: this.getComponent().urlFor(this, Packages.com.servoy.j2db.server.headlessclient.AlwaysLastPageVersionRequestListenerInterface.INTERFACE),
						methodHash: 'm=' + cryptedString,
						parameterCode: paramString 
					}
				} finally {
					requestParameters.setUrlDepth(urlDept);
				}
			},
			onRequest: function() {
				var requestCycle = Packages.org.apache.wicket.RequestCycle.get();
				/**
				 * @type {Packages.org.apache.wicket.protocol.http.WebRequest}
				 */
				var request = requestCycle.getRequest();

				var param = request.getParameter("m");  
				if(param === null){
					throw scopes.svyExceptions.IllegalStateException('Invalid callback url');
				}
				
				//Decryption
				var urlCrypt = Packages.org.apache.wicket.Application.get().getSecuritySettings().getCryptFactory().newCrypt();
				
				/** 
				 * m = qualifiedName of callbackMethod
				 * mt = mimeType
				 * f = binary flags for several Boolean options
				 * a = Array of hardcoded argument values to pass into the callback
				 * p= Array with positions where clientside evaluated arguments values need to be put in the arguments array passed into the callback method
				 * 
				 * @type {{
				 * 	m: String, 
				 *  mt: string=,
				 *  f: Number,
				 *  a: Array=,
				 *  p: Array<Number>=,
				 * }} */
				var options = JSON.parse(urlCrypt.decryptUrlSafe(param));

				var hasDeveloperProvidedArguments = Array.isArray(options.a) //Developer provided arguments when generating the callback
				var requestArgs
				var ps
				if (options.f & 4) { //supplyAllArguments: also return additional params tagged onto the callback URL
					var map = request.getParameterMap()
					map.remove("m")
					var mapArray = map.keySet().toArray()
					var objs = {}
					for (var i = 0; i < mapArray.length; i++) {
						/** @type {Array<String>} */
						var value = map.get(mapArray[i]);
						if (value !== null) {
							objs[mapArray[i]] = Array.prototype.slice.call(value);
						}
					}
					if (hasDeveloperProvidedArguments) {
						ps = objs.p||[]
						objs.p = options.a
					}
					requestArgs = [objs]
				} else if (hasDeveloperProvidedArguments) { //Only supply the arguments as defined when generating the callback URL
					ps = request.getParameters("p") //the values specified by the developer to evaluate clientside
					requestArgs = options.a //the hardcoded values provided by the developer
				} else {
					requestArgs = []
				}
				
				if (hasDeveloperProvidedArguments && options.p.length) {
					//Splice the argument values evaluated on the client into options.a
					for (var index = 0; index < options.p.length; index++) {
						options.a[options.p[index]] = ps[index]
					}
				}

				/** @type {javax.servlet.http.HttpServletRequest} */
				var hsr = request.getHttpServletRequest(); 
				//TODO: support for multiPart posts
				if (options.f & 8) { //supplyBody
					try { 
						var br = hsr.getReader(); 
						var tmp = null;
						var bodyContent = ""; 
						while ((tmp = br.readLine()) !== null) {
							bodyContent += tmp + "\n";
						}
		
						if (bodyContent !== null) { 
							if (requestArgs === null) {
								requestArgs = [bodyContent];
							} else {
								requestArgs.splice(0, 0, bodyContent)
							}
						} 
					} catch (ex) { 
						log.debug('Failed to read the body content of the incomming callback request' + ex); 
					}
				}
				
				try {
					var args = []
					args.push(options.m, requestArgs||[])
					/** @type {*} */
					var o = getWebClientPluginAccess().executeMethod('scopes.svySystem', 'callMethod', args, false) //String context, String methodname, Object[] arguments, final boolean async

					
					if (options.f & 2) { //returnCallbackReturnValue
						var retval
						var mimeType
						if (o instanceof XML) {
							mimeType = 'application/xml'
							retval = o.toXMLString()
						} else {
							mimeType = 'application/json'
							retval = JSON.stringify(o) //TODO: wrap in try/catch for catching TypeError's on cyclic structures
						}
						if (options.mt) {
							mimeType = options.mt
						}
						var stringTarget = new Packages.org.apache.wicket.request.target.basic.StringRequestTarget(mimeType, "utf-8", retval)
						requestCycle.setRequestTarget(stringTarget);
					} else {
						if (hsr.getMethod() === 'GET') {
							log.warn('Callback received with method GET while callback is configured to not return a value')
						}
						/** @type {Packages.org.apache.wicket.protocol.http.WebApplication} */
						var app = this.getComponent().getApplication();
						var ajaxTarget = app.newAjaxRequestTarget(this.getComponent().getPage());
						requestCycle.setRequestTarget(ajaxTarget);
						
						if (!(options.f & 1)) { //disableImmediateUpdate
							// update client state
							Packages.com.servoy.j2db.server.headlessclient.dataui.WebEventExecutor.generateResponse(ajaxTarget, ajaxTarget.getPage());
						}
					}
				} catch (e) {
					log.error('Exception thrown in callbackMethod', e)
					var statusCode = plugins.http.HTTP_STATUS.SC_INTERNAL_SERVER_ERROR
					var message = ''
					if (typeof e === 'number') {
						statusCode = e
					} else if (scopes.svyJSUtils.isObject(e)) {
						statusCode = e['statusCode']
						message = e['message']
					} else {
						message = e
					}
					var errorTarget = Packages.org.apache.wicket.protocol.http.request.WebErrorCodeResponseTarget(statusCode, message)
					requestCycle.setRequestTarget(errorTarget);
				}
			}
		}
		
		var pageContributor = getWebClientPluginAccess().getPageContributor()
		if (pageContributor.getBehavior(BAP_CALLBACK_BEHAVIOR_ID)) {
			pageContributor.removeBehavior(BAP_CALLBACK_BEHAVIOR_ID)
		}
		callBackBehavior = new Packages.org.apache.wicket.behavior.AbstractAjaxBehavior(AjaxBehaviorImpl)
		return callBackBehavior
	}
}

/**
 * @private 
 *
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6F41FE34-0E9B-43A0-B680-133D18255A6C"}
 */
var BAP_CALLBACK_BEHAVIOR_ID = 'com.servoy.bap.callbackBehavior'

/**
 * Utility to create callback code for both getCallbackScript and getCallbackUrl. Maybe should be inlined, as too many code branches based on usage
 * @private
 *
 * @param {String|function} callback
 * @param {Array} [args] String values are considered references to browser-side properties. To pass hardcoded String literals the String value needs to be double quoted: '"myvalue"' or "'myValue'"
 * @param {{
 * 	mimeType: String=,
 *  disableImmediateUpdate: Boolean=,
 *  returnCallbackReturnValue: Boolean=,
 *  supplyAllArguments: Boolean=
 * }} [options]
 *
 * @return {{
 * 	url: String,
 * 	methodHash: String,
 *  parameterCode: String
 * }}
 * 
 * @properties={typeid:24,uuid:"45739F09-DBC5-40FA-BC3C-03D01FC5B3DD"}
 */
function generateCallback(callback, args, options) {
	/**
	 * @type {String}
	 */
	var qualifiedName
	switch (typeof callback) {
		case 'function':
			var fd
			try {
				fd = new Packages.com.servoy.j2db.scripting.FunctionDefinition(callback)
			} catch (e) {}
			
			if (!fd || fd.exists(getWebClientPluginAccess()) !== Packages.com.servoy.j2db.scripting.FunctionDefinition.Exist.METHOD_FOUND) {
				throw scopes.svyExceptions.IllegalArgumentException('Callback param must be a Servoy defined method')
			}
			qualifiedName = fd.toMethodString()
			if (['scopes','globals'].indexOf(qualifiedName.substring(0, qualifiedName.indexOf('.'))) === -1) {
				qualifiedName = 'forms.' + qualifiedName
			}
			break;
		case 'string':
			qualifiedName = callback
			break;
		default:
			throw new scopes.svyExceptions.IllegalArgumentException('Invalid value for calback parameter: ' + callback)
	}

	var callbackBehavior = getCallbackBehavior()
	
	/**@type {Packages.org.apache.wicket.behavior.IBehavior}*/
	var iBehavior = callbackBehavior
	
	getWebClientPluginAccess().getPageContributor().addBehavior(BAP_CALLBACK_BEHAVIOR_ID, iBehavior)
	return callbackBehavior.getUrlForCallback(qualifiedName, args, options||{})
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"C678DA5D-2572-447B-9C40-D16CDFDF7EF2",variableType:-4}
 */
var initGetCallbackScript = function(){
	getCallbackScript.MIME_TYPES = {
		TEXT: 'application/text',
		JSON: 'application/json',
		XML: 'application/xml'
		//BINARY: 'application.binary' TODO: check , implement and add
	}
}()

/**
 * Utility method to get PluginAccess
 * @private
 * @return {Packages.com.servoy.j2db.server.headlessclient.IWebClientPluginAccess}
 * @SuppressWarnings(wrongparameters)
 * @properties={typeid:24,uuid:"AF74EA3D-B2EB-41EC-A333-D806D7972FA5"}
 */
function getWebClientPluginAccess() {
	var x = new Packages.org.mozilla.javascript.NativeJavaObject(globals, plugins.window, new Packages.org.mozilla.javascript.JavaMembers(globals, Packages.com.servoy.extensions.plugins.window.WindowProvider));
	return x['getClientPluginAccess']();
}

/**
 * @private
 * @param {Packages.org.apache.wicket.behavior.IBehavior} behavior
 * @param {RuntimeComponent|RuntimeForm} [component]
 * 
 * @properties={typeid:24,uuid:"08CB25D8-80EA-4BC5-BC73-2E15C5DC36A8"}
 */
function addBehavior(behavior, component) {
	/**@type {Packages.org.apache.wicket.Component}*/
	var target = component ? unwrapElement(component) : getWebClientPluginAccess().getPageContributor()
	target.add(behavior)
	if (target instanceof Packages.com.servoy.j2db.ui.IProviderStylePropertyChanges) {
		/** @type {Packages.com.servoy.j2db.ui.IProviderStylePropertyChanges} */
		var tmp = target
		tmp.getStylePropertyChanges().setChanged()
	}
}

/**
 * Utility method to gain access to the underlying Java Wicket Component in order to access more low level API<br/>
 * <br/>
 * <b>WARNING</b> Use with utmost care. This method exposes low level Java API that is powerfull, but when used inappropriatly can cause all kind of issues. 
 * The exposed API is NOT part of the public Servoy Scripting API. Use at own risk.
 * <br/>
 * <br/>
 * @SuppressWarnings(wrongparameters)
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 *
 * @return {Packages.org.apache.wicket.Component}
 *
 * @properties={typeid:24,uuid:"60FD0C93-55A0-4E4E-AA5B-42F037E42A49"}
 */
function unwrapElement(component) {
	/**@type {Packages.org.apache.wicket.Component}*/
	var wicketComponent;
	
	if (component instanceof RuntimeForm) {
		//Using reflection because Servoy's WrapFactory prevents access to the unwrapped FormController
		//and only the FormController has access to the FormUI
		//The impl. below works, because it grabs the FormController class and not an instance of it
		wicketComponent = unwrapElement(Packages.com.servoy.j2db.FormController)['getMethod']('getFormUI').invoke(component).get('servoywebform')
	} else {
		var list = new Packages.java.util.ArrayList();
		list.add(component)
		wicketComponent = list.get(0)
		//Take care of some components that are wrapped another way so the ArrayList unwrapping doesn't work. For example ComboBoxes
		if (wicketComponent instanceof Packages.org.apache.wicket.Component && !wicketComponent.add) {
			wicketComponent = new Packages.org.mozilla.javascript.NativeJavaObject(globals, wicketComponent, new Packages.org.mozilla.javascript.JavaMembers(globals, Packages.org.apache.wicket.Component))
	}
	}
	return wicketComponent
}

/**
 * Converts an HTML document of type XML to a String and strips out the CDATA tags 
 * @param {XML} XHTML
 * @return {String}
 *
 * @properties={typeid:24,uuid:"26CDCAAA-EAA8-486D-A3BC-30FA83E94DB2"}
 */
function XHTML2Text(XHTML) {
	return XHTML.toXMLString().replace(/<!\[CDATA\[/g,'').replace(/]]>/g,'')
}

/**
 * Returns Wicket clientinfo object
 * 
 * @returns Packages.org.apache.wicket.protocol.http.request.WebClientInfo
 * @properties={typeid:24,uuid:"B4A9F2EE-4A3C-41F9-A767-381B83538309"}
 */
function getBrowserInfo() {
	checkOperationSupported()
	//CHECKME: why is https://support.servoy.com/browse/SVY-1285 using a different class?
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo}*/
	var clientInfo = Packages.org.apache.wicket.protocol.http.WebRequestCycle.get().getClientInfo();
	return clientInfo;
}

/**
 * Allows to set the inactive session timeout for this webclient only
 * @param {Number} timeOut the session timeout interval in milliseconds
 * @properties={typeid:24,uuid:"2CF23729-A1C2-4A58-89E2-DE78EC962833"}
 */
function setSessionTimeout(timeOut) {
	checkOperationSupported()
	/**@type {Packages.org.apache.wicket.protocol.http.WebRequest}*/
	var request = Packages.org.apache.wicket.RequestCycle.get().getRequest()
	
	/** @type {Packages.javax.servlet.http.HttpSession}*/
	var session = request.getHttpServletRequest().getSession();
	session.setMaxInactiveInterval(timeOut);
}

/**
 * @param {Boolean} state
 * @properties={typeid:24,uuid:"2CE6512E-555E-4BBF-A764-A3C404F2AD6A"}
 */
function setWicketDebugMode(state) {
	checkOperationSupported()
	Packages.org.apache.wicket.Application.get().getDebugSettings().setAjaxDebugModeEnabled(state);
}

/**
 * @param {String} name property name
 * @param {String} value property value
 * @param {Number} validity validity in seconds
 *
 * @properties={typeid:24,uuid:"6797F6A1-0D0F-4B3A-87F9-642FAB9D78C1"}
 */
function setTimeBoundUserProperty(name, value, validity) {
	checkOperationSupported()
	/** @type {Packages.org.apache.wicket.protocol.http.WebRequestCycle}*/
	var request = Packages.org.apache.wicket.RequestCycle.get()
	var cookies = request.getWebRequest().getCookies();
	
	for (var index = 0; index < cookies.length; index++) {
		if (cookies[index].getName().equals(name)) {
			//CHECKME: these values aren't used. Does everything work regardless? If so, remove the code
			//Getting all the values of the cookie, removing the Cookie from the WebResponse and adding it again, as the WebResponse doesn't support getting existing Cookies
//			var encodedValue = cookies[index].getValue()
//			var domain = cookies[index].getDomain()
//			var path = cookies[index].getPath()
			cookies[index].setPath('/servoy-webclient/')
			request.getWebResponse().clearCookie(cookies[index]);
		}
	}
	value = value||''
	if (value) {
		var newCookie = new Packages.javax.servlet.http.Cookie(name, 'B64p_' + Packages.com.servoy.j2db.util.Utils.encodeBASE64(new java.lang.String(value).getBytes()))
		if (validity) newCookie.setMaxAge(validity)
//This should work, as the mentioned case is fixed
//		//TODO: remove this hack when https://support.servoy.com/browse/SVY-1185 is solved
//		newCookie.setPath('/servoy-webclient/')
		request.getWebResponse().addCookie(newCookie);
	}
}

/**
 * Used by the updateUI Web Client polyfill 
 * @private 
 * @type {Continuation}
 *
 * @properties={typeid:35,uuid:"57D5F02A-08DC-40F3-BE5B-6360190C8418",variableType:-4}
 */
var c;

/**
 * Used by the updateUI Web Client polyfill 
 * @private 
 * @type {Continuation}
 *
 * @properties={typeid:35,uuid:"78C02CA0-BC14-4B4D-8D42-10224DED1D81",variableType:-4}
 */
var terminator = new Continuation()

/**
 * Web Client compatible application.updateUI polyfill
 * Warning: use with care, can result in unpredictable behavior when used in the wrong event types or at the right moment
 * TODO move out of svyWebClientUtils, as it is not WC specific
 * @param {Number} [milliseconds]
 * 
 * @properties={typeid:24,uuid:"4651696E-4E25-49B1-A2FE-EB561A859F5A"}
 */
function updateUI(milliseconds) {
	checkOperationSupported()
	if (scopes.svySystem.isWebClient()) {
      c = new Continuation();
      executeClientsideScript(getCallbackScript(updateUIResume)); 
      terminator();
   } else {
      application.updateUI(milliseconds)
   }
}

/**
 * Used by the updateUI Web Client polyfill 
 * @private 
 * @param {String} body
 * @param {Array<String>} requestParams
 * @return {undefined}
 * 
 * @properties={typeid:24,uuid:"06BE500F-780A-4DA4-855B-605F2E2CE83F"}
 */
function updateUIResume(body, requestParams) {
   c();
}
/**
 * Forces a TableView header to update, so any header texts that depend on display tags are rerendered
 * @param {RuntimeForm} form
 * @return {Boolean} Whether update was successful
 *
 * @properties={typeid:24,uuid:"C801BA0C-30B7-4DC8-9FB4-7ED03A1676A1"}
 */
function forceTableViewColumnHeaderWithTagsUpdate(form) {
	checkOperationSupported()
	var component = scopes.svyWebClientUtils.unwrapElement(form)
	/** @type {java.lang.Class} */
	var classToFind = Packages.com.servoy.j2db.IFormUIInternal;
	/** @type {Packages.com.servoy.j2db.server.headlessclient.WebForm}*/
	var webForm = component.findParent(classToFind)
	
	if(webForm) {
		/**@type {Packages.org.apache.wicket.markup.html.WebMarkupContainer}*/
		var servoyWebForm = webForm.get('servoywebform')
		if (servoyWebForm) {
			/**@type {Packages.com.servoy.j2db.server.headlessclient.dataui.WebCellBasedView}*/
			var view = servoyWebForm.get('View')
			if (view) {
				/**@type {Packages.com.servoy.j2db.server.headlessclient.dataui.SortableCellViewHeaders}*/
				var header = view.get('header')
				header.getStylePropertyChanges().setChanged()
				return true
			}
		}
	}
	return false
}