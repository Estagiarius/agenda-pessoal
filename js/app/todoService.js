// js/app/todoService.js
(function(window) {
    'use strict';

    // All task data is now managed by the backend API.
    // Functions are async and use fetch.

    async function addTask(taskData) {
        if (!taskData || !taskData.text) {
            throw new Error('Task must have text.');
        }
        const response = await fetch('/api/tarefas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar tarefa.');
        }
        return response.json();
    }

    async function getTasks() {
        const response = await fetch('/api/tarefas');
        if (!response.ok) {
            console.error('Erro ao buscar tarefas.');
            return [];
        }
        return response.json();
    }

    async function updateTask(id, updatedData) {
        const response = await fetch(`/api/tarefas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar tarefa.');
        }
        return response.json();
    }

    async function toggleTaskCompleted(id) {
        // First, get the current task to find its 'completed' status
        const tasks = await getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) {
            throw new Error('Tarefa não encontrada para alternar.');
        }

        // Then, call updateTask with the toggled status
        return updateTask(id, { completed: !task.completed });
    }

    async function deleteTask(id) {
        const response = await fetch(`/api/tarefas/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir tarefa.');
        }
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
