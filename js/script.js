document.addEventListener('DOMContentLoaded', function() {
    // Initialize only the desktop form
    initBookingForm('', 'booking-form');
});

function initBookingForm(suffix, formClass) {
    // Custom dropdown functionality
    const dropdown = document.querySelector(`.${formClass} .custom-dropdown${suffix ? '-mobile' : ''}`);
    if (!dropdown) return;
    
    const header = dropdown.querySelector('.dropdown-header');
    const selectedText = dropdown.querySelector('.selected-text');
    const options = dropdown.querySelectorAll('.dropdown-options li');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const dropdownOptions = dropdown.querySelector('.dropdown-options');
    
    // Toggle dropdown with positioning logic
    header.addEventListener('click', function() {
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) {
            adjustDropdownPosition(dropdownOptions, header);
        }
    });
    
    // Select option
    options.forEach(option => {
        option.addEventListener('click', function() {
            selectedText.textContent = this.textContent;
            selectedText.style.color = '#000';
            hiddenInput.value = this.dataset.value;
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            dropdown.classList.remove('open');
        });
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Calendar functionality
    const dateInput = document.getElementById(`checkin-checkout${suffix}`);
    const calendarContainer = document.getElementById(`calendarContainer${suffix}`);
    const currentMonthDays = document.getElementById(`calendar-current-days${suffix}`);
    const nextMonthDays = document.getElementById(`calendar-next-days${suffix}`);
    const currentMonthTitle = document.getElementById(`current-month-title${suffix}`);
    const nextMonthTitle = document.getElementById(`next-month-title${suffix}`);
    const prevMonthBtn = document.getElementById(`prev-month${suffix}`);
    const nextMonthBtn = document.getElementById(`next-month${suffix}`);
    
    // Cloudbeds reservation URLs
    const propertyUrls = {
        'siem-reap': 'https://hotels.cloudbeds.com/en/reservation/rmVKYa/?currency=usd',
        'phnom-penh': 'https://hotels.cloudbeds.com/en/reservation/PeZXom?currency=usd',
        'kampot': 'https://hotels.cloudbeds.com/en/reservation/CFTvLu?currency=usd',
        'sihanoukville': 'https://hotels.cloudbeds.com/en/reservation/ZyjPPV?currency=usd',
        'koh-rong-sanloem': 'https://hotels.cloudbeds.com/en/reservation/VUxg0w?currency=usd',
        'koh-rong': 'https://hotels.cloudbeds.com/en/reservation/XS8E0S?currency=usd'
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);
    let checkinDate = null;
    let checkoutDate = null;
    let selectingCheckin = true;
    
    // Show/hide calendar with positioning logic
    dateInput.addEventListener('click', function(e) {
        e.stopPropagation();
        calendarContainer.style.display = calendarContainer.style.display === 'block' ? 'none' : 'block';
        if (calendarContainer.style.display === 'block') {
            renderCalendars(currentDate);
            adjustDropdownPosition(calendarContainer, dateInput);
        }
    });
    
    // Close calendar when clicking outside
    document.addEventListener('click', function() {
        calendarContainer.style.display = 'none';
    });
    
    // Prevent calendar from closing when clicking inside it
    calendarContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Navigation
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateNavButtons();
        renderCalendars(currentDate);
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateNavButtons();
        renderCalendars(currentDate);
    });
    
    // Update navigation button states
    function updateNavButtons() {
        const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                              currentDate.getMonth() === today.getMonth();
        
        prevMonthBtn.disabled = isCurrentMonth;
        nextMonthBtn.disabled = false;
    }
    
    // Smart positioning function for dropdowns and calendar
    function adjustDropdownPosition(element, trigger) {
        const elementRect = element.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        
        element.classList.add('flip-down');
        element.classList.remove('flip-up');
        
        if (element.classList.contains('dropdown-options')) {
            const optionsHeight = element.scrollHeight;
            if (spaceBelow < optionsHeight && spaceAbove > optionsHeight) {
                element.classList.add('flip-up');
                element.classList.remove('flip-down');
            }
        } else if (element.classList.contains('calendar-container')) {
            const calendarHeight = element.scrollHeight;
            if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
                element.classList.add('flip-up');
                element.classList.remove('flip-down');
            }
        }
    }
    
    // Render both calendars
    function renderCalendars(date) {
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        
        // Render current month
        renderCalendar(currentMonthDays, currentMonthTitle, currentYear, currentMonth);
        
        // Calculate next month
        let nextMonth, nextYear;
        if (currentMonth === 11) {
            nextMonth = 0;
            nextYear = currentYear + 1;
        } else {
            nextMonth = currentMonth + 1;
            nextYear = currentYear;
        }
        
        // Render next month
        renderCalendar(nextMonthDays, nextMonthTitle, nextYear, nextMonth);
        
        updateNavButtons();
    }
    
    // Render single calendar
    function renderCalendar(container, titleElement, year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        titleElement.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        
        container.innerHTML = '';
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = prevMonthLastDay - startingDay + i + 1;
            container.appendChild(dayElement);
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            
            // Mark today
            if (dayDate.toDateString() === today.toDateString()) {
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
                
                dayElement.addEventListener('click', function() {
                    selectDate(dayDate);
                });
            }
            
            container.appendChild(dayElement);
        }
        
        // Next month days
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day disabled';
            dayElement.textContent = i;
            container.appendChild(dayElement);
        }
    }
    
    // Date selection
    function selectDate(date) {
        if (selectingCheckin) {
            checkinDate = date;
            checkoutDate = null;
            selectingCheckin = false;
            dateInput.placeholder = "Select check-out date";
        } else {
            if (date > checkinDate) {
                checkoutDate = date;
                selectingCheckin = true;
                dateInput.value = formatDateRange(checkinDate, checkoutDate);
                calendarContainer.style.display = 'none';
            } else {
                checkinDate = date;
                checkoutDate = null;
                dateInput.placeholder = "Select check-out date";
            }
        }
        renderCalendars(currentDate);
    }
    
    // Format date range
    function formatDateRange(startDate, endDate) {
        const startDay = startDate.getDate();
        const startMonth = startDate.toLocaleString('default', { month: 'long' });
        const startYear = startDate.getFullYear();
        
        const endDay = endDate.getDate();
        const endMonth = endDate.toLocaleString('default', { month: 'long' });
        const endYear = endDate.getFullYear();
        
        return `${startDay} ${startMonth} ${startYear}     |     ${endDay} ${endMonth} ${endYear}`;
    }
    
    // Format date for URL
    function formatDateForUrl(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Form submission
    document.getElementById(`searchForm${suffix}`).addEventListener('submit', function(e) {
        e.preventDefault();
        
        const destination = document.getElementById(`destination${suffix}`).value;
        
        if (!destination) {
            alert('Please select a destination');
            return;
        }
        
        if (!checkinDate || !checkoutDate) {
            alert('Please select both check-in and check-out dates');
            return;
        }
        
        let propertyUrl = propertyUrls[destination];
        const checkin = formatDateForUrl(checkinDate);
        const checkout = formatDateForUrl(checkoutDate);
        const finalUrl = `${propertyUrl}&checkin=${checkin}&checkout=${checkout}`;
        window.location.href = finalUrl;
    });
    
    // Initialize calendars
    renderCalendars(currentDate);
}