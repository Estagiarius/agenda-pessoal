// js/app/questionService.js
const questionService = (() => {
    let questions = [];
    let nextQuestionId = 1;

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

    // Public API
    return {
        addQuestion,
        getQuestions,
        getQuestionById,
        getAllSubjects
    };
})();
