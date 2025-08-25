// A função parseICS personalizada foi removida. A biblioteca ICAL.js será usada em seu lugar.
// Variable to store the current filter category
let currentFilterCategory = 'all';
// Variable to store reminders for the event currently being edited/created in the modal
let currentModalReminders = [];

moment.locale('pt-br');


async function initCalendar() {
    const calendarDiv = document.querySelector('#calendar');
    if (!calendarDiv) {
        return;
    }
    if (calendarDiv.classList.contains('datepickk-initialized')) {
        return;
    }

    // Retrieve events before initializing Datepickk
    let allEvents = [];
    if (window.eventService && typeof window.eventService.getEvents === 'function') {
        allEvents = await window.eventService.getEvents(); // AWAIT
    } else {
        console.error('eventService não disponível ou getEvents não é uma função.');
    }

    // Filter events based on currentFilterCategory
    const filteredEvents = (currentFilterCategory === 'all')
        ? allEvents
        : allEvents.filter(event => event.category === currentFilterCategory);
    
    const datepickkTooltips = [];
    const eventsByDate = {}; // Helper to group events

    filteredEvents.forEach(event => {
        const parts = event.date.split('-');
        if (parts.length === 3) {
            const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const dateKey = eventDate.toDateString();

            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = {
                    date: eventDate,
                    eventDetails: []
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

    var now = new Date();

    var calendar = new Datepickk({
        container: calendarDiv,
        inline: true,
        range: true, 
        tooltips: datepickkTooltips, 
        lang: 'pt-br',
        highlight: {
            start: new Date(now.getFullYear(), now.getMonth(), 4),
            end: new Date(now.getFullYear(), now.getMonth(), 6),
            backgroundColor: '#05676E',
            color: '#fff',
            legend: 'Destaque'
        },
        onSelect: function(isSelected) {
            const selectedDate = this; 
            
            let formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            let displayDate = moment(selectedDate).format('DD/MM/YYYY');

            const selectedDateDisplay = document.getElementById('selectedDateDisplay');
            const eventDateInput = document.getElementById('eventDateInput');

            if (selectedDateDisplay) selectedDateDisplay.textContent = displayDate;
            if (eventDateInput) eventDateInput.value = formattedDate;
            
            if (typeof $ === 'function' && $('#eventModal').modal) {
                currentModalReminders = [];
                renderConfiguredReminders(); 
                $('#eventModal').modal('show');
            } else {
                console.error('jQuery ou função modal do Bootstrap não disponível.');
            }
        }
    });
    calendar.lang = 'pt-br';
    calendarDiv.classList.add('datepickk-initialized');

    await displayUpcomingEvents();

    const categoryFilterDropdownMenu = document.getElementById('categoryFilterDropdownMenu');
    const selectedCategoryLabel = document.getElementById('selectedCategoryLabel');

    if (categoryFilterDropdownMenu && selectedCategoryLabel) {
        const initialCategoryLink = Array.from(categoryFilterDropdownMenu.querySelectorAll('a')).find(a => a.dataset.value === currentFilterCategory);
        if (initialCategoryLink) {
          selectedCategoryLabel.textContent = initialCategoryLink.textContent;
        }

        categoryFilterDropdownMenu.addEventListener('click', function(event) {
            if (event.target.tagName === 'A' && event.target.dataset.value) {
                event.preventDefault();
                const selectedValue = event.target.dataset.value;
                const selectedText = event.target.textContent;

                currentFilterCategory = selectedValue;
                selectedCategoryLabel.textContent = selectedText;

                const calendarDiv = document.querySelector('#calendar');
                calendarDiv.innerHTML = '';
                calendarDiv.classList.remove('datepickk-initialized');
                initCalendar();
            }
        });
    }
}

async function showEventDetails(eventId) { // ASYNC
    if (!window.eventService || typeof window.eventService.getEventById !== 'function') {
        console.error('eventService is not available or getEventById is not a function.');
        return;
    }

    const event = await window.eventService.getEventById(eventId); // AWAIT

    if (!event) {
        console.error(`Event with ID ${eventId} not found.`);
        return;
    }

    const modalTitle = document.getElementById('viewEventModalTitle');
    const modalDescription = document.getElementById('viewEventModalDescription');
    const modalDate = document.getElementById('viewEventModalDate');
    const modalTime = document.getElementById('viewEventModalTime');
    const modalCategory = document.getElementById('viewEventModalCategory');

    if (modalTitle) modalTitle.textContent = event.title || 'N/A';
    if (modalDescription) modalDescription.textContent = event.description || 'N/A';
    
    let formattedDate = event.date ? moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY') : 'N/A';
    if (modalDate) modalDate.textContent = `Date: ${formattedDate}`;

    let timeInfo = 'All day';
    if (event.startTime) {
        timeInfo = `Time: ${event.startTime}`;
        if (event.endTime) timeInfo += ` - ${event.endTime}`;
    }
    if (modalTime) modalTime.textContent = timeInfo;
    if (modalCategory) modalCategory.textContent = `Category: ${event.category || 'General'}`;

    const modalReminders = document.getElementById('viewEventModalReminders');
    if (modalReminders) {
        if (event.reminders && event.reminders.length > 0) {
            modalReminders.textContent = event.reminders.map(r => `${r} Minutos Antes`).join(', ');
        } else {
            modalReminders.textContent = 'Nenhum lembrete configurado.';
        }
    }

    if (typeof $ === 'function' && $('#viewEventModal').modal) {
        $('#viewEventModal').modal('show');
    }
}

async function showEditEventModal(eventId) {
    try {
        const event = await window.eventService.getEventById(eventId);
        if (!event) {
            showToast('Evento não encontrado.', 'error');
            return;
        }

        // Populate the modal fields
        document.getElementById('event-id-input').value = event.id;
        document.getElementById('eventTitleInput').value = event.title;
        document.getElementById('eventDateInput').value = event.date;
        document.getElementById('selectedDateDisplay').textContent = moment(event.date).format('DD/MM/YYYY');
        document.getElementById('eventStartTimeInput').value = event.startTime || '';
        document.getElementById('eventEndTimeInput').value = event.endTime || '';
        document.getElementById('eventDescriptionInput').value = event.description || '';
        document.getElementById('eventCategoryInput').value = event.category || 'General';

        document.getElementById('eventRecurrenceFrequency').value = event.recurrenceFrequency || 'none';
        document.getElementById('eventRecurrenceEndDate').value = event.recurrenceEndDate || '';
        document.getElementById('recurrence-end-date-group').style.display = (event.recurrenceFrequency && event.recurrenceFrequency !== 'none') ? 'block' : 'none';

        currentModalReminders = event.reminders ? [...event.reminders] : [];
        renderConfiguredReminders();

        document.getElementById('eventModalLabel').textContent = 'Editar Evento';

        $('#eventModal').modal('show');

    } catch (error) {
        console.error('Erro ao buscar evento para edição:', error);
        showToast('Não foi possível carregar os detalhes do evento.', 'error');
    }
}

async function displayUpcomingEventsAndTasks() { // ASYNC
    await displayUpcomingEvents();
    await displayUpcomingTasks();
}

async function displayUpcomingEvents() {
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) return;

    if (!window.eventService) {
        overviewContainer.innerHTML = '<h3>Eventos de Hoje</h3><p>Serviço de eventos não disponível.</p>';
        return;
    }

    const allEvents = await window.eventService.getEvents();
    const today = moment(); // Get current moment

    const todaysEvents = allEvents
        .filter(event => moment(event.date, 'YYYY-MM-DD').isSame(today, 'day'))
        .sort((a, b) => {
            // Sort by start time, treating 'all-day' events as earliest
            if (!a.startTime && b.startTime) return -1;
            if (a.startTime && !b.startTime) return 1;
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            return 0; // Keep original order if both are all-day
        });

    let contentHtml = '<h3>Eventos de Hoje</h3>';
    if (todaysEvents.length === 0) {
        contentHtml += '<p>Nenhum evento programado para hoje.</p>';
    } else {
        contentHtml += '<ul class="list-group">';
        todaysEvents.forEach(event => {
            contentHtml += `
                <li class="list-group-item" data-event-id="${escapeHTML(String(event.id))}" style="cursor: pointer;">
                    <h5 class="list-group-item-heading">
                        ${escapeHTML(event.title)}
                    </h5>
                    <p class="list-group-item-text mb-0">
                        <span class="glyphicon glyphicon-time"></span>
                        ${event.startTime ? ` ${escapeHTML(event.startTime)}` : ' Dia todo'}
                    </p>
                </li>`;
        });
        contentHtml += '</ul>';
    }
    overviewContainer.innerHTML = contentHtml;

    // Use a flag to prevent adding the listener multiple times
    if (!overviewContainer.dataset.listenerAttached) {
        overviewContainer.addEventListener('click', function(e) {
            const listItem = e.target.closest('li.list-group-item[data-event-id]');
            if (listItem) {
                showEventDetails(listItem.dataset.eventId);
            }
        });
        overviewContainer.dataset.listenerAttached = 'true';
    }
}

async function displayUpcomingTasks() { // ASYNC
    const tasksContainer = document.getElementById('upcoming-tasks-container');
    if (!tasksContainer) return;

    if (!window.todoService) {
        tasksContainer.innerHTML = '<h3>Tarefas Próximas</h3><p>Serviço de tarefas não disponível.</p>';
        return;
    }

    const allTasks = await window.todoService.getTasks(); // AWAIT
    const today = moment().startOf('day');

    const upcomingAndOverdueTasks = allTasks
        .filter(task => !task.completed && task.dueDate)
        .sort((a, b) => moment(a.dueDate, 'YYYY-MM-DD').diff(moment(b.dueDate, 'YYYY-MM-DD')));

    let contentHtml = '<h3>Tarefas Próximas</h3>';
    if (upcomingAndOverdueTasks.length === 0) {
        contentHtml += '<p>Nenhuma tarefa próxima ou vencida.</p>';
    } else {
        contentHtml += '<ul class="list-group">';
        upcomingAndOverdueTasks.slice(0, 5).forEach(task => { // Limit to 5
            const dueDate = moment(task.dueDate, 'YYYY-MM-DD');
            const isOverdue = dueDate.isBefore(today);
            contentHtml += `
                <li class="list-group-item task-item ${isOverdue ? 'task-overdue' : ''}">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="task-due-date ${isOverdue ? 'text-danger' : ''}">
                        Vence em: ${dueDate.format('DD/MM/YYYY')}
                    </span>
                </li>`;
        });
        contentHtml += '</ul>';
    }
    tasksContainer.innerHTML = contentHtml;
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

function updateReminderValueOptions() {
    // This function can be simplified or removed if reminders are just numbers
}

document.addEventListener('DOMContentLoaded', function() {
    const saveEventButton = document.getElementById('saveEventButton');
    const addReminderButton = document.getElementById('addReminderButton');
    const configuredRemindersList = document.getElementById('configuredRemindersList');
    const recurrenceFrequencySelect = document.getElementById('eventRecurrenceFrequency');
    const eventModal = $('#eventModal');

    // Combined Save/Update logic
    if (saveEventButton) {
        saveEventButton.addEventListener('click', async function() {
            const eventId = document.getElementById('event-id-input').value;
            const eventObject = {
                title: document.getElementById('eventTitleInput').value,
                date: document.getElementById('eventDateInput').value,
                startTime: document.getElementById('eventStartTimeInput').value,
                endTime: document.getElementById('eventEndTimeInput').value,
                description: document.getElementById('eventDescriptionInput').value,
                category: document.getElementById('eventCategoryInput').value,
                reminders: [...currentModalReminders],
                recurrenceFrequency: document.getElementById('eventRecurrenceFrequency').value,
                recurrenceEndDate: document.getElementById('eventRecurrenceEndDate').value
            };

            if (!eventObject.title || !eventObject.date) {
                showToast('Por favor, insira um título e uma data.', 'error');
                return;
            }

            try {
                if (eventId) {
                    eventObject.id = eventId;
                    await window.eventService.updateEvent(eventObject);
                    showToast('Evento atualizado com sucesso!', 'success');
                } else {
                    await window.eventService.addEvent(eventObject);
                    showToast('Evento adicionado com sucesso!', 'success');
                }

                eventModal.modal('hide'); // Let the 'hidden.bs.modal' event handle the reset

                // Refresh the calendar/view
                if (window.location.hash === '#/all-events') {
                    await filterAndRenderAllEvents();
                } else {
                    await initCalendar();
                }

            } catch (error) {
                console.error('Erro ao salvar evento:', error);
                showToast(error.message || 'Ocorreu um erro ao salvar o evento.', 'error');
            }
        });
    }

    // Modal reset logic
    if (eventModal.length) {
        eventModal.on('hidden.bs.modal', function () {
            document.getElementById('eventForm').reset();
            document.getElementById('event-id-input').value = '';
            document.getElementById('eventModalLabel').textContent = 'Adicionar Novo Evento';
            document.getElementById('recurrence-end-date-group').style.display = 'none';
            currentModalReminders = [];
            renderConfiguredReminders();
        });
    }

    // Other listeners from the original DOMContentLoaded
    if (addReminderButton) {
        addReminderButton.addEventListener('click', function() {
            const reminderValueInput = document.getElementById('reminderValueInput');
            const value = parseInt(reminderValueInput.value, 10);
            if (isNaN(value) || currentModalReminders.includes(value)) return;
            currentModalReminders.push(value);
            renderConfiguredReminders();
        });
    }

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

    if (recurrenceFrequencySelect) {
        recurrenceFrequencySelect.addEventListener('change', function() {
            document.getElementById('recurrence-end-date-group').style.display = this.value === 'none' ? 'none' : 'block';
        });
    }
});

function escapeHTML(str) {
    return str.toString().replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[match]);
}

async function filterAndRenderAllEvents() { // ASYNC
    let events = await window.eventService.getEvents(); // AWAIT
    const selectionMode = document.getElementById('bulk-actions').style.display === 'block';

    if (document.getElementById('filter-by-month-checkbox').checked) {
        const selectedMonth = parseInt(document.getElementById('month-filter').value, 10);
        events = events.filter(event => moment(event.date).month() === selectedMonth);
    }
    if (document.getElementById('filter-by-year-checkbox').checked) {
        const selectedYear = parseInt(document.getElementById('year-filter').value, 10);
        events = events.filter(event => moment(event.date).year() === selectedYear);
    }
    renderAllEventsPage(events, selectionMode);
}

function renderAllEventsPage(eventsToRender, selectionMode = false) {
    const container = document.getElementById('all-events-container');
    if (!container) return;

    // 1. Sort events
    eventsToRender.sort((a, b) => moment(a.date).diff(moment(b.date)) || (a.startTime || '').localeCompare(b.startTime || ''));

    // 2. Group sorted events by date
    const eventsByDate = eventsToRender.reduce((acc, event) => {
        const dateKey = moment(event.date).format('YYYY-MM-DD');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {});

    let contentHtml = '';
    const dates = Object.keys(eventsByDate);

    if (dates.length === 0) {
        contentHtml = '<p>Nenhum evento encontrado para o período selecionado.</p>';
    } else {
        // 3. Render grouped events
        dates.forEach(dateKey => {
            const eventsOnDay = eventsByDate[dateKey];
            const formattedDate = moment(dateKey).locale('pt-br').format('dddd, D [de] MMMM [de] YYYY');

            contentHtml += `<h2 class="date-header">${formattedDate}</h2>`; // Date header

            eventsOnDay.forEach(event => {
                const checkboxHtml = selectionMode ? `<input type="checkbox" class="event-checkbox" data-event-id="${event.id}" style="margin-right: 10px;">` : '';
                contentHtml += `
                    <div class="panel panel-default event-item">
                        <div class="panel-heading"><h3 class="panel-title">${checkboxHtml}${escapeHTML(event.title)}</h3></div>
                        <div class="panel-body">
                            <p><strong>Horário:</strong> ${event.startTime ? `${escapeHTML(event.startTime)}${event.endTime ? ` - ${escapeHTML(event.endTime)}` : ''}` : 'Dia todo'}</p>
                            <p><strong>Descrição:</strong> ${escapeHTML(event.description || 'Nenhuma descrição.')}</p>
                            <p><strong>Categoria:</strong> ${escapeHTML(event.category || 'Geral')}</p>
                        </div>
                        <div class="panel-footer">
                            <button class="btn btn-info btn-sm view-event-details-btn" data-event-id="${event.id}">Ver Detalhes</button>
                            <button class="btn btn-primary btn-sm edit-event-btn" data-event-id="${event.id}">Editar</button>
                            <button class="btn btn-danger btn-sm delete-event-btn" data-event-id="${event.id}" data-recurrence-id="${event.recurrence_id || ''}">Excluir</button>
                        </div>
                    </div>`;
            });
        });
    }

    container.innerHTML = contentHtml;
}

function showRecurrentEventDeletionModal(eventId) {
    $('#recurrentEventDeletionModal').modal('show');
    document.getElementById('delete-this-event-btn').onclick = () => { deleteEvent(eventId, 'this'); $('#recurrentEventDeletionModal').modal('hide'); };
    document.getElementById('delete-future-events-btn').onclick = () => { deleteEvent(eventId, 'future'); $('#recurrentEventDeletionModal').modal('hide'); };
    document.getElementById('delete-all-events-btn').onclick = () => { deleteEvent(eventId, 'all'); $('#recurrentEventDeletionModal').modal('hide'); };
}

async function deleteEvent(eventId, scope) {
    try {
        await window.eventService.deleteEvent(eventId, scope);
        await filterAndRenderAllEvents();
        showToast('Evento(s) excluído(s) com sucesso!', 'success');
    } catch (error) {
        console.error('Falha ao excluir evento:', error);
        showToast(error.message || 'Ocorreu um erro ao excluir o evento.', 'error');
    }
}

function deleteEventFromAllEventsView(eventId) {
    showConfirmationModal('Tem certeza que deseja excluir este evento?', () => deleteEvent(eventId, 'this'));
}

async function initAllEventsView() {
    const events = await window.eventService.getEvents();
    const yearFilter = document.getElementById('year-filter');
    const years = [...new Set(events.map(event => moment(event.date).year()))];
    yearFilter.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    ['filter-by-month-checkbox', 'month-filter', 'filter-by-year-checkbox', 'year-filter'].forEach(id => {
        document.getElementById(id).addEventListener('change', filterAndRenderAllEvents);
    });

    // Attach a single event listener to the container for handling clicks on dynamic content
    const container = document.getElementById('all-events-container');
    if (container && !container.dataset.listenerAttached) {
        container.addEventListener('click', function(e) {
            const target = e.target;
            if (target.classList.contains('view-event-details-btn')) {
                showEventDetails(target.dataset.eventId);
            } else if (target.classList.contains('edit-event-btn')) {
                showEditEventModal(target.dataset.eventId);
            } else if (target.classList.contains('delete-event-btn')) {
                const eventId = target.dataset.eventId;
                const recurrenceId = target.dataset.recurrenceId;
                if (recurrenceId) {
                    showRecurrentEventDeletionModal(eventId);
                } else {
                    deleteEventFromAllEventsView(eventId);
                }
            }
        });
        container.dataset.listenerAttached = 'true';
    }

    await filterAndRenderAllEvents();

    const importIcsInput = document.getElementById('import-ics-file');

    // Helper function to format time from a Date object
    function formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Helper function to create a consistent event object from ICAL data
    function createEventObjectFromIcal(summary, startDate, endDate, description, isAllDay) {
        const jsStartDate = startDate.toJSDate();
        const jsEndDate = endDate ? endDate.toJSDate() : null;

        return {
            title: summary,
            date: jsStartDate.toISOString().split('T')[0],
            startTime: !isAllDay ? formatTime(jsStartDate) : '',
            endTime: endDate && !isAllDay ? formatTime(jsEndDate) : '',
            description: description || ''
        };
    }

    importIcsInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (readerEvent) => {
            const content = readerEvent.target.result;
            try {
                let jcalData;
                try {
                    jcalData = ICAL.parse(content);
                } catch (e) {
                    throw new Error('Erro Diagnóstico [Passo 1]: O conteúdo do arquivo não é um formato iCalendar válido.');
                }

                const vcalendar = new ICAL.Component(jcalData);
                const vevents = vcalendar.getAllSubcomponents('vevent');
                const eventsToImport = [];
                const oneYearFromNow = moment().add(1, 'year');

                vevents.forEach(vevent => {
                    try {
                        const event = new ICAL.Event(vevent);
                        const dtstartProp = event.getProperties('dtstart')[0];

                        // Basic validation
                        if (!dtstartProp) {
                            console.warn('Skipping event with no DTSTART property:', event.summary);
                            return;
                        }

                        const isAllDay = dtstartProp.getParameter('value') === 'date';

                        // Simplified diagnostic logic:
                        // Ignore recurrence and date filters for now.
                        // Just try to parse every vevent as a single item.
                        eventsToImport.push(createEventObjectFromIcal(
                            event.summary,
                            event.startDate,
                            event.endDate,
                            event.description,
                            isAllDay
                        ));
                    } catch (e) {
                        console.error(`Falha ao processar um vevent individualmente. Pulando.`, e);
                    }
                });

                if (eventsToImport.length === 0) {
                    showToast('Nenhum evento válido encontrado no arquivo .ics (ou todos os eventos são muito antigos/futuros).', 'error');
                    return;
                }

                await window.eventService.importEvents(eventsToImport);
                showToast(`${eventsToImport.length} evento(s) importado(s) com sucesso.`, 'success');
                await filterAndRenderAllEvents();

            } catch (err) {
                console.error('Erro ao processar arquivo .ics:', err);
                // Exibe a mensagem de erro específica que foi lançada
                showToast(err.message || 'Ocorreu um erro desconhecido ao processar o arquivo.', 'error');
            } finally {
                e.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file);
    });

    // --- Bulk Action Event Listeners ---
    const selectMultipleBtn = document.getElementById('select-multiple-btn');
    const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const defaultActions = document.getElementById('default-actions');
    const bulkActions = document.getElementById('bulk-actions');

    if (selectMultipleBtn) {
        selectMultipleBtn.addEventListener('click', () => {
            defaultActions.style.display = 'none';
            bulkActions.style.display = 'block';
            filterAndRenderAllEvents(); // Re-render with checkboxes
        });
    }

    if (cancelSelectionBtn) {
        cancelSelectionBtn.addEventListener('click', () => {
            bulkActions.style.display = 'none';
            defaultActions.style.display = 'block';
            filterAndRenderAllEvents(); // Re-render without checkboxes
        });
    }

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            const selectedCheckboxes = document.querySelectorAll('.event-checkbox:checked');
            const eventIdsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.eventId);

            if (eventIdsToDelete.length === 0) {
                showToast('Nenhum evento selecionado.', 'error');
                return;
            }

            showConfirmationModal(`Tem certeza que deseja excluir os ${eventIdsToDelete.length} eventos selecionados?`, async () => {
                const deletePromises = eventIdsToDelete.map(id => window.eventService.deleteEvent(id, 'this'));
                const results = await Promise.allSettled(deletePromises);

                const successfulDeletes = results.filter(r => r.status === 'fulfilled').length;
                const failedDeletes = results.filter(r => r.status === 'rejected').length;

                let toastMessage = '';
                let toastType = 'success';

                if (successfulDeletes > 0) {
                    toastMessage = `${successfulDeletes} evento(s) excluído(s) com sucesso. `;
                }
                if (failedDeletes > 0) {
                    toastMessage += `Falha ao excluir ${failedDeletes} evento(s).`;
                    toastType = 'error';
                    console.error('Falhas na exclusão em massa:', results.filter(r => r.status === 'rejected'));
                }

                showToast(toastMessage, toastType);

                // Reset view
                bulkActions.style.display = 'none';
                defaultActions.style.display = 'block';
                filterAndRenderAllEvents();
            });
        });
    }

    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            showConfirmationModal(
                'Esta ação é irreversível. Para confirmar, digite "apagar tudo" na caixa abaixo.',
                async () => {
                    try {
                        await window.eventService.deleteAllEvents();
                        showToast('Todos os eventos foram excluídos com sucesso.', 'success');
                        await filterAndRenderAllEvents();
                    } catch (error) {
                        console.error('Erro ao excluir todos os eventos:', error);
                        showToast(error.message || 'Ocorreu um erro inesperado.', 'error');
                    }
                },
                {
                    requireInput: 'apagar tudo'
                }
            );
        });
    }
}
