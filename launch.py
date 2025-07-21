import os
from flask import Flask, request, Response, send_from_directory
from openai import OpenAI
import sys
import json

# Configuração do Flask
app = Flask(__name__, static_folder='.', static_url_path='')

# Configuração do Cliente OpenAI para a API da Maritaca
try:
    client = OpenAI(
        api_key=os.environ.get("MARITACA_API_KEY"),
        base_url="https://chat.maritaca.ai/api",
    )
except Exception as e:
    print(f"ERRO CRÍTICO: Falha ao inicializar o cliente da API: {e}", file=sys.stderr)
    sys.exit(1)

DEFAULT_MODEL = "sabia-3.1"

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
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
