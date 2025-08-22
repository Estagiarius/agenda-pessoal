(function(window) {
    'use strict';

    // All event data is now managed by the backend API.
    // Functions are async and use fetch.

    async function addEvent(eventObject) {
        const response = await fetch('/api/eventos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventObject)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar evento.');
        }
        return response.json();
    }

    async function getEvents(start, end) {
        // The API is optimized to fetch events in a date range.
        const url = new URL('/api/eventos', window.location.origin);
        if (start && end) {
            url.searchParams.append('start', start);
            url.searchParams.append('end', end);
        }
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Erro ao buscar eventos.');
            return [];
        }
        return response.json();
    }

    async function getEventsForDate(dateString) {
        // This is a specific case of getEvents
        return getEvents(dateString, dateString);
    }

    async function getEventById(eventId) {
        const response = await fetch(`/api/eventos/${eventId}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar evento.');
        }
        return response.json();
    }

    async function updateEvent(updatedEventObject) {
        if (!updatedEventObject || typeof updatedEventObject.id === 'undefined') {
            throw new Error('Event object must have an id to be updated.');
        }
        const response = await fetch(`/api/eventos/${updatedEventObject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEventObject)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar evento.');
        }
        return response.json();
    }
    
    async function deleteEvent(eventId, scope = 'this') {
        if (typeof eventId === 'undefined' || eventId === null) {
            throw new Error('Event ID must be provided for deletion.');
        }
        // The complex recurrence deletion logic is now handled by the server via the 'scope' param.
        const url = new URL(`/api/eventos/${eventId}`, window.location.origin);
        url.searchParams.append('scope', scope);

        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir evento.');
        }
    }

    // The old deleteRecurrentEvent is now simplified into the 'scope' parameter of deleteEvent.
    // This function is kept for compatibility if UI calls it directly, but it just delegates.
    async function deleteRecurrentEvent(eventId, recurrenceId, deleteType) {
        // recurrenceId is no longer needed as the server can find it from the eventId.
        return deleteEvent(eventId, deleteType);
    }

    // This function is dangerous, so it should probably be removed or have a confirmation.
    // For now, I will not implement a backend endpoint for it.
    async function deleteAllEvents() {
        console.warn('deleteAllEvents is not implemented against the server API.');
        // To implement, one would need a `DELETE /api/eventos` endpoint, which is risky.
        return Promise.resolve();
    }

    async function importEvents(eventsData) {
        const response = await fetch('/api/eventos/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventsData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao importar eventos.');
        }
        return response.json();
    }

    // Expose the public API
    window.eventService = {
        addEvent,
        importEvents,
        getEvents,
        getEventsForDate,
        getEventById,
        updateEvent,
        deleteEvent,
        deleteRecurrentEvent,
        deleteAllEvents
    };

})(window);
