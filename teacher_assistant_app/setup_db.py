import sqlite3
import os

def setup_database():
    # Ensure the data directory exists
    os.makedirs('data', exist_ok=True)

    conn = sqlite3.connect('data/school.db')
    cursor = conn.cursor()

    # Create students table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        class TEXT NOT NULL
    )
    ''')

    # Create grades table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject TEXT NOT NULL,
        grade REAL NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (id)
    )
    ''')

    # Add sample data
    # Using a try-except block to avoid errors on re-running the script
    try:
        students_data = [
            (1, 'João Silva', '7A'),
            (2, 'Maria Oliveira', '7A'),
            (3, 'Carlos Pereira', '7B')
        ]
        cursor.executemany('INSERT INTO students (id, name, class) VALUES (?, ?, ?)', students_data)

        grades_data = [
            (1, 'Matemática', 8.5),
            (1, 'Português', 9.0),
            (2, 'Matemática', 7.0),
            (2, 'Português', 8.0),
            (3, 'Matemática', 9.5),
            (3, 'Português', 8.5)
        ]
        cursor.executemany('INSERT INTO grades (student_id, subject, grade) VALUES (?, ?, ?)', grades_data)

        conn.commit()
    except sqlite3.IntegrityError:
        # This will happen if you run the script more than once.
        # It's safe to ignore as it means the data is already there.
        print("Data already exists in the database.")
    finally:
        conn.close()

if __name__ == '__main__':
    setup_database()
    print("Database 'school.db' created and populated with sample data.")
