# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica com backend em Python, utilizando PostgreSQL para persistência de dados e Amazon S3 para armazenamento de arquivos. A aplicação está pronta para implantação na AWS.

## Visão Geral

Este projeto é uma Single Page Application (SPA) para gerenciamento de tarefas, eventos e planos de aula, com um backend em Flask (Python) que oferece uma API para persistir dados e um serviço de chat com IA.

## Principais Funcionalidades

- **Gerenciamento de Tarefas:** Crie, atualize e exclua tarefas com persistência no banco de dados.
- **Planos de Aula:** Elabore e gerencie planos de aula.
- **Upload de Materiais:** Faça upload de arquivos que são armazenados de forma segura no Amazon S3.
- **Chat com IA:** Converse com uma IA para obter ajuda e informações.

## Começando

### Pré-requisitos

- Python 3.6+
- Pip (gerenciador de pacotes do Python)
- Um banco de dados PostgreSQL

### Para Executar a Aplicação Localmente

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-repositorio>
    ```

2.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure as variáveis de ambiente:**
    A aplicação requer variáveis de ambiente para se conectar aos serviços de nuvem e ao banco de dados.
    ```bash
    # Para o Chat
    export MARITACA_API_KEY='sua_chave_aqui'

    # Para o Amazon S3
    export S3_BUCKET_NAME='seu_bucket_aqui'
    export AWS_ACCESS_KEY_ID='sua_chave_de_acesso_aqui'
    export AWS_SECRET_ACCESS_KEY='sua_chave_secreta_aqui'

    # Para o Banco de Dados PostgreSQL
    export DB_USERNAME='seu_usuario_aqui'
    export DB_PASSWORD='sua_senha_aqui'
    export DB_HOST='localhost' # ou o host do seu banco de dados
    export DB_PORT='5432'
    export DB_NAME='seu_banco_de_dados_aqui'
    ```

4.  **Inicialize o Banco de Dados:**
    Antes de executar a aplicação pela primeira vez, crie as tabelas no banco de dados.
    ```bash
    # Certifique-se de que o Flask pode encontrar a aplicação
    export FLASK_APP=application.py

    flask init-db
    ```

5.  **Execute o servidor:**
    ```bash
    python application.py
    ```
    A aplicação estará disponível em `http://127.0.0.1:8000`.

## Implantação na AWS

A aplicação está configurada para ser implantada no **AWS Elastic Beanstalk** com um banco de dados **Amazon RDS (PostgreSQL)**.

Para implantar, configure todas as variáveis de ambiente mencionadas acima no painel de configuração do seu ambiente Elastic Beanstalk. Você também precisará configurar o seu ambiente para executar as migrações do banco de dados (por exemplo, usando `container_commands` no `.ebextensions`).
