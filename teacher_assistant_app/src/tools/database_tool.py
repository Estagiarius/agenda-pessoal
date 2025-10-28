import sqlite3
import pandas as pd

def query_database(sql_query: str):
    """
    Executes a SQL query against the local school.db and returns the result.

    Args:
        sql_query (str): The SQL query to be executed.

    Returns:
        str: A string representation of the query result, often a DataFrame.
             Returns an error message if the query fails.
    """
    try:
        conn = sqlite3.connect('data/school.db')
        # Use pandas to read sql query for a more structured output
        df = pd.read_sql_query(sql_query, conn)
        conn.close()

        if df.empty:
            return "A consulta não retornou resultados."

        # Convert DataFrame to a string format that's easy for an LLM to parse
        return df.to_string()
    except Exception as e:
        return f"Erro ao executar a consulta: {e}"

# Example for testing
if __name__ == '__main__':
    # Test query 1: Get all students
    print("--- Teste 1: Buscando todos os alunos ---")
    query1 = "SELECT * FROM students;"
    print(query_database(query1))

    # Test query 2: Get grades for a specific student
    print("\n--- Teste 2: Buscando notas de João Silva ---")
    query2 = """
    SELECT s.name, g.subject, g.grade
    FROM grades g
    JOIN students s ON g.student_id = s.id
    WHERE s.name = 'João Silva';
    """
    print(query_database(query2))

    # Test query 3: Invalid query
    print("\n--- Teste 3: Testando uma consulta inválida ---")
    query3 = "SELECT * FROM non_existent_table;"
    print(query_database(query3))
