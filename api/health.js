/**
 * Vercel Serverless Function - Health Check
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        platform: 'vercel',
        assistant: process.env.ASSISTANT_ID ? 'configurado' : 'no configurado'
    });
}
