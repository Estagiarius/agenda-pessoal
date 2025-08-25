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

async function displayUpcomingEventsAndTasks() { // ASYNC
    await displayUpcomingEvents();
    await displayUpcomingTasks();
}

async function displayUpcomingEvents() { // ASYNC
    const overviewContainer = document.getElementById('todays-overview');
    if (!overviewContainer) return;

    if (!window.eventService) {
        overviewContainer.innerHTML = '<h3>Resumo de Hoje</h3><p>Serviço de eventos não disponível.</p>';
        return;
    }

    const allEvents = await window.eventService.getEvents(); // AWAIT
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

    let contentHtml = '<h3>Resumo de Hoje</h3>';
    if (upcomingEvents.length === 0) {
        contentHtml += '<p>Nenhum evento programado para os próximos 7 dias.</p>';
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

    if (saveEventButton) {
        saveEventButton.addEventListener('click', async function() { // ASYNC
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
                alert('Por favor, insira um título e uma data.');
                return;
            }

            await window.eventService.addEvent(eventObject); // AWAIT
            
            document.getElementById('eventForm').reset();
            currentModalReminders = [];
            renderConfiguredReminders();
            $('#eventModal').modal('hide');

            await initCalendar(); // AWAIT
        });
    }

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

    const recurrenceFrequencySelect = document.getElementById('eventRecurrenceFrequency');
    if (recurrenceFrequencySelect) {
        recurrenceFrequencySelect.addEventListener('change', function() {
            document.getElementById('recurrence-end-date-group').style.display = this.value === 'none' ? 'none' : 'block';
        });
    }

    // Initial load is now handled by the router's callback
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

    eventsToRender.sort((a, b) => moment(a.date).diff(moment(b.date)) || (a.startTime || '').localeCompare(b.startTime || ''));

    let contentHtml = '';
    if (!eventsToRender || eventsToRender.length === 0) {
        contentHtml = '<p>Nenhum evento cadastrado no sistema.</p>';
    } else {
        eventsToRender.forEach(event => {
            const checkboxHtml = selectionMode ? `<input type="checkbox" class="event-checkbox" data-event-id="${event.id}" style="margin-right: 10px;">` : '';
            contentHtml += `
                <div class="panel panel-default event-item">
                    <div class="panel-heading"><h3 class="panel-title">${checkboxHtml}${escapeHTML(event.title)} - ${moment(event.date).format('DD/MM/YYYY')}</h3></div>
                    <div class="panel-body">
                        <p><strong>Horário:</strong> ${event.startTime ? `${escapeHTML(event.startTime)} - ${escapeHTML(event.endTime || '')}` : 'Dia todo'}</p>
                        <p><strong>Descrição:</strong> ${escapeHTML(event.description || 'Nenhuma descrição.')}</p>
                    </div>
                    <div class="panel-footer">
                        <button class="btn btn-info btn-sm view-event-details-btn" data-event-id="${event.id}">Ver Detalhes</button>
                        <button class="btn btn-danger btn-sm delete-event-btn" data-event-id="${event.id}" data-recurrence-id="${event.recurrence_id || ''}">Excluir</button>
                    </div>
                </div>`;
        });
    }
    container.innerHTML = contentHtml;

    container.addEventListener('click', function(e) {
        const target = e.target;
        if (target.classList.contains('view-event-details-btn')) {
            showEventDetails(target.dataset.eventId);
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
}

function showRecurrentEventDeletionModal(eventId) {
    $('#recurrentEventDeletionModal').modal('show');
    document.getElementById('delete-this-event-btn').onclick = () => { deleteEvent(eventId, 'this'); $('#recurrentEventDeletionModal').modal('hide'); };
    document.getElementById('delete-future-events-btn').onclick = () => { deleteEvent(eventId, 'future'); $('#recurrentEventDeletionModal').modal('hide'); };
    document.getElementById('delete-all-events-btn').onclick = () => { deleteEvent(eventId, 'all'); $('#recurrentEventDeletionModal').modal('hide'); };
}

async function deleteEvent(eventId, scope){ // Combined function
    await window.eventService.deleteEvent(eventId, scope);
    await filterAndRenderAllEvents();
    showToast('Evento(s) excluído(s) com sucesso!');
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

    await filterAndRenderAllEvents();

    const importIcsInput = document.getElementById('import-ics-file');
    importIcsInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;

            try {
                const jcalData = ICAL.parse(content);
                const eventsToImport = [];

                // Acessa a lista de subcomponentes diretamente do jCal
                const subcomponents = jcalData[2];
                const veventArrays = subcomponents.filter(sub => sub[0] === 'vevent');

                veventArrays.forEach(veventData => {
                    const properties = veventData[1];
                    let summary = '', description = '', dtstart, dtend, rrule;

                    // Itera manualmente sobre as propriedades
                    properties.forEach(prop => {
                        const propName = prop[0];
                        const propValue = prop[3];
                        switch (propName) {
                            case 'summary':
                                summary = propValue;
                                break;
                            case 'description':
                                description = propValue;
                                break;
                            case 'dtstart':
                                // Reusa o ICAL.Time para conversão de data/hora, que é confiável
                                dtstart = new ICAL.Time(prop);
                                break;
                            case 'dtend':
                                dtend = new ICAL.Time(prop);
                                break;
                            case 'rrule':
                                // Captura a regra de recorrência para importação futura, se necessário
                                rrule = propValue;
                                break;
                        }
                    });

                    if (dtstart) {
                         // Trata eventos recorrentes como um único evento por enquanto
                        eventsToImport.push({
                            title: summary,
                            date: dtstart.toJSDate().toISOString().split('T')[0],
                            startTime: !dtstart.isDate ? dtstart.toJSDate().toTimeString().substring(0, 5) : '',
                            endTime: dtend && !dtend.isDate ? dtend.toJSDate().toTimeString().substring(0, 5) : '',
                            description: description
                        });
                    }
                });

                if (eventsToImport.length === 0) {
                    showToast('Nenhum evento válido encontrado no arquivo .ics.', 'error');
                    return;
                }

                await window.eventService.importEvents(eventsToImport);
                showToast(`${eventsToImport.length} evento(s) importado(s) com sucesso (recorrentes como evento único).`);
                await filterAndRenderAllEvents();

            } catch (err) {
                console.error('Erro ao processar arquivo .ics:', err);
                showToast('Erro ao processar o arquivo .ics. Verifique o formato do arquivo.', 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    });
}
