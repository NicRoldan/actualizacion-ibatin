/**
 * Vercel Serverless Function - Chat
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const BASE_URL = 'https://api.openai.com/v1';

const getHeaders = () => ({
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
});

async function openAIRequest(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
    }

    return data;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: 'threadId y message son requeridos' });
    }

    console.log(`Chat - Thread: ${threadId}, Mensaje: ${message.substring(0, 50)}...`);

    try {
        // 1. Añadir mensaje al thread
        await openAIRequest(`/threads/${threadId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });

        // 2. Ejecutar el asistente
        const run = await openAIRequest(`/threads/${threadId}/runs`, {
            method: 'POST',
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID
            })
        });

        // 3. Esperar a que termine (polling)
        let runStatus = run;
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos máximo (Vercel tiene límite)

        while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openAIRequest(`/threads/${threadId}/runs/${run.id}`);
            attempts++;
        }

        // 4. Procesar resultado
        if (runStatus.status === 'completed') {
            const messages = await openAIRequest(`/threads/${threadId}/messages?limit=1`);

            if (messages.data?.[0]?.role === 'assistant' && messages.data[0].content?.[0]) {
                return res.status(200).json({
                    response: messages.data[0].content[0].text.value,
                    status: 'success'
                });
            }
        } else if (runStatus.status === 'failed') {
            return res.status(200).json({
                response: 'Lo siento, ocurrió un error. Por favor, intentá reformular tu pregunta.',
                status: 'error'
            });
        }

        return res.status(200).json({
            response: 'No pude procesar tu mensaje. ¿Podés intentarlo de nuevo?',
            status: 'error'
        });

    } catch (error) {
        console.error('❌ Error en chat:', error.message);
        return res.status(500).json({
            error: 'Error al procesar mensaje',
            response: 'Hubo un error al conectar con el asistente.'
        });
    }
}
