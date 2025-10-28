import customtkinter as ctk
from src.core import config_manager

class SettingsView(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        self.grid_columnconfigure(0, weight=1)
        title_label = ctk.CTkLabel(self, text="Configurações", font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(pady=20)

        # --- General Settings ---
        general_frame = ctk.CTkFrame(self)
        general_frame.pack(pady=10, padx=20, fill="x")
        general_frame.grid_columnconfigure(1, weight=1)
        general_label = ctk.CTkLabel(general_frame, text="Geral", font=ctk.CTkFont(size=16, weight="bold"))
        general_label.grid(row=0, column=0, columnspan=2, pady=(5, 10))

        ctk.CTkLabel(general_frame, text="Provedor de IA:").grid(row=1, column=0, padx=10, pady=10, sticky="w")
        self.provider_menu = ctk.CTkOptionMenu(general_frame, values=["Maritaca", "OpenAI"])
        self.provider_menu.grid(row=1, column=1, padx=10, pady=10, sticky="w")

        ctk.CTkLabel(general_frame, text="Tema:").grid(row=2, column=0, padx=10, pady=10, sticky="w")
        self.theme_menu = ctk.CTkOptionMenu(general_frame, values=["System", "Light", "Dark"], command=self.change_theme)
        self.theme_menu.grid(row=2, column=1, padx=10, pady=10, sticky="w")

        # --- API Keys Frame ---
        api_frame = ctk.CTkFrame(self)
        api_frame.pack(pady=10, padx=20, fill="x")
        api_frame.grid_columnconfigure(1, weight=1)
        api_label = ctk.CTkLabel(api_frame, text="Chaves de API", font=ctk.CTkFont(size=16, weight="bold"))
        api_label.grid(row=0, column=0, columnspan=2, pady=(5, 10))

        ctk.CTkLabel(api_frame, text="Maritaca API Key:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.maritaca_api_key_entry = ctk.CTkEntry(api_frame, width=300, show="*")
        self.maritaca_api_key_entry.grid(row=1, column=1, padx=10, pady=5, sticky="ew")

        ctk.CTkLabel(api_frame, text="OpenAI API Key:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.openai_api_key_entry = ctk.CTkEntry(api_frame, width=300, show="*")
        self.openai_api_key_entry.grid(row=2, column=1, padx=10, pady=5, sticky="ew")

        # --- Save Button & Status ---
        self.save_button = ctk.CTkButton(self, text="Salvar Configurações", command=self.save_settings)
        self.save_button.pack(pady=20)
        self.status_label = ctk.CTkLabel(self, text="")
        self.status_label.pack(pady=10)

        self.load_settings()

    def load_settings(self):
        config = config_manager.get_config()
        self.provider_menu.set(config.get('Settings', 'ai_provider', fallback='Maritaca'))
        self.theme_menu.set(config.get('Settings', 'theme', fallback='System'))
        self.maritaca_api_key_entry.insert(0, config.get('API', 'maritaca_api_key', fallback=''))
        self.openai_api_key_entry.insert(0, config.get('API', 'openai_api_key', fallback=''))

    def save_settings(self):
        config = config_manager.get_config()
        config.set('Settings', 'ai_provider', self.provider_menu.get())
        config.set('Settings', 'theme', self.theme_menu.get())
        config.set('API', 'maritaca_api_key', self.maritaca_api_key_entry.get())
        config.set('API', 'openai_api_key', self.openai_api_key_entry.get())

        config_manager.save_config(config)
        self.status_label.configure(text="Configurações salvas com sucesso!", text_color="green")
        self.controller.reload_ai_core()

    def change_theme(self, new_theme: str):
        ctk.set_appearance_mode(new_theme)
