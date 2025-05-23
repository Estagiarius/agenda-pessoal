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
                // Ensure all loaded events have a category, default if missing
                events = events.map(event => ({
                    ...event,
                    category: event.category || 'General'
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
            category: eventObject.category || 'General' // Add category, default to 'General'
        };
        events.push(newEvent);
        saveToLocalStorage(); // Save after adding an event
        console.log('Event added:', newEvent);
        console.log('All events:', events); // For debugging
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
    
    // Expose public functions
    window.eventService = {
        addEvent: addEvent,
        getEvents: getEvents,
        getEventsForDate: getEventsForDate
    };

})(window);
