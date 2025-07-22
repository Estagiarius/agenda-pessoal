(function() {
    'use strict';

    // --- Inicialização da View de Disciplinas ---
    window.initSubjectsView = function() {
        const subjects = window.educationService.getSubjects();
        const tableBody = document.getElementById('subjects-table-body');
        tableBody.innerHTML = ''; // Limpa a tabela

        subjects.forEach(subject => {
            const row = `
                <tr>
                    <td>${subject.name}</td>
                    <td>${subject.code || ''}</td>
                    <td>
                        <a href="#/subjects/edit/${subject.id}" class="btn btn-xs btn-info">Editar</a>
                        <button class="btn btn-xs btn-danger" onclick="deleteSubject('${subject.id}')">Excluir</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Adicionar lógica de busca
        const searchInput = document.getElementById('subjectSearchInput');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSubjects = subjects.filter(s =>
                s.name.toLowerCase().includes(searchTerm) ||
                (s.code && s.code.toLowerCase().includes(searchTerm))
            );
            // Re-renderiza a tabela com os resultados filtrados
            // (Esta é uma implementação simples, para apps maiores, um framework de UI seria melhor)
            tableBody.innerHTML = '';
            filteredSubjects.forEach(subject => {
                const row = `
                    <tr>
                        <td>${subject.name}</td>
                        <td>${subject.code || ''}</td>
                        <td>
                            <a href="#/subjects/edit/${subject.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteSubject('${subject.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
    };

    window.deleteSubject = function(id) {
        showConfirmationModal('Tem certeza que deseja excluir esta disciplina?', function() {
            try {
                window.educationService.deleteSubject(id);
                window.location.hash = '#/subjects'; // Recarrega a view
                showToast('Disciplina excluída com sucesso!');
            } catch (error) {
                showConfirmationModal(error.message, function() {});
            }
        });
    };

    // --- Inicialização do Formulário de Disciplina ---
    window.initSubjectFormView = function(subjectId) {
        const form = document.getElementById('subject-form');
        const title = document.getElementById('subject-form-title');
        const subjectIdField = document.getElementById('subject-id');
        const subjectNameField = document.getElementById('subject-name');
        const subjectCodeField = document.getElementById('subject-code');
        const subjectDescriptionField = document.getElementById('subject-description');

        if (subjectId) {
            // Modo Edição
            title.textContent = 'Editar Disciplina';
            const subject = window.educationService.getSubjectById(subjectId);
            if (subject) {
                subjectIdField.value = subject.id;
                subjectNameField.value = subject.name;
                subjectCodeField.value = subject.code;
                subjectDescriptionField.value = subject.description;
            }
        } else {
            // Modo Criação
            title.textContent = 'Adicionar Nova Disciplina';
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                name: subjectNameField.value,
                code: subjectCodeField.value,
                description: subjectDescriptionField.value
            };

            try {
                if (subjectIdField.value) {
                    window.educationService.updateSubject(subjectIdField.value, data);
                } else {
                    window.educationService.addSubject(data);
                }
                window.location.hash = '#/subjects';
            } catch (error) {
                alert(error.message);
            }
        });
    };

    // --- Inicialização da View de Turmas ---
    window.initClassesView = function() {
        const classes = window.educationService.getClasses();
        const subjects = window.educationService.getSubjects();
        const tableBody = document.getElementById('classes-table-body');
        const filterSelect = document.getElementById('classFilterSubject');
        tableBody.innerHTML = '';

        // Mapeia IDs de disciplina para nomes para fácil acesso
        const subjectMap = subjects.reduce((map, subject) => {
            map[subject.id] = subject.name;
            return map;
        }, {});

        // Preenche o dropdown de filtro
        subjects.forEach(subject => {
            const option = `<option value="${subject.id}">${subject.name}</option>`;
            filterSelect.innerHTML += option;
        });

        const renderTable = (filteredClasses) => {
            tableBody.innerHTML = '';
            filteredClasses.forEach(cls => {
                const row = `
                    <tr>
                        <td>${cls.name}</td>
                        <td>${subjectMap[cls.subjectId] || 'Disciplina não encontrada'}</td>
                        <td>${cls.yearSemester}</td>
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

        renderTable(classes); // Renderização inicial

        // Lógica de filtro
        filterSelect.addEventListener('change', (e) => {
            const selectedSubjectId = e.target.value;
            if (selectedSubjectId) {
                const filteredClasses = classes.filter(c => c.subjectId === selectedSubjectId);
                renderTable(filteredClasses);
            } else {
                renderTable(classes); // Mostra todas se nenhuma disciplina for selecionada
            }
        });
    };

    window.deleteClass = function(id) {
        showConfirmationModal('Tem certeza que deseja excluir esta turma?', function() {
            try {
                window.educationService.deleteClass(id);
                window.location.hash = '#/classes'; // Recarrega a view
                showToast('Turma excluída com sucesso!');
            } catch (error) {
                showConfirmationModal(error.message, function() {});
            }
        });
    };

    // --- Inicialização do Formulário de Turma ---
    window.initClassFormView = function(classId) {
        const form = document.getElementById('class-form');
        const title = document.getElementById('class-form-title');
        const classIdField = document.getElementById('class-id');
        const classNameField = document.getElementById('class-name');
        const classSubjectField = document.getElementById('class-subject');
        const classYearSemesterField = document.getElementById('class-year-semester');
        const classTeacherField = document.getElementById('class-teacher');

        // Preenche o dropdown de disciplinas
        const subjects = window.educationService.getSubjects();
        subjects.forEach(subject => {
            const option = `<option value="${subject.id}">${subject.name}</option>`;
            classSubjectField.innerHTML += option;
        });

        if (classId) {
            // Modo Edição
            title.textContent = 'Editar Turma';
            const cls = window.educationService.getClassById(classId);
            if (cls) {
                classIdField.value = cls.id;
                classNameField.value = cls.name;
                classSubjectField.value = cls.subjectId;
                classYearSemesterField.value = cls.yearSemester;
                classTeacherField.value = cls.teacher;
            }
        } else {
            // Modo Criação
            title.textContent = 'Adicionar Nova Turma';
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                name: classNameField.value,
                subjectId: classSubjectField.value,
                yearSemester: classYearSemesterField.value,
                teacher: classTeacherField.value
            };

            try {
                if (classIdField.value) {
                    window.educationService.updateClass(classIdField.value, data);
                } else {
                    window.educationService.addClass(data);
                }
                window.location.hash = '#/classes';
            } catch (error) {
                alert(error.message);
            }
        });
    };

    // --- Inicialização dos Detalhes da Turma ---
    window.initClassDetailsView = function(classId) {
        const classDetails = window.educationService.getClassById(classId);
        const subject = window.educationService.getSubjectById(classDetails.subjectId);
        const title = document.getElementById('class-details-title');
        const infoDiv = document.getElementById('class-details-info');

        title.textContent = `Detalhes da Turma: ${classDetails.name}`;
        infoDiv.innerHTML = `
            <p><strong>Disciplina:</strong> ${subject.name}</p>
            <p><strong>Ano/Semestre:</strong> ${classDetails.yearSemester}</p>
            <p><strong>Professor:</strong> ${classDetails.teacher || 'Não informado'}</p>
        `;

        const enrolledList = document.getElementById('enrolled-students-list');
        const searchInput = document.getElementById('student-search-input');
        const searchResults = document.getElementById('student-search-results');

        const renderEnrolledStudents = () => {
            enrolledList.innerHTML = '';
            const enrolledStudents = window.educationService.getStudentsByClass(classId);
            enrolledStudents.forEach(student => {
                const item = `
                    <li class="list-group-item">
                        ${student.name} (${student.studentId})
                        <button class="btn btn-xs btn-danger pull-right" onclick="removeStudentFromClassWrapper('${student.id}', '${classId}')">Remover</button>
                    </li>
                `;
                enrolledList.innerHTML += item;
            });
        };

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            searchResults.innerHTML = '';
            if (searchTerm.length < 2) return;

            const allStudents = window.educationService.getStudents();
            const filteredStudents = allStudents.filter(s =>
                s.name.toLowerCase().includes(searchTerm) ||
                s.studentId.toLowerCase().includes(searchTerm)
            );

            filteredStudents.forEach(student => {
                const item = `
                    <div class="list-group-item">
                        ${student.name} (${student.studentId})
                        <button class="btn btn-xs btn-success pull-right" onclick="enrollStudentWrapper('${student.id}', '${classId}')">Matricular</button>
                    </div>
                `;
                searchResults.innerHTML += item;
            });
        });

        renderEnrolledStudents();
        renderEvaluations(classId);

        const viewReportBtn = document.getElementById('view-class-report-btn');
        viewReportBtn.href = `#/class_report?classId=${classId}`;
    };

    function renderEvaluations(classId) {
        const evaluationsList = document.getElementById('evaluations-list');
        if (!evaluationsList) return;
        evaluationsList.innerHTML = '';
        const evaluations = window.educationService.getEvaluationsByClass(classId);

        evaluations.forEach(evaluation => {
            const item = `
                <div class="list-group-item">
                    <strong>${evaluation.name}</strong> (Peso: ${evaluation.weight})
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

    window.deleteEvaluationWrapper = function(evaluationId, classId) {
        showConfirmationModal('Tem certeza que deseja excluir esta avaliação e todas as suas notas?', function() {
            window.educationService.deleteEvaluation(evaluationId);
            renderEvaluations(classId);
            showToast('Avaliação excluída com sucesso!');
        });
    };

    window.enrollStudentWrapper = function(studentId, classId) {
        try {
            window.educationService.enrollStudentInClass(studentId, classId);
            window.initClassDetailsView(classId); // Recarrega a view de detalhes
            showToast('Aluno matriculado com sucesso!');
        } catch (error) {
            showConfirmationModal(error.message, function() {});
        }
    };

    window.removeStudentFromClassWrapper = function(studentId, classId) {
        showConfirmationModal('Tem certeza que deseja remover este aluno da turma?', function() {
            window.educationService.removeStudentFromClass(studentId, classId);
            window.initClassDetailsView(classId); // Recarrega a view de detalhes
            showToast('Aluno removido da turma com sucesso!');
        });
    };

    // --- Inicialização da View de Alunos ---
    window.initStudentsView = function() {
        const students = window.educationService.getStudents();
        const tableBody = document.getElementById('students-table-body');
        tableBody.innerHTML = ''; // Limpa a tabela

        students.forEach(student => {
            const row = `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.studentId}</td>
                    <td>
                        <a href="#/students/edit/${student.id}" class="btn btn-xs btn-info">Editar</a>
                        <button class="btn btn-xs btn-danger" onclick="deleteStudent('${student.id}')">Excluir</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Adicionar lógica de busca
        const searchInput = document.getElementById('studentSearchInput');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredStudents = students.filter(s =>
                s.name.toLowerCase().includes(searchTerm) ||
                s.studentId.toLowerCase().includes(searchTerm)
            );
            tableBody.innerHTML = '';
            filteredStudents.forEach(student => {
                const row = `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.studentId}</td>
                        <td>
                            <a href="#/students/edit/${student.id}" class="btn btn-xs btn-info">Editar</a>
                            <button class="btn btn-xs btn-danger" onclick="deleteStudent('${student.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
    };

    window.deleteStudent = function(id) {
        showConfirmationModal('Tem certeza que deseja excluir este aluno?', function() {
            try {
                window.educationService.deleteStudent(id);
                window.location.hash = '#/students'; // Recarrega a view
                showToast('Aluno excluído com sucesso!');
            } catch (error) {
                showConfirmationModal(error.message, function() {});
            }
        });
    };

    // --- Inicialização do Formulário de Aluno ---
    window.initStudentFormView = function(studentId) {
        const form = document.getElementById('student-form');
        const title = document.getElementById('student-form-title');
        const studentIdField = document.getElementById('student-id');
        const studentNameField = document.getElementById('student-name');
        const studentSidField = document.getElementById('student-sid');
        const studentBirthdateField = document.getElementById('student-birthdate');
        const studentContactField = document.getElementById('student-contact');

        if (studentId) {
            // Modo Edição
            title.textContent = 'Editar Aluno';
            const student = window.educationService.getStudentById(studentId);
            if (student) {
                studentIdField.value = student.id;
                studentNameField.value = student.name;
                studentSidField.value = student.studentId;
                studentBirthdateField.value = student.birthDate;
                studentContactField.value = student.contact;
            }
        } else {
            // Modo Criação
            title.textContent = 'Cadastrar Novo Aluno';
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                name: studentNameField.value,
                studentId: studentSidField.value,
                birthDate: studentBirthdateField.value,
                contact: studentContactField.value
            };

            try {
                if (studentIdField.value) {
                    window.educationService.updateStudent(studentIdField.value, data);
                } else {
                    window.educationService.addStudent(data);
                }
                window.location.hash = '#/students';
            } catch (error) {
                alert(error.message);
            }
        });
    };

    // --- Inicialização do Formulário de Avaliação ---
    window.initEvaluationFormView = function(evaluationId, classId) {
        const form = document.getElementById('evaluation-form');
        const title = document.getElementById('evaluation-form-title');
        const evaluationIdField = document.getElementById('evaluation-id');
        const evaluationClassIdField = document.getElementById('evaluation-class-id');
        const evaluationNameField = document.getElementById('evaluation-name');
        const evaluationDateField = document.getElementById('evaluation-date');
        const evaluationWeightField = document.getElementById('evaluation-weight');
        const evaluationMaxGradeField = document.getElementById('evaluation-max-grade');
        const cancelButton = document.getElementById('cancel-evaluation-form');

        if (evaluationId) {
            // Modo Edição
            title.textContent = 'Editar Avaliação';
            const evaluation = window.educationService.getEvaluationById(evaluationId);
            if (evaluation) {
                evaluationIdField.value = evaluation.id;
                evaluationClassIdField.value = evaluation.classId;
                evaluationNameField.value = evaluation.name;
                evaluationDateField.value = evaluation.date;
                evaluationWeightField.value = evaluation.weight;
                evaluationMaxGradeField.value = evaluation.maxGrade;
                cancelButton.href = `#/classes/details/${evaluation.classId}`;
            }
        } else {
            // Modo Criação
            title.textContent = 'Criar Nova Avaliação';
            evaluationClassIdField.value = classId;
            cancelButton.href = `#/classes/details/${classId}`;
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                classId: evaluationClassIdField.value,
                name: evaluationNameField.value,
                date: evaluationDateField.value,
                weight: evaluationWeightField.value,
                maxGrade: evaluationMaxGradeField.value
            };

            try {
                if (evaluationIdField.value) {
                    window.educationService.updateEvaluation(evaluationIdField.value, data);
                } else {
                    window.educationService.addEvaluation(data);
                }
                window.location.hash = `#/classes/details/${data.classId}`;
            } catch (error) {
                alert(error.message);
            }
        });
    };

    // --- Inicialização da View de Lançamento de Notas ---
    window.initGradeEntryView = function(evaluationId) {
        const evaluation = window.educationService.getEvaluationById(evaluationId);
        const students = window.educationService.getStudentsByClass(evaluation.classId);
        const title = document.getElementById('grade-entry-title');
        const tableBody = document.getElementById('grade-entry-table-body');
        const form = document.getElementById('grade-entry-form');
        const evaluationIdField = document.getElementById('grade-entry-evaluation-id');
        const cancelButton = document.getElementById('cancel-grade-entry');

        title.textContent = `Lançar Notas para: ${evaluation.name}`;
        evaluationIdField.value = evaluationId;
        cancelButton.href = `#/classes/details/${evaluation.classId}`;

        const existingGrades = window.educationService.getGradesByEvaluation(evaluationId).reduce((map, grade) => {
            map[grade.studentId] = grade.grade;
            return map;
        }, {});

        tableBody.innerHTML = '';
        students.forEach(student => {
            const grade = existingGrades[student.id] || '';
            const row = `
                <tr>
                    <td>${student.name}</td>
                    <td>
                        <input type="number" class="form-control" data-student-id="${student.id}" value="${grade}" min="0" max="${evaluation.maxGrade}" step="0.1">
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const gradeInputs = tableBody.querySelectorAll('input');
            const newGrades = [];
            gradeInputs.forEach(input => {
                if (input.value !== '') {
                    newGrades.push({
                        studentId: input.dataset.studentId,
                        grade: parseFloat(input.value)
                    });
                }
            });

            try {
                window.educationService.saveGrades(evaluationId, newGrades);
                window.location.hash = `#/classes/details/${evaluation.classId}`;
            } catch (error) {
                alert(error.message);
            }
        });
    };

    // --- Inicialização da View de Boletim da Turma ---
    window.initClassReportView = function(classId) {
        const { report, evaluations } = window.educationService.calculateClassReport(classId);
        const tableHead = document.getElementById('class-report-table-head');
        const tableBody = document.getElementById('class-report-table-body');
        const backButton = document.getElementById('back-to-class-details');

        backButton.href = `#/classes/details/${classId}`;

        // Cabeçalho da tabela
        let headerHtml = '<tr><th>Aluno</th>';
        evaluations.forEach(e => {
            headerHtml += `<th>${e.name}</th>`;
        });
        headerHtml += '<th>Média Final</th></tr>';
        tableHead.innerHTML = headerHtml;

        // Corpo da tabela
        tableBody.innerHTML = '';
        report.forEach(studentReport => {
            const finalGrade = parseFloat(studentReport.finalGrade);
            const gradeClass = finalGrade < 6.0 ? 'grade-low' : '';
            let rowHtml = `<tr><td>${studentReport.studentName}</td>`;
            evaluations.forEach(e => {
                const grade = studentReport.grades[e.id];
                rowHtml += `<td>${grade !== null ? grade : '-'}</td>`;
            });
            rowHtml += `<td class="${gradeClass}"><strong>${studentReport.finalGrade}</strong></td></tr>`;
            tableBody.innerHTML += rowHtml;
        });

        // Lógica de exportação para CSV
        const exportBtn = document.getElementById('export-csv-btn');
        exportBtn.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,";

            // Cabeçalho do CSV
            const headers = ["Aluno"].concat(evaluations.map(e => e.name), ["Média Final"]);
            csvContent += headers.join(",") + "\r\n";

            // Linhas do CSV
            report.forEach(studentReport => {
                const row = [studentReport.studentName];
                evaluations.forEach(e => {
                    const grade = studentReport.grades[e.id];
                    row.push(grade !== null ? grade : '');
                });
                row.push(studentReport.finalGrade);
                csvContent += row.join(",") + "\r\n";
            });

            // Cria e baixa o arquivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "boletim_turma.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
})();
