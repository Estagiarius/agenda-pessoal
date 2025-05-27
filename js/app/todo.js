function initTodoApp() {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    // Check if essential elements are present. If not, this view might not be fully loaded or is incorrect.
    if (!taskInput || !addTaskButton || !taskList) {
        console.error('Todo app elements not found. Aborting initTodoApp.');
        return;
    }

    let tasks = []; // Holds the tasks

    // Load tasks from localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('todoTasks');
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
                if (!Array.isArray(tasks)) {
                    tasks = [];
                }
            } catch (e) {
                console.error("Error parsing tasks from localStorage", e);
                tasks = [];
            }
        }
        renderTasks();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // Render tasks to the UI
    function renderTasks() {
        if (!taskList) return; // Guard against taskList being null if init failed early
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center'; // Bootstrap classes
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input task-checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.id = task.id;

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            if (task.completed) {
                span.classList.add('completed-task');
            }

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm delete-task';
            deleteButton.textContent = 'Excluir';
            deleteButton.dataset.id = task.id;
            
            const textWrapper = document.createElement('div');
            textWrapper.style.flexGrow = '1'; 
            textWrapper.style.marginLeft = '10px'; 
            textWrapper.appendChild(span);

            li.appendChild(checkbox);
            li.appendChild(textWrapper);
            li.appendChild(deleteButton);
            
            taskList.appendChild(li);
        });
    }

    // Add a new task
    function addTask() {
        if (!taskInput) return; // Guard
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Por favor, insira uma tarefa.');
            return;
        }
        tasks.push({
            id: Date.now(), 
            text: text,
            completed: false
        });
        saveTasks();
        renderTasks();
        taskInput.value = ''; 
    }

    // Toggle task completion
    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === Number(taskId));
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks(); 
        }
    }

    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== Number(taskId));
        saveTasks();
        renderTasks();
    }

    // Event Listeners
    // Ensure listeners are attached only once using flags
    if (addTaskButton && !addTaskButton.dataset.todoListenerAttached) {
        addTaskButton.addEventListener('click', addTask);
        addTaskButton.dataset.todoListenerAttached = 'true';
    }
    
    if (taskInput && !taskInput.dataset.todoListenerAttached) {
        taskInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addTask();
            }
        });
        taskInput.dataset.todoListenerAttached = 'true';
    }

    if (taskList && !taskList.dataset.todoListenerAttached) {
        taskList.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('task-checkbox')) {
                toggleTaskComplete(target.dataset.id);
            } else if (target.classList.contains('delete-task')) {
                deleteTask(target.dataset.id);
            }
        });
        taskList.dataset.todoListenerAttached = 'true';
    }

    loadTasks(); // Initial load of tasks
}

// Basic CSS for completed tasks (can be moved to a CSS file)
// This part should ideally be in a CSS file, but for the exercise, we'll keep it.
// Ensure it's only added once.
if (!document.getElementById('todo-styles')) {
    const style = document.createElement('style');
    style.id = 'todo-styles';
style.textContent = `
    .completed-task {
        text-decoration: line-through;
        color: #777;
    }
    .task-checkbox {
        margin-right: 10px; /* Spacing for checkbox */
    }
    /* Add some flex properties for better alignment if not using Bootstrap's d-flex */
    .list-group-item { 
        display: flex; 
        align-items: center; 
    }
    .task-text {
        flex-grow: 1; /* Allows text to take up available space */
        margin-left: 5px; /* Space from checkbox */
        margin-right: 5px; /* Space before delete button */
    }
`;
document.head.appendChild(style);
}
