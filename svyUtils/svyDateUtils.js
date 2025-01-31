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

/**
 * @private
 *
 * @SuppressWarnings(unused)
 *
 * @properties={typeid:35,uuid:"45890609-A12D-49D1-A195-43BA3CAE4093",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('com.servoy.bap.utils.date');

/**
 * @type {java.time.ZoneId}
 * @private
 *
 * @properties={typeid:35,uuid:"B5F1B378-17E1-4256-937E-F0F1731BF1EF",variableType:-4}
 */
var zoneId = java.time.ZoneId.of(i18n.getCurrentTimeZone());

/**
 * @type {java.time.ZoneId}
 * @private
 * 
 * @properties={typeid:35,uuid:"218C7CDA-A529-483E-807A-7949EA1E276E",variableType:-4}
 */
var systemZoneId =  java.time.ZoneId.systemDefault()

/**
 * @type {java.util.Locale}
 * @private
 *
 * @properties={typeid:35,uuid:"62C21E71-5331-4505-AAFB-300638B843A1",variableType:-4}
 */
var i18nLocale = new java.util.Locale(i18n.getCurrentLanguage(), i18n.getCurrentCountry());

/**
 * @type {java.time.temporal.WeekFields}
 *
 * @properties={typeid:35,uuid:"8C19571F-18D1-42D5-83ED-5B1862C303A9",variableType:-4}
 */
var weekFields = java.time.temporal.WeekFields.of(i18nLocale);

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

	/** @type {java.time.temporal.TemporalUnit} */
	var unit 
	var zonedDateTime = getZonedDateTimeFromDate(date)
	var instant = zonedDateTime.toInstant();
	
	if (hours) {
		unit = java.time.temporal.ChronoUnit.HOURS
		instant = instant.plus(hours, unit);
	}
	if (minutes) {
		unit = java.time.temporal.ChronoUnit.MINUTES
		instant = instant.plus(minutes, unit);
	}
	if (seconds) {
		unit = java.time.temporal.ChronoUnit.SECONDS
		instant = instant.plus(seconds, unit);
	}
	
	// 
	var result = getDateFromZonedInstant(instant);
	return getDateFromLocalDateTime(
	getLocalDateTimeFromDate(result)
			.plusYears(years)
			.plusMonths(months)
			.plusDays(days)
	);
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
	return getDateFromLocalDateTime(
		getLocalDateTimeFromDate(date).plusYears(years)
	);
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
	return getDateFromLocalDateTime(
		getLocalDateTimeFromDate(date).plusMonths(months)
	);
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
	return getDateFromLocalDateTime(
		getLocalDateTimeFromDate(date).plusWeeks(weeks)
	);
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
	return getDateFromLocalDateTime(
		getLocalDateTimeFromDate(date).plusDays(days)
	);
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
 * @return {Date}
 *
 * @properties={typeid:24,uuid:"7E575AE1-AA0D-427D-9972-A2B1C1293912"}
 */
function addBusinessDays(date, days, holidays) {
	var startDate = getLocalDateFromDate(date);
	var currentDate = startDate;
	if (!holidays) holidays = [];

	var businessDaysAdded = 0;
	var numberOfDaysToAdd = Math.abs(days);

	/**
	 * @type {Array<java.time.LocalDate>}
	 */
	var holidayDates = holidays.map(
		/**
	 * @param {Date} holiday
	 */
	function(holiday) {
		return getLocalDateFromDate(holiday);
	}
	)

	/**
	 * @param {java.time.LocalDate} dateToCheck
	 * @return {Boolean}
	 */
	function isWorkingDay(dateToCheck) {
		var dayOfWeek = dateToCheck.getDayOfWeek();
		var isWeekDay = dayOfWeek != java.time.DayOfWeek.SATURDAY && dayOfWeek != java.time.DayOfWeek.SUNDAY;
		if (!isWeekDay) {
			return false;
		}
		return holidayDates.indexOf(dateToCheck) === -1;
	}

	while (businessDaysAdded < numberOfDaysToAdd) {
		if (days >= 0) {
			currentDate = currentDate.plusDays(1);
		} else {
			currentDate = currentDate.minusDays(1);
		}
		
		if (isWorkingDay(currentDate)) {
			businessDaysAdded++;
		}
	}

	return getDateFromLocalDateTime(currentDate);
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
	var zonedDateTime = getZonedDateTimeFromDate(date);
	
	/** @type {java.time.temporal.TemporalUnit} */
	var unit = java.time.temporal.ChronoUnit.HOURS
	var instant = zonedDateTime.toInstant();
	instant = instant.plus(hours, unit);
	
	return getDateFromZonedInstant(instant);
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
	
	var zonedDateTime = getZonedDateTimeFromDate(date)
	
	/** @type {java.time.temporal.TemporalUnit} */
	var unit = java.time.temporal.ChronoUnit.MINUTES
	var instant =zonedDateTime.toInstant()
	instant = instant.plus(minutes, unit);
	
	return getDateFromZonedInstant(instant);
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
	var zonedDateTime = getZonedDateTimeFromDate(date)
	
	/** @type {java.time.temporal.TemporalUnit} */
	var unit = java.time.temporal.ChronoUnit.SECONDS;
	var instant =zonedDateTime.toInstant()
	instant = instant.plus(seconds, unit);
	
	return getDateFromZonedInstant(instant);
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
	return new Date(date.getTime() + milliseconds);
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
	date.setHours(23, 59, 59, 0);
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
	var localDate = getLocalDateFromDate().atStartOfDay()
		.withYear(year)
		.with(weekFields.weekOfYear(), week)
		.with(weekFields.dayOfWeek(), 1);
	return getDateFromLocalDateTime(localDate);
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
	var birthLocalDate = getLocalDateFromDate(birthdate);
	var compareLocalDate;
	if (compareDate) {
		compareLocalDate = getLocalDateFromDate(compareDate);
	} else {
		compareLocalDate = java.time.LocalDate.now();
	}

	var period = java.time.Period.between(birthLocalDate, compareLocalDate);

	return { years: period.getYears(), months: period.getMonths(), days: period.getDays() };
}

/**
 * Creates an object with the number of days, hours, minutes and seconds between two dates
 *
 * @public
 *
 * @param {Date} start
 * @param {Date} end
 *
 * @return {{difference: Number, days: Number, hours: Number, minutes: Number, seconds: Number, totalHours: Number, totalMinutes: Number, totalSeconds: Number}}
 *
 * @properties={typeid:24,uuid:"05B6D44D-1EEB-48A2-8E3F-AFEF07BA4117"}
 */
function getDateDifference(start, end) {
	var localDateStart = getLocalDateTimeFromDate(start);
	var localDateEnd = getLocalDateTimeFromDate(end);

	var difference = localDateEnd.atZone(zoneId).toInstant().toEpochMilli() - localDateStart.atZone(zoneId).toInstant().toEpochMilli(); 
	var days = java.time.temporal.ChronoUnit.DAYS.between(localDateStart, localDateEnd);
	var totalHours = java.time.temporal.ChronoUnit.HOURS.between(localDateStart, localDateEnd);
	var totalMinutes = java.time.temporal.ChronoUnit.MINUTES.between(localDateStart, localDateEnd);
	var totalSeconds = java.time.temporal.ChronoUnit.SECONDS.between(localDateStart, localDateEnd);
	
	var secondsInMillis = 1000;
	var minutesInMillis = secondsInMillis * 60;
	var hoursInMillis = minutesInMillis * 60;

	var elapsedHours = difference >=0 ? Math.floor(difference / hoursInMillis) : Math.ceil(difference / hoursInMillis)
	var elapsedMinutes =  difference >=0 ? Math.floor(difference / minutesInMillis) : Math.ceil(difference / minutesInMillis);
	var elapsedSeconds =  difference >=0 ? Math.floor(difference / secondsInMillis) : Math.ceil(difference / secondsInMillis);

	var hours = totalHours % 24;
	var minutes = totalMinutes % 60;
	var seconds = totalSeconds % 60;

	return { difference: difference, days: days, hours: hours, minutes: minutes, seconds: seconds, totalHours: elapsedHours, totalMinutes: elapsedMinutes, totalSeconds: elapsedSeconds };
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
	var startLocalDateTime = getLocalDateTimeFromDate(start);
	var endLocalDateTime = getLocalDateTimeFromDate(end);
	var duration = java.time.Duration.between(startLocalDateTime, endLocalDateTime);
	return duration.toDays();
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
	var startLocalDateTime = getLocalDateFromDate(start);
	var endLocalDateTime = getLocalDateFromDate(end);
	var period = java.time.Period.between(startLocalDateTime, endLocalDateTime);
	return (period.getYears() * 12) + period.getMonths();
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
	var startLocalDateTime = getLocalDateFromDate(start);
	var endLocalDateTime = getLocalDateFromDate(end);
	var period = java.time.Period.between(startLocalDateTime, endLocalDateTime);
	return period.getYears();
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
	return weekFields.getMinimalDaysInFirstWeek();
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
	var localDate = getLocalDateFromDate(date);
	// TODO weekOfYear vs weekOfWeekBasedYear: returns 0 or 52 if date falls into previous year week ( e.g. 1,1,2023 )
	return localDate.get(weekFields.weekOfWeekBasedYear());
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
	return java.time.Year.isLeap(year);
}

/**
 * Returns the day of the week
 *
 * @public
 *
 * @param {Date} date
 * @param {Boolean} [useISO8601] deprecated - this method will always return ISO8601
 *
 * @return {Number} dayOfWeek
 *
 * @properties={typeid:24,uuid:"B7A77C91-7F99-4ED1-978B-1CB61D953249"}
 */
function getDayOfWeek(date, useISO8601) {
	var localDate = getLocalDateFromDate(date);
	return localDate.getDayOfWeek().getValue();
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
	var localDate = getLocalDateFromDate(date);
	return localDate.getDayOfYear();
}

/**
 * Returns a new date of the first day of the week of the given date
 *
 * @public
 *
 * @param {Date} [date]
 *
 * @return {Date} firstDayOfWeek
 *
 * @properties={typeid:24,uuid:"0683A145-8BA1-4C12-90F1-A646DA22972B"}
 */
function getFirstDayOfWeek(date) {
	if (!date) {
		date = new Date();
	}
	var localDate = getLocalDateFromDate(date);
	var firstDay = localDate.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
	return getDateFromLocalDateTime(firstDay);
}

/**
 * Returns a new date of the first day of the month of the given date
 *
 * @public
 *
 * @param {Date} [date]
 *
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"71A159C0-D42F-478B-9D82-65DD96745D81"}
 */
function getFirstDayOfMonth(date) {
		
	if (!date) {
		date = new Date();
	}
	var localDate = getLocalDateFromDate(date);
	var firstDay = localDate.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth());
	return getDateFromLocalDateTime(firstDay);
}

/**
 * Returns a new date of the first day of the month of the given date
 *
 * @public
 *
 * @param {Date} [date]
 *
 * @return {Date} firstDayOfMonth
 *
 * @properties={typeid:24,uuid:"A94919B7-4EA9-4E78-A25E-A04554C43DE5"}
 */
function getFirstDayOfYear(date) {
	if (!date) {
		date = new Date();
	}
	var localDate = getLocalDateFromDate(date);
	var firstDay = localDate.with(java.time.temporal.TemporalAdjusters.firstDayOfYear());
	return getDateFromLocalDateTime(firstDay);
}

/**
 * Gets what the first day of the week is; e.g., SUNDAY in the U.S., MONDAY in France.
 *
 * This method uses the old Java calendar implementation where Sunday is day 1
 *
 * @public
 *
 * @deprecated use getFirstWeekDay insted
 *
 * @return {Number} the minimal days required in the first week of the year
 *
 * @properties={typeid:24,uuid:"3A12D23A-D9C7-4257-A476-3B8E98717377"}
 */
function getFirstWeekDayNumber() {
	return java.util.Calendar.getInstance().getFirstDayOfWeek();
}

/**
 * Gets the first day-of-week.
 *
 * The first day-of-week varies by culture. For example, the US uses Sunday, while France and the ISO-8601 standard use Monday.
 *
 * The value returned follows the ISO-8601 standard, from 1 (Monday) to 7 (Sunday).
 *
 * @public
 *
 * @return {Number} the first day of the week in the current locale
 *
 * @properties={typeid:24,uuid:"43B2EBBD-A4BE-4003-90D3-785EE7EDDD9C"}
 */
function getFirstWeekDay() {
	var firstDay = weekFields.getFirstDayOfWeek();
	return firstDay.getValue();
}

/**
 * Returns a new date of the last day of the week of the given date
 *
 * @public
 *
 * @param {Date} [date]
 *
 * @return {Date} lastDayOfWeek
 *
 * @properties={typeid:24,uuid:"2F02AF7E-37DC-4610-B55E-2B6E5EA95B02"}
 */
function getLastDayOfWeek(date) {
	if (!date) {
		date = new Date();
	}
	var dayOfWeek = java.time.temporal.WeekFields.ISO.dayOfWeek();
	var localDate = getLocalDateTimeFromDate(date);
	return getDateFromLocalDateTime(localDate.with(dayOfWeek, dayOfWeek.range().getMaximum()));
}

/**
 * Returns a new date of the last day of the year of the given date
 *
 * @public
 *
 * @param {Date} [date]
 *
 * @return {Date} lastDayOfYear
 *
 * @properties={typeid:24,uuid:"1D0F9079-63BE-4999-BB24-597340D2C07D"}
 */
function getLastDayOfYear(date) {
	if (!date) {
		date = new Date();
	}
	var year = java.time.Year.of(date.getFullYear());
	return getDateFromLocalDateTime(year.atMonth(12).atEndOfMonth());
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
 * @param {Date} [date]
 *
 * @return {Date} lastDayOfMonth
 *
 * @properties={typeid:24,uuid:"27CE5406-5029-485F-98F5-DA3A7AF17A7A"}
 */
function getLastDayOfMonth(date) {
	if (!date) {
		date = new Date();
	}
	var yearMonth = java.time.YearMonth.of(date.getFullYear(), date.getMonth() + 1);
	return getDateFromLocalDateTime(yearMonth.atEndOfMonth());
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

	if (! (this instanceof DateTime)) {
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
		if (!amount) throw new scopes.svyExceptions.IllegalArgumentException('amount cannot be null/undefined');
		if (!unit) throw new scopes.svyExceptions.IllegalArgumentException('units cannot be null/undefined');
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
		this.date = addHours(this.date, hours);
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
		this.date = addMinutes(this.date, minutes);
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
		this.date = addMonths(this.date, months);
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
		this.date = addSeconds(this.date, seconds);
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
		this.date = addWeeks(this.date, weeks);
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
		this.date = addYears(this.date, years);
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
function isValueTimeUnit(value) {
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
	if (! (this instanceof Duration)) {
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
	Object.defineProperty(this, 'duration', {
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
		var duration = java.time.Duration.between(getLocalDateTimeFromDate(start), getLocalDateTimeFromDate(end));

		this.seconds = Math.abs(duration.toSecondsPart());
		this.minutes = Math.abs(duration.toMinutesPart());
		this.hours = Math.abs(duration.toHoursPart());
		this.days = Math.abs(duration.toDaysPart());

		// Special case for week-only representation
	    if (this.seconds === 0 && this.minutes === 0 && this.hours === 0
	            && (this.days % 7) === 0) {
			this.weeks = this.days / 7;
			this.days = 0;
		}

		if (duration.isNegative()) {
			this.negative = true;
		}
	}

	/**
	 * Returns the end of the duration from the given start
	 * @param {Date} startDate
	 * @return {Date}
	 */
	this.getEndOfDuration = function(startDate) {
		var localStartDate = getLocalDateTimeFromDate(startDate);
		var numberOfDays = this.weeks > 0 ? this.weeks * 7 + this.days : this.days;
		var duration = java.time.Duration.ofDays(numberOfDays).plusHours(this.hours).plusMinutes(this.minutes).plusSeconds(this.seconds);
		if (this.negative) {
			duration = duration.negated();
		}
		return getDateFromLocalDateTime(localStartDate.plus(duration));
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
		/** @type {String} */
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
 * @return {Array<Date>}
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
	var epoch = new Date(1899, 11, 30);
	var msPerDay = 8.64e7;
	var dec = oaDate - Math.floor(oaDate);

	if (oaDate < 0 && dec) {
		oaDate = Math.floor(oaDate) - dec;
	}

	return new Date(oaDate * msPerDay + +epoch);
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
	var epoch = new Date(1899, 11, 30);
	var msPerDay = 8.64e7;
	var oaDate = -1 * (epoch - date) / msPerDay;
	var dec = oaDate - Math.floor(oaDate);

	if (oaDate < 0 && dec) {
		oaDate = Math.floor(oaDate) - dec;
	}

	return oaDate;
}

/**
 * NG client only
 *
 * Returns the date object with current date and time of the client.
 * This call will really return a date and time that is the local client date time.
 * This is useful when searching on the date when the client is using the format property (UseLocalDateTime = true).
 *
 * @public
 * @param {Date} date
 * @return {Date} returns the local date time
 *
 * @example<pre>
 *
 *  // Server running on timezone Europe/Amsterdam GMT + 1:00
 *  // NG Client running from the different timezone GMT
 *
 *  application.output(foundset.dateofbirth) => 02/11/2021 00:00:00 GMT+1:00
 *  application.output(scopes.svyDateUtils.getLocalDateTime(date)) => 01/11/2021 23:00:00 GMT+1:00
 *
 *  </pre>
 *
 * @properties={typeid:24,uuid:"EA440042-9CF1-4A1B-8F68-B08341F02661"}
 */
function getLocalDateTime(date) {

//	if (!scopes.svySystem.isNGClient() && !scopes.svySystem.isTINGClient()) {
//		application.output("getLocalDateTime is an NG Client only method; returning the date as it is in the current client", LOGGINGLEVEL.WARNING)
//		return date;
//	}
	
	var localDateTime = java.time.Instant.ofEpochMilli(date.getTime()).atZone(zoneId).toLocalDateTime();
	return new Date(localDateTime.atZone(systemZoneId).toInstant().toEpochMilli());
}

/**
 * NG client only
 *
 * Returns the clientDate object with current date and time of the server.
 * This call will really return a date and time that is the server date time.
 * This is useful when searching on the date relative to the client's date time (for example, find all orders of today)
 *
 * @public
 * @param {Date} clientDate
 * @return {Date} returns the server date
 *
 * @example<pre>
 *
 *  // Server running on timezone Europe/Amsterdam GMT + 1:00
 *  // NG Client running from the different timezone GMT
 *  // Search all orders of today
 *
 *  var today = scopes.svyDateUtils.toStartOfDay(application.getTimeStamp());
 *  var serverToday = scopes.svyDateUtils.getServerDateTime(today);
 *
 *  var endOfToday = scopes.svyDateUtils.toEndOfDay(application.getTimeStamp());
 *  var serverEndOfToday = scopes.svyDateUtils.getServerDateTime(endOfToday);
 *
 *  application.output(today) => 02/11/2021 00:00:00 GMT+1:00
 *  application.output(serverToday) => 02/11/2021 01:00:00 GMT+1:00
 *
 *  application.output(endOfToday) => 02/11/2021 23:59:59 GMT+1:00
 *  application.output(serverEndOfToday) => 03/11/2021 00:59:59 GMT+1:00
 *
 *  // search all the orders for today
 *  var q = datasources.db.example_data.orders.createSelect();
 *  q.where.add(q.columns.orderdate.ge(serverToday));
 *  q.where.add(q.columns.orderdate.le(serverEndOfToday));
 *  foundset.loadRecords(q);
 *
 *  </pre>
 *
 * @properties={typeid:24,uuid:"74A5FFB4-40B9-4AE6-98DF-B0BD97F7F2E8"}
 */
function getServerDateTime(clientDate) {

//	if (!scopes.svySystem.isNGClient() && !scopes.svySystem.isTINGClient()) {
//		application.output("getServerDateTime is an NG Client only method; returning the date as it is in the current client", LOGGINGLEVEL.WARNING)
//		return clientDate;
//	}
	
	var localDateTime = java.time.Instant.ofEpochMilli(clientDate.getTime()).atZone(systemZoneId).toLocalDateTime();
	return new Date(localDateTime.atZone(zoneId).toInstant().toEpochMilli());
}

/**
 * In NG gets the current timezone of the server
 *
 * @public
 * @return {String}
 * @properties={typeid:24,uuid:"7D0A91B2-88DC-49BC-8A8B-52FA7BBDF3DB"}
 */
function getServerTimeZone() {
	return java.util.TimeZone.getDefault().getID();
}

/**
 * TODO shall this method be public ?
 * @protected
 *
 * Returns the time offset, expressed in minutes, between the local time and the server time for the given date.
 * To note the timezone offset between client & server it may depending on the given date because of Daylight Saving Time (DST);
 * This method takes into account the
 *
 * @param {Date} date
 * @return {Number} offset between client expressed in minutes
 * @properties={typeid:24,uuid:"46BEAEDE-2F46-4CE2-9C0D-B23EB67AFFAD"}
 */
function getLocalDateTimeOffset(date) {
	var serverTimeZone = getServerTimeZone();
	var timeZoneToString = i18n.getCurrentTimeZone();

	var timeZoneTo = java.time.ZoneId.of(serverTimeZone);
	var timeZoneFrom = java.time.ZoneId.of(timeZoneToString);
	var now = java.time.LocalDateTime.now();
	if (date) {
		now = java.time.LocalDateTime.of(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
	}
	var fromZonedDateTime = now.atZone(timeZoneFrom);
	var toZonedDateTime = now.atZone(timeZoneTo);

	var diff = java.time.Duration.between(fromZonedDateTime, toZonedDateTime).toMinutes();

	return diff;
}

/**
 * Returns true if the given format has the useLocalDateTime flag
 *
 * @param {String} format
 * @return {Boolean}
 *
 * @public
 *
 * @properties={typeid:24,uuid:"CF1156C3-D756-48DC-8704-1FE4C455DBA5"}
 */
function formatUsesLocalDateTime(format) {
	if (!format) {
		return false;
	}

	if (format instanceof String) {
		try {

			// the format may be an i18n string
			if (format.indexOf("i18n:") == 0) {
				format = i18n.getI18NMessage(format.replace("i18n:", ""));
			}

			// test for useLocalDateTime
			if (format.indexOf("useLocalDateTime") > -1) {

				/** @type {{useLocalDateTime:Boolean}} */
				var formatJSON = JSON.parse(format);
				if (formatJSON.useLocalDateTime == true) {
					return true
				}
			}

		} catch (e) {
			application.output(e, LOGGINGLEVEL.WARNING);
		}
	}

	return false;
}

/**
 * @private 
 * @param {java.time.Instant|java.time.temporal.Temporal} instant
 * 
 * @return {Date}
 *
 * @properties={typeid:24,uuid:"F1B0B7DF-0DE3-4B67-A522-285820D53116"}
 */
function getDateFromZonedInstant(instant) {
	/** @type {java.time.Instant} */
	var inst = instant;
	var localDateTime = java.time.LocalDateTime.ofInstant(inst, zoneId);
	return getDateFromLocalDateTime(localDateTime);
}

/**
 * @private 
 * @param {Date} [date]
 * 
 * @return {java.time.ZonedDateTime}
 *
 * @properties={typeid:24,uuid:"BDD4F3FA-47C1-4827-906A-4BDEA5A6E1A9"}
 */
function getZonedDateTimeFromDate(date) {
	if (!date) {
		date = new Date();
	}
	
	return java.time.Instant.ofEpochMilli(date.getTime()).atZone(systemZoneId).withZoneSameLocal(zoneId);
}

/**
 * Returns a LocalDateTime object from the given date or now
 *
 * @param {Date} [date]
 *
 * @return {java.time.LocalDate}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"8ECE5B12-1705-4D16-B21B-65C91F9B2DC0"}
 */
function getLocalDateFromDate(date) {
		
//	if (atSystemZone !== true) {
//		// translate the date to the server offset. So when localOffset is applied, goes back to 0
//		date = getServerDateTime(date);
//	}
	
	/** @type {java.time.LocalDate} */
	var result = getZonedDateTimeFromDate(date).toLocalDate();
	return result;
}

/**
 * Returns a LocalDateTime object from the given date or now
 *
 * @param {Date} [date]
 *
 * @return {java.time.LocalDateTime}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3CC592DB-7E89-4DBC-91F1-99FD7C9B4850"}
 */
function getLocalDateTimeFromDate(date) {
	
//	if (atSystemZone !== true) {
//		// translate the date to the server offset. So there is no shift in time/date when local zone is applied
//		date = getServerDateTime(date);
//	}
	
	/** @type {java.time.LocalDateTime} */
	var result = getZonedDateTimeFromDate(date).toLocalDateTime();
	return result;
}

/**
 * Returns a Date from a LocalDateTime object
 *
 * @param {java.time.LocalDateTime|java.time.temporal.Temporal} [localDateTime]
 *
 * @return {Date}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F058D9D0-1180-47C9-8168-ACEBEE8F17E5"}
 */
function getDateFromLocalDateTime(localDateTime) {
		
	if (!localDateTime) {
		localDateTime = getZonedDateTimeFromDate().toLocalDateTime();
	}
	if (localDateTime instanceof java.time.LocalDate) {
		/** @type {java.time.LocalDate} */
		var localDate = localDateTime;
		localDateTime = localDate.atStartOfDay();
	}
	var date = new Date(localDateTime.atZone(systemZoneId).toInstant().toEpochMilli());
	return date;
}

/**
 * Sets the locale and timeZoneId used for the different calculations in this scope
 *
 * @param {String} language
 * @param {String} country
 * @param {String} timeZoneId
 *
 * @public
 *
 * @properties={typeid:24,uuid:"1D808B6A-A5EC-4CE9-A7C9-601A91E4746D"}
 */
function setLocaleAndTimeZone(language, country, timeZoneId) {
	if (language && country) {
		i18nLocale = new java.util.Locale(language, country);
		weekFields = java.time.temporal.WeekFields.of(i18nLocale);
	}
	if (timeZoneId) {
		zoneId = java.time.ZoneId.of(timeZoneId);
	}
}
