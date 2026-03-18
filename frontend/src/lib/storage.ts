/**
 * 🔐 Security Update: Dompet Kita
 * Direct cloud storage access from the frontend is DISCONTINUED for security.
 * All uploads must be routed via the Laravel Media API (/api/media/upload).
 */
import api from './axios';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
