import sqlite3

DB_PATH = 'data/school.db'

def get_all_students():
    """Fetches all students from the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM students ORDER BY name ASC")
        students = cursor.fetchall()
        conn.close()
        return students
    except Exception as e:
        print(f"Error fetching students: {e}")
        return []

def get_all_subjects():
    """Fetches all unique subjects from the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT subject FROM grades ORDER BY subject ASC")
        subjects = [row[0] for row in cursor.fetchall()]
        conn.close()
        return subjects
    except Exception as e:
        print(f"Error fetching subjects: {e}")
        return []

def add_grade(student_id, subject, grade):
    """Adds a new grade to the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO grades (student_id, subject, grade) VALUES (?, ?, ?)",
            (student_id, subject, grade)
        )
        conn.commit()
        conn.close()
        return True, "Nota adicionada com sucesso!"
    except Exception as e:
        print(f"Error adding grade: {e}")
        return False, f"Erro ao adicionar nota: {e}"

# Example for testing
if __name__ == '__main__':
    print("--- Testando Funções do Database Manager ---")

    # Test fetching students
    students = get_all_students()
    print(f"\nAlunos encontrados ({len(students)}):")
    print(students)

    # Test fetching subjects
    subjects = get_all_subjects()
    print(f"\nMatérias encontradas ({len(subjects)}):")
    print(subjects)

    # Test adding a new grade
    print("\nAdicionando nova nota (Aluno ID 1, Ciências, 9.2)...")
    success, message = add_grade(1, "Ciências", 9.2)
    print(f"Resultado: {message}")

    # Verify the new grade was added
    if success:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT s.name, g.subject, g.grade FROM grades g JOIN students s ON g.student_id = s.id WHERE g.subject = 'Ciências'")
        new_grade = cursor.fetchone()
        conn.close()
        print(f"Verificação: {new_grade}")
