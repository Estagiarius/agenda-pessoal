## Diagramas do Sistema

### Diagrama de Entidade-Relacionamento (DER)

O diagrama abaixo representa a estrutura de dados do sistema, com as principais entidades e seus relacionamentos, incluindo as novas funcionalidades de Planos de Aula e Materiais.

```mermaid
erDiagram
    DISCIPLINA ||--o{ TURMA : "possui"
    TURMA ||--|{ ALUNO : "matricula"
    TURMA ||--o{ AVALIACAO : "tem"
    AVALIACAO ||--|{ NOTA : "gera"
    ALUNO ||--|{ NOTA : "recebe"

    PLANO_DE_AULA }o--o{ TURMA : "aplica-se a"
    PLANO_DE_AULA }o--o{ MATERIAL : "anexa"
    PLANO_DE_AULA }o--o{ AVALIACAO : "vincula"

    DISCIPLINA {
        string id PK
        string nome
        string codigo
        string descricao
    }

    TURMA {
        string id PK
        string nome
        string ano_semestre
        string professor
        string id_disciplina FK
    }

    ALUNO {
        string id PK
        string nome
        string matricula
        date data_nascimento
    }

    AVALIACAO {
        string id PK
        string nome
        float peso
        float nota_maxima
        string id_turma FK
    }

    NOTA {
        string id_aluno FK
        string id_avaliacao FK
        float valor
    }

    PLANO_DE_AULA {
        string id PK
        string title
        date date
        string objectives
        string methodology
        string resources
    }

    MATERIAL {
        string id PK
        string title
        string url
        string type
        string tags
    }
```

### Diagrama de Casos de Uso

Este diagrama mostra as interações entre o usuário e as principais funcionalidades do sistema, incluindo as novas funcionalidades.

```mermaid
graph TD
    A[Usuário] --> B(Gerenciar Tarefas)
    A --> C(Agendar Eventos)
    A --> D(Gerenciar Recursos Didáticos)
    A --> E(Gerenciar Gestão Acadêmica)
    A --> F(Conversar com Assistente)
    A --> G(Configurar Aplicação)

    subgraph "Recursos Didáticos"
        D --> D1(Criar Questão)
        D --> D2(Realizar Quiz)
        D --> D3(Gerenciar Materiais de Estudo)
    end

    subgraph "Gestão Acadêmica"
        E --> E1(Gerenciar Disciplinas)
        E --> E2(Gerenciar Turmas)
        E --> E3(Matricular Alunos)
        E --> E4(Lançar Notas)
        E --> E5(Gerar Boletim)
        E --> E6(Gerenciar Planos de Aula)
    end
```
