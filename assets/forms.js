/**
 * IBATÍN - Funcionalidades de formularios e interacciones
 */

(function() {
    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        // Email de destino para los formularios (simulado - en producción usar backend)
        contactEmail: 'info@ibatin.org'
    };

    // ===== MODAL GENÉRICO =====
    function createModal(title, content, onSubmit) {
        // Remover modal existente si hay
        const existingModal = document.getElementById('ibatin-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'ibatin-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeModal()"></div>
            <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modal-in">
                <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div class="p-8">
                    <h3 class="text-2xl font-black text-slate-800 mb-6">${title}</h3>
                    <div id="modal-content">${content}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Agregar estilos de animación si no existen
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in { animation: modalIn 0.2s ease-out; }
            `;
            document.head.appendChild(style);
        }

        // Si hay callback de submit, configurar el formulario
        if (onSubmit) {
            const form = modal.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    onSubmit(new FormData(form));
                });
            }
        }

        return modal;
    }

    // Cerrar modal
    window.closeModal = function() {
        const modal = document.getElementById('ibatin-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    };

    // Mostrar mensaje de éxito
    function showSuccess(message) {
        const content = document.getElementById('modal-content');
        if (content) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold text-slate-800 mb-2">${message}</h4>
                    <p class="text-slate-500 mb-6">Te contactaremos pronto.</p>
                    <button onclick="closeModal()" class="bg-primary-dark text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-darker transition-all">
                        Cerrar
                    </button>
                </div>
            `;
        }
    }

    // ===== FORMULARIO DE NEWSLETTER =====
    function handleNewsletter(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';

        if (!email || !email.includes('@')) {
            alert('Por favor, ingresá un email válido.');
            return;
        }

        // Simular envío (en producción conectar con backend/servicio de email)
        const button = form.querySelector('button[type="submit"]') || form.querySelector('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        button.disabled = true;

        setTimeout(() => {
            emailInput.value = '';
            button.innerHTML = '<span class="material-symbols-outlined">check</span>';

            // Mostrar toast de éxito
            showToast('¡Gracias por suscribirte! Te mantendremos informado.');

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }, 1000);
    }

    // ===== TOAST NOTIFICATION =====
    function showToast(message) {
        const existingToast = document.querySelector('.ibatin-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'ibatin-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-toast-in';
        toast.innerHTML = `
            <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Agregar estilos si no existen
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes toastIn {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes toastOut {
                    from { opacity: 1; transform: translate(-50%, 0); }
                    to { opacity: 0; transform: translate(-50%, 20px); }
                }
                .animate-toast-in { animation: toastIn 0.3s ease-out; }
                .animate-toast-out { animation: toastOut 0.3s ease-out forwards; }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.classList.remove('animate-toast-in');
            toast.classList.add('animate-toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ===== FORMULARIO DE VOLUNTARIADO =====
    window.openVoluntarioForm = function() {
        const content = `
            <form id="voluntario-form" class="flex flex-col gap-4">
                <p class="text-slate-500 mb-2">Completá tus datos para sumarte como voluntario/a de IBATÍN.</p>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Nombre completo *</label>
                    <input type="text" name="nombre" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Tu nombre">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="tu@email.com">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                    <input type="tel" name="telefono" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="+54 381 xxxxxxx">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">¿En qué área te gustaría participar?</label>
                    <select name="area" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark">
                        <option value="">Seleccioná un área</option>
                        <option value="logistica">Logística de eventos</option>
                        <option value="relevamiento">Relevamiento territorial</option>
                        <option value="comunicacion">Comunicación y redes</option>
                        <option value="talleres">Facilitación de talleres</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">¿Por qué querés sumarte?</label>
                    <textarea name="motivacion" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Contanos brevemente..."></textarea>
                </div>
                <button type="submit" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-darker transition-all mt-2">
                    Enviar solicitud
                </button>
            </form>
        `;
        createModal('Sumate como Voluntario/a', content);

        document.getElementById('voluntario-form').addEventListener('submit', (e) => {
            e.preventDefault();
            showSuccess('¡Solicitud enviada!');
        });
    };

    // ===== FORMULARIO DE PROFESIONALES =====
    window.openProfesionalForm = function() {
        const content = `
            <form id="profesional-form" class="flex flex-col gap-4">
                <p class="text-slate-500 mb-2">Cargá tu perfil profesional para colaborar con el Consejo Metropolitano.</p>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Nombre completo *</label>
                    <input type="text" name="nombre" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Tu nombre">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="tu@email.com">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Profesión *</label>
                    <select name="profesion" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark">
                        <option value="">Seleccioná tu profesión</option>
                        <option value="arquitectura">Arquitectura / Urbanismo</option>
                        <option value="ingenieria">Ingeniería</option>
                        <option value="sociologia">Sociología / Trabajo Social</option>
                        <option value="economia">Economía / Administración</option>
                        <option value="ambiente">Ciencias Ambientales</option>
                        <option value="derecho">Derecho</option>
                        <option value="comunicacion">Comunicación / Diseño</option>
                        <option value="otra">Otra</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">LinkedIn o Portfolio (opcional)</label>
                    <input type="url" name="linkedin" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="https://...">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Experiencia relevante</label>
                    <textarea name="experiencia" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Describí brevemente tu experiencia..."></textarea>
                </div>
                <button type="submit" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-darker transition-all mt-2">
                    Enviar perfil
                </button>
            </form>
        `;
        createModal('Registro de Profesionales', content);

        document.getElementById('profesional-form').addEventListener('submit', (e) => {
            e.preventDefault();
            showSuccess('¡Perfil registrado!');
        });
    };

    // ===== FORMULARIO DE NODOS BARRIALES =====
    window.openNodoForm = function() {
        const content = `
            <form id="nodo-form" class="flex flex-col gap-4">
                <p class="text-slate-500 mb-2">Registrá tu centro vecinal o espacio comunitario como nodo de articulación.</p>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Nombre de la organización *</label>
                    <input type="text" name="organizacion" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Ej: Centro Vecinal Villa Luján">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Persona de contacto *</label>
                    <input type="text" name="contacto" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Nombre del referente">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="tu@email.com">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Teléfono *</label>
                    <input type="tel" name="telefono" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="+54 381 xxxxxxx">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Barrio / Zona</label>
                    <input type="text" name="barrio" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Ej: Villa Luján, San Miguel de Tucumán">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">¿Qué problemáticas priorizan en su barrio?</label>
                    <textarea name="problematicas" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Describí las principales problemáticas..."></textarea>
                </div>
                <button type="submit" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-darker transition-all mt-2">
                    Registrar nodo
                </button>
            </form>
        `;
        createModal('Registro de Nodo Barrial', content);

        document.getElementById('nodo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            showSuccess('¡Nodo registrado!');
        });
    };

    // ===== FORMULARIO DE CONTACTO GENERAL =====
    window.openContactoForm = function() {
        const content = `
            <form id="contacto-form" class="flex flex-col gap-4">
                <p class="text-slate-500 mb-2">Envianos tu consulta y te responderemos a la brevedad.</p>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Nombre *</label>
                    <input type="text" name="nombre" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Tu nombre">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="tu@email.com">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Asunto</label>
                    <select name="asunto" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark">
                        <option value="general">Consulta general</option>
                        <option value="prensa">Prensa / Medios</option>
                        <option value="alianzas">Alianzas institucionales</option>
                        <option value="proyectos">Información sobre proyectos</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Mensaje *</label>
                    <textarea name="mensaje" rows="4" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-dark" placeholder="Escribí tu mensaje..."></textarea>
                </div>
                <button type="submit" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-darker transition-all mt-2">
                    Enviar mensaje
                </button>
            </form>
        `;
        createModal('Contacto', content);

        document.getElementById('contacto-form').addEventListener('submit', (e) => {
            e.preventDefault();
            showSuccess('¡Mensaje enviado!');
        });
    };

    // ===== DESCARGA DE DOCUMENTOS =====
    window.downloadDocument = function(docName, docType) {
        showToast(`Descargando ${docName}...`);
        // En producción, aquí iría la lógica real de descarga
        // Por ahora simulamos con un mensaje
        setTimeout(() => {
            showToast(`El archivo ${docName} no está disponible aún.`);
        }, 1500);
    };

    // ===== QUIZ INTERACTIVO =====
    const quizData = {
        questions: [
            {
                id: 1,
                question: "¿Cuál de estas áreas te apasiona más para mejorar tu barrio?",
                options: [
                    { id: 'movilidad', icon: 'directions_bus', title: 'Movilidad Sustentable', desc: 'Ciclovías, transporte público, peatonalidad.' },
                    { id: 'verdes', icon: 'park', title: 'Espacios Verdes', desc: 'Plazas, parques y biodiversidad urbana.' },
                    { id: 'vivienda', icon: 'home_work', title: 'Vivienda y Hábitat', desc: 'Acceso a servicios e infraestructura social.' },
                    { id: 'cultura', icon: 'groups', title: 'Cultura y Comunidad', desc: 'Identidad local y redes vecinales.' }
                ]
            },
            {
                id: 2,
                question: "¿Qué tipo de actividad te resultaría más atractiva?",
                options: [
                    { id: 'campo', icon: 'hiking', title: 'Trabajo de Campo', desc: 'Relevamientos, mapeos y actividades en territorio.' },
                    { id: 'tecnico', icon: 'analytics', title: 'Análisis Técnico', desc: 'Investigación, datos y documentación.' },
                    { id: 'comunidad', icon: 'diversity_3', title: 'Articulación Comunitaria', desc: 'Talleres, reuniones y coordinación vecinal.' },
                    { id: 'comunicacion', icon: 'campaign', title: 'Comunicación', desc: 'Redes sociales, diseño y difusión.' }
                ]
            },
            {
                id: 3,
                question: "¿Cuánto tiempo podrías dedicar mensualmente?",
                options: [
                    { id: 'poco', icon: 'schedule', title: '2-4 horas/mes', desc: 'Participación puntual en eventos específicos.' },
                    { id: 'medio', icon: 'event', title: '5-10 horas/mes', desc: 'Colaboración regular en proyectos.' },
                    { id: 'mucho', icon: 'work', title: '10-20 horas/mes', desc: 'Compromiso activo y sostenido.' },
                    { id: 'profesional', icon: 'workspace_premium', title: 'Dedicación profesional', desc: 'Asesoría técnica o liderazgo de proyectos.' }
                ]
            }
        ],
        results: {
            voluntario_campo: {
                title: '¡Voluntario/a de Acción Territorial!',
                icon: 'hiking',
                description: 'Tu perfil es ideal para participar en relevamientos, mapeos comunitarios y actividades de campo.',
                action: 'openVoluntarioForm',
                actionText: 'Sumarme como Voluntario/a'
            },
            voluntario_comunidad: {
                title: '¡Facilitador/a Comunitario/a!',
                icon: 'diversity_3',
                description: 'Tu perfil es perfecto para articular con la comunidad, facilitar talleres y coordinar nodos barriales.',
                action: 'openNodoForm',
                actionText: 'Registrar mi Nodo Barrial'
            },
            profesional: {
                title: '¡Asesor/a Técnico/a!',
                icon: 'architecture',
                description: 'Tu perfil técnico y disponibilidad son ideales para integrar el Consejo de Profesionales del AMeT.',
                action: 'openProfesionalForm',
                actionText: 'Registrarme como Profesional'
            },
            comunicador: {
                title: '¡Comunicador/a Digital!',
                icon: 'campaign',
                description: 'Tu interés en comunicación es clave para amplificar el mensaje de IBATÍN y conectar con más ciudadanos.',
                action: 'openVoluntarioForm',
                actionText: 'Sumarme al Equipo de Comunicación'
            },
            colaborador: {
                title: '¡Colaborador/a Puntual!',
                icon: 'volunteer_activism',
                description: 'Podés participar en eventos específicos y acciones puntuales según tu disponibilidad.',
                action: 'openVoluntarioForm',
                actionText: 'Ver Próximos Eventos'
            }
        }
    };

    let quizState = {
        currentStep: 0,
        answers: []
    };

    function initQuiz() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer) return;

        quizState = { currentStep: 0, answers: [] };
        renderQuizStep();
    }

    function renderQuizStep() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer) return;

        const step = quizState.currentStep;
        const totalSteps = quizData.questions.length;
        const progress = Math.round(((step + 1) / (totalSteps + 1)) * 100);

        if (step >= totalSteps) {
            renderQuizResult();
            return;
        }

        const question = quizData.questions[step];
        const selectedAnswer = quizState.answers[step];

        quizContainer.innerHTML = `
            <div class="flex flex-col gap-6">
                <div class="space-y-4">
                    <p class="text-lg font-medium text-slate-700">${question.question}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${question.options.map(opt => `
                            <button class="quiz-option flex items-center gap-4 p-4 rounded-lg border-2 ${selectedAnswer === opt.id ? 'border-primary-dark bg-primary/10' : 'border-slate-200 bg-slate-50 hover:border-primary/50'} text-left transition-all" data-option="${opt.id}">
                                <span class="material-symbols-outlined ${selectedAnswer === opt.id ? 'text-primary-dark' : 'text-slate-500'}">${opt.icon}</span>
                                <div>
                                    <p class="font-bold text-slate-800">${opt.title}</p>
                                    <p class="text-xs text-slate-500">${opt.desc}</p>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div class="flex-1 max-w-xs">
                        <div class="flex justify-between text-xs font-bold mb-2 text-slate-600">
                            <span>PROGRESO</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div class="h-full bg-primary-dark transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        ${step > 0 ? '<button class="quiz-prev bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition-all">Anterior</button>' : ''}
                        <button class="quiz-next bg-primary-dark text-white px-8 py-2 rounded-lg font-bold hover:bg-primary-darker transition-all ${!selectedAnswer ? 'opacity-50 cursor-not-allowed' : ''}" ${!selectedAnswer ? 'disabled' : ''}>
                            ${step === totalSteps - 1 ? 'Ver Resultado' : 'Siguiente'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners para opciones
        quizContainer.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const optionId = btn.dataset.option;
                quizState.answers[step] = optionId;
                renderQuizStep();
            });
        });

        // Event listener para siguiente
        const nextBtn = quizContainer.querySelector('.quiz-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (quizState.answers[step]) {
                    quizState.currentStep++;
                    renderQuizStep();
                }
            });
        }

        // Event listener para anterior
        const prevBtn = quizContainer.querySelector('.quiz-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                quizState.currentStep--;
                renderQuizStep();
            });
        }
    }

    function calculateQuizResult() {
        const [area, actividad, tiempo] = quizState.answers;

        // Lógica de determinación de perfil
        if (tiempo === 'profesional') {
            return 'profesional';
        }
        if (actividad === 'comunicacion') {
            return 'comunicador';
        }
        if (actividad === 'comunidad' || area === 'cultura') {
            return 'voluntario_comunidad';
        }
        if (actividad === 'campo' || area === 'verdes') {
            return 'voluntario_campo';
        }
        if (tiempo === 'poco') {
            return 'colaborador';
        }
        return 'voluntario_campo';
    }

    function renderQuizResult() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer) return;

        const resultKey = calculateQuizResult();
        const result = quizData.results[resultKey];

        quizContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="size-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <span class="material-symbols-outlined text-4xl text-primary-dark">${result.icon}</span>
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-3">${result.title}</h3>
                <p class="text-slate-500 mb-8 max-w-md mx-auto">${result.description}</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="${result.action}()" class="bg-primary-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-darker transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">check_circle</span>
                        ${result.actionText}
                    </button>
                    <button onclick="resetQuiz()" class="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition-all">
                        Repetir Quiz
                    </button>
                </div>
            </div>
        `;
    }

    window.resetQuiz = function() {
        quizState = { currentStep: 0, answers: [] };
        renderQuizStep();
    };

    window.initQuiz = initQuiz;

    // ===== VER UBICACIONES - MAPA DE HUERTAS =====
    window.verUbicacionesHuertas = function() {
        const content = `
            <div class="space-y-4">
                <p class="text-slate-500">Ubicaciones de las huertas urbanas comunitarias en el AMeT.</p>
                <div class="relative h-[300px] rounded-xl overflow-hidden">
                    <iframe
                        src="https://mapa.poblaciones.org/map/96301/?emb=1&co=1#/@-26.918944,-65.24437,11z"
                        class="absolute inset-0 w-full h-full"
                        style="border: none;"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="grid grid-cols-1 gap-3 mt-4">
                    <div class="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <span class="material-symbols-outlined text-primary-dark">location_on</span>
                        <div>
                            <p class="font-bold text-slate-700">Villa Luján</p>
                            <p class="text-xs text-slate-500">Huerta comunitaria - 200 familias</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <span class="material-symbols-outlined text-primary-dark">location_on</span>
                        <div>
                            <p class="font-bold text-slate-700">Barrio Sur</p>
                            <p class="text-xs text-slate-500">Huerta escolar - Centro educativo N°45</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <span class="material-symbols-outlined text-primary-dark">location_on</span>
                        <div>
                            <p class="font-bold text-slate-700">Yerba Buena</p>
                            <p class="text-xs text-slate-500">Huerta municipal - Parque del Oeste</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        createModal('Mapa de Huertas Urbanas', content);
    };

    // ===== VER AVANCES DE PROYECTOS =====
    window.verAvancesProyecto = function(proyecto) {
        const avances = {
            'gestion': {
                titulo: 'Gestión Integral Metropolitana',
                items: [
                    { estado: 'completado', texto: 'Diagnóstico inicial de articulación intermunicipal' },
                    { estado: 'completado', texto: 'Conformación de mesas técnicas' },
                    { estado: 'en_progreso', texto: 'Diseño del Consejo Metropolitano' },
                    { estado: 'pendiente', texto: 'Plan Director 2030' }
                ]
            },
            'economia': {
                titulo: 'Economía Circular',
                items: [
                    { estado: 'completado', texto: 'Mapeo de puntos de reciclaje existentes' },
                    { estado: 'en_progreso', texto: 'Capacitación a cooperativas de recicladores' },
                    { estado: 'en_progreso', texto: 'Implementación de puntos verdes piloto' },
                    { estado: 'pendiente', texto: 'Red metropolitana de economía circular' }
                ]
            },
            'movilidad': {
                titulo: 'Movilidad Urbana',
                items: [
                    { estado: 'completado', texto: 'Estudio de flujos de movilidad' },
                    { estado: 'completado', texto: 'Diseño de red de ciclovías' },
                    { estado: 'en_progreso', texto: 'Implementación de bicisendas piloto' },
                    { estado: 'pendiente', texto: 'Nodos de transferencia multimodal' }
                ]
            },
            'habitat': {
                titulo: 'Territorio y Hábitat',
                items: [
                    { estado: 'completado', texto: 'Relevamiento de asentamientos' },
                    { estado: 'en_progreso', texto: 'Programas de regularización dominial' },
                    { estado: 'en_progreso', texto: 'Mejoramiento barrial integral' },
                    { estado: 'pendiente', texto: 'Plan de gestión de riesgo hídrico' }
                ]
            },
            'ciudadania': {
                titulo: 'Ciudadanía y Gobierno Abierto',
                items: [
                    { estado: 'completado', texto: 'Primer Foro de Ideas Metropolitanas' },
                    { estado: 'completado', texto: 'Lanzamiento de Escuela de Ciudadanía' },
                    { estado: 'en_progreso', texto: 'Plataforma de participación ciudadana' },
                    { estado: 'pendiente', texto: 'Presupuesto participativo metropolitano' }
                ]
            },
            'tecnologia': {
                titulo: 'Nuevas Tecnologías',
                items: [
                    { estado: 'completado', texto: 'Portal de datos abiertos' },
                    { estado: 'completado', texto: 'Plataforma GIS del AMeT' },
                    { estado: 'en_progreso', texto: 'App ciudadana de reportes' },
                    { estado: 'pendiente', texto: 'Red de sensores urbanos' }
                ]
            }
        };

        const data = avances[proyecto] || avances['gestion'];

        const content = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span class="size-3 rounded-full bg-green-500"></span> Completado
                    <span class="size-3 rounded-full bg-amber-500 ml-3"></span> En progreso
                    <span class="size-3 rounded-full bg-slate-300 ml-3"></span> Pendiente
                </div>
                ${data.items.map(item => `
                    <div class="flex items-center gap-3 p-3 rounded-lg ${item.estado === 'completado' ? 'bg-green-50' : item.estado === 'en_progreso' ? 'bg-amber-50' : 'bg-slate-50'}">
                        <span class="size-3 rounded-full ${item.estado === 'completado' ? 'bg-green-500' : item.estado === 'en_progreso' ? 'bg-amber-500' : 'bg-slate-300'}"></span>
                        <p class="text-slate-700">${item.texto}</p>
                    </div>
                `).join('')}
            </div>
        `;
        createModal(`Avances: ${data.titulo}`, content);
    };

    // ===== EXPLORAR DATOS =====
    window.explorarDatos = function() {
        const content = `
            <div class="space-y-4">
                <p class="text-slate-500 mb-4">Accedé a los datasets públicos del Observatorio Metropolitano.</p>
                <div class="grid grid-cols-1 gap-3">
                    <a href="https://mapa.poblaciones.org/map/96301" target="_blank" class="flex items-center gap-3 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all">
                        <span class="material-symbols-outlined text-primary-dark">map</span>
                        <div class="flex-1">
                            <p class="font-bold text-slate-700">Mapa Interactivo AMeT</p>
                            <p class="text-xs text-slate-500">Visualización geográfica de datos</p>
                        </div>
                        <span class="material-symbols-outlined text-slate-400">open_in_new</span>
                    </a>
                    <div class="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
                        <span class="material-symbols-outlined text-primary-dark">analytics</span>
                        <div class="flex-1">
                            <p class="font-bold text-slate-700">Indicadores Urbanos</p>
                            <p class="text-xs text-slate-500">Próximamente disponible</p>
                        </div>
                        <span class="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Pronto</span>
                    </div>
                    <div class="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
                        <span class="material-symbols-outlined text-primary-dark">folder_open</span>
                        <div class="flex-1">
                            <p class="font-bold text-slate-700">Documentos Técnicos</p>
                            <p class="text-xs text-slate-500">Próximamente disponible</p>
                        </div>
                        <span class="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Pronto</span>
                    </div>
                </div>
            </div>
        `;
        createModal('Explorar Datos Abiertos', content);
    };

    // ===== VER RED DE CICLOVÍAS =====
    window.verRedCiclovias = function() {
        const content = `
            <div class="space-y-4">
                <p class="text-slate-500">Red planificada de ciclovías para el Área Metropolitana de Tucumán.</p>
                <div class="relative h-[250px] rounded-xl overflow-hidden bg-slate-100">
                    <iframe
                        src="https://mapa.poblaciones.org/map/96301/?emb=1&co=1#/@-26.83,-65.22,12z"
                        class="absolute inset-0 w-full h-full"
                        style="border: none;"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div class="text-center p-4 bg-primary/10 rounded-lg">
                        <span class="text-2xl font-black text-primary-dark">45 km</span>
                        <p class="text-xs text-slate-500 mt-1">Existentes</p>
                    </div>
                    <div class="text-center p-4 bg-amber-100 rounded-lg">
                        <span class="text-2xl font-black text-amber-600">30 km</span>
                        <p class="text-xs text-slate-500 mt-1">En obra</p>
                    </div>
                    <div class="text-center p-4 bg-slate-100 rounded-lg">
                        <span class="text-2xl font-black text-slate-600">45 km</span>
                        <p class="text-xs text-slate-500 mt-1">Proyectados</p>
                    </div>
                </div>
            </div>
        `;
        createModal('Red de Ciclovías AMeT', content);
    };

    // ===== VER MAPA DE PUNTOS VERDES =====
    window.verMapaPuntosVerdes = function() {
        const content = `
            <div class="space-y-4">
                <p class="text-slate-500">Puntos de reciclaje y economía circular en el AMeT.</p>
                <div class="relative h-[250px] rounded-xl overflow-hidden">
                    <iframe
                        src="https://mapa.poblaciones.org/map/96301/?emb=1&co=1#/@-26.83,-65.22,11z"
                        class="absolute inset-0 w-full h-full"
                        style="border: none;"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p class="text-sm text-green-800">
                        <strong>12 puntos verdes</strong> activos actualmente.
                        La meta para 2026 es alcanzar <strong>50 puntos</strong> distribuidos en todo el AMeT.
                    </p>
                </div>
            </div>
        `;
        createModal('Mapa de Puntos Verdes', content);
    };

    // ===== DESCARGAR BASES DEL CONCURSO =====
    window.descargarBasesConcurso = function() {
        showToast('Descargando bases del concurso...');
        setTimeout(() => {
            showToast('Las bases del concurso se están preparando para descarga.');
        }, 1500);
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        // Inicializar quiz si existe el contenedor
        if (document.querySelector('.quiz-container')) {
            initQuiz();
        }

        // Interceptar todos los formularios de newsletter
        document.querySelectorAll('form').forEach(form => {
            const emailInput = form.querySelector('input[type="email"]');
            const hasOnlyEmail = emailInput && form.querySelectorAll('input').length <= 2;

            if (hasOnlyEmail && !form.dataset.initialized) {
                form.dataset.initialized = 'true';
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    handleNewsletter(form);
                });
            }
        });

        // Interceptar botones de participación
        document.querySelectorAll('button').forEach(btn => {
            const text = btn.textContent.toLowerCase().trim();

            if (text.includes('sumarme') || text.includes('voluntari')) {
                btn.onclick = (e) => { e.preventDefault(); openVoluntarioForm(); };
            } else if (text.includes('cargar cv') || text.includes('profesional')) {
                btn.onclick = (e) => { e.preventDefault(); openProfesionalForm(); };
            } else if (text.includes('registrar nodo') || text.includes('nodo')) {
                btn.onclick = (e) => { e.preventDefault(); openNodoForm(); };
            } else if (text.includes('contacto') || text.includes('contactar')) {
                btn.onclick = (e) => { e.preventDefault(); openContactoForm(); };
            }
        });

        // Interceptar links de contacto en footer
        document.querySelectorAll('a').forEach(link => {
            const text = link.textContent.toLowerCase().trim();
            const href = link.getAttribute('href');

            if (href === '#' && (text.includes('contacto') || text.includes('voluntariado'))) {
                if (text.includes('voluntariado')) {
                    link.onclick = (e) => { e.preventDefault(); openVoluntarioForm(); };
                } else if (text.includes('contacto')) {
                    link.onclick = (e) => { e.preventDefault(); openContactoForm(); };
                }
            }
        });

        // Botones de descarga
        document.querySelectorAll('[class*="download"], button').forEach(btn => {
            const parent = btn.closest('.bg-white, .bg-slate-50, article');
            if (parent) {
                const title = parent.querySelector('h4, h3');
                const sizeInfo = parent.querySelector('.text-slate-400, .text-xs');

                if (title && sizeInfo && sizeInfo.textContent.includes('MB')) {
                    btn.onclick = () => downloadDocument(title.textContent, sizeInfo.textContent);
                }
            }
        });
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
