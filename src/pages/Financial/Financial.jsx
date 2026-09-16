import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './financial.css'
import { ChevronDown, ChevronLeft, ChevronRight, Funnel, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CMV from "../../components/CMV/CMV";
import Costs from "../../components/Costs/Costs";
import ClientsCosts from "../../components/ClientsCosts/ClientsCosts";
import ProfitPoint from "../../components/ProfitPoint/ProfitPoint";
import Modal from 'react-modal'
import React, { Fragment } from 'react';

function Financial(){

    const navigate = useNavigate();
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const presentDate = new Date();

    const month = new Date().toLocaleString('pt-BR', { month: 'long' });
    const year = presentDate.getFullYear();

    const cardsData = [
        {label: 'Custo de Mercadoria Vendida', value: 'R$ 38,2 k', subtitle: '4% vs. mês anterior', button: true, id: 'yellow', selected: 'CMV'},
        {label: 'Custos Fixos e Variáveis', value: 'R$ 21,6 k', subtitle: '2% vs. mês anterior', button: true, id: 'orange', selected: 'Custos'},
        {label: 'Lucro e Ponto de Equilíbrio', value: 'R$ 17,9 k', subtitle: 'Equilíbrio em 18 dias', button: true, id: 'blue', selected: 'Lucro'},
        {label: 'Maiores Gastos dos Clientes', value: 'Rodízio', subtitle: '42% do faturamento', button: false, id: 'dark-blue', selected: 'Clientes'}
    ];

    const [selectCard,setSelectedCard] = useState('CMV');

    const [filterModalIsOpen,setFilterModalIsOpen] = useState(false);
    const [filterIsClicked, setFilterIsClicked] = useState(null);

    const modalFilterStyle = {
        overlay: {
            backgroundColor: '#191444be',
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

    }

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Categoria": null,
        "Prazo": null,
    });

    const filtersModal = ["Categoria","Prazo"];

    const filtersData = {
        "Categoria": ["Carnes_e_Pescados", "Hortifrúti", "Laticínios", "Embutidos", "Secos"],
        "Prazo": ["1 a 3 dias", "4 a 6 dias", "7 a 10 dias", "+10 dias"],
    };

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div style={{display:'flex',flexDirection:'column',gap:15}}>
                            <div style={{display:'flex',flexDirection:'row',gap: 15,alignItems:'center'}}>
                                <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft></ChevronLeft></button>
                                <h1>Dashboard Financeiro</h1>
                            </div>
                            <p style={{ color: '#777171ff' }}>Unidade XYZ - {month.charAt(0).toUpperCase() + month.slice(1)} {year}</p>
                        </div>
                        <div>
                            <button
                                onClick={()=>setFilterModalIsOpen(!filterModalIsOpen)}
                                id='btn-funnel-base' 
                                className="btn-stock-base">Filtrar <Funnel size={20}></Funnel>
                            </button>
                        </div>
                    </div>
                    <div className="cards-dashboard">
                        {cardsData.map((card,index)=>(
                            <button
                                type="button"
                                onClick={()=>setSelectedCard(card.selected)}
                                key={index} 
                                className={`card-value ${card.id}`}>
                                <h2>{card.label}</h2>
                                <div className="card-value-container">
                                    <p className="subtitle-card">{card.value}</p>
                                    {card.button ? <button className="btn-add-card-value"><Plus></Plus></button> : ''}
                                </div>
                                <p>{card.subtitle}</p>
                            </button>
                        ))}
                    </div>
                    <div>
                        {selectCard === 'CMV' ? (<CMV/>) : selectCard === 'Custos' ? (<Costs/>) : selectCard === 'Lucro' ? (<ProfitPoint/>) : selectCard === 'Clientes' ? (<ClientsCosts/>) : null}
                    </div>
                </div>

                <Modal
                    isOpen={filterModalIsOpen}
                    onRequestClose={() => setFilterModalIsOpen(false)}
                    contentLabel="Modal de Filtros"
                    shouldCloseOnOverlayClick={true}
                    style={modalFilterStyle}
                    >
                    <div className="container-filters">
                        <div className="top-container-filters">
                        <h1>Filtrar Por</h1>
                        <button onClick={() => setFilterModalIsOpen(false)}>&times;</button>
                        </div>

                        {filtersModal.map((filters_item, index) => {
                            const isExpanded = filterIsClicked === index;

                            return (
                                <React.Fragment key={filters_item}>
                                    <button 
                                        type="button"
                                        onClick={() => setFilterIsClicked(isExpanded ? null : index)} 
                                        className="btn_filters_modal"
                                    >
                                        {filters_item} 
                                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                                    </button>

                                    {isExpanded && (
                                        <ul className="container-filters-options-users">
                                            {(filtersData[filters_item] || []).map((option) => {
                                                const isSelected = selectedModalFilters[filters_item] === option;

                                                return (
                                                    <li key={option}>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleSelectModalFilter(filters_item, option)}
                                                            className={isSelected ? "filter-option-active" : ""}
                                                        >
                                                            {option.replaceAll('_',' ')} {isSelected && "✓"}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <button 
                        className="btn-clear-filters"
                        onClick={() => setSelectedModalFilters({
                                "Categoria": null,
                                "Prazo": null,
                            })}
                        >Limpar Filtros do Modal</button>
                    </div>
                    </Modal>
            </main>
        </>
    );
}

export default Financial