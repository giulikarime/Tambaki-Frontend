import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;
const TTL_ORDERS = 30 * 1000;

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
    return cached(
        'orders:list',
        () => request('/orders', { method: "GET" }, "Erro ao buscar comandas"),
        TTL_ORDERS,
    );
}

export function getOpenOrders() {
    return cached(
        'orders:open',
        () => request('/orders/open/list', { method: "GET" }, "Erro ao buscar comandas abertas"),
        TTL_ORDERS,
    );
}

function invalidateOrdersData() {
    invalidate('orders:');
}

function invalidateHomeTables() {
    invalidate('tables:list');
    invalidate('reservations:');
}

export async function closeOrder(id) {
    const result = await request(`/orders/${id}/close`, { method: "PATCH" }, "Erro ao fechar comanda");
    invalidateOrdersData();
    invalidateHomeTables();
    return result;
}

export async function createOrder(payload) {
    const result = await request('/orders', {
        method: "POST",
        body: JSON.stringify(payload),
    }, "Erro ao abrir comanda");
    invalidateOrdersData();
    invalidateHomeTables();
    return result;
}

export function getOrderById(id) {
    return request(`/orders/${id}`, { method: "GET" }, "Erro ao buscar comanda");
}

export async function addOrderItem(orderId, payload) {
    const result = await request(`/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
    }, "Erro ao adicionar item");
    invalidateOrdersData();
    return result;
}

export async function updateOrderItem(orderId, itemId, payload) {
    const result = await request(`/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }, "Erro ao atualizar item");
    invalidateOrdersData();
    return result;
}
