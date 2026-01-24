/**
 * IBATÍN Chatbot Backend Server
 * Proxy seguro para OpenAI Assistants API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const BASE_URL = 'https://api.openai.com/v1';

// Middleware
app.use(cors());
app.use(express.json());

// Headers comunes para OpenAI
const getHeaders = () => ({
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
});

// Crear un nuevo thread
app.post('/api/thread', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/threads`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Error al crear conversación' });
    }
});

// Enviar mensaje y obtener respuesta
app.post('/api/chat', async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: 'threadId y message son requeridos' });
    }

    try {
        // 1. Añadir mensaje al thread
        await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });

        // 2. Ejecutar el asistente
        const runResponse = await fetch(`${BASE_URL}/threads/${threadId}/runs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID
            })
        });
        const run = await runResponse.json();

        // 3. Esperar a que termine (polling)
        let runStatus = run;
        let attempts = 0;
        const maxAttempts = 60; // máximo 60 segundos

        while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await fetch(`${BASE_URL}/threads/${threadId}/runs/${run.id}`, {
                headers: getHeaders()
            });
            runStatus = await statusResponse.json();
            attempts++;
        }

        if (runStatus.status === 'completed') {
            // 4. Obtener el último mensaje
            const messagesResponse = await fetch(`${BASE_URL}/threads/${threadId}/messages?limit=1`, {
                headers: getHeaders()
            });
            const messages = await messagesResponse.json();

            if (messages.data && messages.data.length > 0) {
                const lastMessage = messages.data[0];
                if (lastMessage.content && lastMessage.content.length > 0) {
                    return res.json({ 
                        response: lastMessage.content[0].text.value,
                        status: 'success'
                    });
                }
            }
        }

        res.json({ 
            response: 'Lo siento, no pude procesar tu mensaje. ¿Podés intentarlo de nuevo?',
            status: 'error'
        });

    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ 
            error: 'Error al procesar mensaje',
            response: 'Hubo un error al conectar con el asistente. Por favor, intentá de nuevo.'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🤖 IBATÍN Chatbot Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
