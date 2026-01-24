/**
 * Vercel Serverless Function - Crear Thread
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Creando thread... (intento ${attempt}/${maxRetries})`);
            
            const response = await fetch(`${BASE_URL}/threads`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }

            if (data.id) {
                console.log('✅ Thread creado:', data.id);
                return res.status(200).json(data);
            } else {
                throw new Error('No se recibió ID del thread');
            }
        } catch (error) {
            lastError = error;
            console.error(`❌ Error (intento ${attempt}):`, error.message);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    return res.status(500).json({
        error: 'Error al crear conversación',
        details: lastError?.message
    });
}
