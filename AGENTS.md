# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal com um backend em Python (Flask). A aplicação utiliza um banco de dados PostgreSQL (preparado para Amazon RDS) para persistência de dados e o Amazon S3 para armazenamento de arquivos.

A aplicação inclui as seguintes funcionalidades:

*   **Agenda/Calendário e Planos de Aula:** Gerenciamento de tarefas e planos de aula com persistência no banco de dados.
*   **Upload de Materiais:** Os usuários podem fazer upload de arquivos, que são armazenados no Amazon S3.
*   **Chat com IA:** Uma interface de chat que se conecta à API da Maritaca.

## Estrutura do Código

*   `application.py`: O servidor backend Flask, contendo a lógica da API e os modelos de banco de dados (SQLAlchemy).
*   `requirements.txt`: Dependências do Python, incluindo Flask, SQLAlchemy, boto3, etc.
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
3.  **Inicializar o Banco de Dados:**
    Na primeira vez, crie as tabelas no banco de dados.
    ```bash
    flask init-db
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

*   **Persistência de Dados:**
    *   **Banco de Dados:** Tarefas e Planos de Aula são armazenados em um banco de dados PostgreSQL.
    *   **Amazon S3:** Arquivos enviados por upload e seus metadados (`materials.json`) são armazenados no S3.
*   **API Endpoints:**
    *   `/api/tasks`: CRUD para tarefas.
    *   `/api/lesson-plans`: CRUD para planos de aula.
    *   `/api/materials`: Lista os metadados dos materiais do S3.
    *   `/upload`: Endpoint para fazer upload de novos materiais para o S3.
    *   `/api/chat`: Endpoint para o serviço de chat.
*   **Frontend:** O frontend (em `js/app/`) foi refatorado para usar a API do backend em vez do `localStorage`.
