const apiUrl = process.env.REACT_APP_API_URL;
export async function getProducts() {
    const response = await fetch(`${apiUrl}/products`, {
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
    const response = await fetch(`${apiUrl}/products/enums`);
    if (!response.ok) throw new Error('Erro ao buscar enums de produto');
    return response.json();
}

export async function createProducts(payload) {
    const response = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao criar produto");
    }

    return data;
}

export async function editProducts(id, payload) {
    const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao editar produto.");
    }

    return data;
}

export async function deleteProducts(id) {
    const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro ao deletar produto.");
    }

    return data;
}

export async function writeOffProducts(id, new_stock_quantity) {
    const response = await fetch(`${apiUrl}/products/${id}/write-off`, {
        method: 'PATCH', // método correto
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: new_stock_quantity }) // objeto com chave
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao dar baixa em produto.');
    }

    return data;
}
