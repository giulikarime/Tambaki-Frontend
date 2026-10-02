const API_URL = 'http://localhost:3000';

export async function getUsers() {
    const response = await fetch(`${API_URL}/users`,{
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
    const response = await fetch(`${API_URL}/users`,{
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
    const response = await fetch(`${API_URL}/users/${id}`,{
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
    const response = await fetch(`${API_URL}/users/${id}`,{
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
    const response = await fetch(`${API_URL}/users/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de usuários');
    return response.json();
}