# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal com um backend em Python (Flask). A aplicação utiliza um banco de dados PostgreSQL (preparado para Amazon RDS) para persistência de dados e o Amazon S3 para armazenamento de arquivos. Todo o armazenamento de dados do aplicativo agora é persistido no banco de dados.

## Estrutura do Código

*   `application.py`: O servidor backend Flask, contendo a lógica da API e os modelos de banco de dados (SQLAlchemy).
*   `requirements.txt`: Dependências do Python, incluindo Flask, SQLAlchemy, boto3, Flask-Migrate, etc.
*   `migrations/`: Diretório de migração do banco de dados (Flask-Migrate).
*   `Procfile`: Comando para iniciar o servidor web Gunicorn.
*   `.ebextensions/`: Arquivos de configuração do AWS Elastic Beanstalk.
*   `index.html`: O ponto de entrada principal da aplicação.
*   `js/app/`: Contém os serviços de frontend que interagem com a API do backend.

## Como Executar a Aplicação

1.  **Instalar dependências:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Configurar Variáveis de Ambiente:** (veja a seção abaixo)
3.  **Executar Migrações do Banco de Dados:**
    Para criar ou atualizar o esquema do banco de dados, use os comandos do Flask-Migrate.
    ```bash
    # Na primeira vez:
    flask db upgrade
    ```
4.  **Executar o Servidor:**
    ```bash
    python application.py
    ```

## Configuração do Ambiente

A aplicação requer as seguintes variáveis de ambiente:

*   **API da Maritaca:**
    *   `MARITACA_API_KEY`: Chave de API para o serviço de chat.
*   **Amazon S3:**
    *   `S3_BUCKET_NAME`: Nome do bucket S3.
    *   `AWS_ACCESS_KEY_ID`: Chave de acesso da AWS.
    *   `AWS_SECRET_ACCESS_KEY`: Chave de acesso secreta da AWS.
*   **Banco de Dados (PostgreSQL/RDS):**
    *   `DB_USERNAME`: Nome de usuário do banco de dados.
    *   `DB_PASSWORD`: Senha do banco de dados.
    *   `DB_HOST`: Host do banco de dados.
    *   `DB_PORT`: Porta do banco de dados (padrão: 5432).
    *   `DB_NAME`: Nome do banco de dados.

## Pontos Importantes

*   **Persistência de Dados:** Todos os dados da aplicação (Tarefas, Planos de Aula, Disciplinas, Turmas, Alunos, Avaliações, Notas) são armazenados em um banco de dados PostgreSQL. O Amazon S3 é usado para o upload de arquivos.
*   **Migrações de Banco de Dados:** As alterações no esquema do banco de dados são gerenciadas pelo Flask-Migrate. Para criar uma nova migração, use `flask db migrate -m "Mensagem"`. Para aplicar, use `flask db upgrade`.
*   **API Endpoints:**
    *   `/api/tasks`: CRUD para tarefas.
    *   `/api/lesson-plans`: CRUD para planos de aula.
    *   `/api/subjects`: CRUD para disciplinas.
    *   `/api/classes`: CRUD para turmas.
    *   `/api/students`: CRUD para alunos.
    *   `/api/classes/<id>/students`: Endpoints para matricular/desmatricular alunos.
    *   `/api/evaluations`: CRUD para avaliações.
    *   `/api/evaluations/<id>/grades`: Endpoints para notas.
    *   `/api/materials`: Lista os metadados dos materiais do S3.
    *   `/upload`: Endpoint para fazer upload de novos materiais para o S3.
    *   `/api/chat`: Endpoint para o serviço de chat.
*   **Frontend:** O frontend foi totalmente refatorado para usar a API do backend.
