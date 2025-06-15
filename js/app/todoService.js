// js/app/todoService.js
(function(window) {
    'use strict';

    const TASKS_STORAGE_KEY = 'TASKS_STORAGE_KEY'; // Renamed key
    let tasks = []; // Renamed array
    let nextId = 1; // Renamed ID generator

    function _loadTasks() { // Renamed and made "private"
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
            try {
                const parsedTasks = JSON.parse(storedTasks);
                if (Array.isArray(parsedTasks)) {
                    tasks = parsedTasks.map(task => {
                        // Migration: Ensure 'completed' field exists, converting from 'status' if necessary
                        if (typeof task.completed === 'undefined') {
                            task.completed = task.status === 'Completed'; // Assuming 'Completed' status means true
                        }
                        delete task.status; // Remove old 'status' field

                        // Add default priority for tasks loaded from storage that don't have it
                        if (typeof task.priority === 'undefined') {
                            task.priority = 'Medium'; // Default priority
                        }
                        return task;
                    });

                    if (tasks.length > 0) {
                        let maxId = 0;
                        tasks.forEach(task => {
                            if (task.id && typeof task.id === 'number') {
                                if (task.id > maxId) {
                                    maxId = task.id;
                                }
                            } else {
                                task.id = nextId++; // Assign new ID if missing or invalid
                            }
                        });
                        nextId = Math.max(1, maxId + 1);
                    } else {
                        // tasks array is empty after parsing or was initially empty
                        nextId = 1;
                    }
                } else {
                     // storedTasks was not an array
                     tasks = [];
                     nextId = 1;
                }
            } catch (e) {
                console.error('Error parsing stored tasks:', e);
                tasks = [];
                nextId = 1;
            }
        } else {
            // No tasks in storage
            tasks = [];
            nextId = 1;
        }
    }
    _loadTasks(); // Load tasks when the service initializes

    function _saveTasks() { // Renamed and made "private"
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    function addTask(taskData) { // Renamed
        if (!taskData || !taskData.text) {
            console.error('Task must have text.');
            return null;
        }
        const newTask = {
            id: nextId++,
            text: taskData.text,
            completed: false, // Default to not completed
            priority: taskData.priority || 'Medium',
            dueDate: taskData.dueDate || null
        };
        tasks.push(newTask);
        _saveTasks();
        return {...newTask}; // Return a copy
    }

    function getTasks() { // Renamed
        return tasks.map(task => ({...task})); // Return a copy of all tasks
    }

    function updateTask(id, updatedData) {
        const taskId = parseInt(id);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            // Merge existing task with updatedData, but ensure 'id' and 'completed' status are handled carefully
            const originalTask = tasks[taskIndex];
            tasks[taskIndex] = {
                ...originalTask,
                ...updatedData,
                id: taskId // Ensure original ID is preserved
            };
            _saveTasks();
            return {...tasks[taskIndex]}; // Return a copy
        }
        console.error('Task not found for update:', id);
        return null;
    }

    function toggleTaskCompleted(id) {
        const taskId = parseInt(id);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            _saveTasks();
            return {...task}; // Return a copy
        }
        console.error('Task not found for toggle:', id);
        return null;
    }

    function deleteTask(id) { // Renamed
        const taskId = parseInt(id);
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            const deletedTaskArray = tasks.splice(index, 1);
            _saveTasks();
            return deletedTaskArray[0]; // Return the deleted task (which is a copy already due to splice)
        }
        console.error('Task not found for deletion:', id);
        return null;
    }

    function getOpenTasks() {
        return tasks.filter(task => !task.completed).map(task => ({...task}));
    }

    function getCompletedTasks() {
        return tasks.filter(task => task.completed).map(task => ({...task}));
    }

    window.todoService = {
        addTask: addTask,
        getTasks: getTasks,
        updateTask: updateTask,
        toggleTaskCompleted: toggleTaskCompleted,
        deleteTask: deleteTask,
        getOpenTasks: getOpenTasks,
        getCompletedTasks: getCompletedTasks
    };

})(window);
