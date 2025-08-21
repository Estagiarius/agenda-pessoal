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

    // A lógica de persistência para disciplinas foi migrada para o backend.
    // As funções agora são assíncronas e usam a API /api/disciplinas.

    /**
     * Lista todas as disciplinas a partir da API.
     * @returns {Promise<Array>} - Uma promessa que resolve para uma lista de disciplinas.
     */
    window.educationService.getSubjects = async function() {
        const response = await fetch('/api/disciplinas');
        if (!response.ok) {
            console.error('Erro ao buscar disciplinas da API.');
            return [];
        }
        return response.json();
    };

    /**
     * Adiciona uma nova disciplina através da API.
     * @param {object} subjectData - Dados da disciplina { nome, codigo, descricao }.
     * @returns {Promise<object>} - A promessa que resolve para a nova disciplina criada.
     */
    window.educationService.addSubject = async function(subjectData) {
        // A validação de unicidade (RN04) agora deve ser tratada idealmente no backend.
        // Por enquanto, a chamada é direta.
        const response = await fetch('/api/disciplinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar disciplina.');
        }
        return response.json();
    };

    /**
     * Busca uma disciplina pelo ID a partir da API.
     * @param {string} id - O ID da disciplina.
     * @returns {Promise<object|undefined>} - A disciplina encontrada.
     */
    window.educationService.getSubjectById = async function(id) {
        const response = await fetch(`/api/disciplinas/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar disciplina.');
        }
        return response.json();
    };

    /**
     * Atualiza uma disciplina existente através da API.
     * @param {string} id - O ID da disciplina a ser atualizada.
     * @param {object} updatedData - Os novos dados da disciplina.
     * @returns {Promise<object>} - A disciplina atualizada.
     */
    window.educationService.updateSubject = async function(id, updatedData) {
        const response = await fetch(`/api/disciplinas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar disciplina.');
        }
        return response.json();
    };

    /**
     * Exclui uma disciplina através da API.
     * @param {string} id - O ID da disciplina a ser excluída.
     */
    window.educationService.deleteSubject = async function(id) {
        // RN03: A verificação de dependência com Turmas é mantida no cliente.
        // Agora, ela precisa aguardar a resposta da API de turmas.
        const classes = await this.getClasses();
        if (classes.some(c => c.id_disciplina === id)) {
            throw new Error('Não é possível excluir a disciplina, pois existem turmas associadas a ela.');
        }

        const response = await fetch(`/api/disciplinas/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir disciplina.');
        }
        // Não retorna conteúdo no sucesso (204)
    };

    // --- Gestão de Turmas (Classes) ---

    // A lógica de persistência para turmas foi migrada para o backend.
    // As funções agora são assíncronas e usam a API /api/turmas.

    /**
     * Lista todas as turmas a partir da API.
     * @returns {Promise<Array>} - Uma promessa que resolve para uma lista de turmas.
     */
    window.educationService.getClasses = async function() {
        const response = await fetch('/api/turmas');
        if (!response.ok) {
            console.error('Erro ao buscar turmas da API.');
            return [];
        }
        return response.json();
    };

    /**
     * Adiciona uma nova turma através da API.
     * @param {object} classData - Dados da turma { nome, id_disciplina, ano_semestre, professor }.
     * @returns {Promise<object>} - A nova turma criada.
     */
    window.educationService.addClass = async function(classData) {
        // A validação RN05 (unicidade) permanece no cliente por enquanto.
        const classes = await this.getClasses();
        if (classes.some(c => c.nome === classData.nome && c.id_disciplina === classData.id_disciplina && c.ano_semestre === classData.ano_semestre)) {
            throw new Error('Já existe uma turma com esta combinação de nome, disciplina e ano/semestre.');
        }

        const response = await fetch('/api/turmas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar turma.');
        }
        return response.json();
    };

    /**
     * Busca uma turma pelo ID a partir da API.
     * @param {string} id - O ID da turma.
     * @returns {Promise<object|undefined>} - A turma encontrada.
     */
    window.educationService.getClassById = async function(id) {
        const response = await fetch(`/api/turmas/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar turma.');
        }
        return response.json();
    };

    /**
     * Atualiza uma turma existente através da API.
     * @param {string} id - O ID da turma a ser atualizada.
     * @param {object} updatedData - Os novos dados da turma.
     * @returns {Promise<object>} - A turma atualizada.
     */
    window.educationService.updateClass = async function(id, updatedData) {
        const response = await fetch(`/api/turmas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar turma.');
        }
        return response.json();
    };

    /**
     * Exclui uma turma através da API.
     * @param {string} id - O ID da turma a ser excluída.
     */
    window.educationService.deleteClass = async function(id) {
        // RN: Verificar se existem alunos matriculados antes de excluir.
        // Esta lógica será adicionada quando os alunos forem migrados.
        const response = await fetch(`/api/turmas/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir turma.');
        }
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

    window.educationService.getEvaluationsByClass = function(classIds) {
        const evaluations = getData(evaluationsKey);
        if (Array.isArray(classIds)) {
            return evaluations.filter(e => classIds.includes(e.classId));
        }
        return evaluations.filter(e => e.classId === classIds);
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
