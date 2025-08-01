(function() {
    'use strict';

    window.initMaterialsView = function() {
        const existingMaterialsList = document.getElementById('existing-materials-list');
        const searchInput = document.getElementById('materials-search-input');

        function renderMaterials(materials) {
            existingMaterialsList.innerHTML = '';
            if (materials.length === 0) {
                existingMaterialsList.innerHTML = '<li class="list-group-item">Nenhum material encontrado.</li>';
                return;
            }
            materials.forEach(material => {
                const item = `
                    <li class="list-group-item">
                        ${material.title}
                        <a href="${material.url}" target="_blank" class="btn btn-xs btn-primary pull-right">Visualizar</a>
                        <span class="text-muted pull-right" style="margin-right: 10px;">${material.type}</span>
                    </li>
                `;
                existingMaterialsList.innerHTML += item;
            });
        }

        window.materialService.loadMaterials().then(renderMaterials);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const filteredMaterials = window.materialService.searchMaterials(query);
            renderMaterials(filteredMaterials);
        });
    };
})();
