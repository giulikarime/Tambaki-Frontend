import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;

async function requestMenu(path, errorMessage, options = {}) {
    const response = await authenticatedFetch(`${apiUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || errorMessage);
    return data;
}

export function getMenu() {
    return cached('menu:list', () => requestMenu('/menu', "Erro ao buscar pratos"), 5 * 60 * 1000);
}

function invalidateMenuData() {
    invalidate('menu:');
}

export async function createMenu(payload) {
    const result = await requestMenu('/menu', "Erro ao criar pratos", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    invalidateMenuData();
    return result;
}

export async function editMenu(payload, id) {
    const result = await requestMenu(`/menu/${id}`, "Erro ao editar pratos", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    invalidateMenuData();
    return result;
}

export async function deleteMenu(id) {
    const result = await requestMenu(`/menu/${id}`, "Erro ao deletar pratos", {
        method: "DELETE",
    });
    invalidateMenuData();
    return result;
}

export async function getMenuEnums() {
    const response = await authenticatedFetch(`${apiUrl}/menu/enum`);
    if (!response.ok) throw new Error('Erro ao buscar enums de produto');
    return response.json();
}

