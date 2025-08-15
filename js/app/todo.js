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

    let currentFilter = 'all';
    let currentSort = 'dueDate';

    if (!taskInput || !addTaskButton || !taskList) {
        console.error('Essential elements for the To-Do app are missing.');
        return;
    }

    async function getAndSortTasks() {
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

        // Sorting logic remains on the client
        if (currentSort === 'priority') {
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            tasks.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
        } else {
            tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        }
        return tasks;
    }

    async function renderTasks() {
        taskList.innerHTML = '<li class="list-group-item text-muted">Carregando tarefas...</li>';
        try {
            const tasksToRender = await getAndSortTasks();
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
                // ... (li innerHTML remains the same)
                 li.innerHTML = `
                    <div class="task-main-content">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${task.text}</span>
                    </div>
                    <div class="task-details">
                        <span class="badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                        <span class="due-date">${task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'Sem data'}</span>
                        <button class="btn btn-danger btn-sm delete-task">Excluir</button>
                    </div>
                `;
                li.dataset.id = task.id;
                taskList.appendChild(li);
            });
        } catch (error) {
            taskList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar tarefas.</li>';
            console.error(error);
        }
    }

    async function handleAddTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Por favor, insira o texto da tarefa.');
            return;
        }

        const taskData = {
            text,
            dueDate: taskDueDateInput.value,
            priority: taskPriorityInput.value
        };

        try {
            await window.todoService.addTask(taskData);
            taskInput.value = '';
            taskDueDateInput.value = '';
            await renderTasks();
        } catch (error) {
            alert('Erro ao adicionar tarefa: ' + error.message);
        }
    }

    // Event Listeners
    addTaskButton.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && handleAddTask());
    
    taskList.addEventListener('click', async (e) => {
        const target = e.target;
        const taskId = target.closest('.task-item')?.dataset.id;
        if (!taskId) return;

        try {
            if (target.classList.contains('task-checkbox')) {
                await window.todoService.toggleTaskCompleted(taskId);
            } else if (target.classList.contains('delete-task')) {
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    await window.todoService.deleteTask(taskId);
                }
            }
            await renderTasks();
        } catch(error) {
            alert('Erro ao atualizar tarefa: ' + error.message);
        }
    });

    [filterAllBtn, filterOpenBtn, filterCompletedBtn].forEach(btn => {
        btn.addEventListener('click', async () => {
            currentFilter = btn.dataset.filter;
            // updateFilterButtons(); // This can be simplified
            await renderTasks();
        });
    });

    [sortByDueDateBtn, sortByPriorityBtn].forEach(btn => {
        btn.addEventListener('click', async () => {
            currentSort = btn.dataset.sort;
            await renderTasks();
        });
    });

    // Initial render
    renderTasks();
}

async function initRecentTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks-list');
    if (!upcomingTasksList) return;
    upcomingTasksList.innerHTML = '<li class="list-group-item text-muted">Carregando...</li>';

    try {
        if (!window.todoService) throw new Error('todoService is not available');

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
            // ... (render logic remains the same)
        });
    } catch (error) {
        upcomingTasksList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar tarefas.</li>';
        console.error(error);
    }
}
