/**
 * @properties={typeid:24,uuid:"0D112655-8D72-459C-AE80-395D0B7D15DC"}
 */
function setUp() {
	//Code here to setup the environment for the testcases in this scope
	scopes.svyDateUtils.setLocaleAndTimeZone('nl', 'NL', 'Europe/Amsterdam');

}

/**
 * @properties={typeid:24,uuid:"123FAF80-97DD-421D-8E2E-D3826B38E637"}
 */
function tearDown() {
	scopes.svyDateUtils.setLocaleAndTimeZone(i18n.getCurrentLanguage(), i18n.getCurrentCountry(), i18n.getCurrentTimeZone())
}

/**
 * @protected
 * @properties={typeid:24,uuid:"BC0CB490-4F4F-4270-BE16-11163844D6BD"}
 */
function testToFirstDayOfWeek() {

	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('14-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));

	var dateTime = new scopes.svyDateUtils.DateTime(date);
	dateTime.toFirstDayOfWeek();
	jsunit.assertEquals('14-08-2023 00:00:00', utils.dateFormat(dateTime.date, 'dd-MM-yyyy HH:mm:ss'));
	dateTime.addWeeks(-1);
	jsunit.assertEquals('07-08-2023 00:00:00', utils.dateFormat(dateTime.date, 'dd-MM-yyyy HH:mm:ss'));

	// test 01-01-2023
	date = getFirstDayOfYear();
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));
	dateTime = new scopes.svyDateUtils.DateTime(date);
	dateTime.toFirstDayOfWeek();
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(dateTime.date, 'dd-MM-yyyy HH:mm:ss'));
	dateTime.addWeeks(-1);
	jsunit.assertEquals('19-12-2022 00:00:00', utils.dateFormat(dateTime.date, 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"0AB439A8-99B3-499D-BAA3-73498962A8A4"}
 */
function testAdd() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('02-02-2024 01:01:01', utils.dateFormat(scopes.svyDateUtils.add(date, 1, 1, 1, 1, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	
	var winterDate = getDSTEnd();
	// add a Day during DST time
	jsunit.assertEquals('30-10-2023 01:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 1, 1, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 1, 0, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 23:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 24, 1, 1), 'dd-MM-yyyy HH:mm:ss'));

	jsunit.assertEquals('29-10-2023 11:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 12, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 11:00:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 0, 12 * 60, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 11:00:00', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 0, 0, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC');
	
	winterDate = getDSTEnd();
	// add a Day during DST time
	jsunit.assertEquals('30-10-2023 01:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 1, 1, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 1, 0, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 24, 1, 1), 'dd-MM-yyyy HH:mm:ss'));

	jsunit.assertEquals('29-10-2023 12:01:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 12, 1, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 12:00:01', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 0, 12 * 60, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.add(winterDate, 0, 0, 0, 0, 0, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));


}

/**
 * @protected
 * @properties={typeid:24,uuid:"DA09B108-161E-4FB4-BCEB-5CBAB85EEDBD"}
 */
function testAddYears() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.addYears(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2025 00:00:00', utils.dateFormat(scopes.svyDateUtils.addYears(date, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2021 00:00:00', utils.dateFormat(scopes.svyDateUtils.addYears(date, -2), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"82CABD65-CF93-4352-BF1A-23D692EC001B"}
 */
function testAddMonths() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('01-02-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMonths(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMonths(date, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-06-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMonths(date, 5), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-11-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMonths(date, -2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-09-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMonths(date, -4), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"7818E0C3-D3E7-4300-9C7A-87B7F464FD3F"}
 */
function testAddWeeks() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addWeeks(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('15-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addWeeks(date, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('18-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.addWeeks(date, -2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('13-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addWeeks(date, 32), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"70124498-51F4-469D-901E-5752A4262BCB"}
 */
function testAddDays() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(date, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(date, -2), 'dd-MM-yyyy HH:mm:ss'));
	
	var summerTime = getDSTStart()
	jsunit.assertEquals('27-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(summerTime, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('28-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(summerTime, 2), 'dd-MM-yyyy HH:mm:ss'));
	
	var winterTime = getDSTEnd()
	jsunit.assertEquals('30-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(winterTime, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(winterTime, 2), 'dd-MM-yyyy HH:mm:ss'));
	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC');
	
	summerTime = getDSTStart()
	jsunit.assertEquals('27-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(summerTime, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('28-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(summerTime, 2), 'dd-MM-yyyy HH:mm:ss'));
	
	winterTime = getDSTEnd()
	jsunit.assertEquals('30-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(winterTime, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addDays(winterTime, 2), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"15E67937-E4FD-4FD4-9ABA-B8BCD9B46C29"}
 */
function testAddBusinessDays() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('13-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addBusinessDays(date, 10), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('16-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addBusinessDays(date, 10, [new Date(2023, 0, 6)]), 'dd-MM-yyyy HH:mm:ss'));
	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC');
	
	jsunit.assertEquals('13-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addBusinessDays(date, 10), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('16-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addBusinessDays(date, 10, [new Date(2023, 0, 6)]), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"6A773F1D-0CCC-4A74-9489-626940084A7C"}
 */
function testAddHours() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	
	scopes.svyDateUtils.setLocaleAndTimeZone('nl', 'NL', 'Europe/Amsterdam');
		
	jsunit.assertEquals('01-01-2023 01:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(date, 24), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2022 22:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(date, -2), 'dd-MM-yyyy HH:mm:ss'));
	
	// TODO adding hours should take into account DST changes !?
	var summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 13:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(summerTime, 12), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 01:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(summerTime, 24), 'dd-MM-yyyy HH:mm:ss'));
	
	var winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 11:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(winterTime, 12), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 23:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(winterTime, 24), 'dd-MM-yyyy HH:mm:ss'));
	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC')
	
	summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(summerTime, 12), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(summerTime, 24), 'dd-MM-yyyy HH:mm:ss'));
	
	winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(winterTime, 12), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addHours(winterTime, 24), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"B66CE3E9-3C79-4701-84EA-3B8528AF1FBC"}
 */
function testAddMinutes() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('01-01-2023 00:01:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 01:06:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(date, 66), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2022 23:58:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(date, -2), 'dd-MM-yyyy HH:mm:ss'));

	scopes.svyDateUtils.setLocaleAndTimeZone('en','IT','Europe/Amsterdam')
	
	// TODO adding hours should take into account DST changes !?
	var summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 13:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(summerTime, 12 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 01:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(summerTime, 24 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	var winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 11:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(winterTime, 12 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 23:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(winterTime, 24 * 60), 'dd-MM-yyyy HH:mm:ss'));

	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC')
	
	summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(summerTime, 12 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(summerTime, 24 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(winterTime, 12 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addMinutes(winterTime, 24 * 60), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"6CB75EA3-8E3A-4764-AF92-716226332586"}
 */
function testAddSeconds() {
	// test 14-08-2023
	var date = getFirstDayOfYear();
	jsunit.assertEquals('01-01-2023 00:00:01', utils.dateFormat(scopes.svyDateUtils.addSeconds(date, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:01:06', utils.dateFormat(scopes.svyDateUtils.addSeconds(date, 66), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2022 23:59:58', utils.dateFormat(scopes.svyDateUtils.addSeconds(date, -2), 'dd-MM-yyyy HH:mm:ss'));

	// TODO adding hours should take into account DST changes !?
	var summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 13:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(summerTime, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 01:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(summerTime, 24 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	var winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 11:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(winterTime, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-10-2023 23:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(winterTime, 24 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	scopes.svyDateUtils.setLocaleAndTimeZone('en','EN','UTC');

	summerTime = getDSTStart()
	jsunit.assertEquals('26-03-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(summerTime, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('27-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(summerTime, 24 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	
	winterTime = getDSTEnd()
	jsunit.assertEquals('29-10-2023 12:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(winterTime, 12 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.addSeconds(winterTime, 24 * 60 * 60), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"2DF3222F-963A-44CA-99B8-E9C57F7189E1"}
 */
function testCreateDateFromWeekNumber() {
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2023, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('09-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2023, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2024, 1), 'dd-MM-yyyy HH:mm:ss'));

	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', i18n.getCurrentTimeZone());

	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2023, 1), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2023, 2), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.createDateFromWeekNumber(2024, 1), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"24F1D835-F667-4638-9647-FB30BD1E5DE3"}
 */
function testGetAge() {
	var date = getFirstDayOfYear();

	var today = new Date();
	var todayPrev = scopes.svyDateUtils.add(today, -5, -4, -6, -2, 0, 0);

	jsunit.assertEquals(5, scopes.svyDateUtils.getAge(todayPrev).years);
	jsunit.assertEquals(4, scopes.svyDateUtils.getAge(todayPrev).months);
	jsunit.assertEquals(6, scopes.svyDateUtils.getAge(todayPrev).days);

	jsunit.assertEquals(5, scopes.svyDateUtils.getAge(todayPrev, today).years);
	jsunit.assertEquals(4, scopes.svyDateUtils.getAge(todayPrev, today).months);
	jsunit.assertEquals(6, scopes.svyDateUtils.getAge(todayPrev, today).days);

	application.output(scopes.svyDateUtils.getAge(todayPrev))

	var todayNext = scopes.svyDateUtils.add(today, 5, 4, 6, 2, 0, 0);

	jsunit.assertEquals(-5, scopes.svyDateUtils.getAge(todayNext).years);
	jsunit.assertEquals(-4, scopes.svyDateUtils.getAge(todayNext).months);
	jsunit.assertEquals(-6, scopes.svyDateUtils.getAge(todayNext).days);

	jsunit.assertEquals(-5, scopes.svyDateUtils.getAge(todayNext, today).years);
	jsunit.assertEquals(-4, scopes.svyDateUtils.getAge(todayNext, today).months);
	jsunit.assertEquals(-6, scopes.svyDateUtils.getAge(todayNext, today).days);

	date.setFullYear(1999)
	var compareDate = new Date(2018, 1, 2)
	compareDate.setHours(23, 59, 59, 999)
	jsunit.assertEquals(19, scopes.svyDateUtils.getAge(date, compareDate).years);
	jsunit.assertEquals(1, scopes.svyDateUtils.getAge(date, compareDate).months);
	jsunit.assertEquals(1, scopes.svyDateUtils.getAge(date, compareDate).days);

}

/**
 * @protected
 * @properties={typeid:24,uuid:"F6D8E7DB-C285-458E-AA48-742EFC9924CE"}
 */
function testGetDateDifference() {

	var today = new Date(2024, 0, 1);
	var todayPrev = scopes.svyDateUtils.add(today, -1, -1, -1, -1, -1, -1);
	application.output(scopes.svyDateUtils.getDateDifference(todayPrev, today))

	jsunit.assertEquals(397, scopes.svyDateUtils.getDateDifference(todayPrev, today).days);
	jsunit.assertEquals(1, scopes.svyDateUtils.getDateDifference(todayPrev, today).hours);
	jsunit.assertEquals(1, scopes.svyDateUtils.getDateDifference(todayPrev, today).minutes);

	jsunit.assertEquals( (397 * 24) + 1, scopes.svyDateUtils.getDateDifference(todayPrev, today).totalHours);
	jsunit.assertEquals( (397 * 24 * 60) + 61, scopes.svyDateUtils.getDateDifference(todayPrev, today).totalMinutes);
	jsunit.assertEquals( (397 * 24 * 60 * 60) + 61 * 60 + 1, scopes.svyDateUtils.getDateDifference(todayPrev, today).totalSeconds);

	var todayNext = scopes.svyDateUtils.add(today, 1, 1, 1, 1, 1, 1);
	
	jsunit.assertEquals(398, scopes.svyDateUtils.getDateDifference(today, todayNext).days);
	jsunit.assertEquals(1, scopes.svyDateUtils.getDateDifference(today, todayNext).hours);
	jsunit.assertEquals(1, scopes.svyDateUtils.getDateDifference(today, todayNext).minutes);
	jsunit.assertEquals( (398 * 24) + 1, scopes.svyDateUtils.getDateDifference(today, todayNext).totalHours);
	jsunit.assertEquals( (398 * 24 * 60) + 61, scopes.svyDateUtils.getDateDifference(today, todayNext).totalMinutes);

	jsunit.assertEquals(-398, scopes.svyDateUtils.getDateDifference(todayNext, today).days);
	jsunit.assertEquals(-1, scopes.svyDateUtils.getDateDifference(todayNext, today).hours);
	jsunit.assertEquals(-1, scopes.svyDateUtils.getDateDifference(todayNext, today).minutes);
	jsunit.assertEquals(- (398 * 24) - 1, scopes.svyDateUtils.getDateDifference(todayNext, today).totalHours);
	jsunit.assertEquals(- (398 * 24 * 60) - 61, scopes.svyDateUtils.getDateDifference(todayNext, today).totalMinutes);

	// test Leap Year
	jsunit.assertEquals(366, scopes.svyDateUtils.getDateDifference(new Date(2024, 0, 1), new Date(2025, 0, 1)).days);

	// Test DST
	var summerDate = new Date(2023, 9, 28);
	summerDate.setHours(0, 0, 0, 0);

	var winterDate = new Date(2023, 9, 30);
	winterDate.setHours(0, 0, 0, 0);

	jsunit.assertEquals(2, scopes.svyDateUtils.getDateDifference(summerDate, winterDate).days);
	jsunit.assertEquals(0, scopes.svyDateUtils.getDateDifference(summerDate, winterDate).hours);
	jsunit.assertEquals(0, scopes.svyDateUtils.getDateDifference(summerDate, winterDate).minutes);

	jsunit.assertEquals( (2 * 24) + 1, scopes.svyDateUtils.getDateDifference(summerDate, winterDate).totalHours);
	jsunit.assertEquals( (2 * 24 * 60) + 60, scopes.svyDateUtils.getDateDifference(summerDate, winterDate).totalMinutes);

}

/**
 * @protected
 * @properties={typeid:24,uuid:"AD3ABCCF-EF8F-4BAE-B142-2D63400B4E4D"}
 */
function testGetDayDifference() {

	var today = new Date();
	var todayPrev = scopes.svyDateUtils.add(today, -1, -1, -1, -1, -1, -1);
	jsunit.assertEquals(397, scopes.svyDateUtils.getDayDifference(todayPrev, today));

	// count leap year
	var todayNext = scopes.svyDateUtils.add(today, 1, 1, 1, 1, 1, 1);
	jsunit.assertEquals(397, scopes.svyDateUtils.getDayDifference(today, todayNext));
	jsunit.assertEquals(-397, scopes.svyDateUtils.getDayDifference(todayNext, today));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"3E3F9DCD-5B8C-4E7A-80AE-25B4C38EBD55"}
 */
function testGetYearDifference() {
	var date = getFirstDayOfYear();

	var today = new Date();
	var todayPrev = scopes.svyDateUtils.add(today, -5, -4, -6, -2, 0, 0);
	jsunit.assertEquals(5, scopes.svyDateUtils.getYearDifference(todayPrev, today));

	var todayNext = scopes.svyDateUtils.add(today, 5, 4, 6, 2, 0, 0);
	jsunit.assertEquals(-5, scopes.svyDateUtils.getYearDifference(todayNext, today));

	date.setFullYear(1999)
	var compareDate = new Date(2018, 1, 1)
	compareDate.setHours(0, 0, 0, 0)
	jsunit.assertEquals(19, scopes.svyDateUtils.getYearDifference(date, compareDate));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"ACE3753F-6A1A-495C-A85A-C1B40B873663"}
 */
function testGetWeekOfYear() {

	jsunit.assertEquals(52, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 11, 31)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2024, 0, 1)));

	jsunit.assertEquals(33, scopes.svyDateUtils.getWeekOfYear(getDate()));
	jsunit.assertEquals(51, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 25)));
	jsunit.assertEquals(52, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 26)));
	jsunit.assertEquals(52, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 31)));
	jsunit.assertEquals(52, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 1)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 2)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 8)));
	jsunit.assertEquals(2, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 9)));

	// test on US locale-country
	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', i18n.getCurrentTimeZone())
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 1)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 7)));
	jsunit.assertEquals(2, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 8)));

	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 11, 31)));
	// AssertionFailedError: Expected:<52>, but was:<53>
	jsunit.assertEquals(52, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 25)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 26)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2022, 11, 31)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 1)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 1)));
	jsunit.assertEquals(2, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 2)));
	jsunit.assertEquals(2, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 8)));
	jsunit.assertEquals(3, scopes.svyDateUtils.getWeekOfYear(new Date(2023, 0, 9)));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"D668A6CB-E62F-4DC9-A8D3-7A9E164C3BFC"}
 */
function testGetDayOfWeek() {

	jsunit.assertEquals(1, scopes.svyDateUtils.getDayOfWeek(getDate()));
	jsunit.assertEquals(7, scopes.svyDateUtils.getDayOfWeek(getFirstDayOfYear()));

	jsunit.assertEquals(7, scopes.svyDateUtils.getDayOfWeek(new Date(2023, 11, 31)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getDayOfWeek(new Date(2024, 0, 1)));

	jsunit.assertEquals(7, scopes.svyDateUtils.getDayOfWeek(getDSTStart()));
	jsunit.assertEquals(7, scopes.svyDateUtils.getDayOfWeek(getDSTEnd()));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"ABC539CF-0D31-4080-9403-76EE8A952039"}
 */
function testGetDayOfYear() {

	// https://nsidc.org/data/user-resources/help-center/day-year-doy-calendar#:~:text=The%20day%20of%20year%20(DOY,years%20are%20divisible%20by%204.
	jsunit.assertEquals(226, scopes.svyDateUtils.getDayOfYear(getDate()));
	jsunit.assertEquals(1, scopes.svyDateUtils.getDayOfYear(getFirstDayOfYear()));

	jsunit.assertEquals(365, scopes.svyDateUtils.getDayOfYear(new Date(2023, 11, 31)));
	jsunit.assertEquals(1, scopes.svyDateUtils.getDayOfYear(new Date(2024, 0, 1)));

	jsunit.assertEquals(85, scopes.svyDateUtils.getDayOfYear(getDSTStart()));
	jsunit.assertEquals(302, scopes.svyDateUtils.getDayOfYear(getDSTEnd()));

	// leap year
	jsunit.assertEquals(303, scopes.svyDateUtils.getDayOfYear(new Date(2024, 9, 29)));
	jsunit.assertEquals(366, scopes.svyDateUtils.getDayOfYear(new Date(2024, 11, 31)));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"7AD2A8C0-EB47-40D6-ADF7-0EFF61D08D63"}
 */
function testGetFirstDayOfWeek() {

	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('14-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));

	// test 01-01-2023
	date = getFirstDayOfYear();
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('02-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('09-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2024
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// test leap year Feb 2024
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 1, 26)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 1, 27)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 1, 28)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 2, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 2, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('26-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 2, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('04-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 2, 4)), 'dd-MM-yyyy HH:mm:ss'));

	// change timezone
	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', 'UTC')
	
	jsunit.assertEquals('26-12-2022 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfWeek(new Date(2024, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));
}


/**
 * @protected
 * @properties={typeid:24,uuid:"AB7102FC-3FCE-4779-8F2F-3FBE9E7A0985"}
 */
function testGetFirstDayOfMonth() {

	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('01-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2024
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// test leap year Feb 2024
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 26)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 27)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 28)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 4)), 'dd-MM-yyyy HH:mm:ss'));
	
	// change timezone
	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', 'Pacific/Honolulu')
	
	// test 14-08-2023
	date = getDate();
	jsunit.assertEquals('01-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2023, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2024
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// test leap year Feb 2024
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 26)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 27)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 28)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfMonth(new Date(2024, 2, 4)), 'dd-MM-yyyy HH:mm:ss'));


}

/**
 * @protected
 * @properties={typeid:24,uuid:"5C9D349C-67DA-41D6-939C-AD68F8BE3C8E"}
 */
function testGetFirstDayOfYear() {

	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2023, 11, 31)), 'dd-MM-yyyy HH:mm:ss'));

	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('01-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getFirstDayOfYear(new Date(2024, 11, 31)), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"2A049CFC-562B-4234-B018-9FAC51D7CDA4"}
 */
function testGetFirstWeekDay() {

	// ISO-8601
	jsunit.assertEquals(1, scopes.svyDateUtils.getFirstWeekDay());
	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', 'UTC')
	jsunit.assertEquals(7, scopes.svyDateUtils.getFirstWeekDay());

}

/**
 * @protected
 * @properties={typeid:24,uuid:"DF40E1CC-E268-417C-8B5D-14C4E64DCF12"}
 */
function testGetFirstWeekDayNumber() {

	jsunit.assertEquals(2, scopes.svyDateUtils.getFirstWeekDayNumber());
	scopes.svyDateUtils.setLocaleAndTimeZone('en', 'US', 'UTC')

	// AssertionFailedError: Expected:1, but was: 2
	jsunit.assertEquals(1, scopes.svyDateUtils.getFirstWeekDayNumber());

}

/**
 * @protected
 * @properties={typeid:24,uuid:"DCF48FFE-C9B7-4970-AAA6-EA0D4F198761"}
 */
function testGetLastDayOfWeek() {

	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('20-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));

	// test 01-01-2023
	date = getFirstDayOfYear();
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('01-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('08-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('15-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2024
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2023, 11, 31)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('07-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('14-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('14-01-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 0, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// test leap year Feb 2024
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 1, 26)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 1, 27)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 1, 28)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 2, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 2, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('03-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 2, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('10-03-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfWeek(new Date(2024, 2, 4)), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"A2E3B4E8-06C6-4C0D-9312-D7E4FEBD7C75"}
 */
function testGetLastDayOfYear() {
	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2023, 0, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2023, 0, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2023, 11, 31)), 'dd-MM-yyyy HH:mm:ss'));

	jsunit.assertEquals('31-12-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2024, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfYear(new Date(2024, 11, 31)), 'dd-MM-yyyy HH:mm:ss'));
}

/**
 * @protected
 * @properties={typeid:24,uuid:"C9CAA0FD-C399-4BE8-B78C-5BF0D946E135"}
 */
function testGetLastDayOfMonth() {
	// test 14-08-2023
	var date = getDate();
	jsunit.assertEquals('31-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(date), 'dd-MM-yyyy HH:mm:ss'));

	// ISO 8601 2023
	jsunit.assertEquals('31-01-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 0, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('28-02-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 1, 2)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-03-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 2, 3)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-04-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 3, 4)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-05-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 4, 5)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-06-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 5, 6)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-07-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 6, 7)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-08-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 7, 8)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-09-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 8, 9)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-10-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 9, 9)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('30-11-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 10, 9)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('31-12-2023 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2023, 11, 9)), 'dd-MM-yyyy HH:mm:ss'));

	// test leap year Feb 2024
	jsunit.assertEquals('29-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2024, 1, 1)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2024, 1, 27)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2024, 1, 28)), 'dd-MM-yyyy HH:mm:ss'));
	jsunit.assertEquals('29-02-2024 00:00:00', utils.dateFormat(scopes.svyDateUtils.getLastDayOfMonth(new Date(2024, 1, 29)), 'dd-MM-yyyy HH:mm:ss'));

}

/**
 * @protected
 * @properties={typeid:24,uuid:"C9449BB1-A6B2-4164-8CF5-F21CDD35CD43"}
 */
function getDate() {
	var date = new Date(2023, 7, 14)
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"9595F26C-8F56-490D-A278-FE36BE4721EE"}
 */
function getFirstDayOfYear() {
	var date = new Date(2023, 0, 1)
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"FF732346-537D-47A8-A426-33D22A0E11DA"}
 */
function getDSTStart() {
	var date = new Date(2023, 2, 26)
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"6B980442-2A83-47D8-A0D5-3496DDF4BBEB"}
 */
function getDSTEnd() {
	var date = new Date(2023, 9, 29)
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * @properties={typeid:24,uuid:"0BEF6D5D-11DC-439A-8D9C-342C285A49C8"}
 */
function searchInMonth() {
var firstDT = scopes.svyDateUtils.getFirstDayOfMonth(application.getTimeStamp());	
var lastDT = scopes.svyDateUtils.toEndOfDay(scopes.svyDateUtils.getLastDayOfMonth(application.getTimeStamp()));
	
}
