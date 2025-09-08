import sqlite3
import os
from flask import g

# Define o caminho do banco de dados no diretório raiz do projeto
DATABASE_FILE = "app_database.db"

def get_db():
    """
    Retorna uma conexão com o banco de dados. Se não existir no contexto da
    aplicação (g), uma nova conexão é criada e armazenada lá.
    """
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE_FILE)
        db.row_factory = sqlite3.Row
    return db

def close_db(e=None):
    """Fecha a conexão com o banco de dados se ela existir."""
    db = g.pop('_database', None)
    if db is not None:
        db.close()

def init_db():
    """
    Inicializa o banco de dados. Cria as tabelas se elas ainda não existirem.
    É seguro chamar esta função a cada inicialização do servidor.
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    # Tabela para os Materiais de Estudo (usando IF NOT EXISTS para segurança)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT,
        tags TEXT,
        url TEXT NOT NULL
    )
    ''')

    # Tabela para as Disciplinas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS disciplina (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        codigo TEXT,
        descricao TEXT
    )
    ''')

    # Tabela para as Turmas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS turma (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        ano_semestre TEXT,
        professor TEXT,
        id_disciplina TEXT NOT NULL,
        FOREIGN KEY (id_disciplina) REFERENCES disciplina(id)
    )
    ''')

    # Tabela para os Alunos
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aluno (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        numero_chamada INTEGER,
        data_nascimento TEXT,
        situacao TEXT
    )
    ''')

    # Tabela de associação para Matrículas (Alunos <-> Turmas)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS matricula (
        id_aluno TEXT NOT NULL,
        id_turma TEXT NOT NULL,
        PRIMARY KEY (id_aluno, id_turma),
        FOREIGN KEY (id_aluno) REFERENCES aluno(id),
        FOREIGN KEY (id_turma) REFERENCES turma(id)
    )
    ''')

    # Tabela para as Avaliações
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS avaliacao (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        peso REAL NOT NULL,
        nota_maxima REAL NOT NULL,
        id_turma TEXT NOT NULL,
        FOREIGN KEY (id_turma) REFERENCES turma(id)
    )
    ''')

    # Tabela para as Notas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS nota (
        id_aluno TEXT NOT NULL,
        id_avaliacao TEXT NOT NULL,
        valor REAL,
        PRIMARY KEY (id_aluno, id_avaliacao),
        FOREIGN KEY (id_aluno) REFERENCES aluno(id),
        FOREIGN KEY (id_avaliacao) REFERENCES avaliacao(id)
    )
    ''')

    # Tabela para Eventos do Calendário
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS evento (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_datetime TEXT NOT NULL,
        end_datetime TEXT,
        recurrence_id TEXT,
        reminders TEXT
    )
    ''')

    # Tabela para Tarefas (To-Do List)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tarefa (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        priority TEXT,
        due_date TEXT
    )
    ''')

    # Tabela para Planos de Aula
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS plano_de_aula (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT,
        objectives TEXT,
        methodology TEXT,
        resources TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # Tabela de associação: Planos de Aula <-> Turmas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS plano_aula_turma (
        id_plano_aula TEXT NOT NULL,
        id_turma TEXT NOT NULL,
        PRIMARY KEY (id_plano_aula, id_turma),
        FOREIGN KEY (id_plano_aula) REFERENCES plano_de_aula(id) ON DELETE CASCADE,
        FOREIGN KEY (id_turma) REFERENCES turma(id) ON DELETE CASCADE
    )
    ''')

    # Tabela de associação: Planos de Aula <-> Materiais
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS plano_aula_material (
        id_plano_aula TEXT NOT NULL,
        id_material TEXT NOT NULL,
        PRIMARY KEY (id_plano_aula, id_material),
        FOREIGN KEY (id_plano_aula) REFERENCES plano_de_aula(id) ON DELETE CASCADE,
        FOREIGN KEY (id_material) REFERENCES materials(id) ON DELETE CASCADE
    )
    ''')

    # Tabela de associação: Planos de Aula <-> Avaliações
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS plano_aula_avaliacao (
        id_plano_aula TEXT NOT NULL,
        id_avaliacao TEXT NOT NULL,
        PRIMARY KEY (id_plano_aula, id_avaliacao),
        FOREIGN KEY (id_plano_aula) REFERENCES plano_de_aula(id) ON DELETE CASCADE,
        FOREIGN KEY (id_avaliacao) REFERENCES avaliacao(id) ON DELETE CASCADE
    )
    ''')

    # Tabela para o Banco de Questões
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pergunta (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        subject TEXT,
        difficulty TEXT,
        options TEXT,
        answer TEXT NOT NULL
    )
    ''')

    # Tabela para Configurações da Aplicação (key-value store)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS configuracoes (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # Permite executar este script diretamente para inicializar o DB
    print("Inicializando o banco de dados...")
    init_db()
    print("Banco de dados inicializado.")
