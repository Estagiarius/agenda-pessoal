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

    var now = new Date();
    // Initializing the calendar
    var calendar = new Datepickk({
        container: calendarDiv,
        inline: true,
        range: true, // Note: Range true might affect onSelect behavior for single date selection intent
        tooltips: {
            date: new Date(),
            text: 'Tooltip'
        },
        highlight: {
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
