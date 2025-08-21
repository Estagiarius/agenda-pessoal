(function() {
    'use strict';

    window.initMaterialsView = async function() {
        const uploadForm = document.getElementById('upload-material-form');
        const existingMaterialsList = document.getElementById('existing-materials-list');
        const searchInput = document.getElementById('materials-search-input');

        function renderMaterials(materials) {
            existingMaterialsList.innerHTML = '';
            if (!materials || materials.length === 0) {
                existingMaterialsList.innerHTML = '<li class="list-group-item text-muted">Nenhum material encontrado.</li>';
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

        let allMaterials = await window.materialService.getMaterials();
        renderMaterials(allMaterials);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredMaterials = allMaterials.filter(material =>
                material.title.toLowerCase().includes(query) ||
                (material.tags && material.tags.some(tag => tag.toLowerCase().includes(query))) ||
                (material.type && material.type.toLowerCase().includes(query))
            );
            renderMaterials(filteredMaterials);
        });

        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('material-file');
            const titleInput = document.getElementById('material-title');
            const tagsInput = document.getElementById('material-tags');
            const formData = new FormData();

            if (!fileInput.files[0]) {
                alert("Por favor, selecione um arquivo.");
                return;
            }

            formData.append('file', fileInput.files[0]);
            formData.append('title', titleInput.value);
            formData.append('tags', tagsInput.value);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.text();
                console.log('Upload result:', result);
                uploadForm.reset();

                allMaterials = await window.materialService.getMaterials();
                renderMaterials(allMaterials);
                showToast('Material enviado com sucesso!');
            } catch (error) {
                console.error('Error uploading file:', error);
                showToast('Erro ao enviar material.', 'error');
            }
        });
    };
})();
