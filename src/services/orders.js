const apiUrl = process.env.API_URL;
export async function getOrders() {
    const response = await fetch(`${apiUrl}/orders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar comandas");
    }

    return data;
}