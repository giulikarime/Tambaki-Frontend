const API_URL = "http://localhost:3000";

export async function getProducts() {
    const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar produtos");
    }

    return data;
}