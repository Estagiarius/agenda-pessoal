import openai
import json
from src.core import config_manager
from src.tools.database_tool import query_database
from src.tools.web_search_tool import search_web

class AICore:
    def __init__(self):
        provider = config_manager.get_setting('Settings', 'ai_provider', fallback='Maritaca')

        if provider == 'OpenAI':
            self.api_key = config_manager.get_setting('API', 'openai_api_key')
            self.api_base = "https://api.openai.com/v1"
            self.model = "gpt-3.5-turbo"
        else: # Default to Maritaca
            self.api_key = config_manager.get_setting('API', 'maritaca_api_key')
            self.api_base = "https://chat.maritaca.ai/api/v1"
            self.model = "maritaca-ai/maritaca-llm"

        self.client = openai.OpenAI(api_key=self.api_key, base_url=self.api_base)

        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "query_database",
                    "description": "Executa uma consulta SQL no banco de dados da escola para obter informações sobre alunos, notas, etc.",
                    "parameters": {
                        "type": "object",
                        "properties": {"sql_query": {"type": "string"}},
                        "required": ["sql_query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "search_web",
                    "description": "Busca o conteúdo de uma URL na internet para obter informações atualizadas.",
                    "parameters": {
                        "type": "object",
                        "properties": {"url": {"type": "string"}},
                        "required": ["url"],
                    },
                },
            }
        ]

        self.available_functions = {
            "query_database": query_database,
            "search_web": search_web,
        }

    def get_ai_response(self, user_message, chat_history=None, pdf_context=None):
        if not self.api_key:
             return "Erro: A chave da API para o provedor selecionado não está configurada."

        if pdf_context:
            final_user_message = (
                "Com base no seguinte documento, responda à pergunta abaixo.\n\n"
                f"--- DOCUMENTO ---\n{pdf_context}\n--- FIM DO DOCUMENTO ---\n\n"
                f"Pergunta: {user_message}"
            )
        else:
            final_user_message = user_message

        messages = [{"role": "system", "content": "Você é um assistente prestativo."}]
        if chat_history:
            # Exclude the last message to avoid duplicating the user's latest query
            messages.extend(chat_history[:-1])
        messages.append({"role": "user", "content": final_user_message})

        try:
            # When a PDF is loaded, we focus the AI on the document and disable tool usage.
            if pdf_context:
                response = self.client.chat.completions.create(model=self.model, messages=messages)
                return response.choices[0].message.content

            # Standard tool-using logic
            response = self.client.chat.completions.create(
                model=self.model, messages=messages, tools=self.tools, tool_choice="auto"
            )
            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            if tool_calls:
                messages.append(response_message)
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_to_call = self.available_functions[function_name]
                    function_args = json.loads(tool_call.function.arguments)
                    function_response = function_to_call(**function_args)
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": function_response,
                    })

                second_response = self.client.chat.completions.create(model=self.model, messages=messages)
                return second_response.choices[0].message.content

            return response_message.content
        except openai.APIError as e:
            if e.code == 'invalid_api_key':
                return "Erro de Autenticação: A chave da API é inválida."
            return f"Erro da API: {e}"
        except Exception as e:
            return f"Desculpe, ocorreu um erro inesperado: {e}"
