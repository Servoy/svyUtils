/**
 * @properties={typeid:24,uuid:"D3A60C4D-44CE-49E0-B07A-431C8E85FD43"}
 */
function testJavaDependencies() {
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.behavior.SimpleAttributeModifier', 'function', typeof Packages.org.apache.wicket.behavior.SimpleAttributeModifier)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.behavior.HeaderContributor', 'function', typeof Packages.org.apache.wicket.behavior.HeaderContributor)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.markup.html.IHeaderContributor', 'function', typeof Packages.org.apache.wicket.markup.html.IHeaderContributor)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.ResourceReference', 'function', typeof Packages.org.apache.wicket.ResourceReference)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.RequestCycle', 'function', typeof Packages.org.apache.wicket.RequestCycle)
	jsunit.assertEquals('Failed to locate Packages.java.util.ArrayList', 'function', typeof Packages.java.util.ArrayList)
	jsunit.assertEquals('Failed to locate Packages.com.servoy.j2db.server.headlessclient.IWebClientPluginAccess', 'function', typeof Packages.com.servoy.j2db.server.headlessclient.IWebClientPluginAccess)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.protocol.http.request.WebClientInfo', 'function', typeof Packages.org.apache.wicket.protocol.http.request.WebClientInfo)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.Application', 'function', typeof Packages.org.apache.wicket.Application)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.settings.IDebugSettings', 'function', typeof Packages.org.apache.wicket.settings.IDebugSettings)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.RequestCycle', 'function', typeof Packages.org.apache.wicket.RequestCycle)
	jsunit.assertEquals('Failed to locate Packages.org.apache.wicket.protocol.http.WebRequestCycle', 'function', typeof Packages.org.apache.wicket.protocol.http.WebRequestCycle)
	jsunit.assertEquals('Failed to locate Packages.javax.servlet.http.Cookie', 'function', typeof Packages.javax.servlet.http.Cookie)
	jsunit.assertEquals('Failed to locate Packages.com.servoy.j2db.util.Utils', 'function', typeof Packages.com.servoy.j2db.util.Utils)
	
}

/**
 * @properties={typeid:24,uuid:"E6C2A9FF-77F7-49F9-BAFC-7BEB17233E6C"}
 */
function testMediaHashcode() {
	/** @type {java.lang.Object} */
	var bytes = solutionModel.newMedia(application.getUUID().toString(),[]).bytes
	try {
		bytes.hashCode()
	} catch (e) {
		jsunit.fail('Failes to get the hashCode from the bytes of a Media Lib entry')
	}
}