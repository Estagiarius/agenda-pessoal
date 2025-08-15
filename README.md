# Agenda Pessoal

Uma aplicação web de agenda pessoal e acadêmica com backend em Python (Flask) e frontend em JavaScript.

## Visão Geral

Este projeto é uma Single Page Application (SPA) para gerenciamento de tarefas, eventos e atividades acadêmicas. A aplicação utiliza um backend leve em Flask para servir a aplicação e fornecer APIs, enquanto o frontend é responsável pela interface e interação com o usuário.

**Importante:** Atualmente, a aplicação está em um processo de transição. Muitos dados ainda são salvos localmente no navegador (`localStorage`), mas o objetivo é mover toda a persistência de dados para o servidor para permitir o acesso de qualquer lugar.

## Principais Funcionalidades

- **Agenda e Calendário:** Gerenciamento de eventos e tarefas.
- **Recursos Didáticos:** Crie um banco de questões e gere quizzes para testar seus conhecimentos.
- **Gestão Acadêmica:** Organize disciplinas, turmas, alunos e notas, com a funcionalidade de gerar boletins.

## Começando

### Para Executar a Aplicação

1.  **Instale as dependências:**
    Certifique-se de que você tem Python e pip instalados. Em seguida, instale as dependências do projeto:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Inicie o servidor:**
    Execute o script `launch.py` para iniciar o servidor web local:
    ```bash
    python launch.py
    ```

3.  **Acesse a aplicação:**
    Abra seu navegador e acesse o endereço fornecido no terminal (normalmente `http://127.0.0.1:8000`).

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
