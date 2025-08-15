import os
from flask import Flask, request, Response, send_from_directory, jsonify
from openai import OpenAI
import sys
import json

# --- Helpers para Persistência de Dados ---
DATA_FOLDER = 'data'
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

SUBJECTS_FILE = os.path.join(DATA_FOLDER, 'subjects.json')
CLASSES_FILE = os.path.join(DATA_FOLDER, 'classes.json')
STUDENTS_FILE = os.path.join(DATA_FOLDER, 'students.json')
ENROLLMENTS_FILE = os.path.join(DATA_FOLDER, 'enrollments.json')
EVALUATIONS_FILE = os.path.join(DATA_FOLDER, 'evaluations.json')
GRADES_FILE = os.path.join(DATA_FOLDER, 'grades.json')
EVENTS_FILE = os.path.join(DATA_FOLDER, 'events.json')
TASKS_FILE = os.path.join(DATA_FOLDER, 'tasks.json')
LESSON_PLANS_FILE = os.path.join(DATA_FOLDER, 'lesson_plans.json')

def read_data(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as f:
        return json.load(f)

def write_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# --- Configuração do Flask ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Configuração do Cliente OpenAI para a API da Maritaca
client = None
if "MARITACA_API_KEY" in os.environ:
    try:
        client = OpenAI(
            api_key=os.environ["MARITACA_API_KEY"],
            base_url="https://chat.maritaca.ai/api",
        )
    except Exception as e:
        print(f"AVISO: Falha ao inicializar o cliente da API da Maritaca: {e}", file=sys.stderr)
else:
    print("AVISO: A chave da API da Maritaca (MARITACA_API_KEY) não foi definida. A funcionalidade de chat estará desativada.", file=sys.stderr)

DEFAULT_MODEL = "sabia-3.1"

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # Save metadata
        materials_path = os.path.join(app.config['UPLOAD_FOLDER'], 'materials.json')
        materials = []
        if os.path.exists(materials_path):
            with open(materials_path, 'r') as f:
                materials = json.load(f)

        new_material = {
            'id': f'mat_{len(materials) + 1}',
            'title': request.form.get('title', filename),
            'type': filename.split('.')[-1],
            'tags': [tag.strip() for tag in request.form.get('tags', '').split(',')],
            'url': os.path.join(app.config['UPLOAD_FOLDER'], filename)
        }
        materials.append(new_material)

        with open(materials_path, 'w') as f:
            json.dump(materials, f, indent=4)

        return 'File uploaded successfully', 200

@app.route('/api/chat', methods=['POST'])
def chat():
    if not client:
        error_message = json.dumps({"error": "A funcionalidade de chat não está configurada no servidor."})
        return Response(f"data: {error_message}\n\n", status=503, mimetype='text/event-stream')

    data = request.get_json()
    message = data.get('message')
    model = data.get('model', DEFAULT_MODEL)

    if not message:
        return Response(json.dumps({'error': 'Nenhuma mensagem fornecida'}), status=400, mimetype='application/json')

    def generate():
        try:
            stream = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": message}
                ],
                stream=True,
                max_tokens=8192,
                temperature=0.5,
                top_p=0.95
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                if content:
                    # Formato Server-Sent Events (SSE)
                    yield f"data: {json.dumps({'answer': content})}\n\n"
        except Exception as e:
            print(f"ERRO: Erro ao chamar a API da Maritaca: {e}", file=sys.stderr)
            error_message = json.dumps({"error": "Ocorreu um erro ao se comunicar com a IA."})
            yield f"data: {error_message}\n\n"

    return Response(generate(), mimetype='text/event-stream')

# --- API Endpoints para Gestão Acadêmica ---

# Subjects (Disciplinas)
@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    subjects = read_data(SUBJECTS_FILE)
    return jsonify(subjects)

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    new_subject = request.get_json()
    subjects = read_data(SUBJECTS_FILE)
    # Simple ID generation for now
    new_subject['id'] = f"sub_{len(subjects) + 1}"
    subjects.append(new_subject)
    write_data(SUBJECTS_FILE, subjects)
    return jsonify(new_subject), 201

@app.route('/api/subjects/<subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    subjects = read_data(SUBJECTS_FILE)
    subject_to_delete = next((sub for sub in subjects if sub['id'] == subject_id), None)
    if subject_to_delete is None:
        return jsonify({"error": "Subject not found"}), 404

    subjects = [sub for sub in subjects if sub['id'] != subject_id]
    write_data(SUBJECTS_FILE, subjects)
    return '', 204

@app.route('/api/subjects/<subject_id>', methods=['PUT'])
def update_subject(subject_id):
    subjects = read_data(SUBJECTS_FILE)
    subject_to_update = next((sub for sub in subjects if sub['id'] == subject_id), None)
    if subject_to_update is None:
        return jsonify({"error": "Subject not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        subject_to_update[key] = value

    write_data(SUBJECTS_FILE, subjects)
    return jsonify(subject_to_update)

@app.route('/api/subjects/<subject_id>', methods=['GET'])
def get_subject_by_id(subject_id):
    subjects = read_data(SUBJECTS_FILE)
    subject = next((sub for sub in subjects if sub['id'] == subject_id), None)
    if subject is None:
        return jsonify({"error": "Subject not found"}), 404
    return jsonify(subject)

# Classes (Turmas)
@app.route('/api/classes', methods=['GET'])
def get_classes():
    classes = read_data(CLASSES_FILE)
    return jsonify(classes)

@app.route('/api/classes', methods=['POST'])
def add_class():
    new_class = request.get_json()
    classes = read_data(CLASSES_FILE)
    new_class['id'] = f"cls_{len(classes) + 1}"
    classes.append(new_class)
    write_data(CLASSES_FILE, classes)
    return jsonify(new_class), 201

@app.route('/api/classes/<class_id>', methods=['GET'])
def get_class_by_id(class_id):
    classes = read_data(CLASSES_FILE)
    cls = next((c for c in classes if c['id'] == class_id), None)
    if cls is None:
        return jsonify({"error": "Class not found"}), 404
    return jsonify(cls)

@app.route('/api/classes/<class_id>', methods=['PUT'])
def update_class(class_id):
    classes = read_data(CLASSES_FILE)
    cls_to_update = next((c for c in classes if c['id'] == class_id), None)
    if cls_to_update is None:
        return jsonify({"error": "Class not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        cls_to_update[key] = value

    write_data(CLASSES_FILE, classes)
    return jsonify(cls_to_update)

@app.route('/api/classes/<class_id>', methods=['DELETE'])
def delete_class(class_id):
    classes = read_data(CLASSES_FILE)
    cls_to_delete = next((c for c in classes if c['id'] == class_id), None)
    if cls_to_delete is None:
        return jsonify({"error": "Class not found"}), 404

    classes = [c for c in classes if c['id'] != class_id]
    write_data(CLASSES_FILE, classes)
    return '', 204

# Students (Alunos) & Enrollments (Matrículas)
@app.route('/api/students', methods=['POST'])
def add_student():
    student_data = request.get_json()
    students = read_data(STUDENTS_FILE)
    student_data['id'] = f"std_{len(students) + 1}"
    students.append(student_data)
    write_data(STUDENTS_FILE, students)
    return jsonify(student_data), 201

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    students = read_data(STUDENTS_FILE)
    student_to_update = next((s for s in students if s['id'] == student_id), None)
    if student_to_update is None:
        return jsonify({"error": "Student not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        student_to_update[key] = value

    write_data(STUDENTS_FILE, students)
    return jsonify(student_to_update)

@app.route('/api/classes/<class_id>/students', methods=['GET'])
def get_students_by_class(class_id):
    enrollments = read_data(ENROLLMENTS_FILE)
    all_students = read_data(STUDENTS_FILE)

    student_ids_in_class = [e['studentId'] for e in enrollments if e['classId'] == class_id]
    students_in_class = [s for s in all_students if s['id'] in student_ids_in_class]

    return jsonify(students_in_class)

@app.route('/api/classes/<class_id>/students', methods=['POST'])
def add_and_enroll_student(class_id):
    student_data = request.get_json()

    # Add student to the main list
    students = read_data(STUDENTS_FILE)
    new_student_id = f"std_{len(students) + 1}"
    student_data['id'] = new_student_id
    students.append(student_data)
    write_data(STUDENTS_FILE, students)

    # Enroll student in the class
    enrollments = read_data(ENROLLMENTS_FILE)
    enrollments.append({"classId": class_id, "studentId": new_student_id})
    write_data(ENROLLMENTS_FILE, enrollments)

    return jsonify(student_data), 201

@app.route('/api/classes/<class_id>/students/<student_id>', methods=['DELETE'])
def remove_student_from_class(class_id, student_id):
    enrollments = read_data(ENROLLMENTS_FILE)

    initial_len = len(enrollments)
    enrollments = [e for e in enrollments if not (e['classId'] == class_id and e['studentId'] == student_id)]

    if len(enrollments) == initial_len:
        return jsonify({"error": "Enrollment not found"}), 404

    write_data(ENROLLMENTS_FILE, enrollments)
    return '', 204

# Evaluations (Avaliações) & Grades (Notas)
@app.route('/api/classes/<class_id>/evaluations', methods=['GET'])
def get_evaluations_by_class(class_id):
    evaluations = read_data(EVALUATIONS_FILE)
    class_evaluations = [e for e in evaluations if e['classId'] == class_id]
    return jsonify(class_evaluations)

@app.route('/api/evaluations', methods=['POST'])
def add_evaluation():
    evaluation_data = request.get_json()
    evaluations = read_data(EVALUATIONS_FILE)
    evaluation_data['id'] = f"eval_{len(evaluations) + 1}"
    evaluations.append(evaluation_data)
    write_data(EVALUATIONS_FILE, evaluations)
    return jsonify(evaluation_data), 201

@app.route('/api/evaluations/<evaluation_id>', methods=['PUT'])
def update_evaluation(evaluation_id):
    evaluations = read_data(EVALUATIONS_FILE)
    evaluation_to_update = next((e for e in evaluations if e['id'] == evaluation_id), None)
    if evaluation_to_update is None:
        return jsonify({"error": "Evaluation not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        evaluation_to_update[key] = value

    write_data(EVALUATIONS_FILE, evaluations)
    return jsonify(evaluation_to_update)

@app.route('/api/evaluations/<evaluation_id>', methods=['DELETE'])
def delete_evaluation(evaluation_id):
    evaluations = read_data(EVALUATIONS_FILE)
    initial_len = len(evaluations)
    evaluations = [e for e in evaluations if e['id'] != evaluation_id]
    if len(evaluations) == initial_len:
        return jsonify({"error": "Evaluation not found"}), 404
    write_data(EVALUATIONS_FILE, evaluations)

    # Also delete associated grades
    grades = read_data(GRADES_FILE)
    grades = [g for g in grades if g['evaluationId'] != evaluation_id]
    write_data(GRADES_FILE, grades)

    return '', 204

@app.route('/api/evaluations/<evaluation_id>/grades', methods=['GET'])
def get_grades_by_evaluation(evaluation_id):
    grades = read_data(GRADES_FILE)
    evaluation_grades = [g for g in grades if g['evaluationId'] == evaluation_id]
    return jsonify(evaluation_grades)

@app.route('/api/evaluations/<evaluation_id>/grades', methods=['POST'])
def save_grades_for_evaluation(evaluation_id):
    new_grades = request.get_json()
    grades = read_data(GRADES_FILE)

    # Remove old grades for this evaluation
    grades = [g for g in grades if g['evaluationId'] != evaluation_id]

    # Add new grades
    for grade_data in new_grades:
        grades.append({
            "evaluationId": evaluation_id,
            "studentId": grade_data['studentId'],
            "grade": grade_data['grade']
        })

    write_data(GRADES_FILE, grades)
    return jsonify(new_grades), 200

# Events (Eventos do Calendário)
@app.route('/api/events', methods=['GET'])
def get_events():
    events = read_data(EVENTS_FILE)
    return jsonify(events)

@app.route('/api/events', methods=['POST'])
def add_event():
    event_data = request.get_json()
    events = read_data(EVENTS_FILE)
    event_data['id'] = f"evt_{len(events) + 1}"
    events.append(event_data)
    write_data(EVENTS_FILE, events)
    return jsonify(event_data), 201

@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    events = read_data(EVENTS_FILE)
    event_to_update = next((e for e in events if e['id'] == event_id), None)
    if event_to_update is None:
        return jsonify({"error": "Event not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        event_to_update[key] = value

    write_data(EVENTS_FILE, events)
    return jsonify(event_to_update)

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    events = read_data(EVENTS_FILE)
    initial_len = len(events)
    events = [e for e in events if e['id'] != event_id]
    if len(events) == initial_len:
        return jsonify({"error": "Event not found"}), 404
    write_data(EVENTS_FILE, events)
    return '', 204

# Tasks (Tarefas / To-Do)
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = read_data(TASKS_FILE)
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    task_data = request.get_json()
    tasks = read_data(TASKS_FILE)
    task_data['id'] = f"task_{len(tasks) + 1}"
    tasks.append(task_data)
    write_data(TASKS_FILE, tasks)
    return jsonify(task_data), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = read_data(TASKS_FILE)
    task_to_update = next((t for t in tasks if t['id'] == task_id), None)
    if task_to_update is None:
        return jsonify({"error": "Task not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        task_to_update[key] = value

    write_data(TASKS_FILE, tasks)
    return jsonify(task_to_update)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = read_data(TASKS_FILE)
    initial_len = len(tasks)
    tasks = [t for t in tasks if t['id'] != task_id]
    if len(tasks) == initial_len:
        return jsonify({"error": "Task not found"}), 404
    write_data(TASKS_FILE, tasks)
    return '', 204

# Lesson Plans (Planos de Aula)
@app.route('/api/lesson-plans', methods=['GET'])
def get_lesson_plans():
    lesson_plans = read_data(LESSON_PLANS_FILE)
    return jsonify(lesson_plans)

@app.route('/api/lesson-plans', methods=['POST'])
def add_lesson_plan():
    plan_data = request.get_json()
    lesson_plans = read_data(LESSON_PLANS_FILE)
    plan_data['id'] = f"lp_{len(lesson_plans) + 1}"
    lesson_plans.append(plan_data)
    write_data(LESSON_PLANS_FILE, lesson_plans)
    return jsonify(plan_data), 201

@app.route('/api/lesson-plans/<plan_id>', methods=['GET'])
def get_lesson_plan_by_id(plan_id):
    lesson_plans = read_data(LESSON_PLANS_FILE)
    plan = next((p for p in lesson_plans if p['id'] == plan_id), None)
    if plan is None:
        return jsonify({"error": "Lesson Plan not found"}), 404
    return jsonify(plan)

@app.route('/api/lesson-plans/<plan_id>', methods=['PUT'])
def update_lesson_plan(plan_id):
    lesson_plans = read_data(LESSON_PLANS_FILE)
    plan_to_update = next((p for p in lesson_plans if p['id'] == plan_id), None)
    if plan_to_update is None:
        return jsonify({"error": "Lesson Plan not found"}), 404

    updated_data = request.get_json()
    for key, value in updated_data.items():
        plan_to_update[key] = value

    write_data(LESSON_PLANS_FILE, lesson_plans)
    return jsonify(plan_to_update)

@app.route('/api/lesson-plans/<plan_id>', methods=['DELETE'])
def delete_lesson_plan(plan_id):
    lesson_plans = read_data(LESSON_PLANS_FILE)
    initial_len = len(lesson_plans)
    lesson_plans = [p for p in lesson_plans if p['id'] != plan_id]
    if len(lesson_plans) == initial_len:
        return jsonify({"error": "Lesson Plan not found"}), 404
    write_data(LESSON_PLANS_FILE, lesson_plans)
    return '', 204


if __name__ == '__main__':
    PORT = 8000
    print(f"Servidor Flask rodando em http://127.0.0.1:{PORT}", file=sys.stdout)
    app.run(port=PORT)
