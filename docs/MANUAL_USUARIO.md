# Manual do Usuário - Agenda Pessoal

Bem-vindo ao manual do usuário da aplicação Agenda Pessoal! Este guia foi projetado para ajudá-lo a aproveitar ao máximo todas as funcionalidades que a nossa ferramenta oferece.

Aqui você encontrará tutoriais passo a passo sobre como gerenciar sua vida acadêmica e pessoal, desde a organização de tarefas e eventos até a gestão de disciplinas, planos de aula e muito mais.

## Índice

1.  **[Primeiros Passos](#primeiros-passos)**
    *   [Acessando a Aplicação e Fazendo Login](#acessando-a-aplicação-e-fazendo-login)
    *   [Visão Geral da Interface](#visão-geral-da-interface)
2.  **[Gerenciando sua Agenda](#gerenciando-sua-agenda)**
    *   [Usando o Calendário](#usando-o-calendário)
    *   [Adicionando e Editando Eventos](#adicionando-e-editando-eventos)
    *   [Gerenciando Tarefas](#gerenciando-tarefas)
3.  **[Recursos Didáticos](#recursos-didáticos)**
    *   [Criando um Banco de Questões](#criando-um-banco-de-questões)
    *   [Gerando e Realizando Quizzes](#gerando-e-realizando-quizzes)
    *   [Gerenciando Materiais de Estudo](#gerenciando-materiais-de-estudo)
4.  **[Gestão Acadêmica](#gestão-acadêmica)**
    *   [Gerenciando Disciplinas](#gerenciando-disciplinas)
    *   [Gerenciando Turmas](#gerenciando-turmas)
    *   [Matriculando Alunos](#matriculando-alunos)
    *   [Lançando Notas e Gerando Boletins](#lançando-notas-e-gerando-boletins)
    *   [Criando e Gerenciando Planos de Aula](#criando-e-gerenciando-planos-de-aula)
5.  **[Chat com Assistente](#chat-com-assistente)**
    *   [Como Usar o Chat](#como-usar-o-chat)
6.  **[Configurações](#configurações)**
    *   [Personalizando a Aplicação](#personalizando-a-aplicação)

---

## 1. Primeiros Passos
<a name="primeiros-passos"></a>

Esta seção aborda como acessar a aplicação e oferece uma visão geral da sua interface para que você possa começar a usá-la rapidamente.

### Acessando a Aplicação e Fazendo Login
<a name="acessando-a-aplicação-e-fazendo-login"></a>

Para utilizar a Agenda Pessoal, você precisa primeiro iniciar o servidor local. Siga os passos abaixo:

1.  **Abra um terminal** ou prompt de comando no seu computador.
2.  **Navegue até a pasta** onde você clonou ou baixou os arquivos da aplicação.
3.  **Execute o seguinte comando:**
    ```bash
    python launch.py
    ```
4.  Após a execução, o script tentará abrir a aplicação automaticamente no seu navegador padrão. Caso isso não aconteça, você pode acessá-la manualmente no endereço `http://127.0.0.1:8000`.

**Processo de Login**

Ao acessar a aplicação pela primeira vez, você será apresentado a uma tela de login. Como a aplicação agora salva seus dados de forma segura em um servidor, é necessário ter uma conta.

-   **Se você já tem uma conta:** Insira seu email e senha para fazer o login.
-   **Se você é um novo usuário:** Procure pela opção "Criar conta" ou "Registrar-se" e siga as instruções para criar sua conta.

### Visão Geral da Interface
<a name="visão-geral-da-interface"></a>

Após o login, você será direcionado para a tela inicial. A interface é dividida em duas áreas principais: a **Barra de Navegação Superior** e a **Área de Conteúdo Principal**.

**Barra de Navegação Superior**

Esta barra fica no topo da página e permite que você acesse todas as seções da aplicação.

-   **Início:** Leva você de volta à página inicial, que geralmente exibe o calendário e um resumo das suas atividades.
-   **Tarefas:** Abre a sua lista de tarefas pendentes e concluídas.
-   **Agenda Completa:** Mostra uma visualização de todos os seus eventos futuros.
-   **Chat:** Abre a interface de chat para conversar com o assistente de IA.
-   **Recursos Didáticos (Menu Suspenso):**
    -   **Banco de Perguntas:** Para criar e gerenciar questões de múltipla escolha.
    -   **Quiz:** Para gerar e realizar quizzes.
    -   **Banco de Materiais:** Para fazer upload e organizar seus materiais de estudo.
-   **Gestão Acadêmica (Menu Suspenso):**
    -   **Disciplinas:** Para cadastrar e gerenciar as disciplinas que você leciona.
    -   **Turmas:** Para gerenciar suas turmas, associando-as a disciplinas.
    -   **Meus Planos de Aula:** Para criar e organizar seus planos de aula.
-   **Configurações:** Permite personalizar a aparência e as preferências da aplicação.
-   **Menu do Usuário:** Mostra seu nome de usuário e oferece a opção de sair (logout).

**Área de Conteúdo Principal**

Esta é a área central da tela onde o conteúdo de cada seção é exibido. Quando você clica em um link na barra de navegação, o conteúdo correspondente (seja o calendário, a lista de tarefas, o formulário de uma disciplina, etc.) é carregado aqui.

---

## 2. Gerenciando sua Agenda
<a name="gerenciando-sua-agenda"></a>

Manter sua agenda organizada é uma das principais funcionalidades da aplicação. Aqui você aprenderá a usar o calendário, a gerenciar eventos e a controlar sua lista de tarefas.

### Usando o Calendário
<a name="usando-o-calendário"></a>

O calendário é o coração da sua agenda e é a primeira coisa que você vê na tela inicial.

-   **Navegação:** Utilize as setas na parte superior do calendário para avançar ou retroceder para os meses seguintes ou anteriores. Clique em "Hoje" para retornar rapidamente ao mês atual.
-   **Visualização de Eventos:** Os dias que possuem eventos agendados são marcados diretamente no calendário, permitindo que você tenha uma visão rápida dos seus compromissos.

### Adicionando e Editando Eventos
<a name="adicionando-e-editando-eventos"></a>

Para adicionar um novo evento, siga estes passos:

1.  **Clique em uma data** no calendário. Uma janela (modal) chamada "Adicionar Novo Evento" aparecerá.
2.  **Preencha os detalhes do evento:**
    -   **Título:** Um nome claro para o seu evento (ex: "Prova de Cálculo").
    -   **Hora de Início e Término:** Defina o período do evento.
    -   **Descrição:** Adicione mais detalhes, se necessário.
    -   **Categoria:** Classifique o evento (ex: "Reunião", "Aula", "Pessoal").
    -   **Repetir:** Configure se o evento deve se repetir diariamente, semanalmente ou mensalmente e até quando.
    -   **Lembretes:** Adicione um ou mais lembretes para ser notificado antes do evento (ex: 15 minutos antes, 1 hora antes).
3.  **Clique em "Salvar Evento"** para adicionar o evento à sua agenda.

Para **ver ou editar um evento existente**, clique no evento diretamente no calendário. Uma janela com os detalhes aparecerá. Nela, você terá a opção de editar as informações ou excluir o evento.

### Gerenciando Tarefas
<a name="gerenciando-tarefas"></a>

A seção "Tarefas" ajuda você a manter o controle de tudo o que precisa ser feito.

**Para Adicionar uma Nova Tarefa:**

1.  Navegue até a seção **"Tarefas"** no menu superior.
2.  No painel "Nova Tarefa", preencha os campos:
    -   **Descrição da Tarefa:** O que precisa ser feito (ex: "Preparar slides para a aula de amanhã").
    -   **Data de Vencimento:** O prazo final para a conclusão da tarefa.
    -   **Prioridade:** Defina a urgência como Alta, Média ou Baixa.
3.  Clique no botão **"Adicionar Tarefa"**.

**Para Gerenciar suas Tarefas:**

-   **Marcar como Concluída:** Ao lado de cada tarefa na lista, há um botão para marcá-la como concluída.
-   **Filtrar e Ordenar:** Utilize os botões no topo da lista para filtrar as tarefas (ver todas, apenas as abertas ou apenas as concluídas) e para ordená-las por data de vencimento ou por prioridade. Isso ajuda a focar no que é mais importante.

---

## 3. Recursos Didáticos
<a name="recursos-didáticos"></a>

A aplicação oferece um conjunto de ferramentas para ajudar você a criar e gerenciar seus próprios materiais de estudo e avaliação.

### Criando um Banco de Questões
<a name="criando-um-banco-de-questões"></a>

O Banco de Questões permite que você crie um repositório centralizado de perguntas que podem ser usadas em quizzes e outras atividades.

**Para Adicionar uma Nova Pergunta:**

1.  Navegue até **Recursos Didáticos > Banco de Perguntas** no menu.
2.  Preencha o formulário "Adicionar Nova Pergunta":
    -   **Texto da Pergunta:** A pergunta em si.
    -   **Assunto:** O tema da pergunta (ex: "Química Orgânica"). Isso ajuda a organizar e filtrar suas questões.
    -   **Dificuldade:** Classifique como Fácil, Médio ou Difícil.
    -   **Opções de Múltipla Escolha:** Clique em "Adicionar Opção" para criar alternativas de resposta.
    -   **Resposta Correta:** Digite o texto exato da resposta correta.
3.  Clique em **"Adicionar Pergunta"**.

**Para Filtrar e Encontrar Perguntas:**

-   Use os campos de filtro no topo da lista para buscar perguntas por **assunto** ou **dificuldade**.

### Gerando e Realizando Quizzes
<a name="gerando-e-realizando-quizzes"></a>

Com as perguntas salvas no seu banco, você pode gerar quizzes personalizados.

**Para Configurar um Quiz:**

1.  Navegue até **Recursos Didáticos > Quiz**.
2.  Defina as configurações do seu quiz:
    -   **Número de Perguntas:** Quantas perguntas o quiz terá.
    -   **Assunto:** Escolha um assunto específico para focar o quiz ou deixe em branco para usar todas as perguntas.
    -   **Dificuldade:** Filtre as perguntas por nível de dificuldade.
3.  Clique em **"Iniciar Quiz"**.

**Para Realizar o Quiz:**

-   A tela do quiz exibirá uma pergunta de cada vez.
-   Selecione a resposta que você acredita ser a correta.
-   Use os botões **"Próxima"** e **"Anterior"** para navegar entre as questões.
-   Quando terminar, clique em **"Finalizar Quiz"** para ver sua pontuação.

### Gerenciando Materiais de Estudo
<a name="gerenciando-materiais-de-estudo"></a>

A seção de Materiais permite que você faça o upload e organize arquivos como PDFs, documentos, apresentações e imagens.

**Para Fazer Upload de um Material:**

1.  Navegue até **Recursos Didáticos > Banco de Materiais**.
2.  No formulário "Fazer Upload de Novo Material":
    -   **Arquivo:** Clique para selecionar o arquivo do seu computador.
    -   **Título:** Dê um nome descritivo para o material.
    -   **Tags:** Adicione palavras-chave separadas por vírgula para facilitar a busca (ex: "resumo, prova1, biologia").
3.  Clique em **"Fazer Upload"**.

**Para Encontrar seus Materiais:**

-   A lista de "Materiais Existentes" mostra tudo o que você enviou.
-   Use a **barra de busca** para encontrar um material rapidamente pelo título ou tag.
-   Clique em **"Visualizar"** para abrir o material em uma nova aba do navegador.

---

## 4. Gestão Acadêmica
<a name="gestão-acadêmica"></a>

Esta é a área mais poderosa da aplicação, permitindo que você gerencie todos os aspectos das suas atividades de ensino.

### Gerenciando Disciplinas
<a name="gerenciando-disciplinas"></a>

As disciplinas são a base da sua organização.

1.  **Para Adicionar:**
    -   Navegue até **Gestão Acadêmica > Disciplinas**.
    -   Clique em **"Adicionar Nova Disciplina"**.
    -   Preencha o nome (ex: "Matemática Discreta"), o código (ex: "MAT241") e uma breve descrição ou ementa.
    -   Clique em **"Salvar"**.
2.  **Para Editar ou Excluir:**
    -   Na lista de disciplinas, clique nos botões de ação ao lado de cada item para editar ou excluir.

### Gerenciando Turmas
<a name="gerenciando-turmas"></a>

As turmas conectam uma disciplina a um grupo de alunos e um período de tempo.

1.  **Para Adicionar:**
    -   Navegue até **Gestão Acadêmica > Turmas**.
    -   Clique em **"Adicionar Nova Turma"**.
    -   Dê um nome à turma (ex: "Turma A - 2024"), associe-a a uma **disciplina** previamente cadastrada, defina o **ano/semestre** e o nome do professor.
    -   Clique em **"Salvar"**.
2.  **Para Ver Detalhes:**
    -   Clique no nome de uma turma na lista para acessar sua página de detalhes.

### Matriculando Alunos
<a name="matriculando-alunos"></a>

Você pode adicionar alunos a uma turma de duas formas:

1.  **Manualmente:**
    -   Na página de detalhes da turma, na aba **"Alunos Matriculados"**, clique em **"Cadastrar e Matricular Novo Aluno"**.
    -   Preencha os dados do aluno (nome, número de chamada, etc.) e salve.
2.  **Importando um Arquivo CSV:**
    -   Prepare uma planilha com os dados dos alunos (ex: `nome,email,matricula`).
    -   Na aba **"Alunos Matriculados"**, clique em **"Importar Alunos (CSV)"**, selecione o arquivo e siga as instruções.

### Lançando Notas e Gerando Boletins
<a name="lançando-notas-e-gerando-boletins"></a>

1.  **Criando uma Avaliação:**
    -   Na página de detalhes da turma, vá para a aba **"Avaliações da Turma"**.
    -   Clique em **"Criar Nova Avaliação"**.
    -   Defina o nome (ex: "Prova 1"), o peso na média final e a nota máxima.
2.  **Lançando as Notas:**
    -   Após criar a avaliação, uma opção para **"Lançar Notas"** aparecerá.
    -   Você verá uma lista dos seus alunos e poderá inserir a nota de cada um.
3.  **Gerando o Boletim:**
    -   De volta à aba **"Avaliações da Turma"**, clique em **"Ver Boletim da Turma"**.
    -   O sistema calculará a média final de cada aluno com base nas notas e pesos das avaliações e exibirá um boletim completo, que pode ser exportado.

### Criando e Gerenciando Planos de Aula
<a name="criando-e-gerenciando-planos-de-aula"></a>

Planeje suas aulas em detalhes com esta ferramenta.

1.  **Para Criar um Plano de Aula:**
    -   Navegue até **Gestão Acadêmica > Meus Planos de Aula**.
    -   Clique em **"Criar Novo Plano de Aula"**.
    -   Preencha todos os campos do plano: título, turma(s) associada(s), data, objetivos, metodologia e recursos.
2.  **Anexando Materiais e Avaliações:**
    -   No lado direito do formulário do plano de aula, você pode **anexar materiais de estudo** (como PDFs e slides) e **vincular avaliações** que estão relacionadas àquela aula.
3.  **Salvando e Duplicando:**
    -   Clique em **"Salvar"** para finalizar.
    -   Use o botão **"Salvar e Duplicar"** se quiser criar um novo plano de aula muito parecido com o atual, economizando tempo.

---

## 5. Chat com Assistente
<a name="chat-com-assistente"></a>

A aplicação inclui um assistente de IA para ajudá-lo com dúvidas e tarefas.

### Como Usar o Chat
<a name="como-usar-o-chat"></a>

1.  Navegue até a seção **"Chat"** no menu principal.
2.  **Escolha o Modelo de IA:** No topo da tela de chat, você pode selecionar o modelo de IA que preferir. Cada um pode ter um estilo de resposta e conhecimento diferente.
3.  **Envie sua Mensagem:** Digite sua pergunta ou comando no campo de texto na parte inferior e clique em **"Enviar"**.
4.  **Aguarde a Resposta:** O assistente processará sua solicitação e responderá na janela de chat.

## 6. Configurações
<a name="configurações"></a>

Personalize o comportamento da aplicação para que ela se ajuste melhor às suas necessidades.

### Personalizando a Aplicação
<a name="personalizando-a-aplicação"></a>

1.  Navegue até a seção **"Configurações"** no menu.
2.  Na tela, você encontrará as seguintes opções:
    -   **Habilitar som para notificações:** Marque esta caixa se desejar ouvir um som toda vez que uma notificação de evento for exibida.
3.  As alterações são salvas automaticamente assim que você as faz.
