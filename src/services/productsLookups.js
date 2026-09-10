const API_URL = 'http://localhost:3000';

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(',') : data.message;
        throw new Error(message || 'Erro na requisição');
    }
    return data;
}

export async function getCategories() {
    const response = await fetch(`${API_URL}/product-lookups/categories`);
    return handleResponse(response);
}

export async function getBrands() {
    const response = await fetch(`${API_URL}/product-lookups/brands`);
    return handleResponse(response);
}

export async function getStorageLocations() {
    const response = await fetch(`${API_URL}/product-lookups/storage-locations`);
    return handleResponse(response);
}