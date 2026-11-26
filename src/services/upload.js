import { authenticatedFetch } from './authenticatedFetch';

const apiUrl = import.meta.env.VITE_API_URL;
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(`${apiUrl}/uploads`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao enviar arquivo');
  }

  return data.url;
}