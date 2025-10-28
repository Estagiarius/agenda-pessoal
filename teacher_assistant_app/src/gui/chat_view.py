import customtkinter as ctk
from tkinter import filedialog
import os
from src.core.database_manager import get_all_students, get_all_subjects, add_grade
from src.tools.pdf_tool import extract_text_from_pdf

class ChatView(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.history = []
        self.pdf_context = None

        # --- Layout & Widgets ---
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)
        main_frame = ctk.CTkFrame(self)
        main_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        main_frame.grid_rowconfigure(0, weight=1)
        main_frame.grid_columnconfigure(0, weight=1)

        self.chat_history = ctk.CTkTextbox(main_frame, state="disabled", wrap="word")
        self.chat_history.grid(row=0, column=0, columnspan=2, sticky="nsew", padx=5, pady=5)
        self.pdf_status_label = ctk.CTkLabel(main_frame, text="Nenhum PDF carregado.", text_color="gray")
        self.pdf_status_label.grid(row=1, column=0, sticky="w", padx=10)

        input_frame = ctk.CTkFrame(self)
        input_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=10)
        input_frame.grid_columnconfigure(1, weight=1)

        self.load_pdf_button = ctk.CTkButton(input_frame, text="Carregar PDF", width=120, command=self.load_pdf)
        self.load_pdf_button.grid(row=0, column=0, padx=5, pady=5)
        self.user_input = ctk.CTkEntry(input_frame, placeholder_text="Digite sua mensagem...")
        self.user_input.grid(row=0, column=1, sticky="ew", padx=5, pady=5)
        self.user_input.bind("<Return>", lambda event: self.send_message())
        self.send_button = ctk.CTkButton(input_frame, text="Enviar", width=80, command=self.send_message)
        self.send_button.grid(row=0, column=2, padx=5, pady=5)

        self.add_message("Assistente", "Olá! Como posso ajudar?")

    def load_pdf(self):
        filepath = filedialog.askopenfilename(filetypes=(("PDF Files", "*.pdf"),))
        if not filepath: return

        self.pdf_status_label.configure(text="Processando...", text_color="orange")
        self.update_idletasks()

        self.pdf_context = extract_text_from_pdf(filepath)
        filename = os.path.basename(filepath)

        if self.pdf_context.startswith("Erro:"):
            self.pdf_status_label.configure(text=f"Erro: {self.pdf_context}", text_color="red")
        else:
            self.pdf_status_label.configure(text=f"Carregado: {filename}", text_color="green")

    def send_message(self):
        user_message = self.user_input.get()
        if not user_message.strip(): return

        self.add_message("Você", user_message)
        self.user_input.delete(0, "end")

        self.user_input.configure(state="disabled")
        self.send_button.configure(state="disabled")

        # Pass context to AI, which will be implemented in the next step
        ai_response = self.controller.ai_core.get_ai_response(user_message, self.history, self.pdf_context)
        self.add_message("Assistente", ai_response)

        self.user_input.configure(state="normal")
        self.send_button.configure(state="normal")

    def add_message(self, sender, message):
        role = "user" if sender == "Você" else "assistant"
        self.chat_history.configure(state="normal")
        self.chat_history.insert("end", f"{sender}: {message}\n\n")
        self.chat_history.configure(state="disabled")
        self.chat_history.see("end")
        self.history.append({"role": role, "content": message})
