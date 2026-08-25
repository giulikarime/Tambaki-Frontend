const API_URL = "http://localhost:3000";

export async function getReservations() {
    const response = await fetch(`${API_URL}/reservations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar reservas");
    }

    return data;
}