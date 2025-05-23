document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

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
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.id = task.id;
            
            // Structure: li -> [checkbox, span, deleteButton]
            // To make span take available space and button to the right:
            const textWrapper = document.createElement('div');
            textWrapper.style.flexGrow = '1'; // Allow text to take available space
            textWrapper.style.marginLeft = '10px'; // Space between checkbox and text
            textWrapper.appendChild(span);

            li.appendChild(checkbox);
            li.appendChild(textWrapper);
            li.appendChild(deleteButton);
            
            taskList.appendChild(li);
        });
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Please enter a task.');
            return;
        }
        tasks.push({
            id: Date.now(), // Simple unique ID
            text: text,
            completed: false
        });
        saveTasks();
        renderTasks();
        taskInput.value = ''; // Clear input
    }

    // Toggle task completion
    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === Number(taskId));
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks(); // Re-render to update style
        }
    }

    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== Number(taskId));
        saveTasks();
        renderTasks();
    }

    // Event Listeners
    if (addTaskButton) {
        addTaskButton.addEventListener('click', addTask);
    }
    
    // Allow adding task with Enter key
    if (taskInput) {
        taskInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addTask();
            }
        });
    }

    // Event delegation for task actions (toggle complete, delete)
    if (taskList) {
        taskList.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('task-checkbox')) {
                toggleTaskComplete(target.dataset.id);
            } else if (target.classList.contains('delete-task')) {
                deleteTask(target.dataset.id);
            }
        });
    }

    // Initial load
    loadTasks();
});

// Basic CSS for completed tasks (can be moved to a CSS file)
const style = document.createElement('style');
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
