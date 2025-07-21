function initTodoApp() {
    const taskInput = document.getElementById('taskInput');
    const taskDueDateInput = document.getElementById('taskDueDateInput');
    const taskPriorityInput = document.getElementById('taskPriorityInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    // Filter and Sort Buttons
    const filterAllBtn = document.getElementById('filterAll');
    const filterOpenBtn = document.getElementById('filterOpen');
    const filterCompletedBtn = document.getElementById('filterCompleted');
    const sortByDueDateBtn = document.getElementById('sortTasksByDueDateButton');
    const sortByPriorityBtn = document.getElementById('sortTasksByPriorityButton');

    let currentFilter = 'all'; // 'all', 'open', 'completed'
    let currentSort = 'dueDate'; // 'dueDate', 'priority'

    if (!taskInput || !addTaskButton || !taskList) {
        console.error('Essential elements for the To-Do app are missing.');
        return;
    }

    function getTasks() {
        if (!window.todoService) {
            console.error('todoService is not available.');
            return [];
        }

        let tasks;
        if (currentFilter === 'open') {
            tasks = window.todoService.getOpenTasks();
        } else if (currentFilter === 'completed') {
            tasks = window.todoService.getCompletedTasks();
        } else {
            tasks = window.todoService.getTasks();
        }

        // Sorting logic
        if (currentSort === 'priority') {
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            tasks.sort((a, b) => (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));
        } else { // Default sort by due date
            tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        }

        return tasks;
    }

    function renderTasks() {
        const tasksToRender = getTasks();
        taskList.innerHTML = '';

        if (tasksToRender.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Nenhuma tarefa para exibir.';
            taskList.appendChild(li);
            return;
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            const isOverdue = task.dueDate && !task.completed && moment(task.dueDate).isBefore(moment(), 'day');
            li.className = `list-group-item task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
            li.dataset.id = task.id;

            const dueDateFormatted = task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'Sem data';

            li.innerHTML = `
                <div class="task-main-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <div class="task-details">
                    <span class="badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="due-date">${dueDateFormatted}</span>
                    <button class="btn btn-danger btn-sm delete-task">Excluir</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function handleAddTask() {
        const text = taskInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (text === '') {
            alert('Por favor, insira o texto da tarefa.');
            return;
        }

        window.todoService.addTask({ text, dueDate, priority });
        taskInput.value = '';
        taskDueDateInput.value = '';
        renderTasks();
    }

    function updateFilterButtons() {
        [filterAllBtn, filterOpenBtn, filterCompletedBtn].forEach(btn => btn.classList.remove('active'));
        if (currentFilter === 'all') filterAllBtn.classList.add('active');
        else if (currentFilter === 'open') filterOpenBtn.classList.add('active');
        else if (currentFilter === 'completed') filterCompletedBtn.classList.add('active');
    }

    // Event Listeners
    addTaskButton.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && handleAddTask());
    
    taskList.addEventListener('click', e => {
        const target = e.target;
        const taskId = target.closest('.task-item')?.dataset.id;
        if (!taskId) return;

        if (target.classList.contains('task-checkbox')) {
            window.todoService.toggleTaskCompleted(taskId);
            renderTasks();
        } else if (target.classList.contains('delete-task')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                window.todoService.deleteTask(taskId);
                renderTasks();
            }
        }
    });

    filterAllBtn.addEventListener('click', () => { currentFilter = 'all'; updateFilterButtons(); renderTasks(); });
    filterOpenBtn.addEventListener('click', () => { currentFilter = 'open'; updateFilterButtons(); renderTasks(); });
    filterCompletedBtn.addEventListener('click', () => { currentFilter = 'completed'; updateFilterButtons(); renderTasks(); });

    sortByDueDateBtn.addEventListener('click', () => { currentSort = 'dueDate'; renderTasks(); });
    sortByPriorityBtn.addEventListener('click', () => { currentSort = 'priority'; renderTasks(); });

    // Initial render
    renderTasks();
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
