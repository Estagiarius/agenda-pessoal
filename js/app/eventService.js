// Simple In-Memory Event Service
(function(window) {
    'use strict';

    // Load events and nextEventId from localStorage on initialization
    let events = [];
    let nextEventId = 1;

    try {
        const storedEvents = localStorage.getItem('calendarEvents');
        if (storedEvents) {
            events = JSON.parse(storedEvents);
            if (!Array.isArray(events)) { // Basic validation
                console.error('Invalid events data found in localStorage, defaulting to empty array.');
                events = [];
            } else {
                // Ensure all loaded events have a category and reminders array, default if missing
                events = events.map(event => ({
                    ...event,
                    category: event.category || 'General',
                    reminders: Array.isArray(event.reminders) ? event.reminders : []
                }));
            }
        }
    } catch (error) {
        console.error('Error parsing events from localStorage:', error);
        events = []; // Default to empty array on error
    }

    try {
        const storedNextEventId = localStorage.getItem('calendarNextEventId');
        if (storedNextEventId) {
            const parsedId = parseInt(storedNextEventId, 10);
            if (!isNaN(parsedId) && parsedId > 0) {
                nextEventId = parsedId;
            } else {
                console.error('Invalid nextEventId found in localStorage, defaulting to 1.');
                nextEventId = 1;
            }
        }
    } catch (error) {
        console.error('Error parsing nextEventId from localStorage:', error);
        nextEventId = 1; // Default to 1 on error
    }

    // Function to save events and nextEventId to localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            localStorage.setItem('calendarNextEventId', nextEventId.toString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Function to add a new event
    // eventObject is expected to have: title, date, startTime, endTime, description
    function addEvent(eventObject) {
        if (!eventObject || !eventObject.title || !eventObject.date) {
            console.error('Event object must have at least a title and a date.');
            return null;
        }
        const newEvent = {
            id: nextEventId++,
            title: eventObject.title,
            date: eventObject.date, // Should be in a consistent format, e.g., YYYY-MM-DD string
            startTime: eventObject.startTime || '',
            endTime: eventObject.endTime || '',
            description: eventObject.description || '',
            category: eventObject.category || 'General', // Add category, default to 'General'
            reminders: eventObject.reminders || [] // Initialize reminders, expect array from calendar.js
        };
        events.push(newEvent);
        console.log('eventService: Evento adicionado/atualizado:', JSON.stringify(newEvent));
        saveToLocalStorage(); // Save after adding an event
        // console.log('Event added:', newEvent); // Original log, can be kept or removed
        // console.log('All events:', events); // Original log, can be kept or removed
        return newEvent;
    }

    // Function to get all events
    function getEvents() {
        return [...events]; // Return a copy to prevent direct modification
    }

    // Function to get events for a specific date (YYYY-MM-DD format)
    function getEventsForDate(dateString) {
        return events.filter(event => event.date === dateString);
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
        saveToLocalStorage();
        return true;
    }
    
    // Expose public functions
    window.eventService = {
        addEvent: addEvent,
        getEvents: getEvents,
        getEventsForDate: getEventsForDate,
        updateEvent: updateEvent // Expose the new function
    };

})(window);
