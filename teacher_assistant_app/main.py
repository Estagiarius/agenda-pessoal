import customtkinter as ctk
from src.core import config_manager
from src.core.ai_core import AICore
from src.gui.chat_view import ChatView
from src.gui.dashboard_view import DashboardView
from src.gui.grade_entry_view import GradeEntryView
from src.gui.settings_view import SettingsView

class TeacherAssistantApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.ai_core = AICore()
        self.title("Assistente Pedagógico de IA")
        self.geometry("1100x720")

        # Load and apply theme from config
        initial_theme = config_manager.get_setting('Settings', 'theme', fallback='System')
        ctk.set_appearance_mode(initial_theme)
        ctk.set_default_color_theme("blue")

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # --- Navigation Frame ---
        self.navigation_frame = ctk.CTkFrame(self, width=140, corner_radius=0)
        self.navigation_frame.grid(row=0, column=0, sticky="nsew")

        ctk.CTkLabel(self.navigation_frame, text="Menu", font=ctk.CTkFont(size=15, weight="bold")).grid(row=0, column=0, padx=20, pady=20)

        self.chat_button = ctk.CTkButton(self.navigation_frame, text="Chat", command=lambda: self.show_frame("ChatView"))
        self.chat_button.grid(row=1, column=0, padx=20, pady=10)

        self.dashboard_button = ctk.CTkButton(self.navigation_frame, text="Dashboard", command=lambda: self.show_frame("DashboardView"))
        self.dashboard_button.grid(row=2, column=0, padx=20, pady=10)

        self.grade_entry_button = ctk.CTkButton(self.navigation_frame, text="Lançar Notas", command=lambda: self.show_frame("GradeEntryView"))
        self.grade_entry_button.grid(row=3, column=0, padx=20, pady=10)

        self.settings_button = ctk.CTkButton(self.navigation_frame, text="Configurações", command=lambda: self.show_frame("SettingsView"))
        self.settings_button.grid(row=5, column=0, padx=20, pady=20, sticky="s") # Pushes to the bottom

        # --- Main Content Frame ---
        self.main_frame = ctk.CTkFrame(self, corner_radius=0)
        self.main_frame.grid(row=0, column=1, sticky="nsew")
        self.main_frame.grid_rowconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)

        self.frames = {}

        for F in (ChatView, DashboardView, GradeEntryView, SettingsView):
            page_name = F.__name__
            frame = F(parent=self.main_frame, controller=self)
            self.frames[page_name] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame("ChatView")

    def show_frame(self, page_name):
        frame = self.frames.get(page_name)
        if frame:
            frame.tkraise()

    def reload_ai_core(self):
        self.ai_core = AICore()
        return self.ai_core

def main():
    app = TeacherAssistantApp()
    app.mainloop()

if __name__ == "__main__":
    main()
