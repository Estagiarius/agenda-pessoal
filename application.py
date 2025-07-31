import os
from flask import Flask, request, Response, send_from_directory
from openai import OpenAI
import sys
import json
import boto3
from botocore.exceptions import NoCredentialsError

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
