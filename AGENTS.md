# Documentação para Agentes de IA

Este documento fornece um guia para os agentes de IA sobre como entender e trabalhar neste projeto.

## Visão Geral do Projeto

Este projeto é uma aplicação web de agenda pessoal e acadêmica com uma **arquitetura cliente-servidor**. O frontend é uma Single Page Application (SPA) que se comunica com um backend escrito em Python.

A aplicação inclui as seguintes funcionalidades:

*   **Agenda e Calendário:** Gerenciamento de eventos e tarefas.
*   **Gestão Acadêmica:** Gerenciamento de disciplinas, turmas, alunos, notas e planos de aula.
*   **Recursos Didáticos:** Banco de questões, quizzes e materiais de estudo.
*   **Chat com Assistente:** Um chat em tempo real com um assistente de IA.
*   **Configurações:** Configurações personalizáveis pelo usuário.

## Estrutura do Código

O código está organizado da seguinte forma:

*   `index.html`: O ponto de entrada principal da aplicação.
*   `launch.py`: O script que executa o servidor de backend Python.
*   `css/`: Contém os arquivos de estilo (CSS).
*   `js/`: Contém os arquivos de lógica da aplicação (JavaScript).
    *   `js/app/`: Contém os módulos da aplicação (serviços, UI, etc.).
    *   As bibliotecas de terceiros (jQuery, Bootstrap) estão localizadas na raiz de `js/`.
*   `views/`: Contém os templates HTML para as diferentes seções da aplicação.
*   `tests/`: Contém os testes unitários para o frontend.

## Como Executar a Aplicação

Para executar a aplicação, utilize o script `launch.py`. Este script inicia o servidor backend e serve os arquivos do frontend.

```bash
python launch.py
```

O script tentará abrir a aplicação no navegador padrão. Se não, acesse o endereço fornecido no console (geralmente `http://127.0.0.1:8000`).

## Como Executar os Testes

Os testes unitários do frontend podem ser executados abrindo o arquivo `tests/test-runner.html` em um navegador.

## Fluxo de Trabalho de Desenvolvimento

1.  **Modificar o código-fonte:** As alterações podem envolver tanto o código do frontend (HTML, CSS, JS) quanto o do backend (Python).
2.  **Testar as alterações:**
    *   Para a lógica do frontend, atualize ou adicione testes em `tests/` e execute `tests/test-runner.html`.
    *   Verifique as mudanças na UI e na integração com o backend executando a aplicação com `launch.py`.
3.  **Processo de Build:** Não há um passo de compilação ou empacotamento para o frontend. No entanto, o servidor backend precisa ser reiniciado para que as alterações no código Python tenham efeito.

## Pontos Importantes

*   **Persistência de Dados:** A aplicação utiliza um modelo de persistência híbrido. Funcionalidades mais recentes (planos de aula, materiais, configurações) salvam os dados em um banco de dados no servidor. Funcionalidades legadas (como tarefas) ainda podem usar o `localStorage` do navegador. A fonte da verdade para a maioria dos dados é o backend.
*   **Comunicação com o Backend:** O frontend se comunica com o backend através de uma API REST. Os endpoints da API (ex: `/api/chat`, `/api/planos_de_aula`) são implementados no servidor Python.
*   **Roteamento:** O roteamento de páginas no frontend é feito no lado do cliente via `hashchange` e é gerenciado por `js/app/router.js`.
*   **Dependências:** As dependências de JavaScript estão incluídas diretamente no repositório, na pasta `js/`. Não há um gerenciador de pacotes como npm ou yarn.
