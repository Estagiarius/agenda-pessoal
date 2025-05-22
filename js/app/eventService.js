// Simple In-Memory Event Service
(function(window) {
    'use strict';

    let events = [];
    let nextEventId = 1;

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
            description: eventObject.description || ''
        };
        events.push(newEvent);
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
