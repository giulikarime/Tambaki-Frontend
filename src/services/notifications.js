const apiUrl = import.meta.env.VITE_API_URL;
export async function getNotifications() {
    const response = await fetch(`${apiUrl}}/notifications`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar notificações");
    }

    return data;
}