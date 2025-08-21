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

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # Permite executar este script diretamente para inicializar o DB
    print("Inicializando o banco de dados...")
    init_db()
    print("Banco de dados inicializado.")
