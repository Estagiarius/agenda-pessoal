# Assistente Pedagógico de IA

Bem-vindo ao Assistente Pedagógico de IA! Esta é uma aplicação de desktop desenvolvida em Python que serve como um assistente pessoal para professores, utilizando modelos de linguagem da Maritaca AI (e outros) para automatizar tarefas e fornecer insights.

## Funcionalidades (Versão Atual)

*   **Chat Inteligente:** Converse com um assistente de IA que pode responder perguntas gerais.
*   **Agente com Ferramentas:** O assistente pode usar ferramentas para acessar informações externas:
    *   **Consulta a Banco de Dados:** Responde a perguntas sobre dados de alunos e notas armazenados em um banco de dados local (SQLite).
    *   **Pesquisa na Web:** Busca informações em tempo real de qualquer URL.
*   **Interface Gráfica Moderna:** Construído com CustomTkinter para uma experiência de usuário agradável.

## Configuração do Ambiente

Siga os passos abaixo para configurar e executar a aplicação.

### 1. Pré-requisitos

*   Python 3.8 ou superior.
*   `pip` para gerenciamento de pacotes.

### 2. Instalação

Clone o repositório e navegue até a pasta da aplicação:

```bash
cd teacher_assistant_app
```

Crie um ambiente virtual para isolar as dependências do projeto:

```bash
python3 -m venv venv
source venv/bin/activate  # No Windows, use `venv\\Scripts\\activate`
```

Instale as bibliotecas necessárias a partir do `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3. Configuração da API

A aplicação precisa de chaves de API para se conectar aos modelos de linguagem.

1.  Renomeie o arquivo `.env.example` para `.env`:
    ```bash
    mv .env.example .env
    ```
2.  Abra o arquivo `.env` e adicione sua chave de API da Maritaca AI na variável `MARITACA_API_KEY`. Você também pode configurar outras APIs, se desejar.

## Como Executar a Aplicação

Com o ambiente configurado, você pode iniciar a aplicação com o seguinte comando a partir do diretório `teacher_assistant_app`:

```bash
python3 main.py
```

Isso abrirá a janela do chat, e você poderá começar a interagir com o assistente.

## Estrutura do Projeto

```
teacher_assistant_app/
├── data/
│   └── school.db         # Banco de dados SQLite com dados dos alunos.
├── src/
│   ├── core/
│   │   └── ai_core.py      # Núcleo da IA, gerencia o LLM e o uso de ferramentas.
│   ├── gui/
│   │   └── chat_view.py    # A interface gráfica do chat.
│   └── tools/
│       ├── database_tool.py # Ferramenta para consultar o banco de dados.
│       └── web_search_tool.py  # Ferramenta para buscar na web.
├── .env.example          # Template para as chaves de API.
├── main.py               # Ponto de entrada da aplicação.
├── requirements.txt      # Lista de dependências Python.
└── setup_db.py           # Script para criar o banco de dados inicial.
```

## Como Adicionar Novas Ferramentas

Para expandir as capacidades do agente, siga estes passos:

1.  **Crie a Função da Ferramenta:** Crie um novo arquivo Python em `src/tools/` (ex: `calendar_tool.py`). Dentro dele, defina uma função que executa a lógica desejada (ex: `create_calendar_event(summary, date)`).
2.  **Defina o Esquema da Ferramenta:** Em `src/core/ai_core.py`, importe sua nova função. Em seguida, adicione um novo dicionário à lista `self.tools`, descrevendo o nome da função, sua finalidade e seus parâmetros em formato JSON Schema.
3.  **Mapeie a Função:** Adicione sua nova função ao dicionário `self.available_functions` no `ai_core.py`, mapeando o nome da função (string) para o objeto da função.

O `AICore` se encarregará do resto, permitindo que o modelo de linguagem chame sua nova ferramenta quando for apropriado.
