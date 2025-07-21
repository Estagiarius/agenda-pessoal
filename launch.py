import os
import webbrowser
from flask import Flask, request, jsonify, send_from_directory
import requests
import os
import sys

# Configuração do Flask
app = Flask(__name__, static_folder='.', static_url_path='')

# Configuração da API da Maritaca
API_KEY = os.environ.get("MARITACA_API_KEY")
if not API_KEY:
    print("ERRO CRÍTICO: A variável de ambiente MARITACA_API_KEY não foi definida.", file=sys.stderr)
    raise ValueError("A variável de ambiente MARITACA_API_KEY não foi definida.")

API_URL = "https://chat.maritaca.ai/api/chat/inference"
DEFAULT_MODEL = "sabia-3.1"

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print(f"INFO: Requisição recebida: {data}", file=sys.stdout)
    message = data.get('message')
    model = data.get('model', DEFAULT_MODEL)

    if not message:
        print("ERRO: Nenhuma mensagem fornecida na requisição.", file=sys.stderr)
        return jsonify({'error': 'Nenhuma mensagem fornecida'}), 400

    headers = {
        "authorization": f"Key {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": message}
        ],
        "do_sample": True,
        "max_tokens": 2048,
        "temperature": 0.7,
        "top_p": 0.95
    }

    try:
        print(f"INFO: Enviando para Maritaca: {payload}", file=sys.stdout)
        response = requests.post(API_URL, json=payload, headers=headers, timeout=120)
        print(f"INFO: Resposta da Maritaca (status): {response.status_code}", file=sys.stdout)
        response.raise_for_status()

        full_response = response.json()
        reply = full_response.get("answer", "Não foi possível obter uma resposta.")

        return jsonify({'reply': reply})

    except requests.exceptions.Timeout:
        print("ERRO: Timeout ao conectar com a API da Maritaca.", file=sys.stderr)
        return jsonify({'reply': "O servidor de IA demorou muito para responder. Por favor, tente novamente mais tarde."}), 504
    except requests.exceptions.RequestException as e:
        print(f"ERRO: Erro na requisição para a API da Maritaca: {e}", file=sys.stderr)
        return jsonify({'reply': "Ocorreu um erro de comunicação com o servidor de IA."}), 502
    except Exception as e:
        print(f"ERRO: Ocorreu um erro inesperado no servidor: {e}", file=sys.stderr)
        return jsonify({'reply': "Ocorreu um erro inesperado no servidor."}), 500

def open_browser():
    webbrowser.open_new("http://127.0.0.1:8000")

if __name__ == '__main__':
    PORT = 8000

    print(f"Servidor Flask iniciando na porta {PORT}", file=sys.stdout)

    app.run(port=PORT)
