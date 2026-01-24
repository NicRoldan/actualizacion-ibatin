/**
 * Vercel Serverless Function - Chat con Streaming
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const BASE_URL = 'https://api.openai.com/v1';

const getHeaders = () => ({
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
});

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

    console.log(`Chat - Thread: ${threadId}`);

    try {
        // 1. Añadir mensaje al thread
        const msgResponse = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });

        if (!msgResponse.ok) {
            const error = await msgResponse.json();
            throw new Error(error.error?.message || 'Error añadiendo mensaje');
        }

        // 2. Ejecutar el asistente con streaming
        const runResponse = await fetch(`${BASE_URL}/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
            },
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID,
                stream: true
            })
        });

        if (!runResponse.ok) {
            const error = await runResponse.json();
            throw new Error(error.error?.message || 'Error ejecutando asistente');
        }

        // 3. Procesar el stream y extraer la respuesta completa
        const reader = runResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let runId = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        
                        // Capturar el run_id
                        if (parsed.id && parsed.object === 'thread.run') {
                            runId = parsed.id;
                        }

                        // Capturar texto del delta
                        if (parsed.object === 'thread.message.delta') {
                            const delta = parsed.delta?.content?.[0];
                            if (delta?.type === 'text' && delta?.text?.value) {
                                fullResponse += delta.text.value;
                            }
                        }
                    } catch (e) {
                        // Ignorar líneas que no son JSON válido
                    }
                }
            }
        }

        if (fullResponse) {
            return res.status(200).json({
                response: fullResponse,
                status: 'success'
            });
        }

        // Si no hay respuesta del stream, intentar obtenerla del thread
        if (runId) {
            // Esperar un momento y obtener mensajes
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const messagesResponse = await fetch(`${BASE_URL}/threads/${threadId}/messages?limit=1`, {
                headers: getHeaders()
            });
            
            if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                if (messages.data?.[0]?.role === 'assistant' && messages.data[0].content?.[0]) {
                    return res.status(200).json({
                        response: messages.data[0].content[0].text.value,
                        status: 'success'
                    });
                }
            }
        }

        return res.status(200).json({
            response: 'No pude procesar tu mensaje. ¿Podés intentarlo de nuevo?',
            status: 'error'
        });

    } catch (error) {
        console.error('❌ Error en chat:', error.message);
        return res.status(500).json({
            error: 'Error al procesar mensaje',
            details: error.message,
            response: 'Hubo un error al conectar con el asistente.'
        });
    }
}
