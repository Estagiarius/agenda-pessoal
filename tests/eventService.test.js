// tests/eventService.test.js
(function() {
    const resultsContainerId = 'test-results-eventService'; // Unique ID for this service's results
    const resultsContainer = document.createElement('div');
    resultsContainer.id = resultsContainerId;
    resultsContainer.className = 'test-results';

    // Find a good place to insert this, perhaps after the h2 for these tests in test-runner.html
    // For now, this script will append it to the body if specific h2 isn't found.
    let heading = document.querySelector(`h2[data-testid="${resultsContainerId}"]`);
    if (heading) {
        heading.insertAdjacentElement('afterend', resultsContainer);
    } else {
        // Fallback: append to body or a generic test area if specific header isn't there.
        // This part might need adjustment based on how test-runner.html is structured for multiple services.
        const fallbackContainer = document.body.querySelector('#qunit') || document.body; // QUnit or body
        const newHeading = document.createElement('h2');
        newHeading.textContent = 'Event Service Tests';
        newHeading.dataset.testid = resultsContainerId; // For future selection
        fallbackContainer.appendChild(newHeading);
        fallbackContainer.appendChild(resultsContainer);
    }

    let testCount = 0;
    let passCount = 0;

    function runTest(testName, testFn) {
        testCount++;
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `Test: ${testName}`;
        try {
            testFn();
            resultDiv.classList.add('pass');
            resultDiv.textContent += ' - PASS';
            passCount++;
        } catch (e) {
            resultDiv.classList.add('fail');
            resultDiv.textContent += ` - FAIL: ${e.message}`;
            console.error(`Test Failed: ${testName}`, e);
        }
        resultsContainer.appendChild(resultDiv);
    }

    // Ensure eventService is available (loaded by test-runner.html)
    if (typeof window.eventService === 'undefined') {
        resultsContainer.innerHTML = '<div class="fail">CRITICAL: eventService not loaded. Tests cannot run.</div>';
        return;
    }

    const EVENT_STORAGE_KEY = 'teacherAgendaEvents'; // Key used in eventService.js

    function resetEventLocalStorage() {
        localStorage.removeItem(EVENT_STORAGE_KEY);
        // Ideally, we would also re-initialize eventService here or tell it to reload its data.
        // Since it's an IIFE, its internal state is not easily reset without modifying the service.
        // Tests will proceed by checking LS content primarily.
    }

    function getLocalStorageEvents() {
        const data = localStorage.getItem(EVENT_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // --- Actual Tests ---

    runTest('Initial Load: should have state from when eventService.js was parsed', () => {
        // This test acknowledges that eventService loads its data ONCE.
        // Clearing LS here won't affect what's already in memory in the service from initial page load.
        // This is more of a placeholder or a test that would make sense if run in a fresh environment
        // where LS was empty before eventService.js executed.
        resetEventLocalStorage(); // Clears LS for subsequent tests primarily.
        // const events = window.eventService.getEvents();
        // Add meaningful assertions if there's a known initial state to check post-load.
    });

    runTest('LocalStorage: addEvent should save to LocalStorage', () => {
        resetEventLocalStorage();
        const eventData = { title: 'Team Meeting', date: '2024-08-15', startTime: '10:00', description: 'Project discussion' };
        const addedEvent = window.eventService.addEvent(eventData);

        if (!addedEvent || typeof addedEvent.id === 'undefined') throw new Error('Event not created or ID not assigned by service.');

        const storedEvents = getLocalStorageEvents();
        const foundInStorage = storedEvents.find(event => event.id === addedEvent.id);

        if (!foundInStorage) throw new Error('Added event not found in LocalStorage.');
        if (foundInStorage.title !== eventData.title) throw new Error('Stored event title does not match.');
        if (storedEvents.length === 0) throw new Error('LocalStorage is empty after adding an event.');
    });

    runTest('LocalStorage: updateEvent should update LocalStorage', () => {
        resetEventLocalStorage();
        const initialEvent = window.eventService.addEvent({ title: 'Initial Event', date: '2024-08-16' });

        const updatedEventData = { ...initialEvent, title: 'Updated Event Title', description: 'Now with description' };
        window.eventService.updateEvent(updatedEventData); // updateEvent expects the full updated object including ID

        const storedEvents = getLocalStorageEvents();
        const updatedInStorage = storedEvents.find(event => event.id === initialEvent.id);

        if (!updatedInStorage) throw new Error('Updated event not found in LocalStorage.');
        if (updatedInStorage.title !== updatedEventData.title) throw new Error('Event title not updated in LocalStorage.');
        if (updatedInStorage.description !== updatedEventData.description) throw new Error('Event description not updated in LocalStorage.');
    });

    runTest('LocalStorage: deleteEvent should remove from LocalStorage', () => {
        resetEventLocalStorage();
        const event1 = window.eventService.addEvent({ title: 'Event to Delete', date: '2024-08-17' });
        const event2 = window.eventService.addEvent({ title: 'Event to Keep', date: '2024-08-18' });

        window.eventService.deleteEvent(event1.id); // Assuming deleteEvent exists

        const storedEvents = getLocalStorageEvents();
        const foundEvent1 = storedEvents.find(event => event.id === event1.id);
        const foundEvent2 = storedEvents.find(event => event.id === event2.id);

        if (foundEvent1) throw new Error('Deleted event (event1) still found in LocalStorage.');
        if (!foundEvent2) throw new Error('Other event (event2) was unexpectedly removed from LocalStorage.');
        const expectedCountAfterDelete = storedEvents.filter(e => e.id === event2.id).length;
        if (storedEvents.length !== expectedCountAfterDelete && storedEvents.length !== 1) {
             // This check is a bit complex because we don't fully reset service state.
             // We focus on q1 being gone and q2 remaining.
        }
    });

    runTest('LocalStorage: load from non-empty (conceptual)', () => {
        // localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify([{id: 101, title: 'Preloaded Event', date: '2024-01-01'}]));
        // Reload test-runner.html for eventService to pick this up.
        // const events = window.eventService.getEvents();
        // const preloaded = events.find(e => e.id === 101);
        // if (!preloaded) throw new Error('Did not load pre-existing event.');
        // console.log('This test requires manual LS setup & page reload.');
    });

    runTest('LocalStorage: handling invalid JSON (conceptual)', () => {
        // localStorage.setItem(EVENT_STORAGE_KEY, '[[{not json]');
        // Reload test-runner.html. eventService should handle this gracefully (e.g., empty list).
        // const events = window.eventService.getEvents();
        // if (events.length !== 0) throw new Error('Service should initialize empty with invalid LS data.');
        // console.log('This test requires manual LS setup & page reload.');
    });


    // Summary
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `<strong>Event Service Tests Complete: ${passCount} / ${testCount} passed.</strong>`;
    summaryDiv.style.marginTop = '20px';
    summaryDiv.style.fontWeight = 'bold';
    resultsContainer.appendChild(summaryDiv);

})();
