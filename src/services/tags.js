const API_URL = 'http://localhost:3000';

export async function getTags(){
    const response = await fetch(`${API_URL}/tags`,{
        method: 'GET',
        headers: {'Content-Type': "application/json"},
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar etiquetas");
    }

    return data;

}