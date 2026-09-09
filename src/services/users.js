const API_URL = 'http://localhost:3000';

export async function getUsers(){
    const response = await fetch(`${API_URL}/users`,{
        method: "GET",
        headers: {'Content-Type':'application/json'},
    });

    const data = response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar usuários.");
    }

    return data;
}