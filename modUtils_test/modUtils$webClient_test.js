/**
 * @properties={typeid:24,uuid:"D3A60C4D-44CE-49E0-B07A-431C8E85FD43"}
 */
function testJavaDependencies() {
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.behavior.SimpleAttributeModifier', 'function', typeof Packages.org.apache.wicket.behavior.SimpleAttributeModifier)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.behavior.HeaderContributor', 'function', typeof Packages.org.apache.wicket.behavior.HeaderContributor)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.markup.html.IHeaderContributor', 'function', typeof Packages.org.apache.wicket.markup.html.IHeaderContributor)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.ResourceReference', 'function', typeof Packages.org.apache.wicket.ResourceReference)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.RequestCycle', 'function', typeof Packages.org.apache.wicket.RequestCycle)
	jsunit.assertEquals('Failed to instatiate Packages.java.util.ArrayList', 'function', typeof Packages.java.util.ArrayList)
}