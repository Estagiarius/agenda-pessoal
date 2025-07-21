function initChatApp() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const modelSelect = document.getElementById('model-select');

    // Função para adicionar mensagens à interface
    function appendMessage(sender, text) {
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        const senderName = document.createElement('strong');
        senderName.textContent = sender === 'user' ? 'Você' : 'Assistente';

        const messageText = document.createElement('p');
        messageText.textContent = text;

        messageElement.appendChild(senderName);
        messageElement.appendChild(messageText);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Verifica se o formulário de chat existe na view atual
    if (chatForm) {
        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const message = chatInput.value.trim();
            const model = modelSelect.value;

            if (message) {
                appendMessage('user', message);
                chatInput.value = '';
                // Exibir um indicador de "digitando..."
                const typingIndicator = appendMessage('bot', 'Digitando...');

                // Enviar mensagem para o backend
                fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message, model: model }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro na rede: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Remover o indicador de "digitando..."
                    const lastBotMessage = chatMessages.querySelector('.message.bot:last-child');
                    if (lastBotMessage && lastBotMessage.textContent.includes('Digitando...')) {
                        lastBotMessage.remove();
                    }
                    appendMessage('bot', data.reply);
                })
                .catch(error => {
                    console.error('Erro ao contatar o servidor de chat:', error);
                    // Remover o indicador de "digitando..."
                    const lastBotMessage = chatMessages.querySelector('.message.bot:last-child');
                    if (lastBotMessage && lastBotMessage.textContent.includes('Digitando...')) {
                        lastBotMessage.remove();
                    }
                    appendMessage('bot', `Desculpe, ocorreu um erro: ${error.message}. Tente novamente.`);
                });
            }
        });
    }
}

// O DOMContentLoaded é removido para que a inicialização seja controlada pelo router.
