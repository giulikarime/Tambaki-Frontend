const apiUrl = import.meta.env.VITE_API_URL;

async function requestCosts(path, errorMessage, options = {}) {
    const response = await fetch(`${apiUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || errorMessage);
    }

    return data;
}

export function getCosts() {
    return requestCosts('/costs', "Erro ao buscar custos", { method: "GET" });
}

export function getFixedCosts() {
    return requestCosts('/costs/fixed', "Erro ao buscar custos fixos", { method: "GET" });
}

export function getVariableCosts() {
    return requestCosts('/costs/variable', "Erro ao buscar custos variáveis", { method: "GET" });
}

export function createCosts(payload) {
    return requestCosts('/costs', "Erro ao criar custo", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function editCosts(payload, id) {
    return requestCosts(`/costs/${id}`, "Erro ao editar custo", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export function deleteCosts(id) {
    return requestCosts(`/costs/${id}`, "Erro ao deletar custo", { method: "DELETE" });
}

export async function getCostsEnums() {
    const response = await fetch(`${apiUrl}/costs/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de custo');
    return response.json();
}
