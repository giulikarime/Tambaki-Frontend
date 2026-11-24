const apiUrl = import.meta.env.VITE_API_URL;
export async function getReservations() {
    const response = await fetch(`${apiUrl}/reservations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar reservas");
    }

    return data;
}