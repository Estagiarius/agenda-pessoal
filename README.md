# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica que roda 100% no navegador, sem necessidade de backend.

## Visão Geral

Este projeto é uma Single Page Application (SPA) para gerenciamento de tarefas, eventos e atividades acadêmicas. Todos os dados são armazenados localmente no navegador do usuário, utilizando `localStorage`.

## Principais Funcionalidades

- **Agenda e Calendário:** Gerenciamento de eventos e tarefas.
- **Recursos Didáticos:** Crie um banco de questões e gere quizzes para testar seus conhecimentos.
- **Gestão Acadêmica:** Organize disciplinas, turmas, alunos e notas, com a funcionalidade de gerar boletins.

## Começando

### Para Executar a Aplicação

Use o script `launch.py` para abrir o `index.html` no seu navegador padrão:

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
│   └── lib/          # Bibliotecas de terceiros
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
