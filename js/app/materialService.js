(function() {
    'use strict';

    window.materialService = {};

    let materials = [];

    function loadMaterials() {
        console.warn("A funcionalidade de upload de materiais está desativada. Nenhum material será carregado.");
        materials = [];
        return Promise.resolve(materials);
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
