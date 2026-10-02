import { useState, useEffect, useRef } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import MenuCard from "./MenuCard";
import { Plus, Funnel, ChevronDown, ChevronRight, ChevronLeft, Search, Camera, Form, SquarePen, Trash } from "lucide-react";
import './menu.css';
import Modal from 'react-modal';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { getMenu, getMenuEnums } from "../../services/menu";
import AlertModals from "../../components/SucessModals/AlertModals";
import { getTags, createTags, deleteTags, editTags } from "../../services/tags";

function Menu() {
    const navigate = useNavigate();
    const [formError,setFormError] = useState('');
    const [formSuccess,setFormSuccess] = useState('');
    const [alertType,setAlertType] = useState('');
    const [alertModalIsOpen,setAlertModalIsOpen] = useState(false);

    const [menu,setMenu] = useState([]);

    const [menuEnums, setMenuEnums] = useState({
        category: [],
    });

    const [tags,setTags] = useState([]);
    const [tagsModalIsOpen,setTagsModalIsOpen] = useState(false);
    const [editTagsModalIsOpen,setEditTagsModalIsOpen] = useState(false);
    const [selectedTag,setSelectedTag] = useState(null);

    const [preview,setPreview] = useState([]);
    const [indexOfPreview,setIndexOfPreview] = useState(0);

    const filtersModal = ["Categorias", "Etiquetas"];
    const filtersData = {
        "Categorias": menuEnums.category,
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
            padding: '30px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }
    }

    const modalStyleTags = {
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
            width: '40%',
            padding: '30px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }
    }

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
        {label: "Preço", mode: "input", type: "number", name: "addDishesPrice"},
        {label: "Alergênicos", mode: "select", name: "addDishesAllergens"},
        {label: "Etiqueta", mode: "select", name: "addDishesTag"},
        {label: ".", text: 'Salvar', mode: "button", type: 'submit', name: "addDishesTag"},
    ]

    async function get_menus(){
        try{
            const menu_value = await getMenu();
            setMenu(menu_value);
        } catch (error){
            console.error("Não foi possível carregar os pratos.", error);
        }
    }

    useEffect(()=>{
        get_menus();
    },[])

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

    const imgRef = useRef(null);

    function handleButtonClickFile(){
        imgRef.current.click();
    }   

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        
        setPreview((prev) => [...prev, ...newPreviews]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
            setPreview((prev) => [...prev, ...newPreviews]);
        } else {
            alert('Por favor, envie apenas arquivos de imagem.');
        }
    };

    function emptyPreviewBeforeSaving() {
        preview.forEach((url) => URL.revokeObjectURL(url));

        setPreview([]);

        if (imgRef.current) {
            imgRef.current.value = "";
        }
    }

    function handleChangeImageRight(){
        if(!preview || preview.length === 0){
            return;
        }

        setIndexOfPreview((prevIndex)=>
            prevIndex >= preview.length - 1 ? 0 : prevIndex+1
        )
    }

    function handleChangeImageLeft(){
        if(!preview || preview.length === 0){
            return;
        }

        setIndexOfPreview((prevIndex)=>
            prevIndex <= 0 ? prevIndex.length - 1 : prevIndex-1
        )
    }

    async function handleCreateMenu(e){
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        if(!preview || preview.length <= 0){
            setFormError('A imagem do cardápio não pode ser vazia');
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        const payload = {
            //Terminar de fazer quando o back estiver pronto.
        }
    }

    async function handleCreateTags(e){
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        
        const formData = new FormData(e.target);

        if(String(formData.get('addTagName')).trim() === '' || String(formData.get('addTagColor')).trim() === ''){
            setFormError("Preencha os campos para criar uma etiqueta.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        const payload = {
            name: String(formData.get('addTagName')),
            color: String(formData.get('addTagColor')),
        };

        try{
            await createTags(payload);
            await get_tags();
            setFormSuccess("Etiqueta criada com sucesso.");
            setAlertType('success');
            setAlertModalIsOpen(true);
            e.target.reset();
        } catch(error){
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteTags(itemToDelete){
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        try{
            await deleteTags(itemToDelete.id);
            await get_tags();
            setFormSuccess(`${itemToDelete.name} deletado(a) com sucesso.`);
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error){
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleEditTags(e){
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        
        const formData = new FormData(e.target);

        const payload = {
            name: String(formData.get('editTagName')) || selectedTag.name,
            color: String(formData.get('editTagColor')) || selectedTag.color,
        };

        try{
            await editTags(payload,selectedTag.id);
            await get_tags();
            setFormSuccess("Etiqueta criada com sucesso.");
            setAlertType('success');
            setAlertModalIsOpen(true);
            setEditTagsModalIsOpen(false);
            e.target.reset();
        } catch(error){
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
            setEditTagsModalIsOpen(false);
        }
    }


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
                            <button onClick={()=>setTagsModalIsOpen(!tagsModalIsOpen)} className="btn-stock-base">Etiquetas</button>
                            <button
                                onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                             id='btn-funnel-base' 
                             className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                        </div>
                    </div>
                    <div>
                        {menu.length <= 0 ? (
                            'Nenhum prato cadastrado.'
                        ) : (
                            menu.map((item,i)=>(
                                <div key={i}>
                                    <p>{item.name}</p>
                                </div>
                            ))
                        )}
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
                                            {(filtersData[filters_item] || []).map((option) => {
                                                const isObject = typeof option === 'object' && option !== null;
                                                const optionValue = isObject ? (option.id || option.name) : option;
                                                const optionLabel = isObject 
                                                    ? option.name 
                                                    : option.replaceAll("_", " ");
                                                const isSelected = selectedModalFilters[filters_item] === option;

                                                return (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleSelectModalFilter(filters_item, optionValue)}
                                                        className={isSelected ? "filter-option-active" : ""}
                                                    >
                                                        {optionLabel} {isSelected && "✓"}
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
                    onRequestClose={()=>{
                        setAddMenuModalIsOpen(!addMenuModalIsOpen)
                        emptyPreviewBeforeSaving()
                    }}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Adicionar Prato"
                    style={modalStyle}
                >
                        <div className="top-container-modal">
                            <h2>Novo prato</h2>
                            <button
                                onClick={()=>{
                                    setAddMenuModalIsOpen(!addMenuModalIsOpen)
                                    emptyPreviewBeforeSaving()
                                }}
                                style={{fontSize:30}}
                            >&times;</button>
                        </div>

                        <form className="form-add-menu">

                            <div>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    {preview.length > 0 ? (
                                        <div className="container-exibe-image">
                                            <img src={preview[indexOfPreview]}className="card-full-image"></img>
                                            {preview.length > 1 ? (
                                                <div className="container-buttons-change-image">
                                                    <button 
                                                        type="button"
                                                        className="btn-change-image-bg"
                                                        onClick={handleChangeImageLeft}><ChevronLeft color="white"></ChevronLeft></button>
                                                    <button
                                                        type="button"
                                                        className="btn-change-image-bg"
                                                        onClick={handleChangeImageRight}><ChevronRight color="white"></ChevronRight></button>
                                                </div>
                                            ) : ('')}
                                        </div>
                                    ) : (
                                        <div className="container-add-image">
                                            <label htmlFor="">Arraste ou solte imagens aqui</label>
                                            <Camera></Camera>
                                        </div>
                                    )}
                                </div>

                                <button type="button" onClick={handleButtonClickFile}>
                                    <input
                                        className=""
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        ref={imgRef}
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="">Adicione imagens</label>
                                </button>
                            </div>

                            <div className="modal-conteudo">
                                {inputValues.map((item, index) => (
                                <div key={index}>
                                    {item.mode === "input" ? (
                                        <div>    
                                            <label htmlFor="">{item.label}</label>
                                            <input type={item.type} name={item.name}></input>
                                        </div>
                                    ) : item.mode === 'textarea' ? (
                                        <div>
                                            <label htmlFor="">{item.label}</label>
                                            <textarea name={item.name}></textarea>
                                        </div>
                                    ) : item.mode === 'select' ? (
                                        <div>
                                            <label>{item.label}</label>
                                            <select></select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{color: 'white'}} htmlFor="">{item.label}</label>
                                            <button type={item.type}>{item.text}</button>
                                        </div>
                                    )} 
                                </div>
                            ))}
                            </div>

                        </form>
                </Modal>

                <Modal
                    isOpen={tagsModalIsOpen}
                    onRequestClose={()=>{
                        setTagsModalIsOpen(false)
                    }}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Gerenciar Etiquetas"
                    style={modalStyleTags}
                >
                        <div className="top-container-modal">
                            <h2>Gerenciar Etiquetas</h2>
                            <button
                                onClick={()=>{
                                    setTagsModalIsOpen(false);
                                }}
                                style={{fontSize:30}}
                            >&times;</button>
                        </div>

                        <div className="container-tags-modal">
                            <form className="form-tags" onSubmit={handleCreateTags}>
                                <h3 htmlFor="">Criar Etiqueta</h3>
                                    
                                <div>
                                    <label htmlFor="addTagName">Nome</label>
                                    <input type="text" name="addTagName" id="" required/>
                                </div>

                                <div>
                                    <label htmlFor="addTagColor">Cor</label>
                                    <input type="color" name="addTagColor" id="" required />
                                </div>

                                <button type="submit">Salvar</button>
                            </form>

                            <div>
                                <h3>Minhas Etiquetas</h3>
                                <ul>
                                    {tags.length <= 0 ? (
                                        <p>Nenhuma etiqueta criada.</p>
                                    ) : (
                                        <div>
                                            {tags.map((item,i)=>(
                                                <li style={{backgroundColor: item.color}} key={i}>{item.name} 
                                                    <button onClick={()=>{setSelectedTag(item),setEditTagsModalIsOpen(!editTagsModalIsOpen)}}><SquarePen></SquarePen></button> 
                                                    <button onClick={()=>handleDeleteTags(item)}><Trash></Trash> </button>
                                                </li>
                                            ))}
                                            {editTagsModalIsOpen ? (
                                                <form className="form-tags-edit" onSubmit={handleEditTags}>
                                                    <div>
                                                        <label htmlFor="editTagName">Nome</label>
                                                        <input type="text" name="editTagName" id="" required/>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="editTagColor">Cor</label>
                                                        <input type="color" name="editTagColor" id="" required />
                                                    </div>

                                                    <button type="submit">Salvar Alterações</button>
                                                </form>
                                            ) : ('')}
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>

                </Modal>

                <AlertModals
                    phrase={formSuccess ? formSuccess : formError}
                    isOpen={alertModalIsOpen}
                    type={alertType}
                    setIsOpen={setAlertModalIsOpen}
                >

                </AlertModals>
            </main>
        </>
    );
}

export default Menu