# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica com backend em Python, pronta para implantação na AWS.

## Visão Geral

Este projeto é uma Single Page Application (SPA) para gerenciamento de tarefas, eventos e atividades acadêmicas, com um backend em Flask (Python) que oferece uma API para upload de arquivos e um serviço de chat com IA.

## Principais Funcionalidades

- **Agenda e Calendário:** Gerenciamento de eventos e tarefas.
- **Recursos Didáticos:** Crie um banco de questões e gere quizzes.
- **Upload de Materiais:** Faça upload de arquivos que são armazenados de forma segura no Amazon S3.
- **Chat com IA:** Converse com uma IA para obter ajuda e informações.

## Começando

### Pré-requisitos

- Python 3.6+
- Pip (gerenciador de pacotes do Python)

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
    A aplicação requer algumas variáveis de ambiente para funcionar. Você pode criar um arquivo `.env` e usar uma biblioteca como `python-dotenv` para carregá-las, ou defini-las diretamente no seu shell:
    ```bash
    export MARITACA_API_KEY='sua_chave_aqui'
    export S3_BUCKET_NAME='seu_bucket_aqui'
    export AWS_ACCESS_KEY_ID='sua_chave_de_acesso_aqui'
    export AWS_SECRET_ACCESS_KEY='sua_chave_secreta_aqui'
    ```

4.  **Execute o servidor:**
    ```bash
    python application.py
    ```
    A aplicação estará disponível em `http://127.0.0.1:8000`.

### Para Executar os Testes de Frontend

Abra o arquivo `tests/test-runner.html` em um navegador para rodar os testes unitários do frontend.

## Implantação na AWS

A aplicação está configurada para ser implantada no **AWS Elastic Beanstalk**. Os seguintes arquivos foram adicionados para facilitar a implantação:
- `Procfile`: Define o comando para o servidor web.
- `.ebextensions/`: Contém configurações específicas da plataforma.
- `requirements.txt`: Lista as dependências do Python.

Para implantar, configure as variáveis de ambiente mencionadas acima no painel de configuração do seu ambiente Elastic Beanstalk.

## Estrutura do Projeto

```
/
├── .ebextensions/    # Configurações do Elastic Beanstalk
├── css/              # Estilos
├── js/
│   ├── app/          # Módulos da aplicação (lógica principal)
│   └── lib/          # Bibliotecas de terceiros
├── tests/            # Testes unitários do frontend
├── views/            # Templates HTML das seções
├── application.py    # Servidor Flask
├── requirements.txt  # Dependências do Python
├── Procfile          # Comando de inicialização
└── index.html        # Ponto de entrada da aplicação
```
