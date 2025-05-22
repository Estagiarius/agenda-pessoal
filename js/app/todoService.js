// Simple In-Memory To-Do Service
(function(window) {
    'use strict';

    let todos = [];
    let nextTodoId = 1;

    function addTodo(itemObject) {
        if (!itemObject || !itemObject.text) {
            console.error('To-do item must have text.');
            return null;
        }
        const newTodo = {
            id: nextTodoId++,
            text: itemObject.text,
            priority: itemObject.priority || 'Medium', // Default priority
            status: 'Open', // Default status
            dueDate: itemObject.dueDate || null // Optional due date
        };
        todos.push(newTodo);
        // console.log('To-do added:', newTodo);
        // console.log('All to-dos:', todos);
        return newTodo;
    }

    function getTodos() {
        return [...todos]; // Return a copy
    }

    function updateTodoStatus(id, newStatus) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.status = newStatus;
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
    
    // Expose public functions
    window.todoService = {
        addTodo: addTodo,
        getTodos: getTodos,
        updateTodoStatus: updateTodoStatus,
        deleteTodo: deleteTodo,
        getOpenTodos: getOpenTodos,
        getCompletedTodos: getCompletedTodos
    };

})(window);
