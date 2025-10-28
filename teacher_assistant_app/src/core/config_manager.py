import configparser
import os

CONFIG_FILE = 'config.ini'

def get_config():
    """Reads the configuration from the config.ini file."""
    config = configparser.ConfigParser()
    if not os.path.exists(CONFIG_FILE):
        create_default_config()
    config.read(CONFIG_FILE)
    return config

def save_config(config):
    """Saves the configuration to the config.ini file."""
    with open(CONFIG_FILE, 'w') as configfile:
        config.write(configfile)

def get_setting(section, key, fallback=None):
    """Gets a specific setting from the config file."""
    config = get_config()
    return config.get(section, key, fallback=fallback)

def create_default_config():
    """Creates a default config.ini file if it doesn't exist."""
    config = configparser.ConfigParser()

    # API Keys Section
    config['API'] = {
        'maritaca_api_key': '',
        'openai_api_key': '',
        'openrouter_api_key': ''
    }

    # Application Settings Section
    config['Settings'] = {
        'theme': 'System',
        'ai_provider': 'Maritaca' # Options: Maritaca, OpenAI
    }

    save_config(config)

# For testing purposes
if __name__ == '__main__':
    print("--- Testando o Config Manager ---")

    # Ensure a clean slate for testing
    if os.path.exists(CONFIG_FILE):
        os.remove(CONFIG_FILE)
        print(f"Arquivo '{CONFIG_FILE}' removido para teste.")

    # Test default config creation
    config = get_config()
    print("\nConfiguração padrão criada:")
    for section in config.sections():
        print(f"[{section}]")
        for key, value in config.items(section):
            print(f"{key} = {value}")

    # Test modifying a setting
    print("\nModificando tema para 'Dark'...")
    config.set('Settings', 'theme', 'Dark')
    save_config(config)

    # Test reading the modified setting
    new_theme = get_setting('Settings', 'theme')
    print(f"Novo tema lido do arquivo: {new_theme}")

    # Clean up the test file
    os.remove(CONFIG_FILE)
    print(f"\nArquivo de teste '{CONFIG_FILE}' removido.")
