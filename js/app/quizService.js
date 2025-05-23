// js/app/quizService.js
const quizService = (() => {
    let currentQuiz = {
        questions: [],      // Array of Question objects for the current quiz
        userAnswers: [],    // Array to store user's answers, parallel to questions
        score: 0,
        config: {},          // Stores the config used to generate this quiz
        detailedResults: null // Added property
    };

    /**
     * Generates a new quiz based on the provided configuration.
     * @param {object} config - Quiz configuration { numQuestions, subject, difficulty }
     * @returns {Array<Question>} An array of questions for the quiz, or empty if none match.
     */
    function generateQuiz(config) {
        currentQuiz.config = config;
        currentQuiz.questions = [];
        currentQuiz.userAnswers = [];
        currentQuiz.score = 0;

        const filters = {};
        if (config.subject) {
            filters.subject = config.subject;
        }
        if (config.difficulty) {
            filters.difficulty = config.difficulty;
        }

        // Assuming questionService.getQuestions is globally available
        let availableQuestions = questionService.getQuestions(filters);

        // Shuffle available questions to get a random selection
        let shuffledQuestions = availableQuestions.sort(() => 0.5 - Math.random());

        // Select the desired number of questions
        let numToSelect = parseInt(config.numQuestions, 10);
        if (isNaN(numToSelect) || numToSelect <= 0) {
            numToSelect = shuffledQuestions.length; // Default to all if invalid number
        }
        
        currentQuiz.questions = shuffledQuestions.slice(0, numToSelect);
        currentQuiz.userAnswers = new Array(currentQuiz.questions.length).fill(null); // Initialize answers array

        return [...currentQuiz.questions]; // Return a copy
    }

    /**
     * Records the user's answer for a specific question in the current quiz.
     * @param {number} questionIndex - The 0-based index of the question.
     * @param {any} answer - The user's answer.
     */
    function recordAnswer(questionIndex, answer) {
        if (questionIndex >= 0 && questionIndex < currentQuiz.userAnswers.length) {
            currentQuiz.userAnswers[questionIndex] = answer;
        } else {
            console.error("Invalid question index for recording answer:", questionIndex);
        }
    }

    /**
     * Retrieves the questions for the current quiz.
     * @returns {Array<Question>} A copy of the current quiz questions.
     */
    function getCurrentQuizQuestions() {
        return [...currentQuiz.questions]; // Return a copy to prevent direct modification
    }
    
    /**
     * Retrieves the user's answers for the current quiz.
     * @returns {Array<any>} A copy of the user's answers.
     */
    function getUserAnswers() {
        return [...currentQuiz.userAnswers];
    }

    /**
     * Retrieves the current quiz configuration.
     * @returns {object} The configuration object.
     */
    function getQuizConfig() {
        return {...currentQuiz.config};
    }
    
    // Placeholder for submitQuiz and getScore, to be implemented later
    function submitQuiz() {
        currentQuiz.score = 0;
        const detailedResults = [];

        for (let i = 0; i < currentQuiz.questions.length; i++) {
            const question = currentQuiz.questions[i];
            const userAnswer = currentQuiz.userAnswers[i];
            let isCorrect = false;

            // Assuming question.answer holds the exact string of the correct option's value for MCQs
            if (userAnswer !== null && userAnswer === question.answer) {
                currentQuiz.score++;
                isCorrect = true;
            }
            
            detailedResults.push({
                questionText: question.text,
                options: question.options, // Include options for review
                userAnswer: userAnswer,
                correctAnswer: question.answer,
                isCorrect: isCorrect,
                id: question.id // Include question ID for reference
            });
        }
        
        // Store the detailed results if needed for later retrieval by getQuizResults
        currentQuiz.detailedResults = detailedResults; 

        console.log("Quiz submitted. Score:", currentQuiz.score, "/", currentQuiz.questions.length);
        
        return {
            score: currentQuiz.score,
            totalQuestions: currentQuiz.questions.length,
            results: currentQuiz.detailedResults
        };
    }

    function getScore() {
        return {
            score: currentQuiz.score,
            totalQuestions: currentQuiz.questions.length
        };
    }
    
    function resetQuiz() {
        currentQuiz = {
            questions: [],
            userAnswers: [],
            score: 0,
            config: {},
            detailedResults: null // Reset this too
        };
    }

    /**
     * Retrieves the detailed results of the last submitted quiz.
     * @returns {object} An object containing score, totalQuestions, and detailed results array.
     *                   Returns null if no quiz has been submitted or results aren't available.
     */
    function getQuizResults() {
        if (currentQuiz.detailedResults) {
            return {
                score: currentQuiz.score,
                totalQuestions: currentQuiz.questions.length,
                results: [...currentQuiz.detailedResults] // Return a copy
            };
        }
        return null; 
    }

    // Public API
    return {
        generateQuiz,
        recordAnswer,
        getCurrentQuizQuestions,
        getUserAnswers,
        getQuizConfig,
        submitQuiz,
        getScore,  
        getQuizResults, // New
        resetQuiz
    };
})();
