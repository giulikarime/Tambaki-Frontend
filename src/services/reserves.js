<<<<<<< HEAD
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
=======
const apiUrl = process.env.REACT_APP_API_URL;
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

export async function createReservation(payload) {
    const response = await fetch(`${apiUrl}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const message = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message;
        throw new Error(message || "Erro ao criar reserva");
    }

    return data;
>>>>>>> 185f6eb79980197a308f888ca24cf44a0e629c47
}