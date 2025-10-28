import customtkinter as ctk
from src.core.data_analyzer import (
    get_average_grades_by_class, create_bar_chart_image,
    get_grades_by_subject, create_pie_chart_image
)

class DashboardView(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        title_label = ctk.CTkLabel(self, text="Dashboard Principal", font=ctk.CTkFont(size=24, weight="bold"))
        title_label.grid(row=0, column=0, columnspan=2, padx=20, pady=20, sticky="ew")

        # --- Gráfico 1: Média de Notas por Turma ---
        self.graph_frame_1 = ctk.CTkFrame(self)
        self.graph_frame_1.grid(row=1, column=0, padx=20, pady=10, sticky="nsew")
        self.graph_frame_1.grid_columnconfigure(0, weight=1)
        self.graph_frame_1.grid_rowconfigure(1, weight=1)

        graph_label_1 = ctk.CTkLabel(self.graph_frame_1, text="Média de Notas por Turma", font=ctk.CTkFont(size=16))
        graph_label_1.grid(row=0, column=0, padx=10, pady=10)

        self.chart_label_1 = ctk.CTkLabel(self.graph_frame_1, text="")
        self.chart_label_1.grid(row=1, column=0, padx=10, pady=10, sticky="nsew")
        self.load_chart_1()

        # --- Gráfico 2: Desempenho por Matéria ---
        self.graph_frame_2 = ctk.CTkFrame(self)
        self.graph_frame_2.grid(row=1, column=1, padx=20, pady=10, sticky="nsew")
        self.graph_frame_2.grid_columnconfigure(0, weight=1)
        self.graph_frame_2.grid_rowconfigure(1, weight=1)

        graph_label_2 = ctk.CTkLabel(self.graph_frame_2, text="Média por Matéria", font=ctk.CTkFont(size=16))
        graph_label_2.grid(row=0, column=0, padx=10, pady=10)

        self.chart_label_2 = ctk.CTkLabel(self.graph_frame_2, text="")
        self.chart_label_2.grid(row=1, column=0, padx=10, pady=10, sticky="nsew")
        self.load_chart_2()

        # --- Ações Rápidas (Placeholder) ---
        # ...

    def load_chart_1(self):
        data = get_average_grades_by_class()
        if data is not None and not data.empty:
            img = create_bar_chart_image(data, "", "Turma", "Nota Média")
            if img:
                self.chart_label_1.configure(image=ctk.CTkImage(light_image=img, size=(400, 300)))
        else:
            self.chart_label_1.configure(text="Não há dados.")

    def load_chart_2(self):
        data = get_grades_by_subject()
        if data is not None and not data.empty:
            img = create_pie_chart_image(data, "")
            if img:
                self.chart_label_2.configure(image=ctk.CTkImage(light_image=img, size=(400, 300)))
        else:
            self.chart_label_2.configure(text="Não há dados.")
