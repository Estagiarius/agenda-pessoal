(function() {
    'use strict';

    window.lessonPlanService = {};

    // All lesson plan data is now managed by the backend API.

    window.lessonPlanService.getLessonPlans = async function() {
        const response = await fetch('/api/planos_de_aula');
        if (!response.ok) {
            console.error('Erro ao buscar planos de aula.');
            return [];
        }
        return response.json();
    };

    window.lessonPlanService.getLessonPlanById = async function(id) {
        const response = await fetch(`/api/planos_de_aula/${id}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error('Erro ao buscar plano de aula.');
        }
        return response.json();
    };

    window.lessonPlanService.getLessonPlansByClass = async function(classId) {
        if (!classId) {
            return this.getLessonPlans();
        }
        // This filtering is now done on the client side after fetching all plans.
        // For a large number of plans, a dedicated API endpoint would be better,
        // e.g., /api/turmas/{classId}/planos_de_aula
        const allPlans = await this.getLessonPlans();
        return allPlans.filter(lp => lp.classIds.includes(classId));
    };

    window.lessonPlanService.addLessonPlan = async function(lessonPlanData) {
        const response = await fetch('/api/planos_de_aula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonPlanData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar plano de aula.');
        }
        return response.json();
    };

    window.lessonPlanService.updateLessonPlan = async function(id, updatedData) {
        const response = await fetch(`/api/planos_de_aula/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar plano de aula.');
        }
        return response.json();
    };

    window.lessonPlanService.deleteLessonPlan = async function(id) {
        const response = await fetch(`/api/planos_de_aula/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao excluir plano de aula.');
        }
    };

    window.lessonPlanService.duplicateLessonPlan = async function(id) {
        const originalLessonPlan = await this.getLessonPlanById(id);
        if (originalLessonPlan) {
            const duplicatedLessonPlan = { ...originalLessonPlan };
            // Remove fields that should be new in the duplicated version
            delete duplicatedLessonPlan.id;
            delete duplicatedLessonPlan.created_at; // Note the snake_case from the server

            // The title could be modified to indicate it's a copy
            duplicatedLessonPlan.title = `${duplicatedLessonPlan.title} (Cópia)`;

            return this.addLessonPlan(duplicatedLessonPlan);
        }
    };
})();
