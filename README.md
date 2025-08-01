# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica que roda 100% no navegador, sem necessidade de backend.

## Visão Geral

Este projeto é uma Single Page Application (SPA) para gerenciamento de tarefas, eventos e atividades acadêmicas. Todos os dados são armazenados localmente no navegador do usuário, utilizando `localStorage`.

## Principais Funcionalidades

- **Agenda e Calendário:** Gerenciamento de eventos e tarefas.
- **Recursos Didáticos:** Crie um banco de questões e gere quizzes para testar seus conhecimentos.
- **Gestão Acadêmica:** Organize disciplinas, turmas, alunos e notas, com a funcionalidade de gerar boletins.

## Implantação (GitHub Pages)

Esta aplicação está preparada para ser implantada no GitHub Pages.

**Atenção:** Como o GitHub Pages serve apenas conteúdo estático, as seguintes funcionalidades que dependem de um backend **não estão disponíveis** na versão implantada:

*   **Upload de Materiais:** A funcionalidade de upload de novos arquivos foi desativada.
*   **Chat com IA:** A funcionalidade de chat com o assistente de IA foi desativada.

O restante da aplicação, incluindo a agenda, tarefas, quizzes e gestão acadêmica, funciona normalmente, salvando os dados no `localStorage` do seu navegador.

## Começando

### Para Executar a Aplicação Localmente

Para rodar a aplicação localmente, basta abrir o arquivo `index.html` diretamente no seu navegador. Não é mais necessário usar o script `launch.py`.

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
│   └── lib/          # Bibliotecas de terceiros
├── tests/            # Testes unitários
├── views/            # Templates HTML das seções
├── _config.yml       # Configuração do Jekyll para GitHub Pages
└── index.html        # Ponto de entrada da aplicação
```

## Como Contribuir

1.  **Faça um Fork:** Crie um fork do projeto.
2.  **Crie uma Branch:** Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-feature`).
3.  **Faça o Commit:** Faça o commit das suas alterações (`git commit -m 'feat: Adiciona nova feature'`).
4.  **Faça o Push:** Envie para a sua branch (`git push origin feature/nova-feature`).
5.  **Abra um Pull Request:** Abra um pull request para o repositório original.
