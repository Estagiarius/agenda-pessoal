# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica com uma arquitetura cliente-servidor moderna.

## Visão Geral - 

Este projeto é uma Single Page Application (SPA) que se conecta a um backend para oferecer uma experiência rica e persistente. Embora algumas funcionalidades legadas ainda utilizem o `localStorage`, o núcleo da aplicação agora salva os dados em um servidor central, permitindo acesso de qualquer lugar.

Para um guia detalhado sobre como usar todas as funcionalidades, consulte nosso **[Manual do Usuário](docs/MANUAL_USUARIO.md)**.

## Principais Funcionalidades

- **Agenda e Calendário:** Gerenciamento completo de eventos e tarefas.
- **Recursos Didáticos:**
    - Crie e gerencie um banco de questões.
    - Gere e realize quizzes para testar seus conhecimentos.
    - Faça upload e organize materiais de estudo.
- **Gestão Acadêmica:**
    - Organize disciplinas, turmas, alunos e notas.
    - Crie e gerencie planos de aula detalhados.
    - Gere boletins e relatórios de desempenho.
- **Chat com Assistente:** Converse com um assistente de IA para obter ajuda e informações.
- **Configurações Centralizadas:** Personalize a aparência e o comportamento da aplicação.

## Começando

### Para Executar a Aplicação

Use o script `launch.py` para iniciar o servidor e abrir o `index.html` no seu navegador padrão:

```bash
python launch.py
```

### Para Executar os Testes

Abra o arquivo `tests/test-runner.html` em um navegador para rodar os testes unitários.

## Estrutura do Projeto

```
/
├── css/              # Estilos
├── docs/             # Documentação detalhada
├── fonts/            # Fontes
├── js/
│   ├── app/          # Módulos da aplicação (lógica principal)
│   └── ...           # Bibliotecas de terceiros (jQuery, Bootstrap, etc.)
├── tests/            # Testes unitários
├── views/            # Templates HTML das seções
├── index.html        # Ponto de entrada da aplicação
└── launch.py         # Script para iniciar a aplicação
```

## Como Contribuir

1.  **Faça um Fork:** Crie um fork do projeto.
2.  **Crie uma Branch:** Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-feature`).
3.  **Faça o Commit:** Faça o commit das suas alterações (`git commit -m 'feat: Adiciona nova feature'`).
4.  **Faça o Push:** Envie para a sua branch (`git push origin feature/nova-feature`).
5.  **Abra um Pull Request:** Abra um pull request para o repositório original.

---

## Mudanças Recentes (Setembro 2025)

Para melhorar a manutenibilidade e a qualidade do código, foram realizadas as seguintes refatorações significativas:

1.  **Remoção da Funcionalidade de Chat:** A funcionalidade de chat com IA, que estava desativada, foi completamente removida do código. Isso incluiu a remoção de arquivos de interface (`HTML`, `CSS`, `JS`), rotas de frontend e o endpoint da API de backend.

2.  **Refatoração do Sistema de Calendário:**
    -   **Banco de Dados:** O armazenamento de eventos foi modernizado. Em vez de salvar data e hora em campos de texto separados, agora usamos colunas `start_datetime` e `end_datetime` que armazenam a data e hora completas no formato padrão ISO 8601. Isso torna as consultas e a ordenação de eventos mais eficientes e confiáveis.
    -   **Visualização "Agenda Completa":** A interface da agenda completa foi redesenhada para agrupar os eventos por dia e ordená-los por hora, oferecendo uma visualização muito mais clara e organizada.

3.  **Melhoria no Gerenciamento de Conexões com o Banco de Dados:**
    -   A aplicação agora utiliza o contexto de aplicação do Flask para gerenciar as conexões com o banco de dados. Isso garante que as conexões sejam abertas apenas quando necessário e fechadas automaticamente no final de cada requisição, seguindo as melhores práticas e prevenindo vazamentos de recursos.
