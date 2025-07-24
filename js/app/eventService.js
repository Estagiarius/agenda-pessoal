(function(window) {
    'use strict';

    // Function to add a new event
    // eventObject is expected to have: title, date, startTime, endTime, description

    const EVENTS_STORAGE_KEY = 'teacherAgendaEvents';
    let events = []; // Single declaration of events
    let nextEventId = 1; // Single declaration of nextEventId

    function loadEvents() {
        const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (storedEvents) {
            try {
                const parsedEvents = JSON.parse(storedEvents);
                if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
                    events = parsedEvents;
                    let maxId = 0;
                    events.forEach(event => {
                        if (event.id && typeof event.id === 'number') {
                            if (event.id > maxId) {
                                maxId = event.id;
                            }
                        } else {
                            // If an event from storage is missing an ID or has an invalid one,
                            // assign it a new ID. This also handles the initial nextEventId value.
                            event.id = nextEventId++;
                        }
                    });
                    // Ensure nextEventId is greater than any ID found, or 1 if list was empty or no valid IDs.
                    nextEventId = Math.max(1, maxId + 1);
                } else {
                     // Stored data was empty array or not an array
                     events = [];
                     nextEventId = 1;
                }
            } catch (e) {
                console.error('Error parsing stored events:', e);
                events = [];
                nextEventId = 1;
            }
        } else {
            // No data in local storage
            events = [];
            nextEventId = 1;
        }
    }
    loadEvents(); // Load events when the service initializes

    function saveEvents() {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    }


    function addEvent(eventObject) {
        if (!eventObject || !eventObject.title || !eventObject.date) {
            console.error('Event object must have at least a title and a date.');
            return null;
        }

        const { recurrenceFrequency, recurrenceEndDate, ...baseEvent } = eventObject;

        if (recurrenceFrequency && recurrenceFrequency !== 'none' && recurrenceEndDate) {
            const recurrenceId = 'rec-' + new Date().getTime();
            let currentDate = moment(baseEvent.date);
            const endDate = moment(recurrenceEndDate);

            while (currentDate.isSameOrBefore(endDate)) {
                const newEvent = {
                    ...baseEvent,
                    id: nextEventId++,
                    date: currentDate.format('YYYY-MM-DD'),
                    recurrenceId: recurrenceId,
                    reminders: baseEvent.reminders || []
                };
                events.push(newEvent);

                switch (recurrenceFrequency) {
                    case 'daily':
                        currentDate.add(1, 'days');
                        break;
                    case 'weekly':
                        currentDate.add(1, 'weeks');
                        break;
                    case 'monthly':
                        currentDate.add(1, 'months');
                        break;
                }
            }
        } else {
            const newEvent = {
                id: nextEventId++,
                ...baseEvent,
                reminders: baseEvent.reminders || []
            };
            events.push(newEvent);
        }

        console.log('eventService: Evento adicionado/atualizado:', JSON.stringify(eventObject));
        saveEvents();
        return eventObject;
    }

    function getEvents() {
        return [...events]; // Return a copy
    }

    function getEventsForDate(dateString) {
        return events.filter(event => event.date === dateString);
    }

    function getEventById(eventId) {
        console.log(`eventService: Attempting to find event with ID: ${eventId}`);
        if (typeof eventId === 'undefined' || eventId === null) {
            console.warn('eventService: getEventById called with undefined or null eventId.');
            return undefined;
        }
        const event = events.find(e => String(e.id) === String(eventId));
        if (event) {
            console.log('eventService: Event found:', event);
            return event; // Return a copy to prevent direct modification of the stored event
        } else {
            console.log(`eventService: Event not found with ID: ${eventId}`);
            return undefined;
        }
    }

    // Function to update an existing event
    function updateEvent(updatedEventObject) {
        if (!updatedEventObject || typeof updatedEventObject.id === 'undefined') {
            console.error('Event object must have an id to be updated.');
            return false;
        }
        const eventIndex = events.findIndex(event => event.id === updatedEventObject.id);

        if (eventIndex === -1) {
            console.error('Event with id ' + updatedEventObject.id + ' not found for update.');
            return false;
        }

        events[eventIndex] = updatedEventObject;
        console.log('eventService: Evento atualizado (para lembrete mostrado):', JSON.stringify(updatedEventObject));
        saveEvents(); // Use saveEvents here
        return true;
    }
    

    function deleteEvent(eventId) {
        if (typeof eventId === 'undefined' || eventId === null) {
            console.error('Event ID must be provided for deletion.');
            return false;
        }
        const eventIndex = events.findIndex(event => String(event.id) === String(eventId));

        if (eventIndex === -1) {
            console.error('Event with id ' + eventId + ' not found for deletion.');
            return false;
        }

        const deletedEvent = events.splice(eventIndex, 1);
        console.log('eventService: Event deleted:', JSON.stringify(deletedEvent[0]));
        saveEvents();
        return true;
    }

    function deleteRecurrentEvent(eventId, recurrenceId, deleteType) {
        const eventToDelete = getEventById(eventId);
        if (!eventToDelete) {
            return false;
        }

        let eventsToDelete = [];
        if (deleteType === 'this') {
            eventsToDelete.push(eventToDelete);
        } else {
            const allRecurrentEvents = events.filter(e => e.recurrenceId === recurrenceId);
            if (deleteType === 'future') {
                eventsToDelete = allRecurrentEvents.filter(e => moment(e.date).isSameOrAfter(moment(eventToDelete.date)));
            } else if (deleteType === 'all') {
                eventsToDelete = allRecurrentEvents;
            }
        }

        eventsToDelete.forEach(e => deleteEvent(e.id));
        return true;
    }

    // Expose 
    window.eventService = {
        addEvent: addEvent,
        getEvents: getEvents,
        getEventsForDate: getEventsForDate,
        getEventById: getEventById,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent, // Expose deleteEvent
        deleteRecurrentEvent: deleteRecurrentEvent
    };

})(window);
