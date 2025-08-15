(function(window) {
    'use strict';

    // Helper para chamadas de API, similar ao de educationService
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ocorreu um erro na solicitação de eventos à API.');
        }
        if (response.status === 204) { // No Content
            return;
        }
        return response.json();
    }

    // --- Funções do Serviço de Eventos ---

    async function getEvents() {
        return apiRequest('/api/events');
    }

    async function addEvent(eventObject) {
        if (!eventObject || !eventObject.title || !eventObject.date) {
            throw new Error('Event object must have at least a title and a date.');
        }

        // A lógica de recorrência permanece no frontend por enquanto,
        // mas agora dispara múltiplas chamadas de API.
        const { recurrenceFrequency, recurrenceEndDate, ...baseEvent } = eventObject;

        if (recurrenceFrequency && recurrenceFrequency !== 'none' && recurrenceEndDate) {
            const recurrenceId = 'rec-' + new Date().getTime();
            let currentDate = moment(baseEvent.date);
            const endDate = moment(recurrenceEndDate);
            const promises = [];

            while (currentDate.isSameOrBefore(endDate)) {
                const newEvent = {
                    ...baseEvent,
                    date: currentDate.format('YYYY-MM-DD'),
                    recurrenceId: recurrenceId,
                    reminders: baseEvent.reminders || []
                };
                // Não precisa de 'id' aqui, o backend vai gerar
                delete newEvent.id;

                promises.push(apiRequest('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEvent)
                }));

                switch (recurrenceFrequency) {
                    case 'daily': currentDate.add(1, 'days'); break;
                    case 'weekly': currentDate.add(1, 'weeks'); break;
                    case 'monthly': currentDate.add(1, 'months'); break;
                }
            }
            return Promise.all(promises);
        } else {
            delete baseEvent.id;
            return apiRequest('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(baseEvent)
            });
        }
    }

    async function getEventsForDate(dateString) {
        const allEvents = await getEvents();
        return allEvents.filter(event => event.date === dateString);
    }

    async function getEventById(eventId) {
        // Esta função pode ser otimizada se o backend fornecer um endpoint /api/events/<id>
        // Por enquanto, filtramos do resultado geral.
        const allEvents = await getEvents();
        return allEvents.find(e => String(e.id) === String(eventId));
    }

    async function updateEvent(updatedEventObject) {
        if (!updatedEventObject || typeof updatedEventObject.id === 'undefined') {
            throw new Error('Event object must have an id to be updated.');
        }
        return apiRequest(`/api/events/${updatedEventObject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEventObject)
        });
    }

    async function deleteEvent(eventId) {
        if (typeof eventId === 'undefined' || eventId === null) {
            throw new Error('Event ID must be provided for deletion.');
        }
        return apiRequest(`/api/events/${eventId}`, { method: 'DELETE' });
    }

    async function deleteRecurrentEvent(eventId, recurrenceId, deleteType) {
        const allEvents = await getEvents();
        const eventToDelete = allEvents.find(e => String(e.id) === String(eventId));
        if (!eventToDelete) {
            throw new Error("Evento a ser deletado não encontrado.");
        }

        let eventsToDeleteIds = [];
        if (deleteType === 'this') {
            eventsToDeleteIds.push(eventToDelete.id);
        } else {
            const allRecurrentEvents = allEvents.filter(e => e.recurrenceId === recurrenceId);
            if (deleteType === 'future') {
                eventsToDeleteIds = allRecurrentEvents
                    .filter(e => moment(e.date).isSameOrAfter(moment(eventToDelete.date)))
                    .map(e => e.id);
            } else if (deleteType === 'all') {
                eventsToDeleteIds = allRecurrentEvents.map(e => e.id);
            }
        }

        const deletePromises = eventsToDeleteIds.map(id => deleteEvent(id));
        return Promise.all(deletePromises);
    }

    // NOTA: deleteAllEvents não é mais uma boa prática com um backend.
    // Isso seria uma operação perigosa. A função será removida.
    // Se for necessária, deve ser uma função de admin protegida.

    window.eventService = {
        addEvent,
        getEvents,
        getEventsForDate,
        getEventById,
        updateEvent,
        deleteEvent,
        deleteRecurrentEvent
    };

})(window);
