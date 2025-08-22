(function() {
    'use strict';

    window.materialService = {};

    async function getMaterials() {
        const response = await fetch('/api/materials');
        if (!response.ok) {
            console.error("Erro ao buscar materiais.");
            return [];
        }
        return response.json();
    }

    async function getMaterialById(id) {
        const response = await fetch(`/api/materials/${id}`);
        if (!response.ok) {
            if(response.status === 404) return undefined;
            throw new Error('Erro ao buscar material.');
        }
        return response.json();
    }

    // The search can now be done on the server if desired, but for now we'll fetch all and filter client-side.
    async function searchMaterials(query) {
        const materials = await getMaterials();
        if (!query) {
            return materials;
        }
        const lowerCaseQuery = query.toLowerCase();
        return materials.filter(material =>
            material.title.toLowerCase().includes(lowerCaseQuery) ||
            (material.tags && material.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))) ||
            (material.type && material.type.toLowerCase().includes(lowerCaseQuery))
        );
    }

    window.materialService.getMaterials = getMaterials;
    window.materialService.getMaterialById = getMaterialById;
    window.materialService.searchMaterials = searchMaterials;
    // Deprecate loadMaterials as getMaterials is now the primary async way to get data.
    window.materialService.loadMaterials = getMaterials;

})();
