// js/app/todoService.js
(function(window) {
    'use strict';

    let tasks = [];

    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks from server.');
            }
            tasks = await response.json();
            return tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
            return [];
        }
    }

    async function addTask(taskData) {
        if (!taskData || !taskData.text) {
            console.error('Task must have text.');
            return null;
        }
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            if (!response.ok) {
                throw new Error('Failed to add task.');
            }
            const newTask = await response.json();
            tasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error adding task:', error);
            return null;
        }
    }

    function getTasks() {
        return [...tasks];
    }

    async function updateTask(id, updatedData) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
                throw new Error('Failed to update task.');
            }
            const updatedTask = await response.json();
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = updatedTask;
            }
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            return null;
        }
    }

    async function toggleTaskCompleted(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            return await updateTask(id, { completed: !task.completed });
        }
        console.error('Task not found for toggle:', id);
        return null;
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete task.');
            }
            const index = tasks.findIndex(t => t.id === id);
            if (index > -1) {
                tasks.splice(index, 1);
            }
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    function getOpenTasks() {
        return tasks.filter(task => !task.completed);
    }

    function getCompletedTasks() {
        return tasks.filter(task => task.completed);
    }

    // Initial load of tasks when the service is initialized.
    loadTasks();

    window.todoService = {
        loadTasks: loadTasks, // Expose loadTasks to be called from UI if needed
        addTask: addTask,
        getTasks: getTasks,
        updateTask: updateTask,
        toggleTaskCompleted: toggleTaskCompleted,
        deleteTask: deleteTask,
        getOpenTasks: getOpenTasks,
        getCompletedTasks: getCompletedTasks
    };

})(window);
