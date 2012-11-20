/**
 * @properties={typeid:24,uuid:"1A330EA0-A1A5-4179-B12B-24060448E6D4"}
 */
function testJavaDependencies() {
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.behavior.SimpleAttributeModifier', 'function', typeof Packages.org.apache.wicket.behavior.SimpleAttributeModifier)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.behavior.HeaderContributor', 'function', typeof Packages.org.apache.wicket.behavior.HeaderContributor)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.markup.html.IHeaderContributor', 'function', typeof Packages.org.apache.wicket.markup.html.IHeaderContributor)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.ResourceReference', 'function', typeof Packages.org.apache.wicket.ResourceReference)
	jsunit.assertEquals('Failed to instatiate Packages.org.apache.wicket.RequestCycle', 'function', typeof Packages.org.apache.wicket.RequestCycle)
	jsunit.assertEquals('Failed to instatiate Packages.java.util.ArrayList', 'function', typeof Packages.java.util.ArrayList)
}