import { useState, useEffect, useRef } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { Plus, Funnel, ChevronDown, ChevronRight, ChevronLeft, Search, Camera, Form, SquarePen, Trash } from "lucide-react";
import './menu.css';
import Modal from 'react-modal';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { getMenu, getMenuEnums } from "../../services/menu";
import AlertModals from "../../components/SucessModals/AlertModals";
import { getTags, createTags, deleteTags, editTags } from "../../services/tags";
import { TAG_COLORS, ALLOWED_COLORS } from './colors/Tagcolors';
import { getContrastColor } from './colors/Constratcolor';

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

    const [menu, setMenu] = useState([]);

    const [menuEnums, setMenuEnums] = useState({
        category: [],
    });

    const [tags, setTags] = useState([]);
    const [tagsModalIsOpen, setTagsModalIsOpen] = useState(false);
    const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);

    const [preview, setPreview] = useState([]);
    const [indexOfPreview, setIndexOfPreview] = useState(0);

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
            zIndex: 101, // acima do modal de etiquetas (100)
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
        { label: "Nome do Prato", mode: "input", type: "text", name: "addDishesName" },
        { label: "Descrição", mode: "textarea", name: "addDishesDesc" },
        { label: "Preço", mode: "input", type: "number", name: "addDishesPrice" },
        { label: "Alergênicos", mode: "select", name: "addDishesAllergens" },
        { label: "Etiqueta", mode: "select", name: "addDishesTag" },
        { label: ".", text: 'Salvar', mode: "button", type: 'submit', name: "addDishesTag" },
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
                console.error("Erro ao carregar os dados dos formularios.", error);
            }
        }
        get_enums();
    }, []);

    async function get_tags() {
        try {
            const tags_ = await getTags();
            setTags(tags_);
        } catch (error) {
            console.error("Erro ao carregar dados dos formularios.", error);
        }
    }

    useEffect(() => {
        get_tags();
    }, []);

    const imgRef = useRef(null);

    function handleButtonClickFile() {
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
        setIndexOfPreview(0);

        if (imgRef.current) {
            imgRef.current.value = "";
        }
    }

    function handleChangeImageRight() {
        if (!preview || preview.length === 0) {
            return;
        }

        setIndexOfPreview((prevIndex) =>
            prevIndex >= preview.length - 1 ? 0 : prevIndex + 1
        )
    }

    function handleChangeImageLeft() {
        if (!preview || preview.length === 0) {
            return;
        }

        setIndexOfPreview((prevIndex) =>
            prevIndex <= 0 ? preview.length - 1 : prevIndex - 1
        )
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

        const payload = {
            //Terminar de fazer quando o back estiver pronto.
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


    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                <button className="btn-back-base" onClick={() => navigate(-1)}><ChevronLeft></ChevronLeft></button>
                                <h1>Cardápio</h1>
                            </div>
                            <p style={{ color: '#777171ff' }}>Visualize e edite seu cardápio.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <button onClick={() => setAddMenuModalIsOpen(!addMenuModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                            <button onClick={() => setTagsModalIsOpen(!tagsModalIsOpen)} className="btn-stock-base">Etiquetas</button>
                            <button
                                onClick={() => setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                                id='btn-funnel-base'
                                className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                        </div>
                         <p style={{ color: '#777171ff' }}>Visualize e edite seu cardápio.</p>
                    </div>
                    <div>
                        {menu.length <= 0 ? (
                            'Nenhum prato cadastrado.'
                        ) : (
                            menu.map((item, i) => (
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
                                                const isSelected = selectedModalFilters[filters_item] === optionValue;

                                                return (
                                                    <button
                                                        key={optionValue}
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
                                "Categorias": null,
                                "Etiquetas": null
                            })}
                        >
                            Limpar Filtros do Modal
                        </button>
                    </div>
                </Modal>

                <Modal
                    isOpen={addMenuModalIsOpen}
                    onRequestClose={() => {
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
                            onClick={() => {
                                setAddMenuModalIsOpen(!addMenuModalIsOpen)
                                emptyPreviewBeforeSaving()
                            }}
                            style={{ fontSize: 30 }}
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
                                        <img src={preview[indexOfPreview]} className="card-full-image"></img>
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
                                            <label style={{ color: 'white' }} htmlFor="">{item.label}</label>
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
                                <>
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
                                                            onClick={() => {
                                                                setSelectedTag(item);
                                                                openEditTagModal();
                                                            }}
                                                        >
                                                            <SquarePen size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteTags(item)}>
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </>
                            )}
                        </div>
                    </div>

                </Modal>

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
