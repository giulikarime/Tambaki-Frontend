import { authenticatedFetch } from './authenticatedFetch';
import { cached, invalidate } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;

function invalidateFinancialProducts() {
    invalidate('costs:financial-products');
}

export async function getProducts() {
    return cached(
        'products:list',
        async () => {
            const response = await authenticatedFetch(`${apiUrl}/products`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao buscar produtos");
            }

            return data;
        },
        30 * 1000,
    );
}

export function getProductEnums() {
    return cached('products:enums', async () => {
        const response = await authenticatedFetch(`${apiUrl}/products/enums`);
        if (!response.ok) throw new Error('Erro ao buscar enums de produto');
        return response.json();
    }, 60 * 60 * 1000);
}

export async function createProducts(payload) {
    const response = await authenticatedFetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar produto");
    }

    invalidate('products:list');
    invalidateFinancialProducts();
    return data;
}

export async function editProducts(id, payload) {
    const response = await authenticatedFetch(`${apiUrl}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao editar produto.");
    }

    invalidate('products:list');
    invalidateFinancialProducts();
    return data;
}

export async function deleteProducts(id) {
    const response = await authenticatedFetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao deletar produto.");
    }

    invalidate('products:list');
    invalidateFinancialProducts();
    return data;
}

export async function writeOffProducts(id, new_stock_quantity) {
    const response = await authenticatedFetch(`${apiUrl}/products/${id}/write-off`, {
        method: 'PATCH', // método correto
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: new_stock_quantity }) // objeto com chave
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao dar baixa em produto.');
    }

    invalidate('products:list');
    invalidateFinancialProducts();
    return data;
}
