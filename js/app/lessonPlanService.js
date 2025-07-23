(function() {
    'use strict';

    window.lessonPlanService = {};

    const lessonPlansKey = 'lessonPlans';

    function getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error reading data from ${key} from localStorage`, e);
            return [];
        }
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data to ${key} in localStorage`, e);
        }
    }

    window.lessonPlanService.getLessonPlans = function() {
        return getData(lessonPlansKey);
    };

    window.lessonPlanService.getLessonPlanById = function(id) {
        return this.getLessonPlans().find(lp => lp.id === id);
    };

    window.lessonPlanService.getLessonPlansByClass = function(classId) {
        if (!classId) {
            return this.getLessonPlans();
        }
        return this.getLessonPlans().filter(lp => lp.classIds.includes(classId));
    };

    window.lessonPlanService.addLessonPlan = function(lessonPlanData) {
        const lessonPlans = this.getLessonPlans();
        const newLessonPlan = {
            id: `lp_${new Date().getTime()}`,
            createdAt: new Date().toISOString(),
            ...lessonPlanData
        };
        lessonPlans.push(newLessonPlan);
        saveData(lessonPlansKey, lessonPlans);
        return newLessonPlan;
    };

    window.lessonPlanService.updateLessonPlan = function(id, updatedData) {
        let lessonPlans = this.getLessonPlans();
        const index = lessonPlans.findIndex(lp => lp.id === id);
        if (index !== -1) {
            lessonPlans[index] = { ...lessonPlans[index], ...updatedData };
            saveData(lessonPlansKey, lessonPlans);
        }
    };

    window.lessonPlanService.deleteLessonPlan = function(id) {
        let lessonPlans = this.getLessonPlans();
        lessonPlans = lessonPlans.filter(lp => lp.id !== id);
        saveData(lessonPlansKey, lessonPlans);
    };

    window.lessonPlanService.duplicateLessonPlan = function(id) {
        const originalLessonPlan = this.getLessonPlanById(id);
        if (originalLessonPlan) {
            const duplicatedLessonPlan = { ...originalLessonPlan };
            delete duplicatedLessonPlan.id;
            delete duplicatedLessonPlan.createdAt;
            return this.addLessonPlan(duplicatedLessonPlan);
        }
    };
})();
