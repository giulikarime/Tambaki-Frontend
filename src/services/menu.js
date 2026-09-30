const API_URL = 'http://localhost:3000';

export async function getMenu() {
    const response = await fetch(`${API_URL}/menu`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar pratos");
    }

    return data;
}

export async function getMenuEnums() {
    const response = await fetch(`${API_URL}/menu/enum`);
    if (!response.ok) throw new Error('Erro ao buscar enums de produto');
    return response.json();
}

