import os
from flask import Flask, request, Response, send_from_directory
from openai import OpenAI
import sys
import json

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
    print ("Chave auxiliar para testes ligada")
    client = OpenAI(
            api_key=os.environ["67e08ad30b29100f6a970af4_3e32b6ce0a4290bc"],
            base_url="https://chat.maritaca.ai/api",
        )

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

if __name__ == '__main__':
    PORT = 8000
    print(f"Servidor Flask rodando em http://127.0.0.1:{PORT}", file=sys.stdout)
    app.run(port=PORT)
