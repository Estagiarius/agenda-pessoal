(function() {
    'use strict';

    window.initLessonPlansView = async function() {
        const [lessonPlans, classes, subjects] = await Promise.all([
            window.lessonPlanService.getLessonPlans(),
            window.educationService.getClasses(),
            window.educationService.getSubjects()
        ]);

        const listBody = document.getElementById('lesson-plans-list');
        const classFilter = document.getElementById('class-filter');

        const subjectMap = subjects.reduce((map, subject) => {
            map[subject.id] = subject.nome;
            return map;
        }, {});

        classFilter.innerHTML = '<option value="all">Todas as Turmas</option>';
        classes.forEach(cls => {
            classFilter.innerHTML += `<option value="${cls.id}">${cls.nome}</option>`;
        });

        const renderList = (plans) => {
            listBody.innerHTML = '';
            plans.forEach(plan => {
                const classNames = (plan.classIds || []).map(classId => classes.find(c => c.id === classId)?.nome || '').join(', ');
                const subjectIds = (plan.classIds || []).map(classId => classes.find(c => c.id === classId)?.id_disciplina);
                const subjectNames = [...new Set(subjectIds.filter(Boolean).map(id => subjectMap[id]))].join(', ');
                const row = `
                    <tr style="cursor: pointer;" onclick="window.location.hash='#/lesson-plans/details/${plan.id}'">
                        <td>${plan.title}</td>
                        <td>${subjectNames}</td>
                        <td>${new Date(plan.created_at).toLocaleDateString()}</td>
                        <td>
                            <a href="#/lesson-plans/details/${plan.id}" class="btn btn-xs btn-primary">Ver Detalhes</a>
                            <a href="#/lesson-plans/edit/${plan.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteLessonPlanWrapper(event, '${plan.id}')">Excluir</button>
                        </td>
                    </tr>`;
                listBody.innerHTML += row;
            });
        };

        renderList(lessonPlans);

        classFilter.addEventListener('change', (e) => {
            const selectedClassId = e.target.value;
            renderList(selectedClassId === 'all' ? lessonPlans : lessonPlans.filter(p => (p.classIds || []).includes(selectedClassId)));
        });
    };

    window.deleteLessonPlanWrapper = function(event, id) {
        event.stopPropagation();
        showConfirmationModal('Tem certeza que deseja excluir este plano de aula?', async function() {
            await window.lessonPlanService.deleteLessonPlan(id);
            showToast('Plano de aula excluído com sucesso!');
            await initLessonPlansView();
        });
    }

    window.initLessonPlanFormView = async function(lessonPlanId) {
        const form = document.getElementById('lesson-plan-form');
        const titleEl = document.getElementById('lesson-plan-form-title');
        const idField = document.getElementById('lesson-plan-id');
        const titleField = document.getElementById('lesson-plan-title');
        const classesField = document.getElementById('lesson-plan-classes');
        const dateField = document.getElementById('lesson-plan-date');
        const objectivesField = document.getElementById('lesson-plan-objectives');
        const methodologyField = document.getElementById('lesson-plan-methodology');
        const resourcesField = document.getElementById('lesson-plan-resources');
        const materialsContainer = document.getElementById('lesson-plan-materials');
        const evaluationsContainer = document.getElementById('lesson-plan-evaluations');
        const saveAndDuplicateBtn = document.getElementById('save-and-duplicate-btn');

        let attachedMaterialIds = [];
        let linkedEvaluationIds = [];

        const [classes, allMaterials, allEvaluations] = await Promise.all([
            window.educationService.getClasses(),
            window.materialService.getMaterials(),
            window.educationService.getAllEvaluations()
        ]);

        classes.forEach(cls => {
            classesField.innerHTML += `<option value="${cls.id}">${cls.nome}</option>`;
        });

        if (lessonPlanId) {
            titleEl.textContent = 'Editar Plano de Aula';
            const lessonPlan = await window.lessonPlanService.getLessonPlanById(lessonPlanId);
            if (lessonPlan) {
                idField.value = lessonPlan.id;
                titleField.value = lessonPlan.title;
                (lessonPlan.classIds || []).forEach(classId => {
                    const option = classesField.querySelector(`option[value="${classId}"]`);
                    if (option) option.selected = true;
                });
                dateField.value = lessonPlan.date;
                objectivesField.value = lessonPlan.objectives;
                methodologyField.value = lessonPlan.methodology;
                resourcesField.value = lessonPlan.resources;
                attachedMaterialIds = lessonPlan.materialIds || [];
                linkedEvaluationIds = lessonPlan.evaluationIds || [];
                await renderAttachedLists();
            }
        } else {
            titleEl.textContent = 'Criar Novo Plano de Aula';
        }

        async function renderAttachedLists() {
            materialsContainer.innerHTML = '';
            for (const materialId of attachedMaterialIds) {
                const material = allMaterials.find(m => m.id === materialId);
                if(material) materialsContainer.innerHTML += `<li class="list-group-item">${material.title}<button type="button" class="btn btn-xs btn-danger pull-right" onclick="removeAttachedMaterial('${material.id}')">Remover</button></li>`;
            }

            evaluationsContainer.innerHTML = '';
            for (const evaluationId of linkedEvaluationIds) {
                const evaluation = allEvaluations.find(e => e.id === evaluationId);
                if(evaluation) evaluationsContainer.innerHTML += `<li class="list-group-item">${evaluation.nome}<button type="button" class="btn btn-xs btn-danger pull-right" onclick="removeLinkedEvaluation('${evaluation.id}')">Remover</button></li>`;
            }
        }

        window.removeAttachedMaterial = (id) => { attachedMaterialIds = attachedMaterialIds.filter(i => i !== id); renderAttachedLists(); };
        window.removeLinkedEvaluation = (id) => { linkedEvaluationIds = linkedEvaluationIds.filter(i => i !== id); renderAttachedLists(); };

        form.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                title: titleField.value,
                classIds: Array.from(classesField.selectedOptions).map(opt => opt.value),
                date: dateField.value,
                objectives: objectivesField.value,
                methodology: methodologyField.value,
                resources: resourcesField.value,
                materialIds: attachedMaterialIds,
                evaluationIds: linkedEvaluationIds
            };
            if (idField.value) {
                await window.lessonPlanService.updateLessonPlan(idField.value, data);
            } else {
                await window.lessonPlanService.addLessonPlan(data);
            }
            window.location.hash = '#/lesson-plans';
        };

        saveAndDuplicateBtn.onclick = async () => {
            const data = {
                title: titleField.value,
                classIds: Array.from(classesField.selectedOptions).map(opt => opt.value),
                date: dateField.value,
                objectives: objectivesField.value,
                methodology: methodologyField.value,
                resources: resourcesField.value,
                materialIds: attachedMaterialIds,
                evaluationIds: linkedEvaluationIds
            };
            let planToDuplicateId;
            if (idField.value) {
                await window.lessonPlanService.updateLessonPlan(idField.value, data);
                planToDuplicateId = idField.value;
            } else {
                const newPlan = await window.lessonPlanService.addLessonPlan(data);
                planToDuplicateId = newPlan.id;
            }
            await window.lessonPlanService.duplicateLessonPlan(planToDuplicateId);
            window.location.hash = '#/lesson-plans';
        };

        document.getElementById('attach-material-btn').onclick = async () => {
            const materialsList = document.getElementById('materials-list');
            renderMaterials(allMaterials);
            $('#attachMaterialModal').modal('show');
            document.getElementById('attach-selected-materials-btn').onclick = () => {
                materialsList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                    if (!attachedMaterialIds.includes(checkbox.value)) attachedMaterialIds.push(checkbox.value);
                });
                renderAttachedLists();
                $('#attachMaterialModal').modal('hide');
            };
        };

        document.getElementById('link-evaluation-btn').onclick = () => {
            const evaluationsList = document.getElementById('evaluations-list');
            evaluationsList.innerHTML = '';
            allEvaluations.forEach(evaluation => {
                evaluationsList.innerHTML += `<li class="list-group-item"><input type="checkbox" value="${evaluation.id}" style="margin-right: 10px;"> ${evaluation.nome}</li>`;
            });
            $('#linkEvaluationModal').modal('show');
            document.getElementById('link-selected-evaluations-btn').onclick = () => {
                evaluationsList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                    if (!linkedEvaluationIds.includes(checkbox.value)) linkedEvaluationIds.push(checkbox.value);
                });
                renderAttachedLists();
                $('#linkEvaluationModal').modal('hide');
            };
        };
    };

    window.initLessonPlanDetailsView = async function(lessonPlanId) {
        const lessonPlan = await window.lessonPlanService.getLessonPlanById(lessonPlanId);
        if (!lessonPlan) return;

        document.getElementById('lesson-plan-details-title').textContent = lessonPlan.title;
        document.getElementById('lesson-plan-details-date').textContent = new Date(lessonPlan.date).toLocaleDateString();

        const classes = await window.educationService.getClasses();
        const classNames = (lessonPlan.classIds || []).map(classId => classes.find(c => c.id === classId)?.nome || '').join(', ');
        document.getElementById('lesson-plan-details-classes').textContent = classNames;

        document.getElementById('lesson-plan-details-objectives').innerHTML = marked.parse(lessonPlan.objectives || '');
        document.getElementById('lesson-plan-details-methodology').innerHTML = marked.parse(lessonPlan.methodology || '');
        document.getElementById('lesson-plan-details-resources').textContent = lessonPlan.resources;

        const materialsContainer = document.getElementById('lesson-plan-details-materials');
        materialsContainer.innerHTML = '';
        if (lessonPlan.materialIds) {
            for(const materialId of lessonPlan.materialIds) {
                const material = await window.materialService.getMaterialById(materialId);
                if (material) {
                    materialsContainer.innerHTML += `<li class="list-group-item"><a href="${material.url}" target="_blank">${material.title}</a></li>`;
                }
            }
        }

        const evaluationsContainer = document.getElementById('lesson-plan-details-evaluations');
        evaluationsContainer.innerHTML = '';
        if(lessonPlan.evaluationIds) {
            for(const evaluationId of lessonPlan.evaluationIds) {
                const evaluation = await window.educationService.getEvaluationById(evaluationId);
                if (evaluation) {
                    evaluationsContainer.innerHTML += `<li class="list-group-item">${evaluation.nome}</li>`;
                }
            }
        }
    };
})();
