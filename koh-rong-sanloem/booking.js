document.addEventListener('DOMContentLoaded', function() {
    // Declare shared calendar state variables and functions here
    // These need to be 'let' so they can be reassigned or updated.
    let currentDate = new Date();
    let checkinDate = null;
    let checkoutDate = null;
    let selectingCheckin = true;
    let scrollPosition = 0; // This can also be shared if needed globally for positioning

    // Declare renderCalendars and checkFormValidity in this shared scope
    // They will be defined (assigned a function body) inside initMobileBooking
    let renderCalendars;
    let checkFormValidity;

    // Initialize mobile booking first, passing references to the shared variables/functions
    // initMobileBooking will define renderCalendars and checkFormValidity
    initMobileBooking(currentDate, checkinDate, checkoutDate, selectingCheckin, scrollPosition, renderCalendarsRef => renderCalendars = renderCalendarsRef, checkFormValidityRef => checkFormValidity = checkFormValidityRef);

    // Then initialize other components
    initMobileDropdown(checkFormValidity); // Pass checkFormValidity to dropdown for its reset logic
    initFormSubmission();

    // Initialize month/year selector LAST, passing the now-defined shared functions
    initMonthYearSelector(currentDate, renderCalendars);
});

// --- Function Definitions ---

function initMonthYearSelector(currentDateRef, renderCalendarsRef) {
    const calendarTitle = document.getElementById('current-month-title-mobile');
    const monthYearSelector = document.querySelector('.month-year-selector');
    const monthSelect = document.querySelector('.month-select');
    const yearSelect = document.querySelector('.year-select');
    const confirmBtn = document.querySelector('.confirm-month-year');

    // Only proceed if elements exist
    if (!calendarTitle || !monthYearSelector || !monthSelect || !yearSelect || !confirmBtn) {
        console.warn("Month/Year selector elements not found, initMonthYearSelector skipped.");
        return;
    }

    const today = new Date();
    const currentRealYear = today.getFullYear();
    const currentRealMonth = today.getMonth();

    // 1. Populate years (current year -10 to +10, add 'hidden-option' for previous years)
    yearSelect.innerHTML = '';
    for (let i = currentRealYear - 10; i <= currentRealYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i < currentRealYear) {
            option.classList.add('hidden-option');
            option.disabled = true;
        }
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentDateRef.getFullYear();

    // 2. Dynamically populate month options and manage their hidden/disabled state
    function updateMonthOptions() {
        monthSelect.innerHTML = '';
        const selectedYear = parseInt(yearSelect.value);
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        for (let i = 0; i < 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = monthNames[i];

            if (selectedYear === currentRealYear && i < currentRealMonth) {
                option.classList.add('hidden-option');
                option.disabled = true;
            }
            monthSelect.appendChild(option);
        }
        monthSelect.value = currentDateRef.getMonth();
    }

    updateMonthOptions();

    yearSelect.addEventListener('change', function() {
        updateMonthOptions();
        const selectedMonth = parseInt(monthSelect.value);
        if (selectedMonth < currentRealMonth && parseInt(yearSelect.value) === currentRealYear) {
            monthSelect.value = currentRealMonth;
        } else {
            monthSelect.value = selectedMonth;
        }
    });

    calendarTitle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = monthYearSelector.style.display === 'block';
        monthYearSelector.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            monthSelect.value = currentDateRef.getMonth();
            yearSelect.value = currentDateRef.getFullYear();
            updateMonthOptions();
        }
    });

    confirmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearSelect.value);

        if (selectedYear < currentRealYear || (selectedYear === currentRealYear && selectedMonth < currentRealMonth)) {
            alert("You cannot select a past month/year.");
            return;
        }

        currentDateRef.setFullYear(selectedYear);
        currentDateRef.setMonth(selectedMonth);
        currentDateRef.setDate(1);

        renderCalendarsRef();
        monthYearSelector.style.display = 'none';

        setTimeout(() => calendarTitle.focus(), 10);
    });

    document.addEventListener('click', function(e) {
        if (monthYearSelector.style.display === 'block' && !monthYearSelector.contains(e.target) && e.target !== calendarTitle) {
            monthYearSelector.style.display = 'none';
        }
    });
}

function initMobileBooking(currentDate, checkinDate, checkoutDate, selectingCheckin, scrollPosition, setRenderCalendars, setCheckFormValidity) {
    const bookBtn = document.getElementById('mobileBookBtn');
    const backBtn = document.getElementById('mobileBackBtn');
    const bookingForm = document.querySelector('.booking-form-mobile');
    const overlayBooking = document.getElementById('bookingOverlay');
    const destinationSelect = document.getElementById('destination-mobile');
    const dateInput = document.getElementById('checkin-checkout-mobile');
    const submitBtn = document.getElementById('submitBtnMobile');

    const dateInputMobile = document.getElementById('checkin-checkout-mobile');
    const calendarContainerMobile = document.getElementById('calendarContainerMobile');
    const currentMonthDays = document.getElementById('calendar-current-days-mobile');
    const nextMonthDays = document.getElementById('calendar-next-days-mobile');
    const currentMonthTitle = document.getElementById('current-month-title-mobile');
    const nextMonthTitle = document.getElementById('next-month-title-mobile');
    const prevMonthBtn = document.getElementById('prev-month-mobile');
    const nextMonthBtn = document.getElementById('next-month-mobile');

    dateInputMobile.value = "";
    dateInputMobile.placeholder = "Check-in       |       Check-out";
    submitBtn.disabled = true;

    const actualCheckFormValidity = function() {
        const isDestinationSelected = destinationSelect.value !== "";
        const areDatesSelected = dateInput.value.includes("|") && dateInput.value.trim() !== "Check-in       |       Check-out" && dateInput.value.trim() !== "";
        submitBtn.disabled = !(isDestinationSelected && areDatesSelected);
    };
    setCheckFormValidity(actualCheckFormValidity);

    destinationSelect.addEventListener('change', actualCheckFormValidity);
    dateInput.addEventListener('input', actualCheckFormValidity);
    dateInput.addEventListener('change', actualCheckFormValidity);

    function selectDate(date) {
        if (selectingCheckin) {
            checkinDate = date;
            checkoutDate = null;
            selectingCheckin = false;
            dateInputMobile.placeholder = "Select check-out date";
        } else {
            if (date > checkinDate) {
                checkoutDate = date;
                selectingCheckin = true;
                updateDateInput();
                hideCalendar();
            } else {
                checkinDate = date;
                checkoutDate = null;
                dateInputMobile.placeholder = "Select check-out date";
            }
        }
        actualRenderCalendars();
        actualCheckFormValidity();
    }

    function slideUp() {
        scrollPosition = window.scrollY;
        bookingForm.classList.add('visible');
        overlayBooking.classList.add('visible');

        if (window.innerWidth <= 1199) {
            document.body.classList.add('no-scroll');
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.width = '100%';
        } else {
            document.body.classList.add('no-scroll');
        }
    }

    function slideDown() {
        bookingForm.classList.remove('visible');
        overlayBooking.classList.remove('visible');

        if (window.innerWidth <= 1199) {
            document.body.classList.remove('no-scroll');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            requestAnimationFrame(() => {
                window.scrollTo(0, scrollPosition);
            });
        } else {
            document.body.classList.remove('no-scroll');
        }

        hideCalendar();
    }

    backBtn.addEventListener('click', slideDown);
    bookBtn.addEventListener('click', slideUp);
    overlayBooking.addEventListener('click', slideDown);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (calendarContainerMobile.style.display === 'block') {
                hideCalendar();
            } else if (bookingForm.classList.contains('visible')) {
                slideDown();
            }
        }
    });

    function handleClickOutside(event) {
        if (calendarContainerMobile.style.display === 'block' &&
            !calendarContainerMobile.contains(event.target) &&
            event.target !== dateInputMobile &&
            !currentMonthTitle.contains(event.target) &&
            !document.querySelector('.month-year-selector').contains(event.target)) {
            hideCalendar();
        }
    }

    calendarContainerMobile.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    dateInputMobile.addEventListener('click', function(e) {
        e.stopPropagation();

        if (!bookingForm.classList.contains('visible')) {
            slideUp();
            setTimeout(showCalendar, 400);
        } else {
            toggleCalendar();
        }
    });

    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        actualRenderCalendars();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        actualRenderCalendars();
    });

    function showCalendar() {
        calendarContainerMobile.style.display = 'block';
        actualRenderCalendars();
        document.addEventListener('click', handleClickOutside);
    }

    function hideCalendar() {
        if (calendarContainerMobile) {
            calendarContainerMobile.style.display = 'none';
            document.removeEventListener('click', handleClickOutside);
        }
    }

    function toggleCalendar() {
        if (calendarContainerMobile.style.display === 'block') {
            hideCalendar();
        } else {
            showCalendar();
        }
    }

    const actualRenderCalendars = function() {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        renderCalendar(currentMonthDays, currentMonthTitle, currentYear, currentMonth);

        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }

        renderCalendar(nextMonthDays, nextMonthTitle, nextYear, nextMonth);

        updateNavButtons();
    };
    setRenderCalendars(actualRenderCalendars);

    function updateNavButtons() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth();

        prevMonthBtn.disabled = isCurrentMonth;
    }

    function renderCalendar(container, titleElement, year, month) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        titleElement.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

        container.innerHTML = '';

        for (let i = 0; i < startingDay; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = '';
            container.appendChild(dayElement);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            dayDate.setHours(0, 0, 0, 0);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;

            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            if (dayDate < today) {
                dayElement.classList.add('disabled');
            } else {
                if (checkinDate && dayDate.getTime() === checkinDate.getTime()) {
                    dayElement.classList.add('selected');
                } else if (checkoutDate && dayDate.getTime() === checkoutDate.getTime()) {
                    dayElement.classList.add('selected');
                } else if (checkinDate && checkoutDate && dayDate > checkinDate && dayDate < checkoutDate) {
                    dayElement.classList.add('in-range');
                }

                dayElement.addEventListener('click', function() {
                    selectDate(dayDate);
                });
            }

            container.appendChild(dayElement);
        }

        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;

        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = '';
            container.appendChild(dayElement);
        }
    }

    function updateDateInput() {
        if (checkinDate && checkoutDate) {
            const startStr = formatDate(checkinDate);
            const endStr = formatDate(checkoutDate);
            dateInputMobile.value = `${startStr}       |       ${endStr}`;

            const event = new Event('input', {
                bubbles: true
            });
            dateInputMobile.dispatchEvent(event);
        }
    }

    function formatDate(date) {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    }

    actualRenderCalendars();
    actualCheckFormValidity();
}

function initMobileDropdown(checkFormValidityRef) {
    const dropdown = document.querySelector('.booking-form-mobile .custom-dropdown-mobile');
    if (!dropdown) return;

    const header = dropdown.querySelector('.dropdown-header');
    const selectedText = dropdown.querySelector('.selected-text');
    const options = dropdown.querySelectorAll('.dropdown-options li');
    const hiddenInput = document.getElementById('destination-mobile');
    const dropdownOptions = dropdown.querySelector('.dropdown-options');

    // Set Siem Reap as default selected option
    const siemReapOption = dropdown.querySelector('.dropdown-options li[data-value="koh-rong-samloem"]');
    
    if (siemReapOption) {
        selectedText.textContent = siemReapOption.textContent;
        selectedText.style.color = '#000';
        hiddenInput.value = "koh-rong-samloem";
        options.forEach(opt => opt.classList.remove('selected'));
        siemReapOption.classList.add('selected');
    } else {
        selectedText.textContent = 'Select Destination';
        selectedText.style.color = '#777';
        hiddenInput.value = "";
        options.forEach(opt => opt.classList.remove('selected'));
    }

    const changeEvent = new Event('change', { bubbles: true });
    hiddenInput.dispatchEvent(changeEvent);

    header.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');

        if (dropdown.classList.contains('open')) {
            const viewportHeight = window.innerHeight;
            const dropdownRect = dropdown.getBoundingClientRect();
            const spaceBelow = viewportHeight - dropdownRect.bottom;

            if (spaceBelow < 200 && dropdownRect.top > 200) {
                dropdownOptions.classList.add('flip-up');
                dropdownOptions.classList.remove('flip-down');
            } else {
                dropdownOptions.classList.add('flip-down');
                dropdownOptions.classList.remove('flip-up');
            }
        }
    });

    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;

            selectedText.textContent = text;
            selectedText.style.color = '#000';

            hiddenInput.value = value;

            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            dropdown.classList.remove('open');

            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            if (checkFormValidityRef) {
                checkFormValidityRef();
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function initFormSubmission() {
    const form = document.getElementById('searchFormMobile');
    if (!form) return;

    const propertyUrls = {
        'siem-reap': 'https://hotels.cloudbeds.com/en/reservation/rmVKYa/?currency=usd',
        'phnom-penh': 'https://hotels.cloudbeds.com/en/reservation/PeZXom?currency=usd',
        'kampot': 'https://hotels.cloudbeds.com/en/reservation/CFTvLu?currency=usd',
        'sihanoukville': 'https://hotels.cloudbeds.com/en/reservation/ZyjPPV?currency=usd',
        'koh-rong-sanloem': 'https://hotels.cloudbeds.com/en/reservation/VUxg0w?currency=usd',
        'koh-rong': 'https://hotels.cloudbeds.com/en/reservation/XS8E0S?currency=usd'
    };

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const destination = document.getElementById('destination-mobile').value;
        const checkinCheckout = document.getElementById('checkin-checkout-mobile').value;

        if (!destination) {
            alert('Please select a destination');
            return;
        }

        if (!checkinCheckout || !checkinCheckout.includes('|')) {
            alert('Please select both check-in and check-out dates');
            return;
        }

        const [checkinPart, checkoutPart] = checkinCheckout.split('|').map(s => s.trim());
        const checkinDate = parseDateString(checkinPart);
        const checkoutDate = parseDateString(checkoutPart);

        if (!checkinDate || !checkoutDate) {
            alert('Invalid date selection');
            return;
        }

        const checkin = formatDateForUrl(checkinDate);
        const checkout = formatDateForUrl(checkoutDate);

        const propertyUrl = propertyUrls[destination];
        if (!propertyUrl) {
            alert('Invalid destination selected');
            return;
        }

        const finalUrl = `${propertyUrl}&checkin=${checkin}&checkout=${checkout}`;
        window.location.href = finalUrl;
    });

    function parseDateString(dateStr) {
        const parts = dateStr.split(' ');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const year = parseInt(parts[2]);

        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        if (isNaN(monthIndex)) return null;

        return new Date(year, monthIndex, day);
    }

    function formatDateForUrl(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}