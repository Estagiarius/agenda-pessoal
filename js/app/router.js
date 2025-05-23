document.addEventListener('DOMContentLoaded', function() {
    const mainContentArea = document.getElementById('main-content-area');

    const homeViewHtml = `
<div class="container" style="margin-top: 50px;">
    <div class="row">
        <div class="col-md-4" id="calendar">
            <!-- Calendar will be initialized here by calendar.js if this view is loaded -->
        </div>
        <div class="col-md-8 text-center">
            <!-- / College Timetable -->
            <div class='tab'>
                <table border='0' cellpadding='0' cellspacing='0'>
                    <caption class='title'>Project Calendar Overview</caption>
                    <tr class='days'>
                        <th></th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    </tr>
                    <tr>
                        <td class='time'>9.00</td>
                        <td class='cs335 blue' data-tooltip='Software Engineering &amp; Software Process'>CS335 [JH1]</td>
                        <td class='cs426 purple' data-tooltip='Computer Graphics'>CS426 [CS1]</td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>10.00</td>
                        <td></td>
                        <td class='cs335 blue lab' data-tooltip='Software Engineering &amp; Software Process'>CS335 [Lab]</td>
                        <td class='md352 green' data-tooltip='Multimedia Production &amp; Management'>MD352 [Kairos]</td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>11.00</td>
                        <td></td>
                        <td class='cs335 blue lab' data-tooltip='Software Engineering &amp; Software Process'>CS335 [Lab]</td>
                        <td class='md352 green' data-tooltip='Multimedia Production &amp; Management'>MD352 [Kairos]</td>
                        <td class='cs240 orange' data-tooltip='Operating Systems'>CS240 [CH]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>12.00</td>
                        <td></td>
                        <td class='md303 navy' data-tooltip='Media &amp; Globalisation'>MD303 [CS2]</td>
                        <td class='md313 red' data-tooltip='Special Topic: Multiculturalism &amp; Nationalism'>MD313 [Iontas]</td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>13.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>14.00</td>
                        <td></td>
                        <td></td>
                        <td class='cs426 purple' data-tooltip='Computer Graphics'>CS426 [CS2]</td>
                        <td class='cs240 orange' data-tooltip='Operating Systems'>CS240 [TH1]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>15.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class='cs240 orange lab' data-tooltip='Operating Systems'>CS240 [Lab]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>16.00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class='cs240 orange lab' data-tooltip='Operating Systems'>CS240 [Lab]</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td class='time'>17.00</td>
                        <td class='cs335 blue' data-tooltip='Software Engineering &amp; Software Process'>CS335 [TH1]</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>-</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>
    `;

    const projectsViewHtml = `
        <h2>Projects Dashboard</h2>
        <button id="createNewProjectBtn" class="btn btn-primary mb-3">Create New Project</button>
        <div id="project-list-container">
            <p>Loading projects...</p>
        </div>
    `;

    const views = {
        '#/home': homeViewHtml,
        '#/settings': '<h2>Settings Page</h2><p>Settings will go here. This is loaded by the router.</p>',
        '#/projects': projectsViewHtml, // Add projects view
    };

    function loadView(hash) {
        let viewKey = hash;
        if (hash === '#/' || hash === '' || !hash) {
            viewKey = '#/projects'; // Default to projects
        }

        if (views[viewKey]) {
            mainContentArea.innerHTML = views[viewKey];
            mainContentArea.style.display = 'block';
            
            if (viewKey === '#/home') {
                if (typeof initCalendar === 'function') {
                    initCalendar();
                } else {
                    console.error('initCalendar function is not defined. Make sure calendar.js is loaded before router.js.');
                }
            } else if (viewKey === '#/projects') {
                initializeProjectsView(); // Call function to handle project view logic
            }
        } else {
             // Handle project detail view if no direct match
            if (viewKey.startsWith('#/projects/')) {
                const projectId = viewKey.split('/')[2];
                mainContentArea.innerHTML = generateProjectDetailViewHtml(projectId);
                mainContentArea.style.display = 'block';
                initializeProjectDetailView(projectId); 
            } else {
                mainContentArea.innerHTML = '<h2>404 - Page Not Found</h2><p>The page you requested could not be found.</p>';
                mainContentArea.style.display = 'block';
            }
        }
    }

    function initializeProjectsView() {
        const projectListContainer = document.getElementById('project-list-container');
        if (!projectListContainer) {
            console.error("Project list container not found.");
            return;
        }

        if (typeof projectService === 'undefined' || !projectService) {
            console.error("projectService is not defined. Make sure projectService.js is loaded before router.js");
            projectListContainer.innerHTML = '<p>Error: Project service is not available. Cannot load projects.</p>';
            return;
        }

        projectService.getProjects()
            .then(projects => {
                if (projects && projects.length > 0) {
                    let projectsHtml = '<ul class="list-group">';
                    projects.forEach(project => {
                        projectsHtml += `
                            <li class="list-group-item">
                                <a href="#/projects/${project.id}">${project.name}</a>
                                <p>${project.description || 'No description provided.'}</p>
                            </li>`;
                    });
                    projectsHtml += '</ul>';
                    projectListContainer.innerHTML = projectsHtml;
                } else if (projects) { // projects is an empty array
                    projectListContainer.innerHTML = '<p>No projects found. Click "Create New Project" to add one.</p>';
                } else { // projects is null or undefined (error in service)
                     projectListContainer.innerHTML = '<p>Could not load projects. The project data might be missing or malformed.</p>';
                }
            })
            .catch(error => {
                projectListContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
                console.error('Error in initializeProjectsView getProjects:', error);
            });

        const createNewProjectBtn = document.getElementById('createNewProjectBtn');
        if (createNewProjectBtn) {
            // Clone and replace to ensure old listeners are removed if this function is called multiple times
            const newBtn = createNewProjectBtn.cloneNode(true);
            createNewProjectBtn.parentNode.replaceChild(newBtn, createNewProjectBtn);
            newBtn.addEventListener('click', openProjectCreationModal);
        } else {
            console.error("Create New Project button not found.");
        }
    }

    function openProjectCreationModal() {
        const modalElement = document.getElementById('eventModal');
        if (!modalElement) {
            console.error("Modal element #eventModal not found in DOM.");
            alert("Error: Modal not found. Cannot create project.");
            return;
        }
        // Ensure bootstrap.Modal is available
        if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal === 'undefined') {
            console.error('Bootstrap Modal is not defined. Make sure Bootstrap JS is loaded.');
            alert('Error: Modal functionality is not available.');
            return;
        }
        const modal = new bootstrap.Modal(modalElement);
        
        const modalTitle = document.getElementById('eventModalLabel');
        const eventTitleInput = document.getElementById('eventTitleInput'); 
        const eventDescriptionInput = document.getElementById('eventDescriptionInput');
        const saveEventButton = document.getElementById('saveEventButton');
        
        // Assuming these elements exist from the original modal.
        // We will hide them if they are not relevant for project creation.
        const eventDateLabel = document.querySelector('label[for="eventDateInput"]');
        const eventDateInput = document.getElementById('eventDateInput');
        const eventTimeLabel = document.querySelector('label[for="eventTimeInput"]');
        const eventTimeInput = document.getElementById('eventTimeInput');

        // Configure modal for Project Creation
        if (modalTitle) modalTitle.textContent = 'Create New Project';
        
        const titleLabel = document.querySelector('label[for="eventTitleInput"]');
        if (titleLabel) titleLabel.textContent = 'Project Name:';
        if (eventTitleInput) {
            eventTitleInput.value = '';
            eventTitleInput.placeholder = 'Enter project name';
        }
        
        const descriptionLabel = document.querySelector('label[for="eventDescriptionInput"]');
        if (descriptionLabel) descriptionLabel.textContent = 'Project Description:';
        if (eventDescriptionInput) {
            eventDescriptionInput.value = '';
            eventDescriptionInput.placeholder = 'Enter project description';
        }

        if (saveEventButton) {
            saveEventButton.textContent = 'Create Project';
        }

        // Hide date/time fields and their labels
        if (eventDateLabel) eventDateLabel.style.display = 'none';
        if (eventDateInput) eventDateInput.style.display = 'none';
        if (eventTimeLabel) eventTimeLabel.style.display = 'none';
        if (eventTimeInput) eventTimeInput.style.display = 'none';
        
        // Clone the button to remove previous event listeners effectively
        const newSaveButton = saveEventButton.cloneNode(true);
        saveEventButton.parentNode.replaceChild(newSaveButton, saveEventButton);
        
        newSaveButton.addEventListener('click', function handleProjectSave() {
            const projectName = eventTitleInput.value.trim();
            const projectDescription = eventDescriptionInput.value.trim();

            if (!projectName) {
                alert('Project name is required.');
                return;
            }
            if (typeof projectService === 'undefined' || !projectService) {
                 console.error("projectService is not defined. Cannot create project.");
                 alert("Error: Project service is not available.");
                 return;
            }

            projectService.createProject({ name: projectName, description: projectDescription })
                .then(newProject => {
                    modal.hide();
                    // Refresh project list by calling initializeProjectsView again
                    initializeProjectsView(); 
                })
                .catch(error => {
                    console.error('Failed to create project:', error);
                    alert(`Failed to create project: ${error.message || 'Unknown error. Check console.'}`);
                });
        });

        modal.show();
    }

    function generateProjectDetailViewHtml(projectId) {
        // Main structure for the project detail view
        return `
            <div id="project-detail-main-container">
                <div id="project-info-section" class="mb-4">
                    <h2 id="project-name-detail">Loading Project Details...</h2>
                    <p id="project-description-detail"></p>
                </div>

                <!-- Parts Section -->
                <div id="parts-section" class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h3>Parts</h3>
                        <button id="addPartBtn" class="btn btn-success btn-sm">Add Part</button>
                    </div>
                    <div class="card-body">
                        <div id="part-list-container"><p>Loading parts...</p></div>
                    </div>
                </div>

                <!-- Tasks Section -->
                <div id="tasks-section" class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h3>Tasks / Schedule</h3>
                        <button id="addTaskBtn" class="btn btn-success btn-sm">Add Task</button>
                    </div>
                    <div class="card-body">
                        <div id="task-list-container"><p>Loading tasks...</p></div>
                    </div>
                </div>

                <!-- Documents Section -->
                <div id="documents-section" class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h3>Documents</h3>
                        <button id="addDocumentBtn" class="btn btn-success btn-sm">Add Document</button>
                    </div>
                    <div class="card-body">
                        <div id="document-list-container"><p>Loading documents...</p></div>
                    </div>
                </div>
            </div>
        `;
    }

    function initializeProjectDetailView(projectId) {
        if (typeof projectService === 'undefined' || !projectService) {
            console.error("projectService is not defined. Cannot load project details.");
            document.getElementById('project-name-detail').textContent = 'Error: Project Service not available.';
            return;
        }

        // Fetch and render project details
        projectService.getProjectDetails(projectId)
            .then(project => {
                document.getElementById('project-name-detail').textContent = project.name;
                document.getElementById('project-description-detail').textContent = project.description || 'No description provided.';
            })
            .catch(error => {
                console.error('Failed to load project details:', error);
                document.getElementById('project-name-detail').textContent = 'Failed to load project details.';
            });

        // Load and render parts, tasks, documents
        loadAndRenderParts(projectId);
        loadAndRenderTasks(projectId);
        loadAndRenderDocuments(projectId);

        // Add event listeners for "Add" buttons
        document.getElementById('addPartBtn').addEventListener('click', () => openAddItemModal('part', projectId));
        document.getElementById('addTaskBtn').addEventListener('click', () => openAddItemModal('task', projectId));
        document.getElementById('addDocumentBtn').addEventListener('click', () => openAddItemModal('document', projectId));
    }

    function loadAndRenderParts(projectId) {
        const container = document.getElementById('part-list-container');
        container.innerHTML = '<p>Loading parts...</p>';
        projectService.getParts(projectId)
            .then(parts => {
                if (parts && parts.length > 0) {
                    let html = '<ul class="list-group">';
                    parts.forEach(part => {
                        html += `<li class="list-group-item">
                            <strong>${part.name}</strong> (Qty: ${part.quantity || 1})
                            <p class="mb-0">Specs: ${part.specifications || 'N/A'}</p>
                            <small>Supplier: ${part.supplier || 'N/A'}</small>
                        </li>`;
                    });
                    html += '</ul>';
                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<p>No parts found for this project.</p>';
                }
            })
            .catch(error => {
                console.error('Failed to load parts:', error);
                container.innerHTML = '<p>Failed to load parts.</p>';
            });
    }

    function loadAndRenderTasks(projectId) {
        const container = document.getElementById('task-list-container');
        container.innerHTML = '<p>Loading tasks...</p>';
        projectService.getTasks(projectId)
            .then(tasks => {
                if (tasks && tasks.length > 0) {
                    let html = '<ul class="list-group">';
                    tasks.forEach(task => {
                        html += `<li class="list-group-item">
                            <strong>${task.name}</strong> (Status: ${task.status || 'Pending'})
                            <p class="mb-0">${task.description || 'No description.'}</p>
                            <small>Dates: ${task.start_date || 'N/A'} to ${task.end_date || 'N/A'}</small>
                        </li>`;
                    });
                    html += '</ul>';
                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<p>No tasks found for this project.</p>';
                }
            })
            .catch(error => {
                console.error('Failed to load tasks:', error);
                container.innerHTML = '<p>Failed to load tasks.</p>';
            });
    }

    function loadAndRenderDocuments(projectId) {
        const container = document.getElementById('document-list-container');
        container.innerHTML = '<p>Loading documents...</p>';
        projectService.getDocuments(projectId) // This fetches id and title
            .then(documents => {
                if (documents && documents.length > 0) {
                    let html = '<ul class="list-group">';
                    documents.forEach(doc => {
                        // Later, this link could open the full document viewer
                        html += `<li class="list-group-item"><a href="#" data-doc-id="${doc.id}">${doc.title}</a></li>`;
                    });
                    html += '</ul>';
                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<p>No documents found for this project.</p>';
                }
            })
            .catch(error => {
                console.error('Failed to load documents:', error);
                container.innerHTML = '<p>Failed to load documents.</p>';
            });
    }
    
    function openAddItemModal(itemType, projectId) {
        const modalElement = document.getElementById('eventModal');
        if (!modalElement) {
            console.error("Modal element #eventModal not found in DOM.");
            alert("Error: Modal not found.");
            return;
        }
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('eventModalLabel');
        const saveEventButton = document.getElementById('saveEventButton');

        // Get all form groups and input elements. Assumes specific IDs.
        const titleGroup = document.getElementById('eventTitleInput').parentElement; // .form-group
        const descriptionGroup = document.getElementById('eventDescriptionInput').parentElement;
        const dateGroup = document.getElementById('eventDateInput').parentElement; // contains selectedDateDisplay and eventDateInput
        const startTimeGroup = document.getElementById('eventStartTimeInput').parentElement;
        const endTimeGroup = document.getElementById('eventEndTimeInput').parentElement;
        
        // Additional fields needed for parts, tasks, docs (to be created or ensure they exist if reusing)
        // For simplicity, we'll reuse existing ones and change labels, or assume they are generic enough.
        // It's better to have dedicated fields or a more flexible modal form.
        // For this iteration, we'll make do and primarily adjust visibility and labels.

        // Reset/hide all potentially used fields first
        [titleGroup, descriptionGroup, dateGroup, startTimeGroup, endTimeGroup].forEach(el => el.style.display = 'none');
        
        // Clear input values
        document.getElementById('eventTitleInput').value = '';
        document.getElementById('eventDescriptionInput').value = '';
        document.getElementById('eventDateInput').value = ''; // Might not be used directly
        document.getElementById('eventStartTimeInput').value = '';
        document.getElementById('eventEndTimeInput').value = '';

        // Specific fields for Parts (reuse eventTitle for Name, eventDescription for Specs)
        const quantityInput = document.getElementById('partQuantityInput') || createModalInput('partQuantityInput', 'Quantity', 'number', titleGroup.parentElement);
        const supplierInput = document.getElementById('partSupplierInput') || createModalInput('partSupplierInput', 'Supplier', 'text', titleGroup.parentElement);
        quantityInput.parentElement.style.display = 'none'; // Hide by default
        supplierInput.parentElement.style.display = 'none'; // Hide by default

        // Specific field for Document Content (reuse eventDescriptionInput for now, or create a dedicated one)
        // For a better UX, a larger textarea for document content would be ideal.
        // We will ensure eventDescriptionInput is visible and relabelled for document content.

        let saveFunction;

        switch (itemType) {
            case 'part':
                modalTitle.textContent = 'Add New Part';
                titleGroup.style.display = 'block';
                document.querySelector('label[for="eventTitleInput"]').textContent = 'Part Name:';
                document.getElementById('eventTitleInput').placeholder = 'Enter part name';

                quantityInput.parentElement.style.display = 'block'; // Show quantity
                document.getElementById('partQuantityInput').value = '1';

                descriptionGroup.style.display = 'block';
                document.querySelector('label[for="eventDescriptionInput"]').textContent = 'Specifications:';
                document.getElementById('eventDescriptionInput').placeholder = 'Enter specifications';
                
                supplierInput.parentElement.style.display = 'block'; // Show supplier
                document.getElementById('partSupplierInput').value = '';

                saveFunction = () => {
                    const partData = {
                        name: document.getElementById('eventTitleInput').value.trim(),
                        quantity: parseInt(document.getElementById('partQuantityInput').value) || 1,
                        specifications: document.getElementById('eventDescriptionInput').value.trim(),
                        supplier: document.getElementById('partSupplierInput').value.trim()
                    };
                    if (!partData.name) { alert('Part name is required.'); return; }
                    projectService.createPart(projectId, partData)
                        .then(() => { modal.hide(); loadAndRenderParts(projectId); })
                        .catch(err => alert(`Error creating part: ${err.message}`));
                };
                break;
            case 'task':
                modalTitle.textContent = 'Add New Task';
                titleGroup.style.display = 'block';
                document.querySelector('label[for="eventTitleInput"]').textContent = 'Task Name:';
                document.getElementById('eventTitleInput').placeholder = 'Enter task name';

                descriptionGroup.style.display = 'block';
                document.querySelector('label[for="eventDescriptionInput"]').textContent = 'Task Description:';
                
                // For dates, we should use proper date pickers.
                // The original modal has eventDateInput (hidden) and selectedDateDisplay (static text)
                // and eventStartTimeInput, eventEndTimeInput.
                // We'll repurpose eventStartTimeInput for Start Date and eventEndTimeInput for End Date.
                // And eventDateInput for Status (temporary hack, ideally use a select dropdown).
                
                startTimeGroup.style.display = 'block';
                document.querySelector('label[for="eventStartTimeInput"]').textContent = 'Start Date (YYYY-MM-DD):';
                document.getElementById('eventStartTimeInput').type = 'date'; // Change to date type

                endTimeGroup.style.display = 'block';
                document.querySelector('label[for="eventEndTimeInput"]').textContent = 'End Date (YYYY-MM-DD):';
                document.getElementById('eventEndTimeInput').type = 'date'; // Change to date type
                
                dateGroup.style.display = 'block'; // Using this for Status
                document.querySelector('label[for="selectedDateDisplay"]').textContent = 'Status:'; // Relabel
                document.getElementById('selectedDateDisplay').style.display = 'none'; // Hide the static display
                document.getElementById('eventDateInput').type = 'text'; // Change input to text for status
                document.getElementById('eventDateInput').style.display = 'block'; // Make sure it's visible
                document.getElementById('eventDateInput').value = 'Pending';
                document.getElementById('eventDateInput').placeholder = 'e.g., Pending, In Progress, Completed';


                saveFunction = () => {
                    const taskData = {
                        name: document.getElementById('eventTitleInput').value.trim(),
                        description: document.getElementById('eventDescriptionInput').value.trim(),
                        start_date: document.getElementById('eventStartTimeInput').value,
                        end_date: document.getElementById('eventEndTimeInput').value,
                        status: document.getElementById('eventDateInput').value.trim() || 'Pending'
                    };
                    if (!taskData.name) { alert('Task name is required.'); return; }
                    projectService.createTask(projectId, taskData)
                        .then(() => { modal.hide(); loadAndRenderTasks(projectId); })
                        .catch(err => alert(`Error creating task: ${err.message}`));
                };
                break;
            case 'document':
                modalTitle.textContent = 'Add New Document';
                titleGroup.style.display = 'block';
                document.querySelector('label[for="eventTitleInput"]').textContent = 'Document Title:';
                document.getElementById('eventTitleInput').placeholder = 'Enter document title';

                descriptionGroup.style.display = 'block'; // For document content
                document.querySelector('label[for="eventDescriptionInput"]').textContent = 'Content:';
                document.getElementById('eventDescriptionInput').rows = 5; // Make textarea larger
                
                saveFunction = () => {
                    const docData = {
                        title: document.getElementById('eventTitleInput').value.trim(),
                        content: document.getElementById('eventDescriptionInput').value.trim()
                    };
                    if (!docData.title) { alert('Document title is required.'); return; }
                    projectService.createDocument(projectId, docData)
                        .then(() => { modal.hide(); loadAndRenderDocuments(projectId); })
                        .catch(err => alert(`Error creating document: ${err.message}`));
                };
                break;
            default:
                console.error('Unknown item type for modal:', itemType);
                return;
        }

        // Configure and show modal
        const newSaveButton = saveEventButton.cloneNode(true);
        saveEventButton.parentNode.replaceChild(newSaveButton, saveEventButton);
        newSaveButton.textContent = `Create ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
        newSaveButton.addEventListener('click', saveFunction);

        modal.show();
    }

    // Helper to create form inputs if they don't exist in the modal
    function createModalInput(id, labelText, type = 'text', parentElement) {
        let input = document.getElementById(id);
        if (!input) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = labelText;
            
            input = document.createElement('input');
            input.type = type;
            input.className = 'form-control';
            input.id = id;
            if (type === 'number') input.min = '0';

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            // Insert after the description field, or adjust as needed
            const descriptionField = document.getElementById('eventDescriptionInput');
            parentElement.insertBefore(formGroup, descriptionField.parentElement.nextSibling);
        }
        return input;
    }


    window.addEventListener('hashchange', function() {
        loadView(window.location.hash);
    });

    // Load initial view based on current hash (or default if no hash)
    loadView(window.location.hash); 
});
