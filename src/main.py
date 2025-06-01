import sys
from PyQt6.QtWidgets import QApplication
from src.ui.main_window import MainWindow
# Importar DatabaseManager e Models pode ser necessário futuramente, mas não para esta etapa.
# from src.core.database_manager import DatabaseManager
# from src.core.models import Event, Task, Entity

def main():
    app = QApplication(sys.argv)

    # Inicializar o DatabaseManager (opcional neste ponto, mas bom para ter em mente)
    # db_manager = DatabaseManager() # Usa o caminho padrão 'data/agenda.db'

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())

if __name__ == '__main__':
    main()
