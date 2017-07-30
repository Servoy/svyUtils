/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AE7A1DC3-EF5D-449E-80FC-79360B685900"}
 */
var address = '';

/**
 * @properties={typeid:24,uuid:"ADAD9B72-EDCC-420B-9285-BDAE05772E5A"}
 */
function showAddressDialog(){
	
	
	// dialog defaults
	var dialog = scopes.svyCustomDialogs.createCustomDialog(null,'My fantastic dialog','This is great. Gonna be HUGE')
		.setDefaultFieldHeight(30)
		.setDefaultFieldWidth(250)
		.setResizable(true)
		
		// title text with Style Class
		dialog.addLabel('Please Enter Address Information')
			.setStyleClass('label_header_2')
	
		// text fields
		dialog.addTextField('Name')
		dialog.addTextField('Address')
		dialog.addTextField('City')
		dialog.addTextField('State/Province')
		
		// value list
		dialog.addTextField('Country').
			setValueListName('countries');
			
		// custom properties
		dialog.addTextField('Postal Code')
			.setWidth(100);

		// checkbox input
		dialog.addCheckbox('Copy to Shipping','',true);
		
		// multiple buttons
		dialog.addButton('OK');
		dialog.addButton('Cancel');
	
		//	show dialog
		dialog.showDialog();
		
		// which button was clicked ?
		if(dialog.buttonClickedText == 'OK'){
			
			// display results
			var result = dialog.getResult();
			address = [result[0], result[1], result.slice(2,4).join(' '), result[4], result[5]].join('<br>');
		}
		
		
}

/**
 * @properties={typeid:24,uuid:"2B51017A-E573-4683-B98D-0369A77F22C2"}
 */
function showQuestionDialog(){
	var dialog = scopes.svyCustomDialogs.createCustomDialog(null,'Test','Foobar',null,['Yes','No','Cancel']).showDialog();
	
//	var dialog = scopes.svyCustomDialogs.createCustomDialog();
//	dialog.addMessage('Question 1');
//	dialog.addButton('Yes 1')
//	dialog.addButton('No 1')
//	dialog.addMessage('Question 2');
//	dialog.addButton('Yes 2')
//	dialog.addButton('No 2')
//	dialog.showDialog();
	
	
}