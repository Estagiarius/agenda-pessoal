(function() {
    'use strict';

    window.lessonPlanService = {};

    let lessonPlans = [];

    async function loadLessonPlans() {
        try {
            const response = await fetch('/api/lesson-plans');
            if (!response.ok) {
                throw new Error('Failed to fetch lesson plans from server.');
            }
            lessonPlans = await response.json();
            return lessonPlans;
        } catch (error) {
            console.error('Error loading lesson plans:', error);
            lessonPlans = [];
            return [];
        }
    }

    function getLessonPlans() {
        return [...lessonPlans];
    }

    function getLessonPlanById(id) {
        return lessonPlans.find(lp => lp.id === id);
    }

    function getLessonPlansByClass(classId) {
        if (!classId) {
            return getLessonPlans();
        }
        return lessonPlans.filter(lp => lp.classIds.includes(classId));
    }

    async function addLessonPlan(lessonPlanData) {
        try {
            const response = await fetch('/api/lesson-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lessonPlanData)
            });

            if (!response.ok) {
                throw new Error('Failed to add lesson plan.');
            }
            const addedPlan = await response.json();
            lessonPlans.push(addedPlan);
            return addedPlan;
        } catch (error) {
            console.error('Error adding lesson plan:', error);
            return null;
        }
    }

    async function updateLessonPlan(id, updatedData) {
        try {
            const response = await fetch(`/api/lesson-plans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update lesson plan.');
            }
            const updatedPlan = await response.json();
            const index = lessonPlans.findIndex(lp => lp.id === id);
            if (index !== -1) {
                lessonPlans[index] = updatedPlan;
            }
            return updatedPlan;
        } catch (error) {
            console.error('Error updating lesson plan:', error);
            return null;
        }
    }

    async function deleteLessonPlan(id) {
        try {
            const response = await fetch(`/api/lesson-plans/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete lesson plan.');
            }
            const index = lessonPlans.findIndex(lp => lp.id === id);
            if (index !== -1) {
                lessonPlans.splice(index, 1);
            }
            return true;
        } catch (error) {
            console.error('Error deleting lesson plan:', error);
            return false;
        }
    }

    async function duplicateLessonPlan(id) {
        const originalLessonPlan = getLessonPlanById(id);
        if (originalLessonPlan) {
            const { id: oldId, createdAt, ...duplicatedData } = originalLessonPlan;
            return await addLessonPlan(duplicatedData);
        }
        return null;
    }

    // Initial load
    loadLessonPlans();

    window.lessonPlanService = {
        loadLessonPlans,
        getLessonPlans,
        getLessonPlanById,
        getLessonPlansByClass,
        addLessonPlan,
        updateLessonPlan,
        deleteLessonPlan,
        duplicateLessonPlan
    };
})();
