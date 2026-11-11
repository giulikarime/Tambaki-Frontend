const API_URL = 'http://localhost:3000';

export async function getCosts() {
    const response = await fetch(`${API_URL}/costs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar custos");
    }

    return data;
}

export async function createCosts(payload) {
    const response = await fetch(`${API_URL}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar custo");
    }

    return data;
}

export async function editCosts(payload,id) {
    const response = await fetch(`${API_URL}/costs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao editar custo");
    }

    return data;
}

export async function deleteCosts(id) {
    const response = await fetch(`${API_URL}/costs/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao deletar custo");
    }

    return data;
}

export async function getCostsEnums() {
    const response = await fetch(`${API_URL}/costs/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de custo');
    return response.json();
}

