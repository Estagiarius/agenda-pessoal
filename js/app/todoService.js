(function(window) {
    'use strict';

    // Helper para chamadas de API
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ocorreu um erro na solicitação de tarefas à API.');
        }
        if (response.status === 204) { // No Content
            return;
        }
        return response.json();
    }

    async function getTasks() {
        return apiRequest('/api/tasks');
    }

    async function addTask(taskData) {
        if (!taskData || !taskData.text) {
            throw new Error('Task must have text.');
        }
        const newTaskPayload = {
            text: taskData.text,
            completed: false,
            priority: taskData.priority || 'Medium',
            dueDate: taskData.dueDate || null
        };
        return apiRequest('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskPayload)
        });
    }

    async function updateTask(id, updatedData) {
        return apiRequest(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    }

    async function toggleTaskCompleted(id) {
        const allTasks = await getTasks();
        const task = allTasks.find(t => String(t.id) === String(id));
        if (task) {
            return updateTask(id, { ...task, completed: !task.completed });
        }
        throw new Error('Task not found for toggle.');
    }

    async function deleteTask(id) {
        return apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    }

    async function getOpenTasks() {
        const allTasks = await getTasks();
        return allTasks.filter(task => !task.completed);
    }

    async function getCompletedTasks() {
        const allTasks = await getTasks();
        return allTasks.filter(task => task.completed);
    }

    window.todoService = {
        addTask,
        getTasks,
        updateTask,
        toggleTaskCompleted,
        deleteTask,
        getOpenTasks,
        getCompletedTasks
    };

})(window);
