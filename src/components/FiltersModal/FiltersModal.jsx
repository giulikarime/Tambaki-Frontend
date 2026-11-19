import React, { useState } from 'react';
import Modal from 'react-modal';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './filters_modal.css';

Modal.setAppElement('#root');

function FiltersModal({
    isOpen,
    setIsOpen,
    filtersTitle = [],
    filtersData = {},
    selectedFilters,
    setSelectedFilters
}) {
    const [openCategoryIndex, setOpenCategoryIndex] = useState(null);

    const handleSelectFilter = (category, option) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

    const handleClearFilters = () => {
        // Reseta todas as categorias dinamicamente para null
        const clearedState = filtersTitle.reduce((acc, curr) => {
            acc[curr] = null;
            return acc;
        }, {});
        
        setSelectedFilters(clearedState);
    };

    const modalStyles = {
        overlay: {
            backgroundColor: 'rgba(25, 20, 68, 0.75)',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'fixed',
            top: '0',
            right: '0',
            left: 'auto',
            bottom: '0',
            width: '300px',
            maxHeight: '100vh',
            padding: '20px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            margin: '0'
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            contentLabel="Modal de Filtros"
            shouldCloseOnOverlayClick={true}
            style={modalStyles}
        >
            <div className="container-filters">
                <div className="top-container-filters">
                    <h1>Filtrar Por</h1>
                    <button onClick={() => setIsOpen(false)}>&times;</button>
                </div>

                {filtersTitle.map((title, index) => {
                    const isExpanded = openCategoryIndex === index;
                    const icon = isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />;

                    return (
                        <React.Fragment key={title}>
                            <button
                                type="button"
                                onClick={() => setOpenCategoryIndex(isExpanded ? null : index)}
                                className="btn_filters_modal"
                            >
                                {title} {icon}
                            </button>

                            {isExpanded && filtersData[title] && (
                                <ul className="container-filters-options">
                                    {filtersData[title].map((option) => {
                                        // 1. Extrai o texto/valor legível para comparação e exibição
                                        const optionValue = typeof option === 'object' ? (option.value || option.name || option.id) : option;
                                        const optionLabel = typeof option === 'object' ? (option.label || option.name) : String(option);

                                        // 2. Compara se o item atual é o selecionado
                                        const isSelected = selectedFilters[title] === optionValue;

                                        return (
                                            <button
                                                type="button"
                                                key={optionValue}
                                                onClick={() => handleSelectFilter(title, optionValue)}
                                                className={isSelected ? "filter-option-active" : ""}
                                            >
                                                {optionLabel.replaceAll('_', ' ')} {isSelected && " ✓"}
                                            </button>
                                        );
                                    })}
                                </ul>
                            )}
                        </React.Fragment>
                    );
                })}

                <button
                    type="button"
                    className="btn-clear-filters"
                    onClick={handleClearFilters}
                >
                    Limpar Filtros
                </button>
            </div>
        </Modal>
    );
}

export default FiltersModal;