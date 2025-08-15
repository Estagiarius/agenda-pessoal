# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal com uma arquitetura híbrida. O **frontend** é uma Single Page Application (SPA) construída com HTML, CSS e JavaScript/jQuery. O **backend** é um servidor leve em Python, utilizando o framework Flask, que serve os arquivos estáticos e fornece APIs para funcionalidades como upload de arquivos e chat com IA.

Originalmente, a maior parte dos dados era armazenada no `localStorage` do navegador. O objetivo atual é migrar toda a persistência de dados para o backend, para permitir o acesso a partir de múltiplos dispositivos.

## Estrutura do Código

O código está organizado da seguinte forma:

*   `index.html`: O ponto de entrada principal da aplicação.
*   `css/`: Contém os arquivos de estilo (CSS).
*   `js/`: Contém os arquivos de lógica da aplicação (JavaScript).
    *   `js/app/`: Contém os módulos principais da aplicação, como `calendar.js`, `chat.js`, `eventService.js`, etc.
    *   `js/libs/`: Contém bibliotecas de terceiros, como jQuery e Bootstrap.
*   `views/`: Contém os templates HTML para as diferentes seções da aplicação (por exemplo, `home.html`, `tasks.html`, `quiz_take.html`).
*   `tests/`: Contém os testes unitários.

## Como Executar a Aplicação

1.  **Instale as dependências do backend:**

    O servidor Python possui dependências que precisam ser instaladas. Recomenda-se o uso de um ambiente virtual.

    ```bash
    pip install -r requirements.txt
    ```
    *(Nota: Se o arquivo `requirements.txt` não existir, você pode criá-lo a partir das dependências `flask` e `openai`)*

2.  **Execute o servidor:**

    ```bash
    python launch.py
    ```

Isso iniciará um servidor local (geralmente em `http://127.0.0.1:8000`) que você pode abrir em seu navegador.

## Como Executar os Testes

Os testes unitários podem ser executados abrindo o arquivo `tests/test-runner.html` em um navegador.

## Fluxo de Trabalho de Desenvolvimento

1.  **Modificar o código-fonte:** Faça as alterações necessárias nos arquivos HTML, CSS ou JavaScript.
2.  **Testar as alterações:**
    *   Para alterações na lógica de negócios (por exemplo, `eventService.js`, `questionService.js`), adicione ou atualize os testes unitários em `tests/` e execute-os abrindo `tests/test-runner.html`.
    *   Para alterações na interface do usuário, abra o `index.html` (usando `launch.py`) e verifique visualmente as mudanças.
3.  **Processo de Build:** Não há um processo de build para o frontend (transpilação, etc.). No entanto, lembre-se de que o backend em Python pode precisar de reinicialização para que as alterações nos endpoints da API entrem em vigor.

## Preferências de Estilo de Código

*   **Python:** Siga as convenções da PEP 8.
*   **JavaScript:** Siga as convenções de estilo do JavaScript moderno (ES6+), mesmo que o código existente possa usar estilos mais antigos.
*   **HTML/CSS:** Mantenha o código limpo e bem formatado. Utilize as classes do Bootstrap sempre que possível para manter a consistência visual.

## Pontos Importantes

*   **Persistência de Dados Híbrida (Em Transição):** Atualmente, a aplicação usa um modelo híbrido. Novas funcionalidades como upload de materiais usam o backend, enquanto a lógica legada (eventos, tarefas, dados acadêmicos) ainda usa o `localStorage`. **O objetivo principal do desenvolvimento atual é migrar toda a persistência de dados do `localStorage` para o backend Flask.**
*   **Backend API:** A lógica do servidor está em `launch.py`. Ao adicionar novas funcionalidades de persistência, crie endpoints de API RESTful neste arquivo.
*   **Dependências Frontend:** As dependências de JavaScript (como jQuery) estão incluídas diretamente no repositório. Não há um gerenciador de pacotes como npm ou yarn.
*   **Dependências Backend:** As dependências Python estão listadas em `requirements.txt`.
