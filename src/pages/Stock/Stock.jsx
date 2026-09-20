import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel, ChevronRight, ChevronDown, SquarePen, Trash, } from "lucide-react";
import { getProducts, getProductEnums, createProducts, editProducts, deleteProducts, writeOffProducts } from "../../services/products";
import { getSuppliers } from "../../services/suppliers";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'
import React from 'react';
import { getLoggedUser } from "../../services/auth";
import { uploadFile } from "../../services/upload";
import SucessModals from '../../components/SucessModals/SucessModals'

function Stock() {
    // ===================== Navegação e layout padrão =====================
    const [expanded, setExpand] = useState(false);
    const navigate = useNavigate();
    const user = getLoggedUser();
    const [documentUrl, setDocumentUrl] = useState('');

    const [sucessPhrase,setSucessPhrase] = useState('');
    const [sucessModalIsOpen,setSucessModalIsOpen] = useState(false);

    // ===================== Dados principais (produtos e relacionados) =====================
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [selectAllergensForProducts,setSelectAllergensForProducts] = useState([]);
    const [addAllergensToListModal,setAddAllergensToListModal] = useState(false)

    // Enums vindos do backend, usados para popular os <select> dos formulários
    const [productEnums, setProductEnums] = useState({
        categories: [],
        allergens: [],
        storageLocations: [],
        statuses: [],
        unitOfMeasure: [],
        batchs: [],
    });

    // ===================== Filtro por botões (Estoque/Validade) =====================
    const filter_btn = ["Todos", "Estoque Saudável", "Próximo de Acabar", "Em Falta", "Perto do Vencimento"];
    const [filterBtnIsClicked, setFilterBtnIsClicked] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    // ===================== Filtro via modal (Categoria, Armazenamento, Alergênicos, Status) =====================
    const filtersModal = ["Categoria", "Local de Armazenamento", "Alergênicos", "Status"];

    const filtersData = {
        "Categoria": ["Carnes_e_Pescados", "Hortifrúti", "Laticínios", "Embutidos", "Secos"],
        "Local de Armazenamento": ["Geladeira", "Freezer", "Camara_Fria", "Despensa_Estoque_Seco", "Bar_Adega"],
        "Alergênicos": ["Glúten", "Lacticineos", "Amendoim", "Frutos do Mar", "Oleoaginas"],
        "Status": ["Ativo", "Inativo", "Descontinuado"]
    };

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Categoria": null,
        "Local de Armazenamento": null,
        "Alergênicos": null,
        "Status": null
    });

    const [filterProductModalIsOpen, setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked, setFilterProductIsClicked] = useState(null);
    const [isCustomSelectMode, setIsCustomSelectMode] = useState(false);

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

    // ===================== Modais de CRUD de produto =====================
    const [addProductModalIsOpen, setAddProductModalIsOpen] = useState(false);
    const [entranceProductModalIsOpen, setEntranceProductModalIsOpen] = useState(false);
    const [removeProductModalIsOpen, setRemoveProductModalIsOpen] = useState(false);
    const [editProductModalIsOpen, setEditProductModalIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductName, setSelectedProductName] = useState('');
    const matchingBatches = products.filter(item => item.name === selectedProductName);
    const matchingBatchesEdit = products.filter(item => item.name === selectedProduct?.name);
    const [editProductStatus, setEditProductStatus] = useState(false);
    const [formError, setFormError] = useState('');
    const [fileName,setFileName] = useState('Nenhum arquivo selecionado.');

    // ===================== Upload de arquivo =====================
    const fileRef = useRef(null);

    function handleButtonClick() {
        fileRef.current.click();
    }

    async function handleFileClick(event) {
        const file = event.target.files[0];

        if(!file){
            setFileName('Nenhum arquivo selecionado');
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

    // ===================== Estilos dos modais =====================
    const modalAddProductStyle = {
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
        right: 'auto',
        transform: 'translate(-50%,-50%)',
        bottom: 'auto',
        minWidth: '20vw',
        maxWidth: '90vw',
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

    const modalWriteOffProductStyle = {
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
        right: 'auto',
        transform: 'translate(-50%,-50%)',
        bottom: 'auto',
        minWidth: '20vw',
        maxWidth: '90vw',
        width: '35%',
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

    // ===================== Valores derivados (texto de status do estoque) =====================
    const missingProducts = products.filter(product => product.stock_quantity === 0);
    const midStockProducts = products.filter(product => product.stock_quantity <= product.min_stock && product.stock_quantity !== 0);

    const missing_products_text = missingProducts.length > 0
        ? `- ${String(missingProducts.length).padStart(2, "0")} em falta`
        : '';

    const product_running_low = midStockProducts.length > 0
        ? (midStockProducts.length === 1
            ? `- ${String(midStockProducts.length).padStart(2, "0")} próximo de acabar`
            : `- ${String(midStockProducts.length).padStart(2, "0")} próximos de acabar`)
        : '';

    // Produtos com vencimento nos próximos 10 dias
    const hoje = new Date();
    const produtosProximosVencimento = products.filter((item) => {
        const vencimento = new Date(item.expiration_date);
        const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);
        return diffDias <= 10;
    });

    const qtdVencendo = produtosProximosVencimento.length;

    const text_vencidos = qtdVencendo.length > 0
        ? `- ${String(qtdVencendo).padStart(2, "0")} perto do vencimento.`
        : '';

    // ===================== Lista de produtos filtrada (botões + modal) =====================
    const filteredBatches = products.filter((item) => {
        let matchesBtn = true;
        switch (filterBtnIsClicked) {
            case 0: // Todos
                matchesBtn = true;
                break;
            case 1: // Estoque Saudável
                matchesBtn = item.stock_quantity > item.min_stock;
                break;
            case 2: // Próximo de Acabar
                matchesBtn = item.stock_quantity > 0 && item.stock_quantity <= item.min_stock;
                break;
            case 3: // Em Falta
                matchesBtn = item.stock_quantity === 0;
                break;
            case 4: { // Perto do Vencimento
                const vencimento = new Date(item.expiration_date);
                const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);
                matchesBtn = diffDias <= 10;
                break;
            }
            default:
                matchesBtn = true;
        }

        if (!matchesBtn) return false;

        if (selectedModalFilters["Categoria"] && item.category !== selectedModalFilters["Categoria"]) {
            return false;
        }

        if (selectedModalFilters["Local de Armazenamento"] && item.storageLocation !== selectedModalFilters["Local de Armazenamento"]) {
            return false;
        }

        if (selectedModalFilters["Alergênicos"]) {
            const allergen = selectedModalFilters["Alergênicos"];
            if (Array.isArray(item.allergens)) {
                if (!item.allergens.includes(allergen)) return false;
            } else if (item.allergens !== allergen) {
                return false;
            }
        }

        if (selectedModalFilters["Status"] && item.status !== selectedModalFilters["Status"]) {
            return false;
        }

        return true;
    });

    const filteredProducts = [...new Map(filteredBatches.map(p => [p.name, p])).values()];

    // ===================== Dados fixos para formulários de Produtos

    const inputValues = [
        {label: 'Nome do Insumo', mode: 'input', type: 'text', name: 'add_product_name', placeholder: 'Digite o nome do Insumo...', schema: 'name'},
        {label: 'Lote', mode: 'input', type: 'text', name: 'add_product_batch', placeholder: 'Digite o número do lote...', schema: 'batch'},
        {label: 'Local de Armazenamento', mode: 'select', name: 'add_product_storage_location', enum: true, product_enum: productEnums.storageLocations, schema: 'storageLocation'},
        {label: 'Data de Fabricação', mode: 'input', type: 'date', name: 'add_product_man_date', schema: 'manufacture_date'},
        {label: 'Data de Validade', mode: 'input', type: 'date', name: 'add_product_exp_date', schema: 'expiration_date'},
        {label: 'Unidade de Uso', mode: 'combo', type: 'number', name: 'add_product_max_stock', selectName: 'add_product_unit_type', enum: true, product_enum: productEnums.unitOfMeasure, placeholder: 'Exemplo.: 100', schema: 'max_stock', schema1: 'unit_of_measure'},
        {label: 'Marca', mode: 'input', type: 'text', name: 'add_product_brand', placeholder: 'Digite o nome da marca...', schema: 'brand'},
        {label: 'Preço de Custo', mode: 'input', type: 'number', name: 'add_product_price', placeholder: 'Exemplo.: 35.50', schema: 'cost_price'},
        {label: 'Fornecedor', mode: 'select', name: 'add_product_supplier', schema: 'supplierId'},
        {label: 'Categoria', mode: 'select', name: 'add_product_category', enum: true, product_enum: productEnums.categories, schema: 'category'},
        {label: 'Alergênicos', mode: 'select', name: 'add_product_allergens', enum: true, product_enum: productEnums.allergens, multiply: true, schema: 'allergens'},
        {label: 'Quantidade Atual', mode: 'input', type: 'number', name: 'add_product_unit', placeholder: 'Exemplo.: 80', schema: 'stock_quantity'},
        {label: 'Quantidade Mínima', mode: 'input', type: 'number', name: 'add_product_min_stock', placeholder: 'Exemplo.: 10', schema: 'min_stock'},
        {label: 'Status', mode: 'select', name: 'add_product_status', enum: true, product_enum: productEnums.statuses, schema: 'status'},
        {label: 'Nota fiscal', mode: 'input', type: 'file', group: 'button', name: 'add_product_url', schema: 'document_url'},
        {label: ' ', text: 'Salvar', mode: 'button', type: 'submit'}
    ];

    const checkInProductFormsInputValue = [
        {label: 'Produto', mode: 'select', name: 'check_product_name'},
        {...inputValues[1], name: 'check_product_batch'},
        {...inputValues[3], name: 'check_product_man_date'},
        {...inputValues[4], name: 'check_product_exp_date'},
        {...inputValues[5], name: 'check_product_unit'},
        {...inputValues[7], name: 'check_product_price'},
        {...inputValues[8], name: 'check_product_supplier'},
        {...inputValues[14], name: 'check_product_url'},
        {...inputValues[15]}
    ];

    const writeOffProductFormsInputValue = [
        {label: 'Produto', mode: 'select', name: 'write_off_name'},
        {label: 'Lote', mode: 'select', name: 'write_off_batch'},
        {label: 'Quantidade retirada por compra', mode: 'input', type: 'number', name: 'write_off_unit', placeholder: '60'},
        {...inputValues[15]}
    ];

    // ===================== Busca de dados no backend =====================
    async function get_products() {
        try {
            const products_db = await getProducts();
            setProducts(products_db);
        } catch (error) {
            console.error("Produtos não encontrados no sistema.", error);
        }
    }

    useEffect(() => {
        get_products();
    }, []);

    useEffect(() => {
        async function get_enums() {
            try {
                const enums_forms = await getProductEnums();
                setProductEnums(enums_forms);
            } catch (error) {
                console.error("Erro ao carregar os dados dos formularios.", error);
            }
        }
        get_enums();
    }, []);

    useEffect(() => {
        async function handleGetSuppliers() {
            try {
                const suppliers = await getSuppliers();
                setSuppliers(suppliers);
            } catch (error) {
                console.error('Erro ao carregar os fornecedores.');
            }
        }
        handleGetSuppliers();
    }, []);

    // ===================== CRUD de produto (create / edit / delete) =====================
    async function handleCreateProduct(e) {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('add_product_name')),
            cost_price: parseFloat(formData.get('add_product_price')),
            category: String(formData.get('add_product_category')),
            brand: String(formData.get('add_product_brand')),
            allergens: selectAllergensForProducts,
            stock_quantity: parseInt(formData.get('add_product_unit')),
            unit_of_measure: String(formData.get('add_product_unit_type')),
            max_stock: parseInt(formData.get('add_product_max_stock')),
            min_stock: parseInt(formData.get('add_product_min_stock')),
            manufacture_date: new Date(formData.get('add_product_man_date')).toISOString(),
            expiration_date: new Date(formData.get('add_product_exp_date')).toISOString(),
            storageLocation: String(formData.get('add_product_storage_location')),
            status: String(formData.get('add_product_status')),
            batch: String(formData.get('add_product_batch')),
            supplierId: parseInt(formData.get('add_product_supplier')),
            unitId: user.storeUnitId,
            document_url: documentUrl || null
        };

        try {
            await createProducts(payload);
            await get_products();
            setAddProductModalIsOpen(false);
            setSelectAllergensForProducts([]);
            setSucessPhrase('Produto criado com sucesso!');
            setSucessModalIsOpen(true);
            e.target.reset();
        } catch (error) {
            console.log("Erro ao criar produto: ", error);
            setFormError('Não foi possível criar o produto. Verifique os dados e tente novamente.');
        }
    }

    const [editAllergens, setEditAllergens] = useState([]);

    function parseNumberOrFallback(formData, fieldName, fallback) {
        if (!formData.has(fieldName)) return fallback;
        const raw = formData.get(fieldName);
        if (raw === '' || raw === null) return fallback;
        const parsed = parseInt(raw);
        return isNaN(parsed) ? fallback : parsed;
    }

    useEffect(() => {
        if (selectedProduct) {
            setEditAllergens(selectedProduct.allergens || []);
        }
    }, [selectedProduct]);

    async function handleEditProduct(e) {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);

        const payload = {
        name: String(formData.get('add_product_name') || selectedProduct.name),
        cost_price: parseFloat(formData.get('add_product_price')) || selectedProduct.cost_price, // mesmo bug aqui, se preço puder ser 0
        category: String(formData.get('add_product_category') || selectedProduct.category),
        brand: String(formData.get('add_product_brand') || selectedProduct.brand),
        allergens: editAllergens,
        stock_quantity: parseNumberOrFallback(formData, 'add_product_unit', selectedProduct.stock_quantity),
        unit_of_measure: String(formData.get('add_product_unit_type') || selectedProduct.unit_of_measure),
        max_stock: parseNumberOrFallback(formData, 'add_product_max_stock', selectedProduct.max_stock),
        min_stock: parseNumberOrFallback(formData, 'add_product_min_stock', selectedProduct.min_stock),
        manufacture_date: formData.get('add_product_man_date')
            ? new Date(formData.get('add_product_man_date')).toISOString()
            : selectedProduct.manufacture_date,
        expiration_date: formData.get('add_product_exp_date')
            ? new Date(formData.get('add_product_exp_date')).toISOString()
            : selectedProduct.expiration_date,
        storageLocation: String(formData.get('add_product_storage_location') || selectedProduct.storageLocation),
        status: String(formData.get('add_product_status') || selectedProduct.status),
        batch: selectedProduct.batch,
        supplierId: parseNumberOrFallback(formData, 'add_product_supplier', selectedProduct.supplierId),
        unitId: user.storeUnitId,
        document_url: documentUrl || selectedProduct.document_url,
    };

        try {
            await editProducts(selectedProduct.id, payload);
            await get_products();
            setEditProductModalIsOpen(false);
            setEditProductStatus(false);
            setSucessPhrase(`${selectedProduct.name} editado com sucesso!`);
            setSucessModalIsOpen(true);
        } catch (error) {
            console.error("Erro ao editar produto. ", error);
            setFormError(`Não foi possível editar ${selectedProduct.name}. Verifique os dados e tente novamente.`);
        }
    }

    async function handleDeleteProduct() {
        try {
            await deleteProducts(selectedProduct.id);
            await get_products();
            setEditProductModalIsOpen(false);
            setEditProductStatus(false);
            setSelectedProduct(null);
            setSucessPhrase(`${selectedProduct.name} deletado com sucesso!`);
            setSucessModalIsOpen(true);
        } catch (error) {
            console.error("Erro o deletar produto. ", error);
            setFormError('Erro ao deletar Produto.');
        }
    }

    function getUniqueProductsByName(products) {
        return [...new Map(products.map(p => [p.name, p])).values()];
    }

    const uniqueProducts = getUniqueProductsByName(products);

    const [entranceSelectedProduct,setEntranceSelectedProduct] = useState(null);
    const [writeOffSelectedProduct,setWriteOffSelectedProduct] = useState(null);

    async function handleCheckInProduct(e) {
        e.preventDefault();
        setFormError("");

        if (!entranceSelectedProduct) {
            setFormError('Selecione um produto antes de dar entrada.');
            return;
        }

        const formData = new FormData(e.target);
        const payload = {
            name: entranceSelectedProduct.name,
            cost_price: entranceSelectedProduct.cost_price,
            category: entranceSelectedProduct.category,
            brand: entranceSelectedProduct.brand,
            allergens: entranceSelectedProduct.allergens,
            unit_of_measure: entranceSelectedProduct.unit_of_measure,
            min_stock: entranceSelectedProduct.min_stock,
            storageLocation: entranceSelectedProduct.storageLocation,
            status: entranceSelectedProduct.status,
            supplierId: parseInt(formData.get('check_product_supplier')),
            document_url: entranceSelectedProduct.document_url ?? null,
            unitId: user.storeUnitId,
            batch: String(formData.get('check_product_batch')),
            max_stock: parseInt(formData.get('check_product_unit')),
            stock_quantity: parseInt(formData.get('check_product_unit')),
            manufacture_date: new Date(formData.get('check_product_man_date')).toISOString(),
            expiration_date: new Date(formData.get('check_product_exp_date')).toISOString(),
        };

        try {
            await createProducts(payload);
            await get_products();
            setEntranceProductModalIsOpen(false);[]
            setSucessPhrase(`Entrada de ${entranceSelectedProduct.name} feita com sucesso!`);
            setSucessModalIsOpen(true);
            e.target.reset();
        } catch (error) {
            console.log("Erro ao criar produto: ", error);
            setFormError('Não foi possível criar o produto. Verifique os dados e tente novamente.');
        }
    }

    async function handleWriteOffProduct(e){
        e.preventDefault();
        setFormError('');

        if(!writeOffSelectedProduct) {
            console.log("Nenhum produto selecionado");
            return;
        }

        const formData = new FormData(e.target);
        const new_stock_quantity = parseNumberOrFallback(formData, 'write_off_unit', writeOffSelectedProduct.stock_quantity);

        console.log("Produto selecionado:", writeOffSelectedProduct);
        console.log("Quantidade informada:", new_stock_quantity);

        try {
            await writeOffProducts(writeOffSelectedProduct.id, new_stock_quantity);
            await get_products();
            setRemoveProductModalIsOpen(false);
            setWriteOffSelectedProduct(null);
            setSucessPhrase(`Baixa de ${writeOffSelectedProduct.name} feita com sucesso!`);
            setSucessModalIsOpen(true);
            e.target.reset();
        } catch(error) {
            console.log("Erro ao editar produto: ", error);
            setFormError('Não foi possível editar o produto. Verifique os dados e tente novamente.');
        }
        }


    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-stock">
                    <div id='container'>
                        <div id="top-container">
                            <div className="groups-top-container">
                                <button onClick={() => navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                                <h1>Estoque</h1>
                            </div>

                            <div className="groups-top-container">
                                <button onClick={() => setAddProductModalIsOpen(!addProductModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                                <button onClick={() => setEntranceProductModalIsOpen(!entranceProductModalIsOpen)} className="btn-stock-base">Dar Entrada</button>
                                <button onClick={() => setRemoveProductModalIsOpen(!removeProductModalIsOpen)} className="btn-stock-base">Dar Baixa</button>
                                <button onClick={() => setFilterProductModalIsOpen(!filterProductModalIsOpen)} id='btn-funnel-base' className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                            </div>
                        </div>
                        <div>
                            {products.length === 1 ? (
                                <p style={{ color: '#777171ff' }}>{String(products.length).padStart(2,'0')} item monitorado {missing_products_text} {product_running_low} {text_vencidos}</p>
                            ) : (
                                <p style={{ color: '#777171ff' }}>{String(products.length).padStart(2,'0')} itens monitorados {missing_products_text} {product_running_low} {text_vencidos}</p>
                            )}
                        </div>
                    </div>
                    <div id="filters-container">
                        {filter_btn.map((name, index) => (
                            <button key={index} onClick={() => setFilterBtnIsClicked(index)} className={`btn-filters ${filterBtnIsClicked === index ? 'clicked' : 'notClicked'}`}>{name}</button>
                        ))}
                    </div>
                    <div id="products-list">
                        {filteredProducts.length !== 0 ? (
                            filteredProducts.map((item, index) => {

                                const dateFab = new Date(item.manufacture_date).toLocaleDateString('pt-br', { timeZone: 'UTC' });
                                const dateVal = new Date(item.expiration_date).toLocaleDateString('pt-br', { timeZone: 'UTC' });

                                return (
                                    <button onClick={() => {
                                        setSelectedProduct(item)
                                        setEditProductModalIsOpen(!editProductModalIsOpen)
                                        setEditProductStatus(false)
                                    }} key={index} className={`card-products ${item.stock_quantity === 0 ? 'empty' : item.stock_quantity <= item.min_stock ? 'mid-empty' : 'full'}`}>
                                        <div className='top-container-card'>
                                            <div className="inside-container-card">
                                                <p style={{fontSize: 20}}><b>{item.name}</b> - {item.brand}</p>
                                                <div className="align-items-card">
                                                    {item.stock_quantity === 0 ? (
                                                        <p className="text-stock empty">Em Falta</p>
                                                    ) : item.stock_quantity <= item.min_stock ? (
                                                        <p className="text-stock mid-empty">Próximo de Acabar</p>
                                                    ) : (
                                                        <p className="text-stock full">Estoque Saudável</p>
                                                    )}
                                                    <p><b>{item.stock_quantity}/{item.max_stock} {item.unit_of_measure}</b></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bottom-container-card">
                                            <p>Fabricação: {dateFab}</p>
                                            <p>Validade: {dateVal}</p>
                                        </div>
                                    </button>
                                )
                            })
                        ) : (
                            <p>Nenhum produto existente.</p>
                        )}
                    </div>
                </div>
                <Modal
                    isOpen={addProductModalIsOpen}
                    onRequestClose={() => { setAddProductModalIsOpen(false); }}
                    contentLabel="Adicionar Produtos"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Adicionar Produto</h2>
                            <button onClick={() => { setAddProductModalIsOpen(false); }}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para adicionar um novo produto ao estoque.</p>
                    </div>

                    <form className="modal-products-form" onSubmit={handleCreateProduct}>
                       {inputValues.map((mode,index)=>{
                            const btn_file_add = <mode.group type='button' className="btn-modal-file" onClick={handleButtonClick}>
                                <label htmlFor="">Adicionar Arquivo</label>
                                <input hidden type='file' ref={fileRef} onChange={handleFileClick} />
                            </mode.group>;

                            return(
                                <div key={index} className="fields" style={{position:'relative'}}>
                                    {mode.group ? (
                                        <div className="fields">
                                            <label htmlFor="">{mode.label}</label>
                                            {btn_file_add}
                                            <p style={{fontSize: 14, color: 'black', whiteSpace: 'nowrap'}}>{fileName}</p>
                                        </div>
                                    ) : (
                                        mode.mode === 'select' ? (
                                            mode.multiply ? (
                                                <div className="fields-allergens">
                                                    <label>{mode.label}</label>
                                                    <ul className="input-select-model ul-list">
                                                        {selectAllergensForProducts.length <=0 ? (
                                                            <p>Nenhum alergênico selecionado.</p>
                                                        ) : (
                                                            selectAllergensForProducts.map((allergen,i)=>(
                                                                <li
                                                                    key={i}
                                                                    className="li-style-model"
                                                                >{allergen.replaceAll('_',' ')}
                                                                    <button
                                                                        type="button"
                                                                        onClick={()=>setSelectAllergensForProducts(prev => prev.filter(a => a !== allergen))}
                                                                    >&times;</button>
                                                                </li>
                                                            ))
                                                        )}
                                                        <button 
                                                            className="add-category-ul-list"
                                                            type="button"
                                                            onClick={()=>setAddAllergensToListModal(!addAllergensToListModal)}
                                                        >
                                                            <Plus></Plus>
                                                        </button>
                                                    </ul>
                                                    {addAllergensToListModal ? (
                                                        <ul className="add-allergen-select">
                                                            {mode.product_enum.map((all,i)=>(
                                                                <li key={i} value={all}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={()=>setSelectAllergensForProducts(prev=>
                                                                            prev.includes(all) ? prev : [...prev, all]
                                                                        )}
                                                                    >{all.replaceAll('_',' ')}</button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : ('')}
                                                </div>
                                            ) : (
                                                <>
                                                    <label>{mode.label}</label>
                                                    <select className="input-modal-add-product" name={mode.name}>
                                                        {mode.enum ? 
                                                        mode.product_enum.map((p_enum, ind)=>(
                                                            <option value={p_enum} key={ind}>{p_enum.replaceAll('_',' ')}</option>
                                                        ))
                                                        : suppliers.map((sup,i)=>(
                                                            <option value={sup.id} key={i}>{sup.company_name}</option>
                                                        ))}
                                                    </select>
                                                </>
                                            )
                                        ) : mode.mode === 'input' ? (
                                            <>
                                                <label htmlFor="">{mode.label}</label>
                                                <input className="input-modal-add-product" name={mode.name} type={mode.type} placeholder={mode.placeholder} />
                                            </>
                                        ) : mode.mode === 'combo' ? (
                                            <>
                                                <label htmlFor="">{mode.label}</label>
                                                <div style={{display:'flex',flexDirection: 'row', gap: 10}}>
                                                    <input className="input-modal-add-product" name={mode.name} type={mode.type} placeholder={mode.placeholder}></input>
                                                    <select className="input-modal-add-product" name={mode.selectName} id="">
                                                        {mode.product_enum.map((item,i)=>(
                                                            <option key={i}>{item.replaceAll('_',' ')}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <button className="btn-modal-add-products" type={mode.type}>
                                                {mode.text}
                                            </button>
                                        )
                                    )}
                                </div>
                                
                            )
                        })}
                        {formError && <p>{formError}</p>}
                        
                    </form>
                </Modal>

                <Modal
                    isOpen={entranceProductModalIsOpen}
                    onRequestClose={() => setEntranceProductModalIsOpen(!entranceProductModalIsOpen)}
                    contentLabel="Dar Entrada"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Dar Entrada</h2>
                            <button onClick={() => setEntranceProductModalIsOpen(!entranceProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para adicionar um novo lote ao estoque.</p>
                    </div>
                    <form className="modal-products-form-entrance" onSubmit={handleCheckInProduct}>
                        {checkInProductFormsInputValue.map((mode,index)=>{

                            const btn_file_add = <mode.group type='button' className="btn-modal-file" onClick={handleButtonClick}>
                                <label htmlFor="">Adicionar Arquivo</label>
                                <input hidden type='file' ref={fileRef} onChange={handleFileClick} />
                            </mode.group>;

                            return(
                                mode.mode === 'select' ? (
                                    mode.label === 'Fornecedor' ? (
                                        <div key={index} className="fields">
                                            <label htmlFor="">{mode.label}</label>
                                            <select className="input-modal-add-product" name={mode.name}>
                                                {suppliers.map((sup,index)=>(
                                                    <option value={sup.id} key={index}>{sup.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) :(
                                        <div key={index} className="fields">
                                            <label htmlFor="">{mode.label}</label>
                                            <select 
                                                className="input-modal-add-product"
                                                onChange={(e) => {
                                                    const found = uniqueProducts.find(p => p.name === e.target.value);
                                                    setEntranceSelectedProduct(found || null);
                                                }}
                                                name={mode.name}
                                            >
                                                 <option value="">Selecione um produto</option>
                                                {uniqueProducts.map((product,index)=>(
                                                    <option key={index} value={product.name}>{product.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )
                                ) : mode.group ? (
                                        <div key={index} className="fields">
                                            <label htmlFor="">{mode.label}</label>
                                            {btn_file_add}
                                        </div>

                                ) : mode.mode === 'button' ? (
                                    <div className="fields" key={index}>
                                        <label htmlFor="">{mode.label}</label>
                                        <button type={mode.type} className="btn-modal-add-products">
                                            {mode.text}
                                        </button>
                                    </div>
                                ) : (
                                    <div key={index} className="fields">
                                        <label>{mode.label}</label>
                                        <input name={mode.name} className="input-modal-add-product" type={mode.type} placeholder={mode.placeholder}/>
                                    </div>
                                )
                            )
                        })}
                        {formError}
                    </form>
                </Modal>

                <Modal
                    isOpen={removeProductModalIsOpen}
                    onRequestClose={() => setRemoveProductModalIsOpen(!removeProductModalIsOpen)}
                    contentLabel="Dar Baixa"
                    shouldCloseOnOverlayClick={true}
                    style={modalWriteOffProductStyle}
                >
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Dar Baixa</h2>
                            <button onClick={() => setRemoveProductModalIsOpen(!removeProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para dar baixa do produto no estoque.</p>
                    </div>
                    <form className="modal-products-form-remove" onSubmit={handleWriteOffProduct}>
                        {writeOffProductFormsInputValue.map((mode,i)=>
                            mode.label === 'Produto' ? (
                                <div key={i} className="fields">
                                    <label>{mode.label}</label>
                                    <select
                                        className="input-modal-add-product"
                                        onChange={(e) => setSelectedProductName(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="">Selecione um produto...</option>
                                        {uniqueProducts.map((prod,idx)=>(
                                            <option key={idx} value={prod.name}>{prod.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : mode.label === 'Lote' ? (
                                <div key={i} className="fields">
                                    <label>{mode.label}</label>
                                    <select 
                                            className="input-modal-add-product"
                                            name={mode.name}
                                            onChange={(e) => {
                                                const found = matchingBatches.find(b => b.id === parseInt(e.target.value));
                                                setWriteOffSelectedProduct(found || null);
                                            }}
                                            defaultValue=""
                                        >
                                        <option value="">Selecione um lote...</option>
                                        {matchingBatches.map((item,idx)=>(
                                            <option value={item.id} key={idx}>{item.batch}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : mode.mode === 'button' ? (
                                <div className="fields" key={i}>
                                    <label htmlFor="">{mode.label}</label>
                                    <button type={mode.type} className="btn-modal-add-products">
                                        {mode.text}
                                    </button>
                                </div>
                            ):(
                                <div key={i} className="fields">
                                    <label htmlFor="">{mode.label}</label>
                                    <input className="input-modal-add-product" placeholder={mode.placeholder} name={mode.name} type={mode.type} />
                                </div>
                            )
                    )}
                    </form>
                </Modal>

                <Modal
                    isOpen={filterProductModalIsOpen}
                    onRequestClose={() => setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                    contentLabel="Modal de Filtros"
                    shouldCloseOnOverlayClick={true}
                    style={modalFilterProductsStyle}
                >
                    <div className="container-filters">
                        <div className="top-container-filters">
                            <h1>Filtrar Por</h1>
                            <button onClick={() => setFilterProductModalIsOpen(!filterProductModalIsOpen)}>&times;</button>
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
                                "Categoria": null,
                                "Local de Armazenamento": null,
                                "Alergênicos": null,
                                "Status": null
                            })}
                        >
                            Limpar Filtros do Modal
                        </button>
                    </div>
                </Modal>

                <Modal
                    isOpen={editProductModalIsOpen}
                    onRequestClose={() => {
                        setEditProductModalIsOpen(!editProductModalIsOpen)
                        setIsCustomSelectMode(!isCustomSelectMode)
                        setAddAllergensToListModal(false)
                    }}
                    contentLabel="Editar Produto"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    {(()=>{
                        const text_enable_edit = editProductStatus ? 'Desabilitar Edição' : 'Habilitar Edição';
                        const subtitle_top_container = editProductStatus ?  `Edite e altere informações de ${selectedProduct?.batch}` : `Dados de ${selectedProduct?.batch}`;
                        const btn_delete = editProductStatus ? <button  className="btn-modal-file delete" onClick={handleDeleteProduct}>< Trash></Trash></button> : '';
                        

                        return(
                            <div className="modal-edit-products">
                                <div className="modal-products-header">
                                    <div className="top-container-modal-products">
                                        <div className="group-title-edit">
                                            <h2>{selectedProduct?.name}</h2>
                                            <button style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'10px',fontSize:'18px'}} onClick={() => setEditProductStatus(!editProductStatus)}>{text_enable_edit}<SquarePen></SquarePen></button>
                                        </div>
                                        <button onClick={() => {
                                            setEditProductModalIsOpen(!editProductModalIsOpen)
                                            setIsCustomSelectMode(!isCustomSelectMode)
                                            setAddAllergensToListModal(false)
                                            }} style={{fontSize:'30px'}}>&times;</button>
                                    </div>
                                    <p className="text-under-top-container">{subtitle_top_container}</p>
                                </div>
                                <form onSubmit={handleEditProduct} className="modal-products-form">
                                    {inputValues.map((mode,index)=>{
                                        const btn_file_add = <mode.group
                                            type='button'
                                            className="btn-modal-file"
                                            onClick={editProductStatus ? handleButtonClick : () => {
                                                if (selectedProduct?.document_url) {
                                                    window.open(selectedProduct.document_url, '_blank', 'noopener,noreferrer');
                                                } else {
                                                    setFormError('Nenhum arquivo cadastrado para este produto.');
                                                }
                                            }}
                                        >
                                            <label htmlFor="">{editProductStatus ? 'Adicionar Arquivo' : 'Ver Arquivo'}</label>
                                            {editProductStatus && (
                                                <input hidden type='file' ref={fileRef} onChange={handleFileClick} />
                                            )}
                                        </mode.group>;

                                        return(
                                            <div key={index} className="fields" style={{position:'relative'}}>
                                                {mode.group ? (
                                                    <div className="fields">
                                                        <label htmlFor="">{mode.label}</label>
                                                        {btn_file_add}
                                                        {editProductStatus && (<p style={{fontSize: 14, color: 'black', whiteSpace: 'nowrap'}}>{fileName}</p>)}
                                                    </div>
                                                ) : (
                                                    mode.mode === 'select' ? (
                                                        mode.multiply ? (
                                                            <div className="fields-allergens">
                                                                <label>{mode.label}</label>
                                                                <ul className="input-select-model ul-list">
                                                                    {editAllergens.length <=0 ? (
                                                                        <p>Nenhum alergênico selecionado.</p>
                                                                    ) : (
                                                                        editAllergens.map((allergen,i)=>(
                                                                            <li
                                                                                key={i}
                                                                                className="li-style-model"
                                                                            >{allergen.replaceAll('_',' ')}
                                                                                {editProductStatus? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={()=>setEditAllergens(prev => prev.filter(a => a !== allergen))}
                                                                                    >&times;</button>
                                                                                ) : ('')}
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                    {editProductStatus ? (
                                                                        <button 
                                                                            className="add-category-ul-list"
                                                                            type="button"
                                                                            onClick={()=>setAddAllergensToListModal(!addAllergensToListModal)}
                                                                        >
                                                                            <Plus></Plus>
                                                                        </button>
                                                                    ) : ('')}
                                                                </ul>
                                                                {addAllergensToListModal ? (
                                                                    <ul className="add-allergen-select">
                                                                        {mode.product_enum.map((all,i)=>(
                                                                            <li key={i} value={all}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={()=>setEditAllergens(prev=>
                                                                                        prev.includes(all) ? prev : [...prev, all]
                                                                                    )}
                                                                                >{all.replaceAll('_',' ')}</button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : ('')}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <label>{mode.label}</label>
                                                                <select defaultValue={selectedProduct?.[mode.schema]} disabled={!editProductStatus} className="input-modal-add-product" name={mode.name}>
                                                                    {mode.enum ? 
                                                                    mode.product_enum.map((p_enum, ind)=>(
                                                                        <option value={p_enum} key={ind}>{p_enum.replaceAll('_',' ')}</option>
                                                                    ))
                                                                    : suppliers.map((sup,i)=>(
                                                                        <option value={sup.id} key={i}>{sup.company_name}</option>
                                                                    ))}
                                                                </select>
                                                            </>
                                                        )
                                                    ) : mode.label === 'Lote' ? (
                                                        <>
                                                            <label>{mode.label}</label>
                                                            <select
                                                                disabled={!editProductStatus}
                                                                className="input-modal-add-product"
                                                                defaultValue={selectedProduct?.id}
                                                                onChange={(e) => {
                                                                    const found = matchingBatchesEdit.find(b => b.id === parseInt(e.target.value));
                                                                    setSelectedProduct(found || null);
                                                                }}
                                                            >
                                                                {matchingBatchesEdit.map((item,i)=>(
                                                                    <option key={i} value={item.id}>{item.batch}</option>
                                                                ))}
                                                            </select>
                                                        </>
                                                    ): mode.type === 'date' ? (
                                                        <>
                                                            <label htmlFor="">{mode.label}</label>
                                                            <input
                                                                readOnly={!editProductStatus}
                                                                className="input-modal-add-product"
                                                                name={mode.name}
                                                                type={mode.type}
                                                                defaultValue={
                                                                    selectedProduct?.[mode.schema]
                                                                        ? new Date(selectedProduct[mode.schema]).toISOString().split('T')[0]
                                                                        : ''
                                                                }
                                                            />
                                                        </>
                                                    ) : mode.mode === 'input' ? (
                                                        <>
                                                            <label htmlFor="">{mode.label}</label>
                                                            <input readOnly={!editProductStatus} className="input-modal-add-product" name={mode.name} type={mode.type} placeholder={selectedProduct? selectedProduct[mode.schema] : ''} />
                                                        </>
                                                    ) : mode.mode === 'combo' ? (
                                                        <>
                                                            <label htmlFor="">{mode.label}</label>
                                                            <div style={{display:'flex',flexDirection: 'row', gap: 10}}>
                                                                <input readOnly={!editProductStatus} className="input-modal-add-product" name={mode.name} type={mode.type}  placeholder={selectedProduct? selectedProduct[mode.schema] : ''}></input>
                                                                <select defaultValue={selectedProduct?.[mode.schema1]} disabled={!editProductStatus} className="input-modal-add-product" name={mode.selectName} id="">
                                                                    {mode.product_enum.map((item,i)=>(
                                                                        <option key={i}>{item.replaceAll('_',' ')}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        editProductStatus ? (
                                                            <div style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                                                                <button className="btn-modal-add-products" type={mode.type}>
                                                                    {mode.text}
                                                                </button>
                                                                {btn_delete}
                                                            </div>
                                                        ) : ''
                                                    )
                                                )}
                                            </div>
                                        )
                                    })}
                                    {formError && <p>{formError}</p>}
                                </form>
                            </div>
                        )
                    })()}
                </Modal>

                <SucessModals
                    phrase={sucessPhrase}
                    isOpen={sucessModalIsOpen}
                    setIsOpen={setSucessModalIsOpen}
                />

            </main>
        </>
    );
}

export default Stock