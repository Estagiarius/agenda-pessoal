(function() {
    'use strict';

    window.lessonPlanService = {};

    // Helper para chamadas de API
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ocorreu um erro na solicitação de planos de aula à API.');
        }
        if (response.status === 204) { // No Content
            return;
        }
        return response.json();
    }

    window.lessonPlanService.getLessonPlans = async function() {
        return apiRequest('/api/lesson-plans');
    };

    window.lessonPlanService.getLessonPlanById = async function(id) {
        return apiRequest(`/api/lesson-plans/${id}`);
    };

    window.lessonPlanService.getLessonPlansByClass = async function(classId) {
        const allPlans = await this.getLessonPlans();
        if (!classId) {
            return allPlans;
        }
        return allPlans.filter(lp => lp.classIds.includes(classId));
    };

    window.lessonPlanService.addLessonPlan = async function(lessonPlanData) {
        const newPlanPayload = {
            createdAt: new Date().toISOString(),
            ...lessonPlanData
        };
        return apiRequest('/api/lesson-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPlanPayload)
        });
    };

    window.lessonPlanService.updateLessonPlan = async function(id, updatedData) {
        return apiRequest(`/api/lesson-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
    };

    window.lessonPlanService.deleteLessonPlan = async function(id) {
        return apiRequest(`/api/lesson-plans/${id}`, { method: 'DELETE' });
    };

    window.lessonPlanService.duplicateLessonPlan = async function(id) {
        const originalLessonPlan = await this.getLessonPlanById(id);
        if (originalLessonPlan) {
            const { id: originalId, createdAt, ...duplicatedData } = originalLessonPlan;
            return this.addLessonPlan(duplicatedData);
        }
    };
})();
