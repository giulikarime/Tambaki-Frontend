import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;
const TTL_USERS = 2 * 60 * 1000;
const TTL_ENUMS = 60 * 60 * 1000;

export function getUsers() {
    return cached('users:list', async () => {
        const response = await authenticatedFetch(`${apiUrl}/users`,{
            method:'GET',
            headers:{"Content-Type": 'application/json'},
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message || "Erro ao buscar usuários.");
        }

        return data;
    }, TTL_USERS);
}

export async function createUsers(payload) {
    const response = await authenticatedFetch(`${apiUrl}/users`,{
        method:'POST',
        headers:{"Content-Type": 'application/json'},
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao criar usuário.");
    }

    invalidate('users:list');
    return data;
}

export async function editUsers(payload,id) {
    const response = await authenticatedFetch(`${apiUrl}/users/${id}`,{
        method:'PATCH',
        headers:{"Content-Type": 'application/json'},
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao editar usuário.");
    }

    invalidate('users:list');
    return data;
}

export async function deleteUsers(id) {
    const response = await authenticatedFetch(`${apiUrl}/users/${id}`,{
        method:'DELETE',
        headers:{"Content-Type": 'application/json'},
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao deletar usuário.");
    }

    invalidate('users:list');
    return data;
}

export function getUserEnums() {
    return cached('users:enums', async () => {
        const response = await authenticatedFetch(`${apiUrl}/users/enums`);
        if (!response.ok) throw new Error('Erro ao buscar enums de usuários');
        return response.json();
    }, TTL_ENUMS);
}