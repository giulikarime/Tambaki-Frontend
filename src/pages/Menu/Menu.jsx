import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import MenuCard from "./MenuCard";
import { Plus, Funnel, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import './menu.css';
import Modal from 'react-modal';
import React from 'react';
import { useNavigate } from "react-router-dom";

function Menu() {
    const navigate = useNavigate();

    const filtersModal = ["Modalidade", "Pratos", "Bebidas", "Sobremesas","Status"];
    const filtersData = {
        "Modalidade": ["Rodízio", "Self-Service", "A lá carte"],
        "Pratos": ["Entradas", "Principais"],
        "Bebidas": ["Geladas", "Quentes", "Alcóolicas", "Não-alcólicas"],
        "Sobremesas": ["Quentes", "Geladas"],
        "Status": ["Ativo", "Inativo", "Descontinuado"]
    };
    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Modalidade": null,
        "Pratos": null,
        "Bebidas": null,
        "Sobremesas": null,
        "Status": null
    });
    const [filterProductModalIsOpen, setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked, setFilterProductIsClicked] = useState(null);
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [addMenuModalIsOpen, setAddMenuModalIsOpen] = useState(false);
    
    function handleSelectModalFilter(category, option) {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    }

    const modalStyle = {
        overlay: {
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'absolute',
            overflowY: 'auto',
            maxHeight: '90vh',
            scrollbarWidth: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '65%',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }
    }

    // Estilo do modal de filtro 
    const modalFilterProductsStyle = {
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
    };

       const inputValues = [
        {label: "Nome do Prato", mode: "input", type: "text", name: "addDishesName"},
        {label: "Descrição", mode: "textarea", name: "addDishesDesc"},
        {label: "Preço", mode: "input", type: "number", name: "addDishesPrice"}
    ]

    

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <section className="principal-container-cardapio">
                    <div id="menu-header">
                        <div className="top-container-menu">
                            <button 
                                onClick={()=>navigate(-1)}
                                className="btn-back-base"
                                ><ChevronLeft></ChevronLeft></button>
                            <h1>Cardápio</h1>
                        </div>
                        <button className="botao-adicionar" onClick={() => setAddMenuModalIsOpen(true)}>
                            <Plus></Plus>
                        </button>

                        <button className="btn-menu-filter" onClick={() => setFilterProductModalIsOpen(true)}>
                            Filtrar Itens<Funnel size={25} />
                        </button>
                    </div>
                    <div id="menu-header-bottom"></div>

                </section>

                <section>
                    <Modal
                        isOpen={filterProductModalIsOpen}
                        onRequestClose={() => setFilterProductModalIsOpen(false)}
                        contentLabel="Modal de Filtros"
                        shouldCloseOnOverlayClick={true}
                        style={modalFilterProductsStyle}
                    >
                        <div className="container-filters">
                            <div className="top-container-filters">
                                <h1>Filtrar Por</h1>
                                <button onClick={() => setFilterProductModalIsOpen(false)}>&times;</button>
                            </div>

                            {filtersModal.map((filters_item, index) => {
                                const icon = filterProductIsClicked === index ? <ChevronDown /> : <ChevronRight />;

                                return (
                                    <React.Fragment key={filters_item}>
                                        <button
                                            onClick={() => setFilterProductIsClicked(filterProductIsClicked === index ? null : index)}
                                            className="btn_filters_modal"
                                        >
                                            {filters_item} {icon}
                                        </button>

                                        {filterProductIsClicked === index && (
                                            <ul className="container-filters-options">
                                                {filtersData[filters_item].map((option) => {
                                                    const isSelected = selectedModalFilters[filters_item] === option;

                                                    return (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleSelectModalFilter(filters_item, option)}
                                                            className={isSelected ? "filter-option-active" : ""}
                                                        >
                                                            {option} {isSelected && "✓"}
                                                        </button>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {/* Botão para limpar os filtros do modal de uma vez */}
                            <button
                                className="btn-clear-filters"
                                onClick={() => setSelectedModalFilters({
                                    "Modalidade": null,
                                    "Pratos": null,
                                    "Bebidas": null,
                                    "Sobremesas": null,
                                    "Status": null
                                })}
                            >
                                Limpar Filtros do Modal
                            </button>
                        </div>
                    </Modal>
                </section>

                <Modal
                    isOpen={addMenuModalIsOpen}
                    onRequestClose={()=>setAddMenuModalIsOpen(!addMenuModalIsOpen)}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Adicionar Prato"
                    style={modalStyle}
                >
                    <div className="modal-fundo">
                        <div className="top-container-modal">
                            <h2>Novo prato</h2>
                            <button
                                onClick={()=>setAddMenuModalIsOpen(!addMenuModalIsOpen)}
                            >&times;</button>
                        </div>
                    <form className="modal-conteudo">

                        {/* <div className="upload-imagem">
                            <div className="upload-preview" onClick={handleButtonClick}>
                                {preview ? <img src={preview} alt="Preview" /> : <span>Escolher foto</span>}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={imgRef}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </div> */}

                        {inputValues.map((item, index) => (
                            <div>
                                <label htmlFor="">{item.label}</label>
                                {item.mode === "input" ? (
                                    <input type={item.type} name={item.name}></input>
                                ) : (
                                    <textarea name={item.name}></textarea>
                                )} 
                            </div>
                        ))}

                        <div className="modal-botoes">
                            <button type="button">Cancelar</button>
                            <button type="submit">Adicionar prato</button>
                        </div>
                    </form>

                </div>
                </Modal>
            </main>
        </>
    );
}

export default Menu