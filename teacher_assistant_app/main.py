import customtkinter as ctk
from src.core.ai_core import AICore
from src.gui.chat_view import ChatView

class TeacherAssistantApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Initialize the AI Core
        self.ai_core = AICore()

        # Configure the main window
        self.title("Assistente Pedagógico de IA")
        self.geometry("800x600")
        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("blue")

        # Create main container
        container = ctk.CTkFrame(self)
        container.pack(side="top", fill="both", expand=True)
        container.grid_rowconfigure(0, weight=1)
        container.grid_columnconfigure(0, weight=1)

        # Create and show the Chat View
        # The ChatView will have access to the app instance ('self')
        # and can therefore access self.ai_core
        self.chat_view = ChatView(parent=container, controller=self)
        self.chat_view.grid(row=0, column=0, sticky="nsew")

def main():
    """Main function to run the application."""
    app = TeacherAssistantApp()
    app.mainloop()

if __name__ == "__main__":
    main()
