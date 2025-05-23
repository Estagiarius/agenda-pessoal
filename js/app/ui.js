document.addEventListener('DOMContentLoaded', function() {
  var dateDisplayElement = document.getElementById('current-date-display');
  if (dateDisplayElement) {
    dateDisplayElement.textContent = moment().format('MMMM Do YYYY');
  }
});

// --- Question Bank UI Logic ---
const ui = (() => {
    let feedbackTimeout = null; // To manage clearing the feedback

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    function handleFilterChange() {
        const subjectFilter = document.getElementById('filter-subject').value;
        const difficultyFilter = document.getElementById('filter-difficulty').value;

        const filters = {};
        if (subjectFilter) filters.subject = subjectFilter;
        if (difficultyFilter) filters.difficulty = difficultyFilter;

        // Assuming renderQuestions and questionService are accessible
        renderQuestions(questionService.getQuestions(filters));
        // No need to call populateSubjectFilter here unless new subjects can be created by filtering.
    }

    function displayFeedback(message, type, containerId) {
        const feedbackContainer = document.getElementById(containerId);
        if (!feedbackContainer) return;

        // Clear any existing timeout
        if (feedbackTimeout) {
            clearTimeout(feedbackTimeout);
        }

        // Set message and classes
        feedbackContainer.textContent = message;
        feedbackContainer.className = ''; // Clear existing classes
        feedbackContainer.classList.add('alert'); // Base alert class
        feedbackContainer.style.display = 'block'; // Make it visible

        switch (type) {
            case 'success':
                feedbackContainer.classList.add('alert-success');
                break;
            case 'danger':
            case 'error': // Allow 'error' as an alias for 'danger'
                feedbackContainer.classList.add('alert-danger');
                break;
            case 'warning':
                feedbackContainer.classList.add('alert-warning');
                break;
            default:
                feedbackContainer.classList.add('alert-info');
                break;
        }

        // Automatically clear the message after 5 seconds
        feedbackTimeout = setTimeout(() => {
            feedbackContainer.textContent = '';
            feedbackContainer.style.display = 'none';
            feedbackContainer.className = ''; // Clear classes
        }, 5000);
    }

    // Helper function to render questions
    function renderQuestions(questionsToRender) {
        const questionsListDiv = document.getElementById('questions-list');
        if (!questionsListDiv) return; // Make sure the element exists

        questionsListDiv.innerHTML = ''; // Clear previous questions

        if (!questionsToRender || questionsToRender.length === 0) {
            questionsListDiv.innerHTML = '<p>No questions found matching your criteria. Try adding some!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'list-group'; // Bootstrap styling

        questionsToRender.forEach(question => {
            const li = document.createElement('li');
            // li.className = 'list-group-item'; // Old class
            li.className = 'list-group-item question-item-display'; // Added a new class for overall styling
            li.innerHTML = `
                <h5 class="question-text-display">${question.text}</h5>
                <div class="question-metadata">
                    <span><strong>Subject:</strong> ${question.subject}</span> | 
                    <span><strong>Difficulty:</strong> ${question.difficulty}</span>
                    <span style="float: right;"><em>ID: ${question.id}</em></span>
                </div>
                ${question.options && question.options.length > 0 ? 
                    '<div class="question-options-display"><strong>Options:</strong><ul>' + 
                    question.options.map(opt => `<li>${opt}</li>`).join('') + 
                    '</ul></div>' 
                    : ''}
                <div class="question-answer-display">
                    <strong>Answer:</strong> ${question.answer}
                </div>
            `;
            ul.appendChild(li);
        });
        questionsListDiv.appendChild(ul);
    }

    // Function to populate subject filter (currently a text input, but can be adapted for a select)
    function populateSubjectFilter() {
        // This function is a placeholder for if we change #filter-subject to a <select>
        // For now, it doesn't do much with a text input but demonstrates where to update subjects.
        const subjects = questionService.getAllSubjects();
        const filterSubjectDatalist = document.getElementById('subject-datalist'); // Assuming we add a datalist for suggestions
        
        if (filterSubjectDatalist) {
            filterSubjectDatalist.innerHTML = ''; // Clear existing options
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                filterSubjectDatalist.appendChild(option);
            });
        }
        // console.log("Available subjects for filter:", subjects);
    }

    // Helper function to update option labels and remove button visibility
    function updateOptionLabels() {
        const optionsContainer = document.getElementById('question-options-container');
        if (!optionsContainer) return;
        const optionDivs = optionsContainer.querySelectorAll('.dynamic-option');
        optionDivs.forEach((div, index) => {
            const label = div.querySelector('label');
            if (label) {
                label.textContent = `Option ${index + 1}:`;
            }
            const removeBtn = div.querySelector('.remove-option-btn');
            if (removeBtn) {
                removeBtn.style.display = optionDivs.length > 1 ? 'inline-block' : 'none';
            }
        });
    }

    // Function to handle adding a new option
    function addOption() {
        const optionsContainer = document.getElementById('question-options-container');
        if (!optionsContainer) return;

        const newOptionDiv = document.createElement('div');
        newOptionDiv.className = 'form-group dynamic-option';
        newOptionDiv.innerHTML = `
            <label>Option X:</label> <!-- Label will be updated by updateOptionLabels -->
            <div class="input-group">
                <input type="text" class="form-control question-option-input" placeholder="Option text">
                <span class="input-group-btn">
                    <button type="button" class="btn btn-danger remove-option-btn">Remove</button>
                </span>
            </div>
        `;
        optionsContainer.appendChild(newOptionDiv);
        updateOptionLabels();
    }
    
    // Function to set up event listeners for the Question Bank
    function initQuestionBankEventListeners() {
        const addQuestionForm = document.getElementById('add-question-form');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', event => {
                event.preventDefault();

                const text = document.getElementById('question-text').value;
                const subject = document.getElementById('question-subject').value;
                const difficulty = document.getElementById('question-difficulty').value;
                
                const options = [];
                const optionInputs = document.querySelectorAll('#question-options-container .question-option-input');
                optionInputs.forEach(input => {
                    if (input.value.trim() !== '') {
                        options.push(input.value.trim());
                    }
                });
                
                const answer = document.getElementById('question-answer').value;

                const requiredFields = [
                    { id: 'question-text', name: 'Question Text' },
                    { id: 'question-subject', name: 'Subject' },
                    { id: 'question-difficulty', name: 'Difficulty' },
                    { id: 'question-answer', name: 'Answer' }
                ];
                let isValid = true;
                let missingFields = [];
            
                // Clear previous validation states
                requiredFields.forEach(fieldConfig => {
                    const element = document.getElementById(fieldConfig.id);
                    if (element) {
                        element.classList.remove('is-invalid');
                    }
                });
                 // Also clear feedback for any previous general message
                 const feedbackContainer = document.getElementById('add-question-feedback');
                 if (feedbackContainer) {
                     feedbackContainer.textContent = '';
                     feedbackContainer.style.display = 'none';
                     feedbackContainer.className = '';
                     if (feedbackTimeout) { // feedbackTimeout is the global var for displayFeedback
                         clearTimeout(feedbackTimeout);
                     }
                 }
            
            
                // Check each required field
                requiredFields.forEach(fieldConfig => {
                    const element = document.getElementById(fieldConfig.id);
                    if (element && element.value.trim() === '') {
                        isValid = false;
                        element.classList.add('is-invalid');
                        missingFields.push(fieldConfig.name);
                    }
                });
            
                if (isValid) {
                    // Values are already captured (text, subject, difficulty, options, answer)
                    questionService.addQuestion(text, subject, difficulty, options, answer);
                    renderQuestions(questionService.getQuestions());
                    populateSubjectFilter(); // To update subject suggestions if a new subject was added
                    addQuestionForm.reset(); // Resets basic form inputs
            
                    // Custom reset for dynamic options (ensure this is handled correctly)
                    const optionsContainer = document.getElementById('question-options-container');
                    if (optionsContainer) {
                        optionsContainer.innerHTML = `
                            <div class="form-group dynamic-option">
                                <label>Option 1:</label>
                                <div class="input-group">
                                    <input type="text" class="form-control question-option-input" placeholder="Option text">
                                    <span class="input-group-btn">
                                        <button type="button" class="btn btn-danger remove-option-btn" style="display:none;">Remove</button>
                                    </span>
                                </div>
                            </div>
                        `;
                        updateOptionLabels(); // Ensure this function is accessible and correctly updates the single option
                    }
                    
                    displayFeedback('Question added successfully!', 'success', 'add-question-feedback');
                } else {
                    displayFeedback(`Please fill in all required fields: ${missingFields.join(', ')}.`, 'danger', 'add-question-feedback');
                }
            });
        }

        const formInputsToClearFeedback = ['question-text', 'question-subject', 'question-difficulty', 'question-answer'];
        formInputsToClearFeedback.forEach(inputId => {
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.addEventListener('focus', () => {
                    const feedbackContainer = document.getElementById('add-question-feedback');
                    if (feedbackContainer) {
                        feedbackContainer.textContent = '';
                        feedbackContainer.style.display = 'none';
                        feedbackContainer.className = '';
                        if (feedbackTimeout) {
                            clearTimeout(feedbackTimeout); // Also cancel auto-clear
                        }
                    }
                });
            }
        });
        // Listener for dynamically added option inputs
        const optionsContainerClearFeedback = document.getElementById('question-options-container');
        if (optionsContainerClearFeedback) {
            optionsContainerClearFeedback.addEventListener('focusin', (event) => { // focusin bubbles
                if (event.target.classList.contains('question-option-input')) {
                    const feedbackContainer = document.getElementById('add-question-feedback');
                    if (feedbackContainer && feedbackContainer.style.display !== 'none') {
                        feedbackContainer.textContent = '';
                        feedbackContainer.style.display = 'none';
                        feedbackContainer.className = '';
                        if (feedbackTimeout) {
                            clearTimeout(feedbackTimeout);
                        }
                    }
                }
            });
        }


        const addOptionBtn = document.getElementById('add-option-btn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', addOption);
        }

        const optionsContainerElement = document.getElementById('question-options-container');
        if (optionsContainerElement) {
            optionsContainerElement.addEventListener('click', event => {
                if (event.target.classList.contains('remove-option-btn')) {
                    // Check if it's not the last option before removing
                    const currentOptions = optionsContainerElement.querySelectorAll('.dynamic-option');
                    if (currentOptions.length > 1) {
                        const optionToRemove = event.target.closest('.dynamic-option');
                        if (optionToRemove) {
                            optionToRemove.remove();
                            updateOptionLabels();
                        }
                    } else {
                        // Optionally, clear the input if it's the last one instead of removing
                        const inputToClear = event.target.closest('.dynamic-option').querySelector('.question-option-input');
                        if (inputToClear) inputToClear.value = '';
                    }
                }
            });
        }

        /*
        const applyFiltersButton = document.getElementById('apply-filters-button');
        if (applyFiltersButton) {
            applyFiltersButton.addEventListener('click', () => {
                const subjectFilter = document.getElementById('filter-subject').value;
                const difficultyFilter = document.getElementById('filter-difficulty').value;

                const filters = {};
                if (subjectFilter) filters.subject = subjectFilter;
                if (difficultyFilter) filters.difficulty = difficultyFilter;

                renderQuestions(questionService.getQuestions(filters));
            });
        }
        */

        const subjectFilterInput = document.getElementById('filter-subject');
        if (subjectFilterInput) {
            subjectFilterInput.addEventListener('input', debounce(handleFilterChange, 300));
        }

        const difficultyFilterSelect = document.getElementById('filter-difficulty');
        if (difficultyFilterSelect) {
            difficultyFilterSelect.addEventListener('change', handleFilterChange);
        }
        // Initial call to set up labels and remove button visibility for the first option
        updateOptionLabels();
    }

    // Function to be called by the router when the question bank view is shown
    function showQuestionBank() {
        const questionBankView = document.getElementById('question-bank-view');
        if (questionBankView) {
            questionBankView.style.display = 'block';
            renderQuestions(questionService.getQuestions());
            populateSubjectFilter();
            initQuestionBankEventListeners(); // Set up listeners when view is shown
        }
        // Hide other views if necessary (e.g., home view)
        const homeView = document.getElementById('home-view'); // Assuming 'home-view' is the ID for the home content
        if (homeView) {
            homeView.style.display = 'none';
        }
    }

    // Function to hide the question bank view (called by router)
    function hideQuestionBank() {
        const questionBankView = document.getElementById('question-bank-view');
        if (questionBankView) {
            questionBankView.style.display = 'none';
        }
    }
    
    // Public API for ui module related to question bank
    return {
        showQuestionBank,
        hideQuestionBank,
        renderQuestions // Exposing this if needed directly by other modules, e.g. router.
    };

})();
