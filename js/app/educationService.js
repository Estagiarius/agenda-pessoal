(function() {
    'use strict';

    // Namespace para o serviço de educação
    window.educationService = {};

    // --- Estrutura de Dados e Persistência ---

    /**
     * Obtém os dados do localStorage.
     * @param {string} key - A chave para os dados (ex: 'subjects', 'classes').
     * @returns {Array} - Os dados encontrados ou um array vazio.
     */
    function getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Erro ao ler dados de ${key} do localStorage`, e);
            return [];
        }
    }

    /**
     * Salva os dados no localStorage.
     * @param {string} key - A chave para os dados.
     * @param {Array} data - Os dados a serem salvos.
     */
    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Erro ao salvar dados em ${key} no localStorage`, e);
        }
    }

    // --- Gestão de Disciplinas (Subjects) ---

    const subjectsKey = 'subjects';

    /**
     * Lista todas as disciplinas.
     * @returns {Array} - Uma lista de disciplinas.
     */
    window.educationService.getSubjects = function() {
        return getData(subjectsKey);
    };

    /**
     * Adiciona uma nova disciplina.
     * @param {object} subjectData - Dados da disciplina { name, code, description }.
     * @returns {object} - A nova disciplina com um ID.
     */
    window.educationService.addSubject = function(subjectData) {
        const subjects = this.getSubjects();

        // RN04: O nome ou código da disciplina deve ser único
        if (subjects.some(s => s.name === subjectData.name || (subjectData.code && s.code === subjectData.code))) {
            throw new Error('Já existe uma disciplina com este nome ou código.');
        }

        const newSubject = {
            id: `subj_${new Date().getTime()}`,
            ...subjectData
        };

        subjects.push(newSubject);
        saveData(subjectsKey, subjects);
        return newSubject;
    };

    /**
     * Busca uma disciplina pelo ID.
     * @param {string} id - O ID da disciplina.
     * @returns {object|undefined} - A disciplina encontrada.
     */
    window.educationService.getSubjectById = function(id) {
        return this.getSubjects().find(s => s.id === id);
    };

    /**
     * Atualiza uma disciplina existente.
     * @param {string} id - O ID da disciplina a ser atualizada.
     * @param {object} updatedData - Os novos dados da disciplina.
     */
    window.educationService.updateSubject = function(id, updatedData) {
        let subjects = this.getSubjects();
        const index = subjects.findIndex(s => s.id === id);
        if (index !== -1) {
            subjects[index] = { ...subjects[index], ...updatedData };
            saveData(subjectsKey, subjects);
        }
    };

    /**
     * Exclui uma disciplina.
     * @param {string} id - O ID da disciplina a ser excluída.
     */
    window.educationService.deleteSubject = function(id) {
        // RN03: Verifica se existem turmas associadas
        const classes = this.getClasses();
        if (classes.some(c => c.subjectId === id)) {
            throw new Error('Não é possível excluir a disciplina, pois existem turmas associadas a ela.');
        }

        let subjects = this.getSubjects();
        subjects = subjects.filter(s => s.id !== id);
        saveData(subjectsKey, subjects);
    };

    // --- Gestão de Turmas (Classes) ---

    const classesKey = 'classes';

    /**
     * Lista todas as turmas.
     * @returns {Array} - Uma lista de turmas.
     */
    window.educationService.getClasses = function() {
        return getData(classesKey);
    };

    /**
     * Adiciona uma nova turma.
     * @param {object} classData - Dados da turma { name, subjectId, yearSemester, teacher }.
     * @returns {object} - A nova turma com um ID.
     */
    window.educationService.addClass = function(classData) {
        const classes = this.getClasses();

        // RN02: Cada turma deve estar obrigatoriamente vinculada a uma única disciplina.
        if (!classData.subjectId) {
            throw new Error('A turma deve estar vinculada a uma disciplina.');
        }

        // RN05: A combinação de "Nome da Turma", "Disciplina" e "Ano/Semestre" deve ser única.
        if (classes.some(c => c.name === classData.name && c.subjectId === classData.subjectId && c.yearSemester === classData.yearSemester)) {
            throw new Error('Já existe uma turma com esta combinação de nome, disciplina e ano/semestre.');
        }

        const newClass = {
            id: `cls_${new Date().getTime()}`,
            ...classData
        };

        classes.push(newClass);
        saveData(classesKey, classes);
        return newClass;
    };

    /**
     * Busca uma turma pelo ID.
     * @param {string} id - O ID da turma.
     * @returns {object|undefined} - A turma encontrada.
     */
    window.educationService.getClassById = function(id) {
        return this.getClasses().find(c => c.id === id);
    };

    /**
     * Atualiza uma turma existente.
     * @param {string} id - O ID da turma a ser atualizada.
     * @param {object} updatedData - Os novos dados da turma.
     */
    window.educationService.updateClass = function(id, updatedData) {
        let classes = this.getClasses();
        const index = classes.findIndex(c => c.id === id);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...updatedData };
            saveData(classesKey, classes);
        }
    };

    /**
     * Exclui uma turma.
     * @param {string} id - O ID da turma a ser excluída.
     */
    window.educationService.deleteClass = function(id) {
        let classes = this.getClasses();
        classes = classes.filter(c => c.id !== id);
        saveData(classesKey, classes);
    };

    // --- Gestão de Alunos (Students) ---

    const studentsKey = 'students';
    const enrollmentsKey = 'enrollments'; // { studentId, classId }

    /**
     * Lista todos os alunos.
     * @returns {Array} - Uma lista de alunos.
     */
    window.educationService.getStudents = function() {
        return getData(studentsKey);
    };

    /**
     * Adiciona um novo aluno.
     * @param {object} studentData - Dados do aluno.
     * @returns {object} - O novo aluno com um ID.
     */
    window.educationService.addStudent = function(studentData) {
        const students = this.getStudents();

        const newStudent = {
            id: `std_${new Date().getTime()}`,
            ...studentData
        };

        students.push(newStudent);
        saveData(studentsKey, students);
        return newStudent;
    };

    window.educationService.addAndEnrollStudent = function(studentData, classId) {
        const enrolledStudents = this.getStudentsByClass(classId);
        if (enrolledStudents.some(s => s.callNumber === studentData.callNumber)) {
            throw new Error('Já existe um aluno com este número de chamada nesta turma.');
        }

        const newStudent = this.addStudent(studentData);
        this.enrollStudentInClass(newStudent.id, classId);
        return newStudent;
    };

    /**
     * Busca um aluno pelo ID.
     */
    window.educationService.getStudentById = function(id) {
        return this.getStudents().find(s => s.id === id);
    };

    /**
     * Atualiza um aluno existente.
     */
    window.educationService.updateStudent = function(id, updatedData) {
        let students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            saveData(studentsKey, students);
        }
    };

    /**
     * Exclui um aluno.
     */
    window.educationService.deleteStudent = function(id) {
        // RN10: Verifica se o aluno está matriculado em alguma turma
        const enrollments = getData(enrollmentsKey);
        if (enrollments.some(e => e.studentId === id)) {
            throw new Error('Este aluno está matriculado em uma ou mais turmas e não pode ser excluído.');
        }

        let students = this.getStudents();
        students = students.filter(s => s.id !== id);
        saveData(studentsKey, students);
    };

    // --- Gestão de Matrículas (Enrollments) ---

    /**
     * Matricula um aluno em uma turma.
     */
    window.educationService.enrollStudentInClass = function(studentId, classId) {
        const enrollments = getData(enrollmentsKey);

        // RN09: Não permite matrícula duplicada
        if (enrollments.some(e => e.studentId === studentId && e.classId === classId)) {
            throw new Error('Este aluno já está matriculado nesta turma.');
        }

        enrollments.push({ studentId, classId });
        saveData(enrollmentsKey, enrollments);
    };

    /**
     * Remove um aluno de uma turma.
     */
    window.educationService.removeStudentFromClass = function(studentId, classId) {
        let enrollments = getData(enrollmentsKey);
        enrollments = enrollments.filter(e => !(e.studentId === studentId && e.classId === classId));
        saveData(enrollmentsKey, enrollments);
    };

    /**
     * Lista os alunos de uma turma específica.
     */
    window.educationService.getStudentsByClass = function(classId) {
        const enrollments = getData(enrollmentsKey);
        const studentIds = enrollments.filter(e => e.classId === classId).map(e => e.studentId);
        const allStudents = this.getStudents();
        return allStudents.filter(s => studentIds.includes(s.id));
    };

    // --- Gestão de Avaliações (Evaluations) ---

    const evaluationsKey = 'evaluations';
    const gradesKey = 'grades';

    /**
     * Adiciona uma nova avaliação.
     */
    window.educationService.addEvaluation = function(evaluationData) {
        if (!evaluationData.name || !evaluationData.classId || isNaN(evaluationData.weight) || isNaN(evaluationData.maxGrade)) {
            throw new Error("Dados da avaliação inválidos. Verifique os campos obrigatórios.");
        }
        const evaluations = getData(evaluationsKey);
        const newEvaluation = {
            id: `eval_${new Date().getTime()}`,
            ...evaluationData
        };
        evaluations.push(newEvaluation);
        saveData(evaluationsKey, evaluations);
        return newEvaluation;
    };

    window.educationService.getEvaluationsByClass = function(classId) {
        const evaluations = getData(evaluationsKey);
        return evaluations.filter(e => e.classId === classId);
    };

    window.educationService.getEvaluationById = function(id) {
        const evaluations = getData(evaluationsKey);
        return evaluations.find(e => e.id === id);
    };

    window.educationService.updateEvaluation = function(id, updatedData) {
        let evaluations = getData(evaluationsKey);
        const index = evaluations.findIndex(e => e.id === id);
        if (index !== -1) {
            evaluations[index] = { ...evaluations[index], ...updatedData };
            saveData(evaluationsKey, evaluations);
        }
    };

    window.educationService.deleteEvaluation = function(id) {
        let evaluations = getData(evaluationsKey);
        evaluations = evaluations.filter(e => e.id !== id);
        saveData(evaluationsKey, evaluations);

        // RN16: Excluir notas associadas
        let grades = getData(gradesKey);
        grades = grades.filter(g => g.evaluationId !== id);
        saveData(gradesKey, grades);
    };

    window.educationService.saveGrades = function(evaluationId, newGrades) {
        const evaluation = getData(evaluationsKey).find(e => e.id === evaluationId);
        const maxGrade = evaluation ? evaluation.maxGrade : 10;

        let grades = getData(gradesKey);
        // Remove notas antigas para esta avaliação
        grades = grades.filter(g => g.evaluationId !== evaluationId);

        newGrades.forEach(grade => {
            // RN13: Validação da nota máxima
            if (grade.grade > maxGrade) {
                throw new Error(`A nota para ${grade.studentId} não pode ser maior que ${maxGrade}.`);
            }
            grades.push({ evaluationId, studentId: grade.studentId, grade: grade.grade });
        });

        saveData(gradesKey, grades);
    };

    window.educationService.getGradesByEvaluation = function(evaluationId) {
        const grades = getData(gradesKey);
        return grades.filter(g => g.evaluationId === evaluationId);
    };

    window.educationService.calculateClassReport = function(classId) {
        const students = this.getStudentsByClass(classId);
        const evaluations = this.getEvaluationsByClass(classId);
        const allGrades = getData(gradesKey);

        const report = students.map(student => {
            let totalWeightedGrade = 0;
            let totalWeight = 0;
            const studentGrades = {};

            evaluations.forEach(evaluation => {
                const gradeObj = allGrades.find(g => g.evaluationId === evaluation.id && g.studentId === student.id);
                const grade = gradeObj ? parseFloat(gradeObj.grade) : null;

                studentGrades[evaluation.id] = grade;

                // RN15: Se não houver nota, não entra no cálculo
                if (grade !== null) {
                    const weight = parseFloat(evaluation.weight);
                    totalWeightedGrade += grade * weight;
                    totalWeight += weight;
                }
            });

            const finalGrade = totalWeight > 0 ? (totalWeightedGrade / totalWeight).toFixed(2) : 'N/A';

            return {
                studentId: student.id,
                studentName: student.name,
                grades: studentGrades,
                finalGrade: finalGrade
            };
        });

        return { report, evaluations };
    };

})();
