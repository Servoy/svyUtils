/**
 * @properties={typeid:24,uuid:"9804BF32-5CD9-4BD2-9C1E-0F03E851BBB8"}
 */
function testGetRemoteIPAddress() {

	try {
		var ipAddress = scopes.svyNet.getRemoteIPAddress()

		jsunit.assertNotNull('Could not retrieve the remote IP address', ipAddress)
		jsunit.assertNotUndefined('Could not retrieve the remote IP address', ipAddress)
		jsunit.assertFalse('getRemoteIPAddress has returned the internal ip address ' + ipAddress, scopes.svyNet.isInternalIPAddress(ipAddress))
	} catch (e) {
		jsunit.fail(e.message)
	}
}

/**
 * @properties={typeid:24,uuid:"3426737F-7959-45AE-A318-4207CF619485"}
 */
function testIsInternalIPAddress() {

	// range 192.168.0.0 - 192.168.255.255
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('192.168.0.0'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('192.168.1.0'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('192.168.1.1'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('192.168.10.10'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('192.168.255.255'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('192.167.255.255'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('192.169.0.0'))

	// range 10.0.0.0 - 10.255.255.255
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('10.0.0.0'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('10.255.255.255'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('10.134.12.10'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('9.255.255.255'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('11.0.0.0'))

	// range 172.16.0.0 - 172.31.255.255
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('172.29.0.1'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('172.16.0.0'))
	jsunit.assertTrue(scopes.svyNet.isInternalIPAddress('172.31.255.255'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('172.15.255.255'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('172.32.0.0'))

	// random ip
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('192.128.1.10'))
	jsunit.assertFalse(scopes.svyNet.isInternalIPAddress('156.128.1.10'))
	
	try {
		scopes.svyNet.isInternalIPAddress('192.168.0')
		jsunit.fail('is not a valid ip address')
	} catch (e) {}
	
	try {
		scopes.svyNet.isInternalIPAddress('192.168.0.0.0')
		jsunit.fail('is not a valid ip address')
	} catch (e) {}

	try {
		scopes.svyNet.isInternalIPAddress('192.168.0.256')
		jsunit.fail('is not a valid ip address')
	} catch (e) {}
}
