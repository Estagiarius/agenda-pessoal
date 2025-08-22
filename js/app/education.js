(function() {
    'use strict';
    function parseCSV(content) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 1) {
            return [];
        }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length > headers.length) continue; // Allow fewer columns

            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            data.push(entry);
        }
        return data;
    }

    // --- Inicialização da View de Disciplinas ---
    window.initSubjectsView = async function() {
        const subjects = await window.educationService.getSubjects();
        const tableBody = document.getElementById('subjects-table-body');
        const searchInput = document.getElementById('subjectSearchInput');

        function renderSubjects(subjectsToRender) {
            tableBody.innerHTML = ''; // Limpa a tabela
            subjectsToRender.forEach(subject => {
                const row = `
                    <tr>
                        <td>${subject.nome}</td>
                        <td>${subject.codigo || ''}</td>
                        <td>
                            <a href="#/subjects/edit/${subject.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteSubject('${subject.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }

        renderSubjects(subjects);

        // Adicionar lógica de busca
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSubjects = subjects.filter(s =>
                s.nome.toLowerCase().includes(searchTerm) ||
                (s.codigo && s.codigo.toLowerCase().includes(searchTerm))
            );
            renderSubjects(filteredSubjects);
        });
    };

    window.deleteSubject = async function(id) {
        showConfirmationModal('Tem certeza que deseja excluir esta disciplina?', async function() {
            try {
                await window.educationService.deleteSubject(id);
                showToast('Disciplina excluída com sucesso!');
                // Re-initialize the view to show the updated list
                if (window.location.hash === '#/subjects') {
                    await initSubjectsView();
                } else {
                    window.location.hash = '#/subjects';
                }
            } catch (error) {
                showConfirmationModal(error.message, function() {});
            }
        });
    };

    // --- Inicialização do Formulário de Disciplina ---
    window.initSubjectFormView = async function(subjectId) {
        const form = document.getElementById('subject-form');
        const title = document.getElementById('subject-form-title');
        const subjectIdField = document.getElementById('subject-id');
        const subjectNameField = document.getElementById('subject-name');
        const subjectCodeField = document.getElementById('subject-code');
        const subjectDescriptionField = document.getElementById('subject-description');

        if (subjectId) {
            title.textContent = 'Editar Disciplina';
            const subject = await window.educationService.getSubjectById(subjectId);
            if (subject) {
                subjectIdField.value = subject.id;
                subjectNameField.value = subject.nome;
                subjectCodeField.value = subject.codigo;
                subjectDescriptionField.value = subject.descricao;
            }
        } else {
            title.textContent = 'Adicionar Nova Disciplina';
        }

        form.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                nome: subjectNameField.value,
                codigo: subjectCodeField.value,
                descricao: subjectDescriptionField.value
            };

            try {
                if (subjectIdField.value) {
                    await window.educationService.updateSubject(subjectIdField.value, data);
                } else {
                    await window.educationService.addSubject(data);
                }
                window.location.hash = '#/subjects';
            } catch (error) {
                alert(error.message);
            }
        };
    };

    // --- Inicialização da View de Turmas ---
    window.initClassesView = async function() {
        const classes = await window.educationService.getClasses();
        const subjects = await window.educationService.getSubjects();
        const tableBody = document.getElementById('classes-table-body');
        const filterSelect = document.getElementById('classFilterSubject');
        tableBody.innerHTML = '';

        const subjectMap = subjects.reduce((map, subject) => {
            map[subject.id] = subject.nome;
            return map;
        }, {});

        filterSelect.innerHTML = '<option value="">Todas as Disciplinas</option>'; // Reset options
        subjects.forEach(subject => {
            const option = `<option value="${subject.id}">${subject.nome}</option>`;
            filterSelect.innerHTML += option;
        });

        const renderTable = (filteredClasses) => {
            tableBody.innerHTML = '';
            filteredClasses.forEach(cls => {
                const row = `
                    <tr>
                        <td>${cls.nome}</td>
                        <td>${cls.disciplina_nome || 'Disciplina não encontrada'}</td>
                        <td>${cls.ano_semestre}</td>
                        <td>
                            <a href="#/classes/details/${cls.id}" class="btn btn-xs btn-primary">Ver Detalhes</a>
                            <a href="#/classes/edit/${cls.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteClass('${cls.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        };

        renderTable(classes);

        filterSelect.addEventListener('change', (e) => {
            const selectedSubjectId = e.target.value;
            if (selectedSubjectId) {
                const filteredClasses = classes.filter(c => c.id_disciplina === selectedSubjectId);
                renderTable(filteredClasses);
            } else {
                renderTable(classes);
            }
        });
    };

    window.deleteClass = async function(id) {
        showConfirmationModal('Tem certeza que deseja excluir esta turma?', async function() {
            try {
                await window.educationService.deleteClass(id);
                showToast('Turma excluída com sucesso!');
                if (window.location.hash === '#/classes') {
                    await initClassesView();
                } else {
                    window.location.hash = '#/classes';
                }
            } catch (error) {
                showConfirmationModal(error.message, function() {});
            }
        });
    };

    // --- Inicialização do Formulário de Turma ---
    window.initClassFormView = async function(classId) {
        const form = document.getElementById('class-form');
        const title = document.getElementById('class-form-title');
        const classIdField = document.getElementById('class-id');
        const classNameField = document.getElementById('class-name');
        const classSubjectField = document.getElementById('class-subject');
        const classYearSemesterField = document.getElementById('class-year-semester');
        const classTeacherField = document.getElementById('class-teacher');

        const subjects = await window.educationService.getSubjects();
        classSubjectField.innerHTML = ''; // Clear previous
        subjects.forEach(subject => {
            const option = `<option value="${subject.id}">${subject.nome}</option>`;
            classSubjectField.innerHTML += option;
        });

        if (classId) {
            title.textContent = 'Editar Turma';
            const cls = await window.educationService.getClassById(classId);
            if (cls) {
                classIdField.value = cls.id;
                classNameField.value = cls.nome;
                classSubjectField.value = cls.id_disciplina;
                classYearSemesterField.value = cls.ano_semestre;
                classTeacherField.value = cls.professor;
            }
        } else {
            title.textContent = 'Adicionar Nova Turma';
        }

        form.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                nome: classNameField.value,
                id_disciplina: classSubjectField.value,
                ano_semestre: classYearSemesterField.value,
                professor: classTeacherField.value
            };

            try {
                if (classIdField.value) {
                    await window.educationService.updateClass(classIdField.value, data);
                } else {
                    await window.educationService.addClass(data);
                }
                window.location.hash = '#/classes';
            } catch (error) {
                alert(error.message);
            }
        };
    };

    // --- Inicialização dos Detalhes da Turma ---
    window.initClassDetailsView = async function(classId) {
        const classDetails = await window.educationService.getClassById(classId);
        const subject = await window.educationService.getSubjectById(classDetails.id_disciplina);
        const title = document.getElementById('class-details-title');
        const infoDiv = document.getElementById('class-details-info');

        title.textContent = `Detalhes da Turma: ${classDetails.nome}`;
        infoDiv.innerHTML = `
            <p><strong>Disciplina:</strong> ${subject.nome}</p>
            <p><strong>Ano/Semestre:</strong> ${classDetails.ano_semestre}</p>
            <p><strong>Professor:</strong> ${classDetails.professor || 'Não informado'}</p>
        `;

        const enrolledList = document.getElementById('enrolled-students-list');
        const hideInactiveCheckbox = document.getElementById('hide-inactive-students-checkbox');

        const renderEnrolledStudents = async () => {
            enrolledList.innerHTML = '';
            let enrolledStudents = await window.educationService.getStudentsByClass(classId);

            if (hideInactiveCheckbox.checked) {
                enrolledStudents = enrolledStudents.filter(student => student.situacao === 'Ativo');
            }

            enrolledStudents.sort((a, b) => (a.numero_chamada || 0) - (b.numero_chamada || 0));

            // Adiciona um cabeçalho à lista
            enrolledList.innerHTML = `
                <li class="list-group-item list-group-item-info">
                    <div class="row">
                        <div class="col-xs-2"><strong>Nº</strong></div>
                        <div class="col-xs-5"><strong>Nome</strong></div>
                        <div class="col-xs-3"><strong>Situação</strong></div>
                        <div class="col-xs-2"><strong>Ações</strong></div>
                    </div>
                </li>
            `;

            enrolledStudents.forEach(student => {
                const item = `
                    <li class="list-group-item">
                        <div class="row">
                            <div class="col-xs-2">${student.numero_chamada || ''}</div>
                            <div class="col-xs-5">${student.nome}</div>
                            <div class="col-xs-3">${student.situacao || 'N/A'}</div>
                            <div class="col-xs-2">
                                <button class="btn btn-xs btn-danger pull-right" onclick="removeStudentFromClassWrapper('${student.id}', '${classId}')">Remover</button>
                            </div>
                        </div>
                    </li>
                `;
                enrolledList.innerHTML += item;
            });
        };

        document.getElementById('add-student-to-class-btn').onclick = () => {
            $('#addStudentModal').modal('show');
            document.getElementById('add-student-in-class-form').reset();
            document.getElementById('add-student-class-id').value = classId;
        };

        document.getElementById('saveNewStudentBtn').onclick = async () => {
            const studentData = {
                nome: document.getElementById('add-student-name').value,
                numero_chamada: parseInt(document.getElementById('add-student-call-number').value, 10),
                data_nascimento: document.getElementById('add-student-birthdate').value,
                situacao: document.getElementById('add-student-status').value
            };

            if (!studentData.nome) {
                alert('O nome do aluno é obrigatório.');
                return;
            }

            const targetClassId = document.getElementById('add-student-class-id').value;

            try {
                const newStudent = await window.educationService.addStudent(studentData);
                await window.educationService.enrollStudentInClass(newStudent.id, targetClassId);
                $('#addStudentModal').modal('hide');
                await renderEnrolledStudents();
                showToast('Aluno cadastrado e matriculado com sucesso!');
            } catch (error) {
                alert(error.message);
            }
        };

        hideInactiveCheckbox.addEventListener('change', renderEnrolledStudents);

        await renderEnrolledStudents();
        await renderEvaluations(classId);

        document.getElementById('add-evaluation-btn').href = `#/evaluations/new?classId=${classId}`;
        document.getElementById('view-class-report-btn').href = `#/class_report?classId=${classId}`;

        const importCsvInput = document.getElementById('import-students-csv');
        importCsvInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const studentsData = parseCSV(content).map(student => {
                    const dob = student['data_de_nascimento_dd-mm-aaaa'];
                    let formattedDob = '';
                    if (dob) {
                        const parts = dob.split('-');
                        if (parts.length === 3 && parts[0].length === 2) { // dd-mm-yyyy
                            formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    }

                    return {
                        nome: student.nome_do_aluno,
                        numero_chamada: parseInt(student.numero_da_chamada, 10),
                        data_nascimento: formattedDob,
                        situacao: student.situação_do_aluno || 'Ativo'
                    };
                });

                if (studentsData.length === 0) {
                    showToast('Arquivo CSV vazio ou em formato inválido.', 'error');
                    return;
                }

                try {
                    const result = await window.educationService.importStudentsToClass(classId, studentsData);
                    showToast(result.message || `${result.success_count} aluno(s) importado(s) com sucesso.`);
                    if (result.errors && result.errors.length > 0) {
                        console.warn('Erros de importação:', result.errors);
                    }
                } catch (err) {
                    showToast(`Erro ao importar alunos: ${err.message}`, 'error');
                }

                event.target.value = '';

                await renderEnrolledStudents();
            };

            reader.onerror = () => {
                showToast('Erro ao ler o arquivo.', 'error');
                event.target.value = '';
            };

            reader.readAsText(file, 'UTF-8');
        });
    };

    async function renderEvaluations(classId) {
        const evaluationsList = document.getElementById('evaluations-list');
        if (!evaluationsList) return;
        evaluationsList.innerHTML = '';
        const evaluations = await window.educationService.getEvaluationsByClass(classId);

        evaluations.forEach(evaluation => {
            const item = `
                <div class="list-group-item">
                    <strong>${evaluation.nome}</strong> (Peso: ${evaluation.peso})
                    <div class="pull-right">
                        <a href="#/grades/entry?evaluationId=${evaluation.id}" class="btn btn-xs btn-success">Lançar Notas</a>
                        <a href="#/evaluations/edit/${evaluation.id}" class="btn btn-xs btn-info">Editar</a>
                        <button class="btn btn-xs btn-danger" onclick="deleteEvaluationWrapper('${evaluation.id}', '${classId}')">Excluir</button>
                    </div>
                </div>
            `;
            evaluationsList.innerHTML += item;
        });
    }

    window.deleteEvaluationWrapper = async function(evaluationId, classId) {
        showConfirmationModal('Tem certeza que deseja excluir esta avaliação e todas as suas notas?', async function() {
            await window.educationService.deleteEvaluation(evaluationId);
            await renderEvaluations(classId);
            showToast('Avaliação excluída com sucesso!');
        });
    };

    window.removeStudentFromClassWrapper = async function(studentId, classId) {
        showConfirmationModal('Tem certeza que deseja remover este aluno da turma?', async function() {
            await window.educationService.removeStudentFromClass(studentId, classId);
            await initClassDetailsView(classId);
            showToast('Aluno removido da turma com sucesso!');
        });
    };

    window.initEvaluationFormView = async function(evaluationId, classId) {
        const form = document.getElementById('evaluation-form');
        const title = document.getElementById('evaluation-form-title');
        const evaluationIdField = document.getElementById('evaluation-id');
        const evaluationClassIdField = document.getElementById('evaluation-class-id');
        const evaluationNameField = document.getElementById('evaluation-name');
        const evaluationWeightField = document.getElementById('evaluation-weight');
        const evaluationMaxGradeField = document.getElementById('evaluation-max-grade');
        const cancelButton = document.getElementById('cancel-evaluation-form');

        if (evaluationId) {
            title.textContent = 'Editar Avaliação';
            const evaluation = await window.educationService.getEvaluationById(evaluationId);
            if (evaluation) {
                evaluationIdField.value = evaluation.id;
                evaluationClassIdField.value = evaluation.id_turma;
                evaluationNameField.value = evaluation.nome;
                evaluationWeightField.value = evaluation.peso;
                evaluationMaxGradeField.value = evaluation.nota_maxima;
                cancelButton.href = `#/classes/details/${evaluation.id_turma}`;
            }
        } else {
            title.textContent = 'Criar Nova Avaliação';
            evaluationClassIdField.value = classId;
            cancelButton.href = `#/classes/details/${classId}`;
        }

        form.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                id_turma: evaluationClassIdField.value,
                nome: evaluationNameField.value,
                peso: parseFloat(evaluationWeightField.value),
                nota_maxima: parseFloat(evaluationMaxGradeField.value)
            };

            if (!data.nome || !data.id_turma) {
                alert("Nome da avaliação e ID da turma são obrigatórios.");
                return;
            }

            try {
                if (evaluationIdField.value) {
                    await window.educationService.updateEvaluation(evaluationIdField.value, data);
                } else {
                    await window.educationService.addEvaluation(data);
                }
                window.location.hash = `#/classes/details/${data.id_turma}`;
            } catch (error) {
                alert(error.message);
            }
        };
    };

    window.initGradeEntryView = async function(evaluationId) {
        const evaluation = await window.educationService.getEvaluationById(evaluationId);
        if (!evaluation) {
            alert("Avaliação não encontrada!");
            window.location.hash = '#/classes';
            return;
        }

        const title = document.getElementById('grade-entry-title');
        const tableBody = document.getElementById('grade-entry-table-body');
        const form = document.getElementById('grade-entry-form');
        const cancelButton = document.getElementById('cancel-grade-entry');

        title.textContent = `Lançar Notas para: ${evaluation.nome}`;
        cancelButton.href = `#/classes/details/${evaluation.id_turma}`;

        const [students, existingGrades] = await Promise.all([
            window.educationService.getStudentsByClass(evaluation.id_turma),
            window.educationService.getGradesByEvaluation(evaluationId)
        ]);

        const gradeMap = existingGrades.reduce((map, grade) => {
            map[grade.id_aluno] = grade.valor;
            return map;
        }, {});

        tableBody.innerHTML = '';
        students.sort((a, b) => (a.callNumber || a.nome).localeCompare(b.callNumber || b.nome))
            .forEach(student => {
                const grade = gradeMap[student.id] || '';
                const row = `
                    <tr>
                        <td>${student.nome}</td>
                        <td>
                            <input type="number" class="form-control" data-student-id="${student.id}" value="${grade}" min="0" max="${evaluation.nota_maxima}" step="0.1">
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

        form.onsubmit = async function(e) {
            e.preventDefault();
            const gradeInputs = tableBody.querySelectorAll('input');
            const newGrades = [];

            gradeInputs.forEach(input => {
                const gradeValue = input.value;
                if (gradeValue !== '') {
                    newGrades.push({
                        studentId: input.dataset.studentId,
                        grade: parseFloat(gradeValue)
                    });
                }
            });

            try {
                await window.educationService.saveGrades(evaluationId, newGrades);
                showToast('Notas salvas com sucesso!');
                window.location.hash = `#/classes/details/${evaluation.id_turma}`;
            } catch (error) {
                alert(error.message);
            }
        };
    };

    window.initClassReportView = async function(classId) {
        const tableHead = document.getElementById('class-report-table-head');
        const tableBody = document.getElementById('class-report-table-body');

        const { report, evaluations } = await window.educationService.calculateClassReport(classId);

        let headerHtml = '<tr><th>Aluno</th>';
        evaluations.forEach(e => {
            headerHtml += `<th>${e.nome}</th>`;
        });
        headerHtml += '<th>Média Final</th></tr>';
        tableHead.innerHTML = headerHtml;

        tableBody.innerHTML = '';
        report.forEach(studentReport => {
            const finalGrade = parseFloat(studentReport.finalGrade);
            const gradeClass = isNaN(finalGrade) ? '' : (finalGrade < 6.0 ? 'grade-low' : '');
            let rowHtml = `<tr><td>${studentReport.studentName}</td>`;
            evaluations.forEach(e => {
                const grade = studentReport.grades[e.id];
                rowHtml += `<td>${grade !== null && typeof grade !== 'undefined' ? grade : '-'}</td>`;
            });
            rowHtml += `<td class="${gradeClass}"><strong>${studentReport.finalGrade}</strong></td></tr>`;
            tableBody.innerHTML += rowHtml;
        });
    };
})();
