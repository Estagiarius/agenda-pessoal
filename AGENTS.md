# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal que roda inteiramente no navegador. Ele não possui um backend, e todos os dados são armazenados localmente no navegador do usuário (localStorage).

A aplicação inclui as seguintes funcionalidades:

*   **Agenda/Calendário:** Para gerenciar eventos e tarefas.
*   **Banco de Questões:** Para criar, armazenar e filtrar questões de múltipla escolha.
*   **Sistema de Quiz:** Para gerar e realizar quizzes a partir das questões do banco.

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

Para executar a aplicação, utilize o script `launch.py`:

```bash
python launch.py
```

Isso abrirá o `index.html` no navegador padrão.

## Como Executar os Testes

Os testes unitários podem ser executados abrindo o arquivo `tests/test-runner.html` em um navegador.

## Fluxo de Trabalho de Desenvolvimento

1.  **Modificar o código-fonte:** Faça as alterações necessárias nos arquivos HTML, CSS ou JavaScript.
2.  **Testar as alterações:**
    *   Para alterações na lógica de negócios (por exemplo, `eventService.js`, `questionService.js`), adicione ou atualize os testes unitários em `tests/` e execute-os abrindo `tests/test-runner.html`.
    *   Para alterações na interface do usuário, abra o `index.html` (usando `launch.py`) e verifique visualmente as mudanças.
3.  **Não há processo de build:** Como a aplicação é puramente front-end, não há necessidade de compilar ou construir nada. As alterações são refletidas simplesmente ao recarregar a página no navegador.

## Preferências de Estilo de Código

*   **JavaScript:** Siga as convenções de estilo do JavaScript moderno (ES6+), mesmo que o código existente possa usar estilos mais antigos.
*   **HTML/CSS:** Mantenha o código limpo e bem formatado. Utilize as classes do Bootstrap sempre que possível para manter a consistência visual.

## Pontos Importantes

*   **Persistência de Dados:** Todos os dados são armazenados no `localStorage` do navegador. Isso significa que os dados são persistentes entre as sessões, mas são específicos para cada navegador e máquina. Não há banco de dados no servidor.
*   **Roteamento:** O roteamento é feito no lado do cliente usando JavaScript para carregar diferentes `views/*.html` no `index.html`. A lógica de roteamento está em `js/app/router.js`.
*   **Dependências:** As dependências de JavaScript (como jQuery) estão incluídas diretamente no repositório. Não há um gerenciador de pacotes como npm ou yarn. Para adicionar uma nova dependência, adicione o arquivo da biblioteca em `js/libs/` e inclua-o no `index.html`.
