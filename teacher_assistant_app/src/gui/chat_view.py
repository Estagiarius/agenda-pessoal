import customtkinter as ctk

class ChatView(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        # Chat history display
        self.chat_history = ctk.CTkTextbox(self, state="disabled", wrap="word", font=("Arial", 14))
        self.chat_history.pack(pady=10, padx=10, fill="both", expand=True)

        # Frame for user input
        input_frame = ctk.CTkFrame(self)
        input_frame.pack(pady=10, padx=10, fill="x")

        # User input field
        self.user_input = ctk.CTkEntry(input_frame, placeholder_text="Digite sua mensagem...", font=("Arial", 14))
        self.user_input.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.user_input.bind("<Return>", self.send_message_event)

        # Send button
        self.send_button = ctk.CTkButton(input_frame, text="Enviar", command=self.send_message)
        self.send_button.pack(side="right")

        # Chat history for context
        self.history = []

        # Add a welcome message
        self.add_message("Assistente", "Olá! Como posso ajudar você hoje?")

    def send_message_event(self, event):
        self.send_message()

    def send_message(self):
        user_message = self.user_input.get()
        if not user_message.strip():
            return

        self.add_message("Você", user_message)
        self.user_input.delete(0, "end")

        # Disable input while AI is thinking
        self.user_input.configure(state="disabled")
        self.send_button.configure(state="disabled")

        # Get AI response
        ai_response = self.controller.ai_core.get_ai_response(user_message, self.history)
        self.add_message("Assistente", ai_response)

        # Re-enable input
        self.user_input.configure(state="normal")
        self.send_button.configure(state="normal")

    def add_message(self, sender, message):
        # Determine role for the AI model
        role = "user" if sender == "Você" else "assistant"

        # Add to message log for display
        self.chat_history.configure(state="normal")
        self.chat_history.insert("end", f"{sender}: {message}\n\n")
        self.chat_history.configure(state="disabled")
        self.chat_history.see("end")

        # Add to conversation history for context
        self.history.append({"role": role, "content": message})
