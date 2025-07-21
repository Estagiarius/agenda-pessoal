function initTodoApp() {
    const taskInput = document.getElementById('taskInput');
    const taskPriorityInput = document.getElementById('taskPriorityInput'); // New priority input
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const sortTasksByPriorityButton = document.getElementById('sortTasksByPriorityButton'); // New sort button

    // Check if essential elements are present. If not, this view might not be fully loaded or is incorrect.
    if (!taskInput || !taskPriorityInput || !addTaskButton || !taskList || !sortTasksByPriorityButton) {
        console.error('Todo app elements not found. Aborting initTodoApp.');
        return;
    }

    // No local tasks array needed, will fetch from service.

    // Helper function to load tasks from service and render them
    function loadAndRenderTasks() {
        if (window.todoService && typeof window.todoService.getTasks === 'function') {
            const currentTasks = window.todoService.getTasks();
            renderTasks(currentTasks);
        } else {
            console.error('todoService not available or getTasks is not a function.');
            renderTasks([]); // Render empty list if service is unavailable
        }
    }

    // Render tasks to the UI (now accepts tasks as a parameter)
    function renderTasks(tasksToRender) {
        if (!taskList) return; // Guard against taskList being null if init failed early
        taskList.innerHTML = ''; // Clear existing tasks

        if (!tasksToRender || tasksToRender.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Nenhuma tarefa cadastrada.';
            taskList.appendChild(li);
            return;
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center'; // Bootstrap classes
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input task-checkbox';
            checkbox.checked = task.completed; // Use 'completed' from service
            checkbox.dataset.id = task.id;

            const prioritySpan = document.createElement('span');
            prioritySpan.className = `badge priority-badge priority-${(task.priority || 'medium').toLowerCase()}`;
            prioritySpan.textContent = task.priority || 'Medium'; // Default if undefined

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            if (task.completed) { // Use 'completed' from service
                span.classList.add('completed-task');
            }

            const textAndPriorityWrapper = document.createElement('div');
            textAndPriorityWrapper.className = 'task-text-priority-wrapper';
            textAndPriorityWrapper.appendChild(prioritySpan);
            textAndPriorityWrapper.appendChild(span);


            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm delete-task';
            deleteButton.textContent = 'Excluir';
            deleteButton.dataset.id = task.id;
            
            const textWrapper = document.createElement('div');
            textWrapper.style.flexGrow = '1'; 
            textWrapper.style.marginLeft = '10px'; 
            // textWrapper.appendChild(span); // Old span
            textWrapper.appendChild(textAndPriorityWrapper); // New wrapper

            li.appendChild(checkbox);
            li.appendChild(textWrapper);
            li.appendChild(deleteButton);
            
            taskList.appendChild(li);
        });
    }

    // Add a new task
    function handleAddTask() { // Renamed to avoid conflict if addTask is used elsewhere
        if (!taskInput) return; // Guard
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Por favor, insira uma tarefa.');
            return;
        }
        const priority = taskPriorityInput.value; // Get priority

        if (window.todoService && typeof window.todoService.addTask === 'function') {
            const newTaskData = { text: text, priority: priority };
            const addedTask = window.todoService.addTask(newTaskData);
            if (addedTask) {
                loadAndRenderTasks(); // Reload all tasks from service and re-render
                taskInput.value = '';
                taskPriorityInput.value = 'Medium'; // Reset priority dropdown
            } else {
                alert('Falha ao adicionar tarefa.'); // Or handle error more gracefully
            }
        } else {
            console.error('todoService not available or addTask is not a function.');
            alert('Serviço de tarefas indisponível.');
        }
    }

    // Toggle task completion
    function handleToggleTaskComplete(taskId) { // Renamed
        if (window.todoService && typeof window.todoService.toggleTaskCompleted === 'function') {
            const updatedTask = window.todoService.toggleTaskCompleted(taskId);
            if (updatedTask) {
                loadAndRenderTasks(); // Reload all tasks and re-render
            } else {
                alert('Falha ao atualizar status da tarefa.');
            }
        } else {
            console.error('todoService not available or toggleTaskCompleted is not a function.');
            alert('Serviço de tarefas indisponível.');
        }
    }

    // Delete a task
    function handleDeleteTask(taskId) { // Renamed
        if (window.todoService && typeof window.todoService.deleteTask === 'function') {
            const deleted = window.todoService.deleteTask(taskId);
            if (deleted) {
                loadAndRenderTasks(); // Reload all tasks and re-render
            } else {
                alert('Falha ao excluir tarefa.');
            }
        } else {
            console.error('todoService not available or deleteTask is not a function.');
            alert('Serviço de tarefas indisponível.');
        }
    }

    // Event Listeners
    // Ensure listeners are attached only once using flags
    if (addTaskButton && !addTaskButton.dataset.todoListenerAttached) {
        addTaskButton.addEventListener('click', handleAddTask);
        addTaskButton.dataset.todoListenerAttached = 'true';
    }
    
    if (taskInput && !taskInput.dataset.todoListenerAttached) {
        taskInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAddTask();
            }
        });
        taskInput.dataset.todoListenerAttached = 'true';
    }

    if (taskList && !taskList.dataset.todoListenerAttached) {
        taskList.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('task-checkbox')) {
                handleToggleTaskComplete(target.dataset.id);
            } else if (target.classList.contains('delete-task')) {
                handleDeleteTask(target.dataset.id);
            }
        });
        taskList.dataset.todoListenerAttached = 'true';
    }

    if (sortTasksByPriorityButton && !sortTasksByPriorityButton.dataset.todoListenerAttached) {
        sortTasksByPriorityButton.addEventListener('click', function() {
            if (window.todoService && typeof window.todoService.getTasks === 'function') {
                const currentTasks = window.todoService.getTasks();

                // Define priority order: High: 1, Medium: 2, Low: 3
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

                currentTasks.sort((a, b) => {
                    const priorityA = priorityOrder[a.priority || 'Medium'];
                    const priorityB = priorityOrder[b.priority || 'Medium'];
                    return priorityA - priorityB;
                });
                renderTasks(currentTasks); // Re-render with sorted tasks
            } else {
                console.error('todoService not available for sorting.');
            }
        });
        sortTasksByPriorityButton.dataset.todoListenerAttached = 'true';
    }

    loadAndRenderTasks(); // Initial load of tasks from the service
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
    .priority-badge {
        margin-right: 8px;
        padding: 0.3em 0.6em;
        font-size: 0.75em;
        color: white;
        border-radius: 0.25rem;
    }
    .priority-high { background-color: #d9534f; } /* Red for High */
    .priority-medium { background-color: #f0ad4e; } /* Orange for Medium */
    .priority-low { background-color: #5cb85c; } /* Green for Low */
    .task-text-priority-wrapper {
        display: flex;
        align-items: center;
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

// Function to render recent tasks for the home view
function renderRecentTasks(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    if (window.todoService && typeof window.todoService.getTasks === 'function') {
        const allTasks = window.todoService.getTasks();
        const recentTasks = allTasks.sort((a, b) => b.id - a.id).slice(0, count);

        container.innerHTML = ''; // Clear previous content

        if (recentTasks.length === 0) {
            container.innerHTML = '<p>Nenhuma tarefa recente.</p>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'list-group';

        recentTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = task.text;
            if (task.completed) {
                listItem.classList.add('completed-task');
            }
            list.appendChild(listItem);
        });

        container.appendChild(list);
    } else {
        container.innerHTML = '<p>Serviço de tarefas não disponível.</p>';
    }
}
