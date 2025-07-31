# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal com um backend em Python (Flask). A aplicação foi preparada para ser implantada na AWS.

A aplicação inclui as seguintes funcionalidades:

*   **Agenda/Calendário:** Para gerenciar eventos e tarefas (frontend).
*   **Banco de Questões e Quizzes:** Funcionalidades de frontend para aprendizado.
*   **Upload de Materiais:** Os usuários podem fazer upload de arquivos, que são armazenados no Amazon S3.
*   **Chat com IA:** Uma interface de chat que se conecta à API da Maritaca.

## Estrutura do Código

O código está organizado da seguinte forma:

*   `application.py`: O servidor backend Flask.
*   `requirements.txt`: Dependências do Python.
*   `Procfile`: Comando para iniciar o servidor web Gunicorn.
*   `.ebextensions/`: Arquivos de configuração do AWS Elastic Beanstalk.
*   `.gitignore`: Arquivos e diretórios ignorados pelo Git.
*   `index.html`: O ponto de entrada principal da aplicação.
*   `css/`: Arquivos de estilo (CSS).
*   `js/`: Lógica do frontend (JavaScript).
*   `views/`: Templates HTML para as diferentes seções.
*   `tests/`: Testes unitários para o frontend.

## Como Executar a Aplicação

Para executar a aplicação localmente, você precisará ter o Python e as dependências instaladas:

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar o servidor Flask (para desenvolvimento)
# Nota: Para produção, use o comando do Procfile.
python application.py
```

## Configuração do Ambiente

A aplicação requer as seguintes variáveis de ambiente para funcionar corretamente:

*   `MARITACA_API_KEY`: A chave de API para o serviço de chat da Maritaca.
*   `S3_BUCKET_NAME`: O nome do bucket Amazon S3 para armazenamento de arquivos.
*   `AWS_ACCESS_KEY_ID`: Chave de acesso da AWS.
*   `AWS_SECRET_ACCESS_KEY`: Chave de acesso secreta da AWS.
*   `AWS_REGION`: A região da AWS onde o bucket S3 está localizado (opcional, mas recomendado).

## Fluxo de Trabalho de Desenvolvimento

1.  **Modificar o código:** Faça as alterações no backend (Python/Flask) ou no frontend (HTML/CSS/JS).
2.  **Testar as alterações:**
    *   Para o backend, considere adicionar testes unitários (atualmente não há nenhum).
    *   Para o frontend, execute os testes em `tests/test-runner.html`.
3.  **Implantação:** A aplicação está configurada para implantação no AWS Elastic Beanstalk. O deploy é feito através do CLI da AWS ou do console.

## Pontos Importantes

*   **Persistência de Dados:**
    *   Dados da aplicação (tarefas, eventos) são armazenados no `localStorage` do navegador.
    *   Arquivos enviados por upload são armazenados no Amazon S3. Os metadados desses arquivos (`materials.json`) também são armazenados no S3.
*   **Roteamento:** O roteamento principal é feito no lado do cliente (`js/app/router.js`). O backend Flask serve a página principal e fornece endpoints de API (`/upload`, `/api/materials`, `/api/chat`).
*   **Dependências:**
    *   As dependências do Python são gerenciadas pelo `pip` e listadas em `requirements.txt`.
    *   As dependências do frontend estão no repositório.
