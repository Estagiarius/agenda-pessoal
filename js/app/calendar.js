// Variable to store the current filter category
let currentFilterCategory = 'all';

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
                 $('#eventModal').modal('show');
            } else {
                console.error('jQuery or Bootstrap modal function not available.');
            }
        }
    });
    calendarDiv.classList.add('datepickk-initialized');

    // Add Event Listener for the "Save Event" button
    const saveEventButton = document.getElementById('saveEventButton');
    // Ensure this listener is only attached once.
    // A more robust way would be to manage the listener outside initCalendar if initCalendar is called multiple times.
    // For now, the data-attribute guard is kept.
    if (saveEventButton && !saveEventButton.dataset.listenerAttached) { 
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
                description: description, category: category
            };

            if (window.eventService && typeof window.eventService.addEvent === 'function') {
                window.eventService.addEvent(eventObject);
                
                // Regarding calendar refresh:
                // Without specific Datepickk API documentation for updating tooltips dynamically,
                // the safest approach provided by the current structure is re-initialization.
                // If Datepickk had a method like `calendar.updateTooltips(newTooltipsArray)`
                // or `calendar.refreshData()`, that would be preferred.
                // For now, we continue to re-initialize.
                // The 'datepickk-initialized' class removal allows initCalendar to run again.
                if (calendarDiv) {
                    calendarDiv.classList.remove('datepickk-initialized');
                    // Potentially, if Datepickk had a destroy method, it would be called here:
                    // if (window.currentCalendarInstance && typeof window.currentCalendarInstance.destroy === 'function') {
                    //     window.currentCalendarInstance.destroy();
                    // }
                }
                initCalendar(); // Re-initialize the calendar to show new event tooltip
            } else {
                console.error('eventService not available or addEvent is not a function.');
            }
            
            const eventForm = document.getElementById('eventForm');
            if (eventForm) {
                 eventForm.reset();
            }

            if (typeof $ === 'function' && $('#eventModal').modal) {
                $('#eventModal').modal('hide');
            }
        });
        saveEventButton.dataset.listenerAttached = 'true';
    }
    // Store the instance if we needed to call methods on it later, e.g., a hypothetical destroy.
    // window.currentCalendarInstance = calendar; 
}

// Setup event listener for the category filter dropdown
// This should be done once the DOM is ready, or ensure this script runs after the dropdown exists.
// Given script placement at end of body, this should be fine.
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilterDropdown = document.getElementById('categoryFilterDropdown');
    const calendarDiv = document.querySelector('#calendar'); // Get calendarDiv for re-initialization

    if (categoryFilterDropdown && calendarDiv) {
        categoryFilterDropdown.addEventListener('change', function() {
            currentFilterCategory = this.value;
            // console.log('Filter changed to:', currentFilterCategory); // For debugging
            
            if (calendarDiv.classList.contains('datepickk-initialized')) {
                calendarDiv.classList.remove('datepickk-initialized');
            }
            // Potentially, if Datepickk had a destroy method, it would be called here:
            // if (window.currentCalendarInstance && typeof window.currentCalendarInstance.destroy === 'function') {
            //     window.currentCalendarInstance.destroy();
            // }
            initCalendar(); // Re-initialize the calendar with the new filter
        });
    } else {
        if (!categoryFilterDropdown) console.error('#categoryFilterDropdown not found.');
        if (!calendarDiv) console.error('#calendar div not found for filter listener setup.');
    }
});
