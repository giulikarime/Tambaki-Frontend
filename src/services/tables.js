import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;
const TTL_TABLES = 15 * 1000;

export function getTables() {
    return cached('tables:list', async () => {
        const response = await authenticatedFetch(`${apiUrl}/tables`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro ao buscar mesas");
        }

        return data;
    }, TTL_TABLES);
}

export async function createTable(payload) {
    const response = await authenticatedFetch(`${apiUrl}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar mesa");
    }

    invalidate('tables:list');
    return data;
}

export async function updateTable(id, payload) {
    const response = await authenticatedFetch(`${apiUrl}/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar mesa");
    }

    invalidate('tables:list');
    return data;
}

export async function deleteTable(id) {
    const response = await authenticatedFetch(`${apiUrl}/tables/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    // DELETE às vezes não retorna body — trata esse caso
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Erro ao excluir mesa");
    }

    invalidate('tables:list');
    return data;
}