/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6DE8280C-409F-4100-9E66-1AC7F81CF4E3"}
 */
var date

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"01F1DB5E-7E41-40FE-B456-5EA9281CCD85"}
 */
function onLoad(event) {
	var tmp = <html>
		<head>
			<script>
			<![CDATA[
				var localVar = 'localVarValue'
			
				function invokeCallbackUrl(callbackUrl) {
					$.ajax({
						  type: "POST",
						  url: callbackUrl,
						  data: 'hello',
						  success: function(data, textStatus,  jqXHR) {
							  alert(data)
						  }
						});
				}
			]]>
			</script>
		</head>
		<body>
			<button id="callbackUrlButton">call callbackUrl</button>
			<button id="callbackScriptButton">call callbackScript</button>
			<button id="callbackScriptWithArgsButton">call callbackScript</button>
		</body>
	</html>
	
	tmp..*.(@id == 'callbackUrlButton')[0].@onclick = 'invokeCallbackUrl(\'' + scopes.svyWebClientUtils.getCallbackUrl(callback) + '\')'
	tmp..*.(@id == 'callbackScriptButton')[0].@onclick = scopes.svyWebClientUtils.getCallbackScript(callback, [], {showLoading: false})
	tmp..*.(@id == 'callbackScriptWithArgsButton')[0].@onclick = scopes.svyWebClientUtils.getCallbackScript(callback, ['localVar', 10, true, '"hello"'], {showLoading: false})
	tmp.head.appendChild(<script>{''}</script>)
	
	html = scopes.svyWebClientUtils.XHTML2Text(tmp)
	
	application.output(html)
	
	//scopes.svyWebClientUtils.getCallbackUrl(callback, forms.webClientCallbackTests, id)
}

/**
 * @properties={typeid:24,uuid:"D1852FF0-3A54-46CF-BAE1-E874BD98EC13"}
 */
function callback(){
	application.output('callback invoked!!!')
	application.output(arguments)
	var x = new Date()
	date = x.toUTCString()
	
	return 'Retval'
}

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"819362A7-73A9-4D77-94A3-67DA56B07CDA"}
 */
var html