document.addEventListener('DOMContentLoaded', function() {
  var dateDisplayElement = document.getElementById('current-date-display');
  if (dateDisplayElement) {
    dateDisplayElement.textContent = moment().format('MMMM Do YYYY');
  }
});

// --- Funções de Feedback Visual ---

/**
 * Exibe um toast de notificação.
 * @param {string} message - A mensagem a ser exibida.
 */
window.showToast = function(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

/**
 * Exibe um modal de confirmação.
 * @param {string} message - A mensagem de confirmação.
 * @param {function} callback - A função a ser executada se o usuário confirmar.
 */
window.showConfirmationModal = function(message, callback, options = {}) {
    const modal = $('#confirmationModal');
    const modalBody = document.getElementById('confirmationModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const confirmationInputGroup = document.getElementById('confirmation-input-group');
    const confirmationInput = document.getElementById('confirmation-input');

    modalBody.innerHTML = message; // Use innerHTML to allow for HTML in the message

    if (options.requireInput) {
        confirmationInputGroup.style.display = 'block';
        confirmationInput.value = '';
        confirmBtn.disabled = true;

        confirmationInput.onkeyup = function() {
            if (confirmationInput.value === options.requireInput) {
                confirmBtn.disabled = false;
            } else {
                confirmBtn.disabled = true;
            }
        };
    } else {
        confirmationInputGroup.style.display = 'none';
        confirmBtn.disabled = false;
    }

    // Remove qualquer listener anterior para evitar múltiplas execuções
    $(confirmBtn).off('click');

    $(confirmBtn).on('click', function() {
        callback();
        modal.modal('hide');
    });

    modal.modal('show');
}


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

    async function handleFilterChange() {
        const subjectFilter = document.getElementById('filter-subject').value;
        const difficultyFilter = document.getElementById('filter-difficulty').value;

        const filters = {};
        if (subjectFilter) filters.subject = subjectFilter;
        if (difficultyFilter) filters.difficulty = difficultyFilter;

        const questions = await questionService.getQuestions(filters);
        renderQuestions(questions);
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
            questionsListDiv.innerHTML = '<p>Nenhuma pergunta encontrada com os seus critérios. Tente adicionar algumas!</p>';
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
                    <span><strong>Assunto:</strong> ${question.subject}</span> | 
                    <span><strong>Dificuldade:</strong> ${question.difficulty}</span>
                    <span style="float: right;"><em>ID: ${question.id}</em></span>
                </div>
                ${question.options && question.options.length > 0 ? 
                    '<div class="question-options-display"><strong>Opções:</strong><ul>' + 
                    question.options.map(opt => `<li>${opt}</li>`).join('') + 
                    '</ul></div>' 
                    : ''}
                <div class="question-answer-display">
                    <strong>Resposta:</strong> ${question.answer}
                </div>
            `;
            ul.appendChild(li);
        });
        questionsListDiv.appendChild(ul);
    }

    async function populateSubjectFilter() {
        try {
            const subjects = await questionService.getAllSubjects();
            const filterSubjectDatalist = document.getElementById('subject-datalist');

            if (filterSubjectDatalist) {
                filterSubjectDatalist.innerHTML = '';
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    filterSubjectDatalist.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Failed to populate subject filter:", error);
            displayFeedback("Falha ao carregar a lista de assuntos.", "error", "add-question-feedback");
        }
    }

    function updateOptionLabels() {
        const optionsContainer = document.getElementById('question-options-container');
        if (!optionsContainer) return;
        const optionDivs = optionsContainer.querySelectorAll('.dynamic-option');
        optionDivs.forEach((div, index) => {
            const label = div.querySelector('label');
            if (label) {
                label.textContent = `Opção ${index + 1}:`;
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
            <label>Opção X:</label> 
            <div class="input-group">
                <input type="text" class="form-control question-option-input" placeholder="Texto da opção">
                <span class="input-group-btn">
                    <button type="button" class="btn btn-danger remove-option-btn">Remover</button>
                </span>
            </div>
        `;
        optionsContainer.appendChild(newOptionDiv);
        updateOptionLabels();
    }
    
    function initQuestionBankEventListeners() {
        const addQuestionForm = document.getElementById('add-question-form');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', async event => { // Make listener async
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
                    { id: 'question-text', name: 'Texto da Pergunta' },
                    { id: 'question-subject', name: 'Assunto' },
                    { id: 'question-difficulty', name: 'Dificuldade' },
                    { id: 'question-answer', name: 'Resposta' }
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
                    try {
                        await questionService.addQuestion(text, subject, difficulty, options, answer);
                        const allQuestions = await questionService.getQuestions();
                        renderQuestions(allQuestions);
                        await populateSubjectFilter();
                        addQuestionForm.reset();

                        const optionsContainer = document.getElementById('question-options-container');
                        if (optionsContainer) {
                            optionsContainer.innerHTML = `
                                <div class="form-group dynamic-option">
                                    <label>Opção 1:</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control question-option-input" placeholder="Texto da opção">
                                        <span class="input-group-btn">
                                            <button type="button" class="btn btn-danger remove-option-btn" style="display:none;">Remover</button>
                                        </span>
                                    </div>
                                </div>
                            `;
                            updateOptionLabels();
                        }

                        displayFeedback('Pergunta adicionada com sucesso!', 'success', 'add-question-feedback');
                    } catch (error) {
                        console.error("Failed to add question:", error);
                        displayFeedback('Falha ao adicionar a pergunta. Verifique o console para mais detalhes.', 'danger', 'add-question-feedback');
                    }
                } else {
                    displayFeedback(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}.`, 'danger', 'add-question-feedback');
                }
            });
        }
                } else {
                    displayFeedback(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}.`, 'danger', 'add-question-feedback');
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

    async function showQuestionBank() {
        try {
            const questions = await questionService.getQuestions();
            renderQuestions(questions);
            await populateSubjectFilter();
            initQuestionBankEventListeners(); // This one doesn't need await as it just attaches listeners
        } catch (error) {
            console.error("Failed to show question bank:", error);
            displayFeedback("Falha ao carregar o banco de questões.", "error", "questions-list");
        }
    }

    function hideQuestionBank() {
        const questionBankView = document.getElementById('question-bank-view');
        if (questionBankView) {
            questionBankView.style.display = 'none';
        }
    }
    
    // ---- Quiz Configuration UI Logic ----

    async function populateQuizSubjectFilter() {
        const subjectSelect = document.getElementById('quiz-subject');
        if (!subjectSelect) return;

        subjectSelect.innerHTML = '<option value="">Todos os Assuntos</option>'; 
        try {
            const subjects = await questionService.getAllSubjects();
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to populate quiz subject filter:", error);
            displayFeedback("Falha ao carregar a lista de assuntos para o quiz.", "error", "quiz-config-feedback");
        }
    }

    function initQuizConfigEventListeners() {
        const quizConfigForm = document.getElementById('quiz-config-form');
        if (quizConfigForm) {
            if (quizConfigForm.dataset.listenerAttached) return;

            quizConfigForm.addEventListener('submit', async event => { // Make async
                event.preventDefault();
                const numQuestions = document.getElementById('quiz-num-questions').value;
                const subject = document.getElementById('quiz-subject').value;
                const difficulty = document.getElementById('quiz-difficulty').value;
                
                try {
                    const generatedQuestions = await quizService.generateQuiz({ // Await the async call
                        numQuestions: numQuestions,
                        subject: subject,
                        difficulty: difficulty
                    });

                    if (generatedQuestions && generatedQuestions.length > 0) {
                        window.location.hash = '#/quiz/take';
                    } else {
                        displayFeedback('Nenhuma pergunta encontrada com os seus critérios. Por favor, tente opções diferentes ou adicione mais perguntas.', 'warning', 'quiz-config-feedback');
                    }
                } catch (error) {
                    console.error("Failed to generate quiz:", error);
                    displayFeedback('Falha ao gerar o quiz. Verifique o console para mais detalhes.', 'danger', 'quiz-config-feedback');
                }
            });
            quizConfigForm.dataset.listenerAttached = 'true'; 
        }
    }

    async function showQuizConfigView() {
        // Container visibility is now handled by the router.
        // This function focuses on initializing the content of the quiz config view.
        await populateQuizSubjectFilter();
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
            displayFeedback("Erro: Nenhuma pergunta no quiz ou índice fora dos limites.", "danger", "quiz-taking-feedback");
            return;
        }

        const question = questions[currentQuestionIndex];
        const questionTextEl = document.getElementById('quiz-question-text');
        const progressIndicatorEl = document.getElementById('quiz-progress-indicator');
        const optionsContainerEl = document.getElementById('quiz-options-container');

        if(questionTextEl) questionTextEl.textContent = question.text;
        if(progressIndicatorEl) progressIndicatorEl.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;

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
                optionsContainerEl.innerHTML = '<p>Esta pergunta pode exigir um formato de resposta diferente (não é de múltipla escolha).</p>';
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
            displayFeedback("Nenhum quiz carregado. Por favor, configure um quiz primeiro.", "warning", "quiz-config-feedback");
            window.location.hash = '#/quiz-config'; // Redirect if no questions
            return; 
        }
        
        // Container visibility is now handled by the router.
        // This function focuses on initializing the content of the quiz taking view.
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
            console.error("Dados de resultados ou elementos DOM ausentes para renderizar os resultados.");
            if (scoreSummaryEl) scoreSummaryEl.innerHTML = '';
            if (reviewAreaEl) reviewAreaEl.innerHTML = '<h3>Revisão Detalhada:</h3><p>Não foi possível carregar os dados dos resultados.</p>';
            return;
        }

        const percentage = resultsData.totalQuestions > 0 ? (resultsData.score / resultsData.totalQuestions * 100).toFixed(0) : 0;
        scoreSummaryEl.innerHTML = `Sua Pontuação: ${resultsData.score} / ${resultsData.totalQuestions} (${percentage}%)`;

        reviewAreaEl.innerHTML = '<h3>Revisão Detalhada:</h3>'; 
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
                        indicators = ' <em>(Correta, Sua Resposta)</em>';
                    } else if (opt === item.userAnswer && item.userAnswer !== item.correctAnswer) {
                        optClass = 'text-danger font-weight-bold';
                        indicators = ' <em>(Sua Resposta)</em>';
                    } else if (opt === item.correctAnswer) {
                        optClass = 'text-info'; 
                        indicators = ' <em>(Resposta Correta)</em>';
                    }
                    optionsHtml += `<li class="${optClass}">${escapedOpt}${indicators}</li>`;
                });
                optionsHtml += '</ul>';
            }
            
            const userAnswerDisplay = item.userAnswer ? escapeHTML(item.userAnswer) : 'Não respondida';
            const correctAnswerDisplay = escapeHTML(item.correctAnswer);

            li.innerHTML = `
                <p class="font-weight-bold mb-1"><strong>P${index + 1}: ${escapeHTML(item.questionText)}</strong></p>
                ${optionsHtml}
                <p class="mt-2 mb-1">Sua resposta: <span class="${item.isCorrect ? 'text-success' : 'text-danger'} font-weight-bold">${userAnswerDisplay}</span></p>
                ${!item.isCorrect ? `<p class="mb-0">Resposta correta: <span class="text-info font-weight-bold">${correctAnswerDisplay}</span></p>` : ''}
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
            displayFeedback("Nenhum resultado de quiz encontrado. Por favor, faça um quiz primeiro.", "warning", "quiz-config-feedback");
            window.location.hash = '#/quiz-config';
            return;
        }
        
        // Container visibility is now handled by the router.
        // This function focuses on initializing the content of the quiz results view.
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
