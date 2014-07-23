/* Override Wicket function to support all HTML5 input types */
Wicket.Form.serializeInput = function(input) {
	var type = input.type.toLowerCase();
	switch (type) {
		case 'checkbox':
		case 'radio':
			if (!input.checked) {
				return '';
			};
			/*Intentional fallthrough here*/
		case 'text':
		case 'password':
		case 'hidden':
		case 'textarea':
		case 'search':
		case 'email':
		case 'url':
		case 'tel':
		case 'number':
		case 'range':
		case 'date':
		case 'month':
		case 'week':
		case 'time':
		case 'datetime':
		case 'datetime-local':
		case 'color':
			return Wicket.Form.encode(input.name) + '=' + Wicket.Form.encode(input.value) + '&';
			break;
		default:
			return '';
	}
}