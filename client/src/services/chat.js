export const CHAT_TIMEOUT_MS = 60000;

export function chatHistory(messages) {
  return messages.filter(item => item && !item.isError && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .map(({ role, content }) => ({ role, content: content.trim().slice(0, 1200) }))
    .filter(item => item.content).slice(-6);
}

export async function sendChatMessage(client, message, messages) {
  const response = await client.post('/chat', { message, history: chatHistory(messages) }, { timeout: CHAT_TIMEOUT_MS });
  const reply = response.data?.data?.reply;
  if (response.data?.success !== true || typeof reply !== 'string' || !reply.trim()) throw new Error('Invalid assistant response');
  return reply.trim();
}

export function chatErrorMessage(error) {
  if (['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)) return 'The assistant is taking longer than usual. Please try again, or use our Contact page.';
  if (error.response?.status === 429) return 'Too many messages right now. Please wait a few minutes and try again.';
  return 'The assistant could not answer right now. Please try again, or contact our team through the Contact page.';
}
