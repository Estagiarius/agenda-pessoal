import customtkinter as ctk
from src.core.ai_core import AICore
from src.gui.chat_view import ChatView
from src.gui.dashboard_view import DashboardView
from src.gui.grade_entry_view import GradeEntryView

class TeacherAssistantApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.ai_core = AICore()
        self.title("Assistente Pedagógico de IA")
        self.geometry("1100x720")
        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("blue")

        # Configure grid layout (2 columns)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Create navigation frame
        self.navigation_frame = ctk.CTkFrame(self, width=140, corner_radius=0)
        self.navigation_frame.grid(row=0, column=0, sticky="nsew")
        self.navigation_frame.grid_rowconfigure(4, weight=1)

        self.navigation_frame_label = ctk.CTkLabel(self.navigation_frame, text="Menu",
                                                  font=ctk.CTkFont(size=15, weight="bold"))
        self.navigation_frame_label.grid(row=0, column=0, padx=20, pady=20)

        self.chat_button = ctk.CTkButton(self.navigation_frame, text="Chat",
                                         command=lambda: self.show_frame("ChatView"))
        self.chat_button.grid(row=1, column=0, padx=20, pady=10)

        self.dashboard_button = ctk.CTkButton(self.navigation_frame, text="Dashboard",
                                              command=lambda: self.show_frame("DashboardView"))
        self.dashboard_button.grid(row=2, column=0, padx=20, pady=10)

        self.grade_entry_button = ctk.CTkButton(self.navigation_frame, text="Lançar Notas",
                                                command=lambda: self.show_frame("GradeEntryView"))
        self.grade_entry_button.grid(row=3, column=0, padx=20, pady=10)

        # Create main content frame
        self.main_frame = ctk.CTkFrame(self, corner_radius=0)
        self.main_frame.grid(row=0, column=1, sticky="nsew")
        self.main_frame.grid_rowconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)

        self.frames = {}

        # Initialize each view and add it to the frames dictionary
        for F in (ChatView, DashboardView, GradeEntryView):
            page_name = F.__name__
            frame = F(parent=self.main_frame, controller=self)
            self.frames[page_name] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        # Show the initial frame
        self.show_frame("ChatView")

    def show_frame(self, page_name):
        '''Show a frame for the given page name'''
        frame = self.frames.get(page_name)
        if frame:
            frame.tkraise()
        else:
            # Handle non-existent frame, maybe show an error or default frame
            print(f"Frame {page_name} not found.")

def main():
    app = TeacherAssistantApp()
    app.mainloop()

if __name__ == "__main__":
    main()
