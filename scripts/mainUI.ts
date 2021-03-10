import { displayWarning, getElementIdNumber, validateInputFieldData } from './common/uiElements';
import { CURRENT_DATE, CURRENT_MONTH, CURRENT_WEEKDAY, CURRENT_YEAR, DAYS_OF_MONTH, DAYS_OF_WEEK, END_TIME, MONTHS, START_TIME, TIME_PREFIX } from './constants/generalConstants';
import { Reservations } from './models/reservations';
import { ReservationSubmission } from './models/reservationSubmission';

let chosenTable = "leftright";
let traverseMonth = CURRENT_MONTH;
let traverseDate = CURRENT_DATE;
let traverseWeekday = CURRENT_WEEKDAY;
let traverseYear = CURRENT_YEAR;
let isMonthChanged = false;
let isYearChanged = false;
let isNewMonthInWindow = false;
let isSelecting = false;

/**
 * Register more info button to expand details about the calendar.
 */
export const registerMoreInfoButton = function() {
    const moreInfoButton: HTMLParagraphElement = document.querySelector(".calendar-buttons .more-info");
    const calendarInfo: HTMLDivElement = document.querySelector(".calendar-info");
    moreInfoButton.onclick = function() {
        // Expand info
        if (calendarInfo.style.maxHeight) {
            calendarInfo.style.maxHeight = null;
        } else {
            calendarInfo.style.maxHeight = calendarInfo.scrollHeight + "px";
        }

        while (moreInfoButton.firstChild) {
            moreInfoButton.removeChild(moreInfoButton.firstChild);
        }

        if (moreInfoButton.classList.contains("active")) {
            const infoSymbol = document.createElement("i");
            infoSymbol.setAttribute("class", "fas fa-info");

            moreInfoButton.appendChild(infoSymbol);
            moreInfoButton.classList.remove("active");
        } else {
            const closeSymbol = document.createElement("i");
            closeSymbol.setAttribute("class", "fas fa-times");

            moreInfoButton.appendChild(closeSymbol);
            moreInfoButton.classList.add("active");
        }
    }
}

/**
 * Register selection of tables and scroll to calendar when selected.
 */
export const registerTableSelection = function() {
    const selectEventTimeContainer: HTMLAnchorElement = document.querySelector("#select-event-time");
    const tableRadioButtons: NodeListOf<HTMLDivElement> = document.querySelectorAll(".table-selection .radio-button");
    const nextButton: HTMLLIElement = document.querySelector('.calendar .head .next');

    tableRadioButtons.forEach(function(radioButton) {
        radioButton.onclick = function() {
            setSelectedTable();

            selectEventTimeContainer.style.display = "block";
    
            setTimeout(function() {
                selectEventTimeContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                generateCalendarTimes();
                generateCalendar(traverseMonth, traverseYear, traverseDate, traverseWeekday, nextButton);
            }, 100);
        }
    });
}

/**
 * Register scroll hint to let the user know that they can scroll the calendar.
 */
export const registerScrollHint = function() {
    const scrollHint: HTMLParagraphElement = document.querySelector(".calendar-buttons .scroll-hint");
    const calendar: HTMLDivElement = document.querySelector(".calendar");

    calendar.onscroll = function() {
        if (!scrollHint.classList.contains("done")) {
            scrollHint.classList.add("done");
        }
    }
}

/**
 * Register next button on the calendar to populate the next set of dates and reserved times.
 */
export const registerCalendarNextButtonClick = function() {
    const nextButton: HTMLLIElement = document.querySelector('.calendar .head .next');
    const prevButton: HTMLLIElement = document.querySelector('.calendar .head .prev');

    nextButton.onclick = function() {
        clearCalendarData();
    
        for (let i = 0; i < 7; i++)  {
            traverseWeekday = incrementWeekDay(traverseWeekday, "forward");
            traverseDate = incrementDate(traverseDate, traverseMonth, traverseYear, "forward", true);
        }
    
        if (isMonthChanged) {
            traverseMonth++;
            if (isYearChanged) {
                traverseMonth = 0;
                traverseYear++;
            }
        }
    
        prevButton.style.visibility = "visible";
        generateCalendar(traverseMonth, traverseYear, traverseDate, traverseWeekday, nextButton);
    }
}

/**
 * Register previous button on the calendar to populate the previous set of dates and reserved times.
 */
export const registerCalendarPrevButtonClick = function() {
    const prevButton: HTMLLIElement = document.querySelector('.calendar .head .prev');

    prevButton.onclick = function() {
        clearCalendarData();
    
        for (let i = 0; i < 7; i++)  {
            traverseWeekday = incrementWeekDay(traverseWeekday, "backward");
            traverseDate = incrementDate(traverseDate, traverseMonth, traverseYear, "backward", true);
        }
    
        if (isMonthChanged) {
            traverseMonth--;
            if (isYearChanged) {
                traverseMonth = 11;
                traverseYear--;
            }
        }
    
        if (traverseDate == CURRENT_DATE && traverseMonth == CURRENT_MONTH && traverseYear == CURRENT_YEAR) {
            prevButton.style.visibility = "hidden";
        }
    
        generateCalendar(traverseMonth, traverseYear, traverseDate, traverseWeekday, prevButton);
    }
}

/**
 * Register mouse events for calendar times.
 */
export const registerCalendarTimesMouseEvents = function() {
    const bodyElement: HTMLBodyElement = document.querySelector("body");
    const calendarTimes: HTMLDivElement = document.querySelector(".calendar .all-times");

    calendarTimes.onmousedown = function() {
        isSelecting = true;
    }
    
    bodyElement.onmouseup = function() {
        isSelecting = false;
    }
    
    calendarTimes.onmousemove = function() {
        if(isSelecting === true) {
            let selectedTime: HTMLLIElement = document.querySelector(".times li:hover");
            if (!selectedTime.classList.contains("reserved") && !selectedTime.classList.contains("tentative")) {
                if (!selectedTime.classList.contains("selected")) {
                    selectTimeElement(selectedTime);
                }
            }
        }
    }
}

/**
 * Register calendar clear button to remove user selected times.
 */
export const registerClearCalendarButton = function() {
    const clearCalendarButton: HTMLParagraphElement = document.querySelector(".calendar-buttons .clear");

    clearCalendarButton.onclick = function() {
        const existingTimeElements: NodeListOf<HTMLLIElement> = document.querySelectorAll(".calendar .selected");

        existingTimeElements.forEach(function(timeElement) {
            timeElement.classList.remove("selected");
        });
    }
}

/**
 * Register calendar continue button to generate the reservation form.
 */
export const registerContinueCalendarButton = function() {
    const continueCalendarButton: HTMLParagraphElement = document.querySelector(".calendar-buttons .continue");

    continueCalendarButton.onclick = function() {
        let timeElements: HTMLLIElement[] = Array.from(document.querySelectorAll(".calendar .selected"));
        if (timeElements.length !== 0) {
            if (isMultiRange(timeElements)) {
                displayWarning("Only one time range is allowed. Please select contiguous time slots. " +
                    "To request for multiple time ranges, you will need to make multiple request submissions.");
            } else {
                let selectedTimeStart = getSelectedTimeStart(timeElements);
                let selectedTimeEnd = getSelectedTimeEnd(timeElements);
                let selectedDate = getSelectedDate(timeElements);
                let selectedWeekDay = getSelectedWeekDay(timeElements);
                let selectedMonth = getSelectedMonth(selectedDate);
                let selectedYear = getSelectedYear(selectedDate, selectedMonth);
                generateReservationForm(selectedTimeStart, selectedTimeEnd, selectedDate, selectedMonth, selectedYear, selectedWeekDay);
            }
        }
    }
}

/**
 * Set selected table based on the radio button selected.
 */
const setSelectedTable = function() {
    let radioSelectedTable: HTMLInputElement = document.querySelector('.table-selection input[name="radio"]:checked');
    if (radioSelectedTable) {
        chosenTable = radioSelectedTable.value;
    }
}

/**
 * Clear all event data on the calendar.
 */
const clearCalendarData = function() {
    let selectedCalendarTimes: NodeListOf<HTMLLIElement> = document.querySelectorAll(".calendar .all-times .selected");
    let reservedCalendarTimes: NodeListOf<HTMLLIElement> = document.querySelectorAll(".calendar .all-times .reserved");
    let tentativeCalendarTimes: NodeListOf<HTMLLIElement> = document.querySelectorAll(".calendar .all-times .tentative");

    selectedCalendarTimes.forEach(function(selectedCalendarTime) {
        selectedCalendarTime.classList.remove("selected");
    });

    reservedCalendarTimes.forEach(function(reservedCalendarTime) {
        reservedCalendarTime.classList.remove("reserved");
    });

    tentativeCalendarTimes.forEach(function(tentativeCalendarTime) {
        tentativeCalendarTime.classList.remove("tentative");
    });
}

/**
 * Generate times for the calendar.
 */
const generateCalendarTimes = function() {
    const calendarTimes: HTMLDivElement = document.querySelector(".calendar .all-times");

    // Clear times if they are already there
    while (calendarTimes.firstChild) {
        calendarTimes.removeChild(calendarTimes.firstChild);
    }

    let timeIndex = 0;
    const minuteIncrement = [":00", ":15", ":30", ":45"];
    for (let i = START_TIME; i < END_TIME; i++) {
        // :00
        minuteIncrement.forEach(function(increment) {
            let displayName = (i <= 12 ? String(i) : String(i-12)) + increment;
            displayName += i < 12 ? " AM" : " PM";
            addTimeToCalendar(calendarTimes, displayName, timeIndex);
            timeIndex += 7;
        });
    }
}

/**
 * Add times to calendar times container.
 * @param calendarTimesContainer The calendar times container to add times to.
 * @param displayName The user facing name of the time.
 * @param timeIndex The unique index to assign for each time.
 */
const addTimeToCalendar = function(calendarTimesContainer: HTMLDivElement, displayName: string, timeIndex: number) {
    const timeList = document.createElement("ul");
    timeList.setAttribute("class", "times");

    for (let j = 0; j < 7; j++) {
        const timeElement = document.createElement("li");
        timeElement.textContent = displayName;
        timeElement.setAttribute("id", TIME_PREFIX + timeIndex);

        timeElement.onclick = function() {
            applyTimeSelection(timeElement);
        }

        timeList.appendChild(timeElement)
        timeIndex++;
    }

    calendarTimesContainer.appendChild(timeList);
}

/**
 * Apply time selection if it's not already reserved.
 * @param timeElement The time element to select.
 */
const applyTimeSelection = function(timeElement: HTMLLIElement) {
    if (!timeElement.classList.contains("reserved") && !timeElement.classList.contains("tentative")) {
        if (timeElement.classList.contains("selected")) {
            timeElement.classList.remove("selected");
        } else {
            selectTimeElement(timeElement);
        }
    }
}

/**
 * Select the time if it's in the same column of an existing selection. Display warning otherwise.
 * @param timeElement The time element to select.
 */
const selectTimeElement = function(timeElement: HTMLLIElement) {
    const existingTimeElement: HTMLLIElement = document.querySelector(".calendar .selected");
    if (existingTimeElement) {
        if (isTimeInSameCol(existingTimeElement, timeElement)) {
            timeElement.classList.add("selected");
        } else {
            displayWarning("You can only request a time on a single day. To request " +
                "for multiple days, you will need to make multiple request submissions.");
        }
    } else {
        timeElement.classList.add("selected");
    }
}

/**
 * Check if times are in the same column.
 * @param firstTimeElement The time element to check with the second time.
 * @param secondTimeElement The time element to check with the first time.
 * @returns True if the times are in the same column or false otherwise.
 */
const isTimeInSameCol = function(firstTimeElement: HTMLLIElement, secondTimeElement: HTMLLIElement) {
    const firstTimeIndex = getElementIdNumber(firstTimeElement, TIME_PREFIX);
    const secondTimeIndex = getElementIdNumber(secondTimeElement, TIME_PREFIX);
    return ((firstTimeIndex % 7) === (secondTimeIndex % 7)) ? true : false;
}

/**
 * Generate main calendar UI.
 * @param month The month.
 * @param year The year.
 * @param date The date.
 * @param day The day of the week.
 * @param clickedButton The button clicked.
 */
const generateCalendar = function(month: number, year: number, date: number, day: number, clickedButton: HTMLLIElement) {
    const calendarDayOfWeek: HTMLUListElement = document.querySelector(".calendar .days-of-week");
    const calendarDates: HTMLUListElement = document.querySelector(".calendar .dates");

    // Remove pre-existing days and dates
    while (calendarDayOfWeek.firstChild) {
        calendarDayOfWeek.removeChild(calendarDayOfWeek.firstChild);
    }

    while (calendarDates.firstChild) {
        calendarDates.removeChild(calendarDates.firstChild);
    }

    isMonthChanged = false;
    isYearChanged = false;
    isNewMonthInWindow = false;

    let queryDateList = "";

    for (let i = 0; i < 7; i++) {
        // Add dates
        const dateElement = document.createElement("li");
        dateElement.textContent = String(date);

        queryDateList += String(date);
        if (i != 6) {
            queryDateList += ",";
        }

        date = incrementDate(date, month, year, "forward");

        calendarDates.appendChild(dateElement);

        // Add days of the week
        const dayElement = document.createElement("li");
        dayElement.textContent = DAYS_OF_WEEK[day];

        day = incrementWeekDay(day, "forward");

        calendarDayOfWeek.appendChild(dayElement);

        if (date === 1) {
            isNewMonthInWindow = true;
        }

        if (date === 2) {
            dateElement.style.borderLeft = "4px solid #e00122";
        }
    }

    // Populate calendar with reserved or tentative times
    queryReservedTime(queryDateList, clickedButton);

    document.querySelector('.calendar .head .month').childNodes[0].textContent = MONTHS[month];
    document.querySelector('.calendar .head .month').childNodes[2].textContent = String(year);
}

/**
 * Increment the date by one.
 * @param date The current date.
 * @param month The current month.
 * @param year The current year.
 * @param direction The direction to increment by.
 * @param changeMonthYear Whether to signal change of month and the year (if applicable).
 * @returns The incremented date.
 */
const incrementDate = function(date: number, month: number, year: number, direction: string, changeMonthYear=false) {
    if (direction === "forward") { // TODO: Change to enum
        date++;

        // Check if leap year
        let febAdder = 0;
        if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
            febAdder = 1;
        }

        if (date === DAYS_OF_MONTH[month]+1+febAdder) {
            date = 1;

            if (changeMonthYear) {
                isMonthChanged = true;
                if (month == 11) {
                    isYearChanged = true;
                }
            }
        }
    }

    if (direction === "backward") {
        date--;

        if (date === 0) {
            month = month > 0 ? --month : month = 11;

            // Check if leap year
            let febAdder = 0;
            if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
                febAdder = 1;
            }

            date = DAYS_OF_MONTH[month]+febAdder;

            if (changeMonthYear) {
                isMonthChanged = true;
                if (month == 11) {
                    isYearChanged = true;
                }
            }
        }
    }

    return date;
}

/**
 * Increment the week day by one.
 * @param day The current week day.
 * @param direction The direction to increment by.
 * @returns The incremented day.
 */
const incrementWeekDay = function(day, direction) {
    if (direction === "forward") {
        day++;
        if (day === 7) {
            day = 0;
        }
    }

    if (direction === "backward") {
        day--;
        if (day === -1) {
            day = 6;
        }
    }

    return day;
}

/**
 * Get reserved times to populate the calendar.
 * @param queryDateList The string list of dates to query for.
 * @param clickedButton The button clicked.
 */
const queryReservedTime = async function(queryDateList: string, clickedButton: HTMLLIElement) {
    // Display loading
    while (clickedButton.firstChild) {
        clickedButton.removeChild(clickedButton.firstChild);
    }
    const loadingCircle = document.createElement("i");
    loadingCircle.setAttribute("class", "fas fa-spinner fa-pulse"); 
    clickedButton.appendChild(loadingCircle);

    // Set up search
    let queryMonthList = String(traverseMonth);
    let queryYearList = String(traverseYear);

    if (isNewMonthInWindow) {
        let secondMonth = traverseMonth < 11 ? traverseMonth + 1 : 0;
        queryMonthList += "," + String(secondMonth);

        if (secondMonth === 0) {
            queryYearList += "," + String(traverseYear + 1);
        }
    }

    const submissionData = {
        dateListText: queryDateList,
        monthListText: queryMonthList,
        yearListText: queryYearList
    }

    const submissionFormData = new FormData();

    for(let i in submissionData) {
        submissionFormData.append(i, submissionData[i]);
    }

    const reservations = new Reservations();
    try {
        await reservations.fetchData(queryDateList, queryMonthList, queryYearList);
    } catch {
        displayWarning("Something went wrong. Reserved times could not be displayed. " +
            "Check your connection and refresh the page.");
    }

    while (clickedButton.firstChild) {
        clickedButton.removeChild(clickedButton.firstChild);
    }
    const arrowSymbol = document.createElement("i");
    const arrowSymbolClass = clickedButton.getAttribute("class") == "next" ? "fas fa-chevron-circle-right" : "fas fa-chevron-circle-left";
    arrowSymbol.setAttribute("class", arrowSymbolClass); 
    clickedButton.appendChild(arrowSymbol);

    reservations.reservations.forEach((reservation) => {
        populateReservedTimes(String(reservation.date), reservation.startTime, reservation.endTime);
    });
}

/**
 * Populate reserved times on the calendar from the start time to the end time..
 * @param date The date to populate.
 * @param startTime The start time to populate
 * @param endTime The end time to populate.
 */
const populateReservedTimes = function(date: string, startTime: string, endTime: string) {
    const calendarDates: HTMLUListElement = document.querySelector(".calendar .dates");
    const searchCol: number = Array.prototype.findIndex.call(calendarDates.childNodes, function(calendarDate: HTMLLIElement) {
        return calendarDate.textContent == date;
    });

    if (searchCol > 0) {
        let startTimeIndex = 0;
        const calendarTimeElements: NodeListOf<HTMLLIElement> = document.querySelectorAll(".calendar .all-times li");
        for (let i = searchCol; i < calendarTimeElements.length; i+=7) {
            if (calendarTimeElements[i].textContent == startTime) {
                startTimeIndex = i;
                break;
            }
        }

        for (let i = startTimeIndex; i < calendarTimeElements.length; i+=7) {
            if (calendarTimeElements[i].textContent == endTime) {
                break;
            }
            calendarTimeElements[i].classList.add("reserved");
        }
    }
}

/**
 * Check if there are multiple non-contiguous time ranges.
 * @param timeElements The time elements to check.
 * @returns True is there are non-contiguous time ranges or false otherwise.
 */
const isMultiRange = function(timeElements: HTMLLIElement[]) {
    const firstTimeElementNumber = getElementIdNumber(timeElements[0], TIME_PREFIX);
    let isViolation = false;
    let elementCounter = firstTimeElementNumber;
    elementCounter -= 7;
    timeElements.forEach(function(timeElement) {
        elementCounter+=7;
        if (getElementIdNumber(timeElement, TIME_PREFIX) !== elementCounter) {
            isViolation = true;
        }
    });

    return isViolation; 
}

/**
 * Get the starting time from the list of time elements.
 * @param timeElements The time elements.
 * @returns The start time.
 */
const getSelectedTimeStart = function(timeElements: HTMLLIElement[]) {
    const startTimeElement = timeElements[0];
    return startTimeElement.textContent;
}

/**
 * Get the ending time based on the list of time elements.
 * @param timeElements The time elements.
 * @returns The end time.
 */
const getSelectedTimeEnd = function(timeElements: HTMLLIElement[]) {
    let endTime = "12:00 AM";
    const lastSelectedElement = timeElements[timeElements.length-1]
    if (lastSelectedElement.textContent != "11:45 PM") {
        const lastSelectedId = getElementIdNumber(lastSelectedElement, TIME_PREFIX);
        const endTimeElement = document.querySelector(".calendar .all-times #" + TIME_PREFIX + String(lastSelectedId+7));
        endTime = endTimeElement.textContent;
    }
    return endTime;
}

/**
 * Get the selected day of the week based on the list of time elements.
 * @param timeElements The time elements.
 * @returns The day of the week.
 */
const getSelectedWeekDay = function(timeElements: HTMLLIElement[]) {
    const startTimeElementId = getElementIdNumber(timeElements[0], TIME_PREFIX);
    const selectedCol = startTimeElementId % 7;
    const selectedWeekDay = document.querySelectorAll(".calendar .days-of-week li")[selectedCol].textContent;
    return DAYS_OF_WEEK.indexOf(selectedWeekDay);
}

/**
 * Get the selected date based on the list of time elements.
 * @param timeElements The time elements.
 * @returns The selected date.
 */
const getSelectedDate = function(timeElements: HTMLLIElement[]) {
    const startTimeElementId = getElementIdNumber(timeElements[0], TIME_PREFIX);
    const selectedCol = startTimeElementId % 7;
    return Number(document.querySelectorAll(".calendar .dates li")[selectedCol].textContent);
}

/**
 * Get the selected month.
 * @param selectedDate The selected date of the month.
 * @returns The selected month.
 */
const getSelectedMonth = function(selectedDate: number) {
    let selectedMonth = traverseMonth;
    if (isNewMonthInWindow) {
        if (selectedDate < 7) {
            selectedMonth = traverseMonth < 11 ? traverseMonth + 1 : 0;
        }
    }

    return selectedMonth;
}

/**
 * Get the selected month.
 * @param selectedDate The selected date of the month.
 * @param selectedMonth The selected month of the year.
 * @returns The selected year.
 */
const getSelectedYear = function(selectedDate: number, selectedMonth: number) {
    let selectedYear = traverseYear;
    if (isNewMonthInWindow) {
        if (selectedMonth === 0) {
            if (selectedDate < 7) {
                selectedYear = traverseYear + 1;
            }
        }
    }

    return selectedYear;
}

/**
 * Generate the reservation form to reserve a table.
 * @param selectedTimeStart The start time of the reservation.
 * @param selectedTimeEnd The end time of the reservation.
 * @param selectedDate The date of the reservation.
 * @param selectedMonth The month of the reservation.
 * @param selectedYear The year of the reservation.
 * @param selectedWeekDay The week day of the reservation.
 */
const generateReservationForm = function(
    selectedTimeStart: string,
    selectedTimeEnd: string,
    selectedDate: number,
    selectedMonth: number,
    selectedYear: number,
    selectedWeekDay: number
) {
    const confirmTimeContainer: HTMLDivElement = document.querySelector("#confirm-time");
    const startTimeSpan: HTMLSpanElement = document.querySelector("#confirm-time form .start-time");
    const endTimeSpan: HTMLSpanElement = document.querySelector("#confirm-time form .end-time");
    const monthSpan: HTMLSpanElement = document.querySelector("#confirm-time form .month");
    const dateSpan: HTMLSpanElement = document.querySelector("#confirm-time form .date");
    const yearSpan: HTMLSpanElement = document.querySelector("#confirm-time form .year");
    const reserveButton: HTMLInputElement = document.querySelector("#confirm-time form #reserve-button");

    confirmTimeContainer.style.display = "block";
    startTimeSpan.textContent = selectedTimeStart;
    endTimeSpan.textContent = selectedTimeEnd;
    monthSpan.textContent = MONTHS[selectedMonth];
    dateSpan.textContent = String(selectedDate);
    yearSpan.textContent = String(selectedYear);

    setTimeout(function() {
        confirmTimeContainer.scrollIntoView({behavior: "smooth", block: "start"});
    }, 100);

    reserveButton.onclick = function() {
        const formEventTitle: HTMLInputElement = document.querySelector("#confirm-time form #event-title");
        const formName: HTMLInputElement = document.querySelector("#confirm-time form #reserver-name");
        const formOrgName: HTMLInputElement = document.querySelector("#confirm-time form #organization-name");
        const formEmail: HTMLInputElement = document.querySelector("#confirm-time form #email");
        const formComments: HTMLInputElement = document.querySelector("#confirm-time form #comments");
    
        if (!validateInputFieldData(formEventTitle, formName, formOrgName, formEmail)) {
            submitReservation(
                formEventTitle.value,
                formName.value,
                formOrgName.value,
                formEmail.value,
                selectedMonth,
                selectedDate,
                selectedYear,
                selectedWeekDay,
                selectedTimeStart,
                selectedTimeEnd,
                chosenTable,
                formComments.value
            );
        }
    }
}

/**
 * Submit the reservation for the selected table.
 * @param eventTitle The event title.
 * @param name The name of the user.
 * @param orgName The organization name.
 * @param email The email of the user.
 * @param month The month selected.
 * @param date The date selected.
 * @param year The year selected.
 * @param weekDay The week day selected.
 * @param startTime The start time selected.
 * @param endTime The end time selected.
 * @param tableChosen The table chosen.
 * @param comments The comments.
 */
const submitReservation = async function(
    eventTitle: string,
    name: string,
    orgName: string,
    email: string,
    month: number,
    date: number,
    year: number,
    weekDay: number,
    startTime: string,
    endTime: string,
    tableChosen: string,
    comments: string
) {
    const reserveButton: HTMLInputElement = document.querySelector("#confirm-time form #reserve-button");
    const loader: HTMLDivElement = document.querySelector(".loader");
    const confirmTimeContainer: HTMLDivElement = document.querySelector("#confirm-time");
    const selectEventTimeContainer: HTMLDivElement = document.querySelector("#select-event-time");
    const selectionIntroContainer: HTMLDivElement = document.querySelector(".intro .selection-intro");
    const bodyElement: HTMLBodyElement = document.querySelector("body");
    const reservationResultContainer: HTMLDivElement = document.querySelector(".reservation-result");
    const successResponse: HTMLDivElement = document.querySelector(".reservation-result .success-response");
    const failResponse: HTMLDivElement = document.querySelector(".reservation-result .fail-response");

    // Display loading symbol
    reserveButton.style.display = "none";
    loader.style.display = "block";

    const reservationSubmission = new ReservationSubmission(
        eventTitle,
        name,
        orgName,
        email,
        month,
        date,
        year,
        weekDay,
        startTime,
        endTime,
        tableChosen,
        comments,
    );

    try {
        const reservationId = await reservationSubmission.sendData();
        successResponse.style.display = "block";
        successResponse.querySelector(".res-id").textContent = reservationId;
        successResponse.querySelector(".email").textContent = email;
    } catch (err) {
        failResponse.style.display = "block";
        failResponse.querySelector(".error-msg").textContent = err.message;
        const retryLink: HTMLSpanElement = failResponse.querySelector(".retry");
        retryLink.onclick = function() {
            failResponse.style.display = "none";
            reservationResultContainer.style.display = "none";
            restoreSelectionInterface();
        }
    }

    reservationResultContainer.style.display = "block";
    reserveButton.style.display = "block";
    loader.style.display = "none";
    confirmTimeContainer.style.display = "none";
    selectEventTimeContainer.style.display = "none";
    selectionIntroContainer.style.display = "none";

    bodyElement.scrollIntoView({behavior: "smooth", block: "start"});
}

/**
 * Restore the event selection.
 */
const restoreSelectionInterface = function() {
    const confirmTimeContainer: HTMLDivElement = document.querySelector("#confirm-time");
    const selectEventTimeContainer: HTMLDivElement = document.querySelector("#select-event-time");
    const selectionIntroContainer: HTMLDivElement = document.querySelector(".intro .selection-intro");

    confirmTimeContainer.style.display = "block";
    selectEventTimeContainer.style.display = "block";
    selectionIntroContainer.style.display = "block";

    setTimeout(function() {
        confirmTimeContainer.scrollIntoView({behavior: "smooth", block: "start"});
    }, 100);
}
