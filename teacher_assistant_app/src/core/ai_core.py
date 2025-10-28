import os
from dotenv import load_dotenv
import openai
import json

# Import the tool functions
from src.tools.database_tool import query_database
from src.tools.web_search_tool import search_web

class AICore:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("MARITACA_API_KEY")
        self.api_base = os.getenv("MARITACA_API_BASE")
        self.model = os.getenv("DEFAULT_MODEL", "maritaca-ai/maritaca-llm")

        if not self.api_key:
            raise ValueError("API key not found. Please set MARITACA_API_KEY in your .env file.")

        self.client = openai.OpenAI(api_key=self.api_key, base_url=self.api_base)

        # Define the available tools for the model
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "query_database",
                    "description": "Executa uma consulta SQL no banco de dados da escola para obter informações sobre alunos, notas, etc.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sql_query": {"type": "string", "description": "A consulta SQL a ser executada."}
                        },
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
                        "properties": {
                            "url": {"type": "string", "description": "A URL a ser acessada."}
                        },
                        "required": ["url"],
                    },
                },
            }
        ]

        # Map tool names to actual functions
        self.available_functions = {
            "query_database": query_database,
            "search_web": search_web,
        }

    def get_ai_response(self, user_message, chat_history=None):
        messages = [{"role": "system", "content": "Você é um assistente prestativo. Use as ferramentas disponíveis para responder perguntas."}]
        if chat_history:
            messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        try:
            # First call to see if the model wants to use a tool
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
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

                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": function_response,
                        }
                    )

                # Second call to get the final response
                second_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                )
                return second_response.choices[0].message.content

            # If no tool is called, return the response directly
            return response_message.content

        except Exception as e:
            print(f"An error occurred: {e}")
            return "Desculpe, ocorreu um erro ao processar sua solicitação."

# For testing purposes
if __name__ == '__main__':
    print("--- Executando teste do AICore ---")
    ai = AICore()
    test_response = ai.get_ai_response("Olá! Qual é a capital do Brasil?")
    print(f"Test Response: {test_response}")
