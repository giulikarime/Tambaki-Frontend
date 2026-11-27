// src/services/costs.js
import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;

// Quanto tempo cada tipo de dado fica em cache
const TTL_COSTS = 2 * 60 * 1000;        // custos: mudam pouco, 2 min
const TTL_PRODUCTS = 5 * 60 * 1000;     // dados financeiros dos produtos: 5 min
const TTL_ENUMS = 60 * 60 * 1000;       // enums: praticamente nunca mudam, 1 h

async function requestCosts(path, errorMessage, options = {}) {
    const response = await authenticatedFetch(`${apiUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || errorMessage);
    }

    return data;
}

// ---------- LEITURAS (com cache) ----------

export function getCosts() {
    return cached(
        'costs:list',
        () => requestCosts('/costs', "Erro ao buscar custos", { method: "GET" }),
        TTL_COSTS
    );
}

export function getFinancialProducts() {
    return cached(
        'costs:financial-products',
        () => requestCosts('/costs/financial-products', "Erro ao buscar dados financeiros", { method: "GET" }),
        TTL_PRODUCTS
    );
}

export function getFixedCosts() {
    return cached(
        'costs:fixed',
        () => requestCosts('/costs/fixed', "Erro ao buscar custos fixos", { method: "GET" }),
        TTL_COSTS
    );
}

export function getVariableCosts() {
    return cached(
        'costs:variable',
        () => requestCosts('/costs/variable', "Erro ao buscar custos variáveis", { method: "GET" }),
        TTL_COSTS
    );
}

export function getCostsEnums() {
    return cached(
        'costs:enums',
        async () => {
            const response = await authenticatedFetch(`${apiUrl}/costs/enums`);
            if (!response.ok) throw new Error('Erro ao buscar enums de custo');
            return response.json();
        },
        TTL_ENUMS
    );
}

// ---------- ESCRITAS (invalidam o cache de custos) ----------
// Depois de criar/editar/apagar, a próxima leitura busca dado novo no servidor.
// Os enums não são afetados, então ficam em cache.

function invalidateCostsData() {
    invalidate('costs:list');
    invalidate('costs:fixed');
    invalidate('costs:variable');
    invalidate('costs:financial-products');
}

export async function createCosts(payload) {
    const result = await requestCosts('/costs', "Erro ao criar custo", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    invalidateCostsData();
    return result;
}

export async function editCosts(payload, id) {
    const result = await requestCosts(`/costs/${id}`, "Erro ao editar custo", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    invalidateCostsData();
    return result;
}

export async function deleteCosts(id) {
    const result = await requestCosts(`/costs/${id}`, "Erro ao deletar custo", { method: "DELETE" });
    invalidateCostsData();
    return result;
}