import sqlite3
import os

# Define o caminho do banco de dados no diretório raiz do projeto
DATABASE_FILE = "app_database.db"

def get_db_connection():
    """Cria e retorna uma conexão com o banco de dados SQLite."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    return conn

def init_db():
    """
    Inicializa o banco de dados. Cria a tabela 'materials' se ela ainda não existir.
    É seguro chamar esta função a cada inicialização do servidor.
    """
    conn = get_db_connection()
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
        matricula TEXT,
        data_nascimento TEXT
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

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # Permite executar este script diretamente para inicializar o DB
    print("Inicializando o banco de dados...")
    init_db()
    print("Banco de dados inicializado.")
