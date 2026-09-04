import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel, ChefHat, ChevronRight, ChevronDown, SquarePen } from "lucide-react";
import { getProducts, getProductEnums, createProducts } from "../../services/products";
import { getSuppliers } from "../../services/suppliers";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'
import SelectInputMode from "../../components/SelectInputMode/SelectInputMode";
import React, { Fragment } from 'react';

function Stock() {

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
        "Categoria": ["Carnes e Pescados", "Hortifrúti", "Laticínios", "Embutidos", "Secos"],
        "Local de Armazenamento": ["Geladeira", "Freezer", "Câmara Fria", "Despensa/Estoque Seco", "Bar/Adega"],
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
    });

    //Definindo strings que mostram o estado dos produtos
    const missingProducts = products.filter(product => product.stock_quantity === 0);
    const midStockProducts = products.filter(product => product.stock_quantity <= product.min_stock);
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
        return diffDias <= 10 && diffDias >= 0; 
    });

    // 2. Calcula a quantidade
    const qtdVencendo = produtosProximosVencimento.length;

    // 3. Monta o texto diretamente (acessível no seu JSX)
    const text_vencidos = `- ${String(qtdVencendo).padStart(2, "0")} ${
        qtdVencendo === 1 ? "próximo do vencimento" : "próximos do vencimento"
    }.`;

    //Valores dos inputs/selects nos formularios
    const [storageLocationValue, setStorageLocationValue] = useState("");
    const [allergenValue, setAllergenValue] = useState("");
    const [categoryValue, setCategoryValue] = useState("");

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
                matchesBtn = diffDias <= 10 && diffDias >= 0;
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
        if (selectedModalFilters["Local de Armazenamento"] && item.storage_location !== selectedModalFilters["Local de Armazenamento"]) {
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

    async function handleCreateProduct(e) {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('name_add')),
            cost_price: parseFloat(formData.get('cost-price')),
            category: categoryValue,
            brand: String(formData.get('brand')),
            allergens: allergenValue,
            stock_quantity: parseInt(formData.get('stock_quantity')),
            unit_of_measure: parseInt(formData.get('unit_of_measure')),
            min_stock: parseInt(formData.get('min_stock')),
            max_stock: parseInt(formData.get('max_stock')),
            manufacture_date: new Date(formData.get('manufacture_date')).toISOString(),
            expiration_date: new Date(formData.get('expiration_date')).toISOString(),
            storageLocation: storageLocationValue,
            status: String(formData.get('status')),
            batch: String(formData.get('batch')),
            supplierId: parseInt(formData.get('supplierId')),
            unitId: parseInt(formData.get('unitId')),
        }

        try{
            await createProducts(payload);
            await get_products();
            setAddProductModalIsOpen(false);
            e.target.reset();
        } catch(error){
            console.log("Erro ao criar produto: ", error);
            setFormError('Não foi possível criar a mesa. Verifique os dados e tente novamente.')
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
            <label htmlFor="stock_quantity">Unidade de Uso</label>
            <div className="fields-double">
                <input className="input-modal-add-product" placeholder="Exemplo.: 5" type="number" name="stock_quantity" required />
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
            <label htmlFor="max_stock">Quantidade Máxima</label>
            <input className="input-modal-add-product" placeholder="Exemplo.: 30" type="number" name="max_stock" required />
        </div>
        <div className="fields">
            <label htmlFor="status">Status</label>
            <select className="select-modal-add-product" name="status">
                {productEnums.statuses.map((item, index) => (
                    <option key={index} value={item}>{item.replaceAll('_', ' ')}</option>
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
                    <div className="modal-products-form-entrance">
                        <div className="fields">
                            <label htmlFor="">Produto</label>
                            <select className="select-modal-add-product" name="" id="">
                                {products.map((item,index)=>(
                                    <option key={index} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="date" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data de Validade</label>
                            <input className="input-modal-add-product" type="date" name="" id="" />
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
                    </div>
                    <button className="btn-modal-add-products">Salvar</button>
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
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" />
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
                        const text_enable_edit = editProductStatus ? 'Desativar Edição' : 'Habilitar Edição';
                        const save_edits_button = editProductStatus ? <button onClick={()=>setIsCustomSelectMode(!isCustomSelectMode)} className="btn-modal-add-products">Salvar Alterações</button> : '';
                        const see_add_file_btn = editProductStatus ? 'Adicionar Nota Fiscal' : 'Ver Nota Fiscal';
                        const subtitle_top_container = editProductStatus ?  `Edite e altere informações de ${selectedProduct?.name}` : `Dados de ${selectedProduct?.name}`;

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
                                <div className="modal-products-form">
                                    <div className="fields">
                                        <label htmlFor="">Nome do Insumo</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="text" placeholder={selectedProduct?.name} name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Lote</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="text" placeholder={selectedProduct?.batch} name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Local de Armazenamento</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='input-modal-add-product'
                                                options={productEnums.storageLocations}
                                                value={storageLocationValue}
                                                onChange={setStorageLocationValue}
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.storageLocation} type="text" name="" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Data da Fabricação</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" type="date"
                                            defaultValue={
                                                selectedProduct?.manufacture_date
                                                    ? new Date(selectedProduct.manufacture_date).toISOString().split('T')[0]
                                                    : ''
                                            }
                                            name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Data de Validade</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product"
                                        defaultValue={
                                                selectedProduct?.manufacture_date
                                                    ? new Date(selectedProduct.expiration_date).toISOString().split('T')[0]
                                                    : ''
                                            }
                                        type="date" name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Unidade de Uso</label>
                                        <div className="fields-double">
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.max_stock} type="number" name="" id="" />
                                            {editProductStatus ? (
                                                <select className="select-modal-add-product" name='' id=''>
                                                    {productEnums.unitOfMeasure.map((unit,index)=>(
                                                        <option key={index} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input readOnly={!editProductStatus}  className="input-modal-add-product" placeholder={selectedProduct?.unit_of_measure} type="text" name="" id="" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Marca</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.brand} type="text" name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Preço de Custo</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.cost_price} type="number" name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Fornecedor</label>
                                        {editProductStatus ? (
                                            <select className="select-modal-add-product" name="" id="">
                                                {suppliers.map((item,i)=>(
                                                    <option key={i} value={item.id}>{item.company_name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.supplierId} type="text" name="" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Alergênicos</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='select-modal-add-product'
                                                options={productEnums.allergens}
                                                value={allergenValue}
                                                onChange={setAllergenValue}
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus}  className="input-modal-add-product" placeholder={selectedProduct?.allergens} type="text" name="" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Categoria</label>
                                        {editProductStatus ? (
                                            <SelectInputMode
                                                className='input-modal-add-product'
                                                options={productEnums.categories}
                                                value={categoryValue}
                                                onChange={setCategoryValue}
                                            ></SelectInputMode>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.category} type="text" name="" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Quantidade Mínima</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.min_stock} type="text" name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Quantidade Atual</label>
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.stock_quantity} type="text" name="" id="" />
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Status</label>
                                        {editProductStatus ? (
                                            <select className="select-modal-add-product" name='' id=''>
                                                {productEnums.statuses.map((item,index)=>(
                                                    <option key={index} value={item}>{item.replaceAll('_',' ')}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.status} type="text" name="" id="" />
                                        )}
                                    </div>
                                    <div className="fields">
                                        <label htmlFor="">Nota Fiscal</label>
                                        <button onClick={handleButtonClick} className="btn-modal-file">
                                            <input onChange={handleFileClick} ref={fileRef} hidden type="file" name="" id="" />
                                            <p>{see_add_file_btn}</p>
                                        </button>
                                    </div>
                                </div>
                                {save_edits_button}
                            </div>
                        )
                    })()}
                </Modal>

            </main>
        </>
    );
}

export default Stock