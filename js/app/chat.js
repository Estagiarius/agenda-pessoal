function initChatApp() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const modelSelect = document.getElementById('model-select');

    function appendMessage(sender, text = '') {
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        const senderName = document.createElement('strong');
        senderName.textContent = sender === 'user' ? 'Você' : 'Assistente';

        const messageText = document.createElement('div'); // Mudar para div para renderizar HTML
        messageText.innerHTML = text; // Usar innerHTML para Markdown

        messageElement.appendChild(senderName);
        messageElement.appendChild(messageText);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageText; // Retorna o elemento de texto para atualização
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const message = chatInput.value.trim();
            const model = modelSelect.value;

            if (!message) return;

            appendMessage('user', message);
            chatInput.value = '';

            const botMessageElement = appendMessage('bot', '<span class="typing-indicator"></span>');

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message, model: model }),
                });

                if (!response.body) {
                    throw new Error("A resposta não contém um corpo para streaming.");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullResponse = '';

                botMessageElement.innerHTML = ''; // Limpa o indicador de "digitando"

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Processar múltiplos eventos em um único chunk
                    const lines = chunk.split('\n\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonData = line.substring(6);
                            try {
                                const parsedData = JSON.parse(jsonData);
                                if (parsedData.error) {
                                    throw new Error(parsedData.error);
                                }
                                if (parsedData.answer) {
                                    fullResponse += parsedData.answer;
                                    botMessageElement.innerHTML = marked.parse(fullResponse);
                                }
                            } catch (e) {
                                // Ignora chunks que não são JSONs válidos, como o [DONE]
                                // console.warn("Chunk ignorado por não ser um JSON válido:", jsonData);
                            }
                        }
                    }
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                // Renderização final para garantir que tudo está correto
                botMessageElement.innerHTML = marked.parse(fullResponse);
                chatMessages.scrollTop = chatMessages.scrollHeight;

            } catch (error) {
                console.error('Erro ao contatar o servidor de chat:', error);
                botMessageElement.innerHTML = `Desculpe, ocorreu um erro: ${error.message}. Tente novamente.`;
            }
        });
    }
}

// Adiciona um pouco de CSS para o indicador de "digitando"
const style = document.createElement('style');
style.innerHTML = `
.typing-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  animation: typing 1s infinite;
}
.typing-indicator:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typing {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
`;
document.head.appendChild(style);
