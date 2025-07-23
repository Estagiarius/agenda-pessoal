(function() {
    'use strict';

    window.initLessonPlansView = function() {
        const lessonPlans = window.lessonPlanService.getLessonPlans();
        const classes = window.educationService.getClasses();
        const subjects = window.educationService.getSubjects();
        const listBody = document.getElementById('lesson-plans-list');
        const classFilter = document.getElementById('class-filter');

        const subjectMap = subjects.reduce((map, subject) => {
            map[subject.id] = subject.name;
            return map;
        }, {});

        classes.forEach(cls => {
            const option = `<option value="${cls.id}">${cls.name}</option>`;
            classFilter.innerHTML += option;
        });

        const renderList = (plans) => {
            listBody.innerHTML = '';
            plans.forEach(plan => {
                const classNames = plan.classIds.map(classId => classes.find(c => c.id === classId)?.name || 'Turma não encontrada').join(', ');
                const subjectNames = [...new Set(plan.classIds.map(classId => classes.find(c => c.id === classId)?.subjectId).map(subjectId => subjectMap[subjectId]))].join(', ');
                const row = `
                    <tr>
                        <td>${plan.title}</td>
                        <td>${subjectNames}</td>
                        <td>${new Date(plan.createdAt).toLocaleDateString()}</td>
                        <td>
                            <a href="#/lesson-plans/edit/${plan.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteLessonPlan('${plan.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
                listBody.innerHTML += row;
            });
        };

        renderList(lessonPlans);

        classFilter.addEventListener('change', (e) => {
            const selectedClassId = e.target.value;
            if (selectedClassId === 'all') {
                renderList(lessonPlans);
            } else {
                const filteredPlans = lessonPlans.filter(p => p.classIds.includes(selectedClassId));
                renderList(filteredPlans);
            }
        });

        // Basic calendar rendering (can be improved with a library)
        const calendarDiv = document.getElementById('lesson-plan-calendar');
        const calendarEvents = lessonPlans.map(plan => ({
            title: plan.title,
            start: plan.date,
            extendedProps: {
                plan: plan
            }
        }));

        // NOTE: This is a placeholder for a real calendar implementation.
        // For now, it just lists the events.
        calendarDiv.innerHTML = '<h4>Planos de Aula Agendados</h4>';
        calendarEvents.forEach(event => {
            calendarDiv.innerHTML += `<p>${event.start}: ${event.title}</p>`;
        });
    };

    window.deleteLessonPlan = function(id) {
        showConfirmationModal('Tem certeza que deseja excluir este plano de aula?', function() {
            window.lessonPlanService.deleteLessonPlan(id);
            window.location.hash = '#/lesson-plans';
        });
    };

    window.initLessonPlanFormView = function(lessonPlanId) {
        const form = document.getElementById('lesson-plan-form');
        const title = document.getElementById('lesson-plan-form-title');
        const idField = document.getElementById('lesson-plan-id');
        const titleField = document.getElementById('lesson-plan-title');
        const classesField = document.getElementById('lesson-plan-classes');
        const dateField = document.getElementById('lesson-plan-date');
        const objectivesField = document.getElementById('lesson-plan-objectives');
        const methodologyField = document.getElementById('lesson-plan-methodology');
        const resourcesField = document.getElementById('lesson-plan-resources');
        const saveAndDuplicateBtn = document.getElementById('save-and-duplicate-btn');

        const classes = window.educationService.getClasses();
        classes.forEach(cls => {
            const option = `<option value="${cls.id}">${cls.name}</option>`;
            classesField.innerHTML += option;
        });

        if (lessonPlanId) {
            title.textContent = 'Editar Plano de Aula';
            const lessonPlan = window.lessonPlanService.getLessonPlanById(lessonPlanId);
            if (lessonPlan) {
                idField.value = lessonPlan.id;
                titleField.value = lessonPlan.title;
                lessonPlan.classIds.forEach(classId => {
                    const option = classesField.querySelector(`option[value="${classId}"]`);
                    if (option) option.selected = true;
                });
                dateField.value = lessonPlan.date;
                objectivesField.value = lessonPlan.objectives;
                methodologyField.value = lessonPlan.methodology;
                resourcesField.value = lessonPlan.resources;
            }
        } else {
            title.textContent = 'Criar Novo Plano de Aula';
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedClasses = Array.from(classesField.selectedOptions).map(opt => opt.value);
            const data = {
                title: titleField.value,
                classIds: selectedClasses,
                date: dateField.value,
                objectives: objectivesField.value,
                methodology: methodologyField.value,
                resources: resourcesField.value,
                materials: [], // Placeholder
                evaluations: [] // Placeholder
            };

            if (idField.value) {
                window.lessonPlanService.updateLessonPlan(idField.value, data);
            } else {
                window.lessonPlanService.addLessonPlan(data);
            }
            window.location.hash = '#/lesson-plans';
        });

        saveAndDuplicateBtn.addEventListener('click', function() {
            const selectedClasses = Array.from(classesField.selectedOptions).map(opt => opt.value);
            const data = {
                title: titleField.value,
                classIds: selectedClasses,
                date: dateField.value,
                objectives: objectivesField.value,
                methodology: methodologyField.value,
                resources: resourcesField.value,
                materials: [], // Placeholder
                evaluations: [] // Placeholder
            };

            if (idField.value) {
                window.lessonPlanService.updateLessonPlan(idField.value, data);
                window.lessonPlanService.duplicateLessonPlan(idField.value);
            } else {
                const newPlan = window.lessonPlanService.addLessonPlan(data);
                window.lessonPlanService.duplicateLessonPlan(newPlan.id);
            }
            window.location.hash = '#/lesson-plans';
        });
    };
})();
