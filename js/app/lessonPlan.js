(function() {
    'use strict';

    // --- Helper Functions ---
    function showLoading(element) {
        element.innerHTML = '<tr><td colspan="100%">Carregando...</td></tr>';
    }
    function showError(element, message) {
        element.innerHTML = `<tr><td colspan="100%" class="text-danger">${message}</td></tr>`;
    }

    // --- View de Planos de Aula ---
    window.initLessonPlansView = async function() {
        const listBody = document.getElementById('lesson-plans-list');
        const classFilter = document.getElementById('class-filter');
        showLoading(listBody);

        try {
            const [lessonPlans, classes, subjects] = await Promise.all([
                window.lessonPlanService.getLessonPlans(),
                window.educationService.getClasses(),
                window.educationService.getSubjects()
            ]);

            const subjectMap = subjects.reduce((map, s) => { map[s.id] = s.name; return map; }, {});

            classFilter.innerHTML = '<option value="all">Todas as Turmas</option>';
            classes.forEach(cls => { classFilter.innerHTML += `<option value="${cls.id}">${cls.name}</option>`; });

            const renderList = (plans) => {
                listBody.innerHTML = '';
                if (plans.length === 0) {
                    listBody.innerHTML = '<tr><td colspan="4">Nenhum plano de aula encontrado.</td></tr>';
                    return;
                }
                plans.forEach(plan => {
                    const classNames = plan.classIds.map(cid => classes.find(c => c.id === cid)?.name || '').join(', ');
                    const subjectNames = [...new Set(plan.classIds.map(cid => classes.find(c => c.id === cid)?.subjectId).map(sid => subjectMap[sid]))].join(', ');
                    listBody.innerHTML += `
                        <tr style="cursor: pointer;" onclick="window.location.hash='#/lesson-plans/details/${plan.id}'">
                            <td>${plan.title}</td>
                            <td>${subjectNames}</td>
                            <td>${new Date(plan.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-xs btn-danger" onclick="deleteLessonPlanWrapper(event, '${plan.id}')">Excluir</button>
                            </td>
                        </tr>
                    `;
                });
            };

            renderList(lessonPlans);
            classFilter.onchange = () => {
                const selectedId = classFilter.value;
                const filtered = selectedId === 'all' ? lessonPlans : lessonPlans.filter(p => p.classIds.includes(selectedId));
                renderList(filtered);
            };

        } catch (error) {
            showError(listBody, 'Erro ao carregar planos de aula.');
            console.error(error);
        }
    };

    window.deleteLessonPlanWrapper = function(event, id) {
        event.stopPropagation();
        showConfirmationModal('Tem certeza que deseja excluir este plano de aula?', async function() {
            try {
                await window.lessonPlanService.deleteLessonPlan(id);
                showToast('Plano de aula excluído com sucesso!');
                initLessonPlansView();
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        });
    };

    // --- Formulário de Plano de Aula ---
    window.initLessonPlanFormView = async function(lessonPlanId) {
        const form = document.getElementById('lesson-plan-form');
        // ... get all form fields ...

        try {
            const classes = await window.educationService.getClasses();
            // ... populate classes dropdown ...

            if (lessonPlanId) {
                const lessonPlan = await window.lessonPlanService.getLessonPlanById(lessonPlanId);
                // ... populate form with lessonPlan data ...
            }
        } catch (error) {
            alert('Erro ao carregar dados para o formulário.');
            console.error(error);
        }

        form.onsubmit = async function(e) {
            e.preventDefault();
            const data = { /* ... get data from form ... */ };
            try {
                if (lessonPlanId) {
                    await window.lessonPlanService.updateLessonPlan(lessonPlanId, data);
                } else {
                    await window.lessonPlanService.addLessonPlan(data);
                }
                window.location.hash = '#/lesson-plans';
            } catch (error) {
                alert('Erro ao salvar plano de aula: ' + error.message);
            }
        };
        // ... other event listeners like duplicate, attach material, etc. must also be async ...
    };

    // --- Detalhes do Plano de Aula ---
    window.initLessonPlanDetailsView = async function(lessonPlanId) {
        try {
            const lessonPlan = await window.lessonPlanService.getLessonPlanById(lessonPlanId);
            if (!lessonPlan) {
                document.getElementById('main-content-area').innerHTML = '<h2>Plano de Aula não encontrado.</h2>';
                return;
            }

            const [classes, materials, evaluations] = await Promise.all([
                window.educationService.getClasses(),
                window.materialService.getMaterials(), // Assuming materialService will also be async
                window.educationService.getEvaluationsByClass(lessonPlan.classIds)
            ]);

            // ... render all details using the fetched data ...

        } catch (error) {
            document.getElementById('main-content-area').innerHTML = '<h2>Erro ao carregar detalhes do plano de aula.</h2>';
            console.error(error);
        }
    };

})();
// Note: This is a simplified representation. A full implementation would require
// making all event handlers and helper functions that call services async,
// and properly handling loading/error states for each part of the UI.
// For example, the modal logic for attaching materials would also need to be async.
