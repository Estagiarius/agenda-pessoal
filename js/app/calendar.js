// Global variable to hold the calendar instance
let calendar;
// Variable to store reminders for the event currently being edited/created in the modal
let currentModalReminders = [];

moment.locale('pt-br');

/**
 * Renders a FullCalendar instance in a given container.
 * @param {HTMLElement} containerEl - The element to render the calendar in.
 * @param {string} initialView - The initial view to display ('dayGridMonth', 'timeGridWeek', etc.).
 */
function renderFullCalendar(containerEl, initialView) {
    // Clear any existing content
    containerEl.innerHTML = '';

    calendar = new FullCalendar.Calendar(containerEl, {
        locale: 'pt-br',
        initialView: initialView,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        selectable: true,
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const events = await window.eventService.getEvents(fetchInfo.startStr, fetchInfo.endStr);
                const mappedEvents = events.map(event => ({
                    id: event.id,
                    title: event.title,
                    start: event.startTime ? `${event.date}T${event.startTime}` : event.date,
                    end: event.endTime ? `${event.date}T${event.endTime}` : null,
                    allDay: !event.startTime,
                    extendedProps: {
                        description: event.description,
                        category: event.category,
                        reminders: event.reminders,
                        recurrence_id: event.recurrence_id,
                    }
                }));
                successCallback(mappedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        dateClick: function(info) {
            // Reset form and open modal for creating a new event
            document.getElementById('eventForm').reset();
            currentModalReminders = [];
            renderConfiguredReminders();

            const selectedDateDisplay = document.getElementById('selectedDateDisplay');
            const eventDateInput = document.getElementById('eventDateInput');
            const eventStartTimeInput = document.getElementById('eventStartTimeInput');

            if (selectedDateDisplay) selectedDateDisplay.textContent = moment(info.date).format('DD/MM/YYYY');
            if (eventDateInput) eventDateInput.value = moment(info.date).format('YYYY-MM-DD');
            
            // If the view has a time grid, pre-fill the time
            if (info.view.type.includes('timeGrid')) {
                eventStartTimeInput.value = moment(info.date).format('HH:mm');
            } else {
                eventStartTimeInput.value = '';
            }

            $('#eventModalLabel').text('Adicionar Novo Evento');
            $('#eventModal').modal('show');
        },
        eventClick: function(info) {
            showEventDetails(info.event.id);
        },
        eventDrop: async function(info) {
            const event = info.event;
            const updatedEvent = {
                id: event.id,
                title: event.title,
                date: moment(event.start).format('YYYY-MM-DD'),
                startTime: event.allDay ? null : moment(event.start).format('HH:mm:ss'),
                endTime: event.end ? moment(event.end).format('HH:mm:ss') : null,
                description: event.extendedProps.description,
                category: event.extendedProps.category,
                reminders: event.extendedProps.reminders,
                recurrence_id: event.extendedProps.recurrence_id,
            };
            try {
                await window.eventService.updateEvent(updatedEvent);
                showToast('Evento atualizado com sucesso!');
            } catch (error) {
                showToast('Erro ao atualizar evento.', 'error');
                console.error('Error updating event:', error);
                info.revert();
            }
        },
        eventResize: async function(info) {
            const event = info.event;
             const updatedEvent = {
                id: event.id,
                title: event.title,
                date: moment(event.start).format('YYYY-MM-DD'),
                startTime: event.allDay ? null : moment(event.start).format('HH:mm:ss'),
                endTime: event.end ? moment(event.end).format('HH:mm:ss') : null,
                description: event.extendedProps.description,
                category: event.extendedProps.category,
                reminders: event.extendedProps.reminders,
                recurrence_id: event.extendedProps.recurrence_id,
            };

            try {
                await window.eventService.updateEvent(updatedEvent);
                showToast('Evento atualizado com sucesso!');
            } catch (error) {
                showToast('Erro ao atualizar evento.', 'error');
                console.error('Error updating event:', error);
                info.revert();
            }
        }
    });

    calendar.render();
}

async function initCalendar() {
    const calendarDiv = document.querySelector('#calendar');
    if (!calendarDiv) {
        return;
    }
    renderFullCalendar(calendarDiv, 'timeGridWeek');
    await displayUpcomingEvents();
}

async function initAllEventsView() {
    const container = document.getElementById('all-events-container');
    if (!container) return;

    // Hide old filters
    const filterRow = container.previousElementSibling;
    if (filterRow && filterRow.classList.contains('row')) {
        filterRow.style.display = 'none';
    }

    renderFullCalendar(container, 'dayGridMonth');

    // Keep ICS import functionality
    const importIcsInput = document.getElementById('import-ics-file');
    if (importIcsInput) {
        importIcsInput.addEventListener('change', handleIcsImport);
    }
}

async function showEventDetails(eventId) {
    if (!window.eventService || typeof window.eventService.getEventById !== 'function') {
        console.error('eventService is not available or getEventById is not a function.');
        return;
    }

    const event = await window.eventService.getEventById(eventId);

    if (!event) {
        console.error(`Event with ID ${eventId} not found.`);
        return;
    }

    $('#viewEventModalTitle').text(event.title || 'N/A');
    $('#viewEventModalDate').text(moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY') || 'N/A');
    
    let timeInfo = 'Dia todo';
    if (event.startTime) {
        timeInfo = `${event.startTime}`;
        if (event.endTime) timeInfo += ` - ${event.endTime}`;
    }
    $('#viewEventModalTime').text(timeInfo);

    $('#viewEventModalCategory').text(event.category || 'Geral');
    $('#viewEventModalDescription').text(event.description || 'N/A');

    if (event.reminders && event.reminders.length > 0) {
        $('#viewEventModalReminders').text(event.reminders.map(r => `${r} Minutos Antes`).join(', '));
    } else {
        $('#viewEventModalReminders').text('Nenhum lembrete configurado.');
    }

    $('#viewEventModal').modal('show');
}

async function displayUpcomingEvents() {
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) return;

    if (!window.eventService) {
        overviewContainer.innerHTML = '<h3>Resumo de Hoje</h3><p>Serviço de eventos não disponível.</p>';
        return;
    }

    const allEvents = await window.eventService.getEvents();
    const today = moment().startOf('day');
    const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

    const upcomingEvents = allEvents
        .filter(event => moment(event.date, 'YYYY-MM-DD').isBetween(today, sevenDaysFromNow, null, '[]'))
        .sort((a, b) => {
            const dateA = moment(a.date, 'YYYY-MM-DD');
            const dateB = moment(b.date, 'YYYY-MM-DD');
            if (dateA.isBefore(dateB)) return -1;
            if (dateA.isAfter(dateB)) return 1;
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            return a.startTime ? -1 : 1;
        });

    let contentHtml = '<h3>Próximos 7 Dias</h3>';
    if (upcomingEvents.length === 0) {
        contentHtml += '<p>Nenhum evento programado.</p>';
    } else {
        contentHtml += '<ul class="list-group">';
        upcomingEvents.forEach(event => {
            contentHtml += `
                <li class="list-group-item" data-event-id="${escapeHTML(String(event.id))}" style="cursor: pointer;">
                    <h5 class="list-group-item-heading">
                        <span class="badge pull-right">${moment(event.date, 'YYYY-MM-DD').format('DD/MM')}</span>
                        ${escapeHTML(event.title)}
                    </h5>
                    <p class="list-group-item-text mb-0">
                        ${event.startTime ? `Horário: ${escapeHTML(event.startTime)}` : 'Dia todo'}
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

function renderConfiguredReminders() {
    const configuredRemindersList = document.getElementById('configuredRemindersList');
    if (!configuredRemindersList) return;

    configuredRemindersList.innerHTML = '';
    currentModalReminders.forEach(reminder => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center p-2';
        listItem.innerHTML = `<span>${reminder} Minutos Antes</span><button type="button" class="btn btn-danger btn-xs remove-reminder" data-reminder-value="${reminder}">&times;</button>`;
        configuredRemindersList.appendChild(listItem);
    });
}

// Event listener setup
document.addEventListener('DOMContentLoaded', function() {
    const saveEventButton = document.getElementById('saveEventButton');
    if (saveEventButton) {
        saveEventButton.addEventListener('click', async function() {
            const eventObject = {
                id: document.getElementById('eventDateInput').dataset.eventId, // Store id for updates
                title: document.getElementById('eventTitleInput').value,
                date: document.getElementById('eventDateInput').value,
                startTime: document.getElementById('eventStartTimeInput').value || null,
                endTime: document.getElementById('eventEndTimeInput').value || null,
                description: document.getElementById('eventDescriptionInput').value,
                category: document.getElementById('eventCategoryInput').value,
                reminders: [...currentModalReminders],
                recurrenceFrequency: document.getElementById('eventRecurrenceFrequency').value,
                recurrenceEndDate: document.getElementById('eventRecurrenceEndDate').value
            };

            if (!eventObject.title || !eventObject.date) {
                alert('Por favor, insira um título e uma data.');
                return;
            }

            // Logic to decide between add and update can be added here if needed
            await window.eventService.addEvent(eventObject);
            
            $('#eventModal').modal('hide');

            // Refetch events for the current calendar view
            if (calendar) {
                calendar.refetchEvents();
            }
            await displayUpcomingEvents(); // Also refresh the upcoming list
        });
    }

    // Reminder logic remains the same
    const addReminderButton = document.getElementById('addReminderButton');
    if (addReminderButton) {
        addReminderButton.addEventListener('click', function() {
            const reminderValueInput = document.getElementById('reminderValueInput');
            const value = parseInt(reminderValueInput.value, 10);
            if (isNaN(value) || currentModalReminders.includes(value)) return;
            currentModalReminders.push(value);
            renderConfiguredReminders();
        });
    }

    const configuredRemindersList = document.getElementById('configuredRemindersList');
    if (configuredRemindersList) {
        configuredRemindersList.addEventListener('click', function(event) {
            const button = event.target.closest('.remove-reminder');
            if (button) {
                const reminderValueToRemove = Number(button.dataset.reminderValue);
                currentModalReminders = currentModalReminders.filter(r => r !== reminderValueToRemove);
                renderConfiguredReminders();
            }
        });
    }

    const recurrenceFrequencySelect = document.getElementById('eventRecurrenceFrequency');
    if (recurrenceFrequencySelect) {
        recurrenceFrequencySelect.addEventListener('change', function() {
            document.getElementById('recurrence-end-date-group').style.display = this.value === 'none' ? 'none' : 'block';
        });
    }
});

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[match]);
}
