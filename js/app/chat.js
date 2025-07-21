document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatForm) {
        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const message = chatInput.value.trim();

            if (message) {
                appendMessage('user', message);
                chatInput.value = '';
                // Exibir um indicador de "digitando..."
                appendMessage('bot', 'Digitando...');

                // Enviar mensagem para o backend (que será criado a seguir)
                fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                })
                .then(response => response.json())
                .then(data => {
                    // Remover o indicador de "digitando..."
                    const typingIndicator = document.querySelector('.message.bot:last-child');
                    if (typingIndicator && typingIndicator.textContent === 'Digitando...') {
                        typingIndicator.remove();
                    }
                    appendMessage('bot', data.reply);
                })
                .catch(error => {
                    console.error('Erro ao contatar o servidor de chat:', error);
                    // Remover o indicador de "digitando..."
                    const typingIndicator = document.querySelector('.message.bot:last-child');
                    if (typingIndicator && typingIndicator.textContent === 'Digitando...') {
                        typingIndicator.remove();
                    }
                    appendMessage('bot', 'Desculpe, ocorreu um erro. Tente novamente.');
                });
            }
        });
    }

    function appendMessage(sender, text) {
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
});
