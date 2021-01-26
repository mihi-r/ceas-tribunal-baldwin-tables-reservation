/**
 * The prefix for each time element in the calendar.
 */
export const TIME_PREFIX = 'time-';

/**
 * The start time.
 */
export const START_TIME = 6;

/**
 * The end time.
 */
export const END_TIME = 24;

/**
 * The JS date object.
 */
export const DATE_OBJECT = new Date();

/**
 * The current date.
 */
export const CURRENT_DATE = DATE_OBJECT.getDate();


/**
 * The current month.
 */
export const CURRENT_MONTH = DATE_OBJECT.getMonth();


/**
 * The current year.
 */
export const CURRENT_YEAR = DATE_OBJECT.getFullYear();

/**
 * The current weekday.
 */
export const CURRENT_WEEKDAY = DATE_OBJECT.getDay();

/**
 * The days of each month starting with January.
 */
export const DAYS_OF_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * The months.
 */
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

/**
 * The days of the weeks.
 */
export const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
