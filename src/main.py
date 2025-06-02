import sys
import os # Adicionado os
from PyQt6.QtWidgets import QApplication, QMessageBox # Adicionado QMessageBox
from src.ui.main_window import MainWindow
from src.core.database_manager import DatabaseManager # Agora importamos e usamos

def get_application_base_path():
    """Retorna o caminho base para dados, considerando se está empacotado ou em dev."""
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # Rodando em um bundle PyInstaller (--onedir ou --onefile)
        # Para dados persistentes, o diretório do executável é mais apropriado.
        return os.path.dirname(sys.executable)
    else:
        # Rodando em modo de desenvolvimento
        # main.py está em src/, data/ está na raiz (um nível acima de src/)
        return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def main():
    app = QApplication(sys.argv)

    application_path = get_application_base_path()
    data_dir = os.path.join(application_path, "data")
    db_filename = "agenda.db" # Nome do arquivo do banco de dados
    db_path = os.path.join(data_dir, db_filename)

    print(f"INFO: Caminho base da aplicação: {application_path}") # Para debug
    print(f"INFO: Caminho do diretório de dados esperado: {data_dir}") # Para debug
    print(f"INFO: Caminho completo do banco de dados: {db_path}") # Para debug

    # Garantir que o diretório de dados exista, especialmente para a versão empacotada
    if not os.path.exists(data_dir):
        try:
            os.makedirs(data_dir)
            print(f"INFO: Diretório de dados criado em: {data_dir}")
        except OSError as e:
            QMessageBox.critical(None, "Erro Crítico",
                                 f"Erro ao criar diretório de dados {data_dir}: {e}\n"
                                 "A aplicação pode não funcionar corretamente.")
            # A aplicação provavelmente falhará se não puder criar/acessar o DB.
            # Considerar sair aqui sys.exit(1) se o DB for essencial para iniciar.

    # Inicializar o DatabaseManager com o caminho dinâmico
    # A MainWindow agora espera um db_manager em seu construtor.
    # A lógica de instanciar o db_manager foi movida de MainWindow para cá.
    db_manager = DatabaseManager(database_path=db_path)

    if not db_manager.conn:
        QMessageBox.critical(None, "Erro de Banco de Dados",
                             f"Não foi possível conectar ao banco de dados em:\n{db_path}\n"
                             "Verifique as permissões ou se o caminho é válido.\n"
                             "A aplicação será encerrada.")
        sys.exit(1)


    main_window = MainWindow(db_manager=db_manager) # Passar o db_manager para MainWindow
    main_window.show()

    sys.exit(app.exec())

if __name__ == '__main__':
    main()
