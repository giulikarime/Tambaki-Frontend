import { useState, useEffect, useRef } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { Plus, Funnel, ChevronDown, ChevronRight, ChevronLeft, Search, Camera, Form, SquarePen, Trash } from "lucide-react";
import './menu.css';
import Modal from 'react-modal';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { getMenu, getMenuEnums, createMenu, editMenu, deleteMenu } from "../../services/menu";
import AlertModals from "../../components/SucessModals/AlertModals";
import { getTags, createTags, deleteTags, editTags } from "../../services/tags";
import { TAG_COLORS, ALLOWED_COLORS } from './colors/Tagcolors';
import { getContrastColor } from './colors/Constratcolor';
import FiltersModal from "../../components/FiltersModal/FiltersModal";
import { getProductEnums } from "../../services/products";
import { getLoggedUser } from "../../services/auth";
import MenuCard from "../../components/MenuCard/MenuCard";
import { uploadFile } from "../../services/upload";

function ColorPicker({ name, defaultValue }) {
    return (
        <div className="color-picker">
            {TAG_COLORS.map((group) => (
                <div className="color-row" key={group.name}>
                    {group.shades.map((color) => (
                        <label key={color} className="color-option" title={group.name}>
                            <input
                                type="radio"
                                name={name}
                                value={color}
                                defaultChecked={color === defaultValue}
                                required
                            />
                            <span style={{ backgroundColor: color }} />
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
}

function Menu() {
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const user = getLoggedUser();

    const [menu, setMenu] = useState([]);

    const [itensEnums, setItensEnums] = useState({
        allergens: [],
    });

    const [addAllergensToListModal, setAddAllergensToListModal] = useState(false);
    const [addTagsToListModal, setAddTagsToListModal] = useState(false);

    const [selectedAllergensForMenu, setSelectedAllergensForMenu] = useState([]);
    const [selectedTagsForMenu, setSelectedTagsForMenu] = useState([]);

    const [menuEnums, setMenuEnums] = useState({
        category: [],
    });

    const [tags, setTags] = useState([]);
    const [tagsModalIsOpen, setTagsModalIsOpen] = useState(false);
    const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);

    const [preview, setPreview] = useState([]);
    const [indexOfPreview, setIndexOfPreview] = useState(0);

    const [imageFilesToUpload, setImageFilesToUpload] = useState([]);

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
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [addMenuModalIsOpen, setAddMenuModalIsOpen] = useState(false);
    
    const [editMenuModalIsOpen, setEditMenuModalIsOpen] = useState(false);
    const [editMenuStatus, setEditMenuStatus] = useState(false);

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
            width: '640px',
            maxWidth: '90vw',
            boxSizing: 'border-box',
            overflowX: 'hidden',
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

    const modalStyleEditTag = {
        overlay: {
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 101,
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
            right: 'auto',
            width: '320px',
            padding: '25px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }
    }

    const inputValues = [
        { label: "Nome do Prato", mode: "input", type: "text", name: "addDishesName", placeholder: 'Digite um nome...' },
        { label: "Preço", mode: "input", type: "number", name: "addDishesPrice", placeholder: 'Exemplo.: 25,99', step: 0.1 },
        { label: "Descrição", mode: "textarea", name: "addDishesDesc", placeholder: 'Descreva o prato..' },
        { label: "Alergênicos", mode: "select", name: "addDishesAllergens", allergen: true, menu_enum: itensEnums.allergens },
        { label: "Etiquetas", mode: "select", name: "addDishesTag", tag: true },
        { label: "Categoria", mode: "select", name: "addDishesCategory", enum: true, menu_enum: itensEnums.category },
        { label: ".", text: 'Salvar', mode: "button", type: 'submit' },
    ]

    async function get_menus() {
        try {
            const menu_value = await getMenu();
            setMenu(menu_value);
        } catch (error) {
            console.error("Não foi possível carregar os pratos.", error);
        }
    }

    useEffect(() => {
        get_menus();
    }, [])

    useEffect(() => {
        async function get_enums() {
            try {
                const enums_forms = await getMenuEnums();
                setMenuEnums(enums_forms);
            } catch (error) {
                console.error("Erro ao carregar os dados dos formulários.", error);
            }
        }
        get_enums();
    }, []);

    useEffect(() => {
        async function get_allergens() {
            try {
                const allergens_enums = await getProductEnums();
                setItensEnums(allergens_enums);
            } catch (error) {
                console.error("Erro ao carregar os dados dos alergénicos.", error);
            }
        }
        get_allergens();
    }, []);

    async function get_tags() {
        try {
            const tags_ = await getTags();
            setTags(tags_);
        } catch (error) {
            console.error("Erro ao carregar dados das etiquetas.", error);
        }
    }

    useEffect(() => {
        get_tags();
    }, []);

    const imgRef = useRef(null);

    function handleButtonClickFile() {
        if (imgRef.current) imgRef.current.click();
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImageFilesToUpload((prev) => [...prev, ...files]);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreview((prev) => [...prev, ...newPreviews]);
    };

    function emptyPreviewBeforeSaving() {
        preview.forEach((url) => {
            if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        setPreview([]);
        setImageFilesToUpload([]);
        setIndexOfPreview(0);

        if (imgRef.current) {
            imgRef.current.value = "";
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length > 0) {
            setImageFilesToUpload((prev) => [...prev, ...imageFiles]);

            const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
            setPreview((prev) => [...prev, ...newPreviews]);
        } else {
            alert('Por favor, envie apenas arquivos de imagem.');
        }
    };

    function handleChangeImageRight() {
        if (!preview || preview.length === 0) return;
        setIndexOfPreview((prevIndex) =>
            prevIndex >= preview.length - 1 ? 0 : prevIndex + 1
        );
    }

    function handleChangeImageLeft() {
        if (!preview || preview.length === 0) return;
        setIndexOfPreview((prevIndex) =>
            prevIndex <= 0 ? preview.length - 1 : prevIndex - 1
        );
    }

    function handleDeleteCurrentImage() {
        if (!preview || preview.length === 0) return;

        if (preview[indexOfPreview]?.startsWith('blob:')) {
            URL.revokeObjectURL(preview[indexOfPreview]);
        }

        const updatedPreviews = preview.filter((_, index) => index !== indexOfPreview);
        setPreview(updatedPreviews);

        const updatedFiles = imageFilesToUpload.filter((_, index) => index !== indexOfPreview);
        setImageFilesToUpload(updatedFiles);

        if (indexOfPreview >= updatedPreviews.length) {
            setIndexOfPreview(Math.max(0, updatedPreviews.length - 1));
        }
    }

    async function handleCreateMenu(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        if (!preview || preview.length <= 0) {
            setFormError('A imagem do cardápio não pode ser vazia');
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        try {
            const uploadedUrls = [];
            for (const file of imageFilesToUpload) {
                const url = await uploadFile(file);
                if (url) uploadedUrls.push(url);
            }

            const formattedTags = selectedTagsForMenu.map(tag => {
                const tagName = typeof tag === 'object' ? tag.name : tag;
                return { name: tagName };
            });

            const payload = {
                name: String(formData.get('addDishesName')),
                price: parseFloat(formData.get('addDishesPrice')),
                description: String(formData.get('addDishesDesc')),
                category: String(formData.get('addDishesCategory')),
                img: uploadedUrls,
                allergens: selectedAllergensForMenu || null,
                tags: formattedTags || null,
                available: true,
                unitId: user?.storeUnitId
            };

            await createMenu(payload);
            await get_menus();
            setAddMenuModalIsOpen(false);
            setSelectedAllergensForMenu([]);
            setSelectedTagsForMenu([]);
            setFormSuccess("Prato criado com sucesso!");
            setAlertType('success');
            setAlertModalIsOpen(true);
            emptyPreviewBeforeSaving();
            e.target.reset();
        } catch (error) {
            setFormError(error.message || "Erro ao criar prato.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleEditMenu(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        if (!preview || preview.length <= 0) {
            setFormError('A imagem do cardápio não pode ser vazia');
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        try {
            const finalImageUrls = [];
            for (const item of preview) {
                if (item.startsWith('blob:')) {
                    const fileObj = imageFilesToUpload.find(f => URL.createObjectURL(f) === item);
                    if (fileObj) {
                        const uploadedUrl = await uploadFile(fileObj);
                        if (uploadedUrl) finalImageUrls.push(uploadedUrl);
                    }
                } else {
                    const cleanUrl = item.replace('http://localhost:3000/', '');
                    finalImageUrls.push(cleanUrl);
                }
            }

            const formattedTags = selectedTagsForMenu.map(tag => {
                const tagName = typeof tag === 'object' ? tag.name : tag;
                return { name: tagName };
            });

            const payload = {
                name: String(formData.get('addDishesName')) || selectedMenu.name,
                price: parseFloat(formData.get('addDishesPrice')) || selectedMenu.price,
                description: String(formData.get('addDishesDesc')) || selectedMenu.description,
                category: String(formData.get('addDishesCategory')) || selectedMenu.category,
                img: finalImageUrls.length > 0 ? finalImageUrls : selectedMenu.img,
                allergens: selectedAllergensForMenu || null,
                tags: formattedTags || null,
                available: true,
                unitId: user?.storeUnitId
            };

            await editMenu(payload, selectedMenu.id);
            await get_menus();
            setEditMenuModalIsOpen(false);
            setEditMenuStatus(false);
            setSelectedAllergensForMenu([]);
            setSelectedTagsForMenu([]);
            setFormSuccess(`${selectedMenu.name} editado com sucesso!`);
            setAlertType('success');
            setAlertModalIsOpen(true);
            emptyPreviewBeforeSaving();
        } catch (error) {
            setFormError(error.message || "Erro ao editar prato.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteMenu() {
        if (!selectedMenu || !selectedMenu.id) {
            setFormError('Nenhum prato selecionado para exclusão.');
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        setFormError('');
        setFormSuccess('');
        setAlertType('');

        try {
            // Certifique-se de que passa selectedMenu.id aqui:
            await deleteMenu(selectedMenu.id);
            await get_menus();
            setEditMenuModalIsOpen(false);
            setEditMenuStatus(false);
            setSelectedAllergensForMenu([]);
            setSelectedTagsForMenu([]);
            setFormSuccess(`${selectedMenu.name} deletado com sucesso!`);
            setAlertType('success');
            setAlertModalIsOpen(true);
            emptyPreviewBeforeSaving();
        } catch (error) {
            setFormError(error.message || "Erro ao deletar prato.");
            setAlertType('error');
            console.error(error.message,selectedMenu.id)
            setAlertModalIsOpen(true);
        }
    }

    async function handleCreateTags(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        if (String(formData.get('addTagName')).trim() === '' || String(formData.get('addTagColor')).trim() === '') {
            setFormError("Preencha os campos para criar uma etiqueta.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        const payload = {
            name: String(formData.get('addTagName')),
            color: String(formData.get('addTagColor')),
            unitId: user?.storeUnitId,
        };

        if (!ALLOWED_COLORS.includes(payload.color)) {
            setFormError("Escolha uma cor da paleta.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        try {
            await createTags(payload);
            await get_tags();
            setFormSuccess("Etiqueta criada com sucesso.");
            setAlertType('success');
            setAlertModalIsOpen(true);
            e.target.reset();
        } catch (error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteTags(itemToDelete) {
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        try {
            await deleteTags(itemToDelete.id);
            await get_tags();
            setFormSuccess(`${itemToDelete.name} deletado(a) com sucesso.`);
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleEditTags(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);

        const payload = {
            name: String(formData.get('editTagName')) || selectedTag.name,
            color: String(formData.get('editTagColor')) || selectedTag.color,
        };

        if (!ALLOWED_COLORS.includes(payload.color)) {
            setFormError("Escolha uma cor da paleta.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        try {
            await editTags(payload, selectedTag.id);
            await get_tags();
            setFormSuccess("Etiqueta editada com sucesso.");
            setAlertType('success');
            setAlertModalIsOpen(true);
            closeEditTagModal();
            e.target.reset();
        } catch (error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
            closeEditTagModal();
        }
    }

    function openEditTagModal() {
        setEditTagsModalIsOpen(true);
        setTagsModalIsOpen(false);
    }

    function closeEditTagModal() {
        setEditTagsModalIsOpen(false);
        setTagsModalIsOpen(true);
    }

    // Lógica para filtrar os pratos conforme os filtros selecionados
    const filteredMenu = menu.filter((item) => {
        const selectedCategory = selectedModalFilters["Categorias"];
        const selectedTagFilter = selectedModalFilters["Etiquetas"];

        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesTag = !selectedTagFilter || (item.tags && item.tags.some(t => t.name === selectedTagFilter.name));

        return matchesCategory && matchesTag;
    });

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} />
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} />
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div className="container">
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                <button className="btn-back-base" onClick={() => navigate(-1)}><ChevronLeft /></button>
                                <h1>Cardápio</h1>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                <button onClick={() => setAddMenuModalIsOpen(!addMenuModalIsOpen)} className='btn-plus-item menu'>Adicionar Prato<Plus /></button>
                                <button onClick={() => setTagsModalIsOpen(!tagsModalIsOpen)} className="btn-stock-base">Etiquetas</button>
                                <button
                                    onClick={() => setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                                    id='btn-funnel-base'
                                    className="btn-stock-base">Filtrar <Funnel size={20} /></button>
                            </div>
                        </div>
                        <p style={{ color: '#777171ff' }}>Visualize e edite seu cardápio.</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', justifyContent: 'space-between' }}>
                        {filteredMenu.length <= 0 ? (
                            <p>Nenhum prato encontrado com os filtros selecionados.</p>
                        ) : (
                            filteredMenu.map((item, i) => (
                                <MenuCard 
                                    key={item.id || i} 
                                    item={item} 
                                    onClick={() => {
                                        setSelectedMenu(item);
                                        const formattedImages = (item.img || []).map(img => 
                                            img.startsWith('http') || img.startsWith('blob') ? img : `http://localhost:3000/${img}`
                                        );
                                        setPreview(formattedImages);
                                        setIndexOfPreview(0);
                                        setSelectedAllergensForMenu(item.allergens || []);
                                        setSelectedTagsForMenu(item.tags || []);
                                        setEditMenuStatus(false);
                                        setEditMenuModalIsOpen(true);
                                    }} 
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Modal de Adicionar Prato */}
                <Modal
                    isOpen={addMenuModalIsOpen}
                    onRequestClose={() => {
                        setAddMenuModalIsOpen(false);
                        emptyPreviewBeforeSaving();
                    }}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Adicionar Prato"
                    style={modalStyle}
                >
                    <div className="top-container" 
                        onClick={()=>{
                            setAddAllergensToListModal(false);
                            setAddTagsToListModal(false);
                        }}>
                        <div className="group-one-top-container">
                            <h2>Novo prato</h2>
                            <button
                                onClick={() => {
                                    setAddMenuModalIsOpen(false);
                                    emptyPreviewBeforeSaving();
                                }}
                                style={{ fontSize: 30 }}
                            >&times;</button>
                        </div>
                        <p style={{'fontSize': 15,'color': '#777171ff'}}>Adiciona pratos ao seu cardápio.</p>
                    </div>

                    <form className="form-add-menu" 
                        onClick={()=>{
                            addAllergensToListModal ? setAddAllergensToListModal(false) : ('');
                            addTagsToListModal ? setAddTagsToListModal(false) : ('');
                        }}
                        onSubmit={handleCreateMenu}
                        >
                        <div className="container-add-img">
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {preview.length > 0 ? (
                                    <div className="container-exibe-image">
                                        <img src={preview[indexOfPreview]} className="card-full-image" alt="Preview" />
                                        {preview.length > 1 ? (
                                            <div className="container-buttons-change-image">
                                                <button
                                                    type="button"
                                                    className="btn-change-image-bg"
                                                    onClick={handleChangeImageLeft}><ChevronLeft color="white" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-change-image-bg"
                                                    onClick={handleChangeImageRight}><ChevronRight color="white" />
                                                </button>
                                            </div>
                                        ) : ('')}
                                        <div className="container-buttons-delete-image">
                                            <button type="button" className="btn-change-image-bg delete" onClick={handleDeleteCurrentImage}>
                                                <Trash color="white"></Trash>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="container-add-image">
                                        <label style={{fontSize:18, color: 'grey',textAlign:'center'}}>Arraste ou solte<br/> imagens aqui</label>
                                        <Camera color="grey" size={50} strokeWidth={1} />
                                    </div>
                                )}
                            </div>

                            <button type="button" className="btn-add-img" onClick={handleButtonClickFile}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: "none" }}
                                    ref={imgRef}
                                    onChange={handleImageChange}
                                />
                                <label>Adicione imagens</label>
                            </button>
                        </div>

                        <div className="container-form">
                            {inputValues.map((item, index) => (
                                <div key={index}>
                                    {item.mode === "input" ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <input step={item.step} className="input-select-model" type={item.type} name={item.name} placeholder={item.placeholder} required />
                                        </div>
                                    ) : item.mode === 'textarea' ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <textarea className="input-select-model" name={item.name} placeholder={item.placeholder} ></textarea>
                                        </div>
                                    ) : item.mode === 'select' && item.allergen ? (
                                        <div className="fields allergens">
                                            <label>{item.label}</label>
                                            <div style={{display:'flex',flexDirection:'row',gap: '10px',alignItems:'center'}}>
                                                <ul className="input-select-model ul-list">
                                                    {selectedAllergensForMenu.length <= 0 ? (
                                                        <p>Nenhum alergênico selecionado.</p>
                                                    ) : (
                                                        selectedAllergensForMenu.map((allergen, i) => (
                                                            <li key={i} className="li-style-model">
                                                                {typeof allergen === 'string' ? allergen.replaceAll('_', ' ') : allergen}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedAllergensForMenu(prev => prev.filter(a => a !== allergen))}
                                                                >&times;</button>
                                                            </li>
                                                        ))
                                                    )}
                                                </ul>
                                                <button 
                                                    className="add-category-ul-list"
                                                    type="button"
                                                    onClick={()=>setAddAllergensToListModal(!addAllergensToListModal)}
                                                >
                                                    <Plus></Plus>
                                                </button>
                                            </div>

                                            {addAllergensToListModal ? (
                                                <ul className="add-allergen-select">
                                                    {item.menu_enum?.map((all, i) => (
                                                        <li key={i} value={all}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedAllergensForMenu(prev =>
                                                                    prev.includes(all) ? prev : [...prev, all])
                                                                }}
                                                            >{all.replaceAll('_', ' ')}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : ('')}
                                        </div>
                                    ) : item.mode === 'select' && item.tag ? (
                                        <div className="fields allergens">
                                            <label>{item.label}</label>
                                            <div style={{display:'flex',flexDirection:'row',gap: '10px',alignItems:'center'}}>
                                                <ul className="input-select-model ul-list">
                                                    {selectedTagsForMenu.length <= 0 ? (
                                                        <p>Nenhuma etiqueta selecionada.</p>
                                                    ) : (
                                                        selectedTagsForMenu.map((tag, i) => (
                                                            <li key={i} className="li-style-model">
                                                                {tag.name}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedTagsForMenu(prev => prev.filter(a => (a.id ? a.id !== tag.id : a.name !== tag.name)))}
                                                                >&times;</button>
                                                            </li>
                                                        ))
                                                    )}
                                                </ul>
                                                <button 
                                                    className="add-category-ul-list"
                                                    type="button"
                                                    onClick={()=>setAddTagsToListModal(!addTagsToListModal)}
                                                >
                                                    <Plus></Plus>
                                                </button>
                                            </div>

                                            {addTagsToListModal && (
                                                <ul className="add-allergen-select">
                                                    {tags.length <= 0 ? (
                                                        <li>Ainda não existem etiquetas</li>
                                                    ) : 
                                                        tags.map((tag, i) => (
                                                            <li key={i} value={tag}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedTagsForMenu(prev =>
                                                                        prev.some(t => (t.id ? t.id === tag.id : t.name === tag.name)) ? prev : [...prev, tag])
                                                                    }}
                                                                >{tag.name}</button>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : item.mode === 'select' && item.enum ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <select className="input-select-model" name={item.name}>
                                                {(menuEnums.category ?? []).map((cat,i)=>(
                                                    <option value={cat} key={i}>{String(cat.replaceAll('_',' '))}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="fields">
                                            <label style={{ color: 'white' }}>{item.label}</label>
                                            <button className="btn-modal-submit menu" type={item.type}>{item.text}</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </form>
                </Modal>

                {/* Modal de Edição de Prato (Design Original Mantido) */}
                <Modal
                    isOpen={editMenuModalIsOpen}
                    onRequestClose={() => {
                        setEditMenuModalIsOpen(false);
                        setEditMenuStatus(false);
                        emptyPreviewBeforeSaving();
                    }}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Editar Prato"
                    style={modalStyle}
                >
                    {(() => {
                        const text_enable_edit = editMenuStatus ? 'Desabilitar Edição' : 'Habilitar Edição';
                        const subtitle_top_container = editMenuStatus 
                            ? `Edite e altere informações de ${selectedMenu?.name}` 
                            : `Dados de ${selectedMenu?.name}`;

                        return (
                            <>
                                <div className="top-container" 
                                    onClick={()=>{
                                        setAddAllergensToListModal(false);
                                        setAddTagsToListModal(false);
                                    }}>
                                    <div className="group-one-top-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <h2>{selectedMenu?.name}</h2>
                                        <button 
                                            type="button"
                                            style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'10px',fontSize:'18px'}} 
                                            onClick={() => setEditMenuStatus(!editMenuStatus)}
                                        >
                                            {text_enable_edit} <SquarePen />
                                        </button>
                                        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                            <button
                                                onClick={() => {
                                                    setEditMenuModalIsOpen(false);
                                                    setEditMenuStatus(false);
                                                    emptyPreviewBeforeSaving();
                                                }}
                                                style={{ fontSize: 30, background: 'none', border: 'none', cursor: 'pointer' }}
                                            >&times;</button>
                                        </div>
                                    </div>
                                    <p style={{'fontSize': 15,'color': '#777171ff'}}>{subtitle_top_container}</p>
                                </div>

                                <form className="form-add-menu" 
                                    onClick={()=>{
                                        addAllergensToListModal ? setAddAllergensToListModal(false) : ('');
                                        addTagsToListModal ? setAddTagsToListModal(false) : ('');
                                    }}
                                    onSubmit={handleEditMenu}
                                >
                                    <div className="container-add-img">
                                        <div
                                            onDrop={editMenuStatus ? handleDrop : undefined}
                                            onDragOver={handleDragOver}
                                        >
                                            {preview.length > 0 ? (
                                                <div className="container-exibe-image">
                                                    <img 
                                                        src={
                                                            preview[indexOfPreview]?.startsWith('http') || preview[indexOfPreview]?.startsWith('blob') 
                                                                ? preview[indexOfPreview] 
                                                                : `http://localhost:3000/${preview[indexOfPreview]}`
                                                        } 
                                                        className="card-full-image" 
                                                        alt="Preview" 
                                                    />
                                                    {preview.length > 1 ? (
                                                        <div className="container-buttons-change-image">
                                                            <button
                                                                type="button"
                                                                className="btn-change-image-bg"
                                                                onClick={handleChangeImageLeft}><ChevronLeft color="white" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-change-image-bg"
                                                                onClick={handleChangeImageRight}><ChevronRight color="white" />
                                                            </button>
                                                        </div>
                                                    ) : ('')}
                                                    {editMenuStatus && (
                                                        <div className="container-buttons-delete-image">
                                                            <button type="button" className="btn-change-image-bg delete" onClick={handleDeleteCurrentImage}>
                                                                <Trash color="white"></Trash>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="container-add-image">
                                                    <label style={{fontSize:18, color: 'grey',textAlign:'center'}}>Sem imagens</label>
                                                    <Camera color="grey" size={50} strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>

                                        {editMenuStatus && (
                                            <button type="button" className="btn-add-img" onClick={handleButtonClickFile}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    ref={imgRef}
                                                    onChange={handleImageChange}
                                                />
                                                <label>Adicione imagens</label>
                                            </button>
                                        )}
                                    </div>

                                    <div className="container-form">
                                        {inputValues.map((item, index) => {
                                            let defaultValue = '';
                                            if (item.name === 'addDishesName') defaultValue = selectedMenu?.name || '';
                                            if (item.name === 'addDishesPrice') defaultValue = selectedMenu?.price || '';
                                            if (item.name === 'addDishesDesc') defaultValue = selectedMenu?.description || '';

                                            return (
                                                <div key={index}>
                                                    {item.mode === "input" ? (
                                                        <div className="fields">
                                                            <label>{item.label}</label>
                                                            <input 
                                                                readOnly={!editMenuStatus}
                                                                step={item.step} 
                                                                className="input-select-model" 
                                                                type={item.type} 
                                                                name={item.name} 
                                                                defaultValue={defaultValue} 
                                                                placeholder={item.placeholder} 
                                                            />
                                                        </div>
                                                    ) : item.mode === 'textarea' ? (
                                                        <div className="fields">
                                                            <label>{item.label}</label>
                                                            <textarea 
                                                                readOnly={!editMenuStatus}
                                                                className="input-select-model" 
                                                                name={item.name} 
                                                                defaultValue={defaultValue} 
                                                                placeholder={item.placeholder} 
                                                            ></textarea>
                                                        </div>
                                                    ) : item.mode === 'select' && item.allergen ? (
                                                        <div className="fields allergens">
                                                            <label>{item.label}</label>
                                                            <div style={{display:'flex',flexDirection:'row',gap: '10px',alignItems:'center'}}>
                                                                <ul className="input-select-model ul-list">
                                                                    {selectedAllergensForMenu.length <= 0 ? (
                                                                        <p>Nenhum alergênico selecionado.</p>
                                                                    ) : (
                                                                        selectedAllergensForMenu.map((allergen, i) => (
                                                                            <li key={i} className="li-style-model">
                                                                                {typeof allergen === 'string' ? allergen.replaceAll('_', ' ') : allergen}
                                                                                {editMenuStatus && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setSelectedAllergensForMenu(prev => prev.filter(a => a !== allergen))}
                                                                                    >&times;</button>
                                                                                )}
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </ul>
                                                                {editMenuStatus && (
                                                                    <button 
                                                                        className="add-category-ul-list"
                                                                        type="button"
                                                                        onClick={()=>setAddAllergensToListModal(!addAllergensToListModal)}
                                                                    >
                                                                        <Plus></Plus>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {addAllergensToListModal && editMenuStatus ? (
                                                                <ul className="add-allergen-select">
                                                                    {item.menu_enum?.map((all, i) => (
                                                                        <li key={i} value={all}>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedAllergensForMenu(prev =>
                                                                                    prev.includes(all) ? prev : [...prev, all])
                                                                                }}
                                                                            >{all.replaceAll('_', ' ')}</button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : ('')}
                                                        </div>
                                                    ) : item.mode === 'select' && item.tag ? (
                                                        <div className="fields allergens">
                                                            <label>{item.label}</label>
                                                            <div style={{display:'flex',flexDirection:'row',gap: '10px',alignItems:'center'}}>
                                                                <ul className="input-select-model ul-list">
                                                                    {selectedTagsForMenu.length <= 0 ? (
                                                                        <p>Nenhuma etiqueta selecionada.</p>
                                                                    ) : (
                                                                        selectedTagsForMenu.map((tag, i) => (
                                                                            <li key={i} className="li-style-model">
                                                                                {tag.name}
                                                                                {editMenuStatus && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setSelectedTagsForMenu(prev => prev.filter(a => (a.id ? a.id !== tag.id : a.name !== tag.name)))}
                                                                                    >&times;</button>
                                                                                )}
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </ul>
                                                                {editMenuStatus && (
                                                                    <button 
                                                                        className="add-category-ul-list"
                                                                        type="button"
                                                                        onClick={()=>setAddTagsToListModal(!addTagsToListModal)}
                                                                    >
                                                                        <Plus></Plus>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {addTagsToListModal && editMenuStatus && (
                                                                <ul className="add-allergen-select">
                                                                    {tags.length <= 0 ? (
                                                                        <li>Ainda não existem etiquetas</li>
                                                                    ) : 
                                                                        tags.map((tag, i) => (
                                                                            <li key={i} value={tag}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setSelectedTagsForMenu(prev =>
                                                                                        prev.some(t => (t.id ? t.id === tag.id : t.name === tag.name)) ? prev : [...prev, tag])
                                                                                    }}
                                                                                >{tag.name}</button>
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ) : item.mode === 'select' && item.enum ? (
                                                        <div className="fields">
                                                            <label>{item.label}</label>
                                                            <select disabled={!editMenuStatus} className="input-select-model" name={item.name} defaultValue={selectedMenu?.category}>
                                                                {(menuEnums.category ?? []).map((cat,i)=>(
                                                                    <option value={cat} key={i}>{String(cat.replaceAll('_',' '))}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        editMenuStatus ? (
                                                            <div className="fields" key={index} style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                                                                <button className="btn-modal-submit menu" type={item.type}>Salvar Alterações</button>
                                                                <button className="btn-modal-submit delete" type="button" onClick={handleDeleteMenu}>
                                                                    <Trash color="black" size={18} />
                                                                </button>
                                                            </div>
                                                        ) : null
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </form>
                            </>
                        );
                    })()}
                </Modal>

                {/* Modal de Gerenciar Etiquetas */}
                <Modal
                    isOpen={tagsModalIsOpen}
                    onRequestClose={() => {
                        setTagsModalIsOpen(false);
                    }}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Gerenciar Etiquetas"
                    style={modalStyleTags}
                >
                    <div className="top-container-modal">
                        <h2 className="title">Gerenciar Etiquetas</h2>
                        <button
                            onClick={() => {
                                setTagsModalIsOpen(false);
                            }}
                            style={{ fontSize: 30 }}
                        >
                            &times;
                        </button>
                    </div>

                    <div className="container-tags-modal">
                        <div id="container-create-label">
                            <form className="form-tags" onSubmit={handleCreateTags}>
                                <h3>Criar Etiqueta</h3>

                                <div>
                                    <label htmlFor="addTagName">Nome</label>
                                    <input
                                        type="text"
                                        name="addTagName"
                                        id="addTagName"
                                        className="labelName"
                                        required
                                    />
                                </div>

                                <div>
                                    <span className="field-label">Cor</span>
                                    <ColorPicker name="addTagColor" />
                                </div>

                                <button type="submit" id="submit-label">Salvar</button>
                            </form>
                        </div>

                        <div>
                            <h3 className="title">Minhas Etiquetas</h3>

                            {tags.length <= 0 ? (
                                <p>Nenhuma etiqueta criada.</p>
                            ) : (
                                <div className="tags-scroll">
                                    <ul className="tags-list">
                                        {tags.map((item, i) => (
                                            <li
                                                className="label-style"
                                                key={item.id ?? i}
                                                style={{
                                                    backgroundColor: item.color,
                                                    color: getContrastColor(item.color),
                                                }}
                                            >
                                                <span className="label-name">{item.name}</span>

                                                <div className="label-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTag(item);
                                                            openEditTagModal();
                                                        }}
                                                    >
                                                        <SquarePen size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteTags(item)}>
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>

                {/* Modal de Editar Etiqueta */}
                <Modal
                    isOpen={editTagsModalIsOpen}
                    onRequestClose={closeEditTagModal}
                    shouldCloseOnOverlayClick={true}
                    contentLabel="Modal de Editar Etiqueta"
                    style={modalStyleEditTag}
                >
                    <div className="top-container-modal">
                        <h2 className="title">Editar Etiqueta</h2>
                        <button
                            type="button"
                            onClick={closeEditTagModal}
                            style={{ fontSize: 30 }}
                        >
                            &times;
                        </button>
                    </div>

                    <form
                        className="form-tags-edit"
                        onSubmit={handleEditTags}
                        key={selectedTag?.id ?? selectedTag?.name}
                    >
                        <div>
                            <label htmlFor="editTagName">Nome</label>
                            <input
                                type="text"
                                name="editTagName"
                                id="editTagName"
                                className="labelName"
                                defaultValue={selectedTag?.name}
                                required
                            />
                        </div>

                        <div>
                            <span className="field-label">Cor</span>
                            <ColorPicker
                                name="editTagColor"
                                defaultValue={selectedTag?.color}
                            />
                        </div>

                        <button type="submit" id="save-changes">Salvar Alterações</button>
                    </form>
                </Modal>

                <FiltersModal
                    isOpen={filterProductModalIsOpen}
                    setIsOpen={setFilterProductModalIsOpen}
                    filtersTitle={filtersModal}
                    filtersData={filtersData}
                    selectedFilters={selectedModalFilters}
                    setSelectedFilters={setSelectedModalFilters}>
                </FiltersModal>

                <AlertModals
                    phrase={formSuccess ? formSuccess : formError}
                    isOpen={alertModalIsOpen}
                    type={alertType}
                    setIsOpen={setAlertModalIsOpen}
                />
            </main>
        </>
    );
}

export default Menu;