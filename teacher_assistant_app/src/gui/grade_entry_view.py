import customtkinter as ctk
from src.core import database_manager

class GradeEntryView(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.student_data = {}  # To map student names to IDs

        # Configure grid layout
        self.grid_columnconfigure(1, weight=1)

        # Title
        title_label = ctk.CTkLabel(self, text="Lançamento de Notas", font=ctk.CTkFont(size=24, weight="bold"))
        title_label.grid(row=0, column=0, columnspan=2, padx=20, pady=20, sticky="ew")

        # Form Frame
        form_frame = ctk.CTkFrame(self)
        form_frame.grid(row=1, column=0, columnspan=2, padx=20, pady=10, sticky="ew")
        form_frame.grid_columnconfigure(1, weight=1)

        # Student Selector
        student_label = ctk.CTkLabel(form_frame, text="Aluno:")
        student_label.grid(row=0, column=0, padx=10, pady=10, sticky="w")
        self.student_menu = ctk.CTkOptionMenu(form_frame, values=[""])
        self.student_menu.grid(row=0, column=1, padx=10, pady=10, sticky="ew")

        # Subject Selector
        subject_label = ctk.CTkLabel(form_frame, text="Matéria:")
        subject_label.grid(row=1, column=0, padx=10, pady=10, sticky="w")
        self.subject_menu = ctk.CTkOptionMenu(form_frame, values=[""])
        self.subject_menu.grid(row=1, column=1, padx=10, pady=10, sticky="ew")

        # Grade Entry
        grade_label = ctk.CTkLabel(form_frame, text="Nota:")
        grade_label.grid(row=2, column=0, padx=10, pady=10, sticky="w")
        self.grade_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 8.5")
        self.grade_entry.grid(row=2, column=1, padx=10, pady=10, sticky="ew")

        # Save Button
        save_button = ctk.CTkButton(self, text="Salvar Nota", command=self.save_grade)
        save_button.grid(row=2, column=0, columnspan=2, padx=20, pady=20)

        # Status Label
        self.status_label = ctk.CTkLabel(self, text="", font=ctk.CTkFont(size=14))
        self.status_label.grid(row=3, column=0, columnspan=2, padx=20, pady=10)

        # Load initial data
        self.load_data()

    def load_data(self):
        """Loads student and subject data into the option menus."""
        # Load students
        students = database_manager.get_all_students()
        if students:
            self.student_data = {name: sid for sid, name in students}
            student_names = list(self.student_data.keys())
            self.student_menu.configure(values=student_names)
            self.student_menu.set(student_names[0])
        else:
            self.student_menu.configure(values=["Nenhum aluno encontrado"])

        # Load subjects
        subjects = database_manager.get_all_subjects()
        if subjects:
            self.subject_menu.configure(values=subjects)
            self.subject_menu.set(subjects[0])
        else:
            self.subject_menu.configure(values=["Nenhuma matéria encontrada"])

    def save_grade(self):
        student_name = self.student_menu.get()
        subject = self.subject_menu.get()
        grade_str = self.grade_entry.get()

        # --- Validation ---
        if not student_name or student_name.startswith("Nenhum"):
            self.status_label.configure(text="Erro: Por favor, selecione um aluno.", text_color="red")
            return

        try:
            grade = float(grade_str)
        except (ValueError, TypeError):
            self.status_label.configure(text="Erro: A nota deve ser um número válido.", text_color="red")
            return

        student_id = self.student_data.get(student_name)
        if not student_id:
            self.status_label.configure(text="Erro: ID do aluno não encontrado.", text_color="red")
            return

        # --- Add to database ---
        success, message = database_manager.add_grade(student_id, subject, grade)

        if success:
            self.status_label.configure(text=message, text_color="green")
            self.grade_entry.delete(0, "end") # Clear entry on success
            # Optionally, we could refresh the dashboard data here
        else:
            self.status_label.configure(text=message, text_color="red")
