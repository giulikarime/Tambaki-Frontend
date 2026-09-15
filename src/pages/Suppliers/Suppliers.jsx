import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import {ChevronLeft,ChevronRight,ChevronDown,Funnel,Plus,Search,SquarePen,Trash} from "lucide-react";

import { getSuppliers } from "../../services/suppliers";
import './suppliers.css'
import { AuthContext } from "../../services/AuthContext";
import Modal from 'react-modal'
import React, { Fragment } from 'react';

function Suppliers(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();
    const [formError,setFormError] = useState('');

    const [allSuppliers,setAllSuppliers] = useState([]);
    const {user} = useState(AuthContext);

    const [rolevalue,setRoleValue] = useState('');
    const [accessLevelValue,setAccessLevelValue] = useState('');
    const [employTypeValue,setEmployTypeValue] = useState('');
    const [shiftValue,setShiftValue] = useState('');

    const [usersEnums,setUsersEnums] = useState({
        roles: [],
        access_levels: [],
        employ_types: [],
        shifts: [],
    })

    const inputValues = [
        {label: 'Razão Social', model: 'input', type: 'text', name: 'company_name_add_supplier', placeholder: 'Digite o nome comercial...', placeholderEdit: `company_name`},
        {label: 'Nome Fantasia', model: 'input', type: 'text', name: 'trade_name_add_supplier', placeholder: 'Digite o nome fantasia...', placeholderEdit: `trade_name`},
        {label: 'CNPJ', model: 'input', type: 'text', name: 'cnpj_add_supplier', placeholder: 'Digite o CNPJ...', placeholderEdit: `cnpj`},
        {label: 'Formas de Pagamento', model: 'input', type: 'text', name: 'payment_terms_add_supplier', placeholder: 'Insira formas de pagamento...', placeholderEdit: `payment_terms`},
        {label: 'Endereço', model: 'input', type: 'text', name: 'adress_add_supplier', placeholder: 'Exemplo: Av. Paulista, 26, Paulista...', placeholderEdit: `adress`},
        {label: 'Email', model: 'input', type: 'email', name: 'email_add_supplier',placeholder: 'Exemplo.: saborecia@gmail.com', placeholderEdit: `email`},
        {label: 'Telefone', model: 'input', type: 'text', name: 'phone_add_supplier',placeholder: 'Exemplo.: 1198765342', placeholderEdit: `phone`},
        {label: 'Prazo de Entrega', model: 'select', name: 'lead_time_days_add_supplier', placeholderEdit: `lead_time_days`},
        {label: 'Categorias', model: 'input', type: 'text', list: true, name: 'categories_add_supplier',placeholder: 'Selecione categorias...', placeholderEdit: `categories`}
    ]

    //modais
    const [createSupModalIsOpen,setCreateSupModalIsOpen] = useState(false);
    const [editSupModalIsOpen,setEditSupModalIsOpen] = useState(false);
    const [enableEditMode,setEnableEditMode] = useState(false);
    const [selectedSupplier,setSelectedSupplier] = useState(null);

    const filtersModal = ["Categoria","Prazo"];
    
    const filtersData = {
        "Categoria": ["Carnes_e_Pescados", "Hortifrúti", "Laticínios", "Embutidos", "Secos"],
        "Prazo": ["1 a 3 dias", "4 a 6 dias", "7 a 10 dias", "+10 dias"],
    };

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Categoria": null,
        "Prazo": null,
    });

    const [filterProductModalIsOpen, setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked, setFilterProductIsClicked] = useState(null);

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

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
            maxHeight: '80vh',
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

    const fileRef = useRef(null);

    function handleButtonFile(){
        fileRef.current.click()
    }

    function handleInputFile(e){
        const file = e.target.files[0];
    }

    async function handleGetSuppliers() {
        try{
            const suppliers = await getSuppliers();
            setAllSuppliers(suppliers);
        } catch (error){
            console.error("Erro ao carregar forncedores.",error);
        }
    };

    useEffect(()=>{
        handleGetSuppliers();
    },[])

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
                                <h1>Fornecedores</h1>
                            </div>
                            <p style={{ color: '#777171ff' }}>Localize seus fornecedores e edite informações</p>
                        </div>
                        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:15}}>
                            <button onClick={()=>setCreateSupModalIsOpen(!createSupModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                            <button
                                onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                             id='btn-funnel-base' 
                             className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                            <div style={{ position: "relative"}}>
                                <Search 
                                    style={{ 
                                    position: "absolute", 
                                    left: "16px", 
                                    top: "50%", 
                                    transform: "translateY(-50%)", 
                                    color: "#00000065" 
                                    }} 
                                    size={20} 
                                />
                                <input 
                                    type="search" 
                                    placeholder="Buscar forncedores..." 
                                    style={{ 
                                    backgroundColor: "#cae2ff", 
                                    fontSize: "16px", 
                                    padding: "10px 20px", 
                                    paddingLeft: "50px",
                                    borderRadius: "50px", 
                                    width: "100%" ,
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="container-users">
                        <table> 
                            <thead className="thead-style tr-th-group">
                                <th>EMPRESA</th>
                                <th>CATEGORIA</th>
                                <th>PRAZO</th>
                                <th>TELEFONE</th>
                                <th>EMAIL</th>
                            </thead>
                            <tbody>
                                {allSuppliers.map((sup,index)=>(
                                    <>
                                        <tr className="tr-th-group" key={index}>
                                            <td>{sup.company_name}</td>
                                            <td>{sup.category}</td>
                                            <td>{sup.lead_time_days}</td>
                                            <td>{sup.phone}</td>
                                            <td>{sup.email}</td>
                                            <td><button onClick={()=>{
                                                setEditUserModalIsOpen(!editUserModalIsOpen)
                                                setSelectedSupplier(sup)
                                                }} className="see-more-users">Ver mais</button></td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    isOpen={createSupModalIsOpen}
                    onRequestClose={()=>setCreateSupModalIsOpen(!createSupModalIsOpen)}
                    contentLabel="Criar Forncedor"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    <div className="top-container">
                        <div className="group-one-top-container">
                            <h2>Adicionar Fornecedor</h2>
                            <button onClick={()=>setCreateSupModalIsOpen(!createSupModalIsOpen)}>&times;</button>
                        </div>
                        <p style={{'font-size': 15,'color': '#777171ff'}}>Adicione fornecedores à sua unidade.</p>
                    </div>
                    <form action="">

                        <div className="container-form">
                            {inputValues.map((item,index)=>(
                                item.model === 'input' ? (
                                    item.list ? (
                                    
                                        <div key={index} className="fields">
                                            <label>{item.label}</label>
                                            <ul className="input-select-model ul-list">
                                                {filtersData['Categoria'].map((categoria)=>(
                                                    <li
                                                        className="li-style-model"
                                                    >{categoria.replaceAll('_',' ')} 
                                                        <button>&times;</button> 
                                                    </li>
                                                ))}
                                                <button className="add-category-ul-list"><Plus></Plus></button>
                                            </ul>
                                            
                                        </div>
                                        
                                    ) : (
                                        <div key={index} className="fields">
                                            <label>{item.label}</label>
                                            <input className="input-select-model" name={item.name} type={item.type} placeholder={item.placeholder} />
                                        </div>)
                                ) : (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <select className="input-select-model" name={item.name}>
                                            {filtersData["Prazo"].map((prazo,index)=>(
                                                <option key={index} value={prazo}>{prazo}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            ))}

                            <div className="fields">
                                <label htmlFor="">Contrato Assinado</label>
                                <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                    <input hidden onChange={handleInputFile} ref={fileRef} type="file" name="" id="" />
                                    <p>Adicionar arquivo</p>
                                </button>
                            </div>
                        </div>
                        <button className="btn-modal-submit" type="submit">Salvar</button>
                    </form>
                </Modal>

                <Modal
                    isOpen={editSupModalIsOpen}
                    onRequestClose={()=>{
                        setEditSupModalIsOpen(!editSupModalIsOpen)
                        setEnableEditMode(false);
                    }}
                    contentLabel="Editar Usuário"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    {(()=>{
                        const principal_edit_text = enableEditMode ? `Edite ${selectedSupplier?.name}` : `${selectedSupplier?.name}`;
                        const enable_edit_text = enableEditMode ? `Desabilitar Edição` : `Habilitar Edição`;
                        const subtitle_edit_text = enableEditMode ? `Edite os dados de ${selectedSupplier?.name}` : "" ;

                        return(
                            <>
                            <div className="top-container">
                                <div className="group-one-top-container">
                                    <h2>{principal_edit_text}</h2>
                                    <button
                                        onClick={()=>setEnableEditMode(!enableEditMode)}
                                        style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'10px',fontSize:'18px'}}>{enable_edit_text}<SquarePen></SquarePen></button>
                                    <button onClick={()=>{
                                        setEditSupModalIsOpen(!editSupModalIsOpen)
                                        setEnableEditMode(false)
                                    }}>&times;</button>
                                </div>
                                <p style={{'font-size': 15,'color': '#777171ff'}}>{subtitle_edit_text}</p>
                            </div>
                            <form action="">

                                <div className="container-form">
                                    {inputValues.map((item,index)=>(
                                        item.model === 'input' ? (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <input readOnly={!enableEditMode} className="input-select-model" name={item.name} type={item.type} placeholder={selectedSupplier?.[item.placeholderEdit]} />
                                            </div>
                                        ) : (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <select readOnly={!enableEditMode} className="input-select-model" name={item.name}>
                                                    <option>Outros</option>
                                                </select>
                                            </div>
                                        )
                                    ))}

                                    <div className="fields">
                                        <label htmlFor="">Contrato de Trabalho</label>
                                        <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                            <input hidden onChange={handleInputFile} ref={fileRef} type="file" name="" id="" />
                                            <p>{enableEditMode ? ("Adicionar arquivo") : ("Ver arquivo")}</p>
                                        </button>
                                    </div>
                                </div>
                                {enableEditMode ? (
                                    <div style={{display:'flex',flexDirection:'row',gap: 10}}>
                                        <button className="btn-modal-submit" type="submit">Salvar</button>
                                        <button className="btn-modal-submit"><Trash></Trash></button>
                                    </div>
                                ) : (
                                    ''
                                )}
                            </form>
                            </>
                        )
                    })()}
                </Modal>

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
                            const isExpanded = filterProductIsClicked === index;

                            return (
                                <React.Fragment key={filters_item}>
                                    <button 
                                        type="button"
                                        onClick={() => setFilterProductIsClicked(isExpanded ? null : index)} 
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

export default Suppliers