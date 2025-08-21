import os
from flask import Flask, request, Response, send_from_directory, jsonify
from openai import OpenAI
import sys
import json
import uuid
import database as db
from datetime import date, timedelta

# Configuração do Flask
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
        # Salva o arquivo no diretório de uploads
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Salva os metadados no banco de dados
        conn = db.get_db_connection()

        # Gera um ID único para o material
        material_id = f'mat_{uuid.uuid4().hex}'

        # Coleta os outros dados do formulário
        title = request.form.get('title', filename)
        file_type = filename.split('.')[-1] if '.' in filename else ''
        # Converte a lista de tags em uma string separada por vírgulas
        tags_list = [tag.strip() for tag in request.form.get('tags', '').split(',') if tag.strip()]
        tags_str = ','.join(tags_list)

        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO materials (id, title, type, tags, url) VALUES (?, ?, ?, ?, ?)',
            (material_id, title, file_type, tags_str, file_path)
        )

        conn.commit()
        conn.close()

        return 'File uploaded successfully', 200

@app.route('/api/materials')
def get_materials():
    conn = db.get_db_connection()
    materials_rows = conn.execute('SELECT * FROM materials ORDER BY title').fetchall()
    conn.close()

    materials = []
    for row in materials_rows:
        material_dict = dict(row)
        # Converte a string de tags de volta para uma lista para o frontend
        if material_dict.get('tags'):
            material_dict['tags'] = [tag.strip() for tag in material_dict['tags'].split(',')]
        else:
            material_dict['tags'] = []
        materials.append(material_dict)

    return jsonify(materials)

# --- API para Disciplinas ---

@app.route('/api/disciplinas', methods=['GET'])
def get_disciplinas():
    conn = db.get_db_connection()
    disciplinas_rows = conn.execute('SELECT * FROM disciplina ORDER BY nome').fetchall()
    conn.close()
    disciplinas = [dict(row) for row in disciplinas_rows]
    return jsonify(disciplinas)

@app.route('/api/disciplinas', methods=['POST'])
def create_disciplina():
    data = request.get_json()
    if not data or not data.get('nome'):
        return jsonify({'error': 'O campo "nome" é obrigatório'}), 400

    new_id = f"disc_{uuid.uuid4().hex}"
    nome = data['nome']
    codigo = data.get('codigo', '')
    descricao = data.get('descricao', '')

    conn = db.get_db_connection()
    conn.execute(
        'INSERT INTO disciplina (id, nome, codigo, descricao) VALUES (?, ?, ?, ?)',
        (new_id, nome, codigo, descricao)
    )
    conn.commit()

    new_disciplina = conn.execute('SELECT * FROM disciplina WHERE id = ?', (new_id,)).fetchone()
    conn.close()

    return jsonify(dict(new_disciplina)), 201

@app.route('/api/disciplinas/<string:disciplina_id>', methods=['GET'])
def get_disciplina(disciplina_id):
    conn = db.get_db_connection()
    disciplina = conn.execute('SELECT * FROM disciplina WHERE id = ?', (disciplina_id,)).fetchone()
    conn.close()
    if disciplina is None:
        return jsonify({'error': 'Disciplina não encontrada'}), 404
    return jsonify(dict(disciplina))

@app.route('/api/disciplinas/<string:disciplina_id>', methods=['PUT'])
def update_disciplina(disciplina_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    # Verifica se a disciplina existe
    disciplina = conn.execute('SELECT * FROM disciplina WHERE id = ?', (disciplina_id,)).fetchone()
    if disciplina is None:
        conn.close()
        return jsonify({'error': 'Disciplina não encontrada'}), 404

    # Coleta os novos dados
    nome = data.get('nome', disciplina['nome'])
    codigo = data.get('codigo', disciplina['codigo'])
    descricao = data.get('descricao', disciplina['descricao'])

    conn.execute(
        'UPDATE disciplina SET nome = ?, codigo = ?, descricao = ? WHERE id = ?',
        (nome, codigo, descricao, disciplina_id)
    )
    conn.commit()

    updated_disciplina = conn.execute('SELECT * FROM disciplina WHERE id = ?', (disciplina_id,)).fetchone()
    conn.close()

    return jsonify(dict(updated_disciplina))

@app.route('/api/disciplinas/<string:disciplina_id>', methods=['DELETE'])
def delete_disciplina(disciplina_id):
    conn = db.get_db_connection()
    # Verifica se a disciplina existe antes de deletar
    disciplina = conn.execute('SELECT * FROM disciplina WHERE id = ?', (disciplina_id,)).fetchone()
    if disciplina is None:
        conn.close()
        return jsonify({'error': 'Disciplina não encontrada'}), 404

    conn.execute('DELETE FROM disciplina WHERE id = ?', (disciplina_id,))
    conn.commit()
    conn.close()

    return '', 204


# --- API para Turmas ---

@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = db.get_db_connection()
    # Join com disciplina para obter o nome da disciplina, que é útil para a UI
    query = """
        SELECT t.*, d.nome as disciplina_nome
        FROM turma t
        JOIN disciplina d ON t.id_disciplina = d.id
        ORDER BY t.nome
    """
    turmas_rows = conn.execute(query).fetchall()
    conn.close()
    turmas = [dict(row) for row in turmas_rows]
    return jsonify(turmas)

@app.route('/api/turmas', methods=['POST'])
def create_turma():
    data = request.get_json()
    if not data or not data.get('nome') or not data.get('id_disciplina'):
        return jsonify({'error': 'Os campos "nome" e "id_disciplina" são obrigatórios'}), 400

    new_id = f"turma_{uuid.uuid4().hex}"
    nome = data['nome']
    id_disciplina = data['id_disciplina']
    ano_semestre = data.get('ano_semestre', '')
    professor = data.get('professor', '')

    conn = db.get_db_connection()
    # RN02: Verificar se a disciplina existe
    disciplina = conn.execute('SELECT id FROM disciplina WHERE id = ?', (id_disciplina,)).fetchone()
    if disciplina is None:
        conn.close()
        return jsonify({'error': 'A disciplina especificada não existe.'}), 400

    conn.execute(
        'INSERT INTO turma (id, nome, ano_semestre, professor, id_disciplina) VALUES (?, ?, ?, ?, ?)',
        (new_id, nome, ano_semestre, professor, id_disciplina)
    )
    conn.commit()

    # Retorna a turma recém-criada com o nome da disciplina
    new_turma_row = conn.execute("""
        SELECT t.*, d.nome as disciplina_nome
        FROM turma t
        JOIN disciplina d ON t.id_disciplina = d.id
        WHERE t.id = ?
    """, (new_id,)).fetchone()
    conn.close()

    return jsonify(dict(new_turma_row)), 201

@app.route('/api/turmas/<string:turma_id>', methods=['GET'])
def get_turma(turma_id):
    conn = db.get_db_connection()
    turma = conn.execute('SELECT * FROM turma WHERE id = ?', (turma_id,)).fetchone()
    conn.close()
    if turma is None:
        return jsonify({'error': 'Turma não encontrada'}), 404
    return jsonify(dict(turma))

@app.route('/api/turmas/<string:turma_id>', methods=['PUT'])
def update_turma(turma_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    turma = conn.execute('SELECT * FROM turma WHERE id = ?', (turma_id,)).fetchone()
    if turma is None:
        conn.close()
        return jsonify({'error': 'Turma não encontrada'}), 404

    nome = data.get('nome', turma['nome'])
    ano_semestre = data.get('ano_semestre', turma['ano_semestre'])
    professor = data.get('professor', turma['professor'])
    id_disciplina = data.get('id_disciplina', turma['id_disciplina'])

    conn.execute(
        'UPDATE turma SET nome = ?, ano_semestre = ?, professor = ?, id_disciplina = ? WHERE id = ?',
        (nome, ano_semestre, professor, id_disciplina, turma_id)
    )
    conn.commit()

    updated_turma_row = conn.execute("""
        SELECT t.*, d.nome as disciplina_nome
        FROM turma t
        JOIN disciplina d ON t.id_disciplina = d.id
        WHERE t.id = ?
    """, (turma_id,)).fetchone()
    conn.close()

    return jsonify(dict(updated_turma_row))

@app.route('/api/turmas/<string:turma_id>', methods=['DELETE'])
def delete_turma(turma_id):
    conn = db.get_db_connection()
    turma = conn.execute('SELECT * FROM turma WHERE id = ?', (turma_id,)).fetchone()
    if turma is None:
        conn.close()
        return jsonify({'error': 'Turma não encontrada'}), 404

    conn.execute('DELETE FROM turma WHERE id = ?', (turma_id,))
    conn.commit()
    conn.close()

    return '', 204


# --- API para Alunos ---

@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = db.get_db_connection()
    alunos_rows = conn.execute('SELECT * FROM aluno ORDER BY nome').fetchall()
    conn.close()
    alunos = [dict(row) for row in alunos_rows]
    return jsonify(alunos)

@app.route('/api/alunos', methods=['POST'])
def create_aluno():
    data = request.get_json()
    if not data or not data.get('nome'):
        return jsonify({'error': 'O campo "nome" é obrigatório'}), 400

    new_id = f"aluno_{uuid.uuid4().hex}"
    nome = data['nome']
    matricula = data.get('matricula', '')
    data_nascimento = data.get('data_nascimento', '')

    conn = db.get_db_connection()
    conn.execute(
        'INSERT INTO aluno (id, nome, matricula, data_nascimento) VALUES (?, ?, ?, ?)',
        (new_id, nome, matricula, data_nascimento)
    )
    conn.commit()
    new_aluno = conn.execute('SELECT * FROM aluno WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_aluno)), 201

@app.route('/api/alunos/<string:aluno_id>', methods=['GET'])
def get_aluno(aluno_id):
    conn = db.get_db_connection()
    aluno = conn.execute('SELECT * FROM aluno WHERE id = ?', (aluno_id,)).fetchone()
    conn.close()
    if aluno is None:
        return jsonify({'error': 'Aluno não encontrado'}), 404
    return jsonify(dict(aluno))

@app.route('/api/alunos/<string:aluno_id>', methods=['PUT'])
def update_aluno(aluno_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    aluno = conn.execute('SELECT * FROM aluno WHERE id = ?', (aluno_id,)).fetchone()
    if aluno is None:
        conn.close()
        return jsonify({'error': 'Aluno não encontrado'}), 404

    nome = data.get('nome', aluno['nome'])
    matricula = data.get('matricula', aluno['matricula'])
    data_nascimento = data.get('data_nascimento', aluno['data_nascimento'])

    conn.execute(
        'UPDATE aluno SET nome = ?, matricula = ?, data_nascimento = ? WHERE id = ?',
        (nome, matricula, data_nascimento, aluno_id)
    )
    conn.commit()
    updated_aluno = conn.execute('SELECT * FROM aluno WHERE id = ?', (aluno_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated_aluno))

@app.route('/api/alunos/<string:aluno_id>', methods=['DELETE'])
def delete_aluno(aluno_id):
    conn = db.get_db_connection()
    # RN10: Verifica se o aluno está matriculado em alguma turma
    matriculas = conn.execute('SELECT id_turma FROM matricula WHERE id_aluno = ?', (aluno_id,)).fetchall()
    if matriculas:
        conn.close()
        return jsonify({'error': 'Este aluno está matriculado em uma ou mais turmas e não pode ser excluído.'}), 400

    conn.execute('DELETE FROM aluno WHERE id = ?', (aluno_id,))
    conn.commit()
    conn.close()
    return '', 204

# --- API para Matrículas (Enrollments) ---

@app.route('/api/turmas/<string:turma_id>/alunos', methods=['GET'])
def get_alunos_por_turma(turma_id):
    conn = db.get_db_connection()
    query = """
        SELECT a.* FROM aluno a
        JOIN matricula m ON a.id = m.id_aluno
        WHERE m.id_turma = ?
        ORDER BY a.nome
    """
    alunos_rows = conn.execute(query, (turma_id,)).fetchall()
    conn.close()
    alunos = [dict(row) for row in alunos_rows]
    return jsonify(alunos)

@app.route('/api/turmas/<string:turma_id>/alunos', methods=['POST'])
def matricular_aluno(turma_id):
    data = request.get_json()
    if not data or not data.get('id_aluno'):
        return jsonify({'error': 'O campo "id_aluno" é obrigatório'}), 400
    id_aluno = data['id_aluno']

    conn = db.get_db_connection()
    # Adicionar lógica para verificar se aluno e turma existem, se necessário
    try:
        conn.execute('INSERT INTO matricula (id_aluno, id_turma) VALUES (?, ?)', (id_aluno, turma_id))
        conn.commit()
    except conn.IntegrityError:
        # RN09: Lida com a violação da chave primária (matrícula duplicada)
        conn.close()
        return jsonify({'error': 'Este aluno já está matriculado nesta turma.'}), 409 # 409 Conflict
    finally:
        conn.close()

    return jsonify({'success': True}), 201

@app.route('/api/turmas/<string:turma_id>/alunos/<string:aluno_id>', methods=['DELETE'])
def desmatricular_aluno(turma_id, aluno_id):
    conn = db.get_db_connection()
    # Verificar se a matrícula existe antes de deletar
    matricula = conn.execute('SELECT * FROM matricula WHERE id_aluno = ? AND id_turma = ?', (aluno_id, turma_id)).fetchone()
    if matricula is None:
        conn.close()
        return jsonify({'error': 'Matrícula não encontrada'}), 404

    conn.execute('DELETE FROM matricula WHERE id_aluno = ? AND id_turma = ?', (aluno_id, turma_id))
    conn.commit()
    conn.close()
    return '', 204


# --- API para Avaliações e Notas ---

@app.route('/api/turmas/<string:turma_id>/avaliacoes', methods=['GET'])
def get_avaliacoes_por_turma(turma_id):
    conn = db.get_db_connection()
    avaliacoes_rows = conn.execute('SELECT * FROM avaliacao WHERE id_turma = ? ORDER BY nome', (turma_id,)).fetchall()
    conn.close()
    avaliacoes = [dict(row) for row in avaliacoes_rows]
    return jsonify(avaliacoes)

@app.route('/api/avaliacoes', methods=['POST'])
def create_avaliacao():
    data = request.get_json()
    if not data or not data.get('nome') or not data.get('id_turma') or 'peso' not in data or 'nota_maxima' not in data:
        return jsonify({'error': 'Campos obrigatórios (nome, id_turma, peso, nota_maxima) estão faltando.'}), 400

    new_id = f"aval_{uuid.uuid4().hex}"

    conn = db.get_db_connection()
    conn.execute(
        'INSERT INTO avaliacao (id, nome, peso, nota_maxima, id_turma) VALUES (?, ?, ?, ?, ?)',
        (new_id, data['nome'], data['peso'], data['nota_maxima'], data['id_turma'])
    )
    conn.commit()
    new_avaliacao = conn.execute('SELECT * FROM avaliacao WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_avaliacao)), 201

@app.route('/api/avaliacoes/<string:avaliacao_id>', methods=['GET'])
def get_avaliacao(avaliacao_id):
    conn = db.get_db_connection()
    avaliacao = conn.execute('SELECT * FROM avaliacao WHERE id = ?', (avaliacao_id,)).fetchone()
    conn.close()
    if avaliacao is None:
        return jsonify({'error': 'Avaliação não encontrada'}), 404
    return jsonify(dict(avaliacao))

@app.route('/api/avaliacoes/<string:avaliacao_id>', methods=['PUT'])
def update_avaliacao(avaliacao_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    avaliacao = conn.execute('SELECT * FROM avaliacao WHERE id = ?', (avaliacao_id,)).fetchone()
    if avaliacao is None:
        conn.close()
        return jsonify({'error': 'Avaliação não encontrada'}), 404

    nome = data.get('nome', avaliacao['nome'])
    peso = data.get('peso', avaliacao['peso'])
    nota_maxima = data.get('nota_maxima', avaliacao['nota_maxima'])

    conn.execute(
        'UPDATE avaliacao SET nome = ?, peso = ?, nota_maxima = ? WHERE id = ?',
        (nome, peso, nota_maxima, avaliacao_id)
    )
    conn.commit()
    updated_avaliacao = conn.execute('SELECT * FROM avaliacao WHERE id = ?', (avaliacao_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated_avaliacao))

@app.route('/api/avaliacoes/<string:avaliacao_id>', methods=['DELETE'])
def delete_avaliacao(avaliacao_id):
    conn = db.get_db_connection()
    # RN16: Excluir notas associadas
    conn.execute('BEGIN')
    try:
        conn.execute('DELETE FROM nota WHERE id_avaliacao = ?', (avaliacao_id,))
        conn.execute('DELETE FROM avaliacao WHERE id = ?', (avaliacao_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'Erro ao excluir avaliação: {e}'}), 500

    conn.close()
    return '', 204

@app.route('/api/avaliacoes/<string:avaliacao_id>/notas', methods=['GET'])
def get_notas_por_avaliacao(avaliacao_id):
    conn = db.get_db_connection()
    notas_rows = conn.execute('SELECT * FROM nota WHERE id_avaliacao = ?', (avaliacao_id,)).fetchall()
    conn.close()
    notas = [dict(row) for row in notas_rows]
    return jsonify(notas)

@app.route('/api/avaliacoes/<string:avaliacao_id>/notas', methods=['POST'])
def save_notas(avaliacao_id):
    grades = request.get_json()
    if not isinstance(grades, list):
        return jsonify({'error': 'O corpo da requisição deve ser uma lista de notas.'}), 400

    conn = db.get_db_connection()
    # RN13: Validação da nota máxima
    avaliacao = conn.execute('SELECT nota_maxima FROM avaliacao WHERE id = ?', (avaliacao_id,)).fetchone()
    if not avaliacao:
        conn.close()
        return jsonify({'error': 'Avaliação não encontrada.'}), 404
    nota_maxima = avaliacao['nota_maxima']

    for grade in grades:
        if grade.get('grade') > nota_maxima:
            conn.close()
            return jsonify({'error': f"A nota para o aluno {grade.get('studentId')} não pode ser maior que {nota_maxima}."}), 400

    # Usar uma transação para a operação de apagar e inserir
    try:
        cursor = conn.cursor()
        cursor.execute('BEGIN')
        # Remove notas antigas para esta avaliação
        cursor.execute('DELETE FROM nota WHERE id_avaliacao = ?', (avaliacao_id,))

        # Insere as novas notas
        if grades:
            grades_to_insert = [(g['studentId'], avaliacao_id, g['grade']) for g in grades]
            cursor.executemany('INSERT INTO nota (id_aluno, id_avaliacao, valor) VALUES (?, ?, ?)', grades_to_insert)

        cursor.execute('COMMIT')
    except Exception as e:
        cursor.execute('ROLLBACK')
        conn.close()
        return jsonify({'error': f'Erro ao salvar notas: {e}'}), 500

    conn.close()
    return jsonify({'success': True}), 201


# --- API para Eventos do Calendário ---

@app.route('/api/eventos', methods=['GET'])
def get_eventos():
    start_date_str = request.args.get('start')
    end_date_str = request.args.get('end')

    conn = db.get_db_connection()
    if start_date_str and end_date_str:
        # Fetch events within a date range
        event_rows = conn.execute(
            'SELECT * FROM evento WHERE date BETWEEN ? AND ? ORDER BY date, start_time',
            (start_date_str, end_date_str)
        ).fetchall()
    else:
        # Fetch all events if no range is specified
        event_rows = conn.execute('SELECT * FROM evento ORDER BY date, start_time').fetchall()

    conn.close()

    events = []
    for row in event_rows:
        event_dict = dict(row)
        if event_dict.get('reminders'):
            event_dict['reminders'] = [int(r) for r in event_dict['reminders'].split(',') if r]
        else:
            event_dict['reminders'] = []
        events.append(event_dict)

    return jsonify(events)

@app.route('/api/eventos', methods=['POST'])
def create_evento():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('date'):
        return jsonify({'error': 'Campos "title" e "date" são obrigatórios.'}), 400

    conn = db.get_db_connection()
    cursor = conn.cursor()

    recurrence_frequency = data.get('recurrenceFrequency')
    recurrence_end_date_str = data.get('recurrenceEndDate')

    events_to_insert = []

    base_event = {
        'title': data['title'],
        'date': data['date'],
        'start_time': data.get('startTime'),
        'end_time': data.get('endTime'),
        'description': data.get('description'),
        'reminders': ','.join(map(str, data.get('reminders', [])))
    }

    if recurrence_frequency and recurrence_frequency != 'none' and recurrence_end_date_str:
        recurrence_id = f"rec_{uuid.uuid4().hex}"
        current_date = date.fromisoformat(base_event['date'])
        end_date = date.fromisoformat(recurrence_end_date_str)

        delta = None
        if recurrence_frequency == 'daily':
            delta = timedelta(days=1)
        elif recurrence_frequency == 'weekly':
            delta = timedelta(weeks=1)

        while current_date <= end_date:
            event_id = f"evt_{uuid.uuid4().hex}"
            events_to_insert.append((
                event_id, base_event['title'], current_date.isoformat(),
                base_event['start_time'], base_event['end_time'],
                base_event['description'], recurrence_id, base_event['reminders']
            ))
            if delta:
                current_date += delta
            elif recurrence_frequency == 'monthly':
                # This is a simplified version, for a real app use a library like dateutil
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
            else:
                break
    else:
        event_id = f"evt_{uuid.uuid4().hex}"
        events_to_insert.append((
            event_id, base_event['title'], base_event['date'],
            base_event['start_time'], base_event['end_time'],
            base_event['description'], None, base_event['reminders']
        ))

    try:
        cursor.execute('BEGIN')
        cursor.executemany(
            'INSERT INTO evento (id, title, date, start_time, end_time, description, recurrence_id, reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            events_to_insert
        )
        cursor.execute('COMMIT')
    except Exception as e:
        cursor.execute('ROLLBACK')
        conn.close()
        return jsonify({'error': f'Erro ao criar evento(s): {e}'}), 500

    conn.close()
    return jsonify({'success': True, 'count': len(events_to_insert)}), 201

@app.route('/api/eventos/<string:evento_id>', methods=['GET'])
def get_evento(evento_id):
    conn = db.get_db_connection()
    evento = conn.execute('SELECT * FROM evento WHERE id = ?', (evento_id,)).fetchone()
    conn.close()
    if evento is None:
        return jsonify({'error': 'Evento não encontrado'}), 404

    event_dict = dict(evento)
    if event_dict.get('reminders'):
        event_dict['reminders'] = [int(r) for r in event_dict['reminders'].split(',') if r]
    else:
        event_dict['reminders'] = []
    return jsonify(event_dict)

@app.route('/api/eventos/<string:evento_id>', methods=['PUT'])
def update_evento(evento_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    evento = conn.execute('SELECT * FROM evento WHERE id = ?', (evento_id,)).fetchone()
    if evento is None:
        conn.close()
        return jsonify({'error': 'Evento não encontrado'}), 404

    title = data.get('title', evento['title'])
    date_str = data.get('date', evento['date'])
    start_time = data.get('startTime', evento['start_time'])
    end_time = data.get('endTime', evento['end_time'])
    description = data.get('description', evento['description'])
    reminders = ','.join(map(str, data.get('reminders', [])))

    conn.execute(
        'UPDATE evento SET title = ?, date = ?, start_time = ?, end_time = ?, description = ?, reminders = ? WHERE id = ?',
        (title, date_str, start_time, end_time, description, reminders, evento_id)
    )
    conn.commit()
    updated_evento = conn.execute('SELECT * FROM evento WHERE id = ?', (evento_id,)).fetchone()
    conn.close()

    event_dict = dict(updated_evento)
    if event_dict.get('reminders'):
        event_dict['reminders'] = [int(r) for r in event_dict['reminders'].split(',') if r]
    else:
        event_dict['reminders'] = []

    return jsonify(event_dict)

@app.route('/api/eventos/<string:evento_id>', methods=['DELETE'])
def delete_evento(evento_id):
    scope = request.args.get('scope', 'this') # 'this', 'future', 'all'

    conn = db.get_db_connection()
    evento_to_delete = conn.execute('SELECT * FROM evento WHERE id = ?', (evento_id,)).fetchone()
    if evento_to_delete is None:
        conn.close()
        return jsonify({'error': 'Evento não encontrado'}), 404

    try:
        conn.execute('BEGIN')
        if scope == 'this' or not evento_to_delete['recurrence_id']:
            conn.execute('DELETE FROM evento WHERE id = ?', (evento_id,))
        elif scope == 'all':
            conn.execute('DELETE FROM evento WHERE recurrence_id = ?', (evento_to_delete['recurrence_id'],))
        elif scope == 'future':
            conn.execute(
                'DELETE FROM evento WHERE recurrence_id = ? AND date >= ?',
                (evento_to_delete['recurrence_id'], evento_to_delete['date'])
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'Erro ao excluir evento(s): {e}'}), 500

    conn.close()
    return '', 204


# --- API para Tarefas (To-Do) ---

@app.route('/api/tarefas', methods=['GET'])
def get_tarefas():
    conn = db.get_db_connection()
    tarefas_rows = conn.execute('SELECT * FROM tarefa ORDER BY id').fetchall()
    conn.close()

    tarefas = []
    for row in tarefas_rows:
        tarefa_dict = dict(row)
        # Convert integer to boolean for the frontend
        tarefa_dict['completed'] = bool(tarefa_dict['completed'])
        tarefas.append(tarefa_dict)

    return jsonify(tarefas)

@app.route('/api/tarefas', methods=['POST'])
def create_tarefa():
    data = request.get_json()
    if not data or not data.get('text'):
        return jsonify({'error': 'O campo "text" é obrigatório.'}), 400

    new_id = f"task_{uuid.uuid4().hex}"

    conn = db.get_db_connection()
    conn.execute(
        'INSERT INTO tarefa (id, text, completed, priority, due_date) VALUES (?, ?, ?, ?, ?)',
        (new_id, data['text'], 0, data.get('priority'), data.get('dueDate'))
    )
    conn.commit()
    new_tarefa = conn.execute('SELECT * FROM tarefa WHERE id = ?', (new_id,)).fetchone()
    conn.close()

    tarefa_dict = dict(new_tarefa)
    tarefa_dict['completed'] = bool(tarefa_dict['completed'])

    return jsonify(tarefa_dict), 201

@app.route('/api/tarefas/<string:tarefa_id>', methods=['PUT'])
def update_tarefa(tarefa_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    tarefa = conn.execute('SELECT * FROM tarefa WHERE id = ?', (tarefa_id,)).fetchone()
    if tarefa is None:
        conn.close()
        return jsonify({'error': 'Tarefa não encontrada'}), 404

    # Use 'get' with a default value of the existing data
    text = data.get('text', tarefa['text'])
    priority = data.get('priority', tarefa['priority'])
    due_date = data.get('dueDate', tarefa['due_date'])
    # Handle 'completed' specifically, as it might be False
    completed = data.get('completed', bool(tarefa['completed']))

    conn.execute(
        'UPDATE tarefa SET text = ?, priority = ?, due_date = ?, completed = ? WHERE id = ?',
        (text, priority, due_date, 1 if completed else 0, tarefa_id)
    )
    conn.commit()
    updated_tarefa = conn.execute('SELECT * FROM tarefa WHERE id = ?', (tarefa_id,)).fetchone()
    conn.close()

    tarefa_dict = dict(updated_tarefa)
    tarefa_dict['completed'] = bool(tarefa_dict['completed'])

    return jsonify(tarefa_dict)

@app.route('/api/tarefas/<string:tarefa_id>', methods=['DELETE'])
def delete_tarefa(tarefa_id):
    conn = db.get_db_connection()
    tarefa = conn.execute('SELECT * FROM tarefa WHERE id = ?', (tarefa_id,)).fetchone()
    if tarefa is None:
        conn.close()
        return jsonify({'error': 'Tarefa não encontrada'}), 404

    conn.execute('DELETE FROM tarefa WHERE id = ?', (tarefa_id,))
    conn.commit()
    conn.close()

    return '', 204


# --- API para Planos de Aula ---

def _get_lesson_plan_details(conn, plan_id):
    """Helper function to fetch a full lesson plan with its relations."""
    plan_row = conn.execute('SELECT * FROM plano_de_aula WHERE id = ?', (plan_id,)).fetchone()
    if not plan_row:
        return None

    plan = dict(plan_row)

    # Get associated classes
    class_ids_rows = conn.execute('SELECT id_turma FROM plano_aula_turma WHERE id_plano_aula = ?', (plan_id,)).fetchall()
    plan['classIds'] = [row['id_turma'] for row in class_ids_rows]

    # Get associated materials
    material_ids_rows = conn.execute('SELECT id_material FROM plano_aula_material WHERE id_plano_aula = ?', (plan_id,)).fetchall()
    plan['materialIds'] = [row['id_material'] for row in material_ids_rows]

    # Get associated evaluations
    evaluation_ids_rows = conn.execute('SELECT id_avaliacao FROM plano_aula_avaliacao WHERE id_plano_aula = ?', (plan_id,)).fetchall()
    plan['evaluationIds'] = [row['id_avaliacao'] for row in evaluation_ids_rows]

    return plan

@app.route('/api/planos_de_aula', methods=['GET'])
def get_planos_de_aula():
    conn = db.get_db_connection()
    planos_rows = conn.execute('SELECT * FROM plano_de_aula ORDER BY date DESC').fetchall()

    # For the list view, we might not need all details, but for simplicity, we'll fetch them.
    # In a real-world scenario with performance concerns, this could be optimized.
    planos = [_get_lesson_plan_details(conn, row['id']) for row in planos_rows]
    conn.close()

    return jsonify(planos)

@app.route('/api/planos_de_aula/<string:plan_id>', methods=['GET'])
def get_plano_de_aula(plan_id):
    conn = db.get_db_connection()
    plan = _get_lesson_plan_details(conn, plan_id)
    conn.close()

    if plan is None:
        return jsonify({'error': 'Plano de aula não encontrado'}), 404
    return jsonify(plan)

@app.route('/api/planos_de_aula', methods=['POST'])
def create_plano_de_aula():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'O campo "title" é obrigatório.'}), 400

    conn = db.get_db_connection()
    cursor = conn.cursor()

    new_id = f"lp_{uuid.uuid4().hex}"
    now_iso = date.today().isoformat()

    try:
        cursor.execute('BEGIN')

        # Insert into main table
        cursor.execute(
            'INSERT INTO plano_de_aula (id, title, date, objectives, methodology, resources, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (new_id, data['title'], data.get('date'), data.get('objectives'), data.get('methodology'), data.get('resources'), now_iso)
        )

        # Insert into join tables
        if data.get('classIds'):
            cursor.executemany('INSERT INTO plano_aula_turma (id_plano_aula, id_turma) VALUES (?, ?)', [(new_id, class_id) for class_id in data['classIds']])
        if data.get('materialIds'):
            cursor.executemany('INSERT INTO plano_aula_material (id_plano_aula, id_material) VALUES (?, ?)', [(new_id, material_id) for material_id in data['materialIds']])
        if data.get('evaluationIds'):
            cursor.executemany('INSERT INTO plano_aula_avaliacao (id_plano_aula, id_avaliacao) VALUES (?, ?)', [(new_id, eval_id) for eval_id in data['evaluationIds']])

        cursor.execute('COMMIT')
    except Exception as e:
        cursor.execute('ROLLBACK')
        conn.close()
        return jsonify({'error': f'Erro ao criar plano de aula: {e}'}), 500

    # Fetch the complete new plan to return
    new_plan = _get_lesson_plan_details(conn, new_id)
    conn.close()

    return jsonify(new_plan), 201

@app.route('/api/planos_de_aula/<string:plan_id>', methods=['PUT'])
def update_plano_de_aula(plan_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('BEGIN')

        # Update main table
        cursor.execute(
            'UPDATE plano_de_aula SET title = ?, date = ?, objectives = ?, methodology = ?, resources = ? WHERE id = ?',
            (data.get('title'), data.get('date'), data.get('objectives'), data.get('methodology'), data.get('resources'), plan_id)
        )

        # Update join tables by deleting old and inserting new
        cursor.execute('DELETE FROM plano_aula_turma WHERE id_plano_aula = ?', (plan_id,))
        if data.get('classIds'):
            cursor.executemany('INSERT INTO plano_aula_turma (id_plano_aula, id_turma) VALUES (?, ?)', [(plan_id, class_id) for class_id in data['classIds']])

        cursor.execute('DELETE FROM plano_aula_material WHERE id_plano_aula = ?', (plan_id,))
        if data.get('materialIds'):
            cursor.executemany('INSERT INTO plano_aula_material (id_plano_aula, id_material) VALUES (?, ?)', [(plan_id, material_id) for material_id in data['materialIds']])

        cursor.execute('DELETE FROM plano_aula_avaliacao WHERE id_plano_aula = ?', (plan_id,))
        if data.get('evaluationIds'):
            cursor.executemany('INSERT INTO plano_aula_avaliacao (id_plano_aula, id_avaliacao) VALUES (?, ?)', [(plan_id, eval_id) for eval_id in data['evaluationIds']])

        cursor.execute('COMMIT')
    except Exception as e:
        cursor.execute('ROLLBACK')
        conn.close()
        return jsonify({'error': f'Erro ao atualizar plano de aula: {e}'}), 500

    # Fetch the complete updated plan to return
    updated_plan = _get_lesson_plan_details(conn, plan_id)
    conn.close()

    return jsonify(updated_plan)

@app.route('/api/planos_de_aula/<string:plan_id>', methods=['DELETE'])
def delete_plano_de_aula(plan_id):
    conn = db.get_db_connection()
    # ON DELETE CASCADE will handle join table deletions
    conn.execute('DELETE FROM plano_de_aula WHERE id = ?', (plan_id,))
    conn.commit()
    conn.close()
    return '', 204


# --- API para Banco de Questões ---

def _format_question_response(question_row):
    """Helper to convert question row to a proper JSON response."""
    if not question_row:
        return None
    question_dict = dict(question_row)
    # Deserialize the options from JSON string to a list
    if question_dict.get('options'):
        question_dict['options'] = json.loads(question_dict['options'])
    else:
        question_dict['options'] = []
    return question_dict

@app.route('/api/perguntas', methods=['GET'])
def get_perguntas():
    subject = request.args.get('subject')
    difficulty = request.args.get('difficulty')

    conn = db.get_db_connection()
    query = 'SELECT * FROM pergunta'
    filters = []
    params = []

    if subject:
        filters.append('subject LIKE ?')
        params.append(f'%{subject}%')
    if difficulty:
        filters.append('difficulty = ?')
        params.append(difficulty)

    if filters:
        query += ' WHERE ' + ' AND '.join(filters)

    perguntas_rows = conn.execute(query, params).fetchall()
    conn.close()

    perguntas = [_format_question_response(row) for row in perguntas_rows]
    return jsonify(perguntas)

@app.route('/api/perguntas/subjects', methods=['GET'])
def get_question_subjects():
    conn = db.get_db_connection()
    subjects_rows = conn.execute('SELECT DISTINCT subject FROM pergunta WHERE subject IS NOT NULL AND subject != ""').fetchall()
    conn.close()
    subjects = [row['subject'] for row in subjects_rows]
    return jsonify(subjects)

@app.route('/api/perguntas', methods=['POST'])
def create_pergunta():
    data = request.get_json()
    if not data or not data.get('text') or not data.get('answer'):
        return jsonify({'error': 'Campos "text" e "answer" são obrigatórios.'}), 400

    new_id = f"q_{uuid.uuid4().hex}"
    options_json = json.dumps(data.get('options', []))

    conn = db.get_db_connection()
    conn.execute(
        'INSERT INTO pergunta (id, text, subject, difficulty, options, answer) VALUES (?, ?, ?, ?, ?, ?)',
        (new_id, data['text'], data.get('subject'), data.get('difficulty'), options_json, data['answer'])
    )
    conn.commit()
    new_pergunta = conn.execute('SELECT * FROM pergunta WHERE id = ?', (new_id,)).fetchone()
    conn.close()

    return jsonify(_format_question_response(new_pergunta)), 201

@app.route('/api/perguntas/<string:pergunta_id>', methods=['GET'])
def get_pergunta(pergunta_id):
    conn = db.get_db_connection()
    pergunta = conn.execute('SELECT * FROM pergunta WHERE id = ?', (pergunta_id,)).fetchone()
    conn.close()
    if pergunta is None:
        return jsonify({'error': 'Pergunta não encontrada'}), 404
    return jsonify(_format_question_response(pergunta))

@app.route('/api/perguntas/<string:pergunta_id>', methods=['PUT'])
def update_pergunta(pergunta_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = db.get_db_connection()
    pergunta = conn.execute('SELECT * FROM pergunta WHERE id = ?', (pergunta_id,)).fetchone()
    if pergunta is None:
        conn.close()
        return jsonify({'error': 'Pergunta não encontrada'}), 404

    text = data.get('text', pergunta['text'])
    subject = data.get('subject', pergunta['subject'])
    difficulty = data.get('difficulty', pergunta['difficulty'])
    answer = data.get('answer', pergunta['answer'])
    # Handle options update properly
    if 'options' in data:
        options_json = json.dumps(data['options'])
    else:
        options_json = pergunta['options']


    conn.execute(
        'UPDATE pergunta SET text = ?, subject = ?, difficulty = ?, options = ?, answer = ? WHERE id = ?',
        (text, subject, difficulty, options_json, answer, pergunta_id)
    )
    conn.commit()
    updated_pergunta = conn.execute('SELECT * FROM pergunta WHERE id = ?', (pergunta_id,)).fetchone()
    conn.close()

    return jsonify(_format_question_response(updated_pergunta))

@app.route('/api/perguntas/<string:pergunta_id>', methods=['DELETE'])
def delete_pergunta(pergunta_id):
    conn = db.get_db_connection()
    # Add check if question is used in any quiz results in the future if that gets implemented
    conn.execute('DELETE FROM pergunta WHERE id = ?', (pergunta_id,))
    conn.commit()
    conn.close()
    return '', 204


# --- API para Configurações ---

@app.route('/api/configuracoes', methods=['GET'])
def get_configuracoes():
    conn = db.get_db_connection()
    # There should only ever be one row for settings
    settings_row = conn.execute('SELECT value FROM configuracoes WHERE key = ?', ('user_settings',)).fetchone()
    conn.close()

    if settings_row:
        # Return saved settings
        return jsonify(json.loads(settings_row['value']))
    else:
        # Return default settings if none are saved
        return jsonify({
            'theme': 'light',
            'notifications': {
                'enabled': True,
                'reminders': [10, 30]
            },
            'language': 'pt-BR'
        })

@app.route('/api/configuracoes', methods=['POST'])
def save_configuracoes():
    settings_data = request.get_json()
    if not settings_data:
        return jsonify({'error': 'Dados de configurações inválidos.'}), 400

    settings_json = json.dumps(settings_data)

    conn = db.get_db_connection()
    # Use INSERT OR REPLACE to handle both creation and update
    conn.execute(
        'INSERT OR REPLACE INTO configuracoes (key, value) VALUES (?, ?)',
        ('user_settings', settings_json)
    )
    conn.commit()
    conn.close()

    return jsonify(settings_data)


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

if __name__ == '__main__':
    # Garante que o banco de dados e a tabela 'materials' existam ao iniciar
    db.init_db()

    PORT = 8000
    print(f"Servidor Flask rodando em http://127.0.0.1:{PORT}", file=sys.stdout)
    app.run(port=PORT)
