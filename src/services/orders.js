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

export function getOrders() {
    return request('/orders', { method: "GET" }, "Erro ao buscar comandas");
}

export function closeOrder(id) {
    return request(`/orders/${id}/close`, { method: "PATCH" }, "Erro ao fechar comanda");
}

export function createOrder(payload) {
    return request('/orders', {
        method: "POST",
        body: JSON.stringify(payload),
    }, "Erro ao abrir comanda");
}

export function getOrderById(id) {
    return request(`/orders/${id}`, { method: "GET" }, "Erro ao buscar comanda");
}

export function addOrderItem(orderId, payload) {
    return request(`/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
    }, "Erro ao adicionar item");
}

export function updateOrderItem(orderId, itemId, payload) {
    return request(`/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }, "Erro ao atualizar item");
}
