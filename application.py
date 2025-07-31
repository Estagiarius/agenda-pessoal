import os
from flask import Flask, request, Response, send_from_directory
from openai import OpenAI
import sys
import json
import boto3
from botocore.exceptions import NoCredentialsError
from datetime import datetime

# Configuração do Flask
application = Flask(__name__, static_folder='.', static_url_path='')

# Configuração do S3
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
s3_client = None
if S3_BUCKET_NAME:
    try:
        s3_client = boto3.client('s3')
    except NoCredentialsError:
        print("AVISO: Credenciais da AWS não encontradas. O upload para o S3 está desativado.", file=sys.stderr)
else:
    print("AVISO: O nome do bucket S3 (S3_BUCKET_NAME) não foi definido. O upload para o S3 está desativado.", file=sys.stderr)

# Configuração do Banco de Dados
db_user = os.environ.get('DB_USERNAME')
db_password = os.environ.get('DB_PASSWORD')
db_host = os.environ.get('DB_HOST')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME')
db_uri = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

application.config['SQLALCHEMY_DATABASE_URI'] = db_uri
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy(application)
migrate = Migrate(application, db)

# Modelos do Banco de Dados
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    priority = db.Column(db.String(50), default='Medium', nullable=False)
    due_date = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'completed': self.completed,
            'priority': self.priority,
            'dueDate': self.due_date.isoformat() if self.due_date else None
        }

class LessonPlan(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    title = db.Column(db.String(255), nullable=False)
    class_ids = db.Column(db.JSON, nullable=False)
    date = db.Column(db.Date, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    objectives = db.Column(db.Text, nullable=True)
    activities = db.Column(db.Text, nullable=True)
    assessment = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'createdAt': self.created_at.isoformat(),
            'title': self.title,
            'classIds': self.class_ids,
            'date': self.date.isoformat(),
            'topic': self.topic,
            'objectives': self.objectives,
            'activities': self.activities,
            'assessment': self.assessment
        }

# --- Education Models ---

enrollment_table = db.Table('enrollment',
    db.Column('student_id', db.String(50), db.ForeignKey('student.id'), primary_key=True),
    db.Column('class_id', db.String(50), db.ForeignKey('class.id'), primary_key=True)
)

class Subject(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=True)
    description = db.Column(db.Text, nullable=True)
    classes = db.relationship('Class', backref='subject', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'code': self.code, 'description': self.description}

class Class(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subject_id = db.Column(db.String(50), db.ForeignKey('subject.id'), nullable=False)
    year_semester = db.Column(db.String(50), nullable=False)
    teacher = db.Column(db.String(100), nullable=True)
    students = db.relationship('Student', secondary=enrollment_table, lazy='subquery',
                               backref=db.backref('classes', lazy=True))
    evaluations = db.relationship('Evaluation', backref='class', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'subjectId': self.subject_id,
                'yearSemester': self.year_semester, 'teacher': self.teacher}

class Student(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    call_number = db.Column(db.String(20), nullable=True) # Unique per class, handled in logic
    grades = db.relationship('Grade', backref='student', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'callNumber': self.call_number}

class Evaluation(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.String(50), db.ForeignKey('class.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    max_grade = db.Column(db.Float, nullable=False)
    grades = db.relationship('Grade', backref='evaluation', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'classId': self.class_id,
                'weight': self.weight, 'maxGrade': self.max_grade}

class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.String(50), db.ForeignKey('evaluation.id'), nullable=False)
    student_id = db.Column(db.String(50), db.ForeignKey('student.id'), nullable=False)
    grade = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'evaluationId': self.evaluation_id, 'studentId': self.student_id, 'grade': self.grade}

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

@application.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@application.route('/upload', methods=['POST'])
def upload_file():
    if not s3_client or not S3_BUCKET_NAME:
        return 'Serviço S3 não configurado no servidor.', 503

    if 'file' not in request.files:
        return 'Nenhuma parte do arquivo', 400
    file = request.files['file']
    if file.filename == '':
        return 'Nenhum arquivo selecionado', 400

    if file:
        filename = file.filename
        try:
            # Upload para o S3
            s3_client.upload_fileobj(
                file,
                S3_BUCKET_NAME,
                filename,
                ExtraArgs={'ContentType': file.content_type}
            )
            file_url = f"https//s3.amazonaws.com/{S3_BUCKET_NAME}/{filename}"

            # Atualizar metadados em materials.json no S3
            materials_path = 'materials.json'
            materials = []
            try:
                # Tenta baixar o materials.json existente do S3
                response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=materials_path)
                materials = json.loads(response['Body'].read().decode('utf-8'))
            except s3_client.exceptions.NoSuchKey:
                # O arquivo não existe ainda, o que é normal na primeira vez
                pass

            new_material = {
                'id': f'mat_{len(materials) + 1}',
                'title': request.form.get('title', filename),
                'type': filename.split('.')[-1],
                'tags': [tag.strip() for tag in request.form.get('tags', '').split(',')],
                'url': file_url
            }
            materials.append(new_material)

            # Salva o materials.json atualizado de volta no S3
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=materials_path,
                Body=json.dumps(materials, indent=4),
                ContentType='application/json'
            )

            return 'Arquivo enviado com sucesso', 200
        except Exception as e:
            print(f"ERRO: Falha ao fazer upload para o S3: {e}", file=sys.stderr)
            return 'Falha no upload do arquivo', 500

@application.route('/api/materials', methods=['GET'])
def get_materials():
    if not s3_client or not S3_BUCKET_NAME:
        return 'Serviço S3 não configurado no servidor.', 503

    try:
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key='materials.json')
        materials_json = response['Body'].read().decode('utf-8')
        return Response(materials_json, mimetype='application/json')
    except s3_client.exceptions.NoSuchKey:
        return json.dumps([]), 200
    except Exception as e:
        print(f"ERRO: Falha ao buscar materiais do S3: {e}", file=sys.stderr)
        return 'Falha ao buscar materiais', 500

# API Endpoints para Tarefas (Tasks)
@application.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return json.dumps([task.to_dict() for task in tasks])

@application.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = Task(
        text=data['text'],
        priority=data.get('priority', 'Medium'),
        due_date=datetime.strptime(data['dueDate'], '%Y-%m-%d').date() if data.get('dueDate') else None
    )
    db.session.add(new_task)
    db.session.commit()
    return json.dumps(new_task.to_dict()), 201

@application.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    task.text = data.get('text', task.text)
    task.completed = data.get('completed', task.completed)
    task.priority = data.get('priority', task.priority)
    task.due_date = datetime.strptime(data['dueDate'], '%Y-%m-%d').date() if data.get('dueDate') else task.due_date
    db.session.commit()
    return json.dumps(task.to_dict())

@application.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

# API Endpoints para Planos de Aula (Lesson Plans)
@application.route('/api/lesson-plans', methods=['GET'])
def get_lesson_plans():
    plans = LessonPlan.query.all()
    return json.dumps([plan.to_dict() for plan in plans])

@application.route('/api/lesson-plans', methods=['POST'])
def add_lesson_plan():
    data = request.get_json()
    new_plan = LessonPlan(
        id=data['id'],
        title=data['title'],
        class_ids=data['classIds'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        topic=data['topic'],
        objectives=data.get('objectives'),
        activities=data.get('activities'),
        assessment=data.get('assessment')
    )
    db.session.add(new_plan)
    db.session.commit()
    return json.dumps(new_plan.to_dict()), 201

@application.route('/api/lesson-plans/<string:plan_id>', methods=['PUT'])
def update_lesson_plan(plan_id):
    plan = LessonPlan.query.get_or_404(plan_id)
    data = request.get_json()
    plan.title = data.get('title', plan.title)
    plan.class_ids = data.get('classIds', plan.class_ids)
    plan.date = datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else plan.date
    plan.topic = data.get('topic', plan.topic)
    plan.objectives = data.get('objectives', plan.objectives)
    plan.activities = data.get('activities', plan.activities)
    plan.assessment = data.get('assessment', plan.assessment)
    db.session.commit()
    return json.dumps(plan.to_dict())

@application.route('/api/lesson-plans/<string:plan_id>', methods=['DELETE'])
def delete_lesson_plan(plan_id):
    plan = LessonPlan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()
    return '', 204

# --- Education API Endpoints ---

# Subjects
@application.route('/api/subjects', methods=['GET'])
def get_subjects():
    return json.dumps([s.to_dict() for s in Subject.query.all()])

@application.route('/api/subjects', methods=['POST'])
def add_subject():
    data = request.get_json()
    # RN04: Unique name/code check
    if Subject.query.filter((Subject.name == data['name']) | (Subject.code == data['code'])).first():
        return 'Já existe uma disciplina com este nome ou código.', 400
    new_subject = Subject(id=f"subj_{datetime.now().timestamp()}", **data)
    db.session.add(new_subject)
    db.session.commit()
    return json.dumps(new_subject.to_dict()), 201

@application.route('/api/subjects/<string:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    data = request.get_json()
    subject.name = data.get('name', subject.name)
    subject.code = data.get('code', subject.code)
    subject.description = data.get('description', subject.description)
    db.session.commit()
    return json.dumps(subject.to_dict())

@application.route('/api/subjects/<string:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    # RN03: Check for associated classes
    if Class.query.filter_by(subject_id=subject_id).first():
        return 'Não é possível excluir a disciplina, pois existem turmas associadas a ela.', 400
    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()
    return '', 204

# Classes
@application.route('/api/classes', methods=['GET'])
def get_classes():
    return json.dumps([c.to_dict() for c in Class.query.all()])

@application.route('/api/classes', methods=['POST'])
def add_class():
    data = request.get_json()
    # RN05: Unique combination check
    if Class.query.filter_by(name=data['name'], subject_id=data['subjectId'], year_semester=data['yearSemester']).first():
        return 'Já existe uma turma com esta combinação de nome, disciplina e ano/semestre.', 400
    new_class = Class(id=f"cls_{datetime.now().timestamp()}", name=data['name'], subject_id=data['subjectId'],
                      year_semester=data['yearSemester'], teacher=data.get('teacher'))
    db.session.add(new_class)
    db.session.commit()
    return json.dumps(new_class.to_dict()), 201

@application.route('/api/classes/<string:class_id>', methods=['PUT'])
def update_class(class_id):
    cls = Class.query.get_or_404(class_id)
    data = request.get_json()
    cls.name = data.get('name', cls.name)
    cls.subject_id = data.get('subjectId', cls.subject_id)
    cls.year_semester = data.get('yearSemester', cls.year_semester)
    cls.teacher = data.get('teacher', cls.teacher)
    db.session.commit()
    return json.dumps(cls.to_dict())

@application.route('/api/classes/<string:class_id>', methods=['DELETE'])
def delete_class(class_id):
    cls = Class.query.get_or_404(class_id)
    db.session.delete(cls)
    db.session.commit()
    return '', 204

# Students
@application.route('/api/students', methods=['GET'])
def get_students():
    class_id = request.args.get('class_id')
    if class_id:
        cls = Class.query.get_or_404(class_id)
        return json.dumps([s.to_dict() for s in cls.students])
    return json.dumps([s.to_dict() for s in Student.query.all()])

@application.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    new_student = Student(id=f"std_{datetime.now().timestamp()}", name=data['name'], call_number=data.get('callNumber'))
    db.session.add(new_student)
    db.session.commit()
    return json.dumps(new_student.to_dict()), 201

@application.route('/api/students/<string:student_id>', methods=['PUT'])
def update_student(student_id):
    student = Student.query.get_or_404(student_id)
    data = request.get_json()
    student.name = data.get('name', student.name)
    student.call_number = data.get('callNumber', student.call_number)
    db.session.commit()
    return json.dumps(student.to_dict())

@application.route('/api/students/<string:student_id>', methods=['DELETE'])
def delete_student(student_id):
    # RN10: Check for enrollments
    student = Student.query.get_or_404(student_id)
    if student.classes:
        return 'Este aluno está matriculado em uma ou mais turmas e não pode ser excluído.', 400
    db.session.delete(student)
    db.session.commit()
    return '', 204

# Enrollments
@application.route('/api/classes/<string:class_id>/students', methods=['POST'])
def enroll_student(class_id):
    cls = Class.query.get_or_404(class_id)
    data = request.get_json()
    student = Student.query.get_or_404(data['studentId'])
    # RN09: Avoid duplicate enrollment
    if student in cls.students:
        return 'Este aluno já está matriculado nesta turma.', 400
    cls.students.append(student)
    db.session.commit()
    return json.dumps(cls.to_dict())

@application.route('/api/classes/<string:class_id>/students/<string:student_id>', methods=['DELETE'])
def remove_student_from_class(class_id, student_id):
    cls = Class.query.get_or_404(class_id)
    student = Student.query.get_or_404(student_id)
    if student in cls.students:
        cls.students.remove(student)
        db.session.commit()
    return json.dumps(cls.to_dict())

# Evaluations and Grades
@application.route('/api/evaluations', methods=['POST'])
def add_evaluation():
    data = request.get_json()
    new_eval = Evaluation(id=f"eval_{datetime.now().timestamp()}", **data)
    db.session.add(new_eval)
    db.session.commit()
    return json.dumps(new_eval.to_dict()), 201

@application.route('/api/evaluations/<string:eval_id>', methods=['PUT'])
def update_evaluation(eval_id):
    evaluation = Evaluation.query.get_or_404(eval_id)
    data = request.get_json()
    evaluation.name = data.get('name', evaluation.name)
    evaluation.weight = data.get('weight', evaluation.weight)
    evaluation.max_grade = data.get('max_grade', evaluation.max_grade)
    db.session.commit()
    return json.dumps(evaluation.to_dict())

@application.route('/api/evaluations/<string:eval_id>', methods=['DELETE'])
def delete_evaluation(eval_id):
    # RN16: Delete associated grades
    Grade.query.filter_by(evaluation_id=eval_id).delete()
    evaluation = Evaluation.query.get_or_404(eval_id)
    db.session.delete(evaluation)
    db.session.commit()
    return '', 204

@application.route('/api/evaluations/<string:eval_id>/grades', methods=['GET'])
def get_grades(eval_id):
    grades = Grade.query.filter_by(evaluation_id=eval_id).all()
    return json.dumps([g.to_dict() for g in grades])

@application.route('/api/evaluations/<string:eval_id>/grades', methods=['POST'])
def save_grades(eval_id):
    evaluation = Evaluation.query.get_or_404(eval_id)
    data = request.get_json()
    # Delete old grades for this evaluation
    Grade.query.filter_by(evaluation_id=eval_id).delete()
    for grade_data in data:
        # RN13: Validate max grade
        if grade_data['grade'] > evaluation.max_grade:
            return f"A nota para {grade_data['studentId']} não pode ser maior que {evaluation.max_grade}.", 400
        new_grade = Grade(evaluation_id=eval_id, student_id=grade_data['studentId'], grade=grade_data['grade'])
        db.session.add(new_grade)
    db.session.commit()
    return get_grades(eval_id)

@application.route('/api/chat', methods=['POST'])
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

@application.cli.command('init-db')
def init_db_command():
    """Cria as tabelas do banco de dados."""
    db.create_all()
    print('Banco de dados inicializado.')
