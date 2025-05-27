
// Variable to store the current filter category
let currentFilterCategory = 'all';
// Variable to store reminders for the event currently being edited/created in the modal
let currentModalReminders = [];

moment.locale('pt-br');


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
        console.error('eventService não disponível ou getEvents não é uma função.');
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
            console.warn('Formato de data inválido para o evento:', event);
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
        lang: 'pt-br', // Set language to Brazilian Portuguese
        range: true, // Note: Range true might affect onSelect behavior for single date selection intent
        tooltips: datepickkTooltips, // Use dynamically generated tooltips
        highlight: { // Keep existing highlight logic or adjust as needed
            start: new Date(now.getFullYear(), now.getMonth(), 4),
            end: new Date(now.getFullYear(), now.getMonth(), 6),
            backgroundColor: '#05676E',
            color: '#fff',
            legend: 'Destaque'
        },
        onSelect: function(isSelected) {
            // 'this' refers to the date object in Datepickk's onSelect
            const selectedDate = this; 
            
            // Attempt to format date using moment if available, otherwise manual.
            let formattedDate; // For hidden input, keep YYYY-MM-DD
            let displayDate;   // For user display, use DD/MM/YYYY
            if (typeof moment === 'function') {
                formattedDate = moment(selectedDate).format('YYYY-MM-DD');
                displayDate = moment(selectedDate).format('DD/MM/YYYY');
            } else {
                const year = selectedDate.getFullYear();
                const month = ('0' + (selectedDate.getMonth() + 1)).slice(-2); // Months are 0-indexed
                const day = ('0' + selectedDate.getDate()).slice(-2);
                formattedDate = year + '-' + month + '-' + day;
                displayDate = day + '/' + month + '/' + year;
            }

            const selectedDateDisplay = document.getElementById('selectedDateDisplay');
            const eventDateInput = document.getElementById('eventDateInput');

            if (selectedDateDisplay) {
                selectedDateDisplay.textContent = displayDate; // Use DD/MM/YYYY for display
            }
            if (eventDateInput) {
                eventDateInput.value = formattedDate; // Keep YYYY-MM-DD for hidden input
            }
            
            // Using jQuery to show the Bootstrap modal, as per Bootstrap's JS requirements
            if (typeof $ === 'function' && $('#eventModal').modal) {
                // Clear previous event's reminders before showing modal for a new event
                currentModalReminders = [];
                renderConfiguredReminders(); 
                $('#eventModal').modal('show');
            } else {
                console.error('jQuery ou função modal do Bootstrap não disponível.');
            }
        }
    });
    calendar.lang = 'pt-br'; // Explicitly set lang again after instantiation
    calendarDiv.classList.add('datepickk-initialized');

    // Add Event Listener for the "Save Event" button - moved to DOMContentLoaded
    // Store the instance if we needed to call methods on it later, e.g., a hypothetical destroy.
    // window.currentCalendarInstance = calendar; 

    displayUpcomingEvents(); // Call to display today's events in the overview
}

// Function to display upcoming events for today in the "Resumo de Hoje" section
function displayUpcomingEvents() {
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) {
        console.error('Error: Todays overview container (#todays-overview) not found.'); // Updated error message
        return;
    }

    if (!window.eventService || typeof window.eventService.getEvents !== 'function') {
        overviewContainer.innerHTML = '<h2>Próximos Eventos</h2><p>Serviço de eventos não disponível.</p>'; // Title updated
        console.error('eventService not available for displaying upcoming events.');
        return;
    }

    const allEvents = window.eventService.getEvents();
    console.log('Próximos Eventos - All Events:', JSON.stringify(allEvents, null, 2)); // Log title updated

    if (!allEvents) { 
        overviewContainer.innerHTML = '<h2>Próximos Eventos</h2><p>Não foi possível carregar eventos.</p>'; // Title updated
        return;
    }
    
    const startDate = moment().startOf('day');
    const endDate = moment().add(7, 'days').endOf('day'); // Includes today + 7 full days after
    
    console.log('Próximos Eventos - Start Date:', startDate.format('YYYY-MM-DD HH:mm')); // New log
    console.log('Próximos Eventos - End Date:', endDate.format('YYYY-MM-DD HH:mm'));   // New log

    const upcomingEvents = allEvents.filter((event, index) => {
        const eventDate = moment(event.date, 'YYYY-MM-DD'); 
        // Log for the first 5 events or a specific test event
        if (index < 5) { // Limit logging to avoid flooding the console
            console.log(`Próximos Eventos - Checking Event: Date='${event.date}', Parsed='${eventDate.format('YYYY-MM-DD')}', IsInPeriod=${eventDate.isBetween(startDate, endDate, null, '[]')}, Title='${event.title}'`); // Log title and logic updated
        }
        return eventDate.isBetween(startDate, endDate, null, '[]'); // '[]' includes start and end dates
    });

    const sortedEvents = upcomingEvents.sort((a, b) => { // New sorting logic
        const dateA = moment(a.date, 'YYYY-MM-DD');
        const dateB = moment(b.date, 'YYYY-MM-DD');
        if (dateA.isBefore(dateB)) return -1;
        if (dateA.isAfter(dateB)) return 1;
        // Dates are same, sort by time
        if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        } else if (a.startTime) {
            return -1; 
        } else if (b.startTime) {
            return 1;  
        }
        return 0;
    });
    
    console.log('Próximos Eventos - Filtered Upcoming Events:', JSON.stringify(sortedEvents, null, 2)); // Log title and variable updated

    let contentHtml = '<h2>Próximos Eventos</h2>'; // Title updated
    if (sortedEvents.length === 0) {
        contentHtml += '<p>Nenhum evento programado para hoje ou para os próximos 7 dias.</p>'; // Message updated
    } else {
        contentHtml += '<ul class="list-group">';
        sortedEvents.forEach(event => { // Variable updated
            const escapeHTML = str => str ? str.replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[match]) : '';

            const title = escapeHTML(event.title);
            const startTime = escapeHTML(event.startTime);
            const endTime = escapeHTML(event.endTime);
            const description = escapeHTML(event.description);
            
            const eventMomentDate = moment(event.date, 'YYYY-MM-DD'); // For date display
            let displayDateInfo = '';
            if (!eventMomentDate.isSame(moment().startOf('day'), 'day')) { // If not today
                displayDateInfo = `(${eventMomentDate.format('ddd, DD/MM')}) `; // e.g., (Sex, 23/07)
            }

            contentHtml += `
                <li class="list-group-item">
                    <h5 class="list-group-item-heading">${displayDateInfo}${title}</h5>
                    <p class="list-group-item-text mb-0">
                        ${startTime ? `Horário: ${startTime}` : 'Dia todo'}
                        ${endTime ? ` - ${endTime}` : ''}
                    </p>
                    ${description ? `<p class="list-group-item-text text-muted" style="font-size: 0.9em; margin-top: 5px;"><small>${description}</small></p>` : ''} 
                </li>`; // Applied small tag to description as per original snippet's implied style
        });
        contentHtml += '</ul>';
    }
    
    console.log('Próximos Eventos - Generated HTML:', contentHtml); // Log title updated
    overviewContainer.innerHTML = contentHtml;

    // Attach Event Listener for clickable event items
    const eventListUl = overviewContainer.querySelector('.list-group');
    if (eventListUl) {
        // Remove previous listener if any to prevent multiple attachments
        // This is a simple way; for more complex scenarios, consider AbortController or storing the handler.
        const newEventListUl = eventListUl.cloneNode(true);
        eventListUl.parentNode.replaceChild(newEventListUl, eventListUl);

        newEventListUl.addEventListener('click', function(e) {
            const listItem = e.target.closest('.upcoming-event-item');
            if (listItem) {
                const eventId = listItem.dataset.eventId;
                if (eventId) {
                    console.log('Clicked event item with ID:', eventId); // Log click
                    showEventDetails(eventId); 
                }
            }
        });
    }
}

// Function to show event details in the #viewEventModal
function showEventDetails(eventId) {
    if (!window.eventService || typeof window.eventService.getEvents !== 'function') {
        console.error('eventService not available for showEventDetails.');
        return;
    }
    const allEvents = window.eventService.getEvents();
    const eventIdNum = parseInt(eventId, 10); // Ensure eventId is a number for comparison
    
    console.log('showEventDetails - Searching for event ID:', eventIdNum, '(original string:', eventId, ')'); // Log search

    const event = allEvents.find(e => e.id === eventIdNum);

    if (event) {
        console.log('showEventDetails - Event found:', JSON.stringify(event, null, 2)); // Log found event

        // Populate the modal elements
        $('#viewEventTitle').text(event.title || 'Sem título');
        $('#viewEventDate').text(moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
        $('#viewEventTime').text(event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'Dia todo');
        
        const descriptionContainer = document.getElementById('viewEventDescriptionContainer');
        const descriptionEl = document.getElementById('viewEventDescription');
        if (event.description) {
            descriptionEl.textContent = event.description;
            descriptionContainer.style.display = 'block';
        } else {
            descriptionEl.textContent = ''; // Clear it
            descriptionContainer.style.display = 'none'; // Hide if no description
        }
        
        $('#viewEventCategory').text(event.category || 'Não especificada');

        const remindersListEl = document.getElementById('viewEventRemindersList');
        const remindersContainer = document.getElementById('viewEventRemindersContainer');
        if (remindersListEl && remindersContainer) {
            remindersListEl.innerHTML = ''; // Clear previous reminders
            if (event.reminders && event.reminders.length > 0) {
                event.reminders.forEach(reminder => {
                    const li = document.createElement('li');
                    li.textContent = `${reminder.value} ${reminder.unit === 'minutes' ? 'Minutos Antes' : 'Horas Antes'}`;
                    remindersListEl.appendChild(li);
                });
                remindersContainer.style.display = 'block';
            } else {
                remindersListEl.innerHTML = '<li>Nenhum lembrete configurado.</li>'; // Display if no reminders
                // Or hide the section: remindersContainer.style.display = 'none';
            }
        }
        
        // Show the modal using jQuery
        if (typeof $ === 'function' && $('#viewEventModal').modal) {
            $('#viewEventModal').modal('show');
        } else {
            console.error('jQuery or Bootstrap modal function not available to show #viewEventModal.');
        }

    } else {
        console.error('showEventDetails - Event with ID ' + eventIdNum + ' not found.');
    }
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
        text.textContent = `${reminder.value} ${reminder.unit === 'minutes' ? 'Minutos Antes' : 'Horas Antes'}`;
        
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
    // const calendarDiv = document.querySelector('#calendar'); // Removed from here, initCalendar will find it

    const saveEventButton = document.getElementById('saveEventButton');
    const addReminderButton = document.getElementById('addReminderButton');
    const reminderUnitInput = document.getElementById('reminderUnitInput');
    const configuredRemindersList = document.getElementById('configuredRemindersList'); // For event delegation

    if (categoryFilterDropdown) { // Check only for the dropdown existing in index.html
        categoryFilterDropdown.addEventListener('change', function() {
            currentFilterCategory = this.value;
            // initCalendar is responsible for finding the #calendar div
            // and handling its 'datepickk-initialized' state.
            initCalendar(); 
        });
    } else {
        console.error('#categoryFilterDropdown not found.');
        // The error about #calendar div is removed as it's not needed at this stage of listener setup.
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
                alert('Por favor, insira pelo menos um título e certifique-se de que uma data seja selecionada.');
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
                // initCalendar will handle finding #calendar and its initialized state.
                // No need to manipulate calendarDiv's classes here directly.
                initCalendar(); 
            } else {
                console.error('eventService não disponível ou addEvent não é uma função.');
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
                alert('Por favor, selecione um valor de lembrete válido.');
                return;
            }
            
            // Check for duplicate reminders (optional, but good UX)
            const exists = currentModalReminders.some(r => r.value === value && r.unit === unit);
            if (exists) {
                alert('Este lembrete já foi adicionado.');
                return;
            }
            if (currentModalReminders.length >= 5) { // Limit number of reminders
                alert('Você pode adicionar no máximo 5 lembretes.');
                return;
            }
            
            const newReminder = {
                id: Date.now(), // Unique ID for this reminder instance
                value: value,
                unit: unit,
                shown: false // Default for future use
            };
            currentModalReminders.push(newReminder);
            console.log('Adicionando lembrete à UI:', newReminder);
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
