/**
 * IBATÍN Asistente Virtual
 * Chatbot conectado al backend proxy (API key segura)
 */

(function() {
    // Configuración - Solo la URL del backend, sin API keys expuestas
    const CONFIG = {
        backendUrl: 'http://localhost:3001/api'
    };

    // Determinar la ruta base según la ubicación del archivo HTML
    const isSubfolder = window.location.pathname.includes('/seccion') || 
                        window.location.pathname.includes('/bitacora') || 
                        window.location.pathname.includes('/participa') || 
                        window.location.pathname.includes('/proyectos');
    const basePath = isSubfolder ? '../assets/' : 'assets/';

    // Estado del chat
    let threadId = null;
    let isOpen = false;
    let isLoading = false;

    // Crear el HTML del chatbot
    function createChatbotHTML() {
        const chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'ibatin-chatbot';
        chatbotContainer.innerHTML = `
            <!-- Botón flotante -->
            <button id="chatbot-toggle" class="fixed bottom-6 right-6 z-[9999] group" title="¿Necesitás ayuda?">
                <img src="${basePath}ibotin.png" alt="iBotin - Asistente IBATÍN" 
                     class="w-20 h-20 rounded-full shadow-2xl border-4 border-white object-cover chatbot-bounce"/>
                <div class="chatbot-bubble absolute bottom-24 right-0 bg-white px-5 py-3 rounded-2xl shadow-lg border border-slate-200 whitespace-nowrap">
                    <p class="text-slate-700 text-base font-medium">¡Hola! Soy <strong class="text-primary-dark">iBotin</strong> 👋</p>
                    <p class="text-slate-500 text-sm">¿Te puedo ayudar?</p>
                </div>
            </button>

            <!-- Ventana del chat -->
            <div id="chatbot-window" class="fixed bottom-28 right-6 z-[9998] w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-0 opacity-0 origin-bottom-right transition-all duration-300">
                <!-- Header -->
                <div class="bg-primary-darker p-4 flex items-center gap-3">
                    <img src="${basePath}ibotin.png" alt="iBotin" class="w-12 h-12 rounded-full border-2 border-white object-cover"/>
                    <div class="flex-1">
                        <h3 class="text-white font-bold">iBotin</h3>
                        <p class="text-white/70 text-xs">Asistente virtual de IBATÍN</p>
                    </div>
                    <button id="chatbot-close" class="text-white/70 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Mensajes -->
                <div id="chatbot-messages" class="h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-50">
                    <!-- Mensaje de bienvenida -->
                    <div class="flex gap-3">
                        <img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100">
                            <p class="text-slate-700 text-sm">¡Hola! 👋 Soy <strong>iBotin</strong>, el asistente virtual de <strong>Fundación IBATÍN</strong>. Estoy aquí para ayudarte con información sobre nuestros proyectos, áreas estratégicas y cómo podés participar. ¿En qué puedo ayudarte?</p>
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="p-4 border-t border-slate-200 bg-white">
                    <form id="chatbot-form" class="flex gap-2">
                        <input type="text" id="chatbot-input" 
                               placeholder="Escribí tu mensaje..." 
                               class="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm text-slate-800 focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary/20"
                               autocomplete="off"/>
                        <button type="submit" id="chatbot-send" 
                                class="bg-primary-dark text-white p-2 rounded-full hover:bg-primary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                    <p class="text-xs text-slate-400 text-center mt-2">Powered by OpenAI</p>
                </div>
            </div>
        `;
        document.body.appendChild(chatbotContainer);
    }

    // Añadir estilos
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Animación bounce para iBotin */
            .chatbot-bounce {
                animation: chatbotBounce 2s ease-in-out infinite;
            }
            @keyframes chatbotBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            
            /* Burbuja de mensaje */
            .chatbot-bubble {
                animation: chatbotFadeIn 0.5s ease-out forwards, chatbotFloat 3s ease-in-out infinite 0.5s;
                opacity: 0;
            }
            .chatbot-bubble::after {
                content: '';
                position: absolute;
                bottom: -8px;
                right: 30px;
                border-width: 8px;
                border-style: solid;
                border-color: white transparent transparent transparent;
            }
            @keyframes chatbotFadeIn {
                0% { opacity: 0; transform: translateY(10px) scale(0.9); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes chatbotFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }
            
            #chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }
            #chatbot-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            #chatbot-messages::-webkit-scrollbar-thumb {
                background: #9ca87a;
                border-radius: 3px;
            }
            #chatbot-messages::-webkit-scrollbar-thumb:hover {
                background: #7b8c5e;
            }
            .chatbot-typing {
                display: flex;
                gap: 4px;
                padding: 8px 12px;
            }
            .chatbot-typing span {
                width: 8px;
                height: 8px;
                background: #9ca87a;
                border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out both;
            }
            .chatbot-typing span:nth-child(1) { animation-delay: -0.32s; }
            .chatbot-typing span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Toggle del chat
    function toggleChat() {
        const chatWindow = document.getElementById('chatbot-window');
        const bubble = document.querySelector('.chatbot-bubble');
        const botImg = document.querySelector('#chatbot-toggle img');
        
        isOpen = !isOpen;
        
        if (isOpen) {
            chatWindow.classList.remove('scale-0', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
            if (bubble) bubble.style.display = 'none';
            if (botImg) botImg.classList.remove('chatbot-bounce');
            document.getElementById('chatbot-input').focus();
        } else {
            chatWindow.classList.remove('scale-100', 'opacity-100');
            chatWindow.classList.add('scale-0', 'opacity-0');
            if (bubble) bubble.style.display = 'block';
            if (botImg) botImg.classList.add('chatbot-bounce');
        }
    }

    // Crear thread a través del backend
    async function createThread() {
        try {
            const response = await fetch(`${CONFIG.backendUrl}/thread`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            threadId = data.id;
            return threadId;
        } catch (error) {
            console.error('Error creating thread:', error);
            return null;
        }
    }

    // Enviar mensaje a través del backend
    async function sendMessage(message) {
        if (!threadId) {
            await createThread();
        }

        if (!threadId) {
            return 'Lo siento, hubo un error de conexión. Por favor, intentá de nuevo más tarde.';
        }

        try {
            const response = await fetch(`${CONFIG.backendUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: threadId,
                    message: message
                })
            });

            const data = await response.json();
            return data.response || 'Lo siento, no pude procesar tu mensaje.';

        } catch (error) {
            console.error('Error sending message:', error);
            return 'Hubo un error al conectar con el asistente. Por favor, intentá de nuevo.';
        }
    }

    // Añadir mensaje al chat UI
    function addMessageToUI(message, isUser = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="bg-primary-dark text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                    <p class="text-sm">${escapeHtml(message)}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100">
                    <p class="text-slate-700 text-sm">${formatMessage(message)}</p>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Mostrar indicador de escritura
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex gap-3';
        typingDiv.innerHTML = `
            <img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
            <div class="bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100 chatbot-typing">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Ocultar indicador de escritura
    function hideTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    // Escapar HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Formatear mensaje con markdown básico
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*?)(?=\n|$)/g, '• $1<br>');
    }

    // Manejar envío del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const message = input.value.trim();
        
        if (!message || isLoading) return;
        
        isLoading = true;
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        
        addMessageToUI(message, true);
        showTypingIndicator();
        
        const response = await sendMessage(message);
        
        hideTypingIndicator();
        addMessageToUI(response, false);
        
        isLoading = false;
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    // Inicializar
    function init() {
        createChatbotHTML();
        addStyles();
        
        // Event listeners
        document.getElementById('chatbot-toggle').addEventListener('click', toggleChat);
        document.getElementById('chatbot-close').addEventListener('click', toggleChat);
        document.getElementById('chatbot-form').addEventListener('submit', handleSubmit);
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
