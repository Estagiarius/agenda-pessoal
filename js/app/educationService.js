(function() {
    'use strict';

    // Namespace para o serviço de educação
    window.educationService = {};

    // --- Helper para chamadas de API ---
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ocorreu um erro na solicitação à API.');
        }
        if (response.status === 204) { // No Content
            return;
        }
        return response.json();
    }

    // --- Gestão de Disciplinas (Subjects) ---

    window.educationService.getSubjects = async function() {
        return apiRequest('/api/subjects');
    };

    window.educationService.addSubject = async function(subjectData) {
        // A validação de duplicados deve ser idealmente tratada pelo backend
        return apiRequest('/api/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectData)
        });
    };

    window.educationService.getSubjectById = async function(id) {
        return apiRequest(`/api/subjects/${id}`);
    };

    window.educationService.updateSubject = async function(id, updatedData) {
        return apiRequest(`/api/subjects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    };

    window.educationService.deleteSubject = async function(id) {
        // RN03: A verificação de turmas associadas deve ser feita no backend.
        // Por enquanto, a UI ainda faz uma verificação prévia.
        return apiRequest(`/api/subjects/${id}`, { method: 'DELETE' });
    };

    // --- Gestão de Turmas (Classes) ---

    window.educationService.getClasses = async function() {
        return apiRequest('/api/classes');
    };

    window.educationService.addClass = async function(classData) {
        return apiRequest('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
    };

    window.educationService.getClassById = async function(id) {
        return apiRequest(`/api/classes/${id}`);
    };

    window.educationService.updateClass = async function(id, updatedData) {
        return apiRequest(`/api/classes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    };

    window.educationService.deleteClass = async function(id) {
        return apiRequest(`/api/classes/${id}`, { method: 'DELETE' });
    };

    // --- Gestão de Alunos (Students) e Matrículas (Enrollments) ---

    window.educationService.updateStudent = async function(id, updatedData) {
        return apiRequest(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    };

    window.educationService.getStudentsByClass = async function(classId) {
        return apiRequest(`/api/classes/${classId}/students`);
    };

    window.educationService.addAndEnrollStudent = async function(studentData, classId) {
        return apiRequest(`/api/classes/${classId}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
    };

    window.educationService.removeStudentFromClass = async function(studentId, classId) {
        return apiRequest(`/api/classes/${classId}/students/${studentId}`, { method: 'DELETE' });
    };

    // --- Gestão de Avaliações (Evaluations) e Notas (Grades) ---

    window.educationService.getEvaluationsByClass = async function(classId) {
         return apiRequest(`/api/classes/${classId}/evaluations`);
    };

    window.educationService.addEvaluation = async function(evaluationData) {
        return apiRequest('/api/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationData)
        });
    };

    window.educationService.updateEvaluation = async function(id, updatedData) {
        return apiRequest(`/api/evaluations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    };

    window.educationService.deleteEvaluation = async function(id) {
        return apiRequest(`/api/evaluations/${id}`, { method: 'DELETE' });
    };

    window.educationService.getGradesByEvaluation = async function(evaluationId) {
        return apiRequest(`/api/evaluations/${evaluationId}/grades`);
    };

    window.educationService.saveGrades = async function(evaluationId, newGrades) {
        return apiRequest(`/api/evaluations/${evaluationId}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGrades)
        });
    };

    // A lógica de cálculo do boletim permanece no frontend por enquanto,
    // mas agora consome os dados da API de forma assíncrona.
    window.educationService.calculateClassReport = async function(classId) {
        const students = await this.getStudentsByClass(classId);
        const evaluations = await this.getEvaluationsByClass(classId);

        // Otimização: buscar todas as notas relevantes de uma vez se a API suportar,
        // ou buscar por avaliação.
        const gradePromises = evaluations.map(e => this.getGradesByEvaluation(e.id));
        const gradesByEvaluation = await Promise.all(gradePromises);
        const allGrades = [].concat(...gradesByEvaluation); // Aplaina o array de arrays

        const report = students.map(student => {
            let totalWeightedGrade = 0;
            let totalWeight = 0;
            const studentGrades = {};

            evaluations.forEach(evaluation => {
                const gradeObj = allGrades.find(g => g.evaluationId === evaluation.id && g.studentId === student.id);
                const grade = gradeObj ? parseFloat(gradeObj.grade) : null;

                studentGrades[evaluation.id] = grade;

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
