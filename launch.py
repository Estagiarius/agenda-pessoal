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
