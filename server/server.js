/**
 * IBATÍN Chatbot Backend Server
 * Proxy seguro para OpenAI Assistants API
 */

require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const BASE_URL = 'https://api.openai.com/v1';

// Verificar configuración al inicio
if (!OPENAI_API_KEY || !ASSISTANT_ID) {
    console.error('ERROR: Falta configurar OPENAI_API_KEY o ASSISTANT_ID en el archivo .env');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Headers comunes para OpenAI
const getHeaders = () => ({
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
});

// Función auxiliar para hacer requests a OpenAI con timeout
async function openAIRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const timeout = options.timeout || 30000; // 30 segundos por defecto
    
    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: getHeaders(),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: data.error
            });
            throw new Error(data.error?.message || `HTTP error ${response.status}`);
        }

        if (data.error) {
            throw new Error(data.error.message || 'Error en la API de OpenAI');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Timeout: La solicitud a OpenAI tardó demasiado tiempo');
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con OpenAI. Verificá tu conexión a internet.');
        }
        throw error;
    }
}

// Crear un nuevo thread (con reintentos)
app.post('/api/thread', async (req, res) => {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Creando nuevo thread... (intento ${attempt}/${maxRetries})`);
            const data = await openAIRequest('/threads', { 
                method: 'POST',
                body: JSON.stringify({})
            });
            
            if (data.id) {
                console.log('✅ Thread creado exitosamente:', data.id);
                return res.json(data);
            } else {
                throw new Error('La respuesta no contiene ID de thread');
            }
        } catch (error) {
            lastError = error;
            console.error(`❌ Error creating thread (intento ${attempt}):`, error.message);
            
            if (attempt < maxRetries) {
                // Esperar antes de reintentar (backoff exponencial)
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`   Reintentando en ${waitTime/1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error('❌ Todos los intentos de crear thread fallaron');
    res.status(500).json({ 
        error: 'Error al crear conversación después de múltiples intentos',
        details: lastError?.message 
    });
});

// Enviar mensaje y obtener respuesta
app.post('/api/chat', async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: 'threadId y message son requeridos' });
    }

    console.log(`\n--- Nueva solicitud de chat ---`);
    console.log(`Thread: ${threadId}`);
    console.log(`Mensaje: ${message}`);

    try {
        // 1. Añadir mensaje al thread
        console.log('1. Añadiendo mensaje al thread...');
        await openAIRequest(`/threads/${threadId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });
        console.log('   Mensaje añadido correctamente');

        // 2. Ejecutar el asistente
        console.log('2. Ejecutando asistente...');
        const run = await openAIRequest(`/threads/${threadId}/runs`, {
            method: 'POST',
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID
            })
        });
        console.log(`   Run creado: ${run.id} (status: ${run.status})`);

        // 3. Esperar a que termine (polling)
        console.log('3. Esperando respuesta...');
        let runStatus = run;
        let attempts = 0;
        const maxAttempts = 60;

        while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openAIRequest(`/threads/${threadId}/runs/${run.id}`);
            attempts++;

            if (attempts % 5 === 0) {
                console.log(`   Intento ${attempts}: status = ${runStatus.status}`);
            }
        }

        console.log(`   Status final: ${runStatus.status} (intentos: ${attempts})`);

        // 4. Procesar resultado
        if (runStatus.status === 'completed') {
            console.log('4. Obteniendo respuesta...');
            const messages = await openAIRequest(`/threads/${threadId}/messages?limit=1`);

            if (messages.data && messages.data.length > 0) {
                const lastMessage = messages.data[0];
                if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.content.length > 0) {
                    const responseText = lastMessage.content[0].text.value;
                    console.log(`✅ Respuesta obtenida (${responseText.length} caracteres)`);
                    return res.json({
                        response: responseText,
                        status: 'success'
                    });
                }
            }
        } else if (runStatus.status === 'failed') {
            console.error('❌ Run falló:', runStatus.last_error);
            return res.json({
                response: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intentá reformular tu pregunta.',
                status: 'error'
            });
        } else if (runStatus.status === 'expired') {
            console.error('⏱️ Run expiró (timeout)');
            return res.json({
                response: 'La solicitud tardó demasiado tiempo. Por favor, intentá con una pregunta más específica.',
                status: 'timeout'
            });
        }

        console.log('⚠️ No se obtuvo respuesta válida');
        res.json({
            response: 'Lo siento, no pude procesar tu mensaje. ¿Podés intentarlo de nuevo?',
            status: 'error'
        });

    } catch (error) {
        console.error('❌ Error en chat:', error.message);
        res.status(500).json({
            error: 'Error al procesar mensaje',
            details: error.message,
            response: 'Hubo un error al conectar con el asistente. Por favor, intentá de nuevo.'
        });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        // Intentar verificar conexión con OpenAI
        const testResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });
        
        const openaiStatus = testResponse.ok ? 'connected' : 'error';
        
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            assistant: ASSISTANT_ID ? 'configurado' : 'no configurado',
            openai: openaiStatus,
            server: 'running'
        });
    } catch (error) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            assistant: ASSISTANT_ID ? 'configurado' : 'no configurado',
            openai: 'error',
            server: 'running',
            warning: 'No se pudo verificar conexión con OpenAI'
        });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║       🤖 IBATÍN Chatbot Server - ACTIVO           ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`   📍 URL del servidor:     http://localhost:${PORT}`);
    console.log(`   🏥 Health check:         http://localhost:${PORT}/api/health`);
    console.log(`   🔑 Assistant ID:         ${ASSISTANT_ID}`);
    console.log(`   🔐 API Key:              ${OPENAI_API_KEY ? '✅ Configurada (***' + OPENAI_API_KEY.slice(-4) + ')' : '❌ NO CONFIGURADA'}`);
    console.log('\n   💡 El servidor está listo para recibir conexiones del chatbot.');
    console.log('   ⚠️  Mantené esta terminal abierta mientras uses el chatbot.\n');
});
