import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image

def get_average_grades_by_class():
    """
    Fetches student grades from the database and calculates the average grade for each class.

    Returns:
        pandas.DataFrame: A DataFrame with 'class' as the index and 'grade' as the column
                          containing the average grade. Returns None on error.
    """
    try:
        conn = sqlite3.connect('data/school.db')
        query = """
        SELECT s.class, g.grade
        FROM grades g
        JOIN students s ON g.student_id = s.id;
        """
        df = pd.read_sql_query(query, conn)
        conn.close()

        # Group by class and calculate the mean grade
        avg_grades = df.groupby('class')['grade'].mean().sort_values(ascending=False)
        return avg_grades.to_frame()

    except Exception as e:
        print(f"Error fetching or processing grade data: {e}")
        return None

def get_grades_by_subject():
    """
    Fetches grades from the database and calculates the average grade for each subject.

    Returns:
        pandas.DataFrame: A DataFrame with 'subject' as the index and 'grade' as the column.
    """
    try:
        conn = sqlite3.connect('data/school.db')
        query = "SELECT subject, grade FROM grades;"
        df = pd.read_sql_query(query, conn)
        conn.close()

        avg_grades = df.groupby('subject')['grade'].mean().sort_values(ascending=False)
        return avg_grades.to_frame()

    except Exception as e:
        print(f"Error fetching grade data by subject: {e}")
        return None

def create_bar_chart_image(data, title, xlabel, ylabel):
    """
    Creates a bar chart from the given data and returns it as a PIL Image.

    Args:
        data (pandas.DataFrame): The data to plot.
        title (str): The title of the chart.
        xlabel (str): The label for the x-axis.
        ylabel (str): The label for the y-axis.

    Returns:
        PIL.Image: The chart as an image object, or None on error.
    """
    if data is None or data.empty:
        return None

    try:
        fig, ax = plt.subplots(figsize=(5, 4))
        data.plot(kind='bar', ax=ax, legend=False)
        ax.set_title(title)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.tick_params(axis='x', rotation=45)
        plt.tight_layout()

        # Save plot to a memory buffer
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)

        return Image.open(buf)

    except Exception as e:
        print(f"Error creating chart image: {e}")
        return None

def create_pie_chart_image(data, title):
    """
    Creates a pie chart from the given data and returns it as a PIL Image.
    """
    if data is None or data.empty:
        return None

    try:
        fig, ax = plt.subplots(figsize=(5, 4))
        data.plot(kind='pie', y=data.columns[0], ax=ax, autopct='%1.1f%%', legend=False)
        ax.set_title(title)
        ax.set_ylabel('') # Hide the y-label for pie charts
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)

        return Image.open(buf)

    except Exception as e:
        print(f"Error creating pie chart image: {e}")
        return None

# Example for testing
if __name__ == '__main__':
    # Test bar chart
    avg_grades_data = get_average_grades_by_class()
    if avg_grades_data is not None:
        print("--- Dados de Média de Notas por Turma ---")
        print(avg_grades_data)
        chart_img = create_bar_chart_image(avg_grades_data, "Média de Notas por Turma", "Turma", "Nota Média")
        if chart_img:
            chart_img.save("test_bar_chart.png")
            print("Gráfico de barras salvo como test_bar_chart.png")

    # Test pie chart
    subject_grades_data = get_grades_by_subject()
    if subject_grades_data is not None:
        print("\n--- Dados de Média de Notas por Matéria ---")
        print(subject_grades_data)
        pie_chart_img = create_pie_chart_image(subject_grades_data, "Média por Matéria")
        if pie_chart_img:
            pie_chart_img.save("test_pie_chart.png")
            print("Gráfico de pizza salvo como test_pie_chart.png")
