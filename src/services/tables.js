const API_URL = "http://localhost:3000";

export async function getTables() {
    const response = await fetch(`${API_URL}/tables`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar mesas");
    }

    return data;
}

export async function createTable(payload) {
    const response = await fetch(`${API_URL}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar mesa");
    }

    return data;
}

export async function updateTable(id, payload) {
    const response = await fetch(`${API_URL}/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar mesa");
    }

    return data;
}

export async function deleteTable(id) {
    const response = await fetch(`${API_URL}/tables/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    // DELETE às vezes não retorna body — trata esse caso
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Erro ao excluir mesa");
    }

    return data;
}