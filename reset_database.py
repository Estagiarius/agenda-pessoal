import os

DATABASE_FILE = "app_database.db"

def reset_database():
    """
    Exclui o arquivo de banco de dados existente para forçar a recriação
    com o esquema mais recente na próxima inicialização da aplicação.
    """
    if os.path.exists(DATABASE_FILE):
        try:
            os.remove(DATABASE_FILE)
            print(f"O arquivo de banco de dados '{DATABASE_FILE}' foi excluído com sucesso.")
            print("Execute 'python3 launch.py' novamente para criar um novo banco de dados com o esquema atualizado.")
        except OSError as e:
            print(f"Erro ao excluir o arquivo de banco de dados: {e}")
    else:
        print("Nenhum arquivo de banco de dados existente encontrado para excluir.")

if __name__ == '__main__':
    print("Este script irá apagar o banco de dados atual. Isso resultará na perda de todos os dados existentes.")
    confirm = input("Você tem certeza que deseja continuar? (s/n): ")
    if confirm.lower() == 's':
        reset_database()
    else:
        print("Operação cancelada.")
