import React, { useState, useEffect } from 'react';

function ProductCard({ 
    item, 
    products, 
    setSelectedProduct, 
    setEditProductModalIsOpen, 
    editProductModalIsOpen, 
    setEditProductStatus, 
    setWriteOffSelectedProduct 
}){
    const [selectedBatch, setSelectedBatch] = useState(item);

    useEffect(() => {
        setSelectedBatch(item);
    }, [item]);

    const cardBatches = products.filter(p => p.name === item.name);

    const dateFab = new Date(selectedBatch.manufacture_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const dateVal = new Date(selectedBatch.expiration_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const handleSelectBatch = (e) => {
        e.stopPropagation();
        const val = e.target.value;
        if (!val) {
            setWriteOffSelectedProduct(null);
            return;
        }
        
        const found = cardBatches.find(b => String(b.id) === val);
        if (found) {
            setSelectedBatch(found);
            setWriteOffSelectedProduct(found);
        }
    };

    // --- CÁLCULO DE VALIDADE E DIAS RESTANTES ---
    const getDaysToExpiration = (dateString) => {
        if (!dateString) return 0;

        // Normaliza 'hoje' zerando as horas
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Extrai ano, mês e dia da string da data para evitar distorção de fuso horário UTC
        let year, month, day;
        if (typeof dateString === 'string' && dateString.includes('-')) {
            [year, month, day] = dateString.split('T')[0].split('-');
        } else {
            const d = new Date(dateString);
            year = d.getUTCFullYear();
            month = d.getUTCMonth() + 1;
            day = d.getUTCDate();
        }

        const expDate = new Date(Number(year), Number(month) - 1, Number(day));
        const diffMs = expDate - today;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    };

    const diffDias = getDaysToExpiration(selectedBatch.expiration_date);
    const isExpired = diffDias < 0;
    const isNearExpiration = diffDias >= 0 && diffDias <= 10;

    // Classe CSS do Card
    const getCardClass = () => {
        if (isExpired) return 'empty';
        if (isNearExpiration) return 'mid-empty';
        if (selectedBatch.stock_quantity === 0) return 'empty';
        if (selectedBatch.stock_quantity <= selectedBatch.min_stock) return 'mid-empty';
        return 'full';
    };

    return (
        <button 
            onClick={() => {
                setSelectedProduct(selectedBatch);
                setEditProductModalIsOpen(!editProductModalIsOpen);
                setEditProductStatus(false);
            }} 
            className={`card-products ${getCardClass()}`}
        >
            <div className="inside-container-card">
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <p style={{ fontSize: 20 }}>
                        <b>{selectedBatch.name} </b>
                        {selectedBatch.brand}
                    </p>
                    
                    <select 
                        value={selectedBatch.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSelectBatch}
                    >
                        {cardBatches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.batch}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="align-items-card">
                    {isExpired ? (
                        <p className="text-stock empty">Vencido</p>
                    ) : isNearExpiration ? (
                        <p className="text-stock mid-empty">Perto do Vencimento</p>
                    ) : selectedBatch.stock_quantity === 0 ? (
                        <p className="text-stock empty">Em Falta</p>
                    ) : selectedBatch.stock_quantity <= selectedBatch.min_stock ? (
                        <p className="text-stock mid-empty">Próximo de Acabar</p>
                    ) : (
                        <p className="text-stock full">Estoque Saudável</p>
                    )}

                    <p>
                        <b>
                            {selectedBatch.stock_quantity} {selectedBatch.unit_of_measure} / {selectedBatch.max_stock} {selectedBatch.unit_of_measure}
                        </b>
                    </p>
                </div>
            </div>

            <div className="bottom-container-card">
                <p>Fabricação: {dateFab}</p>
                <p>Validade: {dateVal}</p>
            </div>
        </button>
    );
}

export default ProductCard;