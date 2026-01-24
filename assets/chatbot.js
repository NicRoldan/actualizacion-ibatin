/**
 * IBATÍN Asistente Virtual - iBotin
 * Chatbot con respuestas inteligentes (funciona sin servidor)
 */

(function() {
    const isSubfolder = window.location.pathname.includes('/seccion') || 
                        window.location.pathname.includes('/bitacora') || 
                        window.location.pathname.includes('/participa') || 
                        window.location.pathname.includes('/proyectos');
    const basePath = isSubfolder ? '../assets/' : 'assets/';

    let isOpen = false;
    let isLoading = false;

    // Base de conocimiento de IBATÍN
    const knowledge = {
        fundacion: {
            keywords: ['ibatín', 'ibatin', 'fundación', 'fundacion', 'quienes son', 'quiénes son', 'qué es', 'que es', 'sobre', 'acerca'],
            response: `**Fundación IBATÍN** es un espacio de trabajo multidisciplinario conformado por ciudadanas y ciudadanos que creen en la capacidad de transformación de los territorios.\n\nNuestro lema es **"Mutar en vez de migrar"** y trabajamos articulando ideas, datos, proyectos y voluntades para transformar el Área Metropolitana de Tucumán (AMeT).\n\n¿Te gustaría saber más sobre nuestros proyectos o cómo participar?`
        },
        amet: {
            keywords: ['amet', 'área metropolitana', 'area metropolitana', 'gran tucuman', 'gran tucumán', 'metropolitano', 'territorio'],
            response: `El **Área Metropolitana de Tucumán (AMeT)** es el conglomerado urbano más grande del NOA, compuesto por:\n\n• 7 municipios\n• 19 comunas\n• Más de 1 millón de habitantes\n\nIncluye San Miguel de Tucumán, Yerba Buena, Tafí Viejo, Las Talitas, Banda del Río Salí, Alderetes y otras localidades.`
        },
        proyectos: {
            keywords: ['proyectos', 'proyecto', 'iniciativas', 'trabajos', 'hacen', 'actividades'],
            response: `Nuestros proyectos se organizan en **6 áreas estratégicas**:\n\n🌿 **Medio Ambiente** - Espacios verdes y sustentabilidad\n🏙️ **Desarrollo Urbano** - Planificación territorial\n🚌 **Movilidad Sostenible** - Transporte integrado\n🏛️ **Gobernanza Metropolitana** - Coordinación institucional\n💻 **Ciudades Inteligentes** - Tecnología y datos\n🎒 **Turismo Sostenible** - Desarrollo turístico\n\n¿Sobre cuál área te gustaría saber más?`
        },
        participar: {
            keywords: ['participar', 'participa', 'sumar', 'unir', 'colaborar', 'voluntario', 'voluntariado', 'ayudar', 'contribuir', 'cómo puedo', 'como puedo'],
            response: `¡Excelente que quieras participar! 🙌\n\nHay varias formas de sumarte:\n\n• **Foro Ciudadano** - Participá en debates y propuestas\n• **Talleres** - Asistí a nuestras actividades formativas\n• **Voluntariado** - Sumate al equipo de trabajo\n• **Concursos** - Presentá tus ideas metropolitanas\n\nPodés visitar la sección **"Participá"** en nuestra web.`
        },
        concurso: {
            keywords: ['concurso', 'ideas', 'competencia', 'premio', 'premios', 'ganadores', 'convocatoria'],
            response: `El **Concurso de Ideas Metropolitanas** convoca a jóvenes de 18 a 35 años a presentar propuestas para transformar el AMeT.\n\n**Premios:**\n🥇 1er puesto: $1.500.000 + viaje a Medellín + mentoría\n🏅 Menciones por área: $250.000 + mentoría\n\nEn la última edición participaron más de **300 personas** con **142 propuestas**.`
        },
        contacto: {
            keywords: ['contacto', 'contactar', 'email', 'mail', 'redes', 'instagram', 'escribir'],
            response: `Podés contactarnos a través de:\n\n📧 **Email:** concursoibatin@gmail.com\n📱 **Instagram:** @ibatinorg\n🌐 **Web:** Sección "Participá"\n\n¡No dudes en escribirnos!`
        },
        movilidad: {
            keywords: ['movilidad', 'transporte', 'colectivo', 'ómnibus', 'omnibus', 'tránsito', 'trafico'],
            response: `La **movilidad sostenible** es una de nuestras áreas estratégicas.\n\nTrabajamos en:\n• Integración del sistema de transporte público\n• Redes de ciclovías metropolitanas\n• Conectividad entre municipios\n• Priorización del peatón`
        },
        ambiente: {
            keywords: ['ambiente', 'ambiental', 'verde', 'verdes', 'parque', 'río', 'rio', 'salí', 'naturaleza'],
            response: `En **Medio Ambiente** trabajamos por:\n\n🌳 Recuperación de espacios verdes\n💧 Saneamiento del Río Salí\n🌿 Corredores biológicos urbanos\n♻️ Gestión de residuos metropolitana`
        },
        gobernanza: {
            keywords: ['gobernanza', 'gobierno', 'política', 'institucional', 'municipios', 'comunas'],
            response: `La **Gobernanza Metropolitana** busca articular las distintas jurisdicciones del AMeT.\n\nProponemos un **Consorcio Metropolitano** que gestione de forma integrada las problemáticas comunes de los 7 municipios y 19 comunas.`
        },
        marca: {
            keywords: ['marca tucumán', 'marca tucuman', 'distinción', 'distincion', 'idep', 'reconocimiento'],
            response: `¡Fundación IBATÍN recibió la **Distinción Marca Tucumán**! 🏆\n\nEste sello, otorgado por el IDEP, reconoce a organizaciones que se destacan por su aporte positivo a la provincia.`
        },
        unt: {
            keywords: ['unt', 'universidad', 'facultad', 'arquitectura', 'estudiantes'],
            response: `La **Universidad Nacional de Tucumán (UNT)** es un aliado estratégico de IBATÍN.\n\nColaboramos con la Facultad de Arquitectura y Urbanismo (FAU) y el Observatorio Ambiental.`
        }
    };

    const genericResponses = [
        `Gracias por tu mensaje. Podés preguntarme sobre:\n\n• Qué es Fundación IBATÍN\n• El Área Metropolitana de Tucumán\n• Nuestros proyectos\n• Cómo participar\n• Contacto\n\n¿Qué te interesa?`,
        `¡Buena pregunta! Te puedo ayudar con información sobre IBATÍN, nuestros proyectos o cómo participar. ¿Qué querés saber?`
    ];

    const greetings = {
        keywords: ['hola', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'hey', 'hi'],
        responses: [
            `¡Hola! 👋 Soy **iBotin**, el asistente de Fundación IBATÍN. ¿En qué puedo ayudarte?`,
            `¡Buenas! 😊 Soy iBotin. ¿Qué te gustaría saber sobre IBATÍN?`
        ]
    };

    const farewells = {
        keywords: ['chau', 'adiós', 'adios', 'gracias', 'muchas gracias', 'bye'],
        responses: [
            `¡Gracias por tu interés en IBATÍN! 🙌 ¡Hasta pronto!`,
            `¡Fue un gusto ayudarte! Te esperamos en nuestras actividades. 👋`
        ]
    };

    function findResponse(message) {
        const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        for (const kw of greetings.keywords) {
            if (lower.includes(kw)) return greetings.responses[Math.floor(Math.random() * greetings.responses.length)];
        }

        for (const kw of farewells.keywords) {
            if (lower.includes(kw)) return farewells.responses[Math.floor(Math.random() * farewells.responses.length)];
        }

        let best = null, max = 0;
        for (const [key, data] of Object.entries(knowledge)) {
            let matches = 0;
            for (const kw of data.keywords) {
                if (lower.includes(kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) matches++;
            }
            if (matches > max) { max = matches; best = data.response; }
        }

        return best || genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    function createChatbotHTML() {
        const container = document.createElement('div');
        container.id = 'ibatin-chatbot';
        container.innerHTML = `
            <button id="chatbot-toggle" class="fixed bottom-6 right-6 z-[9999] group" title="¿Necesitás ayuda?">
                <img src="${basePath}ibotin.png" alt="iBotin" class="w-20 h-20 rounded-full shadow-2xl border-4 border-white object-cover chatbot-bounce"/>
                <div class="chatbot-bubble absolute bottom-24 right-0 bg-white px-5 py-3 rounded-2xl shadow-lg border border-slate-200 whitespace-nowrap">
                    <p class="text-slate-700 text-base font-medium">¡Hola! Soy <strong class="text-primary-dark">iBotin</strong> 👋</p>
                    <p class="text-slate-500 text-sm">¿Te puedo ayudar?</p>
                </div>
            </button>
            <div id="chatbot-window" class="fixed bottom-28 right-6 z-[9998] w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-0 opacity-0 origin-bottom-right transition-all duration-300">
                <div class="bg-primary-darker p-4 flex items-center gap-3">
                    <img src="${basePath}ibotin.png" alt="iBotin" class="w-12 h-12 rounded-full border-2 border-white object-cover"/>
                    <div class="flex-1">
                        <h3 class="text-white font-bold">iBotin</h3>
                        <p class="text-white/70 text-xs">Asistente virtual de IBATÍN</p>
                    </div>
                    <button id="chatbot-close" class="text-white/70 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div id="chatbot-messages" class="h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-50">
                    <div class="flex gap-3">
                        <img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100">
                            <p class="text-slate-700 text-sm">¡Hola! 👋 Soy <strong>iBotin</strong>, el asistente de <strong>Fundación IBATÍN</strong>.</p>
                            <p class="text-slate-700 text-sm mt-2">¿En qué puedo ayudarte hoy? 😊</p>
                        </div>
                    </div>
                </div>
                <div class="p-4 border-t border-slate-200 bg-white">
                    <form id="chatbot-form" class="flex gap-2">
                        <input type="text" id="chatbot-input" placeholder="Escribí tu mensaje..." class="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm text-slate-800 focus:outline-none focus:border-primary-dark" autocomplete="off"/>
                        <button type="submit" id="chatbot-send" class="bg-primary-dark text-white p-2 rounded-full hover:bg-primary-darker transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(container);
    }

    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-bounce { animation: chatbotBounce 2s ease-in-out infinite; }
            @keyframes chatbotBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            .chatbot-bubble { animation: chatbotFadeIn 0.5s ease-out forwards; opacity: 0; }
            .chatbot-bubble::after { content: ''; position: absolute; bottom: -8px; right: 30px; border-width: 8px; border-style: solid; border-color: white transparent transparent transparent; }
            @keyframes chatbotFadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            #chatbot-messages::-webkit-scrollbar { width: 6px; }
            #chatbot-messages::-webkit-scrollbar-thumb { background: #9ca87a; border-radius: 3px; }
            .chatbot-typing { display: flex; gap: 4px; padding: 8px 12px; }
            .chatbot-typing span { width: 8px; height: 8px; background: #9ca87a; border-radius: 50%; animation: typing 1.4s infinite; }
            .chatbot-typing span:nth-child(1) { animation-delay: -0.32s; }
            .chatbot-typing span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing { 0%, 80%, 100% { transform: scale(0.6); } 40% { transform: scale(1); } }`;
        document.head.appendChild(style);
    }

    function toggleChat() {
        const win = document.getElementById('chatbot-window');
        const bubble = document.querySelector('.chatbot-bubble');
        const img = document.querySelector('#chatbot-toggle img');
        isOpen = !isOpen;
        if (isOpen) {
            win.classList.remove('scale-0', 'opacity-0');
            win.classList.add('scale-100', 'opacity-100');
            if (bubble) bubble.style.display = 'none';
            if (img) img.classList.remove('chatbot-bounce');
            document.getElementById('chatbot-input').focus();
        } else {
            win.classList.remove('scale-100', 'opacity-100');
            win.classList.add('scale-0', 'opacity-0');
            if (bubble) bubble.style.display = 'block';
            if (img) img.classList.add('chatbot-bounce');
        }
    }

    function addMessage(msg, isUser) {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        if (isUser) {
            div.innerHTML = `<div class="bg-primary-dark text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]"><p class="text-sm">${msg.replace(/</g,'&lt;')}</p></div>`;
        } else {
            div.innerHTML = `<img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/><div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100"><p class="text-slate-700 text-sm">${msg.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</p></div>`;
        }
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.id = 'typing';
        div.className = 'flex gap-3';
        div.innerHTML = `<img src="${basePath}ibotin.png" alt="iBotin" class="w-8 h-8 rounded-full object-cover flex-shrink-0"/><div class="bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100 chatbot-typing"><span></span><span></span><span></span></div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function hideTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

    async function handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatbot-input');
        const msg = input.value.trim();
        if (!msg || isLoading) return;
        isLoading = true;
        input.value = '';
        input.disabled = true;
        addMessage(msg, true);
        showTyping();
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        hideTyping();
        addMessage(findResponse(msg), false);
        isLoading = false;
        input.disabled = false;
        input.focus();
    }

    function init() {
        createChatbotHTML();
        addStyles();
        document.getElementById('chatbot-toggle').addEventListener('click', toggleChat);
        document.getElementById('chatbot-close').addEventListener('click', toggleChat);
        document.getElementById('chatbot-form').addEventListener('submit', handleSubmit);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) toggleChat(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
