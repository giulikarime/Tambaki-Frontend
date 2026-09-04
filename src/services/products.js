const API_URL = "http://localhost:3000";

export async function getProducts() {
    const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar produtos");
    }

    return data;
}

export async function getProductEnums() {
    const response = await fetch('http://localhost:3000/products/enums');
    if (!response.ok) throw new Error('Erro ao buscar enums de produto');
    return response.json();
}

export async function createProducts(payload){
    const response = await fetch(`${API_URL}/products`,{
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Erro ao criar produto");
    }

    return data;
}