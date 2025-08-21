async function initTodoApp() {
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

    async function getTasks() {
        if (!window.todoService) {
            console.error('todoService is not available.');
            return [];
        }

        let tasks;
        if (currentFilter === 'open') {
            tasks = await window.todoService.getOpenTasks();
        } else if (currentFilter === 'completed') {
            tasks = await window.todoService.getCompletedTasks();
        } else {
            tasks = await window.todoService.getTasks();
        }

        // Sorting logic
        if (currentSort === 'priority') {
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            tasks.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));
        } else { // Default sort by due date
            tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        }

        return tasks;
    }

    async function renderTasks() {
        const tasksToRender = await getTasks();
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
            const priorityLower = (task.priority || 'medium').toLowerCase();

            li.innerHTML = `
                <div class="task-main-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <div class="task-details">
                    <span class="badge priority-${priorityLower}">${task.priority || 'Medium'}</span>
                    <span class="due-date">${dueDateFormatted}</span>
                    <button class="btn btn-danger btn-sm delete-task">Excluir</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    async function handleAddTask() {
        const text = taskInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (text === '') {
            alert('Por favor, insira o texto da tarefa.');
            return;
        }

        if (!window.todoService) {
            alert('Serviço de tarefas indisponível.');
            return;
        }

        await window.todoService.addTask({ text, dueDate, priority });
        taskInput.value = '';
        taskDueDateInput.value = '';
        await renderTasks();
    }

    function updateFilterButtons() {
        [filterAllBtn, filterOpenBtn, filterCompletedBtn].forEach(btn => btn.classList.remove('active'));
        if (currentFilter === 'all') filterAllBtn.classList.add('active');
        else if (currentFilter === 'open') filterOpenBtn.classList.add('active');
        else if (currentFilter === 'completed') filterCompletedBtn.classList.add('active');
    }

    // Event Listeners
    addTaskButton.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddTask();
    });
    
    taskList.addEventListener('click', async (e) => {
        const target = e.target;
        const taskId = target.closest('.task-item')?.dataset.id;
        if (!taskId) return;

        if (target.classList.contains('task-checkbox')) {
            await window.todoService.toggleTaskCompleted(taskId);
            await renderTasks();
        } else if (target.classList.contains('delete-task')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                await window.todoService.deleteTask(taskId);
                await renderTasks();
            }
        }
    });

    filterAllBtn.addEventListener('click', () => { currentFilter = 'all'; updateFilterButtons(); renderTasks(); });
    filterOpenBtn.addEventListener('click', () => { currentFilter = 'open'; updateFilterButtons(); renderTasks(); });
    filterCompletedBtn.addEventListener('click', () => { currentFilter = 'completed'; updateFilterButtons(); renderTasks(); });

    sortByDueDateBtn.addEventListener('click', () => { currentSort = 'dueDate'; renderTasks(); });
    sortByPriorityBtn.addEventListener('click', () => { currentSort = 'priority'; renderTasks(); });

    // Initial render
    await renderTasks();
}

async function initRecentTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks-list');

    if (!upcomingTasksList) {
        return;
    }

    if (!window.todoService) {
        console.error('todoService is not available for recent tasks.');
        upcomingTasksList.innerHTML = '<li class="list-group-item text-muted">Serviço de tarefas indisponível.</li>';
        return;
    }

    const tasks = await window.todoService.getOpenTasks();

    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const recentTasks = tasks.slice(0, 5);

    upcomingTasksList.innerHTML = '';

    if (recentTasks.length === 0) {
        upcomingTasksList.innerHTML = '<li class="list-group-item text-muted">Nenhuma tarefa futura.</li>';
        return;
    }

    recentTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        const dueDateFormatted = task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'Sem data';
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <span class="due-date pull-right">${dueDateFormatted}</span>
        `;
        upcomingTasksList.appendChild(li);
    });
}
