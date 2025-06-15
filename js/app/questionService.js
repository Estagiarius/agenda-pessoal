// js/app/questionService.js
const questionService = (() => {
    const QUESTION_BANK_STORAGE_KEY = 'QUESTION_BANK_STORAGE_KEY';
    let questions = [];
    let nextQuestionId = 1;

    // --- Private methods ---
    function _saveQuestions() {
        try {
            localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(questions));
        } catch (e) {
            console.error("Error saving questions to LocalStorage:", e);
        }
    }

    function _loadQuestions() {
        try {
            const storedQuestions = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
            if (storedQuestions) {
                questions = JSON.parse(storedQuestions);
                if (questions.length > 0) {
                    // Ensure questions are instances of Question if needed, though models.js suggests they are simple data objects.
                    // For now, we assume direct parsing is fine.
                    nextQuestionId = Math.max(...questions.map(q => q.id), 0) + 1;
                } else {
                    nextQuestionId = 1;
                }
            } else {
                questions = [];
                nextQuestionId = 1;
            }
        } catch (e) {
            console.error("Error loading questions from LocalStorage:", e);
            questions = []; // Initialize with empty array on error
            nextQuestionId = 1;
        }
    }

    // --- Initialize questions from LocalStorage ---
    _loadQuestions();

    // --- Question Class (assuming models.js is loaded) ---
    // Ensure Question class is available. If not, this service cannot function.
    // For simplicity in this subtask, we'll assume Question is globally available
    // or that models.js is loaded prior to this script.

    function addQuestion(text, subject, difficulty, options, answer) {
        const newQuestion = new Question(
            nextQuestionId++,
            text,
            subject,
            difficulty,
            options,
            answer
        );
        questions.push(newQuestion);
        _saveQuestions(); // Save after adding
        return newQuestion;
    }

    function getQuestions(filters = {}) {
        let filteredQuestions = questions;

        if (filters.subject) {
            filteredQuestions = filteredQuestions.filter(q => 
                q.subject.toLowerCase().includes(filters.subject.toLowerCase())
            );
        }

        if (filters.difficulty) {
            filteredQuestions = filteredQuestions.filter(q => 
                q.difficulty === filters.difficulty
            );
        }
        return filteredQuestions;
    }

    function getQuestionById(id) {
        return questions.find(q => q.id === parseInt(id));
    }
    
    // Function to get all unique subjects
    function getAllSubjects() {
        const subjects = new Set();
        questions.forEach(q => subjects.add(q.subject));
        return Array.from(subjects);
    }

    function updateQuestion(id, updatedData) {
        const questionIndex = questions.findIndex(q => q.id === parseInt(id));
        if (questionIndex !== -1) {
            // Assuming Question objects are simple data objects, directly update.
            // If Question class has an update method or specific setters, use those.
            questions[questionIndex] = { ...questions[questionIndex], ...updatedData };
            _saveQuestions();
            return questions[questionIndex];
        }
        return null; // Or throw an error
    }

    function deleteQuestion(id) {
        const questionIndex = questions.findIndex(q => q.id === parseInt(id));
        if (questionIndex !== -1) {
            const deletedQuestion = questions.splice(questionIndex, 1);
            _saveQuestions();
            return deletedQuestion[0]; // Return the deleted question
        }
        return null; // Or throw an error
    }

    // Public API
    return {
        addQuestion,
        getQuestions,
        getQuestionById,
        getAllSubjects,
        updateQuestion,
        deleteQuestion
    };
})();
