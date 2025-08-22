# Documentação da API - Agenda Pessoal

Esta documentação descreve a API RESTful da aplicação Agenda Pessoal. A API é usada pelo frontend para se comunicar com o servidor para buscar, criar, atualizar e excluir dados.

## Formato Geral

-   **URL Base:** Todas as URLs da API são relativas à URL base onde a aplicação está hospedada.
-   **Formato de Dados:** Todas as requisições e respostas com corpo de dados utilizam o formato `application/json`.
-   **Autenticação:** (Nota: A autenticação não está explicitamente implementada no código fornecido, mas uma aplicação de produção exigiria um mecanismo, como tokens JWT.)

---

## Recursos

### 1. Disciplinas

O recurso `disciplina` representa uma matéria ou disciplina acadêmica.

---

#### `GET /api/disciplinas`

Retorna uma lista de todas as disciplinas cadastradas.

-   **Método:** `GET`
-   **Parâmetros da Query:** Nenhum.
-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "disc_1a2b3c",
        "nome": "Cálculo I",
        "codigo": "MAT101",
        "descricao": "Estudo de limites, derivadas e integrais."
      },
      {
        "id": "disc_4d5e6f",
        "nome": "Física I",
        "codigo": "FIS101",
        "descricao": "Mecânica clássica."
      }
    ]
    ```

---

#### `POST /api/disciplinas`

Cria uma nova disciplina.

-   **Método:** `POST`
-   **Corpo da Requisição:**
    ```json
    {
      "nome": "Química Geral",
      "codigo": "QUI101",
      "descricao": "Fundamentos da química."
    }
    ```
    -   `nome` (string, obrigatório): O nome da disciplina.
    -   `codigo` (string, opcional): O código da disciplina.
    -   `descricao` (string, opcional): A ementa ou descrição da disciplina.
-   **Resposta de Sucesso (201 Created):** Retorna o objeto da disciplina recém-criada.
    ```json
    {
      "id": "disc_7g8h9i",
      "nome": "Química Geral",
      "codigo": "QUI101",
      "descricao": "Fundamentos da química."
    }
    ```
-   **Resposta de Erro (400 Bad Request):** Se o campo `nome` não for fornecido.
    ```json
    {
      "error": "O campo \"nome\" é obrigatório"
    }
    ```

---

#### `GET /api/disciplinas/{id}`

Busca uma disciplina específica pelo seu ID.

-   **Método:** `GET`
-   **Parâmetros da URL:**
    -   `id` (string, obrigatório): O ID da disciplina.
-   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "id": "disc_1a2b3c",
      "nome": "Cálculo I",
      "codigo": "MAT101",
      "descricao": "Estudo de limites, derivadas e integrais."
    }
    ```
-   **Resposta de Erro (404 Not Found):** Se a disciplina com o ID especificado não for encontrada.
    ```json
    {
      "error": "Disciplina não encontrada"
    }
    ```

---

#### `PUT /api/disciplinas/{id}`

Atualiza os dados de uma disciplina existente.

-   **Método:** `PUT`
-   **Parâmetros da URL:**
    -   `id` (string, obrigatório): O ID da disciplina a ser atualizada.
-   **Corpo da Requisição:** Um objeto JSON com os campos a serem atualizados.
    ```json
    {
      "nome": "Cálculo I - Atualizado",
      "descricao": "Nova descrição da disciplina."
    }
    ```
-   **Resposta de Sucesso (200 OK):** Retorna o objeto completo da disciplina atualizada.
-   **Resposta de Erro (404 Not Found):** Se a disciplina não for encontrada.

---

#### `DELETE /api/disciplinas/{id}`

Exclui uma disciplina.

-   **Método:** `DELETE`
-   **Parâmetros da URL:**
    -   `id` (string, obrigatório): O ID da disciplina a ser excluída.
-   **Resposta de Sucesso (204 No Content):** Retorna um corpo vazio.
-   **Resposta de Erro (404 Not Found):** Se a disciplina não for encontrada.

---

### 2. Turmas

O recurso `turma` representa uma classe ou grupo de alunos associado a uma disciplina.

---

#### `GET /api/turmas`

Retorna uma lista de todas as turmas.

-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "turma_1a2b3c",
        "nome": "Turma A - 2024",
        "ano_semestre": "2024/1",
        "professor": "Dr. Silva",
        "id_disciplina": "disc_1a2b3c",
        "disciplina_nome": "Cálculo I"
      }
    ]
    ```

---

#### `POST /api/turmas`

Cria uma nova turma.

-   **Corpo da Requisição:**
    ```json
    {
      "nome": "Turma B - 2024",
      "id_disciplina": "disc_4d5e6f",
      "ano_semestre": "2024/1",
      "professor": "Dra. Costa"
    }
    ```
    -   `nome` (string, obrigatório)
    -   `id_disciplina` (string, obrigatório)
-   **Resposta de Sucesso (201 Created):** Retorna o objeto da turma criada.
-   **Resposta de Erro (400 Bad Request):** Se campos obrigatórios estiverem faltando ou se `id_disciplina` não existir.

---

#### `GET /api/turmas/{id}`

Busca uma turma específica pelo seu ID.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto da turma.
-   **Resposta de Erro (404 Not Found):** Se a turma não for encontrada.

---

#### `PUT /api/turmas/{id}`

Atualiza os dados de uma turma.

-   **Corpo da Requisição:** Campos a serem atualizados.
-   **Resposta de Sucesso (200 OK):** Retorna o objeto da turma atualizada.

---

#### `DELETE /api/turmas/{id}`

Exclui uma turma.

-   **Resposta de Sucesso (204 No Content).**

---

#### `GET /api/turmas/{id}/alunos`

Retorna a lista de alunos matriculados em uma turma específica.

-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "aluno_123",
        "nome": "João da Silva",
        "matricula": "2024001"
      }
    ]
    ```

---

#### `POST /api/turmas/{id}/alunos`

Matricula um aluno em uma turma.

-   **Corpo da Requisição:**
    ```json
    {
      "id_aluno": "aluno_456"
    }
    ```
-   **Resposta de Sucesso (201 Created):**
    ```json
    {
      "success": true
    }
    ```
-   **Resposta de Erro (409 Conflict):** Se o aluno já estiver matriculado na turma.

---

#### `DELETE /api/turmas/{id}/alunos/{aluno_id}`

Desmatricula um aluno de uma turma.

-   **Resposta de Sucesso (204 No Content).**
-   **Resposta de Erro (404 Not Found):** Se a matrícula não for encontrada.

---

### 3. Alunos

O recurso `aluno` representa um estudante.

---

#### `GET /api/alunos`

Retorna uma lista de todos os alunos cadastrados no sistema.

-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "aluno_123",
        "nome": "João da Silva",
        "matricula": "2024001",
        "data_nascimento": "2005-03-15"
      }
    ]
    ```

---

#### `POST /api/alunos`

Cria um novo aluno.

-   **Corpo da Requisição:**
    ```json
    {
      "nome": "Maria Oliveira",
      "matricula": "2024002",
      "data_nascimento": "2006-07-22"
    }
    ```
    -   `nome` (string, obrigatório)
-   **Resposta de Sucesso (201 Created):** Retorna o objeto do aluno criado.

---

#### `GET /api/alunos/{id}`

Busca um aluno específico pelo seu ID.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto do aluno.
-   **Resposta de Erro (404 Not Found):** Se o aluno não for encontrado.

---

#### `PUT /api/alunos/{id}`

Atualiza os dados de um aluno.

-   **Corpo da Requisição:** Campos a serem atualizados.
-   **Resposta de Sucesso (200 OK):** Retorna o objeto do aluno atualizado.

---

#### `DELETE /api/alunos/{id}`

Exclui um aluno.

-   **Regra de Negócio:** Um aluno não pode ser excluído se estiver matriculado em alguma turma.
-   **Resposta de Sucesso (204 No Content).**
-   **Resposta de Erro (400 Bad Request):** Se o aluno estiver matriculado.
    ```json
    {
      "error": "Este aluno está matriculado em uma ou mais turmas e não pode ser excluído."
    }
    ```

---

### 4. Avaliações e Notas

Este recurso gerencia as avaliações de uma turma e as notas dos alunos.

---

#### `GET /api/turmas/{id}/avaliacoes`

Retorna todas as avaliações de uma turma específica.

-   **Parâmetros da URL:** `id` da turma.
-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de avaliação.

---

#### `POST /api/avaliacoes`

Cria uma nova avaliação para uma turma.

-   **Corpo da Requisição:**
    ```json
    {
      "nome": "Prova 1",
      "peso": 0.4,
      "nota_maxima": 10,
      "id_turma": "turma_1a2b3c"
    }
    ```
-   **Resposta de Sucesso (201 Created):** Retorna o objeto da avaliação criada.

---

#### `PUT /api/avaliacoes/{id}`

Atualiza uma avaliação.

-   **Corpo da Requisição:** Campos a serem atualizados (`nome`, `peso`, `nota_maxima`).
-   **Resposta de Sucesso (200 OK):** Retorna o objeto da avaliação atualizada.

---

#### `DELETE /api/avaliacoes/{id}`

Exclui uma avaliação e todas as notas associadas a ela.

-   **Resposta de Sucesso (204 No Content).**

---

#### `GET /api/avaliacoes/{id}/notas`

Retorna as notas de todos os alunos para uma avaliação específica.

-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id_aluno": "aluno_123",
        "id_avaliacao": "aval_abc",
        "valor": 8.5
      }
    ]
    ```

---

#### `POST /api/avaliacoes/{id}/notas`

Salva o conjunto de notas de uma avaliação. Esta operação substitui todas as notas existentes para a avaliação.

-   **Corpo da Requisição:** Uma lista de objetos de nota.
    ```json
    [
      { "studentId": "aluno_123", "grade": 8.5 },
      { "studentId": "aluno_456", "grade": 9.0 }
    ]
    ```
-   **Regra de Negócio:** A nota não pode ser maior que a `nota_maxima` da avaliação.
-   **Resposta de Sucesso (201 Created):** `{ "success": true }`
-   **Resposta de Erro (400 Bad Request):** Se alguma nota for inválida.

---

### 5. Eventos (Calendário)

Recurso para gerenciar eventos no calendário.

---

#### `GET /api/eventos`

Retorna uma lista de eventos. Pode receber `start` e `end` como parâmetros de query para filtrar por um período.

-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de evento.

---

#### `POST /api/eventos`

Cria um novo evento. Lida com a criação de eventos recorrentes.

-   **Corpo da Requisição:** Objeto de evento, pode incluir `recurrenceFrequency` e `recurrenceEndDate`.
-   **Resposta de Sucesso (201 Created):** `{ "success": true, "count": <numero_de_eventos_criados> }`

---

#### `PUT /api/eventos/{id}`

Atualiza um evento.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto do evento atualizado.

---

#### `DELETE /api/eventos/{id}`

Exclui um evento. Para eventos recorrentes, aceita um parâmetro de query `scope` (`this`, `future`, `all`).

-   **Resposta de Sucesso (204 No Content).**

---

### 6. Tarefas (To-Do)

Recurso para gerenciar tarefas.

---

#### `GET /api/tarefas`

Retorna a lista de todas as tarefas.

-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de tarefa.

---

#### `POST /api/tarefas`

Cria uma nova tarefa.

-   **Corpo da Requisição:** `{ "text": "Nova tarefa", "priority": "Medium", "dueDate": "2024-12-31" }`
-   **Resposta de Sucesso (201 Created):** Retorna o objeto da tarefa criada.

---

#### `PUT /api/tarefas/{id}`

Atualiza uma tarefa, incluindo seu status de `completed`.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto da tarefa atualizada.

---

#### `DELETE /api/tarefas/{id}`

Exclui uma tarefa.

-   **Resposta de Sucesso (204 No Content).**

---

### 7. Planos de Aula

Recurso para gerenciar planos de aula.

---

#### `GET /api/planos_de_aula`

Retorna uma lista de todos os planos de aula com seus detalhes (turmas, materiais, etc.).

-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de plano de aula.

---

#### `POST /api/planos_de_aula`

Cria um novo plano de aula e suas associações.

-   **Corpo da Requisição:** Um objeto complexo de plano de aula, incluindo `classIds`, `materialIds`, `evaluationIds`.
-   **Resposta de Sucesso (201 Created):** Retorna o objeto do plano de aula criado.

---

#### `GET /api/planos_de_aula/{id}`

Busca um plano de aula específico com todos os seus detalhes.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto do plano de aula.

---

#### `PUT /api/planos_de_aula/{id}`

Atualiza um plano de aula e suas associações.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto do plano de aula atualizado.

---

#### `DELETE /api/planos_de_aula/{id}`

Exclui um plano de aula.

-   **Resposta de Sucesso (204 No Content).**

---

### 8. Perguntas (Banco de Questões)

Recurso para gerenciar as perguntas do banco de questões.

---

#### `GET /api/perguntas`

Retorna uma lista de perguntas, com filtros opcionais por `subject` e `difficulty`.

-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de pergunta.

---

#### `POST /api/perguntas`

Cria uma nova pergunta.

-   **Corpo da Requisição:** Objeto de pergunta, com `options` como uma lista.
-   **Resposta de Sucesso (201 Created):** Retorna o objeto da pergunta criada.

---

#### `GET /api/perguntas/subjects`

Retorna uma lista de todos os assuntos (subjects) únicos cadastrados nas perguntas.

-   **Resposta de Sucesso (200 OK):** `["Matemática", "Física", "Química"]`

---

### 9. Materiais de Estudo

Recurso para gerenciar materiais de estudo.

---

#### `GET /api/materials`

Retorna uma lista de todos os materiais.

-   **Resposta de Sucesso (200 OK):** Uma lista de objetos de material.

---

#### `GET /api/materials/{id}`

Busca um material específico.

-   **Resposta de Sucesso (200 OK):** Retorna o objeto do material.

---

### 10. Configurações

Recurso para gerenciar as configurações do usuário.

---

#### `GET /api/configuracoes`

Retorna o objeto de configurações do usuário. Se não houver, retorna as configurações padrão.

-   **Resposta de Sucesso (200 OK):** Objeto de configurações.

---

#### `POST /api/configuracoes`

Salva o objeto de configurações do usuário.

-   **Corpo da Requisição:** O objeto completo de configurações.
-   **Resposta de Sucesso (200 OK):** Retorna o objeto de configurações salvo.

---

### 11. Chat

Endpoint para interagir com o assistente de IA.

---

#### `POST /api/chat`

Envia uma mensagem para a IA e recebe uma resposta via streaming.

-   **Corpo da Requisição:** `{ "message": "Sua pergunta aqui", "model": "sabia-3.1" }`
-   **Resposta de Sucesso (200 OK):** Uma resposta do tipo `text/event-stream` com os pedaços da resposta da IA.

---

### 12. Uploads

Endpoint para fazer upload de arquivos.

---

#### `POST /upload`

Faz o upload de um arquivo e salva seus metadados na tabela `materials`.

-   **Corpo da Requisição:** `multipart/form-data` contendo o arquivo e os campos `title` e `tags`.
-   **Resposta de Sucesso (200 OK):** "File uploaded successfully"
