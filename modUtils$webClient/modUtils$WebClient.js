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
 * TODO: document the exact behavior of the different ways to include some custom JS (when fired, how often)
 * TODO: support Arrays of elements/components besides single elements/components to attach certain behaviors to.
 * TODO: callback behaviors
 */

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C3ADC3E6-A4EC-42E3-B9DC-4B1D9637B6F9"}
 */
var MEDIA_URL_PREFIX = 'media:///'

/**
 * @private
 * @properties={typeid:24,uuid:"9287AC01-F11F-4949-BC4C-1C01F04D41D4"}
 */
function checkOperationSupported() {
	if (!scopes.modUtils$system.isWebClient()) {
		throw new scopes.modUtils$exceptions.UnsupportedOperationException('Only supported in Web Client')
	}
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
	var model = Packages.org.apache.wicket.model.Model('left: 50%;margin-left:-' + element.getWidth() / 2 + 'px;')
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, '')
	unwrapElement(element).add(behavior)
}

/**
 * Sets the visibility of components in the browser. This means that all the markup is included, but is also hidden.
 * Note: uses the CSS display property and not the CSS visibility property, as Servoy uses the visibility property internally
 * 
 * @param {RuntimeComponent} component
 * @param {Boolean} visibility
 *
 * @properties={typeid:24,uuid:"8421ED23-0497-4D0F-9CEE-71F543FF0838"}
 */
function setComponentVisibility(component, visibility) {
	checkOperationSupported()
	var style = visibility ? 'display: block' : 'display: none'
	var model = Packages.org.apache.wicket.model.Model(style)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, '')
	addBehavior(behavior, component)
}

/**
 * Sets the visibility of components in the browser. This means that all the markup is included, but is also hidden.
 * Differs from plugins.WebClientUtils impl., as that does it by changing the value for the CSS display property, while this impl. does it through the CSS visibility property
 * 
 * @param {RuntimeComponent|RuntimeForm} component
 * @param {String} className
 *
 * @properties={typeid:24,uuid:"BEF22467-35CD-4397-B10C-4BBE9789DD17"}
 */
function addClass(component, className) {
	checkOperationSupported()
	var model = Packages.org.apache.wicket.model.Model(className)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('class', true, model, ' ')
	addBehavior(behavior, component)
}

/**
 * Adds a placeholder text to empty fields. Has been surpassed by native support for placeholders on fields in Servoy 7
 * @deprecated Use native placeholder support on fields in Servoy 7. Will e removed in version 5
 * @param {RuntimeCalendar|RuntimeHtmlArea|RuntimeImageMedia|RuntimePassword|RuntimeRtfArea|RuntimeTextArea|RuntimeTextField} element Reference to an element
 * @param {String} text Placeholder text to be displayed
 *
 * @properties={typeid:24,uuid:"26E18BFD-0456-429D-8C64-54DB1162B13D"}
 */
function addPlaceHolderText(element, text) {
	checkOperationSupported()
	var behavior = new Packages.org.apache.wicket.behavior.SimpleAttributeModifier('placeholder', text)
	unwrapElement(element).add(behavior)
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
	//TODO: this code gets called/added now everytime
	//TODO: Remove this code after upgrading to newer Wicket version (this "patch is for wicket 1.4))
	//Override Wicket function to support all HTML5 input types
	addOnDOMReadyScript("Wicket.Form.serializeInput = function(input) {\
		var type = input.type.toLowerCase();\
		switch (type) {\
			case 'checkbox':\
			case 'radio':\
				if (!input.checked) {\
					return '';\
				};\
				/*Intentional fallthrough here*/\
			case 'text':\
			case 'password':\
			case 'hidden':\
			case 'textarea':\
			case 'search':\
			case 'email':\
			case 'url':\
			case 'tel':\
			case 'number':\
			case 'range':\
			case 'date':\
			case 'month':\
			case 'week':\
			case 'time':\
			case 'datetime':\
			case 'datetime-local':\
			case 'color':\
				return Wicket.Form.encode(input.name) + '=' + Wicket.Form.encode(input.value) + '&';\
				break;\
			default:\
				return '';\
		}\
	}")
	
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

/*
 * WARNING Methods below use getPageContributer through the PluginAccess to add global dependancies in such a way that it'll work in the onOpen event handler of a solutions
 * Note that the implementation is flawed as the resource is added to only the current Wicket page, which related to one JSWindow
 * As a result, the resource is not available in dialogs or additional tabs.
 * See https://support.servoy.com/browse/SVY-3192 to get this fixed
 */

/**
 * @param {String} url
 * @param {RuntimeComponent|RuntimeForm} [element]
 * @param {Boolean} [disableAutoAdjustProtocol] Disable auto adjustment of http or https protocols in the URL to match the protocol under which the Web cLient runs. Default: false
 *
 * @properties={typeid:24,uuid:"3FFD6F91-CE66-4337-9E52-2A7CC5ECF295"}
 */
function addJavaScriptDependancy(url, element, disableAutoAdjustProtocol) {
	checkOperationSupported()
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderJavascriptReference(convertToExternalURL(url, disableAutoAdjustProtocol))
			}
		})
	)
	addBehavior(contributor, element)
}

/**
 * @param {String} url
 * @param {RuntimeComponent|RuntimeForm} [element]
 * @param {Boolean} [disableAutoAdjustProtocol] Disable auto adjustment of http or https protocols in the URL to match the protocol under which the Web cLient runs. Default: false
 *
 * @properties={typeid:24,uuid:"84B8B212-C873-465F-8F2C-EE74A466CEC6"}
 */
function addCSSDependancy(url, element, disableAutoAdjustProtocol) {
	checkOperationSupported()
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderCSSReference(convertToExternalURL(url, disableAutoAdjustProtocol))
			}
		})
	)
	addBehavior(contributor, element)
}

/**
 * Converts Media URL's to relative URL's for usage inside the Web CLient
 * @param {String} mediaUrl
 * @return {String}
 *
 * @properties={typeid:24,uuid:"B8C949DD-494F-4352-9BC7-1DA7FE0A404E"}
 */
function getExternalUrlForMedia(mediaUrl) {
	if (mediaUrl.substr(0, MEDIA_URL_PREFIX.length) != MEDIA_URL_PREFIX) {
		return mediaUrl
	}
	var media = solutionModel.getMedia(mediaUrl.substr(MEDIA_URL_PREFIX.length))
	if (media == null) {
		application.output('Could not locate "' + mediaUrl + '" in the media library for inclusion in the Web Client markup', LOGGINGLEVEL.WARNING)
		return '#'
	} 
	
	/**@type {java.lang.Object}*/
	var bytes = media.bytes
	mediaUrl += '&amp;hc=' + bytes.hashCode()
	
	var resourceReference = new Packages.org.apache.wicket.ResourceReference("media");
	return mediaUrl.replace(MEDIA_URL_PREFIX, Packages.org.apache.wicket.RequestCycle.get().urlFor(resourceReference) + '?s=' + application.getSolutionName() + '&amp;id=')
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
	if (url.substr(0, MEDIA_URL_PREFIX.length) != MEDIA_URL_PREFIX) {
		//Replace http with https when the Wc is running under https, to prevent mixed content warnings in the browser
		if (!disableAutoAdjustProtocol && url.substr(0,4) == 'http') {
			var requiredProtocol = scopes.modUtils$net.parseUrl(application.getServerURL()).protocol
			var usedProtocol = scopes.modUtils$net.parseUrl(url).protocol
			if (usedProtocol != requiredProtocol) {
				return requiredProtocol + url.substr(usedProtocol.length)
			}
		}
		return url
	}
	return getExternalUrlForMedia(url)
}

/**
 * TODO: test if the used way of getting the pageContributer is correct
 * @param {String} script
 *
 * @properties={typeid:24,uuid:"125243AB-90B0-424A-8CFD-338584E0E10A"}
 */
function executeClientsideScript(script) {
	if (!script) return
	script = utils.stringTrim(script)
	if (!(script.charAt(-1) == ';')) {
		script += ';'
	}
	getWebClientPluginAccess().getPageContributor().addDynamicJavaScript(script);
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
		tmp2.getStylePropertyChanges().setRendered();
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
 * @param {RuntimeComponent} element
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
		return form.getFormContext().getValue(1,2)
	}
	return null
}

/**
 * Utility method to get PluginAccess
 * @private
 * @return {Packages.com.servoy.j2db.server.headlessclient.IWebClientPluginAccess}
 * @SuppressWarnings(wrongparameters)
 * @properties={typeid:24,uuid:"AF74EA3D-B2EB-41EC-A333-D806D7972FA5"}
 */
function getWebClientPluginAccess() {
	return unwrapElement(plugins.window)['getClientPluginAccess']()
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
}

/**
 * Utility method to gain access to the underlying Java component in order to access more low level API
 * @private
 * @SuppressWarnings(wrongparameters)
 * 
 * @param {RuntimeComponent|RuntimeForm} element
 *
 * @return {Packages.org.apache.wicket.Component}
 *
 * @properties={typeid:24,uuid:"60FD0C93-55A0-4E4E-AA5B-42F037E42A49"}
 */
function unwrapElement(element) {
	/**@type {Packages.org.apache.wicket.Component}*/
	var component;
	
	if (element instanceof RuntimeForm) {
		//Using reflection because Servoy's WrapFactory prevents access to the unwrapped FormController
		//and only the FormController has access to the FormUI
		//The impl. below works, because it grabs the FormController class and not an instance of it
		component = unwrapElement(Packages.com.servoy.j2db.FormController)['getMethod']('getFormUI').invoke(element).get('servoywebform')
	} else {
		var list = new Packages.java.util.ArrayList();
		list.add(element)
		component = list.get(0)
	}
	return component
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
 * @param {Number} [milliseconds]
 * 
 * @properties={typeid:24,uuid:"4651696E-4E25-49B1-A2FE-EB561A859F5A"}
 */
function updateUI(milliseconds) {
	checkOperationSupported()
	if (application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT) {
      c = new Continuation();
      //TODO: convert to not use WebClientUtils plugin
      executeClientsideScript(plugins.WebClientUtils.generateCallbackScript(updateUIResume));
      terminator();
   } else {
      application.updateUI(milliseconds)
   }
}

/**
 * Used by the updateUI Web Client polyfill 
 * @private 
 * @properties={typeid:24,uuid:"06BE500F-780A-4DA4-855B-605F2E2CE83F"}
 */
function updateUIResume() {
   c();
}
