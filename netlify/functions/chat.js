const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers, body: '' }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }; }
  try {
    const { threadId, message } = JSON.parse(event.body);
    await openai.beta.threads.messages.create(threadId, { role: 'user', content: message });
    const run = await openai.beta.threads.runs.createAndPoll(threadId, { assistant_id: process.env.ASSISTANT_ID });
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0].content[0].text.value;
    return { statusCode: 200, headers, body: JSON.stringify({ response: lastMessage }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
