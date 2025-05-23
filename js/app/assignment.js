// js/app/assignment.js
function initAssignmentsPage() {
    // console.log('Initializing Assignments Page...');

    // DOM Elements
    const classFilterSelect = document.getElementById('classFilterSelect');
    const markClassGradedButton = document.getElementById('markClassGradedButton');
    const addAssignmentForm = document.getElementById('addAssignmentForm');
    const assignmentClassSelect = document.getElementById('assignmentClassSelect'); // For the form
    const assignmentTitleInput = document.getElementById('assignmentTitleInput');
    const assignmentDescriptionInput = document.getElementById('assignmentDescriptionInput');
    const assignmentDueDateInput = document.getElementById('assignmentDueDateInput');
    const assignmentsListArea = document.getElementById('assignmentsListArea');
    const selectedClassNameDisplay = document.getElementById('selectedClassNameDisplay');

    if (!classFilterSelect || !markClassGradedButton || !addAssignmentForm || !assignmentClassSelect || !assignmentsListArea || !selectedClassNameDisplay) {
        console.error('One or more required elements for Assignments page not found.');
        return;
    }

    let currentFilteredClassId = null;

    // --- Populate Class Selectors ---
    function populateClassSelectors() {
        const classes = window.classService.getClasses();
        classFilterSelect.innerHTML = '<option value="">-- Select Class to Filter --</option>'; // Default prompt
        assignmentClassSelect.innerHTML = '<option value="">-- Select Class --</option>'; // Default prompt for form

        classes.forEach(cls => {
            const optionFilter = new Option(cls.name, cls.id);
            classFilterSelect.appendChild(optionFilter);

            const optionForm = new Option(cls.name, cls.id);
            assignmentClassSelect.appendChild(optionForm);
        });

        if (classes.length > 0) {
            // currentFilteredClassId = classes[0].id; // Optionally default to the first class
            // renderAssignments(currentFilteredClassId);
            // updateMarkGradedButtonText(classes[0].name);
        }
    }

    // --- Render Assignments ---
    function renderAssignments(classId) {
        assignmentsListArea.innerHTML = ''; // Clear previous list
        if (!classId) {
            selectedClassNameDisplay.textContent = '[No Class Selected]';
            assignmentsListArea.innerHTML = '<p>Please select a class to view assignments.</p>';
            return;
        }

        const assignments = window.assignmentService.getAssignmentsByClass(classId);
        const selectedClass = window.classService.getClasses().find(c => c.id == classId);
        selectedClassNameDisplay.textContent = selectedClass ? selectedClass.name : '[Unknown Class]';
        
        if (assignments.length === 0) {
            assignmentsListArea.innerHTML = '<p>No assignments found for this class.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'list-group';
        assignments.forEach(assignment => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                <h5>${assignment.title} (Due: ${assignment.dueDate})</h5>
                <p>${assignment.description || ''}</p>
                <p><strong>Status:</strong> ${assignment.status}</p>
                {/* Add buttons for individual status update later if needed */}
            `;
            ul.appendChild(li);
        });
        assignmentsListArea.appendChild(ul);
    }
    
    function updateMarkGradedButtonText(className) {
        if(className && className !== '[No Class Selected]' && className !== '[Unknown Class]') {
             markClassGradedButton.textContent = `Mark All Assignments as Graded for ${className}`;
             markClassGradedButton.disabled = false;
        } else {
             markClassGradedButton.textContent = 'Mark All Assignments as Graded for Selected Class';
             markClassGradedButton.disabled = true;
        }
    }

    // --- Event Listeners ---
    if (!classFilterSelect.dataset.listenerAttached) {
        classFilterSelect.addEventListener('change', function() {
            currentFilteredClassId = this.value ? parseInt(this.value) : null;
            renderAssignments(currentFilteredClassId);
            const selectedClass = window.classService.getClasses().find(c => c.id == currentFilteredClassId);
            updateMarkGradedButtonText(selectedClass ? selectedClass.name : null);
        });
        classFilterSelect.dataset.listenerAttached = 'true';
    }

    if (!addAssignmentForm.dataset.listenerAttached) {
        addAssignmentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const classId = assignmentClassSelect.value;
            const title = assignmentTitleInput.value.trim();
            const description = assignmentDescriptionInput.value.trim();
            const dueDate = assignmentDueDateInput.value;

            if (!classId || !title || !dueDate) {
                alert('Please select a class, enter a title, and pick a due date.');
                return;
            }
            window.assignmentService.addAssignment({ classId, title, description, dueDate });
            addAssignmentForm.reset(); // Clear form
            assignmentClassSelect.value = classId; // Keep class selected if user is adding multiple for same class
            if (currentFilteredClassId && parseInt(classId) === parseInt(currentFilteredClassId)) {
                 renderAssignments(currentFilteredClassId); // Refresh list if it's the currently viewed class
            } else if (!currentFilteredClassId && assignmentClassSelect.options.length > 0) {
                // If no class was filtered, but we added an assignment, perhaps filter to its class
                // classFilterSelect.value = classId; // This would trigger the change event
                // currentFilteredClassId = parseInt(classId);
                // renderAssignments(currentFilteredClassId);
                // const selectedClass = window.classService.getClasses().find(c => c.id == currentFilteredClassId);
                // updateMarkGradedButtonText(selectedClass ? selectedClass.name : null);
            }
        });
        addAssignmentForm.dataset.listenerAttached = 'true';
    }
    
    if (!markClassGradedButton.dataset.listenerAttached) {
        markClassGradedButton.addEventListener('click', function() {
            if (!currentFilteredClassId) {
                alert('Please select a class first.');
                return;
            }
            const success = window.assignmentService.markAllAssignmentsGradedForClass(currentFilteredClassId);
            if (success) {
                // alert('All assignments for the selected class marked as graded.');
                renderAssignments(currentFilteredClassId); // Refresh to show updated statuses
            } else {
                // alert('No assignments found or already graded for this class.');
            }
        });
        markClassGradedButton.dataset.listenerAttached = 'true';
    }

    // --- Initial Setup ---
    populateClassSelectors();
    // Optionally, trigger the first render if a default class is selected or based on first option
    if (classFilterSelect.options.length > 1 && classFilterSelect.value) { // if more than the default prompt and a value is selected
        currentFilteredClassId = parseInt(classFilterSelect.value);
        renderAssignments(currentFilteredClassId);
        const selectedClass = window.classService.getClasses().find(c => c.id == currentFilteredClassId);
        updateMarkGradedButtonText(selectedClass ? selectedClass.name : null);
    } else {
        renderAssignments(null); // Render empty state
        updateMarkGradedButtonText(null); // Disable button
    }
}
