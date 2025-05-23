// js/app/todoService.js
(function(window) {
    'use strict';

    const TODOS_STORAGE_KEY = 'teacherAgendaTodos';
    let todos = [];
    let nextTodoId = 1;

    function loadTodos() {
        const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
        if (storedTodos) {
            try {
                const parsedTodos = JSON.parse(storedTodos);
                if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
                    todos = parsedTodos;
                    let maxId = 0;
                    todos.forEach(todo => {
                        if (todo.id && typeof todo.id === 'number') {
                            if (todo.id > maxId) {
                                maxId = todo.id;
                            }
                        } else {
                            todo.id = nextTodoId++;
                        }
                    });
                    nextTodoId = Math.max(1, maxId + 1);
                } else {
                     todos = [];
                     nextTodoId = 1;
                }
            } catch (e) {
                console.error('Error parsing stored todos:', e);
                todos = [];
                nextTodoId = 1;
            }
        } else {
            todos = [];
            nextTodoId = 1;
        }
    }
    loadTodos(); // Load todos when the service initializes

    function saveTodos() {
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    }

    function addTodo(itemObject) {
        if (!itemObject || !itemObject.text) {
            console.error('To-do item must have text.');
            return null;
        }
        const newTodo = {
            id: nextTodoId++,
            text: itemObject.text,
            priority: itemObject.priority || 'Medium',
            status: 'Open',
            dueDate: itemObject.dueDate || null
        };
        todos.push(newTodo);
        saveTodos();
        // console.log('To-do added:', newTodo);
        return newTodo;
    }

    function getTodos() {
        return [...todos]; // Return a copy
    }

    function updateTodoStatus(id, newStatus) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.status = newStatus;
            saveTodos();
            // console.log('Updated_todo_status:', todo);
            return todo;
        }
        console.error('To-do not found for status update:', id);
        return null;
    }

    function deleteTodo(id) {
        const index = todos.findIndex(t => t.id === id);
        if (index > -1) {
            const deletedTodo = todos.splice(index, 1);
            saveTodos();
            // console.log('Deleted_todo:', deletedTodo[0]);
            return true;
        }
        console.error('To-do not found for deletion:', id);
        return false;
    }

    function getOpenTodos() {
        return todos.filter(todo => todo.status === 'Open');
    }

    function getCompletedTodos() {
        return todos.filter(todo => todo.status === 'Completed');
    }

    window.todoService = {
        addTodo: addTodo,
        getTodos: getTodos,
        updateTodoStatus: updateTodoStatus,
        deleteTodo: deleteTodo,
        getOpenTodos: getOpenTodos,
        getCompletedTodos: getCompletedTodos
    };

})(window);
