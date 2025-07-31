(function() {
    'use strict';

    window.materialService = {};

    let materials = [];

    function loadMaterials() {
        return fetch('/api/materials')
            .then(response => {
                if (!response.ok) {
                    console.error('Failed to load materials from server.');
                    return [];
                }
                return response.json();
            })
            .then(data => {
                materials = data;
                return materials;
            })
            .catch((error) => {
                console.error('Error loading materials:', error);
                materials = [];
                return materials;
            });
    }

    window.materialService.getMaterials = function() {
        return materials;
    };

    window.materialService.loadMaterials = loadMaterials;

    window.materialService.searchMaterials = function(query) {
        if (!query) {
            return materials;
        }
        const lowerCaseQuery = query.toLowerCase();
        return materials.filter(material =>
            material.title.toLowerCase().includes(lowerCaseQuery) ||
            (material.tags && material.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))) ||
            (material.type && material.type.toLowerCase().includes(lowerCaseQuery))
        );
    };

})();
