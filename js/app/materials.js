(function() {
    'use strict';

    window.initMaterialsView = function() {
        const uploadForm = document.getElementById('upload-material-form');
        const existingMaterialsList = document.getElementById('existing-materials-list');
        const searchInput = document.getElementById('materials-search-input');

        function renderMaterials(materials) {
            existingMaterialsList.innerHTML = '';
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

        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('material-file');
            const titleInput = document.getElementById('material-title');
            const tagsInput = document.getElementById('material-tags');
            const formData = new FormData();

            formData.append('file', fileInput.files[0]);
            formData.append('title', titleInput.value);
            formData.append('tags', tagsInput.value);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                console.log('Upload result:', result);
                uploadForm.reset();
                window.materialService.loadMaterials().then(renderMaterials);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        });
    };
})();
