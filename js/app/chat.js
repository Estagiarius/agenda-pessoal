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

        const messageText = document.createElement('div');
        messageText.innerHTML = text;

        messageElement.appendChild(senderName);
        messageElement.appendChild(messageText);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageText;
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const message = chatInput.value.trim();
            const model = modelSelect.value;

            if (!message) return;

            appendMessage('user', marked.parse(message));
            chatInput.value = '';

            const botMessageElement = appendMessage('bot', '<span class="typing-indicator"></span>');

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message, model: model }),
                });

                if (!response.body) throw new Error("A resposta não contém um corpo para streaming.");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let fullResponse = '';

                botMessageElement.innerHTML = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    let boundary = buffer.indexOf('\n\n');
                    while (boundary !== -1) {
                        const message = buffer.substring(0, boundary);
                        buffer = buffer.substring(boundary + 2);

                        if (message.startsWith('data: ')) {
                            const jsonData = message.substring(6);
                            if (jsonData.trim() === '[DONE]') {
                                continue;
                            }
                            try {
                                const parsedData = JSON.parse(jsonData);
                                if (parsedData.error) throw new Error(parsedData.error);

                                if (parsedData.answer) {
                                    fullResponse += parsedData.answer;
                                    botMessageElement.innerHTML = marked.parse(fullResponse);
                                }
                            } catch (e) {
                                console.warn("Erro ao fazer parse do JSON, pode ser um objeto incompleto. Buffer:", jsonData);
                            }
                        }
                        boundary = buffer.indexOf('\n\n');
                    }
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                botMessageElement.innerHTML = marked.parse(fullResponse);
                chatMessages.scrollTop = chatMessages.scrollHeight;

            } catch (error) {
                console.error('Erro ao contatar o servidor de chat:', error);
                botMessageElement.innerHTML = `Desculpe, ocorreu um erro: ${error.message}. Tente novamente.`;
            }
        });
    }
}

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
