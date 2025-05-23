document.addEventListener('DOMContentLoaded', function() {
  var dateDisplayElement = document.getElementById('current-date-display');
  if (dateDisplayElement) {
    dateDisplayElement.textContent = moment().format('MMMM Do YYYY');
  }
});

// --- Question Bank UI Logic ---
const ui = (() => {
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
            li.className = 'list-group-item';
            li.innerHTML = `
                <h4>${question.text} (ID: ${question.id})</h4>
                <p><strong>Subject:</strong> ${question.subject}</p>
                <p><strong>Difficulty:</strong> ${question.difficulty}</p>
                ${question.options && question.options.length > 0 ?
                    '<p><strong>Options:</strong></p><ul>' +
                    question.options.map(opt => `<li>${opt}</li>`).join('') +
                    '</ul>'
                    : ''}
                <p><strong>Answer:</strong> ${question.answer}</p>
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
    
    // Function to set up event listeners for the Question Bank
    function initQuestionBankEventListeners() {
        const addQuestionForm = document.getElementById('add-question-form');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', event => {
                event.preventDefault();

                const text = document.getElementById('question-text').value;
                const subject = document.getElementById('question-subject').value;
                const difficulty = document.getElementById('question-difficulty').value;
                const options = [
                    document.getElementById('question-option-1').value,
                    document.getElementById('question-option-2').value,
                    document.getElementById('question-option-3').value,
                    document.getElementById('question-option-4').value,
                ].filter(opt => opt.trim() !== ''); // Only include non-empty options
                const answer = document.getElementById('question-answer').value;

                if (text && subject && difficulty && answer) {
                    questionService.addQuestion(text, subject, difficulty, options, answer);
                    renderQuestions(questionService.getQuestions()); // Refresh list
                    populateSubjectFilter(); // Update subject suggestions
                    addQuestionForm.reset(); // Clear form
                } else {
                    alert('Please fill in all required fields (Question Text, Subject, Difficulty, Answer).');
                }
            });
        }

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
