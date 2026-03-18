/**
 * 🔐 Security Update: Dompet Kita
 * Gemini service has been moved to the Backend for security.
 * This file is kept for backward compatibility but calls the generic proxy.
 */
import api from './axios';

export const analyzeReceipt = async (base64Data: string, mimeType: string) => {
  return api.post('/ai/analyze', {
    image: base64Data,
    mime_type: mimeType
  });
};
