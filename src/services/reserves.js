import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;
const TTL_RESERVATIONS = 10 * 1000;

export function getReservations() {
    return cached('reservations:list', async () => {
        const response = await authenticatedFetch(`${apiUrl}/reservations`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Erro ao buscar reservas");
        return data;
    }, TTL_RESERVATIONS);
}

export async function createReservation(payload) {
    const response = await authenticatedFetch(`${apiUrl}/reservations`, {
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

    invalidate('reservations:list');
    return data;
}
