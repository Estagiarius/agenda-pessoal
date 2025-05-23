// js/app/classService.js
(function(window) {
    'use strict';

    // Hardcoded list of classes for now
    const classes = [
        { id: 1, name: 'Math Grade 10A' },
        { id: 2, name: 'Physics Grade 11B' },
        { id: 3, name: 'History Grade 9C' }
    ];

    let nextClassId = 4; // To ensure new IDs are unique if we add an addClass function later

    function getClasses() {
        return [...classes]; // Return a copy to prevent direct modification
    }

    // Placeholder for adding a new class if needed in the future
    // function addClass(className) {
    //     if (!className || className.trim() === '') {
    //         console.error('Class name cannot be empty.');
    //         return null;
    //     }
    //     const newClass = {
    //         id: nextClassId++,
    //         name: className.trim()
    //     };
    //     classes.push(newClass);
    //     console.log('Class added:', newClass);
    //     return newClass;
    // }
    
    // Expose public functions
    window.classService = {
        getClasses: getClasses
        // addClass: addClass // Expose later if functionality is added
    };

})(window);
