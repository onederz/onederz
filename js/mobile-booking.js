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

    const today = new Date(); // Current date is Friday, June 6, 2025
    const currentRealYear = today.getFullYear(); // 2025
    const currentRealMonth = today.getMonth(); // 5 (for June)

    // 1. Populate years (current year -10 to +10, add 'hidden-option' for previous years)
    yearSelect.innerHTML = '';
    for (let i = currentRealYear - 10; i <= currentRealYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i < currentRealYear) {
            option.classList.add('hidden-option'); // Add class to hide
            option.disabled = true; // Still keep disabled for good measure/accessibility
        }
        yearSelect.appendChild(option);
    }
    // Ensure the current year is selected by default if it's within the range
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

            // Hide/disable past months in the current year
            if (selectedYear === currentRealYear && i < currentRealMonth) {
                option.classList.add('hidden-option'); // Add class to hide
                option.disabled = true; // Still keep disabled for good measure/accessibility
            }
            monthSelect.appendChild(option);
        }
        // Set the month select value after populating options
        monthSelect.value = currentDateRef.getMonth();
    }

    // Call it initially to set up months
    updateMonthOptions();

    // Event listener for year change to update month options
    yearSelect.addEventListener('change', function() {
        updateMonthOptions();
        // After year changes and months are updated, ensure the current month is selected
        // or the earliest available month if current month is hidden/disabled.
        const selectedMonth = parseInt(monthSelect.value);
        if (selectedMonth < currentRealMonth && parseInt(yearSelect.value) === currentRealYear) {
            monthSelect.value = currentRealMonth; // Select current real month if prior was selected
        } else {
            monthSelect.value = selectedMonth; // Keep current selection if valid
        }
    });

    // Toggle month/year selector
    calendarTitle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = monthYearSelector.style.display === 'block';
        monthYearSelector.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) { // If becoming visible, set current values
            monthSelect.value = currentDateRef.getMonth();
            yearSelect.value = currentDateRef.getFullYear();
            updateMonthOptions(); // Ensure months are correctly enabled/disabled/hidden when opening
        }
    });

    // Confirm selection
    confirmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearSelect.value);

        // Validate selection against real current date to prevent selecting past dates via confirm
        if (selectedYear < currentRealYear || (selectedYear === currentRealYear && selectedMonth < currentRealMonth)) {
            alert("You cannot select a past month/year.");
            return; // Prevent update if it's a past date
        }

        // Update the shared currentDate variable
        currentDateRef.setFullYear(selectedYear);
        currentDateRef.setMonth(selectedMonth);
        currentDateRef.setDate(1); // Set to 1st to avoid issues with months having fewer days

        renderCalendarsRef(); // Call the shared render function
        monthYearSelector.style.display = 'none';

        // Return focus to calendar (optional)
        setTimeout(() => calendarTitle.focus(), 10);
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (monthYearSelector.style.display === 'block' && !monthYearSelector.contains(e.target) && e.target !== calendarTitle) {
            monthYearSelector.style.display = 'none';
        }
    });
}

// initMobileBooking now accepts callbacks to define the shared functions
function initMobileBooking(currentDate, checkinDate, checkoutDate, selectingCheckin, scrollPosition, setRenderCalendars, setCheckFormValidity) {
    // Get elements
    const bookBtn = document.getElementById('mobileBookBtn');
    const backBtn = document.getElementById('mobileBackBtn');
    const bookingForm = document.querySelector('.booking-form-mobile');
    const overlayBooking = document.getElementById('bookingOverlay');
    const destinationSelect = document.getElementById('destination-mobile');
    const dateInput = document.getElementById('checkin-checkout-mobile');
    const submitBtn = document.getElementById('submitBtnMobile');

    // Calendar elements (moved up for easier access in initialization)
    const dateInputMobile = document.getElementById('checkin-checkout-mobile');
    const calendarContainerMobile = document.getElementById('calendarContainerMobile');
    const currentMonthDays = document.getElementById('calendar-current-days-mobile');
    const nextMonthDays = document.getElementById('calendar-next-days-mobile');
    const currentMonthTitle = document.getElementById('current-month-title-mobile');
    const nextMonthTitle = document.getElementById('next-month-title-mobile');
    const prevMonthBtn = document.getElementById('prev-month-mobile');
    const nextMonthBtn = document.getElementById('next-month-mobile');

    // Clear the date input field and reset its placeholder on load
    dateInputMobile.value = "";
    dateInputMobile.placeholder = "Check-in       |       Check-out"; // Set your default placeholder here if it's different

    submitBtn.disabled = true; // Ensure submit button is disabled initially

    // Define checkFormValidity and pass it back to the shared scope
    const actualCheckFormValidity = function() {
        const isDestinationSelected = destinationSelect.value !== "";
        // console.log('Destination selected:', destinationSelect.value, 'Is valid:', isDestinationSelected);

        const areDatesSelected = dateInput.value.includes("|") && dateInput.value.trim() !== "Check-in       |       Check-out" && dateInput.value.trim() !== "";
        // console.log('Date input value:', dateInput.value, 'Are dates selected:', areDatesSelected);

        submitBtn.disabled = !(isDestinationSelected && areDatesSelected);
        // console.log('Submit button disabled:', submitBtn.disabled);
    };
    setCheckFormValidity(actualCheckFormValidity); // Pass the defined function back

    destinationSelect.addEventListener('change', actualCheckFormValidity);
    dateInput.addEventListener('input', actualCheckFormValidity); // For direct input changes
    dateInput.addEventListener('change', actualCheckFormValidity); // For calendar selections

    // Also call checkFormValidity after date selection in your selectDate function
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
                updateDateInput(); // Update the input field's value
                hideCalendar();
            } else {
                // If selected date is before checkin, make it new checkin
                checkinDate = date;
                checkoutDate = null;
                dateInputMobile.placeholder = "Select check-out date";
            }
        }
        actualRenderCalendars(); // Call the actual render function
        actualCheckFormValidity(); // Call checkFormValidity AFTER dateInputMobile.value might have been updated
    }

    // Slide up function
function slideUp() {
    scrollPosition = window.scrollY; // Capture the current scroll position
    bookingForm.classList.add('visible');
    overlayBooking.classList.add('visible');

    if (window.innerWidth <= 1199) { // Targeting mobile/tablet up to 1199px
        document.body.classList.add('no-scroll');
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`; // Offset the body by the scroll position
        document.body.style.width = '100%';
    } else {
        // For wider screens, simply prevent scroll if needed without fixed position
        document.body.classList.add('no-scroll'); // Assuming 'no-scroll' applies overflow: hidden
    }
}

// Slide down function
function slideDown() {
    bookingForm.classList.remove('visible');
    overlayBooking.classList.remove('visible');

    if (window.innerWidth <= 1199) { // If fixed position was applied
        // 1. First, remove the fixed positioning and related styles.
        //    This allows the body to return to normal document flow.
        document.body.classList.remove('no-scroll');
        document.body.style.position = ''; // Remove fixed position
        document.body.style.top = '';      // Remove the top offset
        document.body.style.width = '';    // Remove width style

        // 2. Then, use requestAnimationFrame to restore scroll position.
        //    This waits for the browser to finish re-laying out the page
        //    before attempting to scroll, preventing the jump.
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
        });
    } else {
        // For wider screens where fixed position wasn't used
        document.body.classList.remove('no-scroll'); // Simply remove overflow: hidden
    }

    hideCalendar();
}

    // Back button click handler
    backBtn.addEventListener('click', slideDown);

    // Event listeners
    bookBtn.addEventListener('click', slideUp);
    overlayBooking.addEventListener('click', slideDown);

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (calendarContainerMobile.style.display === 'block') {
                hideCalendar();
            } else if (bookingForm.classList.contains('visible')) {
                slideDown();
            }
        }
    });

    // Click outside handler for calendar
    function handleClickOutside(event) {
        if (calendarContainerMobile.style.display === 'block' &&
            !calendarContainerMobile.contains(event.target) &&
            event.target !== dateInputMobile &&
            !currentMonthTitle.contains(event.target) && // Also check if click was on month title
            !document.querySelector('.month-year-selector').contains(event.target)) { // And month/year selector itself
            hideCalendar();
        }
    }

    // Prevent calendar from closing when clicking inside
    calendarContainerMobile.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Date input click handler
    dateInputMobile.addEventListener('click', function(e) {
        e.stopPropagation();

        if (!bookingForm.classList.contains('visible')) {
            slideUp();
            setTimeout(showCalendar, 400);
        } else {
            toggleCalendar();
        }
    });

    // Calendar navigation
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        actualRenderCalendars();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        actualRenderCalendars();
    });

    // Calendar visibility functions
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

    // Define renderCalendars and pass it back to the shared scope
    const actualRenderCalendars = function() {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Render current month
        renderCalendar(currentMonthDays, currentMonthTitle, currentYear, currentMonth);

        // Calculate and render next month
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }

        renderCalendar(nextMonthDays, nextMonthTitle, nextYear, nextMonth);

        // Update nav buttons
        updateNavButtons();
    };
    setRenderCalendars(actualRenderCalendars); // Pass the defined function back

    // Update navigation buttons
    function updateNavButtons() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth();

        prevMonthBtn.disabled = isCurrentMonth;
    }

    // Render single calendar month
    function renderCalendar(container, titleElement, year, month) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Update month title
        titleElement.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

        // Clear previous days
        container.innerHTML = '';

        // Previous month days (fill leading empty cells)
        for (let i = 0; i < startingDay; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = ''; // Empty for padding
            container.appendChild(dayElement);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            dayDate.setHours(0, 0, 0, 0); // Normalize dayDate to start of day for accurate comparison

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;

            // Mark today
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            // Disable past dates
            if (dayDate < today) {
                dayElement.classList.add('disabled');
            } else {
                // Check if date is selected
                if (checkinDate && dayDate.getTime() === checkinDate.getTime()) {
                    dayElement.classList.add('selected');
                } else if (checkoutDate && dayDate.getTime() === checkoutDate.getTime()) {
                    dayElement.classList.add('selected');
                } else if (checkinDate && checkoutDate && dayDate > checkinDate && dayDate < checkoutDate) {
                    dayElement.classList.add('in-range');
                }

                // Date selection handler
                dayElement.addEventListener('click', function() {
                    selectDate(dayDate);
                });
            }

            container.appendChild(dayElement);
        }

        // Next month days (fill trailing empty cells)
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells; // Ensure 6 rows (42 cells)

        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = ''; // Empty for padding
            container.appendChild(dayElement);
        }
    }

    // Update date input field
    function updateDateInput() {
        if (checkinDate && checkoutDate) {
            const startStr = formatDate(checkinDate);
            const endStr = formatDate(checkoutDate);
            dateInputMobile.value = `${startStr}       |       ${endStr}`;

            // Manually dispatch an 'input' event to trigger listeners
            const event = new Event('input', {
                bubbles: true
            });
            dateInputMobile.dispatchEvent(event);
        }
    }

    // Format date for display
    function formatDate(date) {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    }

    // Initial render and validity check on load
    actualRenderCalendars();
    actualCheckFormValidity();
}

function initMobileDropdown(checkFormValidityRef) {
    const dropdown = document.querySelector('.booking-form-mobile .custom-dropdown-mobile');
    if (!dropdown) return;

    const header = dropdown.querySelector('.dropdown-header');
    const selectedText = dropdown.querySelector('.selected-text');
    const options = dropdown.querySelectorAll('.dropdown-options li');
    const hiddenInput = document.getElementById('destination-mobile'); // Correctly target the hidden input
    const dropdownOptions = dropdown.querySelector('.dropdown-options');

    // --- MODIFIED PART: RESET DROPDOWN STATE ON LOAD ---
    const defaultOption = dropdown.querySelector('.dropdown-options li[data-value=""]');

    if (defaultOption) {
        selectedText.textContent = defaultOption.textContent;
        selectedText.style.color = '#777';
        hiddenInput.value = "";
        options.forEach(opt => opt.classList.remove('selected'));
        defaultOption.classList.add('selected');
    } else {
        selectedText.textContent = 'Select Destination';
        selectedText.style.color = '#777';
        hiddenInput.value = "";
        options.forEach(opt => opt.classList.remove('selected'));
    }

    // Crucial: Manually dispatch a 'change' event to trigger form validity check
    const changeEvent = new Event('change', { bubbles: true });
    hiddenInput.dispatchEvent(changeEvent);
    // --- END MODIFIED PART ---

    // Toggle dropdown
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

    // Select option
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
            if (checkFormValidityRef) { // Call the passed-in checkFormValidity function
                checkFormValidityRef();
            }
        });
    });

    // Close when clicking outside
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