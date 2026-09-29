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

    const today = new Date();

    useEffect(() => {
        setSelectedBatch(item);
    }, [item]);

    const cardBatches = products.filter(p => p.name === item.name);

    const dateFab = new Date(selectedBatch.manufacture_date).toLocaleDateString('pt-br', { timeZone: 'UTC' });
    const dateVal = new Date(selectedBatch.expiration_date).toLocaleDateString('pt-br', { timeZone: 'UTC' });

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

    const dateExpClean = new Date(selectedBatch.expiration_date)
    const isExpiredProduct = dateExpClean > today;

    return (
        <button 
            onClick={() => {
                setSelectedProduct(selectedBatch);
                setEditProductModalIsOpen(!editProductModalIsOpen);
                setEditProductStatus(false);
            }} 
            className={`card-products ${!isExpiredProduct? ('empty') : (selectedBatch.stock_quantity === 0 ? 'empty' : selectedBatch.stock_quantity <= selectedBatch.min_stock ? 'mid-empty' : 'full')}`}
        >
                <div className="inside-container-card">
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <p style={{ fontSize: 20 }}>
                            <b>{selectedBatch.name}</b> {selectedBatch.brand}
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
                        {!isExpiredProduct ? (
                            <p className="text-stock empty">Vencido</p>
                        ) : (
                            selectedBatch.stock_quantity === 0 ? (
                                <p className="text-stock empty">Em Falta</p>
                            ) : selectedBatch.stock_quantity <= selectedBatch.min_stock ? (
                                <p className="text-stock mid-empty">Próximo de Acabar</p>
                            ) : (
                                <p className="text-stock full">Estoque Saudável</p>
                            )
                        )}
                        <p><b>{selectedBatch.stock_quantity} {selectedBatch.unit_of_measure} / {selectedBatch.max_stock} {selectedBatch.unit_of_measure}</b></p>
                    </div>
                </div>

            <div className="bottom-container-card">
                <p>Fabricação: {dateFab}</p>
                <p>Validade: {dateVal}</p>
            </div>
        </button>
    );
};

export default ProductCard;