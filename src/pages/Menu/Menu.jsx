import { useState, useEffect } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import MenuCard from "./MenuCard";
import { Plus, Funnel, ChevronDown, ChevronRight, ChevronLeft, Search } from "lucide-react";
import './menu.css';
import Modal from 'react-modal';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { getMenu, getMenuEnums, getTags } from "../../services/menu";

function Menu() {
    const navigate = useNavigate();

    const [menuEnums, setMenuEnums] = useState({
        categories: [],
    });

    const [tags,setTags] = useState(null);

    const filtersModal = ["Categorias", "Etiquetas"];
    const filtersData = {
        "Categorias": menuEnums.categories,
        "Etiquetas": tags,
    };
    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Categorias": null,
        "Etiquetas": null,
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

    useEffect(() => {
            async function get_enums() {
                try {
                    const enums_forms = await getMenuEnums();
                    setMenuEnums(enums_forms);
                } catch (error) {
                    console.error("Erro ao carregar os dados dos formularios.", error);
                }
            }
            get_enums();
        }, []);

    async function get_tags(){
        try{
            const tags_ = await getTags();
            setTags(tags_);
        }catch(error){
            console.error("Erro ao carregar dados dos formularios.",error);
        }
    }

    useEffect(()=>{
        get_tags();
    },[]);

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div style={{display:'flex',flexDirection:'column',gap:15}}>
                            <div style={{display:'flex',flexDirection:'row',gap: 15,alignItems:'center'}}>
                                <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft></ChevronLeft></button>
                                <h1>Cardápio</h1>
                            </div>
                            <p style={{ color: '#777171ff' }}>Visualize e edite seu cardápio.</p>
                        </div>
                        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:15}}>
                            <button onClick={()=>setAddMenuModalIsOpen(!addMenuModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                            <button className="btn-stock-base">Etiquetas</button>
                            <button
                                onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                             id='btn-funnel-base' 
                             className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                        </div>
                    </div>
                </div>
                
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
                                                        {option.replaceAll("_"," ")} {isSelected && "✓"}
                                                    </button>
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