import { authenticatedFetch } from './authenticatedFetch';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getAuditLogs() {
    const response = await authenticatedFetch(`${apiUrl}/audit-logs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar logs do sistema.');
    }

    return data;
}
