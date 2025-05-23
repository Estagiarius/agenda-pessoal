import sqlite3
import os # Import os to potentially get db path from env or app config in future

# Attempt to use Flask's current_app context if available, otherwise default.
# This is a more advanced setup for integration with Flask app context.
# For simplicity in this step, we'll make create_tables accept a db_path.

def create_tables(db_path='database.db'):
    """Creates the database tables if they don't already exist."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # Create parts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS parts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            specifications TEXT,
            supplier TEXT,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # Create tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # Create documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # When run directly, creates the default 'database.db'
    create_tables() 
    print("Database tables created successfully for 'database.db'.")
