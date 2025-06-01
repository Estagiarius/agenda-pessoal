import sys
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QCalendarWidget, QListWidget,
    QListWidgetItem, QTextEdit, QLabel, QSplitter, QPushButton, QMessageBox,
    QSpacerItem, QSizePolicy
)
from PyQt6.QtCore import Qt, QDate
from PyQt6.QtGui import QFont
from datetime import date, datetime
from typing import Optional

from src.core.database_manager import DatabaseManager
from src.core.models import Event
from src.ui.event_dialog import EventDialog

class AgendaView(QWidget):
    def __init__(self, db_manager: DatabaseManager, parent=None):
        super().__init__(parent)
        self.db_manager = db_manager
        self.current_selected_event_id: Optional[int] = None

        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10) # Adicionar algumas margens
        main_layout.setSpacing(10) # Adicionar espaçamento

        # --- Lado Esquerdo: Calendário e Lista de Eventos ---
        left_layout_widget = QWidget()
        left_v_layout = QVBoxLayout(left_layout_widget) # Renomeado para clareza
        left_v_layout.setContentsMargins(0,0,0,0)
        left_v_layout.setSpacing(10)

        self.calendar = QCalendarWidget()
        self.calendar.setGridVisible(True)
        self.calendar.selectionChanged.connect(self._on_date_selected)
        left_v_layout.addWidget(self.calendar)

        # Botões de Ação para Eventos
        action_buttons_layout = QHBoxLayout()
        self.add_event_button = QPushButton("Adicionar Evento")
        self.add_event_button.clicked.connect(self._add_event_dialog)
        action_buttons_layout.addWidget(self.add_event_button)

        self.edit_event_button = QPushButton("Editar Evento")
        self.edit_event_button.clicked.connect(self._edit_event_dialog)
        self.edit_event_button.setEnabled(False) # Desabilitado até um evento ser selecionado
        action_buttons_layout.addWidget(self.edit_event_button)

        self.delete_event_button = QPushButton("Excluir Evento")
        self.delete_event_button.clicked.connect(self._delete_event)
        self.delete_event_button.setEnabled(False) # Desabilitado
        action_buttons_layout.addWidget(self.delete_event_button)

        left_v_layout.addLayout(action_buttons_layout)

        self.events_list = QListWidget()
        self.events_list.currentItemChanged.connect(self._on_event_selected)
        self.events_list.setStyleSheet("QListWidget::item { padding: 5px; }")
        left_v_layout.addWidget(self.events_list)

        # --- Lado Direito: Detalhes do Evento ---
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        right_layout.setContentsMargins(0,0,0,0)

        details_label = QLabel("Detalhes do Evento")
        details_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        right_layout.addWidget(details_label)

        self.event_details_area = QTextEdit()
        self.event_details_area.setReadOnly(True)
        self.event_details_area.setFont(QFont("Arial", 12))
        self.event_details_area.setStyleSheet("QTextEdit { border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9; }")
        right_layout.addWidget(self.event_details_area)

        # --- Splitter para redimensionamento ---
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(left_layout_widget)
        # splitter.addWidget(self.event_details_area) # Agora o painel direito é um widget
        splitter.addWidget(right_widget)
        splitter.setSizes([350, 650]) # Tamanhos iniciais para as seções

        main_layout.addWidget(splitter)

        # Carregar eventos para a data atual ao iniciar e configurar placeholder
        self.event_details_area.setPlaceholderText("Selecione uma data no calendário e um evento na lista para ver os detalhes, ou adicione um novo evento.")
        self._on_date_selected()

    def _refresh_event_list_for_selected_date(self):
        """Atualiza a lista de eventos para a data atualmente selecionada no calendário."""
        selected_qdate = self.calendar.selectedDate()
        selected_date = selected_qdate.toPyDate()

        self.events_list.clear()
        # Não limpa os detalhes aqui, pois pode ser chamado após uma edição/deleção
        # e queremos manter o contexto ou limpá-lo seletivamente.

        events = self.db_manager.get_events_by_date(selected_date)

        if not events:
            item = QListWidgetItem("Nenhum evento para esta data.")
            item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsSelectable)
            self.events_list.addItem(item)
            self.current_selected_event_id = None # Nenhum evento para selecionar
            self.edit_event_button.setEnabled(False)
            self.delete_event_button.setEnabled(False)
            self.event_details_area.clear() # Limpa detalhes se não há eventos
            self.event_details_area.setPlaceholderText("Nenhum evento para esta data. Adicione um novo evento ou selecione outra data.")
        else:
            for event_idx, event_obj in enumerate(events): # Renomeado para evitar conflito com models.Event
                if event_obj.start_time:
                    display_text = f"{event_obj.start_time.strftime('%H:%M')} - {event_obj.title}"
                else:
                    display_text = f"Horário Indef. - {event_obj.title}"

                item = QListWidgetItem(display_text)
                item.setData(Qt.ItemDataRole.UserRole, event_obj.id)
                self.events_list.addItem(item)

            # Tentar manter o evento selecionado se ainda existir, ou selecionar o primeiro
            if self.current_selected_event_id:
                items = self.events_list.findItems(str(self.current_selected_event_id), Qt.MatchFlag.MatchExactly) # Isso não vai funcionar, ID está em UserRole
                # Precisamos iterar para encontrar pelo ID
                found_item_to_select = None
                for i in range(self.events_list.count()):
                    list_item = self.events_list.item(i)
                    if list_item and list_item.data(Qt.ItemDataRole.UserRole) == self.current_selected_event_id:
                        found_item_to_select = list_item
                        break
                if found_item_to_select:
                    self.events_list.setCurrentItem(found_item_to_select)
                else: # O evento selecionado anteriormente não está mais na lista (ex: mudou de data)
                    self.current_selected_event_id = None
                    self.events_list.setCurrentRow(0) # Seleciona o primeiro por padrão
            elif self.events_list.count() > 0 : # Se não havia seleção prévia, seleciona o primeiro
                 self.events_list.setCurrentRow(0)


    def _on_date_selected(self):
        """Chamado quando a data no calendário é alterada."""
        self.current_selected_event_id = None # Reseta a seleção de evento ao mudar de data
        self.event_details_area.clear() # Limpa os detalhes ao mudar de data
        self._refresh_event_list_for_selected_date()
        # A seleção do primeiro item na lista (se houver) será tratada por _refresh_event_list...
        # que então chamará _on_event_selected.

    def _on_event_selected(self, current_item: Optional[QListWidgetItem], previous_item: Optional[QListWidgetItem]):
        self.event_details_area.clear()
        if not current_item or current_item.data(Qt.ItemDataRole.UserRole) is None:
            self.current_selected_event_id = None
            self.edit_event_button.setEnabled(False)
            self.delete_event_button.setEnabled(False)
            self.event_details_area.setPlaceholderText("Selecione um evento para ver os detalhes.")
            return

        self.current_selected_event_id = current_item.data(Qt.ItemDataRole.UserRole)

        if self.current_selected_event_id is None: # Checagem adicional
            self.edit_event_button.setEnabled(False)
            self.delete_event_button.setEnabled(False)
            return

        event_obj = self.db_manager.get_event_by_id(self.current_selected_event_id)
        self.edit_event_button.setEnabled(True)
        self.delete_event_button.setEnabled(True)

        if event_obj:
            details_html = f"<h3>{event_obj.title}</h3>"
            details_html += f"<p><strong>Tipo:</strong> {event.event_type}</p>"

            if event.start_time:
                details_html += f"<p><strong>Início:</strong> {event.start_time.strftime('%d/%m/%Y %H:%M')}</p>"
            if event.end_time:
                details_html += f"<p><strong>Fim:</strong> {event.end_time.strftime('%d/%m/%Y %H:%M')}</p>"

            if event.description:
                details_html += f"<p><strong>Descrição:</strong><br>{event.description.replace(chr(10), '<br>')}</p>" # chr(10) é \n

            if event.location:
                details_html += f"<p><strong>Local:</strong> {event.location}</p>"

            if event.recurrence_rule:
                details_html += f"<p><strong>Recorrência:</strong> {event.recurrence_rule}</p>"

            # Informações de auditoria (opcional na UI principal, mas útil para debug)
            # if event.created_at:
            #     details_html += f"<p><small>Criado em: {event.created_at.strftime('%d/%m/%Y %H:%M')}</small></p>"
            # if event.updated_at:
            #     details_html += f"<p><small>Atualizado em: {event.updated_at.strftime('%d/%m/%Y %H:%M')}</small></p>"

            self.event_details_area.setHtml(details_html)
        else:
            self.event_details_area.setPlaceholderText(f"Detalhes do evento com ID {event_id} não encontrados.")

# Bloco para teste independente da AgendaView (opcional)
if __name__ == '__main__':
    from PyQt6.QtWidgets import QApplication

    # Primeiro, certifique-se de que o banco de dados e as tabelas existem,
    # e que há dados de exemplo.
    # O if __name__ == '__main__' em database_manager.py pode cuidar disso se executado.
    # python src/core/database_manager.py

    app = QApplication(sys.argv)

    # Crie uma instância do DatabaseManager
    # O DatabaseManager tentará criar o db e as tabelas se não existirem
    # e também adicionará um evento de exemplo para o dia atual.
    db_manager_instance = DatabaseManager(db_path='data/agenda.db')

    if not db_manager_instance.conn:
        print("Falha ao conectar ao banco de dados. A AgendaView pode não funcionar corretamente.")
        # Você pode querer sair ou mostrar uma mensagem de erro aqui
    else:
        # Para garantir que o evento de exemplo seja adicionado se o DB acabou de ser criado:
        # (O construtor do DBManager já chama _create_tables, mas add_sample_event é no if __name__ main)
        # Se o database_manager.py não foi executado separadamente, chame explicitamente:
        # db_manager_instance.add_sample_event() # Comentado pois o __main__ do DBManager já faz isso
        pass


    agenda_widget = AgendaView(db_manager_instance)

    # Para testar, crie uma janela simples para hospedar a AgendaView
    test_window = QWidget()
    test_layout = QVBoxLayout(test_window)
    test_layout.addWidget(agenda_widget)
    test_window.setWindowTitle("Teste da AgendaView")
    test_window.setGeometry(100, 100, 900, 700)
    test_window.show()

    exit_code = app.exec()

    # Fechar a conexão com o banco de dados ao sair
    if db_manager_instance.conn:
        db_manager_instance.close()
        print("Conexão com o DB fechada após o teste da AgendaView.")

    sys.exit(exit_code)
