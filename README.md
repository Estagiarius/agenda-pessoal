# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica com uma arquitetura cliente-servidor moderna.

## Visão Geral

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
