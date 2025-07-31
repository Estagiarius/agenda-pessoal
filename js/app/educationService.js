(function() {
    'use strict';

    window.educationService = {};

    // --- Helper for API calls ---
    async function apiCall(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'API call failed');
            }
            if (response.status === 204) { // No Content
                return null;
            }
            return response.json();
        } catch (error) {
            console.error(`Error with ${method} ${url}:`, error);
            throw error;
        }
    }

    // --- Subjects ---
    window.educationService.getSubjects = () => apiCall('/api/subjects');
    window.educationService.addSubject = (data) => apiCall('/api/subjects', 'POST', data);
    window.educationService.updateSubject = (id, data) => apiCall(`/api/subjects/${id}`, 'PUT', data);
    window.educationService.deleteSubject = (id) => apiCall(`/api/subjects/${id}`, 'DELETE');
    // getSubjectById can be implemented on the client-side by filtering getSubjects result if needed

    // --- Classes ---
    window.educationService.getClasses = () => apiCall('/api/classes');
    window.educationService.addClass = (data) => apiCall('/api/classes', 'POST', data);
    window.educationService.updateClass = (id, data) => apiCall(`/api/classes/${id}`, 'PUT', data);
    window.educationService.deleteClass = (id) => apiCall(`/api/classes/${id}`, 'DELETE');
    // getClassById can be implemented on the client-side

    // --- Students ---
    window.educationService.getStudents = () => apiCall('/api/students');
    window.educationService.getStudentsByClass = (classId) => apiCall(`/api/students?class_id=${classId}`);
    window.educationService.addStudent = (data) => apiCall('/api/students', 'POST', data);
    window.educationService.updateStudent = (id, data) => apiCall(`/api/students/${id}`, 'PUT', data);
    window.educationService.deleteStudent = (id) => apiCall(`/api/students/${id}`, 'DELETE');

    // --- Enrollments ---
    window.educationService.enrollStudentInClass = (classId, studentId) => apiCall(`/api/classes/${classId}/students`, 'POST', { studentId });
    window.educationService.removeStudentFromClass = (classId, studentId) => apiCall(`/api/classes/${classId}/students/${studentId}`, 'DELETE');

    // --- Evaluations ---
    window.educationService.addEvaluation = (data) => apiCall('/api/evaluations', 'POST', data);
    window.educationService.updateEvaluation = (id, data) => apiCall(`/api/evaluations/${id}`, 'PUT', data);
    window.educationService.deleteEvaluation = (id) => apiCall(`/api/evaluations/${id}`, 'DELETE');
    // getEvaluationsByClass will need to be implemented or handled client-side

    // --- Grades ---
    window.educationService.getGradesByEvaluation = (evalId) => apiCall(`/api/evaluations/${evalId}/grades`);
    window.educationService.saveGrades = (evalId, grades) => apiCall(`/api/evaluations/${evalId}/grades`, 'POST', grades);

    // --- Complex functions that might need adjustment or be replaced by backend logic ---
    // Note: Some of the original functions had client-side logic that might need to be moved
    // to the backend or adjusted. For example, calculating reports.

    // This function can be replaced by a dedicated backend endpoint if complex reports are needed.
    window.educationService.calculateClassReport = async function(classId) {
        const students = await this.getStudentsByClass(classId);
        // This is a simplified version. A real implementation would need to fetch evaluations and grades.
        console.warn("calculateClassReport is now a simplified placeholder and should be implemented on the backend for full functionality.");
        return { report: students.map(s => ({ studentId: s.id, studentName: s.name, finalGrade: 'N/A' })), evaluations: [] };
    };

})();
