(function(window) {
    'use strict';

    const EVENTS_STORAGE_KEY = 'teacherAgendaEvents';
    let events = [];
    let nextEventId = 1;

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
        const newEvent = {
            id: nextEventId++, // Assign new ID and then increment nextEventId
            title: eventObject.title,
            date: eventObject.date,
            startTime: eventObject.startTime || '',
            endTime: eventObject.endTime || '',
            description: eventObject.description || ''
        };
        events.push(newEvent);
        saveEvents();
        // console.log('Event added:', newEvent); // You can uncomment these for debugging
        // console.log('All events:', events);
        return newEvent;
    }

    function getEvents() {
        return [...events]; // Return a copy
    }

    function getEventsForDate(dateString) {
        return events.filter(event => event.date === dateString);
    }

    window.eventService = {
        addEvent: addEvent,
        getEvents: getEvents,
        getEventsForDate: getEventsForDate
    };

})(window);
