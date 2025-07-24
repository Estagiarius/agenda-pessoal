
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

function showEventDetails(eventId) {
    console.log(`Attempting to show details for event ID: ${eventId}`);

    if (!window.eventService || typeof window.eventService.getEventById !== 'function') {
        console.error('eventService is not available or getEventById is not a function.');
        return;
    }

    const event = window.eventService.getEventById(eventId);

    if (!event) {
        console.error(`Event with ID ${eventId} not found.`);
        return;
    }

    console.log('Event retrieved:', event);

    // Populate modal elements - using placeholder IDs for now
    // These IDs would need to exist in your #viewEventModal HTML structure
    const modalTitle = document.getElementById('viewEventModalTitle');
    const modalDescription = document.getElementById('viewEventModalDescription');
    const modalDate = document.getElementById('viewEventModalDate');
    const modalTime = document.getElementById('viewEventModalTime');
    const modalCategory = document.getElementById('viewEventModalCategory');

    if (modalTitle) modalTitle.textContent = event.title || 'N/A';
    if (modalDescription) modalDescription.textContent = event.description || 'N/A';
    
    let formattedDate = 'N/A';
    if (event.date) {
        if (typeof moment === 'function') {
            formattedDate = moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
        } else {
            // Basic formatting if moment is not available
            const parts = event.date.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } else {
                formattedDate = event.date; // Fallback to original if format is unexpected
            }
        }
    }
    if (modalDate) modalDate.textContent = `Date: ${formattedDate}`;

    let timeInfo = 'All day';
    if (event.startTime) {
        timeInfo = `Time: ${event.startTime}`;
        if (event.endTime) {
            timeInfo += ` - ${event.endTime}`;
        }
    }
    if (modalTime) modalTime.textContent = timeInfo;

    if (modalCategory) modalCategory.textContent = `Category: ${event.category || 'General'}`;

    // Populate reminders
    const modalReminders = document.getElementById('viewEventModalReminders');
    if (modalReminders) {
        if (event.reminders && event.reminders.length > 0) {
            const reminderTexts = event.reminders.map(reminder => {
                return `${reminder.value} ${reminder.unit === 'minutes' ? 'Minutos Antes' : 'Horas Antes'}`;
            });
            modalReminders.textContent = reminderTexts.join(', ');
        } else {
            modalReminders.textContent = 'Nenhum lembrete configurado.';
        }
    } else {
        console.warn('#viewEventModalReminders element not found in the modal.');
    }

    // Show the modal using jQuery
    if (typeof $ === 'function' && $('#viewEventModal').modal) {
        $('#viewEventModal').modal('show');
        console.log(`Attempted to show #viewEventModal for event ID: ${eventId}`);
    } else {
        console.error('jQuery or Bootstrap modal function not available to show #viewEventModal.');
    }
}

// Function to display upcoming events and tasks
function displayUpcomingEventsAndTasks() {
    // Display upcoming events in "Resumo de Hoje"
    displayUpcomingEvents();
    // Display upcoming and overdue tasks in "Tarefas Próximas"
    displayUpcomingTasks();
}

// Function to display upcoming events for today in the "Resumo de Hoje" section
function displayUpcomingEvents() {
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) {
        console.error('Error: Todays overview container not found.');
        return;
    }

    if (!window.eventService || typeof window.eventService.getEvents !== 'function') {
        overviewContainer.innerHTML = '<h3>Resumo de Hoje</h3><p>Serviço de eventos não disponível.</p>';
        return;
    }

    const allEvents = window.eventService.getEvents();
    const today = moment().startOf('day');
    const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

    const upcomingEvents = allEvents.filter(event => {
        const eventDate = moment(event.date, 'YYYY-MM-DD');
        return eventDate.isBetween(today, sevenDaysFromNow, null, '[]');
    }).sort((a, b) => {
        const dateA = moment(a.date, 'YYYY-MM-DD');
        const dateB = moment(b.date, 'YYYY-MM-DD');
        if (dateA.isBefore(dateB)) return -1;
        if (dateA.isAfter(dateB)) return 1;
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return a.startTime ? -1 : 1;
    });

    let contentHtml = '<h3>Resumo de Hoje</h3>';
    if (upcomingEvents.length === 0) {
        contentHtml += '<p>Nenhum evento programado para os próximos 7 dias.</p>';
    } else {
        contentHtml += '<ul class="list-group">';
        upcomingEvents.forEach(event => {
            const eventDateFormatted = moment(event.date, 'YYYY-MM-DD').format('DD/MM');
            const title = escapeHTML(event.title);
            const startTime = escapeHTML(event.startTime);
            const eventId = escapeHTML(String(event.id));

            contentHtml += `
                <li class="list-group-item" data-event-id="${eventId}" style="cursor: pointer;">
                    <h5 class="list-group-item-heading">
                        <span class="badge pull-right">${eventDateFormatted}</span>
                        ${title}
                    </h5>
                    <p class="list-group-item-text mb-0">
                        ${startTime ? `Horário: ${startTime}` : 'Dia todo'}
                    </p>
                </li>`;
        });
        contentHtml += '</ul>';
    }
    overviewContainer.innerHTML = contentHtml;

    overviewContainer.addEventListener('click', function(e) {
        const listItem = e.target.closest('li.list-group-item[data-event-id]');
        if (listItem) {
            showEventDetails(listItem.dataset.eventId);
        }
    });
}

function displayUpcomingTasks() {
    const tasksContainer = document.getElementById('upcoming-tasks-container');
    if (!tasksContainer) {
        console.error('Error: Upcoming tasks container not found.');
        return;
    }

    if (!window.todoService || typeof window.todoService.getTasks !== 'function') {
        tasksContainer.innerHTML = '<h3>Tarefas Próximas</h3><p>Serviço de tarefas não disponível.</p>';
        return;
    }

    const allTasks = window.todoService.getTasks();
    const today = moment().startOf('day');

    const upcomingAndOverdueTasks = allTasks.filter(task => {
        if (task.completed) return false;
        if (!task.dueDate) return false; // Only include tasks with a due date
        const dueDate = moment(task.dueDate, 'YYYY-MM-DD');
        return dueDate.isSameOrAfter(today) || dueDate.isBefore(today);
    }).sort((a, b) => moment(a.dueDate, 'YYYY-MM-DD').diff(moment(b.dueDate, 'YYYY-MM-DD')));

    let contentHtml = '<h3>Tarefas Próximas</h3>';
    if (upcomingAndOverdueTasks.length === 0) {
        contentHtml += '<p>Nenhuma tarefa próxima ou vencida.</p>';
    } else {
        contentHtml += '<ul class="list-group">';
        upcomingAndOverdueTasks.forEach(task => {
            const dueDate = moment(task.dueDate, 'YYYY-MM-DD');
            const isOverdue = dueDate.isBefore(today);
            const dueDateFormatted = dueDate.format('DD/MM/YYYY');
            const text = escapeHTML(task.text);
            const taskId = escapeHTML(String(task.id));

            contentHtml += `
                <li class="list-group-item task-item ${isOverdue ? 'task-overdue' : ''}" data-task-id="${taskId}">
                    <span class="task-text">${text}</span>
                    <span class="task-due-date ${isOverdue ? 'text-danger' : ''}">
                        Vence em: ${dueDateFormatted}
                    </span>
                </li>`;
        });
        contentHtml += '</ul>';
    }
    tasksContainer.innerHTML = contentHtml;
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
    // const calendarDiv = document.querySelector('#calendar'); // Removed from here, initCalendar will find it

    const saveEventButton = document.getElementById('saveEventButton');
    const addReminderButton = document.getElementById('addReminderButton');
    const reminderUnitInput = document.getElementById('reminderUnitInput');
    const configuredRemindersList = document.getElementById('configuredRemindersList'); // For event delegation

    // New Category Filter Dropdown Logic
    const categoryFilterDropdownMenu = document.getElementById('categoryFilterDropdownMenu');
    const selectedCategoryLabel = document.getElementById('selectedCategoryLabel');

    if (categoryFilterDropdownMenu && selectedCategoryLabel) {
        // Set initial label based on currentFilterCategory
        const initialCategoryLink = Array.from(categoryFilterDropdownMenu.querySelectorAll('a')).find(a => a.dataset.value === currentFilterCategory);
        if (initialCategoryLink) {
          selectedCategoryLabel.textContent = initialCategoryLink.textContent;
        }

        categoryFilterDropdownMenu.addEventListener('click', function(event) {
            if (event.target.tagName === 'A' && event.target.dataset.value) {
                event.preventDefault();
                const selectedValue = event.target.dataset.value;
                const selectedText = event.target.textContent;

                console.log('Category filter selected: ' + selectedText + ' (value: ' + selectedValue + ')');

                currentFilterCategory = selectedValue;
                selectedCategoryLabel.textContent = selectedText;
                
                // Ensure initCalendar is called to refresh content
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('initCalendar function not found after category selection.');
                }
            }
        });
    } else {
        if (!categoryFilterDropdownMenu) console.error('#categoryFilterDropdownMenu not found for new category filter.');
        if (!selectedCategoryLabel) console.error('#selectedCategoryLabel not found for new category filter.');
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

            const recurrenceFrequency = document.getElementById('eventRecurrenceFrequency').value;
            const recurrenceEndDate = document.getElementById('eventRecurrenceEndDate').value;

            const eventObject = {
                title: title, date: date, startTime: startTime, endTime: endTime,
                description: description, category: category,
                reminders: [...currentModalReminders], // Add configured reminders
                recurrenceFrequency: recurrenceFrequency,
                recurrenceEndDate: recurrenceEndDate
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

    // Initial call to setup the calendar and upcoming events on page load
    if (typeof initCalendar === 'function') {
        initCalendar();
        displayUpcomingEventsAndTasks();
    } else {
        console.error('initCalendar function not found on DOMContentLoaded.');
    }

    const recurrenceFrequencySelect = document.getElementById('eventRecurrenceFrequency');
    const recurrenceEndDateGroup = document.getElementById('recurrence-end-date-group');

    if (recurrenceFrequencySelect) {
        recurrenceFrequencySelect.addEventListener('change', function() {
            if (this.value === 'none') {
                recurrenceEndDateGroup.style.display = 'none';
            } else {
                recurrenceEndDateGroup.style.display = 'block';
            }
        });
    }
});

// Helper function to escape HTML content
function escapeHTML(str) {
    if (typeof str !== 'string') {
        if (str === null || typeof str === 'undefined') {
            return '';
        }
        str = String(str); // Convert to string if possible (e.g. numbers)
    }
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[match]);
}

// Function to render all events on the "Agenda Completa" page
function renderAllEventsPage() {
    const container = document.getElementById('all-events-container');
    if (!container) {
        console.error('Error: Container #all-events-container not found for Agenda Completa.');
        return;
    }

    if (!window.eventService || typeof window.eventService.getEvents !== 'function') {
        container.innerHTML = '<p>Serviço de eventos não disponível.</p>';
        console.error('eventService not available for rendering all events.');
        return;
    }

    const allEvents = window.eventService.getEvents();

    if (!allEvents || allEvents.length === 0) {
        container.innerHTML = '<p>Nenhum evento cadastrado no sistema.</p>';
        return;
    }

    // Sort events: primarily by date (ascending), secondarily by start time (ascending)
    allEvents.sort((a, b) => {
        const dateA = moment(a.date, 'YYYY-MM-DD');
        const dateB = moment(b.date, 'YYYY-MM-DD');
        if (dateA.isBefore(dateB)) return -1;
        if (dateA.isAfter(dateB)) return 1;
        
        // Dates are same, sort by time (earliest first)
        if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        } else if (a.startTime) { // a has time, b doesn't (all day)
            return -1;
        } else if (b.startTime) { // b has time, a doesn't (all day)
            return 1;
        }
        return 0; // Both all day or no times
    });

    let contentHtml = '';
    allEvents.forEach(event => {
        const displayDate = moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
        let timeInfo = event.startTime ? `${escapeHTML(event.startTime)} - ${escapeHTML(event.endTime || 'sem hora de término')}` : 'Dia todo';
        
        // Ensure event.id is a string for the data-event-id attribute
        const eventId = escapeHTML(String(event.id || `event-${Date.now()}-${Math.random()}`));


        contentHtml += `
            <div class="panel panel-default event-item" style="margin-bottom: 15px;">
                <div class="panel-heading">
                    <h3 class="panel-title">${escapeHTML(event.title)} - ${escapeHTML(displayDate)}</h3>
                </div>
                <div class="panel-body">
                    <p><strong>Horário:</strong> ${timeInfo}</p> 
                    <p><strong>Categoria:</strong> ${escapeHTML(event.category || 'Geral')}</p>
                    <p><strong>Descrição:</strong> ${escapeHTML(event.description || 'Nenhuma descrição.')}</p>
                </div>
                <div class="panel-footer">
                    <button class="btn btn-info btn-sm view-event-details-btn" data-event-id="${eventId}">Ver Detalhes</button>
                    <button class="btn btn-warning btn-sm edit-event-btn" data-event-id="${eventId}">Editar</button>
                    <button class="btn btn-danger btn-sm delete-event-btn" data-event-id="${eventId}" data-recurrence-id="${event.recurrenceId || ''}">Excluir</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = contentHtml;

    // Attach event listener to the container for handling clicks on "Ver Detalhes Completos" buttons
    container.addEventListener('click', function(e) {
        const target = e.target;
        if (target && target.classList.contains('view-event-details-btn')) {
            const eventId = target.dataset.eventId;
            if (eventId && typeof showEventDetails === 'function') {
                showEventDetails(eventId);
            }
        } else if (target && target.classList.contains('edit-event-btn')) {
            const eventId = target.dataset.eventId;
            // Placeholder for edit functionality
            alert(`A funcionalidade de edição para o evento ${eventId} ainda não foi implementada.`);
        } else if (target && target.classList.contains('delete-event-btn')) {
            const eventId = target.dataset.eventId;
            const recurrenceId = target.dataset.recurrenceId;
            if (recurrenceId) {
                showRecurrentEventDeletionModal(eventId, recurrenceId);
            } else {
                deleteEventFromAllEventsView(eventId);
            }
        }
    });
}

function showRecurrentEventDeletionModal(eventId, recurrenceId) {
    $('#recurrentEventDeletionModal').modal('show');

    document.getElementById('delete-this-event-btn').onclick = function() {
        window.eventService.deleteRecurrentEvent(eventId, recurrenceId, 'this');
        renderAllEventsPage();
        $('#recurrentEventDeletionModal').modal('hide');
    };

    document.getElementById('delete-future-events-btn').onclick = function() {
        window.eventService.deleteRecurrentEvent(eventId, recurrenceId, 'future');
        renderAllEventsPage();
        $('#recurrentEventDeletionModal').modal('hide');
    };

    document.getElementById('delete-all-events-btn').onclick = function() {
        window.eventService.deleteRecurrentEvent(eventId, recurrenceId, 'all');
        renderAllEventsPage();
        $('#recurrentEventDeletionModal').modal('hide');
    };
}

function deleteEventFromAllEventsView(eventId) {
    showConfirmationModal('Tem certeza que deseja excluir este evento?', function() {
        if (window.eventService.deleteEvent(eventId)) {
            renderAllEventsPage();
            showToast('Evento excluído com sucesso!');
        } else {
            showToast('Erro ao excluir o evento.', 'error');
        }
    });
}

// Initialization function for the "Agenda Completa" view, called by the router
function initAllEventsView() {
    console.log('Initializing All Events View...');
    renderAllEventsPage();

    const importIcsFileInput = document.getElementById('import-ics-file');
    if (importIcsFileInput) {
        importIcsFileInput.addEventListener('change', handleIcsFileImport);
    }
}

function handleIcsFileImport(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        try {
            const jcalData = ICAL.parse(content);
            const vcalendar = new ICAL.Component(jcalData);
            const vevents = vcalendar.getAllSubcomponents('vevent');

            vevents.forEach(vevent => {
                const event = new ICAL.Event(vevent);
                const eventObject = {
                    title: event.summary,
                    date: event.startDate.toJSDate().toISOString().slice(0, 10),
                    startTime: event.startDate.toJSDate().toTimeString().slice(0, 5),
                    endTime: event.endDate.toJSDate().toTimeString().slice(0, 5),
                    description: event.description,
                    category: 'Imported'
                };
                window.eventService.addEvent(eventObject);
            });

            renderAllEventsPage();
            showToast('Agenda importada com sucesso!');
        } catch (error) {
            console.error('Error parsing .ics file:', error);
            showToast('Erro ao importar o arquivo .ics.', 'error');
        }
    };
    reader.readAsText(file);
}
