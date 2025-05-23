// Variable to store the current filter category
let currentFilterCategory = 'all';
// Variable to store reminders for the event currently being edited/created in the modal
let currentModalReminders = [];

function initCalendar() {
    const calendarDiv = document.querySelector('#calendar');
    if (!calendarDiv) {
        // console.warn('Calendar div #calendar not found for initialization.');
        return;
    }
    if (calendarDiv.classList.contains('datepickk-initialized')) {
        // console.log('Calendar already initialized on #calendar.');
        return;
    }

    // Retrieve events before initializing Datepickk
    let allEvents = [];
    if (window.eventService && typeof window.eventService.getEvents === 'function') {
        allEvents = window.eventService.getEvents();
    } else {
        console.error('eventService not available or getEvents is not a function.');
    }

    // Filter events based on currentFilterCategory
    const filteredEvents = (currentFilterCategory === 'all')
        ? allEvents
        : allEvents.filter(event => event.category === currentFilterCategory);
    
    // console.log('Displaying events for category:', currentFilterCategory, filteredEvents); // For debugging

    // Transform events into datepickkTooltips
    const datepickkTooltips = [];
    const eventsByDate = {}; // Helper to group events

    filteredEvents.forEach(event => { // Use filteredEvents here
        // Assuming event.date is 'YYYY-MM-DD'
        const parts = event.date.split('-');
        if (parts.length === 3) {
            const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            
            const dateKey = eventDate.toDateString(); // Use toDateString for grouping by day

            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = {
                    date: eventDate, // Store the actual Date object
                    eventDetails: [] // Store event title and category
                };
            }
            eventsByDate[dateKey].eventDetails.push({ title: event.title, category: event.category });
        } else {
            console.warn('Invalid date format for event:', event);
        }
    });

    for (const key in eventsByDate) {
        const dayData = eventsByDate[key];
        const tooltipText = dayData.eventDetails.map(detail => {
            if (detail.category && detail.category !== 'General') {
                return `[${detail.category}] ${detail.title}`;
            }
            return detail.title;
        }).join('\n');

        datepickkTooltips.push({
            date: dayData.date,
            text: tooltipText
        });
    }
    // console.log('Generated Datepickk tooltips:', datepickkTooltips); // For debugging

    var now = new Date(); // Still used for highlight, can be kept.

    // If calendar instance exists, try to destroy it before re-initializing
    // This is a common pattern if a library doesn't offer a direct update method.
    // However, Datepickk's API is unknown, so we rely on the 'datepickk-initialized' flag.
    // For this exercise, we'll assume no explicit destroy method is available/needed beyond removing the class.

    // Initializing the calendar
    var calendar = new Datepickk({ // 'calendar' variable is scoped to initCalendar
        container: calendarDiv,
        inline: true,
        range: true, 
        tooltips: datepickkTooltips, 
        highlight: { // Keep existing highlight logic or adjust as needed
            start: new Date(now.getFullYear(), now.getMonth(), 4),
            end: new Date(now.getFullYear(), now.getMonth(), 6),
            backgroundColor: '#05676E',
            color: '#fff',
            legend: 'Highlight'
        },
        onSelect: function(isSelected) {
            // 'this' refers to the date object in Datepickk's onSelect
            const selectedDate = this; 
            
            // Attempt to format date using moment if available, otherwise manual.
            let formattedDate;
            if (typeof moment === 'function') {
                formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            } else {
                const year = selectedDate.getFullYear();
                const month = ('0' + (selectedDate.getMonth() + 1)).slice(-2); // Months are 0-indexed
                const day = ('0' + selectedDate.getDate()).slice(-2);
                formattedDate = year + '-' + month + '-' + day;
            }

            const selectedDateDisplay = document.getElementById('selectedDateDisplay');
            const eventDateInput = document.getElementById('eventDateInput');

            if (selectedDateDisplay) {
                selectedDateDisplay.textContent = formattedDate;
            }
            if (eventDateInput) {
                eventDateInput.value = formattedDate;
            }
            
            // Using jQuery to show the Bootstrap modal, as per Bootstrap's JS requirements
            if (typeof $ === 'function' && $('#eventModal').modal) {
                // Clear previous event's reminders before showing modal for a new event
                currentModalReminders = [];
                renderConfiguredReminders(); 
                $('#eventModal').modal('show');
            } else {
                console.error('jQuery or Bootstrap modal function not available.');
            }
        }
    });
    calendarDiv.classList.add('datepickk-initialized');

    // Add Event Listener for the "Save Event" button - moved to DOMContentLoaded
    // Store the instance if we needed to call methods on it later, e.g., a hypothetical destroy.
    // window.currentCalendarInstance = calendar; 
}

// Function to render configured reminders in the modal
function renderConfiguredReminders() {
    const configuredRemindersList = document.getElementById('configuredRemindersList');
    if (!configuredRemindersList) return;

    configuredRemindersList.innerHTML = ''; // Clear current list
    currentModalReminders.forEach(reminder => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center p-2'; // Added padding
        
        const text = document.createElement('span');
        text.textContent = `${reminder.value} ${reminder.unit === 'minutes' ? 'Minutes Before' : 'Hours Before'}`;
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-danger btn-xs remove-reminder';
        removeButton.innerHTML = '&times;'; // Use times symbol for 'X'
        removeButton.dataset.reminderId = reminder.id;
        removeButton.style.marginLeft = '10px';

        listItem.appendChild(text);
        listItem.appendChild(removeButton);
        configuredRemindersList.appendChild(listItem);
    });
}

// Function to update reminder value options based on selected unit
function updateReminderValueOptions() {
    const reminderUnitInput = document.getElementById('reminderUnitInput');
    const reminderValueInput = document.getElementById('reminderValueInput');
    if (!reminderUnitInput || !reminderValueInput) return;

    const currentUnit = reminderUnitInput.value;
    let options = [];

    if (currentUnit === 'minutes') {
        options = [10, 15, 20, 30, 45, 60];
    } else if (currentUnit === 'hours') {
        options = [1, 2, 3, 5, 12, 24];
    }

    reminderValueInput.innerHTML = ''; // Clear existing options
    options.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        reminderValueInput.appendChild(option);
    });
}


// Setup event listeners once DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilterDropdown = document.getElementById('categoryFilterDropdown');
    const calendarDiv = document.querySelector('#calendar'); // For re-initialization
    
    const saveEventButton = document.getElementById('saveEventButton');
    const addReminderButton = document.getElementById('addReminderButton');
    const reminderUnitInput = document.getElementById('reminderUnitInput');
    const configuredRemindersList = document.getElementById('configuredRemindersList'); // For event delegation

    if (categoryFilterDropdown && calendarDiv) {
        categoryFilterDropdown.addEventListener('change', function() {
            currentFilterCategory = this.value;
            if (calendarDiv.classList.contains('datepickk-initialized')) {
                calendarDiv.classList.remove('datepickk-initialized');
            }
            initCalendar();
        });
    } else {
        if (!categoryFilterDropdown) console.error('#categoryFilterDropdown not found.');
        if (!calendarDiv) console.error('#calendar div not found for filter listener setup.');
    }

    // Listener for Save Event Button
    if (saveEventButton) {
        saveEventButton.addEventListener('click', function() {
            const title = document.getElementById('eventTitleInput').value;
            const date = document.getElementById('eventDateInput').value;
            const startTime = document.getElementById('eventStartTimeInput').value;
            const endTime = document.getElementById('eventEndTimeInput').value;
            const description = document.getElementById('eventDescriptionInput').value;
            const category = document.getElementById('eventCategoryInput').value;

            if (!title || !date) {
                alert('Please enter at least a title and ensure a date is selected.');
                return;
            }

            const eventObject = {
                title: title, date: date, startTime: startTime, endTime: endTime,
                description: description, category: category,
                reminders: [...currentModalReminders] // Add configured reminders
            };

            if (window.eventService && typeof window.eventService.addEvent === 'function') {
                console.log('Salvando evento com lembretes:', JSON.stringify(eventObject.reminders));
                window.eventService.addEvent(eventObject);
                if (calendarDiv && calendarDiv.classList.contains('datepickk-initialized')) {
                    calendarDiv.classList.remove('datepickk-initialized');
                }
                initCalendar(); 
            } else {
                console.error('eventService not available or addEvent is not a function.');
            }
            
            const eventForm = document.getElementById('eventForm');
            if (eventForm) {
                 eventForm.reset(); // This will reset text inputs, selects to first option
            }
            // Manually reset reminder-specific parts
            currentModalReminders = [];
            renderConfiguredReminders();
            if (reminderUnitInput) reminderUnitInput.value = 'minutes'; // Reset unit to default
            updateReminderValueOptions(); // Reset value options to default for minutes

            if (typeof $ === 'function' && $('#eventModal').modal) {
                $('#eventModal').modal('hide');
            }
        });
        // saveEventButton.dataset.listenerAttached = 'true'; // Not strictly needed if listener attached once in DOMContentLoaded
    }

    // Listener for Add Reminder Button
    if (addReminderButton) {
        addReminderButton.addEventListener('click', function() {
            const reminderValueInput = document.getElementById('reminderValueInput');
            // reminderUnitInput is already defined above

            const value = parseInt(reminderValueInput.value, 10);
            const unit = reminderUnitInput.value;

            if (isNaN(value)) {
                alert('Please select a valid reminder value.');
                return;
            }
            
            // Check for duplicate reminders (optional, but good UX)
            const exists = currentModalReminders.some(r => r.value === value && r.unit === unit);
            if (exists) {
                alert('This reminder has already been added.');
                return;
            }
            if (currentModalReminders.length >= 5) { // Limit number of reminders
                alert('You can add a maximum of 5 reminders.');
                return;
            }

            currentModalReminders.push({
                id: Date.now(), // Unique ID for this reminder instance
                value: value,
                unit: unit,
                shown: false // Default for future use
            };
            currentModalReminders.push(newReminderObject);
            console.log('Adicionando lembrete à UI:', newReminderObject);
            renderConfiguredReminders();
        });
    }

    // Listener for changing reminder unit (to update value options)
    if (reminderUnitInput) {
        reminderUnitInput.addEventListener('change', updateReminderValueOptions);
        // Initialize options on page load
        updateReminderValueOptions(); 
    }

    // Event delegation for removing reminders
    if (configuredRemindersList) {
        configuredRemindersList.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-reminder') || event.target.closest('.remove-reminder')) {
                const button = event.target.closest('.remove-reminder');
                const reminderIdToRemove = Number(button.dataset.reminderId);
                currentModalReminders = currentModalReminders.filter(r => r.id !== reminderIdToRemove);
                renderConfiguredReminders();
            }
        });
    }
    
    // Optional: Clear reminders when modal is closed without saving (e.g., by clicking 'Close' or 'X')
    if (typeof $ === 'function' && $('#eventModal').on) {
        $('#eventModal').on('hidden.bs.modal', function () {
            // This event fires after the modal has finished being hidden.
            // Reset form elements that are not reset by eventForm.reset() or if save wasn't clicked.
            const eventForm = document.getElementById('eventForm');
            if (eventForm) { // Check if the form still exists / is relevant
                 eventForm.reset();
            }
            currentModalReminders = [];
            renderConfiguredReminders();
            if (reminderUnitInput) reminderUnitInput.value = 'minutes';
            updateReminderValueOptions();
        });
    }
});
