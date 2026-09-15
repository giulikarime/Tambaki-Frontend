import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel, ChefHat, ChevronRight, ChevronDown, SquarePen, Trash, } from "lucide-react";
import { getProducts, getProductEnums, createProducts, editProducts, deleteProducts } from "../../services/products";
import { getSuppliers } from "../../services/suppliers";
import { useContext } from "react";
import { AuthContext } from "../../services/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'
import SelectInputMode from "../../components/SelectInputMode/SelectInputMode";
import React, { Fragment } from 'react';

function Stock() {

    const [isCustomSelectMode, setIsCustomSelectMode] = useState(false);

    // Const padrão das páginas
    const [expanded, setExpand] = useState(false);
    const navigate = useNavigate()

    //Interação com botões de filtros
    const [hasInteracted, setHasInteracted] = useState(false); //Interagiu com os filter_btn
    const filter_btn = ["Todos", "Estoque Saudável", "Próximo de Acabar", "Em Falta", "Perto do Vencimento"];
    const [filterBtnIsClicked, setFilterBtnIsClicked] = useState(0); //Clicou no botão filter_btn

    const [products, setProducts] = useState([]) //Array de produtos

    //Const para acessar files do computador
    const fileRef = useRef(null); //ref para acessar files

    function handleButtonClick() { //Ativar botão de files
        fileRef.current.click()
    }

    function handleFileClick(event) { //ativar input de files
        const file = event.target.files[0];
    }

    //Modais de CRUD para produtos
    const [addProductModalIsOpen, setAddProductModalIsOpen] = useState(false);
    const [entranceProductModalIsOpen, setEntranceProductModalIsOpen] = useState(false);
    const [removeProductModalIsOpen, setRemoveProductModalIsOpen] = useState(false);
    const [editProductModalIsOpen, setEditProductModalIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editProductStatus, setEditProductStatus] = useState(false);

    // Modal de Aplicar filtros
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

     //puxando itens do backend para o select
    const [productEnums, setProductEnums] = useState({
        categories: [],
        allergens: [],
        storageLocations: [],
        statuses: [],
        unitOfMeasure: [],
        batchs: [],
    });

    //Definindo strings que mostram o estado dos produtos
    const missingProducts = products.filter(product => product.stock_quantity === 0);
    const midStockProducts = products.filter(product => product.stock_quantity <= product.min_stock && product.stock_quantity !== 0);
    const missing_products_text = missingProducts.length > 0 ? `- ${String(missingProducts.length).padStart(2, "0")} em falta` : '';
    const product_running_low = midStockProducts.length > 0 ?
        (midStockProducts.length === 1 ?
            `- ${String(midStockProducts.length).padStart(2, "0")} próximo de acabar`
            :
            `- ${String(midStockProducts.length).padStart(2, "0")} próximos de acabar`)
        : ('');
    
    // 1. Filtra os produtos com vencimento nos próximos 10 dias (e não vencidos)
    const hoje = new Date();
    const produtosProximosVencimento = products.filter((item) => {
        const vencimento = new Date(item.expiration_date);
        const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);
        
        // Altere a quantidade de dias (ex: 10) conforme sua necessidade
        return diffDias <= 10; 
    });

    // 2. Calcula a quantidade
    const qtdVencendo = produtosProximosVencimento.length;

    // 3. Monta o texto diretamente (acessível no seu JSX)
    const text_vencidos = qtdVencendo.length > 0 ? (
        `- ${String(qtdVencendo).padStart(2, "0")} perto do vencimento.`
    ) : (
        ''
    )

    //Valores dos inputs/selects nos formularios
    const [storageLocationValue, setStorageLocationValue] = useState("");
    const [allergenValue, setAllergenValue] = useState("");
    const [categoryValue, setCategoryValue] = useState("");
    const [batchValue, setBatchValue] = useState("");

    //Método de filtrar produtos por botões
    const filteredProducts = products.filter((item) => {
        // --- 1. Filtro dos Botões (Estoque/Validade) ---
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
                const hoje = new Date();
                const vencimento = new Date(item.expiration_date);
                const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);
                matchesBtn = diffDias <= 10;
                break;
            }
            default:
                matchesBtn = true;
        }

        // Se já não passou no filtro do botão, ignora os demais para otimizar
        if (!matchesBtn) return false;

        // --- 2. Filtros do Modal ---
        
        // Filtro de Categoria
        if (selectedModalFilters["Categoria"] && item.category !== selectedModalFilters["Categoria"]) {
            return false;
        }

        // Filtro de Local de Armazenamento
        if (selectedModalFilters["Local de Armazenamento"] && item.storageLocation !== selectedModalFilters["Local de Armazenamento"]) {
            return false;
        }

        // Filtro de Alergênicos (Trata array ou string)
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

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

    //Estilizações dos modais
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

    //Funções que importam dados do backend
    async function get_products() {
        try {
            const products_db = await getProducts();
            setProducts(products_db);
        } catch (error) {
            console.error("Produtos não encontrados no sistema.", error)
        }
    }
    useEffect(() => {
        get_products();
    }, [])

    useEffect(()=>{
        async function get_enums(){
            try{
                const enums_forms = await getProductEnums();
                setProductEnums(enums_forms);
            } catch (error){
                console.error("Erro ao carregar os dados dos formularios.",error)
            }
        }

        get_enums();
    },[])

    const [suppliers,setSuppliers] = useState([]);

    useEffect(()=>{
        async function handleGetSuppliers(){
            try{
                const suppliers = await getSuppliers();
                setSuppliers(suppliers);
            } catch(error){
                console.error('Erro ao carregar os fornecedores.')
            }
        }

        handleGetSuppliers();
    },[])

    const [formError,setFormError] = useState('')

    const { user } = useContext(AuthContext);

    async function handleCreateProduct(e) {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('name_add')),
            cost_price: parseFloat(formData.get('cost_price')),
            category: categoryValue || productEnums.categories[0],
            brand: String(formData.get('brand')),
            allergens: allergenValue ? [allergenValue] : [],
            stock_quantity: parseInt(formData.get('stock_quantity')),
            unit_of_measure: String(formData.get('unit_of_measure')),
            min_stock: parseInt(formData.get('min_stock')),
            max_stock: parseInt(formData.get('max_stock')),
            manufacture_date: new Date(formData.get('manufacture_date')).toISOString(),
            expiration_date: new Date(formData.get('expiration_date')).toISOString(),
            storageLocation: storageLocationValue || productEnums.storageLocations[0],
            status: String(formData.get('status')) || productEnums.statuses[0],
            batch: String(formData.get('batch')),
            supplierId: parseInt(formData.get('supplierId')),
            unitId: user.storeUnitId,
        }

        try{
            await createProducts(payload);
            await get_products();
            setAddProductModalIsOpen(false);
            e.target.reset();
        } catch(error){
            console.log("Erro ao criar produto: ", error);
            setFormError('Não foi possível criar o produto. Verifique os dados e tente novamente.')
        }
    }

    async function handleEditProduct(e){
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);

        const payload = {
            name: String(formData.get('name_edit') || selectedProduct.name),
            cost_price: parseFloat(formData.get('cost_price_edit')) || selectedProduct.cost_price,
            category: categoryValue || selectedProduct.category,
            brand: String(formData.get('brand_edit') || selectedProduct.brand),
            allergens: allergenValue ? [allergenValue] : selectedProduct.allergens,
            stock_quantity: parseInt(formData.get('stock_quantity_edit')) || selectedProduct.stock_quantity,
            unit_of_measure: String(formData.get('unit_of_measure_edit') || selectedProduct.unit_of_measure),
            min_stock: parseInt(formData.get('min_stock_edit')) || selectedProduct.min_stock,
            max_stock: parseInt(formData.get('max_stock_edit')) || selectedProduct.max_stock,
            manufacture_date: formData.get('manufacture_date_edit')
                ? new Date(formData.get('manufacture_date_edit')).toISOString()
                : selectedProduct.manufacture_date,
            expiration_date: formData.get('expiration_date_edit')
                ? new Date(formData.get('expiration_date_edit')).toISOString()
                : selectedProduct.expiration_date,
            storageLocation: storageLocationValue || selectedProduct.storageLocation,
            status: String(formData.get('status_edit') || selectedProduct.status),
            batch: String(formData.get('batch_edit') || selectedProduct.batch),
            supplierId: parseInt(formData.get('supplierId_edit')) || selectedProduct.supplierId,
            unitId: user.storeUnitId,
        }

        try{
            await editProducts(selectedProduct.id, payload);
            await get_products();
            setEditProductModalIsOpen(false);
            setEditProductStatus(false);
        } catch (error){
            console.error("Erro ao editar produto. ", error);
            setFormError(`Não foi possível editar ${selectedProduct.name}. Verifique os dados e tente novamente.`);
        }
    }

    async function handleDeleteProduct() {
        try{
            await deleteProducts(selectedProduct.id);
            await get_products();
            setEditProductModalIsOpen(false);
            setEditProductStatus(false);
            setSelectedProduct(null);
        }catch (error){
            console.error("Erro o deletar produto. ",error );
            setFormError('Erro ao deletar Produto.');
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
                                <p style={{ color: '#777171ff' }}>{products.length} item monitorado {missing_products_text} {product_running_low} {text_vencidos}</p>
                            ) : (
                                <p style={{ color: '#777171ff' }}>{products.length} itens monitorados {missing_products_text} {product_running_low} {text_vencidos}</p>
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
                                    }} key={index} className="card-products">
                                        <div className="top-container-card">
                                            <ChefHat size={50}></ChefHat>
                                            <div className="inside-container-card">
                                                <p><b>{item.name}</b> - {item.brand}</p>
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
                        <div className="fields">
                            <label htmlFor="name_add">Nome do Insumo</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira um nome..." name="name_add" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="batch">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="batch" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="storageLocation">Local de Armazenamento</label>
                            <SelectInputMode
                                className='input-modal-add-product'
                                options={productEnums.storageLocations}
                                value={storageLocationValue}
                                onChange={setStorageLocationValue}
                                name='storageLocation'
                            />
                        </div>
                        <div className="fields">
                            <label htmlFor="manufacture_date">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="date" name="manufacture_date" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="expiration_date">Data de Validade</label>
                            <input className="input-modal-add-product" type="date" name="expiration_date" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="max_stock">Unidade de Uso</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 5" type="number" name="max_stock" required />
                                <select className="select-modal-add-product" name="unit_of_measure">
                                    {productEnums.unitOfMeasure.map((unit, index) => (
                                        <option key={index} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="brand">Marca</label>
                            <input className="input-modal-add-product" placeholder="Insira uma marca..." type="text" name="brand" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="cost_price">Preço de Custo</label>
                            <input className="input-modal-add-product" placeholder="Insira o preço de custo..." type="number" step="0.01" name="cost_price" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="supplierId">Fornecedor</label>
                            <select className="select-modal-add-product" name="supplierId">
                                {suppliers.map((item, i) => (
                                    <option key={i} value={item.id}>{item.company_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="allergens">Alergênicos</label>
                            <SelectInputMode
                                className='select-modal-add-product'
                                options={productEnums.allergens}
                                value={allergenValue}
                                onChange={setAllergenValue}
                                name='allergens'
                            />
                        </div>
                        <div className="fields">
                            <label htmlFor="category">Categoria</label>
                            <SelectInputMode
                                className='input-modal-add-product'
                                options={productEnums.categories}
                                value={categoryValue}
                                onChange={setCategoryValue}
                                name='category'
                            />
                        </div>
                        <div className="fields">
                            <label htmlFor="min_stock">Quantidade Mínima</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="min_stock" required />
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="stock_quantity">Quantidade Atual</label>
                            <input className="input-modal-add-product" placeholder="Exemplo.: 30" type="number" name="stock_quantity" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="status">Status</label>
                            <select className="select-modal-add-product" name='status' id=''>
                                {productEnums.statuses.map((item,index)=>(
                                    <option key={index} value={item}>{item.replaceAll('_',' ')}</option>
                                ))}
                            </select>   
                        </div>
                        <div className="fields">
                            <label>Nota Fiscal</label>
                            <button type="button" onClick={handleButtonClick} className="btn-modal-file">
                                <input onChange={handleFileClick} ref={fileRef} hidden type="file" name="invoice" />
                                <p>Adicionar arquivo</p>
                            </button>
                        </div>
                        {formError && <p style={{ color: '#c0392b' }}>{formError}</p>}
                        <button type="submit" className="btn-modal-add-products">Salvar</button>
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
                    <form className="modal-products-form-entrance">
                        <div className="fields">
                            <label htmlFor="name_add">Produto</label>
                            <select className="select-modal-add-product" name="name_add" id="">
                                {products.map((item,index)=>(
                                    <option key={index} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="batch">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="batch" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="manufacture_date">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="date" name="manufacture_date" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="expiration_date">Data de Validade</label>
                            <input className="input-modal-add-product" type="date" name="expiration_date" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Unidade de Compra</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="" id="" />
                                <select className="select-modal-add-product" name="" id="">
                                    {productEnums.unitOfMeasure.map((unit,index)=>(
                                        <option key={index} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Fornecedor</label>
                            <select className="select-modal-add-product" name="" id="">
                                {suppliers.map((item,i)=>(
                                    <option key={i} value={item.id}>{item.company_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Nota Fiscal</label>
                            <button onClick={handleButtonClick} className="btn-modal-file">
                                <input onChange={handleFileClick} ref={fileRef} hidden type="file" name="" id="" />
                                <p>Adicionar arquivo</p>
                            </button>
                        </div>
                        <button type='submit' className="btn-modal-add-products">Salvar</button>
                    </form>
                </Modal>

                <Modal
                    isOpen={removeProductModalIsOpen}
                    onRequestClose={() => setRemoveProductModalIsOpen(!removeProductModalIsOpen)}
                    contentLabel="Dar Baixa"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Dar Baixa</h2>
                            <button onClick={() => setRemoveProductModalIsOpen(!removeProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para dar baixa do produto no estoque.</p>
                    </div>
                    <div className="modal-products-form-remove">
                        <div className="fields">
                            <label htmlFor="">Produto</label>
                            <select className="input-modal-add-product" name="" id="">
                                {products.map((item,i)=>(
                                    <option key={i} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <SelectInputMode
                                className='select-modal-add-product'
                                options={productEnums.batchs}
                                value={batchValue}
                                onChange={setBatchValue}
                            ></SelectInputMode>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Retirada por Compra</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="" id="" />
                                <select className="select-modal-add-product" name="" id="">
                                    {productEnums.unitOfMeasure.map((unit,index)=>(
                                        <option key={index} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Motivo da Baixa</label>
                            <input className="input-modal-add-product" type="text" name="" placeholder="Insira o motivo." id="" />
                        </div>
                    </div>
                    <div className="fields fields-full-width">
                        <label htmlFor="">Observações</label>
                        <textarea className="textarea-modal-add-product" name="" placeholder="Exemplo.: Caixa amassada no transporte." id="" />
                    </div>
                    <button className="btn-modal-add-products">Salvar</button>
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
                    onRequestClose={() => {setEditProductModalIsOpen(!editProductModalIsOpen); setIsCustomSelectMode(!isCustomSelectMode)}}
                    contentLabel="Editar Produto"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    {(()=>{
                        const text_enable_edit = editProductStatus ? 'Desabilitar Edição' : 'Habilitar Edição';
                        const save_edits_button = editProductStatus ? <button type='submit' onClick={()=>setIsCustomSelectMode(!isCustomSelectMode)} className="btn-modal-add-products">Salvar Alterações</button> : '';
                        const see_add_file_btn = editProductStatus ? 'Adicionar Nota Fiscal' : 'Ver Nota Fiscal';
                        const subtitle_top_container = editProductStatus ?  `Edite e altere informações de ${selectedProduct?.name}` : `Dados de ${selectedProduct?.name}`;
                        const btn_delete = editProductStatus ? <button  className="btn-modal-file delete" onClick={handleDeleteProduct}>< Trash></Trash></button> : '';

                        return(
                            <div className="modal-edit-products">
                                <div className="modal-products-header">
                                    <div className="top-container-modal-products">
                                        <div className="group-title-edit">
                                            <h2>{selectedProduct?.name}</h2>
                                            <button style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'10px',fontSize:'18px'}} onClick={() => setEditProductStatus(!editProductStatus)}>{text_enable_edit}<SquarePen></SquarePen></button>
                                        </div>
                                        <button onClick={() => {setEditProductModalIsOpen(!editProductModalIsOpen); setIsCustomSelectMode(!isCustomSelectMode)}} style={{fontSize:'30px'}}>&times;</button>
                                    </div>
                                    <p className="text-under-top-container">{subtitle_top_container}</p>
                                </div>
                                <form onSubmit={handleEditProduct} className="modal-products-form">
                                    <div className="fields">
                                        <label htmlFor="name_edit">Nome do Insumo</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="text" defaultValue={selectedProduct?.name} name="name_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="batch_edit">Lote</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="text" defaultValue={selectedProduct?.batch} name="batch_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Local de Armazenamento</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='input-modal-add-product'
                                                options={productEnums.storageLocations}
                                                value={storageLocationValue}
                                                onChange={setStorageLocationValue}
                                                name='storageLocation'
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.storageLocation.replaceAll('_',' ')} type="text" name="storageLocation" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="manufacture_date_edit">Data da Fabricação</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="date"
                                            defaultValue={
                                                selectedProduct?.manufacture_date
                                                    ? new Date(selectedProduct.manufacture_date).toISOString().split('T')[0]
                                                    : ''
                                            }
                                            name="manufacture_date_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="expiration_date_edit">Data de Validade</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product"
                                        defaultValue={
                                                selectedProduct?.manufacture_date
                                                    ? new Date(selectedProduct.expiration_date).toISOString().split('T')[0]
                                                    : ''
                                            }
                                        type="date" name="expiration_date_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="max_stock_edit">Unidade de Uso</label>
                                        <div className="fields-double">
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.max_stock} type="number" name="max_stock_edit" id="" />
                                            {editProductStatus ? (
                                                <select className="select-modal-add-product" name='' id=''>
                                                    {productEnums.unitOfMeasure.map((unit,index)=>(
                                                        <option key={index} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input readOnly={!editProductStatus}  className="input-modal-add-product" defaultValue={selectedProduct?.unit_of_measure} type="text" name="unit_of_measure_edit" id="" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="brand_edit">Marca</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.brand} type="text" name="brand_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="cost_price_edit">Preço de Custo</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.cost_price} type="number" name="cost_price_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="supplierId_edit">Fornecedor</label>
                                        {editProductStatus ? (
                                            <select className="select-modal-add-product" name="supplierId_edit" id="">
                                                {suppliers.map((item,i)=>(
                                                    <option key={i} value={item.id}>{item.company_name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.supplierId} type="text" name="supplierId_edit" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="allergens_edit">Alergênicos</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='select-modal-add-product'
                                                options={productEnums.allergens}
                                                value={allergenValue}
                                                onChange={setAllergenValue}
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus}  className="input-modal-add-product" defaultValue={selectedProduct?.allergens} type="text" name="allergens_edit" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="category_edit">Categoria</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='input-modal-add-product'
                                                options={productEnums.categories}
                                                value={categoryValue}
                                                onChange={setCategoryValue}
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.category.replaceAll('_',' ')} type="text" name="category_edit" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="min_stock_edit">Quantidade Mínima</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.min_stock} type="text" name="min_stock_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="stock_quantity_edit">Quantidade Atual</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.stock_quantity} type="text" name="stock_quantity_edit" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="status_edit">Status</label>
                                        {editProductStatus ? (
                                            <select className="select-modal-add-product" name='status_edit' id=''>
                                                {productEnums.statuses.map((item,index)=>(
                                                    <option key={index} value={item}>{item.replaceAll('_',' ')}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" defaultValue={selectedProduct?.status} type="text" name="status_edit" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Nota Fiscal</label>
                                        <button onClick={handleButtonClick} className="btn-modal-file">
                                            <input onChange={handleFileClick} ref={fileRef} hidden type="file" name="" id="" />
                                            <p>{see_add_file_btn}</p>
                                        </button>
                                    </div>
                                    <div className="group-buttons-modal">
                                        {btn_delete}
                                        {save_edits_button}
                                    </div>
                                </form>
                            </div>
                        )
                    })()}
                </Modal>

            </main>
        </>
    );
}

export default Stock