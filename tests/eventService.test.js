(function() {
    const resultsContainerId = 'test-results-eventService';
    const resultsContainer = document.createElement('div');
    resultsContainer.id = resultsContainerId;
    resultsContainer.className = 'test-results';

    let heading = document.querySelector(`h2[data-testid="${resultsContainerId}"]`);
    if (heading) {
        heading.insertAdjacentElement('afterend', resultsContainer);
    } else {
        const fallbackContainer = document.body.querySelector('#qunit') || document.body;
        const newHeading = document.createElement('h2');
        newHeading.textContent = 'Event Service Tests (API)';
        newHeading.dataset.testid = resultsContainerId;
        fallbackContainer.appendChild(newHeading);
        fallbackContainer.appendChild(resultsContainer);
    }

    let testCount = 0;
    let passCount = 0;
    let originalFetch;
    let fetchCalls = [];

    // --- Test Harness ---

    function setup() {
        originalFetch = window.fetch;
        fetchCalls = [];
        window.fetch = async (url, options) => {
            fetchCalls.push({ url, options });
            // Return a default successful response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, id: 'evt_test123' }),
                text: () => Promise.resolve('Success')
            });
        };
    }

    function teardown() {
        window.fetch = originalFetch;
        fetchCalls = [];
    }

    async function runTest(testName, testFn) {
        testCount++;
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `Test: ${testName}`;
        setup();
        try {
            await testFn(); // Tests are now async
            resultDiv.classList.add('pass');
            resultDiv.textContent += ' - PASS';
            passCount++;
        } catch (e) {
            resultDiv.classList.add('fail');
            resultDiv.textContent += ` - FAIL: ${e.message}`;
            console.error(`Test Failed: ${testName}`, e);
        } finally {
            teardown();
            resultsContainer.appendChild(resultDiv);
        }
    }

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    // --- Tests ---

    runTest('addEvent should make a POST request to /api/eventos', async () => {
        const eventData = { title: 'Test Event', date: '2025-01-01', startTime: '10:00' };
        await window.eventService.addEvent(eventData);

        assert(fetchCalls.length === 1, 'Expected fetch to be called once.');
        const call = fetchCalls[0];
        assert(call.url === '/api/eventos', `Expected URL to be /api/eventos, but got ${call.url}`);
        assert(call.options.method === 'POST', `Expected method to be POST, but got ${call.options.method}`);
        assert(call.options.headers['Content-Type'] === 'application/json', 'Expected Content-Type header to be application/json.');

        const body = JSON.parse(call.options.body);
        assert(body.title === eventData.title, 'Request body title does not match.');
    });

    runTest('getEvents should make a GET request to /api/eventos', async () => {
        await window.eventService.getEvents();

        assert(fetchCalls.length === 1, 'Expected fetch to be called once.');
        const call = fetchCalls[0];
        assert(call.url.toString().startsWith('/api/eventos'), `Expected URL to start with /api/eventos, but got ${call.url}`);
        assert(!call.options || call.options.method === 'GET' || typeof call.options.method === 'undefined', 'Expected method to be GET or undefined.');
    });

    runTest('updateEvent should make a PUT request to the correct URL', async () => {
        const eventData = { id: 'evt_123', title: 'Updated Title' };
        await window.eventService.updateEvent(eventData);

        assert(fetchCalls.length === 1, 'Expected fetch to be called once.');
        const call = fetchCalls[0];
        assert(call.url === `/api/eventos/${eventData.id}`, `Expected URL to be /api/eventos/${eventData.id}, but got ${call.url}`);
        assert(call.options.method === 'PUT', `Expected method to be PUT, but got ${call.options.method}`);

        const body = JSON.parse(call.options.body);
        assert(body.title === eventData.title, 'Request body title does not match.');
    });

    runTest('deleteEvent should make a DELETE request to the correct URL', async () => {
        const eventId = 'evt_456';
        await window.eventService.deleteEvent(eventId);

        assert(fetchCalls.length === 1, 'Expected fetch to be called once.');
        const call = fetchCalls[0];
        assert(call.url.toString().startsWith(`/api/eventos/${eventId}`), `Expected URL to start with /api/eventos/${eventId}, but got ${call.url}`);
        assert(call.options.method === 'DELETE', `Expected method to be DELETE, but got ${call.options.method}`);
    });

    runTest('deleteEvent should include scope parameter in URL', async () => {
        const eventId = 'evt_789';
        const scope = 'all';
        await window.eventService.deleteEvent(eventId, scope);

        assert(fetchCalls.length === 1, 'Expected fetch to be called once.');
        const call = fetchCalls[0];
        const url = new URL(call.url, window.location.origin);
        assert(url.pathname === `/api/eventos/${eventId}`, `Expected URL path to be /api/eventos/${eventId}, but got ${url.pathname}`);
        assert(url.searchParams.get('scope') === scope, `Expected scope parameter to be '${scope}', but got '${url.searchParams.get('scope')}'`);
        assert(call.options.method === 'DELETE', 'Expected method to be DELETE.');
    });


    // --- Summary ---
    // This part is tricky because tests run async. We'll add a finalizer.
    setTimeout(() => {
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = `<strong>Event Service API Tests Complete: ${passCount} / ${testCount} passed.</strong>`;
        summaryDiv.style.marginTop = '20px';
        summaryDiv.style.fontWeight = 'bold';
        resultsContainer.appendChild(summaryDiv);
    }, 500); // Delay to allow all async tests to finish
})();
