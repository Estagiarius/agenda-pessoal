// js/app/questionService.js
const questionService = (() => {

    // All question data is now managed by the backend API.

    async function addQuestion(text, subject, difficulty, options, answer) {
        const response = await fetch('/api/perguntas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, subject, difficulty, options, answer })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar pergunta.');
        }
        return response.json();
    }

    async function getQuestions(filters = {}) {
        const url = new URL('/api/perguntas', window.location.origin);
        if (filters.subject) {
            url.searchParams.append('subject', filters.subject);
        }
        if (filters.difficulty) {
            url.searchParams.append('difficulty', filters.difficulty);
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.error('Erro ao buscar perguntas.');
            return [];
        }
        return response.json();
    }

    async function getQuestionById(id) {
        const response = await fetch(`/api/perguntas/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar pergunta.');
        }
        return response.json();
    }
    
    async function getAllSubjects() {
        const response = await fetch('/api/perguntas/subjects');
        if (!response.ok) {
            console.error('Erro ao buscar assuntos das perguntas.');
            return [];
        }
        return response.json();
    }

    async function updateQuestion(id, updatedData) {
        const response = await fetch(`/api/perguntas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar pergunta.');
        }
        return response.json();
    }

    async function deleteQuestion(id) {
        const response = await fetch(`/api/perguntas/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir pergunta.');
        }
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
