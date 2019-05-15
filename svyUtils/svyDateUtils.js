/*
 * The MIT License
 * 
 * This file is part of the Servoy Business Application Platform, Copyright (C) 2012-2016 Servoy BV 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

/* 
 * Date helper methods
 * TODO: methos that take a Date as param shoudl also allow taking a DateTime object as param
 */

/**
 * @private
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"45890609-A12D-49D1-A195-43BA3CAE4093",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.date');

/**
 * A java.util.Calendar instance used to do the math
 * 
 * @private
 * 
 * @properties={typeid:35,uuid:"D97BF23E-75BB-4458-AC19-5B31FAF3A053",variableType:-4}
 */
var calendar = java.util.Calendar.getInstance();

/**
 * @public
 * 
 * @enum
 * 
 * @final
 * 
 * @properties={typeid:35,uuid:"C2C3D6C7-F9D0-4CAB-9EE4-DD6BDF728E5D",variableType:-4}
 */
var UNITS = {
	HOUR: 100,
	DAY: 200,
	WEEK: 300,
	MONTH: 400,
	QUARTER: 500,
	YEAR: 600
};

/**
 * Date format styles used in getDateFormat
 * 
 * @public
 * 
 * @enum
 * 
 * @final
 * 
 * @properties={typeid:35,uuid:"CD475D68-BDAC-436D-B9BB-5D7D9D957F3B",variableType:-4}
 */
var DATE_FORMAT = {
	SHORT: java.text.DateFormat.SHORT,
	MEDIUM: java.text.DateFormat.MEDIUM,
	LONG: java.text.DateFormat.LONG,
	FULL: java.text.DateFormat.FULL
};

/**
 * The current date at 00:00:00.0
 * 
 * @public
 * 
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"05426994-8026-4634-8E03-5E12E69E3389",variableType:93}
 */
var TODAY_START;

/**
 * The current date at 23:59:59.999
 * 
 * @public
 * 
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"CA8FCCDE-7FBA-4815-B3AB-AF736BA0E445",variableType:93}
 */
var TODAY_END;

/**
 * @private
 * 
 * @type {Object}
 * 
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"EDBB02A9-A782-415A-927B-D3B5BDE9BA55",variableType:-4}
 */
var initTodayVars = (function() {
	setTodayVars();
	plugins.scheduler.addJob('svyDateUtils$setTodayVars', TODAY_START, setTodayVars, 1000 * 60 * 60 * 24);
}());

/**
 * @private
 *
 * @properties={typeid:24,uuid:"032931C2-A251-47E0-BD6D-E855DFFE7755"}
 */
function setTodayVars() {
	var now = new Date();
	TODAY_START = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
	TODAY_END = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

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
 * @properties={typeid:24,uuid:"95B13567-2AB2-4871-9573-81FD5D091D5C"}
 */
function addToDate(date, dateField, value) {
	calendar.setTimeInMillis(date.getTime());
	calendar.add(dateField, value);
	return new Date(calendar.getTimeInMillis());
}

/**
 * Adds the number of years, months, days, hours, minutes and seconds to the given date and returns a new date
 * 
 * @public
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
 * @properties={typeid:24,uuid:"BD51F7B3-70E4-4532-A14F-7F17111EC0D1"}
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
 * @public
 * 
 * @param {Date} date
 * @param {Number} amount
 * @param {Number} units
 * 
 * @return {Date}
 * 
 * @throws {scopes.svyExceptions.IllegalArgumentException}
 *
 * @properties={typeid:24,uuid:"93BFF9E9-ADE6-4E9C-9B24-182D177A09D7"}
 */
function addUnits(date, amount, units) {
	if (!date) {
		throw new scopes.svyExceptions.IllegalArgumentException('date cannot be null/undefined');
	}
	if (!amount) {
		throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined');
	}
	if (!units) {
		throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined');
	}
	date = new Date(date.valueOf());
	switch (units) {
		case UNITS.HOUR:
			date.setHours(date.getHours() + amount);
			break;
		case UNITS.DAY:
			date.setDate(date.getDate() + amount);
			break;
		case UNITS.WEEK:
			date.setDate(date.getDate() + (amount * 7));
			break;
		case UNITS.MONTH:
			date.setMonth(date.getMonth() + amount);
			break;
		case UNITS.YEAR:
			date.setFullYear(date.getFullYear() + amount);
			break;
		default:
			throw new scopes.svyExceptions.IllegalArgumentException('Unsupported value for units');
	}
	return date;
}

/**
 * Adds the given number of years to the given date and returns a new date<br>
 * Negative number of years will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} years - number of years to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"1D38256D-18CD-4D78-84FC-BC421591BAE1"}
 */
function addYears(date, years) {
	return addToDate(date, java.util.Calendar.YEAR, years);
}

/**
 * Adds the given number of months to the given date and returns a new dat<br>
 * Negative number of months will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} months - number of months to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"660C3569-F5FD-4D2F-AB4F-FDC4852B267B"}
 */
function addMonths(date, months) {
	return addToDate(date, java.util.Calendar.MONTH, months);
}

/**
 * Adds the given number of weeks to the given date and returns a new dat<br>
 * Negative number of weeks will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} weeks - number of weeks to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"465AEBAA-AA0A-48F2-9B73-3510BD4F0988"}
 */
function addWeeks(date, weeks) {
	return addToDate(date, java.util.Calendar.WEEK_OF_YEAR, weeks);
}

/**
 * Adds the given number of days to the given date and returns a new date<br>
 * Negative number of days will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} days - number of days to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"8E119128-4846-49F8-9193-29C7637465B0"}
 */
function addDays(date, days) {
	return addToDate(date, java.util.Calendar.DATE, days);
}

/**
 * Adds the given number of days to the given date and returns a new date<br>
 * Saturdays, Sundays and any dates in the optional holidays array are not counted<br>
 * Negative number of days will be substracted
 * 
 * @public 
 *
 * @param date the date to add or substract days to/from
 * @param days the number of days to be added/substracted
 * @param {Array<Date>} [holidays] optional array with dates to skip
 * 
 * @properties={typeid:24,uuid:"7E575AE1-AA0D-427D-9972-A2B1C1293912"}
 */
function addBusinessDays(date, days, holidays) {
	calendar.setTimeInMillis(date.getTime());
	var numberOfDaysToAdd = Math.abs(days);
	var daysToAdd = days < 0 ? -1 : 1;
	var businessDaysAdded = 0;
	
	/**
	 * @param {java.util.Calendar} dateToCheck
	 */
	function isHoliday(dateToCheck) {
		if (holidays && holidays.length > 0) {
			for (var i = 0; i < holidays.length; i++) {
				if (holidays[i].getFullYear() == dateToCheck.get(java.util.Calendar.YEAR) && holidays[i].getMonth() == dateToCheck.get(java.util.Calendar.MONTH) && holidays[i].getDate() == dateToCheck.get(java.util.Calendar.DAY_OF_MONTH)) {
					return true;
				}
			}
		}
		return false;
	}
	
	while (businessDaysAdded < numberOfDaysToAdd) {
		calendar.add(java.util.Calendar.DATE, daysToAdd);
		if (calendar.get(java.util.Calendar.DAY_OF_WEEK) == java.util.Calendar.SATURDAY || calendar.get(java.util.Calendar.DAY_OF_WEEK) == java.util.Calendar.SUNDAY) {
			// add another day
			continue;
		}
		if (isHoliday(calendar)) {
			// add another day
			continue;
		}
		businessDaysAdded ++;
	}
	
	return new Date(calendar.getTimeInMillis());
}

/**
 * Adds the given number of hours to the given date and returns a new dat<br>
 * Negative number of hours will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} hours - number of hours to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"DF5683B7-5B98-4425-A711-958D8CFDCAD7"}
 */
function addHours(date, hours) {
	return addToDate(date, java.util.Calendar.HOUR, hours);
}

/**
 * Adds the given number of minutes to the given date and returns a new dat<br>
 * Negative number of minutes will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} minutes - number of minutes to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"01F102D2-3604-4016-81C1-DEAB2E5AB06D"}
 */
function addMinutes(date, minutes) {
	return addToDate(date, java.util.Calendar.MINUTE, minutes);
}

/**
 * Adds the given number of seconds to the given date and returns a new dat<br>
 * Negative number of seconds will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} seconds - number of seconds to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"520A2683-27A9-49BE-BC10-545E489A0E5F"}
 */
function addSeconds(date, seconds) {
	return addToDate(date, java.util.Calendar.SECOND, seconds);
}

/**
 * Adds the given number of milliseconds to the given date and returns a new dat<br>
 * Negative number of milliseconds will be substracted
 * 
 * @public
 * 
 * @param {Date} date - the date to add to
 * @param {Number} milliseconds - number of seconds to add
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"A5EA88C3-4089-4B27-848A-12F4B91CACBD"}
 */
function addMilliseconds(date, milliseconds) {
	return addToDate(date, java.util.Calendar.MILLISECOND, milliseconds);
}

/**
 * Sets the time of the given date to 00:00:00.000
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"BCDB9198-AB26-4F32-AA41-126ABAE55448"}
 */
function toStartOfDay(date) {
	date.setHours(0, 0, 0, 0);
	return date;
}

/**
 * Sets the time of the given date to 00:00:00
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} result
 *
 * @properties={typeid:24,uuid:"177441D1-3D16-4948-86F8-059809A7ABF7"}
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
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {String} searchString
 * 
 * @see createDateTimeSearchString(start, end) if exact datetime search is needed
 *
 * @properties={typeid:24,uuid:"562F907F-FF35-4328-A138-B36953D8407C"}
 */
function createDateSearchString(start, end) {
	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);
	var pattern = 'yyyy-MM-dd HH:mm:ss';
	var fromString = utils.dateFormat(start, pattern);
	var toString = utils.dateFormat(end, pattern);
	return fromString + '...' + toString + '|' + pattern;
}

/**
 * Creates a date from the given week number in the given year<br>
 * <br>
 * NOTE: The week of year depends on the current Locale in what is<br> 
 * considered the first day of week and the minimal number of days in the first week.
 * 
 * @public
 * 
 * @param {Number} year
 * @param {Number} week
 * 
 * @return {Date}
 *
 * @properties={typeid:24,uuid:"9BE1A5B5-7882-4E15-8EC7-2578F0C6AC81"}
 */
function createDateFromWeekNumber(year, week) {
	calendar.clear();
	calendar.set(java.util.Calendar.YEAR,year);
	calendar.set(java.util.Calendar.WEEK_OF_YEAR,week);
	return new Date(calendar.getTimeInMillis());
}

/**
 * Creates a from - to search String for the two dates
 * 
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {String} searchString
 * 
 * @see createDateSearchString(start, end) if date only search is needed
 *
 * @properties={typeid:24,uuid:"8B6608CF-4DF5-461F-88F5-A4B949820E16"}
 */
function createDateTimeSearchString(start, end) {
	var pattern = 'yyyy-MM-dd HH:mm:ss';
	var fromString = utils.dateFormat(start, pattern);
	var toString = utils.dateFormat(end, pattern);
	return fromString + '...' + toString + '|' + pattern;
}

/**
 * Calculates someone's age from the given birthdate
 * 
 * @public
 * 
 * @param {Date} birthdate the date of birth
 * @param {Date} [compareDate] optional date to calculate from; if not given, the current date will be used
 * 
 * @return {{years: Number, months: Number, days: Number}} the age with number of years, months and days
 *
 * @properties={typeid:24,uuid:"CBDA6831-16E8-46F8-8C04-A3233037D7B5"}
 */
function getAge(birthdate, compareDate) {
	if (!compareDate) compareDate = new Date();
	
	if (compareDate < birthdate) {
		return {years: 0, months: 0, days: 0};
	}

	var years, months, days;

	var birthDay = java.util.Calendar.getInstance();
	birthDay.setTimeInMillis(birthdate.getTime());
	
	var now = java.util.Calendar.getInstance();
	now.setTimeInMillis(compareDate.getTime());
	
	years = now.get(java.util.Calendar.YEAR) - birthDay.get(java.util.Calendar.YEAR);
	
	var currMonth = now.get(java.util.Calendar.MONTH) + 1;
	var birthMonth = birthDay.get(java.util.Calendar.MONTH) + 1;
	months = currMonth - birthMonth;
	if (months < 0) {
		years--;
		months = 12 - birthMonth + currMonth;
		if (now.get(java.util.Calendar.DATE) < birthDay.get(java.util.Calendar.DATE)) {
			months--;
		}
	} else if (months == 0 && now.get(java.util.Calendar.DATE) < birthDay.get(java.util.Calendar.DATE)) {
		years--;
		months = 11;
	}
	
	if (now.get(java.util.Calendar.DATE) > birthDay.get(java.util.Calendar.DATE)) {
		days = now.get(java.util.Calendar.DATE) - birthDay.get(java.util.Calendar.DATE);
	} else if (now.get(java.util.Calendar.DATE) < birthDay.get(java.util.Calendar.DATE)) {
		var dayOfMonth = now.get(java.util.Calendar.DAY_OF_MONTH);
		now.add(java.util.Calendar.MONTH, -1);
		days = now.getActualMaximum(java.util.Calendar.DAY_OF_MONTH) - birthDay.get(java.util.Calendar.DAY_OF_MONTH) + dayOfMonth;
	} else {
		days = 0;
		if (months == 12) {
			years++;
			months = 0;
		}
	}

	return {years: years, months: months, days: days};
}

/**
 * Creates an object with the number of days, hours, minutes and seconds between two dates
 * 
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {{difference: Number, days: Number, hours: Number, minutes: Number, seconds: Number}}
 *
 * @properties={typeid:24,uuid:"05B6D44D-1EEB-48A2-8E3F-AFEF07BA4117"}
 */
function getDateDifference(start, end) {
	var difference = end.getTime() - start.getTime();
	
	var secondsInMillis = 1000;
	var minutesInMillis = secondsInMillis * 60;
	var hoursInMillis = minutesInMillis * 60;
	var daysInMillis = hoursInMillis * 24;
	
	var elapsedDays = Math.floor(difference / daysInMillis);
	difference = difference % daysInMillis;
	var elapsedHours = Math.floor(difference / hoursInMillis);
	difference = difference % hoursInMillis;
	var elapsedMinutes = Math.floor(difference / minutesInMillis);
	difference = difference % minutesInMillis;
	var elapsedSeconds = Math.floor(difference / secondsInMillis);
	return {difference: end.getTime() - start.getTime(), days: elapsedDays, hours: elapsedHours, minutes: elapsedMinutes, seconds: elapsedSeconds};
}

/**
 * Returns the date format for the default or the given locale using the given style (defaults to MEDIUM)
 * 
 * @public
 * 
 * @param {DATE_FORMAT} [style]	- see DATE_FORMAT for possible styles
 * @param {String} [locale]		- a locale String such as "en"
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"37934D5E-1015-422D-A489-84DC659D229F"}
 */
function getDateFormat(style, locale) {
	/** @type {Number} */
	var jStyle;
	if (!style) {
		jStyle = DATE_FORMAT.MEDIUM;
	} else {
		jStyle = style;
	}
	var jDateFormat;
	/** @type {java.text.SimpleDateFormat} */
	var jSimpleDateFormat;
	if (locale) {
		var jLocale = new java.util.Locale(locale);
		jDateFormat = java.text.DateFormat.getDateInstance(jStyle, jLocale);
		if (jDateFormat instanceof java.text.SimpleDateFormat) {
			/** @type {java.text.SimpleDateFormat} */
			jSimpleDateFormat = jDateFormat;
			return jSimpleDateFormat.toPattern();
		}
	} else {
		jDateFormat = java.text.DateFormat.getDateInstance(jStyle);
		if (jDateFormat instanceof java.text.SimpleDateFormat) {
			/** @type {java.text.SimpleDateFormat} */
			jSimpleDateFormat = jDateFormat;
			return jSimpleDateFormat.toPattern();
		}
	}
	return null;
}

/**
 * Returns the number of full days between the two dates
 * 
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {Number} fullDaysBetween
 *
 * @properties={typeid:24,uuid:"D9F78345-D31D-4A79-8C28-230F7BC467B4"}
 */
function getDayDifference(start, end) {
	var startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), 0);
	var endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds(), 0);
	var diff = Math.abs((startUtc.valueOf() - endUtc.valueOf()) / (24 * 60 * 60 * 1000));
	return diff;
}

/**
 * Returns the number of full months between the two dates
 * 
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {Number} fullMonthsBetween
 *
 * @properties={typeid:24,uuid:"D1A08B91-8418-41F3-9ACB-1DB2D9648A1C"}
 */
function getMonthDifference(start, end) {
	var age = getAge(start, end);
	return age.years*12 + age.months;
}

/**
 * Returns the number of full years between the two dates
 * 
 * @public
 * 
 * @param {Date} start
 * @param {Date} end
 * 
 * @return {Number} fullYearsBetween
 *
 * @properties={typeid:24,uuid:"4531D2BC-CCB4-42AB-A7EA-32CCF2ADF478"}
 */
function getYearDifference(start, end) {
	var age = getAge(start, end);
	return age.years;
}

/**
 * Gets what the minimal days required in the first week of the year are; e.g., if the first week is defined<br>
 * as one that contains the first day of the first month of a year, this method returns 1. If the minimal days<br>
 * required must be a full week, this method returns 7.
 * 
 * @public 
 * 
 * @return {Number} the minimal days required in the first week of the year
 *  
 * @properties={typeid:24,uuid:"EE43B7A9-5072-445A-ABBD-32DB08387D33"}
 */
function getMinimalDaysInFirstWeek() {
	return calendar.getMinimalDaysInFirstWeek();
}

/**
 * Returns an array containing the names of the months for either the current or the given Locale
 * 
 * @public
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} monthNames
 *
 * @properties={typeid:24,uuid:"943049F8-DA16-4044-91BD-8421206EB3D0"}
 */
function getMonthNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	var monthNames = dfs.getMonths();
	monthNames.pop();
	return monthNames;
}

/**
 * Creates a string for uses in Servoy between searches from two given dates.<br>
 * For example: "2006-01-01...2006-09-27|yyyy-MM-dd".
 * 
 * @public 
 * 
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"9D62A1EC-AC90-457E-8282-1CFEA2C46CD7"}
 */
function getSearchStringDateBetween(dateFrom, dateTo) {
	var format = 'yyyy-MM-dd HH:mm:ss';
	var from = new Date(dateFrom.getTime());
	from.setHours(0, 0, 0, 0);
	var to = new Date(dateTo.getTime());
	to.setHours(23, 59, 59, 999);
	return utils.dateFormat(from, format) + '...' + utils.dateFormat(to, format) + '|' + format;
}

/**
 * Creates a string for uses in Servoy between searches from two given dates including the exact given time.<br>
 * For example: "2006-01-01 10:23:15...2006-09-27 11:15:45|yyyy-MM-dd HH:mm:ss".
 * 
 * @public 
 * 
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"4D35B83B-4AFB-418B-9721-0FC549879D4D"}
 */
function getSearchStringDateTimeBetween(dateFrom, dateTo) {
	var format = 'yyyy-MM-dd HH:mm:ss';
	return utils.dateFormat(dateFrom, format) + '...' + utils.dateFormat(dateTo, format) + '|' + format;
}

/**
 * Returns an array containing the short names of the months for either the current or the given Locale
 * 
 * @public
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} shortMonthNames
 *
 * @properties={typeid:24,uuid:"7592A33A-09E1-4594-BC8A-A048532E11F0"}
 */
function getShortMonthNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	var monthNames = dfs.getShortMonths();
	monthNames.pop();
	return monthNames;
}

/**
 * Returns an array containing the names of the weekdays for either the current or the given Locale
 * 
 * @public
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} weekdayNames
 * 
 * @example // returns an array of all week days in French<br>
 * var dayNames = scopes.svyDateUtils.getWeekdayNames("fr");
 *
 * @properties={typeid:24,uuid:"06E0DFE5-0CC7-4B67-8AEF-138055EDE536"}
 */
function getWeekdayNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);	
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	var weekdays = dfs.getWeekdays();
	weekdays.shift();
	return weekdays;
}

/**
 * Returns the week of the year of the given date<br>
 * <br>
 * NOTE: the week of year depends on the current Locale in what is<br>
 * considered the first day of week and the minimal number of days in the first week.
 * 
 * @public
 * 
 * @param date
 * 
 * @return {Number} weekOfYear
 *
 * @properties={typeid:24,uuid:"F8627926-CBDA-4C82-949E-ED924C902BDB"}
 */
function getWeekOfYear(date) {
	calendar.setTimeInMillis(date.getTime());
	return calendar.get(java.util.Calendar.WEEK_OF_YEAR);
}

/**
 * Returns an array containing the short names of the weekdays for either the current or the given Locale
 * 
 * @public
 * 
 * @param {String} [locale] - the optional Locale
 * 
 * @return {String[]} shortWeekdayNames
 * 
 * @example // returns an array of all the short names of the week days in French<br>
 * var dayNames = scopes.svyDateUtils.getShortWeekdayNames("fr");
 *
 * @properties={typeid:24,uuid:"18721F93-8475-4680-A922-739A74B87C3A"}
 */
function getShortWeekdayNames(locale) {
	var dfs;
	if (locale) {
		var l = new java.util.Locale(locale);
		dfs = new java.text.DateFormatSymbols(l);		
	} else {
		dfs = new java.text.DateFormatSymbols();
	}
	var weekdays = dfs.getShortWeekdays();
	weekdays.shift();
	return weekdays;
}

/**
 * Returns the date format for the default or the given locale using the given style (defaults to MEDIUM)
 * 
 * @public
 * 
 * @param {DATE_FORMAT} [style]	- see DATE_FORMAT for possible styles
 * @param {String} [locale]		- a locale String such as "en"
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"E6077E21-20FF-459F-B494-C76F0A061B4C"}
 */
function getTimeFormat(style, locale) {
	/** @type {Number} */
	var jStyle;
	if (!style) {
		jStyle = DATE_FORMAT.MEDIUM;
	} else {
		jStyle = style;
	}
	var jDateFormat;
	/** @type {java.text.SimpleDateFormat} */
	var jSimpleDateFormat;
	if (locale) {
		var jLocale = new java.util.Locale(locale);
		jDateFormat = java.text.DateFormat.getTimeInstance(jStyle, jLocale);
		if (jDateFormat instanceof java.text.SimpleDateFormat) {
			/** @type {java.text.SimpleDateFormat} */
			jSimpleDateFormat = jDateFormat;
			return jSimpleDateFormat.toPattern();
		}
	} else {
		jDateFormat = java.text.DateFormat.getTimeInstance(jStyle);
		if (jDateFormat instanceof java.text.SimpleDateFormat) {
			/** @type {java.text.SimpleDateFormat} */
			jSimpleDateFormat = jDateFormat;
			return jSimpleDateFormat.toPattern();
		}
	}
	return null;
}

/**
 * Returns true if the given year is a leap year
 * 
 * @public
 * 
 * @param {Number} year
 * 
 * @return {Boolean} isLeapYear
 *
 * @properties={typeid:24,uuid:"D088D565-BD12-4640-87CF-B68D1BF465D0"}
 */
function isLeapYear(year) {
	var cal = new java.util.GregorianCalendar();
    return cal.isLeapYear(year);
}

/**
 * Returns the day of the week
 * 
 * @public
 * 
 * @param {Date} date
 * @param {Boolean} [useISO8601] if true, the ISO-8601 convention (where Monday is the first day of the week) is used
 *
 * @return {Number} dayOfWeek
 * 
 * @properties={typeid:24,uuid:"B7A77C91-7F99-4ED1-978B-1CB61D953249"}
 */
function getDayOfWeek(date, useISO8601) {
	calendar.setTimeInMillis(date.getTime());
	var dow = calendar.get(java.util.Calendar.DAY_OF_WEEK);
	if (useISO8601) {
		if (dow == 1) {
			dow = 7;
		} else {
			dow = dow - 1;
		}
	}
	return dow;
}

/**
 * Returns the day of the year
 * 
 * @public
 * 
 * @param {Date} date
 *
 * @return {Number} dayOfYear
 * 
 * @properties={typeid:24,uuid:"35AF5956-EF79-4C9C-BDA9-EF0F828E945A"}
 */
function getDayOfYear(date) {
	calendar.setTimeInMillis(date.getTime());
	return calendar.get(java.util.Calendar.DAY_OF_WEEK);
}

/**
 * Returns a new date of the first day of the week of the given date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfWeek
 *
 * @properties={typeid:24,uuid:"0683A145-8BA1-4C12-90F1-A646DA22972B"}
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
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"71A159C0-D42F-478B-9D82-65DD96745D81"}
 */
function getFirstDayOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns a new date of the first day of the month of the given date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"A94919B7-4EA9-4E78-A25E-A04554C43DE5"}
 */
function getFirstDayOfYear(date) {
	return new Date(date.getFullYear(), 0, 1);
}

/**
 * Gets what the minimal days required in the first week of the year are; e.g., if the first week is 
 * defined as one that contains the first day of the first month of a year, this method returns 1. 
 * If the minimal days required must be a full week, this method returns 7.
 * 
 * @public 
 * 
 * @return {Number} the minimal days required in the first week of the year
 * 
 * @properties={typeid:24,uuid:"3A12D23A-D9C7-4257-A476-3B8E98717377"}
 */
function getFirstWeekDayNumber() {
	return calendar.getFirstDayOfWeek();
}

/**
 * Returns a new date of the last day of the week of the given date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfWeek
 *
 * @properties={typeid:24,uuid:"2F02AF7E-37DC-4610-B55E-2B6E5EA95B02"}
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
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfYear
 *
 * @properties={typeid:24,uuid:"1D0F9079-63BE-4999-BB24-597340D2C07D"}
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
 * @public
 * 
 * @param {Date} date
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"7F519BC0-F9BF-4162-B243-FD1AB2CE3581"}
 */
function getISODateTime(date) {
	return utils.dateFormat(date, 'yyyyMMdd\'T\'HHmmss');
}

/**
 * Returns a ISO 8601 date only formatted String of the given Date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"A5FA8C56-3A85-43DE-8F55-594659FF56E2"}
 */
function getISODate(date) {
	return utils.dateFormat(date, 'yyyyMMdd');
}

/**
 * Returns a ISO 8601 time only formatted String of the given Date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {String}
 *
 * @properties={typeid:24,uuid:"78F71D31-063E-4341-B5C1-579C0B2E93C6"}
 */
function getISOTime(date) {
	return utils.dateFormat(date, '\'T\'HHmmss');
}

/**
 * Returns a new date of the last day of the month of the given date
 * 
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Date} lastDayOfMonth
 *
 * @properties={typeid:24,uuid:"27CE5406-5029-485F-98F5-DA3A7AF17A7A"}
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
 * @public
 * 
 * @param {Date} date
 * 
 * @return {Number}
 *
 * @properties={typeid:24,uuid:"E4550770-C64A-4CEA-8659-3DD6ADCEFE29"}
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
 * @public
 * 
 * @constructor 
 * 
 * @param {Date} [date]
 *
 * @properties={typeid:24,uuid:"55DB0D7E-712A-47B8-8A54-4689C658FF08"}
 */
function DateTime(date) {
	
	if (!(this instanceof DateTime)) {
		log.warn("scopes.svyDateUtils.DateTime: Constructor functions should be called with the \"new\" keyword!");
		return new DateTime(date)
	}
	
	/**
	 * The Date object of this DateTime
	 */
	this.date = date ? date : application.getServerTimeStamp();
	
	/**
	 * Adds the given unit with the given amount to this date
	 * 
	 * @param {Number} unit - one of {@link #UNITS}
	 * @param {Number} amount
	 * 
	 * @throws {scopes.svyExceptions.IllegalArgumentException}
	 * @this {DateTime}
	 * @return {DateTime}
	 */
	this.addUnits = function(unit, amount) {
		if(!amount) throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined');
		if(!unit) throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined');
		switch (unit) {
			case UNITS.HOUR:
				date.setHours(this.date.getHours() + amount);
				break;
			case UNITS.DAY:
				date.setDate(this.date.getDate() + amount);
				break;
			case UNITS.WEEK:
				date.setDate(this.date.getDate() + (amount * 7));
				break;
			case UNITS.MONTH:
				date.setMonth(this.date.getMonth() + amount);
				break;
			case UNITS.YEAR:
				date.setFullYear(this.date.getFullYear() + amount);
				break;
			default:
				throw new scopes.svyExceptions.IllegalArgumentException('Unsupported value for units');
		}
		return this;
	}
	
	/**
	 * Adds the given number of days to the given date<br>
	 * Negative number of days will be substracted
	 *
	 * @param {Number} days - number of days to add
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
	 * @return {DateTime}
	 */
	this.toStartOfDay = function() {
		this.date = toStartOfDay(this.date);
		return this;
	}
	
	/**
	 * Sets the time of the given date to 23:59:59.999
	 * @this {DateTime}
	 * @return {DateTime}
	 */
	this.toEndOfDay = function() {
		this.date = toEndOfDay(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the first day of the month
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toFirstDayOfYear = function() {
		this.date = getFirstDayOfYear(this.date);
		return this;
	}	
	
	/**
	 * Sets this DateTime to the first day of the month
	 * @this {DateTime}
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
	 * @this {DateTime}
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
	 * @this {DateTime}
	 * @return {DateTime}
	 *
	 * @properties={typeid:24,uuid:"7C02ADA9-3E54-4D48-9A36-81D228CDD802"}
	 */
	this.toLastDayOfYear = function() {
		this.date = getLastDayOfYear(this.date);
		return this;
	}
	
	return this;
}

/**
 * Checks if a value is one of the defined time units
 * 
 * @public
 * 
 * @param {Number} value
 * 
 * @return {Boolean}
 * 
 * @properties={typeid:24,uuid:"99754644-EE04-407C-B132-734F4BC54E0E"}
 */
function isValueTimeUnit(value){
	if (!value) {
		throw new scopes.svyExceptions.IllegalArgumentException('Value is required');
	}
	var values = [
		UNITS.HOUR,
		UNITS.DAY,
		UNITS.WEEK,
		UNITS.MONTH,
		UNITS.QUARTER,
		UNITS.YEAR
	];
	for (var i in values) {
		if (value == values[i]) {
			return true;
		}
	}
	return false;
}

/**
 * Returns true when date time starts at 00:00:00
 * 
 * @public
 * 
 * @param {Date} date
 *  
 * @return {Boolean}
 * 
 * @properties={typeid:24,uuid:"5CA6DDF5-5988-4B68-BB07-77C4B602A1C4"}
 */
function isStartOfDay(date) {
	if (!date) {
		throw new scopes.svyExceptions.IllegalArgumentException('Date is required');
	}
	if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0 && date.getMilliseconds() == 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * Duration object constructor
 * 
 * @constructor 
 * 
 * @public 
 * 
 * @param {Boolean} [isNegative]
 * @param {Number} [weeks]
 * @param {Number} [days]
 * @param {Number} [hours]
 * @param {Number} [minutes]
 * @param {Number} [seconds]
 *
 * @properties={typeid:24,uuid:"072256B9-F18C-44DA-82B1-8C80F3F5240B"}
 */
function Duration(isNegative, weeks, days, hours, minutes, seconds) {
	if (!(this instanceof Duration)) {
		//constructor called without the "new" keyword
		return new Duration(isNegative, weeks, days, hours, minutes, seconds);
	}
	
	/**
	 * the negative flag
	 * @type {Boolean}
	 */
	this.negative = isNegative instanceof Boolean ? isNegative : false;
	
	/**
	 * the number of days of this duration
	 * @type {Number}
	 */
	this.days = days >= 0 ? days : 0;
	
	/**
	 * the number of hours of this duration
	 * @type {Number}
	 */
	this.hours = hours >= 0 ? hours : 0;
	
	/**
	 * the number of minutes of this duration
	 * @type {Number}
	 */
	this.minutes = minutes >= 0 ? minutes : 0;
	
	/**
	 * the number of seconds of this duration
	 * @type {Number}
	 */
	this.seconds = seconds >= 0 ? seconds : 0;
	
	/**
	 * the number of weeks of this duration
	 * @type {Number}
	 */
	this.weeks = weeks >= 0 ? weeks : 0;
	
	/**
	 * Number of milliseconds of this duration
	 * @type {Number}
	 */
	this.duration = 0;
	Object.defineProperty(this,'duration', {
		get: function() {
			var duration = 0;
			duration = this.weeks * 7 * 24 * 60 * 60 * 1000;
			duration += this.days * 24 * 60 * 60 * 1000;
			duration += this.hours * 60 * 60 * 1000;
			duration += this.minutes * 60 * 1000;
			duration += this.seconds * 1000;
			return duration;
		},
		set: function(dur) {
			var start = new Date();
			var end = new Date(start.getTime() + dur);
			this.fillFieldsFromDates(start, end);
		}
	});
	
	/**
	 * Fills all the fields of this duration using the given start and end dates
	 * @param {Date} start
	 * @param {Date} end
	 */
	this.fillFieldsFromDates = function(start, end) {
		var startCal = java.util.Calendar.getInstance();
		startCal.setTimeInMillis(start.getTime());
		var endCal = java.util.Calendar.getInstance();
		endCal.setTimeInMillis(end.getTime());
		
		this.negative = startCal.compareTo(endCal) > 0;
		if (this.negative) {
			startCal.setTimeInMillis(end.getTime());
			endCal.setTimeInMillis(start.getTime());
		}
		
		var dur = 0;
		
		 // Count days to get to the right year (loop in the very rare chance
	    // that a leap year causes us to come up short)
	    var numOfYears = endCal.get(java.util.Calendar.YEAR) - startCal.get(java.util.Calendar.YEAR);
	    while (numOfYears > 0) {
	        startCal.add(java.util.Calendar.DATE, 365 * numOfYears);
	        dur += 365 * numOfYears;
	        numOfYears = endCal.get(java.util.Calendar.YEAR) - startCal.get(java.util.Calendar.YEAR);
	    }
	    
	    // Count days to get to the right day
	    dur += endCal.get(java.util.Calendar.DAY_OF_YEAR) - startCal.get(java.util.Calendar.DAY_OF_YEAR);
	    
	    // Count hours to get to right hour
	    dur *= 24; // days -> hours
	    dur += endCal.get(java.util.Calendar.HOUR_OF_DAY) - startCal.get(java.util.Calendar.HOUR_OF_DAY);
	    
	    // ... to the right minute
	    dur *= 60; // hours -> minutes
	    dur += endCal.get(java.util.Calendar.MINUTE) - startCal.get(java.util.Calendar.MINUTE);
	    
	    // ... and second
	    dur *= 60; // minutes -> seconds
	    dur += endCal.get(java.util.Calendar.SECOND) - startCal.get(java.util.Calendar.SECOND);
	    
	    // Now unwind our units
	    this.seconds = dur % 60;
	    dur = dur / 60; // seconds -> minutes (drop remainder seconds)
	    this.minutes = Math.floor(dur % 60);
	    dur /= 60; // minutes -> hours (drop remainder minutes)
	    this.hours = Math.floor(dur % 24);
	    dur /= 24; // hours -> days (drop remainder hours)
	    this.days = Math.floor(dur);
	    this.weeks = 0;

	    // Special case for week-only representation
	    if (this.seconds === 0 && this.minutes === 0 && this.hours === 0
	            && (this.days % 7) === 0) {
	        this.weeks = this.days / 7;
	        this.days = 0;
	    }
	}
	
	/**
	 * Returns the end of the duration from the given start
	 * @param {Date} startDate
	 * @return {Date}
	 */
	this.getEndOfDuration = function(startDate) {
		calendar.setTimeInMillis(startDate.getTime());
        if (this.negative) {
        	calendar.add(java.util.Calendar.WEEK_OF_YEAR, -this.weeks);
        	calendar.add(java.util.Calendar.DAY_OF_WEEK, -this.days);
        	calendar.add(java.util.Calendar.HOUR_OF_DAY, -this.hours);
        	calendar.add(java.util.Calendar.MINUTE, -this.minutes);
        	calendar.add(java.util.Calendar.SECOND, -this.seconds);
        }
        else {
        	calendar.add(java.util.Calendar.WEEK_OF_YEAR, this.weeks);
        	calendar.add(java.util.Calendar.DAY_OF_WEEK, this.days);
        	calendar.add(java.util.Calendar.HOUR_OF_DAY, this.hours);
        	calendar.add(java.util.Calendar.MINUTE, this.minutes);
        	calendar.add(java.util.Calendar.SECOND, this.seconds);
        }
        return new Date(calendar.getTimeInMillis());
	}
	
	/**
	 * Reverses the duration
	 */
	this.negate = function() {
		this.negative = !this.negative;
	}
	
	/**
	 * Creates an ISO String of the duration (e.g. P15DT5H0M20S)
	 * @return {String}
	 */
	this.getIso = function() {
		var result = '';
		if (this.negative) {
			result += '-';
		}
		result += 'P';
		if (this.weeks > 0) {
			result += this.weeks;
			result += 'W';
		} else {
			if (this.days > 0) {
				result += this.days;
				result += 'D';
			}
			if (this.hours > 0 || this.minutes > 0 || this.seconds > 0) {
				result += 'T';
				if (this.hours > 0) {
					result += this.hours;
					result += 'H';
				}
				if (this.minutes > 0) {
					result += this.minutes;
					result += 'M';
				}
				if (this.seconds > 0) {
					result += this.seconds;
					result += 'S';
				}
			}
		}
		return result;
	}
}

/**
 * Creates a duration from the given start and end dates
 * 
 * @public 
 * 
 * @param {Date} start the start of the duration
 * @param {Date} end the end of the duration
 * 
 * @return {Duration}
 *
 * @properties={typeid:24,uuid:"E5339DAB-CC7B-4A5D-948F-FE9F54410149"}
 */
function createDurationFromDates(start, end) {
	var duration = new Duration();
	duration.fillFieldsFromDates(start, end);
	return duration;
}

/**
 * Returns a Date[] array with all dates between start and end that are not
 * on one of the given nonWorkingDays and not included in the given
 * exceptions
 * 
 * @public 
 *
 * @param {Date} startDate the start date
 * @param {Date} endDate the end date
 * @param {Array<Number>} nonWorkingDays Array of non-working days (SUN = 0, MON = 1, TUE = 2, WED = 3, THU = 4, FRI = 5, SAT = 6)
 * @param {Array<Date>} [exceptions] Array of specific non-working dates to exclude such as holidays
 *
 * @properties={typeid:24,uuid:"F98A303A-D463-401A-BF41-4982516071BE"}
 */
function getWorkingDays(startDate, endDate, nonWorkingDays, exceptions) {
	var result = [];
	
	var start = new Date(startDate.getTime());
	var end = new Date(endDate.getTime());

	// Make sure we are only looking at the day
	start.setHours(0, 0, 0, 0);
	// add a millisecond, so the last day is included in the check
	end.setHours(0, 0, 0, 1);

	var dayOfWeek;
	var skipDay;

	/**
	 * @param {Date} date1
	 * @param {Date} date2
	 */
	function isSameDay(date1, date2) {
		return date1.getFullYear() === date2.getFullYear() && 
			date1.getMonth() === date2.getMonth() && 
			date1.getDate() === date2.getDate();
	}

	do {
		dayOfWeek = start.getDay();
		skipDay = false;
		if (nonWorkingDays && nonWorkingDays.indexOf(dayOfWeek) !== -1) {
			skipDay = true;
		}
		if (exceptions != null) {
			for (var i = 0; i < exceptions.length; i++) {
				if (isSameDay(exceptions[i], start)) {
					skipDay = true;
					break;
				}
			}
		}
		if (!skipDay) {
			result.push(new Date(start.getTime()));
		}

		start = new Date(start.getTime() + (1000 * 60 * 60 * 24));
	} while (start.getTime() < end.getTime());

	return result;
}

/**
 * Creates a date from a Oadate (Microsoft OLE Automation)
 * 
 * @public 
 * @param {Number} oaDate
 * @return {Date}
 * 
 * @properties={typeid:24,uuid:"53AA0D1F-2D44-45BA-8DBA-FC09A3502992"}
 */
function createDateFromOADate(oaDate) {
	var epoch = new Date(1899,11,30);
	var msPerDay = 8.64e7;
	var dec = oaDate - Math.floor(oaDate);
	
	if (oaDate < 0 && dec) {
		oaDate = Math.floor(oaDate) - dec;
	}
	
	return new Date(oaDate*msPerDay + +epoch);
}

/**
 * Creates a oaDate (Microsoft OLE Automation) from a date
 * 
 * @public 
 * @param {Date} date
 * @return {Number}
 *
 * @properties={typeid:24,uuid:"ABE2DBF0-2C5F-48C3-B94E-C952CAC3E7B5"}
 */
function createOADateFromDate(date) {
	var epoch = new Date(1899,11,30);
	var msPerDay = 8.64e7;
	var oaDate = -1 * (epoch - date)/msPerDay;
	var dec = oaDate - Math.floor(oaDate);
	
	if (oaDate < 0 && dec) {
		oaDate = Math.floor(oaDate) - dec;
	}
	
	return oaDate;
}
