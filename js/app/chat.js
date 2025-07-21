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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.reply || "Ocorreu um erro desconhecido.");
                }

                botMessageElement.innerHTML = marked.parse(data.reply);
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
