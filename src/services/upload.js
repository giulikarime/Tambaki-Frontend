
const API_URL = 'http://localhost:3000';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao enviar arquivo');
  }

  return data.url;
}