(function() {
    'use strict';

    // Mock localStorage
    const localStorageMock = (function() {
        let store = {};
        return {
            getItem: function(key) {
                return store[key] || null;
            },
            setItem: function(key, value) {
                store[key] = value.toString();
            },
            clear: function() {
                store = {};
            },
            removeItem: function(key) {
                delete store[key];
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Test Suite
    describe('Education Service', function() {

        beforeEach(function() {
            // Clear local storage before each test
            localStorage.clear();
            // Mock initial data if needed
            const subjects = [{ id: 'subj_1', name: 'Math' }];
            const classes = [{ id: 'cls_1', name: 'Math 101', subjectId: 'subj_1', yearSemester: '2023-1' }];
            const students = [{ id: 'std_1', name: 'John Doe', callNumber: 1 }];
            const enrollments = [{ studentId: 'std_1', classId: 'cls_1' }];
            localStorage.setItem('subjects', JSON.stringify(subjects));
            localStorage.setItem('classes', JSON.stringify(classes));
            localStorage.setItem('students', JSON.stringify(students));
            localStorage.setItem('enrollments', JSON.stringify(enrollments));
        });

        // Test for addEvaluation
        it('should add a new evaluation', function() {
            const evaluationData = {
                name: 'Test 1',
                classId: 'cls_1',
                date: '2023-10-01',
                weight: 0.5,
                maxGrade: 10
            };
            const newEvaluation = window.educationService.addEvaluation(evaluationData);
            expect(newEvaluation).toBeDefined();
            expect(newEvaluation.name).toBe('Test 1');
            const evaluations = window.educationService.getEvaluationsByClass('cls_1');
            expect(evaluations.length).toBe(1);
        });

        it('should not add an evaluation with invalid data', function() {
            const invalidData = {
                name: '',
                classId: 'cls_1',
                weight: 'invalid',
                maxGrade: 10
            };
            expect(() => window.educationService.addEvaluation(invalidData)).toThrow(new Error("Dados da avaliação inválidos. Verifique os campos obrigatórios."));
        });

        // Test for saveGrades
        it('should save grades for an evaluation', function() {
            const evaluationData = { name: 'Test 2', classId: 'cls_1', date: '2023-10-02', weight: 1, maxGrade: 10 };
            const evaluation = window.educationService.addEvaluation(evaluationData);
            const grades = [{ studentId: 'std_1', grade: 8.5 }];
            window.educationService.saveGrades(evaluation.id, grades);
            const savedGrades = window.educationService.getGradesByEvaluation(evaluation.id);
            expect(savedGrades.length).toBe(1);
            expect(savedGrades[0].grade).toBe(8.5);
        });

        it('should not save a grade higher than maxGrade', function() {
            const evaluationData = { name: 'Test 3', classId: 'cls_1', date: '2023-10-03', weight: 1, maxGrade: 5 };
            const evaluation = window.educationService.addEvaluation(evaluationData);
            const grades = [{ studentId: 'std_1', grade: 6 }];
            expect(() => window.educationService.saveGrades(evaluation.id, grades)).toThrow(new Error("A nota para std_1 não pode ser maior que 5."));
        });

        // Test for calculateClassReport
        it('should calculate the class report correctly', function() {
            // Add evaluations and grades
            const eval1 = window.educationService.addEvaluation({ name: 'P1', classId: 'cls_1', weight: 0.4, maxGrade: 10 });
            const eval2 = window.educationService.addEvaluation({ name: 'P2', classId: 'cls_1', weight: 0.6, maxGrade: 10 });
            window.educationService.saveGrades(eval1.id, [{ studentId: 'std_1', grade: 7 }]);
            window.educationService.saveGrades(eval2.id, [{ studentId: 'std_1', grade: 8 }]);

            const { report } = window.educationService.calculateClassReport('cls_1');
            expect(report.length).toBe(1);
            expect(report[0].studentName).toBe('John Doe');
            // (7 * 0.4) + (8 * 0.6) = 2.8 + 4.8 = 7.6
            expect(report[0].finalGrade).toBe('7.60');
        });
    });
})();
