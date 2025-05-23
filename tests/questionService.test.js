// tests/questionService.test.js
(function() {
    const resultsContainer = document.getElementById('test-results-questionService');
    let testCount = 0;
    let passCount = 0;

    function runTest(testName, testFn) {
        testCount++;
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `Test: ${testName}`;
        try {
            // Reset state before each test if necessary (e.g., clear questions array)
            // This requires exposing a reset method from questionService or re-initializing it,
            // which is not currently done. For now, tests will be stateful or test independent aspects.
            // A better approach would be to instantiate questionService or provide a reset.
            // For this task, we'll assume tests can run sequentially or test different aspects.
            // Let's add a simple reset by clearing the internal arrays directly for testing purposes if possible,
            // or structure tests to be independent.
            // Since questionService is an IIFE, direct reset is hard.
            // Alternative: re-run the IIFE code (complex) or make tests build on each other carefully.

            // For simplicity, we'll make tests mostly independent or verify states after sequences.
            // To truly reset, questionService would need a reset method or be instantiable.

            testFn();
            resultDiv.classList.add('pass');
            resultDiv.textContent += ' - PASS';
            passCount++;
        } catch (e) {
            resultDiv.classList.add('fail');
            resultDiv.textContent += ` - FAIL: ${e.message}`;
            console.error(`Test Failed: ${testName}`, e);
        }
        resultsContainer.appendChild(resultDiv);
    }

    // --- Mock Question Class if needed, but models.js should be included ---
    // Ensure Question class from models.js is available.
    if (typeof Question === 'undefined') {
        resultsContainer.innerHTML = '<div class="fail">CRITICAL: Question class not loaded from models.js. Tests cannot run.</div>';
        return;
    }
    
    // --- Actual Tests ---

    runTest('addQuestion: should add a question and assign an ID', () => {
        // Note: This relies on the state from previous tests or initial state.
        // Ideally, questionService.questions would be reset.
        // Let's assume this is the first addQuestion test run or we account for existing questions.
        const initialQuestions = questionService.getQuestions().length;
        const q = questionService.addQuestion('What is 2+2?', 'Math', 'Easy', ['3', '4', '5'], '4');
        if (!q || q.id === undefined) throw new Error('Question not created or ID not assigned.');
        if (q.text !== 'What is 2+2?') throw new Error('Question text incorrect.');
        if (questionService.getQuestions().length !== initialQuestions + 1) throw new Error('Question count did not increase.');
    });

    runTest('getQuestions: should retrieve all questions when no filters are applied', () => {
        // Add a known set of questions first for a predictable test
        questionService.addQuestion('Capital of France?', 'Geography', 'Easy', ['Paris', 'London'], 'Paris');
        questionService.addQuestion('Speed of light?', 'Physics', 'Medium', [], '299792458 m/s');
        
        const allQuestions = questionService.getQuestions();
        // This count will be based on all questions added so far in this test file.
        if (allQuestions.length < 2) throw new Error('Should retrieve all added questions.');
    });

    runTest('getQuestions: should filter by subject (case-insensitive)', () => {
        // Questions from previous test are present.
        const mathQuestions = questionService.getQuestions({ subject: 'math' }); // Case-insensitive test
        if (mathQuestions.length === 0) throw new Error('Should find "Math" questions.');
        if (!mathQuestions.every(q => q.subject.toLowerCase().includes('math'))) {
            throw new Error('Not all retrieved questions match subject "Math".');
        }
    });

    runTest('getQuestions: should filter by difficulty', () => {
        const easyQuestions = questionService.getQuestions({ difficulty: 'Easy' });
        if (easyQuestions.length === 0) throw new Error('Should find "Easy" questions.');
        if (!easyQuestions.every(q => q.difficulty === 'Easy')) {
            throw new Error('Not all retrieved questions match difficulty "Easy".');
        }
    });
    
    runTest('getQuestions: should filter by subject and difficulty', () => {
        const easyMathQuestions = questionService.getQuestions({ subject: 'Math', difficulty: 'Easy' });
            if (easyMathQuestions.length === 0) throw new Error('Should find "Easy" "Math" questions.');
        if (!easyMathQuestions.every(q => q.subject.toLowerCase().includes('math') && q.difficulty === 'Easy')) {
            throw new Error('Not all retrieved questions match subject "Math" and difficulty "Easy".');
        }
    });

    runTest('getQuestionById: should retrieve the correct question', () => {
        const q1 = questionService.addQuestion('Test ID Q', 'Test', 'Easy', [], 'Test Answer');
        const fetchedQ = questionService.getQuestionById(q1.id);
        if (!fetchedQ || fetchedQ.id !== q1.id) throw new Error('Failed to fetch question by ID.');
    });
    
    runTest('getAllSubjects: should return unique subjects', () => {
        questionService.addQuestion('Subject Test 1', 'UniqueSubject1', 'Easy', [], 'A');
        questionService.addQuestion('Subject Test 2', 'UniqueSubject2', 'Easy', [], 'B');
        questionService.addQuestion('Subject Test 3', 'UniqueSubject1', 'Medium', [], 'C'); // Duplicate subject
        
        const subjects = questionService.getAllSubjects();
        const uniqueSubjects = new Set(subjects);
        if (subjects.length !== uniqueSubjects.size) throw new Error('Subjects are not unique.');
        if (!subjects.includes('UniqueSubject1') || !subjects.includes('UniqueSubject2')) {
                throw new Error('Did not find all unique subjects.');
        }
    });

    // Summary
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `<strong>Tests Complete: ${passCount} / ${testCount} passed.</strong>`;
    summaryDiv.style.marginTop = '20px';
    summaryDiv.style.fontWeight = 'bold';
    resultsContainer.appendChild(summaryDiv);

})();
