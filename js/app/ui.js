document.addEventListener('DOMContentLoaded', function() {
  var dateDisplayElement = document.getElementById('current-date-display');
  if (dateDisplayElement) {
    dateDisplayElement.textContent = moment().format('MMMM Do YYYY');
  }
});

// --- Question Bank UI Logic ---
const ui = (() => {
    let feedbackTimeout = null; // To manage clearing the feedback
    let currentQuestionIndex = 0;
    let quizTakingListenersAttached = false; // Prevent multiple attachments
    let quizResultsListenersAttached = false; // New state variable

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

        renderQuestions(questionService.getQuestions(filters));
    }

    function displayFeedback(message, type, containerId) {
        const feedbackContainer = document.getElementById(containerId);
        if (!feedbackContainer) return;

        if (feedbackTimeout) {
            clearTimeout(feedbackTimeout);
        }

        feedbackContainer.textContent = message;
        feedbackContainer.className = ''; 
        feedbackContainer.classList.add('alert'); 
        feedbackContainer.style.display = 'block'; 

        switch (type) {
            case 'success':
                feedbackContainer.classList.add('alert-success');
                break;
            case 'danger':
            case 'error': 
                feedbackContainer.classList.add('alert-danger');
                break;
            case 'warning':
                feedbackContainer.classList.add('alert-warning');
                break;
            default:
                feedbackContainer.classList.add('alert-info');
                break;
        }

        feedbackTimeout = setTimeout(() => {
            feedbackContainer.textContent = '';
            feedbackContainer.style.display = 'none';
            feedbackContainer.className = ''; 
        }, 5000);
    }

    function renderQuestions(questionsToRender) {
        const questionsListDiv = document.getElementById('questions-list');
        if (!questionsListDiv) return; 

        questionsListDiv.innerHTML = ''; 

        if (!questionsToRender || questionsToRender.length === 0) {
            questionsListDiv.innerHTML = '<p>No questions found matching your criteria. Try adding some!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'list-group'; 

        questionsToRender.forEach(question => {
            const li = document.createElement('li');
            li.className = 'list-group-item question-item-display'; 
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

    function populateSubjectFilter() {
        const subjects = questionService.getAllSubjects();
        const filterSubjectDatalist = document.getElementById('subject-datalist'); 
        
        if (filterSubjectDatalist) {
            filterSubjectDatalist.innerHTML = ''; 
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                filterSubjectDatalist.appendChild(option);
            });
        }
    }

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

    function addOption() {
        const optionsContainer = document.getElementById('question-options-container');
        if (!optionsContainer) return;

        const newOptionDiv = document.createElement('div');
        newOptionDiv.className = 'form-group dynamic-option';
        newOptionDiv.innerHTML = `
            <label>Option X:</label> 
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
            
                requiredFields.forEach(fieldConfig => {
                    const element = document.getElementById(fieldConfig.id);
                    if (element) {
                        element.classList.remove('is-invalid');
                    }
                });
                 const feedbackContainer = document.getElementById('add-question-feedback');
                 if (feedbackContainer) {
                     feedbackContainer.textContent = '';
                     feedbackContainer.style.display = 'none';
                     feedbackContainer.className = '';
                     if (feedbackTimeout) { 
                         clearTimeout(feedbackTimeout);
                     }
                 }
            
                requiredFields.forEach(fieldConfig => {
                    const element = document.getElementById(fieldConfig.id);
                    if (element && element.value.trim() === '') {
                        isValid = false;
                        element.classList.add('is-invalid');
                        missingFields.push(fieldConfig.name);
                    }
                });
            
                if (isValid) {
                    questionService.addQuestion(text, subject, difficulty, options, answer);
                    renderQuestions(questionService.getQuestions());
                    populateSubjectFilter(); 
                    addQuestionForm.reset(); 
            
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
                        updateOptionLabels(); 
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
                            clearTimeout(feedbackTimeout); 
                        }
                    }
                });
            }
        });
        const optionsContainerClearFeedback = document.getElementById('question-options-container');
        if (optionsContainerClearFeedback) {
            optionsContainerClearFeedback.addEventListener('focusin', (event) => { 
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
                    const currentOptions = optionsContainerElement.querySelectorAll('.dynamic-option');
                    if (currentOptions.length > 1) {
                        const optionToRemove = event.target.closest('.dynamic-option');
                        if (optionToRemove) {
                            optionToRemove.remove();
                            updateOptionLabels();
                        }
                    } else {
                        const inputToClear = event.target.closest('.dynamic-option').querySelector('.question-option-input');
                        if (inputToClear) inputToClear.value = '';
                    }
                }
            });
        }

        const subjectFilterInput = document.getElementById('filter-subject');
        if (subjectFilterInput) {
            subjectFilterInput.addEventListener('input', debounce(handleFilterChange, 300));
        }

        const difficultyFilterSelect = document.getElementById('filter-difficulty');
        if (difficultyFilterSelect) {
            difficultyFilterSelect.addEventListener('change', handleFilterChange);
        }
        updateOptionLabels();
    }

    function showQuestionBank() {
        const questionBankView = document.getElementById('question-bank-view');
        if (questionBankView) {
            questionBankView.style.display = 'block';
            renderQuestions(questionService.getQuestions());
            populateSubjectFilter();
            initQuestionBankEventListeners(); 
        }
        const homeView = document.getElementById('home-view'); 
        if (homeView) {
            homeView.style.display = 'none';
        }
    }

    function hideQuestionBank() {
        const questionBankView = document.getElementById('question-bank-view');
        if (questionBankView) {
            questionBankView.style.display = 'none';
        }
    }
    
    // ---- Quiz Configuration UI Logic ----

    function populateQuizSubjectFilter() {
        const subjectSelect = document.getElementById('quiz-subject');
        if (!subjectSelect) return;

        subjectSelect.innerHTML = '<option value="">All Subjects</option>'; 
        if (typeof questionService === 'undefined' || typeof questionService.getAllSubjects !== 'function') {
            console.error('questionService or getAllSubjects is not available for populating quiz subjects.');
            return;
        }
        const subjects = questionService.getAllSubjects();
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }

    function initQuizConfigEventListeners() {
        const quizConfigForm = document.getElementById('quiz-config-form');
        if (quizConfigForm) {
            if (quizConfigForm.dataset.listenerAttached) return;

            quizConfigForm.addEventListener('submit', event => {
                event.preventDefault();
                const numQuestions = document.getElementById('quiz-num-questions').value;
                const subject = document.getElementById('quiz-subject').value;
                const difficulty = document.getElementById('quiz-difficulty').value;
                
                const generatedQuestions = quizService.generateQuiz({ 
                    numQuestions: numQuestions, 
                    subject: subject, 
                    difficulty: difficulty 
                });
    
                if (generatedQuestions && generatedQuestions.length > 0) {
                    window.location.hash = '#/quiz/take'; 
                } else {
                    displayFeedback('No questions found matching your criteria. Please try different options or add more questions.', 'warning', 'quiz-config-feedback');
                }
            });
            quizConfigForm.dataset.listenerAttached = 'true'; 
        }
    }

    function showQuizConfigView() {
        const quizConfigView = document.getElementById('quiz-config-view');
        if (quizConfigView) quizConfigView.style.display = 'block';
        
        const viewsToHide = ['question-bank-view', 'quiz-taking-view', 'quiz-results-view', 'home-view'];
        viewsToHide.forEach(viewId => {
            const viewToHide = document.getElementById(viewId);
            if(viewToHide) viewToHide.style.display = 'none';
        });

        populateQuizSubjectFilter();
        initQuizConfigEventListeners();
    }

    function hideQuizConfigView() {
        const quizConfigView = document.getElementById('quiz-config-view');
        if (quizConfigView) {
            quizConfigView.style.display = 'none';
        }
    }

    // --- Quiz Taking UI Logic ---

    function renderCurrentQuizQuestion() {
        const questions = quizService.getCurrentQuizQuestions();
        if (!questions || questions.length === 0 || currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
            displayFeedback("Error: No questions in quiz or index out of bounds.", "danger", "quiz-taking-feedback");
            return;
        }

        const question = questions[currentQuestionIndex];
        const questionTextEl = document.getElementById('quiz-question-text');
        const progressIndicatorEl = document.getElementById('quiz-progress-indicator');
        const optionsContainerEl = document.getElementById('quiz-options-container');

        if(questionTextEl) questionTextEl.textContent = question.text;
        if(progressIndicatorEl) progressIndicatorEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

        if(optionsContainerEl) {
            optionsContainerEl.innerHTML = ''; 

            if (question.options && question.options.length > 0) {
                question.options.forEach((option, index) => {
                    const div = document.createElement('div');
                    div.className = 'form-check'; 
                    const inputId = `quiz_option_${index}`;
                    const escapedOption = option.replace(/"/g, '&quot;');
                    div.innerHTML = `
                        <input class="form-check-input" type="radio" name="quiz_option" id="${inputId}" value="${escapedOption}">
                        <label class="form-check-label" for="${inputId}">${option}</label>
                    `;
                    optionsContainerEl.appendChild(div);
                });
            } else {
                optionsContainerEl.innerHTML = '<p>This question may require a different answer format (not multiple choice).</p>';
            }
            
            const userAnswers = quizService.getUserAnswers();
            if (userAnswers[currentQuestionIndex] !== null) {
                 const escapedAnswer = userAnswers[currentQuestionIndex].replace(/"/g, '&quot;');
                const selectedRadio = optionsContainerEl.querySelector(`input[name="quiz_option"][value="${escapedAnswer}"]`);
                if (selectedRadio) {
                    selectedRadio.checked = true;
                }
            }
        }

        const prevBtn = document.getElementById('quiz-prev-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        const submitBtn = document.getElementById('quiz-submit-btn');

        if(prevBtn) prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
        if(nextBtn) nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'inline-block' : 'none';
        if(submitBtn) submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
    }

    function initQuizTakingEventListeners() {
        if (quizTakingListenersAttached) return;

        document.getElementById('quiz-next-btn').addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="quiz_option"]:checked');
            quizService.recordAnswer(currentQuestionIndex, selectedOption ? selectedOption.value : null);
            const questions = quizService.getCurrentQuizQuestions(); 
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                renderCurrentQuizQuestion();
            }
        });

        document.getElementById('quiz-prev-btn').addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="quiz_option"]:checked');
            quizService.recordAnswer(currentQuestionIndex, selectedOption ? selectedOption.value : null);
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderCurrentQuizQuestion();
            }
        });

        document.getElementById('quiz-submit-btn').addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="quiz_option"]:checked');
            quizService.recordAnswer(currentQuestionIndex, selectedOption ? selectedOption.value : null);
            
            quizService.submitQuiz(); 
            window.location.hash = '#/quiz/results'; 
        });
        quizTakingListenersAttached = true;
    }

    function showQuizTakingView() {
        currentQuestionIndex = 0; 
        const questions = quizService.getCurrentQuizQuestions();

        if (!questions || questions.length === 0) {
            displayFeedback("No quiz loaded. Please configure a quiz first.", "warning", "quiz-config-feedback");
            window.location.hash = '#/quiz-config';
            return; 
        }
        
        const quizTakingView = document.getElementById('quiz-taking-view');
        if (quizTakingView) quizTakingView.style.display = 'block';
        
        const viewsToHide = ['quiz-config-view', 'question-bank-view', 'quiz-results-view', 'home-view'];
        viewsToHide.forEach(viewId => {
            const viewToHide = document.getElementById(viewId);
            if(viewToHide) viewToHide.style.display = 'none';
        });

        renderCurrentQuizQuestion();
        initQuizTakingEventListeners(); 
    }

    function hideQuizTakingView() {
        const view = document.getElementById('quiz-taking-view');
        if (view) view.style.display = 'none';
    }

    // --- Quiz Results UI Logic ---

    function renderQuizResults(resultsData) {
        const scoreSummaryEl = document.getElementById('quiz-score-summary');
        const reviewAreaEl = document.getElementById('quiz-detailed-review-area');

        if (!resultsData || !scoreSummaryEl || !reviewAreaEl) {
            console.error("Results data or DOM elements missing for rendering results.");
            if (scoreSummaryEl) scoreSummaryEl.innerHTML = '';
            if (reviewAreaEl) reviewAreaEl.innerHTML = '<h3>Detailed Review:</h3><p>Could not load results data.</p>';
            return;
        }

        const percentage = resultsData.totalQuestions > 0 ? (resultsData.score / resultsData.totalQuestions * 100).toFixed(0) : 0;
        scoreSummaryEl.innerHTML = `Your Score: ${resultsData.score} / ${resultsData.totalQuestions} (${percentage}%)`;

        reviewAreaEl.innerHTML = '<h3>Detailed Review:</h3>'; 
        const ul = document.createElement('ul');
        ul.className = 'list-group';

        resultsData.results.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item quiz-review-item mb-2'; 
            
            const escapeHTML = str => str ? str.replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[match]) : '';

            let optionsHtml = '';
            if (item.options && item.options.length > 0) {
                optionsHtml = '<ul class="list-unstyled quiz-review-options mt-2">'; 
                item.options.forEach(opt => {
                    const escapedOpt = escapeHTML(opt);
                    let optClass = '';
                    let indicators = '';
                    if (opt === item.userAnswer && item.userAnswer === item.correctAnswer) {
                        optClass = 'text-success font-weight-bold';
                        indicators = ' <em>(Correct, Your Answer)</em>';
                    } else if (opt === item.userAnswer && item.userAnswer !== item.correctAnswer) {
                        optClass = 'text-danger font-weight-bold';
                        indicators = ' <em>(Your Answer)</em>';
                    } else if (opt === item.correctAnswer) {
                        optClass = 'text-info'; 
                        indicators = ' <em>(Correct Answer)</em>';
                    }
                    optionsHtml += `<li class="${optClass}">${escapedOpt}${indicators}</li>`;
                });
                optionsHtml += '</ul>';
            }
            
            const userAnswerDisplay = item.userAnswer ? escapeHTML(item.userAnswer) : 'Not answered';
            const correctAnswerDisplay = escapeHTML(item.correctAnswer);

            li.innerHTML = `
                <p class="font-weight-bold mb-1"><strong>Q${index + 1}: ${escapeHTML(item.questionText)}</strong></p>
                ${optionsHtml}
                <p class="mt-2 mb-1">Your answer: <span class="${item.isCorrect ? 'text-success' : 'text-danger'} font-weight-bold">${userAnswerDisplay}</span></p>
                ${!item.isCorrect ? `<p class="mb-0">Correct answer: <span class="text-info font-weight-bold">${correctAnswerDisplay}</span></p>` : ''}
            `;
            
            li.classList.add(item.isCorrect ? 'border-success' : 'border-danger');
            ul.appendChild(li);
        });
        reviewAreaEl.appendChild(ul);
    }

    function initQuizResultsEventListeners() {
        if (quizResultsListenersAttached) return;

        document.getElementById('retake-quiz-btn').addEventListener('click', () => {
            if (typeof quizService !== 'undefined' && typeof quizService.resetQuiz === 'function') {
               quizService.resetQuiz();
            }
            window.location.hash = '#/quiz-config';
        });

        document.getElementById('back-to-qbank-btn').addEventListener('click', () => {
             if (typeof quizService !== 'undefined' && typeof quizService.resetQuiz === 'function') {
                quizService.resetQuiz(); 
             }
            window.location.hash = '#/questions';
        });
        quizResultsListenersAttached = true;
    }

    function showQuizResultsView() {
        const resultsData = quizService.getQuizResults();

        if (!resultsData) {
            displayFeedback("No quiz results found. Please take a quiz first.", "warning", "quiz-config-feedback");
            window.location.hash = '#/quiz-config';
            return;
        }
        
        const resultsView = document.getElementById('quiz-results-view');
        if (resultsView) resultsView.style.display = 'block';
        
        const viewsToHide = ['quiz-config-view', 'quiz-taking-view', 'question-bank-view', 'home-view']; 
         viewsToHide.forEach(viewId => {
            const viewToHide = document.getElementById(viewId); 
            if(viewToHide) viewToHide.style.display = 'none';
         });
        
        const mainContentArea = document.getElementById('main-content-area');
        if (mainContentArea && mainContentArea.contains(document.getElementById('quiz-results-view'))) {
            // This logic isn't strictly necessary with current router setup
        }


        renderQuizResults(resultsData);
        initQuizResultsEventListeners();
    }

    function hideQuizResultsView() {
        const view = document.getElementById('quiz-results-view');
        if (view) view.style.display = 'none';
    }

    // Update the main return object for the UI module
    return {
        showQuestionBank,
        hideQuestionBank,
        renderQuestions,
        showQuizConfigView,
        hideQuizConfigView,
        showQuizTakingView,
        hideQuizTakingView,
        showQuizResultsView, // New
        hideQuizResultsView  // New
    };
})();
