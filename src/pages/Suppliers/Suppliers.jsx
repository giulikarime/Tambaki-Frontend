import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Funnel, Plus, SquarePen, Trash, X } from "lucide-react";
import { getSuppliers, getSuppliersEnums, createSuppliers, editSuppliers, deleteSuppliers } from "../../services/suppliers";
import './suppliers.css';
import Modal from 'react-modal';
import React from 'react';
import FiltersModal from "../../components/FiltersModal/FiltersModal";
import AlertModals from "../../components/SucessModals/AlertModals";
import { uploadFile } from "../../services/upload";

function Suppliers(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const [allSuppliers, setAllSuppliers] = useState([]);

    const [suppliersEnums, setSuppliersEnums] = useState({
        category: [],
    });

    const inputValues = [
        {label: 'Razão Social', model: 'input', type: 'text', name: 'company_name_add_supplier', placeholder: 'Digite o nome comercial...', placeholderEdit: `company_name`},
        {label: 'Nome Fantasia', model: 'input', type: 'text', name: 'trade_name_add_supplier', placeholder: 'Digite o nome fantasia...', placeholderEdit: `trade_name`},
        {label: 'CNPJ', model: 'input', type: 'text', name: 'cnpj_add_supplier', placeholder: 'Digite o CNPJ...', placeholderEdit: `cnpj`},
        {label: 'Endereço', model: 'input', type: 'text', name: 'adress_add_supplier', placeholder: 'Exemplo: Av. Paulista, 26, Paulista...', placeholderEdit: `adress`},
        {label: 'Nome do Responsável', model: 'input', type: 'text', name: 'resposible_name_add_supplier', placeholder: 'Digite o nome do responsável...', placeholderEdit: `resposible_name`},
        {label: 'Email', model: 'input', type: 'email', name: 'email_add_supplier', placeholder: 'Exemplo.: saborecia@gmail.com', placeholderEdit: `email`},
        {label: 'Telefone', model: 'input', type: 'text', name: 'phone_add_supplier', placeholder: 'Exemplo.: 1198765342', placeholderEdit: `phone`},
        {label: 'Prazo de Entrega', model: 'select', name: 'lead_time_days_add_supplier', placeholderEdit: `lead_time_days`},
        {label: 'Contrato de Trabalho', model: 'input', type: 'file', name: 'url_add_supplier'},
        {label: 'Categorias', model: 'input', type: 'text', list: true, name: 'categories_add_supplier', placeholder: 'Selecione categorias...', placeholderEdit: `categories`},
    ];

    // Modais
    const [createSupModalIsOpen, setCreateSupModalIsOpen] = useState(false);
    const [editSupModalIsOpen, setEditSupModalIsOpen] = useState(false);
    const [enableEditMode, setEnableEditMode] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Garantir que categorias sejam sempre mantidas como Array
    const [selectCategoriesForSupplier, setSelectCategoriesForSupplier] = useState([]);
    const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);

    useEffect(() => {
        if (selectedSupplier) {
            const rawCat = selectedSupplier.category;
            if (Array.isArray(rawCat)) {
                setSelectCategoriesForSupplier(rawCat);
            } else if (typeof rawCat === 'string' && rawCat.trim() !== '') {
                setSelectCategoriesForSupplier([rawCat]);
            } else {
                setSelectCategoriesForSupplier([]);
            }
        }
    }, [selectedSupplier]);

    const filtersModal = ["Categoria", "Prazo"];
    
    const filtersData = {
        "Categoria": suppliersEnums.category || [],
        "Prazo": ["1 a 3 dias", "4 a 6 dias", "7 a 10 dias", "+10 dias"],
    };

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Categoria": null,
        "Prazo": null,
    });

    useEffect(() => {
        async function get_enums() {
            try {
                const enums_suppliers = await getSuppliersEnums();
                setSuppliersEnums(enums_suppliers || {});
            } catch (error) {
                console.error("Erro ao carregar os dados dos formulários.", error);
            }
        }
        get_enums();
    }, []);

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
    };

    const [addCategorySelectIsClicked, setAddCategorySelectIsClicked] = useState(false);
    const fileRef = useRef(null);

    function handleButtonFile(){
        fileRef.current?.click();
    }

    const [documentUrl, setDocumentUrl] = useState('');
    const [fileName, setFileName] = useState('Nenhum arquivo selecionado.');

    async function handleFileClick(event) {
        const file = event.target.files[0];
        if(!file){
            setFileName('Nenhum arquivo selecionado');
            return;
        }
        setFileName(file.name);
        try {
            const url = await uploadFile(file);
            setDocumentUrl(url);
        } catch (error) {
            console.error("Erro ao enviar arquivo: ", error);
            setFormError('Não foi possível enviar o arquivo.');
        }
    }

    async function handleRemoveFile() {
        setFileName('Nenhum arquivo selecionado.');
        setDocumentUrl(null);
        setFormError(null);
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    }

    async function handleGetSuppliers() {
        try {
            const suppliers = await getSuppliers();
            setAllSuppliers(suppliers || []);
        } catch (error) {
            console.error("Erro ao carregar fornecedores.", error);
        }
    };

    useEffect(() => {
        handleGetSuppliers();
    }, []);

    const [search, setSearch] = useState('');

    const filteredSuppliers = allSuppliers.filter((supplier) => {
        if(search.trim() !== ''){
            const term = search.toLowerCase();
            const matchesCompanyName = supplier.company_name?.toLowerCase().includes(term);
            const matchesTradeName = supplier.trade_name?.toLowerCase().includes(term);

            if(!matchesCompanyName && !matchesTradeName){
                return false;
            }
        }

        if(selectedModalFilters["Categoria"]){
            const supCats = Array.isArray(supplier.category) ? supplier.category : [supplier.category];
            if(!supCats.includes(selectedModalFilters["Categoria"])){
                return false;
            }
        }

        if(selectedModalFilters["Prazo"]){
            const days = Number(supplier.lead_time_days);
            const selectedPrazo = selectedModalFilters["Prazo"];
            let matchesPrazo = false;

            if (selectedPrazo === "1 a 3 dias") {
                matchesPrazo = days >= 1 && days <= 3;
            } else if (selectedPrazo === "4 a 6 dias") {
                matchesPrazo = days >= 4 && days <= 6;
            } else if (selectedPrazo === "7 a 10 dias") {
                matchesPrazo = days >= 7 && days <= 10;
            } else if (selectedPrazo === "+10 dias") {
                matchesPrazo = days > 10;
            }

            if (!matchesPrazo) return false;
        }

        return true;
    });

    async function handleCreateSupplier(e){
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        // Garantia de envio como Array de strings
        const categoriesArray = Array.isArray(selectCategoriesForSupplier) 
            ? selectCategoriesForSupplier 
            : [selectCategoriesForSupplier];

        const payload = {
            company_name: formData.get('company_name_add_supplier'),
            trade_name: formData.get('trade_name_add_supplier'),
            cnpj: formData.get('cnpj_add_supplier'),
            phone: formData.get('phone_add_supplier'),
            email: formData.get('email_add_supplier'),
            adress: formData.get('adress_add_supplier'),
            category: categoriesArray, 
            url_document: documentUrl,
            lead_time_days: parseInt(formData.get('lead_time_days_add_supplier')) || 0,
            resposible_name: formData.get('resposible_name_add_supplier'),
        };

        try {
            await createSuppliers(payload);
            await handleGetSuppliers();
            setCreateSupModalIsOpen(false);
            setSelectCategoriesForSupplier([]);
            setFormSuccess('Fornecedor adicionado com sucesso.');
            setAlertType('success');
            setAlertModalIsOpen(true);
            handleRemoveFile();
            e.target.reset();
        } catch(error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleEditSupplier(e){
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        // Garantia de envio como Array de strings
        const categoriesArray = Array.isArray(selectCategoriesForSupplier) 
            ? selectCategoriesForSupplier 
            : [selectCategoriesForSupplier];

        const payload = {
            company_name: formData.get('company_name_add_supplier') || selectedSupplier.company_name,
            trade_name: formData.get('trade_name_add_supplier') || selectedSupplier.trade_name,
            cnpj: formData.get('cnpj_add_supplier') || selectedSupplier.cnpj,
            phone: formData.get('phone_add_supplier') || selectedSupplier.phone,
            email: formData.get('email_add_supplier') || selectedSupplier.email,
            adress: formData.get('adress_add_supplier') || selectedSupplier.adress,
            category: categoriesArray,
            url_document: documentUrl || selectedSupplier.url_document,
            lead_time_days: parseInt(formData.get('lead_time_days_add_supplier')) || selectedSupplier.lead_time_days,
            resposible_name: formData.get('resposible_name_add_supplier') || selectedSupplier.resposible_name,
        };

        try {
            await editSuppliers(payload, selectedSupplier.id);
            await handleGetSuppliers();
            setEditSupModalIsOpen(false);
            setFormSuccess(`${selectedSupplier.company_name} editado(a) com sucesso.`);
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch(error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteSupplier(){
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        try {
            await deleteSuppliers(selectedSupplier.id);
            await handleGetSuppliers();
            setEditSupModalIsOpen(false);
            setFormSuccess(`${selectedSupplier.company_name} deletado(a) com sucesso.`);
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch(error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted}></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted}></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div className="container">
                            <div style={{display:'flex', flexDirection:'row', gap: 15, alignItems:'center'}}>
                                <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft/></button>
                                <h1>Fornecedores</h1>
                            </div>
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
                                <button onClick={()=>{
                                    setSelectCategoriesForSupplier([]);
                                    setCreateSupModalIsOpen(true);
                                }} className='btn-plus-item sup'>Adicionar Fornecedor<Plus/></button>
                                <button
                                    onClick={()=>setFilterModalIsOpen(!filterModalIsOpen)}
                                    className='btn-funnel-base btn-plus-item blue-filter'>Filtrar <Funnel size={20}/></button>
                            </div>
                        </div>
                        <p style={{ color: '#777171ff' }}>Localize seus fornecedores e edite informações</p>
                    </div>
                    <div className="container-suppliers">
                        <table className="table"> 
                            <thead className="thead-style-sup tr-th-group">
                                <tr>
                                    <th className="entreprise">EMPRESA</th>
                                    <th className="category">CATEGORIA</th>
                                    <th className="deadline">PRAZO</th>
                                    <th className="phone">TELEFONE</th>
                                    <th className="email">EMAIL</th>
                                    <th className="info">INFORMAÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length !== 0 ? 
                                    filteredSuppliers.map((sup, i)=>{
                                        const displayCategories = Array.isArray(sup.category) 
                                            ? sup.category.map(c => String(c).replaceAll('_', ' ')).join(', ')
                                            : String(sup.category || '').replaceAll('_', ' ');

                                        return (
                                            <tr className="tr-th-group" key={i}>
                                                <td>{sup.company_name}</td>
                                                <td>{displayCategories || '-'}</td>
                                                <td>{sup.lead_time_days} {sup.lead_time_days > 1 ? 'dias' : 'dia'}</td>
                                                <td>{sup.phone}</td>
                                                <td>{sup.email}</td>
                                                <td>
                                                    <button onClick={()=>{
                                                        setSelectedSupplier(sup);
                                                        setEditSupModalIsOpen(true);
                                                    }} className="see-more-sup">Ver mais</button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                                <p>Nenhum fornecedor encontrado.</p>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL DE CRIAÇÃO */}
                <Modal
                    isOpen={createSupModalIsOpen}
                    onRequestClose={()=>{
                        setCreateSupModalIsOpen(false);
                        setAddCategorySelectIsClicked(false);
                    }}
                    contentLabel="Criar Fornecedor"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    <div className="top-container">
                        <div className="group-one-top-container">
                            <h2>Adicionar Fornecedor</h2>
                            <button onClick={()=>{
                                setCreateSupModalIsOpen(false);
                                setAddCategorySelectIsClicked(false);
                            }}>&times;</button>
                        </div>
                        <p style={{fontSize: 15, color: '#777171ff'}}>Adicione fornecedores à sua unidade.</p>
                    </div>
                    <form onSubmit={handleCreateSupplier} onClick={()=>addCategorySelectIsClicked ? setAddCategorySelectIsClicked(false) : ''}>
                        <div className="container-form">
                            {inputValues.map((item, index)=>(
                                item.model === 'input' ? (
                                    item.list ? (
                                        <div key={index} className="fields" style={{position:'relative'}}>
                                            <label>{item.label}</label>
                                            <div style={{display:'flex', flexDirection:'row', gap: '10px', alignItems:'center'}}>
                                                <ul className="input-select-model ul-list">
                                                    {selectCategoriesForSupplier.length <= 0 ? (
                                                        <p>Nenhuma categoria adicionada.</p>
                                                    ) : (
                                                        selectCategoriesForSupplier.map((categoria, idx)=>(
                                                            <li key={idx} className="li-style-model">
                                                                {String(categoria).replaceAll('_',' ')}
                                                                <button
                                                                    type="button"
                                                                    onClick={()=>setSelectCategoriesForSupplier(prev => prev.filter(c => c !== categoria))}
                                                                >&times;</button>
                                                            </li>
                                                        ))
                                                    )}                           
                                                </ul>
                                                <button 
                                                    className="add-category-ul-list"
                                                    type="button"
                                                    onClick={(e)=>{
                                                        e.stopPropagation();
                                                        setAddCategorySelectIsClicked(!addCategorySelectIsClicked);
                                                    }}
                                                >
                                                    <Plus/>
                                                </button>
                                            </div>
                                            {addCategorySelectIsClicked && (
                                                <ul className="add-categorie-select-sup">
                                                    {filtersData['Categoria']?.map((cat,i)=>(
                                                        <li key={i}>
                                                            <button
                                                                type="button"
                                                                onClick={(e)=>{
                                                                    e.stopPropagation();
                                                                    setSelectCategoriesForSupplier(prev => prev.includes(cat) ? prev : [...prev, cat]);
                                                                    setAddCategorySelectIsClicked(false);
                                                                }}
                                                            >{String(cat).replaceAll('_',' ')}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        item.type === 'file' ? (
                                            <div key={index} className="fields">
                                                <label>Contrato Assinado</label>
                                                <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                                    <input hidden onChange={handleFileClick} ref={fileRef} type="file"/>
                                                    <p>Adicionar arquivo</p>
                                                </button>
                                                <div className='file_name_style'>
                                                    <p style={{fontSize: 14, whiteSpace: 'nowrap'}}>{fileName}</p>
                                                    {fileName !== "Nenhum arquivo selecionado." && (
                                                        <button type="button" onClick={handleRemoveFile}>
                                                            <X color={'#3553b5'} size={15}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <input className="input-select-model" name={item.name} type={item.type} placeholder={item.placeholder} />
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <select className="input-select-model" name={item.name}>
                                            {filtersData["Prazo"].map((prazo, index)=>(
                                                <option key={index} value={prazo}>{prazo}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            ))}
                        </div>
                        <button className="btn-modal-submit" type="submit">Salvar</button>
                    </form>
                </Modal>

                {/* MODAL DE EDIÇÃO */}
                <Modal
                    isOpen={editSupModalIsOpen}
                    onRequestClose={()=>{
                        setEditSupModalIsOpen(false);
                        setEnableEditMode(false);
                        setAddCategorySelectIsClicked(false);
                    }}
                    contentLabel="Editar Fornecedor"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    {(()=>{
                        const principal_edit_text = enableEditMode ? `Edite ${selectedSupplier?.company_name}` : `${selectedSupplier?.company_name}`;
                        const enable_edit_text = enableEditMode ? `Desabilitar Edição` : `Habilitar Edição`;
                        const subtitle_edit_text = enableEditMode ? `Edite os dados de ${selectedSupplier?.company_name}` : `Visualize os dados de ${selectedSupplier?.company_name}`;

                        return(
                            <>
                                <div className="top-container">
                                    <div className="group-one-top-container">
                                        <h2>{principal_edit_text}</h2>
                                        <button
                                            type="button"
                                            onClick={()=>setEnableEditMode(!enableEditMode)}
                                            style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', fontSize:'18px'}}
                                        >
                                            {enable_edit_text}<SquarePen/>
                                        </button>
                                        <button onClick={()=>{
                                            setEditSupModalIsOpen(false);
                                            setEnableEditMode(false);
                                            setAddCategorySelectIsClicked(false);
                                        }}>&times;</button>
                                    </div>
                                    <p style={{fontSize: 15, color: '#777171ff'}}>{subtitle_edit_text}</p>
                                </div>
                                <form onSubmit={handleEditSupplier}>
                                    <div className="container-form">
                                        {inputValues.map((item, index)=>(
                                            item.model === 'input' ? (
                                                item.list ? (
                                                    <div key={index} className="fields" style={{position:'relative'}}>
                                                        <label>{item.label}</label>
                                                        <div style={{display:'flex', flexDirection:'row', gap: '10px', alignItems:'center'}}>
                                                            <ul className="input-select-model ul-list">
                                                                {selectCategoriesForSupplier.length === 0 ? (
                                                                    <p>Nenhuma categoria foi adicionada.</p>
                                                                ) : 
                                                                selectCategoriesForSupplier.map((categoria, idx)=>(
                                                                    <li key={idx} className="li-style-model">
                                                                        {String(categoria).replaceAll('_',' ')} 
                                                                        {enableEditMode && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={()=>setSelectCategoriesForSupplier(prev => prev.filter(c => c !== categoria))}
                                                                            >&times;</button>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {enableEditMode && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e)=>{
                                                                        e.stopPropagation();
                                                                        setAddCategorySelectIsClicked(!addCategorySelectIsClicked);
                                                                    }}
                                                                    className="add-category-ul-list"><Plus/></button> 
                                                            )}
                                                        </div>
                                                        {addCategorySelectIsClicked && (
                                                            <ul className="add-categorie-select-sup">
                                                                {filtersData['Categoria']?.map((cat,i)=>(
                                                                    <li key={i}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e)=>{
                                                                                e.stopPropagation();
                                                                                setSelectCategoriesForSupplier(prev => prev.includes(cat) ? prev : [...prev, cat]);
                                                                                setAddCategorySelectIsClicked(false);
                                                                            }}
                                                                        >{String(cat).replaceAll('_',' ')}</button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ) : (
                                                    item.type === 'file' ? (
                                                        <div key={index} className="fields">
                                                            <label>Contrato Assinado</label>
                                                            <button type="button" 
                                                                onClick={enableEditMode ? handleButtonFile : () => {
                                                                    if (selectedSupplier?.url_document) {
                                                                        window.open(selectedSupplier.url_document, '_blank', 'noopener,noreferrer');
                                                                    } else {
                                                                        setFormError('Nenhum arquivo cadastrado para esse fornecedor.');
                                                                    }
                                                                }} 
                                                                className="btn-modal-file-users">
                                                                <p>{enableEditMode ? 'Adicionar Arquivo' : 'Ver arquivo'}</p>
                                                                {enableEditMode && (
                                                                    <input hidden type="file" ref={fileRef} onChange={handleFileClick}/>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div key={index} className="fields">
                                                            <label>{item.label}</label>
                                                            <input 
                                                                className="input-select-model" 
                                                                name={item.name} 
                                                                type={item.type} 
                                                                defaultValue={selectedSupplier?.[item.placeholderEdit] || ''} 
                                                            />
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div key={index} className="fields">
                                                    <label>{item.label}</label>
                                                    <select disabled={!enableEditMode} className="input-select-model" name={item.name} defaultValue={selectedSupplier?.[item.placeholderEdit] || ''}>
                                                        {filtersData["Prazo"].map((prazo, idx)=>(
                                                            <option key={idx} value={prazo}>{prazo}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    {enableEditMode && (
                                        <div style={{display:'flex', flexDirection:'row', gap: 10, marginTop: '20px'}}>
                                            <button className="btn-modal-submit" type="submit">Salvar</button>
                                            <button type="button" onClick={handleDeleteSupplier} className="btn-modal-submit trash"><Trash/></button>
                                        </div>
                                    )}
                                </form>
                            </>
                        );
                    })()}
                </Modal>

                <FiltersModal
                    isOpen={filterModalIsOpen}
                    setIsOpen={setFilterModalIsOpen}
                    filtersTitle={filtersModal}
                    filtersData={filtersData}
                    selectedFilters={selectedModalFilters}
                    setSelectedFilters={setSelectedModalFilters}
                />

                <AlertModals
                    phrase={formSuccess ? formSuccess : formError}
                    isOpen={alertModalIsOpen}
                    setIsOpen={setAlertModalIsOpen}
                    type={alertType}
                />
            </main>
        </>
    );
}

export default Suppliers;