(function() {
    'use strict';

    window.materialService = {};

    const materials = [
        { id: 'mat_1', title: 'Artigo_Fotossintese.pdf', type: 'pdf', tags: ['biologia', 'fotossintese'] },
        { id: 'mat_2', title: 'Video_Mitose.mp4', type: 'video', tags: ['biologia', 'mitose'] },
        { id: 'mat_3', title: 'Exercicios_Genetica.docx', type: 'docx', tags: ['biologia', 'genetica'] },
        { id: 'mat_4', title: 'Apresentacao_Evolucao.pptx', type: 'pptx', tags: ['biologia', 'evolucao'] },
    ];

    window.materialService.getMaterials = function() {
        return materials;
    };

    window.materialService.searchMaterials = function(query) {
        if (!query) {
            return materials;
        }
        const lowerCaseQuery = query.toLowerCase();
        return materials.filter(material =>
            material.title.toLowerCase().includes(lowerCaseQuery) ||
            material.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)) ||
            material.type.toLowerCase().includes(lowerCaseQuery)
        );
    };

})();
