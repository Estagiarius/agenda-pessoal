# Manual de Implantação

Este documento fornece um guia passo a passo para implantar a aplicação Agenda Pessoal em um ambiente de produção. O guia assume que o servidor de destino é uma distribuição Linux (como Ubuntu/Debian).

## Pré-requisitos

-   Acesso a um servidor Linux com permissões de superusuário (`sudo`).
-   Python 3 e `pip` instalados no servidor.
-   `git` instalado para clonar o repositório.

---

### Passo 1: Obter o Código-Fonte

Conecte-se ao seu servidor e clone o repositório do projeto.

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_DIRETORIO>
```

---

### Passo 2: Configurar o Ambiente Python

É uma boa prática usar um ambiente virtual para isolar as dependências do projeto.

1.  **Crie um ambiente virtual:**
    ```bash
    python3 -m venv venv
    ```

2.  **Ative o ambiente virtual:**
    ```bash
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    O projeto inclui um arquivo `requirements.txt` com todas as dependências necessárias.
    ```bash
    pip install -r requirements.txt
    ```

---

### Passo 3: Configurar as Variáveis de Ambiente

A aplicação precisa de uma chave de API para a funcionalidade de chat. Esta chave deve ser configurada como uma variável de ambiente.

Crie um arquivo `.env` na raiz do projeto para armazenar suas variáveis:

```bash
# .env
MARITACA_API_KEY="sua_chave_de_api_aqui"
```

**Importante:** Adicione `.env` ao seu arquivo `.gitignore` para evitar que segredos sejam enviados para o repositório.

---

### Passo 4: Configurar o Gunicorn (Servidor WSGI)

O servidor de desenvolvimento do Flask não é seguro para produção. Usaremos o **Gunicorn** como nosso servidor WSGI.

1.  **Instale o Gunicorn:**
    ```bash
    pip install gunicorn
    ```

2.  **Teste o Gunicorn:**
    Você pode testar se o Gunicorn consegue servir a aplicação. O arquivo principal é `launch.py` e o objeto da aplicação Flask é `app`.
    ```bash
    gunicorn --workers 3 --bind 0.0.0.0:8000 launch:app
    ```
    Isso deve iniciar o servidor na porta 8000. Você pode parar o processo com `Ctrl+C`.

---

### Passo 5: Configurar o `systemd` (Gerenciador de Processos)

Para garantir que a aplicação rode continuamente, vamos criar um serviço `systemd`.

1.  **Crie um arquivo de serviço:**
    ```bash
    sudo nano /etc/systemd/system/agenda.service
    ```

2.  **Adicione o seguinte conteúdo ao arquivo.** Certifique-se de substituir `<CAMINHO_PARA_O_PROJETO>` pelo caminho absoluto do seu projeto e `<SEU_USUARIO>` pelo seu nome de usuário no Linux.

    ```ini
    [Unit]
    Description=Gunicorn instance to serve Agenda Pessoal
    After=network.target

    [Service]
    User=<SEU_USUARIO>
    Group=www-data
    WorkingDirectory=<CAMINHO_PARA_O_PROJETO>
    EnvironmentFile=<CAMINHO_PARA_O_PROJETO>/.env
    ExecStart=<CAMINHO_PARA_O_PROJETO>/venv/bin/gunicorn --workers 3 --bind unix:agenda.sock -m 007 launch:app

    [Install]
    WantedBy=multi-user.target
    ```
    -   **Nota:** Estamos usando um socket Unix (`agenda.sock`) para a comunicação entre o Gunicorn e o Nginx. Isso é um pouco mais seguro e eficiente do que usar uma porta TCP.

3.  **Inicie e habilite o serviço:**
    ```bash
    sudo systemctl start agenda
    sudo systemctl enable agenda
    ```

---

### Passo 6: Configurar o Nginx (Proxy Reverso)

O Nginx atuará como nosso servidor web principal. Ele servirá os arquivos estáticos (HTML, CSS, JS) diretamente e encaminhará as requisições da API para o Gunicorn.

1.  **Instale o Nginx:**
    ```bash
    sudo apt-get update
    sudo apt-get install nginx
    ```

2.  **Crie um arquivo de configuração do Nginx para a sua aplicação:**
    ```bash
    sudo nano /etc/nginx/sites-available/agenda
    ```

3.  **Adicione a seguinte configuração.** Novamente, substitua `<CAMINHO_PARA_O_PROJETO>` pelo seu caminho.

    ```nginx
    server {
        listen 80;
        server_name seu_dominio_ou_ip;

        location / {
            root <CAMINHO_PARA_O_PROJETO>;
            try_files $uri $uri/ =404;
        }

        location /api {
            proxy_pass http://unix:<CAMINHO_PARA_O_PROJETO>/agenda.sock;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /upload {
            proxy_pass http://unix:<CAMINHO_PARA_O_PROJETO>/agenda.sock;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    ```

4.  **Habilite a configuração criando um link simbólico:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/agenda /etc/nginx/sites-enabled
    ```

5.  **Teste a configuração do Nginx e reinicie o serviço:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

### Conclusão

Sua aplicação agora deve estar rodando em produção, servida pelo Nginx e Gunicorn e gerenciada pelo `systemd`. Você pode acessá-la através do IP ou domínio do seu servidor.
