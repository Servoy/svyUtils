/*
 * Date helper methods
 * 
 */

/**
 * A java.util.Calendar instance used to do the math
 * @private
 * @properties={typeid:35,uuid:"B530F9F6-F4AA-4032-90F2-165CE818F0E2",variableType:-4}
 */
var calendar = java.util.Calendar.getInstance();

/**
 * Adds the value of the given field to the given date
 * 
 * @private 
 * 
 * @param {Date} date
 * @param {Number} dateField
 * @param {Number} value
 * 
 * @return {Date}
 *
 * @properties={typeid:24,uuid:"4FA4B0E0-F216-4F8C-9C66-CD35B04341A5"}
 */
function addToDate(date, dateField, value) {
	calendar.setTimeInMillis(date.getTime());
	calendar.add(dateField, value);
	return new Date(calendar.getTimeInMillis());
}

/**
 * Adds the number of years, months, days, hours, minutes and seconds to the given date and returns a new date
 * 
 * @param {Date} date
 * @param {Number} years
 * @param {Number} months
 * @param {Number} days
 * @param {Number} hours
 * @param {Number} minutes
 * @param {Number} seconds
 * 
 * @return {Date} newDate
 *
 * @properties={typeid:24,uuid:"1DD3F28A-4DE2-4024-B9FD-74EB709A4DBE"}
 */
function add(date, years, months, days, hours, minutes, seconds) {
	calendar.setTimeInMillis(date.getTime());	
	calendar.add(java.util.Calendar.YEAR, years);
	calendar.add(java.util.Calendar.MONTH, months);
	calendar.add(java.util.Calendar.DATE, days);
	calendar.add(java.util.Calendar.HOUR, hours);
	calendar.add(java.util.Calendar.MINUTE, minutes);
	calendar.add(java.util.Calendar.SECOND, seconds);
	return new Date(calendar.getTimeInMillis());	
}

/**
 * Transposes a date object by the amount specified and returns a new date object
 * 
 * @param {Date} date
 * @param {Number} amount
 * @param {Number} units
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 * 
 * @author Sean
 *
 * @properties={typeid:24,uuid:"10750B47-4FF4-4E42-BEDB-50A4996F863A"}
 */
function addUnits(date, amount, units) {
	if(!date) throw new scopes.svyExceptions.IllegalArgumentException('date cannot be null/undefined', null, null);
	if(!amount) throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined', null, null);
	if(!units) throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined', null, null);
	date = new Date(date.valueOf());
	switch (units) {
		case scopes.svyUnits$time.HOUR:
			date.setHours(date.getHours() + amount);
			break;
		case scopes.svyUnits$time.DAY:
			date.setDate(date.getDate()+amount);
			break;
		case scopes.svyUnits$time.WEEK:
			date.setDate(date.getDate()+(amount*7));
			break;
		case scopes.svyUnits$time.MONTH:
			date.setMonth(date.getMonth()+amount);
			break;
		case scopes.svyUnits$time.YEAR:
			date.setFullYear(date.getFullYear()+amount);
			break;
		default:
			throw new scopes.svyExceptions.IllegalArgumentException('Unsupported value for units', null, null);
	}
	return date;
}

/**
 * Adds the given number of years to the given date and returns a new date<br>
 * Negative number of years will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} years - number of years to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"D3D23A5C-FB5E-444A-9235-FF2380626C37"}
 */
function addYears(date, years) {
	return addToDate(date, java.util.Calendar.YEAR, years);
}

/**
 * Adds the given number of months to the given date and returns a new dat<br>
 * Negative number of months will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} months - number of months to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"7358814D-F415-435A-9869-450322A991B8"}
 */
function addMonths(date, months) {
	return addToDate(date, java.util.Calendar.MONTH, months);
}

/**
 * Adds the given number of weeks to the given date and returns a new dat<br>
 * Negative number of weeks will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} weeks - number of weeks to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"37F5AB88-F314-443A-A3B0-C461358E268C"}
 */
function addWeeks(date, weeks) {
	return addToDate(date, java.util.Calendar.WEEK_OF_YEAR, weeks);
}

/**
 * Adds the given number of days to the given date and returns a new dat<br>
 * Negative number of days will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} days - number of days to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"01D13A1A-DE46-4781-9568-D47D35367A53"}
 */
function addDays(date, days) {
	return addToDate(date, java.util.Calendar.DATE, days);
}

/**
 * Adds the given number of hours to the given date and returns a new dat<br>
 * Negative number of hours will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} hours - number of hours to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"6AC6974F-7666-4BDE-AF33-8BA23C7D27AC"}
 */
function addHours(date, hours) {
	return addToDate(date, java.util.Calendar.HOUR, hours);
}

/**
 * Adds the given number of minutes to the given date and returns a new dat<br>
 * Negative number of minutes will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} minutes - number of minutes to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"B00B2AE8-3BDE-4F98-9CAD-E3956931DE0D"}
 */
function addMinutes(date, minutes) {
	return addToDate(date, java.util.Calendar.MINUTE, minutes);
}

/**
 * Adds the given number of seconds to the given date and returns a new dat<br>
 * Negative number of seconds will be substracted
 * 
 * @param {Date} date - the date to add to
 * @param {Number} seconds - number of seconds to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"F88A6297-AD9A-4D88-9E96-2DF4893565AA"}
 */
function addSeconds(date, seconds) {
	return addToDate(date, java.util.Calendar.SECOND, seconds);
}

/**
 * Sets the time of the given date to 00:00:00.000
 * 
 * @param {Date} date
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"7A83DF24-4C7B-4517-AEED-1510596FC3E1"}
 */
function toStartOfDay(date) {
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * Sets the time of the given date to 00:00:00
 * 
 * @param {Date} date
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"D2DFB7F8-D0B0-45B4-857F-6F62324D4D00"}
 */
function toEndOfDay(date) {
	date.setHours(23, 59, 59, 999);
	return date;
}

/**
 * Creates a from - to search String for the two dates<br>
 * 
 * The range starts at the given start date at 00:00:00 and<br>
 * ends at the given end date at 23:59:59<br>
 * 
 * @see createDateTimeSearchString(start,end) if exact datetime search is needed
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {String} searchString
 *
 * @properties={typeid:24,uuid:"5ED119D2-F223-4432-A961-1BB4F2EF89B1"}
 */
function createDateSearchString(start, end) {
	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);
	var pattern = "yyyy-MM-dd HH:mm:ss";
	var fromString = utils.dateFormat(start, pattern);
	var toString = utils.dateFormat(end, pattern);
	return fromString + "..." + toString + "|" + pattern;
}

/**
 * Creates a from - to search String for the two dates<br>
 * 
 * @see createDateSearchString(start, end) if date only search is needed
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {String} searchString
 *
 * @properties={typeid:24,uuid:"D748D1C1-C941-4DF9-8C2A-5252406C1F92"}
 */
function createDateTimeSearchString(start, end) {
	var pattern = "yyyy-MM-dd HH:mm:ss";
	var fromString = utils.dateFormat(start, pattern);
	var toString = utils.dateFormat(end, pattern);
	return fromString + "..." + toString + "|" + pattern;
}

/**
 * Returns the number of full days between the two dates
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {Number} fullDaysBetween
 *
 * @properties={typeid:24,uuid:"0A801EEE-CA27-4F06-A2ED-02D46F2E14B2"}
 */
function getDayDifference(start, end) {
	return Math.ceil(((end.getTime() - start.getTime()) / 86400000));
}

/**
 * Returns an array containing the names of the months for either the current or the given Locale
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} monthNames
 *
 * @properties={typeid:24,uuid:"3F10EB17-E55A-4C80-8C3B-B84BC1938C03"}
 */
function getMonthNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	return dfs.getMonths();
}

/**
 * Returns an array containing the short names of the months for either the current or the given Locale
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} shortMonthNames
 *
 * @properties={typeid:24,uuid:"CF428C70-D3BA-45D9-A34D-D676FB70A3F1"}
 */
function getShortMonthNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	return dfs.getShortMonths();
}

/**
 * Returns an array containing the names of the weekdays for either the current or the given Locale
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} weekdayNames
 * 
 * @example // returns an array of all week days in French<br>
 * var dayNames = scopes.svyDateUtils.getWeekdayNames("fr");
 *
 * @properties={typeid:24,uuid:"4778DD69-DE77-4D06-B3C6-12474DC3E97C"}
 */
function getWeekdayNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	return dfs.getWeekdays();
}

/**
 * Returns the week of the year of the given date<p>
 * 
 * Note that the week of year depends on the current Locale in what is 
 * considered the first day of week and the minimal number of days in the first week.
 * 
 * @param date
 * 
 * @return {Number} weekOfYear
 *
 * @properties={typeid:24,uuid:"DCC57BF8-DB94-46C5-A37E-2ED44AD8E4BC"}
 */
function getWeekOfYear(date) {
	calendar.setTimeInMillis(date.getTime());
	return calendar.get(java.util.Calendar.WEEK_OF_YEAR);
}

/**
 * Returns an array containing the short names of the weekdays for either the current or the given Locale
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} shortWeekdayNames
 * 
 * @example // returns an array of all the short names of the week days in French<br>
 * var dayNames = scopes.svyDateUtils.getShortWeekdayNames("fr");
 *
 * @properties={typeid:24,uuid:"16778B92-87AA-4CE0-9EBA-F1944ED16507"}
 */
function getShortWeekdayNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	return dfs.getWeekdays();
}

/**
 * Returns true if the given year is a leap year
 * 
 * @param {Number} year
 * 
 * @return {Boolean} isLeapYear
 *
 * @properties={typeid:24,uuid:"D7E92064-7783-46CE-953D-0974EE28CB70"}
 */
function isLeapYear(year) {
	var cal = new java.util.GregorianCalendar();
    return cal.isLeapYear(year);
}

/**
 * Returns the day of the week
 * 
 * @param {Date} date
 *
 * @return {Number} dayOfWeek
 * 
 * @properties={typeid:24,uuid:"8E96177F-7CC3-4D65-A32A-DB5370F5AEA0"}
 */
function getDayOfWeek(date) {
	calendar.setTimeInMillis(date.getTime());
	return calendar.get(java.util.Calendar.DAY_OF_WEEK);
}

/**
 * Returns the day of the year
 * 
 * @param {Date} date
 *
 * @return {Number} dayOfYear
 * 
 * @properties={typeid:24,uuid:"EE0C0A3C-45F8-4339-804A-CC322EAC1167"}
 */
function getDayOfYear(date) {
	calendar.setTimeInMillis(date.getTime());
	return calendar.get(java.util.Calendar.DAY_OF_WEEK);
}

/**
 * Returns a new date of the first day of the week of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfWeek
 *
 * @properties={typeid:24,uuid:"D428EE72-A164-4138-8176-046EF42991DF"}
 */
function getFirstDayOfWeek(date) {
	calendar.setTimeInMillis(date.getTime());
	var tmp = java.util.Calendar.getInstance();
	tmp.clear();
	tmp.set(java.util.Calendar.YEAR, calendar.get(java.util.Calendar.YEAR));
	tmp.set(java.util.Calendar.MONTH, calendar.get(java.util.Calendar.MONTH));
	tmp.set(java.util.Calendar.WEEK_OF_MONTH, calendar.get(java.util.Calendar.WEEK_OF_MONTH));
	return new Date(tmp.getTimeInMillis());
}

/**
 * Returns a new date of the first day of the month of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"D043339D-BA76-4D86-B3DB-7E314C46C902"}
 */
function getFirstDayOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns a new date of the first day of the month of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"1EC5F8CB-3B68-4BCA-A103-450822D50D2A"}
 */
function getFirstDayOfYear(date) {
	return new Date(date.getFullYear(), 0, 1);
}

/**
 * Returns a new date of the last day of the week of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfWeek
 *
 * @properties={typeid:24,uuid:"5A1D9EE9-28AD-406D-BF49-063936A488D0"}
 */
function getLastDayOfWeek(date) {
	calendar.setTimeInMillis(date.getTime());
	var tmp = java.util.Calendar.getInstance();
	tmp.clear();
	tmp.set(calendar.get(java.util.Calendar.YEAR), calendar.get(java.util.Calendar.MONTH), calendar.get(java.util.Calendar.DATE));
	tmp.add(java.util.Calendar.WEEK_OF_YEAR, 1);
	tmp.set(java.util.Calendar.DAY_OF_WEEK, calendar.getFirstDayOfWeek());
	tmp.add(java.util.Calendar.DATE, -1);
	return new Date(tmp.getTimeInMillis());
}

/**
 * Returns a new date of the last day of the year of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfYear
 *
 * @properties={typeid:24,uuid:"D44F025E-4FB8-45D2-B2AE-90B6E447485B"}
 */
function getLastDayOfYear(date) {
	calendar.setTimeInMillis(date.getTime());
	var tmp = java.util.Calendar.getInstance();
	tmp.clear();
	tmp.set(java.util.Calendar.YEAR,calendar.get(java.util.Calendar.YEAR) + 1);
	tmp.add(java.util.Calendar.DAY_OF_YEAR, -1);
	return new Date(tmp.getTimeInMillis());
}

/**
 * Returns a ISO 8601 formatted String of the given Date
 * 
 * @param {Date} date
 *
 * @properties={typeid:24,uuid:"9C359DEE-3A07-47AA-BDF6-036BE15F936B"}
 */
function getISODateTime(date) {
	return utils.dateFormat(date,"yyyyMMdd'T'HHmmss");
}

/**
 * Returns a ISO 8601 date only formatted String of the given Date
 * 
 * @param {Date} date
 *
 * @properties={typeid:24,uuid:"539C43A0-30CB-4CDB-96CD-4340698D3FB5"}
 */
function getISODate(date) {
	return utils.dateFormat(date,"yyyyMMdd");
}

/**
 * Returns a ISO 8601 time only formatted String of the given Date
 * 
 * @param {Date} date
 *
 * @properties={typeid:24,uuid:"68676C3F-B7FC-41BC-8444-31DF26C3132C"}
 */
function getISOTime(date) {
	return utils.dateFormat(date,"'T'HHmmss");
}

/**
 * Returns a new date of the last day of the month of the given date
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfMonth
 *
 * @properties={typeid:24,uuid:"8C74DB1F-EFA0-4B26-B0BC-5AFF537662E6"}
 */
function getLastDayOfMonth(date) {
	calendar.setTimeInMillis(date.getTime());
	var tmp = java.util.Calendar.getInstance();
	tmp.clear();
	tmp.set(java.util.Calendar.YEAR, calendar.get(java.util.Calendar.YEAR));
	tmp.set(java.util.Calendar.MONTH, calendar.get(java.util.Calendar.MONTH) + 1);
	tmp.add(java.util.Calendar.DATE, -1);
	return new Date(tmp.getTimeInMillis());
}

/**
 * Takes the time of the given date and returns the hours as a decimal value
 * 
 * @param {Date} date
 *
 * @properties={typeid:24,uuid:"891F26C0-B77B-44F3-8B1E-124AC99BCD0C"}
 */
function getDecimalHours(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes() / 60 + date.getSeconds() / 3600 + date.getMilliseconds() / 3600000;
	return hours + minutes;
}

/**
 * Creates a DateTime object that can be used to chain methods of this class<br>
 * as for example <code>dateTimeObject.addDays(5).toStartOfDay().date</code>
 * 
 * @constructor 
 * @param {Date} [date]
 *
 * @properties={typeid:24,uuid:"26749D5F-AB9D-46AE-951B-E3CC8B3E1B26"}
 */
function DateTime(date) {
	
	/**
	 * The Date object of this DateTime
	 */
	this.date = date ? date : new Date();
	
	/**
	 * Adds the given unit with the given amount to this date
	 * 
	 * @param {Number} unit - one of scopes.svyUnits$time
	 * @param {Number} amount
	 * 
	 * @throws {scopes.svyExceptions.IllegalArgumentException}
	 * 
	 * @return {DateTime}
	 */
	this.addUnits = function(unit, amount) {
		/** @type {DateTime} */
		var _this = this;
		if(!amount) throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined', null, null);
		if(!unit) throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined', null, null);
		switch (unit) {
			case scopes.svyUnits$time.HOUR:
				date.setHours(_this.date.getHours() + amount);
				break;
			case scopes.svyUnits$time.DAY:
				date.setDate(_this.date.getDate() + amount);
				break;
			case scopes.svyUnits$time.WEEK:
				date.setDate(_this.date.getDate() + (amount * 7));
				break;
			case scopes.svyUnits$time.MONTH:
				date.setMonth(_this.date.getMonth() + amount);
				break;
			case scopes.svyUnits$time.YEAR:
				date.setFullYear(_this.date.getFullYear() + amount);
				break;
			default:
				throw new scopes.svyExceptions.IllegalArgumentException('Unsupported value for units', null, null);
		}
		return this;
	}
	
	/**
	 * Adds the given number of days to the given date<br>
	 * Negative number of days will be substracted
	 *
	 * @param {Number} days - number of days to add
	 *
	 * @return {DateTime}
	 */
	this.addDays = function(days) {
		this.date = addDays(this.date, days);
		return this;
	}
	
	/**
	 * Adds the given number of hours to the given date<br>
	 * Negative number of hours will be substracted
	 *
	 * @param {Number} hours - number of hours to add
	 *
	 * @return {DateTime}
	 */
	this.addHours = function(hours) {
		this.date = addHours(this.date,hours);
		return this;
	}
	
	/**
	 * Adds the given number of minutes to the given date<br>
	 * Negative number of minutes will be substracted
	 *
	 * @param {Number} minutes - number of minutes to add
	 *
	 * @return {DateTime}
	 */
	this.addMinutes = function(minutes) {
		this.date = addMinutes(this.date,minutes);
		return this;
	}
	
	/**
	 * Adds the given number of months to the given date<br>
	 * Negative number of months will be substracted
	 *
	 * @param {Number} months - number of months to add
	 *
	 * @return {DateTime}
	 */
	this.addMonths = function(months) {
		this.date = addMonths(this.date,months);
		return this;
	}
	
	/**
	 * Adds the given number of seconds to the given date<br>
	 * Negative number of seconds will be substracted
	 *
	 * @param {Number} seconds - number of seconds to add
	 *
	 * @return {DateTime}
	 */
	this.addSeconds = function(seconds) {
		this.date = addSeconds(this.date,seconds);
		return this;
	}
	
	/**
	 * Adds the given number of weeks to the given date<br>
	 * Negative number of weeks will be substracted
	 *
	 * @param {Number} weeks - number of weeks to add
	 *
	 * @return {DateTime}
	 */
	this.addWeeks = function(weeks) {
		this.date = addWeeks(this.date,weeks);
		return this;
	}	
	
	/**
	 * Adds the given number of years to the given date<br>
	 * Negative number of years will be substracted
	 *
	 * @param {Number} years - number of years to add
	 *
	 * @return {DateTime}
	 */
	this.addYears = function(years) {
		this.date = addYears(this.date,years);
		return this;
	}
	
	/**
	 * Returns the day of the week
	 *
	 * @return {Number} dayOfWeek
	 */
	this.getDayOfWeek = function() {
		return getDayOfWeek(this.date);
	}
	
	/**
	 * Returns the day of the year
	 *
	 * @return {Number} dayOfYear
	 */
	this.getDayOfYear = function() {
		return getDayOfYear(this.date);
	}
	
	/**
	 * Returns the week of the year
	 * 
	 * @return {Number} weekOfYear
	 */
	this.getWeekOfYear = function() {
		return getWeekOfYear(this.date);
	}
	
	/**
	 * Sets the time of the given date to 00:00:00.000
	 * 
	 * @return {DateTime}
	 */
	this.toStartOfDay = function() {
		this.date = toStartOfDay(this.date);
		return this;
	}
	
	/**
	 * Sets the time of the given date to 23:59:59.999
	 * 
	 * @return {DateTime}
	 */
	this.toEndOfDay = function() {
		this.date = toEndOfDay(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the first day of the month
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toFirstDayOfMonth = function() {
		this.date = getFirstDayOfMonth(this.date);
		return this;
	}
	
	/**
	 * Sets this DateTime to the first day of the week
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toFirstDayOfWeek = function() {
		this.date = getFirstDayOfWeek(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the first day of the year
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toFirstDayOfYear = function() {
		this.date = getFirstDayOfWeek(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the first day of the month
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toLastDayOfMonth = function() {
		this.date = getLastDayOfMonth(this.date);
		return this;
	}
	
	/**
	 * Sets this DateTime to the last day of the week
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toLastDayOfWeek = function() {
		this.date = getLastDayOfWeek(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the last day of the year
	 * 
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toLastDayOfYear = function() {
		this.date = getLastDayOfWeek(this.date);
		return this;
	}		
}