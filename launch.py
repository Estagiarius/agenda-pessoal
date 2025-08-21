import os
from flask import Flask, request, Response, send_from_directory, jsonify
from openai import OpenAI
import sys
import json
import uuid
import database as db

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
