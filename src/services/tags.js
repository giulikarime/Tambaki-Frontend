const apiUrl = process.env.API_URL;
export async function getTags(){
    const response = await fetch(`${apiUrl}/tags`,{
        method: 'GET',
        headers: {'Content-Type': "application/json"},
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao buscar etiquetas");
    }

    return data;

}

export async function createTags(payload){
    const response = await fetch(`${apiUrl}/tags`,{
        method: 'POST',
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify(payload),
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao criar etiqueta");
    }

    return data;

}

export async function editTags(payload,id){
    const response = await fetch(`${apiUrl}/tags/${id}`,{
        method: 'PATCH',
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify(payload),
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao editar etiqueta");
    }

    return data;

}

export async function deleteTags(id){
    const response = await fetch(`${apiUrl}/tags/${id}`,{
        method: 'DELETE',
        headers: {'Content-Type': "application/json"},
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao deletar etiqueta");
    }

    return data;

}