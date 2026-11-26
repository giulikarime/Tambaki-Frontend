import { authenticatedFetch } from './authenticatedFetch';
const apiUrl = import.meta.env.VITE_API_URL;
export async function getUsers() {
    const response = await authenticatedFetch(`${apiUrl}/users`,{
        method:'GET',
        headers:{"Content-Type": 'application/json'},
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar usuários.");
    }

    return data;
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

    return data;
}

export async function getUserEnums() {
    const response = await authenticatedFetch(`${apiUrl}/users/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de usuários');
    return response.json();
}