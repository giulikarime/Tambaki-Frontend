import { authenticatedFetch } from './authenticatedFetch';

const apiUrl = import.meta.env.VITE_API_URL;

async function request(path, options, errorMessage) {
    const response = await authenticatedFetch(`${apiUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || errorMessage);
    return data;
}

export function getCmvPlannings(year) {
    return request(
        `/cmv-planning?year=${year}`,
        { method: "GET" },
        "Erro ao buscar planejamentos de CMV",
    );
}

export function saveCmvPlanning(payload) {
    return request(
        '/cmv-planning',
        { method: "POST", body: JSON.stringify(payload) },
        "Erro ao salvar planejamento de CMV",
    );
}
