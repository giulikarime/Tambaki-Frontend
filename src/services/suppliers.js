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