// js/app/todo.js
function initTodoPage() {
    // console.log('Initializing To-Do Page...');
    const addTodoForm = document.getElementById('addTodoForm');
    const todoTextInput = document.getElementById('todoTextInput');
    const todoPriorityInput = document.getElementById('todoPriorityInput');
    const todoDueDateInput = document.getElementById('todoDueDateInput');
    const openTasksList = document.getElementById('openTasksList');
    const completedTasksList = document.getElementById('completedTasksList');

    if (!addTodoForm || !openTasksList || !completedTasksList || !todoTextInput || !todoPriorityInput || !todoDueDateInput) {
        console.error('Required To-Do List elements not found on the page. Check HTML IDs.');
        return;
    }

    // Function to render/re-render the lists
    function renderTodoLists() {
        if (!window.todoService) {
            console.error('todoService not available.');
            return;
        }

        openTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        const allTodos = window.todoService.getTodos();
        // console.log('Rendering todos:', allTodos);

        allTodos.forEach(todo => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center'; // Bootstrap classes for layout
            
            const textSpan = document.createElement('span');
            textSpan.textContent = `${todo.text} (Priority: ${todo.priority})${todo.dueDate ? ' - Due: ' + todo.dueDate : ''}`;
            listItem.appendChild(textSpan);
            
            const controlsDiv = document.createElement('div');

            // Checkbox for status
            const statusCheckbox = document.createElement('input');
            statusCheckbox.type = 'checkbox';
            statusCheckbox.className = 'form-check-input me-2'; // Margin for spacing
            statusCheckbox.checked = todo.status === 'Completed';
            statusCheckbox.dataset.todoId = todo.id; // Store id for the event listener
            statusCheckbox.addEventListener('change', function() {
                window.todoService.updateTodoStatus(todo.id, this.checked ? 'Completed' : 'Open');
                renderTodoLists();
            });
            controlsDiv.appendChild(statusCheckbox);

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginLeft = '10px'; // Add some margin
            deleteButton.dataset.todoId = todo.id; // Store id for the event listener
            deleteButton.addEventListener('click', function() {
                window.todoService.deleteTodo(todo.id);
                renderTodoLists();
            });
            controlsDiv.appendChild(deleteButton);
            
            listItem.appendChild(controlsDiv);

            if (todo.status === 'Open') {
                openTasksList.appendChild(listItem);
            } else {
                listItem.classList.add('list-group-item-success'); // Style completed tasks
                textSpan.style.textDecoration = 'line-through'; // Add line-through style
                completedTasksList.appendChild(listItem);
            }
        });
    }

    // Event listener for adding a new to-do
    if (!addTodoForm.dataset.listenerAttached) { // Prevent multiple listeners
        addTodoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const text = todoTextInput.value.trim();
            const priority = todoPriorityInput.value;
            const dueDate = todoDueDateInput.value;

            if (text) {
                if (window.todoService) {
                    window.todoService.addTodo({ text, priority, dueDate });
                    addTodoForm.reset(); // Clear the form
                    renderTodoLists();
                } else {
                     console.error('todoService not available for adding task.');
                }
            } else {
                alert('Task description cannot be empty.');
            }
        });
        addTodoForm.dataset.listenerAttached = 'true';
    }
    
    // Initial render
    renderTodoLists();
}
