import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel, ChefHat, ChevronRight, ChevronDown, SquarePen } from "lucide-react";
import { getProducts } from "../../services/products";
import { getProductEnums } from "../../services/products";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'
import SelectInputMode from "../../components/SelectInputMode/SelectInputMode";

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
    const missingProducts = products.filter(product => product.current_stock === 0);
    const midStockProducts = products.filter(product => product.current_stock <= product.min_stock);
    const missing_products_text = missingProducts.length > 0 ? `- ${String(missingProducts.length).padStart(2, "0")} em falta.` : '';
    const product_running_low = midStockProducts.length > 0 ?
        (midStockProducts.length === 1 ?
            `- ${String(midStockProducts.length).padStart(2, "0")} próximo de acabar.`
            :
            `- ${String(midStockProducts.length).padStart(2, "0")} próximos de acabar.`)
        : ('');

    //Valores dos inputs/selects nos formularios
    const [storageLocationValue, setStorageLocationValue] = useState("");
    const [allergenValue, setAllergenValue] = useState("");
    const [categoryValue, setCategoryValue] = useState("");

    //Método de filtrar produtos por botões
    const filteredProducts = products.filter((item) => {
    switch (filterBtnIsClicked) {
        case 0: // Todos
            return true;
        case 1: // Estoque Saudável
            return item.current_stock > item.min_stock;
        case 2: // Próximo de Acabar
            return item.current_stock > 0 && item.current_stock <= item.min_stock;
        case 3: // Em Falta
            return item.current_stock === 0;
        case 4: { // Perto do Vencimento
            const hoje = new Date();
            const vencimento = new Date(item.expiration_date);
            const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);

            // até 10 dias antes do vencimento e não vencido
            return diffDias <= 10
        }
        default:
            return true;
     }
    });

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
    useEffect(() => {
        async function get_products() {
            try {
                const products_db = await getProducts();
                setProducts(products_db);
            } catch (error) {
                console.error("Produtos não encontrados no sistema.", error)
            }
        }

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
                                <p style={{ color: '#777171ff' }}>{products.length} item monitorado {missing_products_text} {product_running_low}</p>
                            ) : (
                                <p style={{ color: '#777171ff' }}>{products.length} itens monitorados {missing_products_text} {product_running_low}</p>
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
                                                    {item.current_stock === 0 ? (
                                                        <p className="text-stock empty">Em Falta</p>
                                                    ) : item.current_stock <= item.min_stock ? (
                                                        <p className="text-stock mid-empty">Próximo de Acabar</p>
                                                    ) : (
                                                        <p className="text-stock full">Estoque Saudável</p>
                                                    )}
                                                    <p><b>{item.current_stock}/{item.max_stock} {item.unit_of_measure}</b></p>
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
                    onRequestClose={() => {setAddProductModalIsOpen(!addProductModalIsOpen); setIsCustomSelectMode(!isCustomSelectMode)}}
                    contentLabel="Adicionar Produtos"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Adicionar Produto</h2>
                            <button onClick={() => {setAddProductModalIsOpen(!addProductModalIsOpen); setIsCustomSelectMode(!isCustomSelectMode)}}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para adicionar um novo produto ao estoque.</p>
                    </div>
                    <div className="modal-products-form">
                        <div className="fields">
                            <label htmlFor="">Nome do Insumo</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira um nome..." name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" required />
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
                                <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder="Digite o local de armazenamento..." type="text" name="" id="" />
                            )}
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="date" name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data de Validade</label>
                            <input className="input-modal-add-product" type="date" name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Unidade de Uso</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 5" type="number" name="" id="" required />
                                <select className="select-modal-add-product" name="" id="">
                                    {productEnums.unitOfMeasure.map((unit,index)=>(
                                        <option key={index} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Marca</label>
                            <input className="input-modal-add-product" placeholder="Insira uma marca..." type="text" name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Preço de Custo</label>
                            <input className="input-modal-add-product" placeholder="Insira o preço de custo..." type="number" name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Fornecedor</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Outros</option>
                            </select>
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
                                <input readOnly={!editProductStatus}  className="input-modal-add-product" placeholder="Digite o alergênico..." type="text" name="" id="" />
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
                                <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder="Digite a categoria..." type="text" name="" id="" />
                            )}
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Mínima</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="text" name="" id="" required />
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Atual</label>
                            <input className="input-modal-add-product" placeholder="Exemplo.: 30" type="text" name="" id="" required />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Status</label>
                            <select className="select-modal-add-product" name="" id="">
                                {productEnums.statuses.map((item,index)=>(
                                    <option key={index} value={item}>{item.replaceAll('_',' ')}</option>
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
                                <option value="">Outros</option>
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
                                <>
                                    <button onClick={() => {
                                        filterProductIsClicked === index ? (
                                            setFilterProductIsClicked(null)
                                        ) : (
                                            setFilterProductIsClicked(index)
                                        )
                                    }} className="btn_filters_modal" key={index}>{filters_item} {icon}</button>

                                    {filterProductIsClicked === index && (
                                        <ul className="container-filters-options">
                                            {filtersData[filters_item].map((option, index) => (
                                                <button key={index}>{option}</button>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )
                        })}
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
                                            <select className="select-modal-add-product" name='' id=''>
                                                <option value="">Outros</option>
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
                                        <input readOnly={!editProductStatus} className="input-modal-add-product" placeholder={selectedProduct?.current_stock} type="text" name="" id="" />
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