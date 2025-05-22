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
    let events = [];
    if (window.eventService && typeof window.eventService.getEvents === 'function') {
        events = window.eventService.getEvents();
        // console.log('Retrieved events for calendar:', events); // For debugging
    } else {
        console.error('eventService not available or getEvents is not a function.');
    }

    // Transform events into datepickkTooltips
    const datepickkTooltips = [];
    const eventsByDate = {}; // Helper to group events

    events.forEach(event => {
        // Assuming event.date is 'YYYY-MM-DD'
        const parts = event.date.split('-');
        if (parts.length === 3) {
            const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            
            const dateKey = eventDate.toDateString(); // Use toDateString for grouping by day

            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = {
                    date: eventDate, // Store the actual Date object
                    titles: []
                };
            }
            eventsByDate[dateKey].titles.push(event.title);
        } else {
            console.warn('Invalid date format for event:', event);
        }
    });

    for (const key in eventsByDate) {
        const dayData = eventsByDate[key];
        datepickkTooltips.push({
            date: dayData.date,
            text: dayData.titles.join('\n') // Join multiple titles with a newline for the tooltip
        });
    }
    // console.log('Generated Datepickk tooltips:', datepickkTooltips); // For debugging

    var now = new Date(); // Still used for highlight, can be kept.
    // Initializing the calendar
    var calendar = new Datepickk({
        container: calendarDiv,
        inline: true,
        range: true, // Note: Range true might affect onSelect behavior for single date selection intent
        tooltips: datepickkTooltips, // Use dynamically generated tooltips
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
    if (saveEventButton && !saveEventButton.dataset.listenerAttached) { // Prevent attaching multiple listeners
        saveEventButton.addEventListener('click', function() {
            const title = document.getElementById('eventTitleInput').value;
            const date = document.getElementById('eventDateInput').value; // From hidden input
            const startTime = document.getElementById('eventStartTimeInput').value;
            const endTime = document.getElementById('eventEndTimeInput').value;
            const description = document.getElementById('eventDescriptionInput').value;

            if (!title || !date) {
                alert('Please enter at least a title and ensure a date is selected.');
                return;
            }

            const eventObject = {
                title: title,
                date: date,
                startTime: startTime,
                endTime: endTime,
                description: description
            };

            if (window.eventService && typeof window.eventService.addEvent === 'function') {
                window.eventService.addEvent(eventObject);
                // For debugging:
                // console.log('Current events:', window.eventService.getEvents());
                // After adding an event, the calendar tooltips should ideally refresh.
                // This might require re-initializing the calendar or having a method to update tooltips.
                // For now, this subtask focuses on initial load.
                 if (typeof initCalendar === 'function') { // Attempt to refresh calendar
                    // Need to remove the 'datepickk-initialized' class to allow re-initialization
                    if(calendarDiv) calendarDiv.classList.remove('datepickk-initialized');
                    initCalendar();
                }
            } else {
                console.error('eventService not available or addEvent is not a function.');
            }
            
            const eventForm = document.getElementById('eventForm');
            if (eventForm) {
                 eventForm.reset(); // Reset the form
            }

            if (typeof $ === 'function' && $('#eventModal').modal) {
                $('#eventModal').modal('hide'); // Hide modal using jQuery
            }
        });
        saveEventButton.dataset.listenerAttached = 'true';
    }
}
