(function() {
    'use strict';

    // Mock fetch for todoService tests
    async function mockFetchTasks(url, options) {
        const mockDb = {
            '/api/tasks': []
        };
        const method = options ? options.method || 'GET' : 'GET';

        if (url.startsWith('/api/tasks')) {
            if (method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDb['/api/tasks'])
                });
            }
            if (method === 'POST') {
                const body = JSON.parse(options.body);
                body.id = `mock_task_${mockDb['/api/tasks'].length + 1}`;
                mockDb['/api/tasks'].push(body);
                return Promise.resolve({
                    ok: true,
                    status: 201,
                    json: () => Promise.resolve(body)
                });
            }
            // Add mock for PUT and DELETE if needed
        }

        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ message: "Not Found in Mock" })
        });
    }

    describe('Todo Service (API Mocked)', function() {

        let originalFetch;

        beforeEach(function() {
            originalFetch = window.fetch;
            window.fetch = mockFetchTasks;
        });

        afterEach(function() {
            window.fetch = originalFetch;
        });

        it('should add a new task via API', async function() {
            const taskData = { text: 'Buy milk', priority: 'High' };

            const newTask = await window.todoService.addTask(taskData);

            expect(newTask).toBeDefined();
            expect(newTask.text).toBe('Buy milk');
            expect(newTask.id).toBeDefined();
            expect(newTask.completed).toBe(false);
        });

        it('should get all tasks from API', async function() {
            await window.todoService.addTask({ text: 'Task 1' });

            const tasks = await window.todoService.getTasks();

            expect(Array.isArray(tasks)).toBe(true);
        });
    });
})();
