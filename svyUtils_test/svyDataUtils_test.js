/**
 * @protected 
 * @properties={typeid:24,uuid:"18B1414B-23A8-4DFB-BCCE-3AE8A6BB6F2D"}
 */
function testPivotJSDataSet() {
	var ds = databaseManager.createEmptyDataSet(0,['col1', 'col2'])
	ds.addRow(['col1_row1','col2_row1'])
	ds.addRow(['col1_row2','col2_row2'])
	
	var pivoted = scopes.svyDataUtils.pivotJSDataSet(ds)
	jsunit.assertEquals(3,pivoted.getMaxColumnIndex())
	jsunit.assertEquals(2,pivoted.getMaxRowIndex())
	jsunit.assertEquals('row2',pivoted.getColumnName(3))
	jsunit.assertEquals('col2',pivoted.getValue(2,1))
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"B7515A10-28AF-4D2C-9B4A-D800769A5584"}
 */
function testSelectRecord() {
	var orderDetails = datasources.db.example_data.order_details.getFoundSet();
	orderDetails.loadAllRecords();
	var orderDetailsCopy = orderDetails.duplicateFoundSet();
	// get the last record
	var count = databaseManager.getFoundSetCount(orderDetailsCopy);
	if (count > 403) {
		var order = orderDetailsCopy.getRecord(count - 202);
		
		// select the record at pos count - 202
		jsunit.assertTrue('selecteRecord should select record ' + order.orderid + ',' + order.productid, scopes.svyDataUtils.selectRecord(orderDetails, order));
		jsunit.assertEquals('selectRecord should select the correct record '  + order.orderid, order.orderid, orderDetails.orderid);
		jsunit.assertEquals('selectRecord should select the correct record '  + order.productid, order.productid, orderDetails.productid);

	}
	
	var lastOrder = orderDetailsCopy.getRecord(count);
	
	// select the record at pos count - 202
	jsunit.assertTrue('selecteRecord should select record ' + lastOrder.orderid + ',' + lastOrder.productid, scopes.svyDataUtils.selectRecord(orderDetails, lastOrder));
	jsunit.assertEquals('selectRecord should select the correct record '  + lastOrder.orderid, lastOrder.orderid, orderDetails.orderid);
	jsunit.assertEquals('selectRecord should select the correct record '  + lastOrder.productid, lastOrder.productid, orderDetails.productid);
	
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"DD9D17AD-AF8E-4B62-B28B-D65F7C65EB97"}
 */
function testSelectRecordByPks() {
	var orderDetails = datasources.db.example_data.order_details.getFoundSet();
	orderDetails.loadAllRecords();
	var orderDetailsCopy = orderDetails.duplicateFoundSet();
	// get the last record
	var count = databaseManager.getFoundSetCount(orderDetailsCopy);
	if (count > 403) {
		var order = orderDetailsCopy.getRecord(count - 202);
		
		// select the record at pos count - 202
		jsunit.assertTrue('selecteRecord should select record ' + order.orderid + ',' + order.productid, scopes.svyDataUtils.selectRecordByPks(orderDetails, order.orderid, order.productid));
		jsunit.assertEquals('selectRecord should select the correct record '  + order.orderid, order.orderid, orderDetails.orderid);
		jsunit.assertEquals('selectRecord should select the correct record '  + order.productid, order.productid, orderDetails.productid);

	}
	
	var lastOrder = orderDetailsCopy.getRecord(count);
	
	// select the record at pos count - 202
	jsunit.assertTrue('selecteRecord should select record ' + lastOrder.orderid + ',' + lastOrder.productid, scopes.svyDataUtils.selectRecordByPks(orderDetails, lastOrder.orderid, lastOrder.productid));
	jsunit.assertEquals('selectRecord should select the correct record '  + lastOrder.orderid, lastOrder.orderid, orderDetails.orderid);
	jsunit.assertEquals('selectRecord should select the correct record '  + lastOrder.productid, lastOrder.productid, orderDetails.productid);
	
}