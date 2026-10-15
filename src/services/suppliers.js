const API_URL = "http://localhost:3000";

export async function getSuppliers() {
    const response = await fetch(`${API_URL}/suppliers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar fornecedores");
    }

    return data;
}

export async function createSuppliers(payload) {
    const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar fornecedor");
    }

    return data;
}

export async function editSuppliers(payload,id) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao editar fornecedor");
    }

    return data;
}

export async function deleteSuppliers(id) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao deletar fornecedor");
    }

    return data;
}

export async function getSuppliersEnums() {
    const response = await fetch(`${API_URL}/suppliers/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de fornecedores');
    return response.json();
}