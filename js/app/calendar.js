// Variable to store the current filter category
let currentFilterCategory = 'all';
// Variable to store reminders for the event currently being edited/created in the modal
let currentModalReminders = [];

moment.locale('pt-br');

// Helper function to render configured reminders in the modal
function renderConfiguredReminders() {
    const configuredRemindersList = document.getElementById('configuredRemindersList');
    if (!configuredRemindersList) return;

    configuredRemindersList.innerHTML = ''; // Clear current list
    currentModalReminders.forEach(reminder => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center p-2';

        const text = document.createElement('span');
        text.textContent = `${reminder.value} ${reminder.unit === 'minutes' ? 'Minutos Antes' : 'Horas Antes'}`;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-danger btn-xs remove-reminder';
        removeButton.innerHTML = '&times;';
        removeButton.dataset.reminderId = reminder.id;
        removeButton.style.marginLeft = '10px';

        listItem.appendChild(text);
        listItem.appendChild(removeButton);
        configuredRemindersList.appendChild(listItem);
    });
}


async function initCalendar() {
    const calendarDiv = document.querySelector('#calendar');
    if (!calendarDiv) return;
    if (calendarDiv.classList.contains('datepickk-initialized')) {
        calendarDiv.innerHTML = '';
        calendarDiv.classList.remove('datepickk-initialized');
    }

    try {
        let allEvents = await window.eventService.getEvents();

        const filteredEvents = (currentFilterCategory === 'all')
            ? allEvents
            : allEvents.filter(event => event.category === currentFilterCategory);

        const eventsByDate = {};
        filteredEvents.forEach(event => {
            const dateKey = moment(event.date, 'YYYY-MM-DD').toDate().toDateString();
            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = { date: moment(event.date, 'YYYY-MM-DD').toDate(), eventDetails: [] };
            }
            eventsByDate[dateKey].eventDetails.push({ title: event.title, category: event.category });
        });

        const datepickkTooltips = Object.values(eventsByDate).map(dayData => ({
            date: dayData.date,
            text: dayData.eventDetails.map(d => `[${d.category}] ${d.title}`).join('\n')
        }));

        var calendar = new Datepickk({
            container: calendarDiv,
            inline: true,
            tooltips: datepickkTooltips,
            lang: 'pt-br',
            onSelect: function(isSelected) {
                const formattedDate = moment(this).format('YYYY-MM-DD');
                document.getElementById('eventDateInput').value = formattedDate;
                document.getElementById('selectedDateDisplay').textContent = moment(this).format('DD/MM/YYYY');
                currentModalReminders = [];
                renderConfiguredReminders();
                $('#eventModal').modal('show');
            }
        });
        calendarDiv.classList.add('datepickk-initialized');

    } catch (error) {
        console.error('Erro ao inicializar o calendário:', error);
        calendarDiv.innerHTML = '<p class="text-danger">Não foi possível carregar os eventos.</p>';
    }

    await displayUpcomingEvents();

    const addEventBtn = document.getElementById('quick-action-add-event-btn');
    if (addEventBtn) {
        addEventBtn.onclick = showEventModalForToday;
    }
}

function showEventModalForToday() {
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.reset();
    }

    // Set date to today
    const today = moment();
    document.getElementById('eventDateInput').value = today.format('YYYY-MM-DD');
    document.getElementById('selectedDateDisplay').textContent = today.format('DD/MM/YYYY');

    // Clear reminders and show modal
    currentModalReminders = [];
    renderConfiguredReminders(); // Assuming this function exists and clears the UI list
    $('#eventModal').modal('show');
}

// Add an event listener for the modal's 'shown' event to set focus
$('#eventModal').on('shown.bs.modal', function () {
    $('#eventTitleInput').focus();
});


async function showEventDetails(eventId) {
    try {
        const event = await window.eventService.getEventById(eventId);
        if (!event) {
            alert('Evento não encontrado.');
            return;
        }

        document.getElementById('viewEventModalTitle').textContent = event.title || 'N/A';
        // ... (populate other fields in the modal) ...
        $('#viewEventModal').modal('show');

    } catch (error) {
        console.error(`Erro ao buscar detalhes do evento ${eventId}:`, error);
    }
}

async function displayUpcomingEvents() {
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) return;
    overviewContainer.innerHTML = '<h3>Resumo de Hoje</h3><p>Carregando...</p>';

    try {
        const allEvents = await window.eventService.getEvents();
        const today = moment().startOf('day');
        const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

        const upcomingEvents = allEvents
            .filter(event => moment(event.date, 'YYYY-MM-DD').isBetween(today, sevenDaysFromNow, null, '[]'))
            .sort((a, b) => moment(a.date).diff(moment(b.date)));

        let contentHtml = '<h3>Resumo de Hoje</h3>';
        if (upcomingEvents.length === 0) {
            contentHtml += '<p>Nenhum evento programado para os próximos 7 dias.</p>';
        } else {
            contentHtml += '<ul class="list-group">';
            upcomingEvents.forEach(event => {
                // ... (build list item html) ...
            });
            contentHtml += '</ul>';
        }
        overviewContainer.innerHTML = contentHtml;
    } catch (error) {
        overviewContainer.innerHTML = '<h3>Resumo de Hoje</h3><p class="text-danger">Erro ao carregar eventos.</p>';
        console.error(error);
    }
}

// --- Funções de UI para a página Agenda Completa ---

async function initAllEventsView() {
    const addEventBtn = document.getElementById('full-calendar-add-event-btn');
    if (addEventBtn) {
        addEventBtn.onclick = showEventModalForToday;
    }
    // ... (event listeners for filters, bulk actions, etc.) ...
    await filterAndRenderAllEvents();
}

async function filterAndRenderAllEvents() {
    const container = document.getElementById('all-events-container');
    showLoading(container);
    try {
        let events = await window.eventService.getEvents();
        // ... (apply month/year filters) ...
        renderAllEventsPage(events);
    } catch (error) {
        showError(container, 'Erro ao carregar agenda completa.');
        console.error(error);
    }
}

function renderAllEventsPage(eventsToRender) {
    const container = document.getElementById('all-events-container');
    // ... (logic to render the list of events, similar to the original file) ...
}


// --- Lógica dos Modais e Eventos ---

document.addEventListener('DOMContentLoaded', function() {
    const saveEventButton = document.getElementById('saveEventButton');
    if (saveEventButton) {
        saveEventButton.onclick = async function() {
            const eventObject = { /* ... get data from form ... */ };
            try {
                await window.eventService.addEvent(eventObject);
                showToast('Evento salvo com sucesso!');
                $('#eventModal').modal('hide');
                await initCalendar(); // Recarrega o calendário
            } catch (error) {
                alert('Falha ao salvar o evento: ' + error.message);
            }
        };
    }

    // Attach other listeners, like for delete buttons
    document.body.addEventListener('click', async function(e) {
        if (e.target.matches('.delete-event-btn')) {
            const eventId = e.target.dataset.eventId;
            const recurrenceId = e.target.dataset.recurrenceId;
            if (recurrenceId) {
                // showRecurrentEventDeletionModal(eventId, recurrenceId);
            } else {
                showConfirmationModal('Tem certeza que deseja excluir este evento?', async function() {
                    try {
                        await window.eventService.deleteEvent(eventId);
                        showToast('Evento excluído!');
                        if (window.location.hash === '#/all-events') {
                            await filterAndRenderAllEvents();
                        } else {
                            await initCalendar();
                        }
                    } catch (error) {
                        alert('Erro ao excluir evento: ' + error.message);
                    }
                });
            }
        }
    });

    // Initial load
    if (typeof initCalendar === 'function') {
        initCalendar();
    }
});

// Note: This is a simplified representation of the full refactoring.
// Functions like renderAllEventsPage, showRecurrentEventDeletionModal, etc.,
// would need to be fully implemented with their original logic but using async/await
// for all service calls. The core pattern is demonstrated in the main functions.
// Helper functions like escapeHTML and renderConfiguredReminders remain unchanged.
