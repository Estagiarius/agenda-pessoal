// js/app/assignmentService.js
(function(window) {
    'use strict';

    let assignments = [];
    let nextAssignmentId = 1;

    // Expected input: { classId, title, description, dueDate }
    function addAssignment(assignmentObject) {
        if (!assignmentObject || !assignmentObject.classId || !assignmentObject.title || !assignmentObject.dueDate) {
            console.error('Assignment object must have classId, title, and dueDate.');
            return null;
        }
        const newAssignment = {
            id: nextAssignmentId++,
            classId: parseInt(assignmentObject.classId), // Ensure classId is an integer
            title: assignmentObject.title,
            description: assignmentObject.description || '',
            dueDate: assignmentObject.dueDate, // Expected 'YYYY-MM-DD'
            status: 'Pending' // Default status
        };
        assignments.push(newAssignment);
        // console.log('Assignment added:', newAssignment);
        // console.log('All assignments:', assignments);
        return newAssignment;
    }

    function getAssignments() {
        return [...assignments]; // Return a copy
    }

    function getAssignmentsByClass(classId) {
        const id = parseInt(classId);
        return assignments.filter(assignment => assignment.classId === id);
    }

    // For individual assignment status update - can be enhanced later
    function updateAssignmentStatus(assignmentId, newStatus) {
        const id = parseInt(assignmentId);
        const assignment = assignments.find(a => a.id === id);
        if (assignment) {
            assignment.status = newStatus;
            // console.log('Updated assignment status:', assignment);
            return assignment;
        }
        console.error('Assignment not found for status update:', id);
        return null;
    }

    // Marks all assignments for a given classId as 'Graded'
    function markAllAssignmentsGradedForClass(classId) {
        const id = parseInt(classId);
        let updatedCount = 0;
        assignments.forEach(assignment => {
            if (assignment.classId === id) {
                assignment.status = 'Graded';
                updatedCount++;
            }
        });
        // console.log(`Marked ${updatedCount} assignments as 'Graded' for classId ${id}`);
        return updatedCount > 0;
    }
    
    window.assignmentService = {
        addAssignment: addAssignment,
        getAssignments: getAssignments,
        getAssignmentsByClass: getAssignmentsByClass,
        updateAssignmentStatus: updateAssignmentStatus,
        markAllAssignmentsGradedForClass: markAllAssignmentsGradedForClass
    };

})(window);
