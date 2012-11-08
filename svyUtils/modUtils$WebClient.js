/*
 * All kind of utilities when running the Web Client.
 * Note that these utilities do not check if they are being called in a Web Client!
 * 
 * Some interesting resources that were used in some of the utils:
 * - http://chillenious.wordpress.com/2006/05/03/wicket-header-contributions-with-behaviors/
 * - http://spatula.net/blog/2006/11/better-than-ajax-adding-client-side.html
 * - http://www.codesmell.org/blog/2010/01/playing-with-wickets-templates/
 * - http://karthikg.wordpress.com/2008/01/24/developing-a-custom-apache-wicket-component/
 */

/**
 * Centers a (tab)panel within its container through CSS. Tabpanel should left anchored only
 * TODO: checks to see if tabpanel is not left/right anchored and if it that supported orientation
 * @param {RuntimeTabPanel} element
 *
 * @properties={typeid:24,uuid:"7B201980-B19F-4B56-AD61-1BCA3582EE3E"}
 */
function centerPanel(element) {
	var model = Packages.org.apache.wicket.model.Model('left: 50%;margin-left:-' + element.getWidth() / 2 + 'px;')
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, '')
	unwrapElement(element).add(behavior)
}

/**
 * Sets the visibility of components in the browser. This means that all the markup is included, but is also hidden.
 * Differs from plugins.WebClientUtils impl., as that does it by changing the value for the CSS display property, while this impl. does it through the CSS visibility property
 * 
 * @param {RuntimeComponent} component
 * @param {Boolean} visibility
 *
 * @properties={typeid:24,uuid:"8421ED23-0497-4D0F-9CEE-71F543FF0838"}
 */
function setComponentVisibility(component, visibility) {
	var style = visibility ? 'visibility: inherit' : 'visibility: hidden'
	var model = Packages.org.apache.wicket.model.Model(style)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, '')
	unwrapElement(component).add(behavior)
}

/**
 * Sets the visibility of components in the browser. This means that all the markup is included, but is also hidden.
 * Differs from plugins.WebClientUtils impl., as that does it by changing the value for the CSS display property, while this impl. does it through the CSS visibility property
 * 
 * @param {RuntimeComponent} component
 * @param {Boolean} visibility
 *
 * @properties={typeid:24,uuid:"BEF22467-35CD-4397-B10C-4BBE9789DD17"}
 */
function addClass(component, className) {
	var model = Packages.org.apache.wicket.model.Model(className)
	var behavior = new Packages.org.apache.wicket.behavior.AttributeAppender('style', model, '')
	unwrapElement(component).add(behavior)
}

/**
 * @param {RuntimeCalendar|RuntimeHtmlArea|RuntimeImageMedia|RuntimePassword|RuntimeRtfArea|RuntimeTextArea|RuntimeTextField} element Reference to an element
 * @param {String} text Placeholder text to be displayed
 *
 * @properties={typeid:24,uuid:"26E18BFD-0456-429D-8C64-54DB1162B13D"}
 */
function addPlaceHolderText(element, text) {
	var behavior = new Packages.org.apache.wicket.behavior.SimpleAttributeModifier('placeholder', text)
	unwrapElement(element).add(behavior)
}

/**
 * // TODO generated, please specify type and doc for the params
 * @param element
 * @param code
 *
 * @properties={typeid:24,uuid:"EE277DEA-EBE5-4DFE-97CA-05F2BADC26B1"}
 */
function addKeyDownEventHandler(element, code) {
	var comp = unwrapElement(element)
	var behavior = new Packages.org.apache.wicket.behavior.StringHeaderContributor('<script>$(\'#' + comp.getMarkupId() + '\').keydown(' + code + ')</script>')
	comp.add(behavior)
}

/**
 * @param {RuntimeComponent} element
 * @param {String} url
 *
 * @properties={typeid:24,uuid:"3FFD6F91-CE66-4337-9E52-2A7CC5ECF295"}
 */
function addJavaScriptDependancy(element, url) {
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderJavascriptReference(convertMediaURL(url, response))
			}
		})
	)
	
	unwrapElement(element).add(contributor)
	return this
}

/**
 * @param {RuntimeComponent} element
 * @param {String} url
 *
 * @properties={typeid:24,uuid:"84B8B212-C873-465F-8F2C-EE74A466CEC6"}
 */
function addCSSDependancy(element, url) {
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderCSSReference(convertMediaURL(url, response))
			}
		})
	)
	
	unwrapElement(element).add(contributor)
}

/**
 * @private 
 * @param {String} url
 * @param {Packages.org.apache.wicket.markup.html.IHeaderResponse} response
 * @return {String}
 *
 * @properties={typeid:24,uuid:"C6EC0C48-2E49-46A7-A630-E162626FB362"}
 */
function convertMediaURL(url, response) { 
	if (url.substr(0,9) != 'media:///') {
		return url
	}
	var media = solutionModel.getMedia(url.substr(9))
	if (media == null) {
		application.output('Could not locate "' + url + '" in the media library for inclusion in the Web Client markup',LOGGINGLEVEL.WARNING)
		return '#'
	}
	var resourceReference = new Packages.org.apache.wicket.ResourceReference("media");
	//TODO: see if a revision number or modification timestamp can be found to append as hash, to trigger automatic refresh in the browser
	return url.replace('media:///', Packages.org.apache.wicket.RequestCycle.get().urlFor(resourceReference) + '?s=' + application.getSolutionName() + '&amp;id=')
}

/**
 * @param element
 * @param code
 *
 * @properties={typeid:24,uuid:"A37ACBC3-8F68-48E8-AEC5-C1F00739CDAA"}
 */
function addOnDOMReadyScript(element, code) {
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderOnDomReadyJavascript(code) 
			}
		})
	)

	unwrapElement(element).add(contributor)
}

/**
 * @param element
 * @param code
 *
 * @properties={typeid:24,uuid:"DB2D9CFF-410E-489A-BE5B-2EF83F8FFC18"}
 */
function addOnLoadScript(element, code) {
	var contributor = new Packages.org.apache.wicket.behavior.HeaderContributor(new Packages.org.apache.wicket.markup.html.IHeaderContributor({
			renderHead: function(/**@type {Packages.org.apache.wicket.markup.html.IHeaderResponse}*/ response) {
				response.renderOnLoadJavascript(code) 
			}
		})
	)

	unwrapElement(element).add(contributor)
}

/**
 * Returns the value of the ID attribute of the element in the browser
 * @param {RuntimeComponent} element
 * @return {String}
 *
 * @properties={typeid:24,uuid:"B705A7B3-CA51-4494-A207-1C31559DA437"}
 */
function getElementMarkupId(element) {
	return unwrapElement(element).getMarkupId()
}

/**
 * @private
 * @param {RuntimeComponent} element
 *
 * @return {Packages.org.apache.wicket.Component}
 *
 * @properties={typeid:24,uuid:"60FD0C93-55A0-4E4E-AA5B-42F037E42A49"}
 */
function unwrapElement(element) {
	var list = new Packages.java.util.ArrayList();
	list.add(element)

	/**@type {Packages.org.apache.wicket.Component}*/
	var unwrappedElement = list.get(0) 
	return unwrappedElement
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
 * TODO: add class to unittest
 * @returns Packages.org.apache.wicket.protocol.http.request.WebClientInfo
 * @properties={typeid:24,uuid:"B4A9F2EE-4A3C-41F9-A767-381B83538309"}
 */
function getBrowserInfo() {
	/** @type {Packages.org.apache.wicket.protocol.http.request.WebClientInfo}*/
	var clientInfo = Packages.org.apache.wicket.protocol.http.WebRequestCycle.get().getClientInfo();
	return clientInfo;
}

/**
 * Allows to set the inactive session timeout for this webclient only
 * TODO: add class to unittest
 * @param {Number} timeOut the session timeout interval in milliseconds
 * @properties={typeid:24,uuid:"2CF23729-A1C2-4A58-89E2-DE78EC962833"}
 */
function setSessionTimeout(timeOut) {
	/**@type {Packages.org.apache.wicket.protocol.http.WebRequest}*/
	var request = Packages.org.apache.wicket.RequestCycle.get().getRequest()
	
	/** @type {Packages.javax.servlet.http.HttpSession}*/
	var session = request.getHttpServletRequest().getSession();
	session.setMaxInactiveInterval(timeOut);
}

/**
 * TODO: add class to unittest
 * @param {Boolean} state
 * @properties={typeid:24,uuid:"2CE6512E-555E-4BBF-A764-A3C404F2AD6A"}
 */
function setWicketDebugMode(state) {
	Packages.org.apache.wicket.Application.get().getDebugSettings().setAjaxDebugModeEnabled(state);
}

/**
 * TODO: add class to unittest
 * @param {String} name property name
 * @param {String} value property value
 * @param {Number} validity validity in seconds
 *
 * @properties={typeid:24,uuid:"6797F6A1-0D0F-4B3A-87F9-642FAB9D78C1"}
 */
function setTimeBoundUserProperty(name, value, validity) {
	/** @type {Packages.org.apache.wicket.protocol.http.WebRequestCycle}*/
	var request = Packages.org.apache.wicket.RequestCycle.get()
	var cookies = request.getWebRequest().getCookies();
	
	for (var index = 0; index < cookies.length; index++) {
		if (cookies[index].getName().equals(name)) {
			//Getting all the values of the cookie, removing the Cookie from the WebResponse and adding it again, as the WebResponse doesn't support getting existing Cookies
			//CHECKME: these values aren't used. Does everything work regardless? If so, remove the code
			var encodedValue = cookies[index].getValue()
			var domain = cookies[index].getDomain()
			var path = cookies[index].getPath()
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
 * 
 * @param {Number} [milliseconds]
 * 
 * @properties={typeid:24,uuid:"4651696E-4E25-49B1-A2FE-EB561A859F5A"}
 */
function updateUI(milliseconds) {
   if (application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT) {
      c = new Continuation();
      plugins.WebClientUtils.executeClientSideJS(plugins.WebClientUtils.generateCallbackScript(updateUIResume));
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
