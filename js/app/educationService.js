(function() {
    'use strict';

    // Namespace para o serviço de educação
    window.educationService = {};

    // A persistência de dados agora é totalmente gerenciada pelo backend.
    // As funções getData e saveData baseadas em localStorage foram removidas.

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

    window.educationService.getStudents = async function() {
        const response = await fetch('/api/alunos');
        if (!response.ok) {
            console.error('Erro ao buscar alunos.');
            return [];
        }
        return response.json();
    };

    window.educationService.addStudent = async function(studentData) {
        const response = await fetch('/api/alunos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar aluno.');
        }
        return response.json();
    };

    window.educationService.addAndEnrollStudent = async function(studentData, classId) {
        // Esta função agora cria o aluno e depois o matricula.
        const newStudent = await this.addStudent(studentData);
        await this.enrollStudentInClass(newStudent.id, classId);
        return newStudent;
    };

    window.educationService.getStudentById = async function(id) {
        const response = await fetch(`/api/alunos/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar aluno.');
        }
        return response.json();
    };

    window.educationService.updateStudent = async function(id, updatedData) {
        const response = await fetch(`/api/alunos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar aluno.');
        }
        return response.json();
    };

    window.educationService.deleteStudent = async function(id) {
        // A validação RN10 (verificar matrícula) agora é tratada pelo servidor.
        const response = await fetch(`/api/alunos/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir aluno.');
        }
    };

    // --- Gestão de Matrículas (Enrollments) ---

    window.educationService.enrollStudentInClass = async function(studentId, classId) {
        // A validação RN09 (matrícula duplicada) agora é tratada pelo servidor.
        const response = await fetch(`/api/turmas/${classId}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_aluno: studentId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao matricular aluno.');
        }
        return response.json();
    };

    window.educationService.removeStudentFromClass = async function(studentId, classId) {
        const response = await fetch(`/api/turmas/${classId}/alunos/${studentId}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao desmatricular aluno.');
        }
    };

    window.educationService.getStudentsByClass = async function(classId) {
        const response = await fetch(`/api/turmas/${classId}/alunos`);
        if (!response.ok) {
            console.error(`Erro ao buscar alunos da turma ${classId}.`);
            return [];
        }
        return response.json();
    };

    // --- Gestão de Avaliações (Evaluations) ---

    window.educationService.addEvaluation = async function(evaluationData) {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar avaliação.');
        }
        return response.json();
    };

    window.educationService.getEvaluationsByClass = async function(classId) {
        const response = await fetch(`/api/turmas/${classId}/avaliacoes`);
        if (!response.ok) {
            console.error(`Erro ao buscar avaliações da turma ${classId}.`);
            return [];
        }
        return response.json();
    };

    window.educationService.getEvaluationById = async function(id) {
        const response = await fetch(`/api/avaliacoes/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar avaliação.');
        }
        return response.json();
    };

    window.educationService.updateEvaluation = async function(id, updatedData) {
        const response = await fetch(`/api/avaliacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar avaliação.');
        }
        return response.json();
    };

    window.educationService.deleteEvaluation = async function(id) {
        // A validação RN16 (excluir notas) agora é tratada pelo servidor.
        const response = await fetch(`/api/avaliacoes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir avaliação.');
        }
    };

    window.educationService.saveGrades = async function(evaluationId, newGrades) {
        // A validação RN13 (nota máxima) agora é tratada pelo servidor.
        const response = await fetch(`/api/avaliacoes/${evaluationId}/notas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGrades)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar notas.');
        }
        return response.json();
    };

    window.educationService.getGradesByEvaluation = async function(evaluationId) {
        const response = await fetch(`/api/avaliacoes/${evaluationId}/notas`);
        if (!response.ok) {
            console.error(`Erro ao buscar notas da avaliação ${evaluationId}.`);
            return [];
        }
        return response.json();
    };

    window.educationService.calculateClassReport = async function(classId) {
        // Esta função agora orquestra múltiplas chamadas de API.
        const students = await this.getStudentsByClass(classId);
        const evaluations = await this.getEvaluationsByClass(classId);

        // Busca todas as notas de todas as avaliações em paralelo para eficiência.
        const gradePromises = evaluations.map(e => this.getGradesByEvaluation(e.id));
        const gradesByEvaluation = await Promise.all(gradePromises);

        // Cria uma lista única com todas as notas para facilitar a busca.
        const allGrades = gradesByEvaluation.flat();

        const report = students.map(student => {
            let totalWeightedGrade = 0;
            let totalWeight = 0;
            const studentGrades = {};

            evaluations.forEach(evaluation => {
                const gradeObj = allGrades.find(g => g.id_avaliacao === evaluation.id && g.id_aluno === student.id);
                const grade = gradeObj ? parseFloat(gradeObj.valor) : null;

                studentGrades[evaluation.id] = grade;

                // RN15: Se não houver nota, não entra no cálculo
                if (grade !== null) {
                    const weight = parseFloat(evaluation.peso);
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
