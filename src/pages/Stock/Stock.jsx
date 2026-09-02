import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel, ChefHat, ChevronRight, ChevronDown } from "lucide-react";
import { getProducts } from "../../services/products";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'
import { transform } from "framer-motion";

function Stock(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const filter_btn = ["Todos","Estoque Saudável","Próximo de Acabar","Em Falta","Perto do Vencimento"];
    const [filterBtnIsClicked,setFilterBtnIsClicked] = useState(0);
    const [products,setProducts] = useState([])
    const navigate = useNavigate()

    const fileRef = useRef(null);

    function handleButtonClick(){
        fileRef.current.click()
    }

    function handleFileClick(event){
        const file = event.target.files[0];
    }

    const [addProductModalIsOpen,setAddProductModalIsOpen] = useState(false);
    const [entranceProductModalIsOpen,setEntranceProductModalIsOpen] = useState(false);
    const [removeProductModalIsOpen,setRemoveProductModalIsOpen] = useState(false);
    
    const filtersModal = ["Categoria", "Local de Armazenamento", "Alergênicos", "Marca", "Status"];
    const [filterProductModalIsOpen,setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked,setFilterProductIsClicked] = useState(null);
    
    const [missingProducts,setMissingProducts] = useState([]);
    const [midStockProducts,setMidStockProducts] = useState([]);

    const modalAddProductStyle = {
        overlay:{
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content:{
            position: 'absolute',
            overflowY: 'auto',
            maxHeight: '80vh',
            scrollbarWidth:'none',
            top: '50%',
            left:'50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '65%',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display:'flex',
            flexDirection:'column',
            gap:'20px'
        }
    }

        const modalFilterProductsStyle = {
        overlay:{
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'absolute',
            top: '0',
            left:'80%',
            bottom: '0',
            width: '300px',
            maxHeight: '100vh',
            padding: '20px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            }

    }

    useEffect(()=>{
        async function get_products(){
            try{
                const products_db = await getProducts();
                setProducts(products_db);
            } catch(error){
                console.error("Produtos não encontrados no sistema.",error)
            }
        }

        get_products();
    },[])

    useEffect(()=>{
        function missing_products(){
            products.map((product)=>{
                if(product.current_stock === 0){
                    setMissingProducts(product);
                } else{
                    setMidStockProducts(product);
                }
            })
        }

        missing_products();
    },[])

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-stock">
                    <div id='container'>
                        <div id="top-container">
                            <div className="groups-top-container">
                                <button onClick={()=>navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                                <h1>Estoque</h1>
                            </div>

                            <div className="groups-top-container">
                                <button onClick={()=>setAddProductModalIsOpen(!addProductModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                                <button onClick={()=>setEntranceProductModalIsOpen(!entranceProductModalIsOpen)}  className="btn-stock-base">Dar Entrada</button>
                                <button onClick={()=>setRemoveProductModalIsOpen(!removeProductModalIsOpen)} className="btn-stock-base">Dar Baixa</button>
                                <button onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)} id='btn-funnel-base' className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                            </div>
                        </div>
                        {
                            products.length <= 1 ? (
                                <p style={{color:'#777171ff'}}>{products.length} item monitorado - {missingProducts.length} em falta - {midStockProducts.length} próximos de acabar</p>
                            ) : (
                                <p style={{color:'#777171ff'}}>{products.length} itens monitorados - {missingProducts.length} - {midStockProducts.length} próximos de acabar</p>
                            )
                        }
                    </div>
                    <div id="filters-container">
                        {filter_btn.map((name,index)=>(
                            <button key={index} onClick={()=>setFilterBtnIsClicked(index)} className={`btn-filters ${filterBtnIsClicked === index ? 'clicked' : 'notClicked'}`}>{name}</button>
                        ))}
                    </div>
                    <div id="products-list">
                        {products.length !== 0 ? (
                            products.map((item,index)=>{

                                const dateFab = new Date(item.expiration_date).toLocaleDateString('pt-br');
                                const dateVal = new Date(item.manufacture_date).toLocaleDateString('pt-br');

                                return(
                                    <div key={index} className="card-products">
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
                                    </div>
                                )
                            })
                        ) : (
                            <p>Nenhum produto existente.</p>
                        )}
                    </div>
                </div>  
                <Modal
                    isOpen={addProductModalIsOpen}
                    onRequestClose={()=>setAddProductModalIsOpen(!addProductModalIsOpen)}
                    contentLabel="Adicionar Produtos"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >   
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Adicionar Produto</h2>
                            <button onClick={()=>setAddProductModalIsOpen(!addProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para adicionar um novo produto ao estoque.</p>
                    </div>
                    <div className="modal-products-form">
                        <div className="fields">
                            <label htmlFor="">Nome do Insumo</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira um nome..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Código do Produto</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o código..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Local de Armazenamento</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Câmara Fria</option>
                                <option value="">Freezer</option>
                                <option value="">Geladeira</option>
                                <option value="">Despensa/Estoque Seco</option>
                                <option value="">Bar/Adega</option>
                                <option value="">Descartáveis</option>
                                <option value="">Outro</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="datetime-local" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data de Validade</label>
                            <input className="input-modal-add-product" type="datetime-local" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Unidade de Compra</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="" id="" />
                                <input className="input-modal-add-product" placeholder="Exemplo.: Caixas" type="text" name="" id="" />
                            </div>
                            </div>
                        <div className="fields">
                            <label htmlFor="">Unidade de Uso</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 5" type="number" name="" id="" />
                                <select  className="select-modal-add-product"  name="" id="">
                                    <option value="">kg</option>
                                    <option value="">g</option>
                                    <option value="">mg</option>
                                    <option value="">L</option>
                                    <option value="">mL</option>
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Marca</label>
                            <input className="input-modal-add-product" placeholder="Insira uma marca..." type="text" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Preço de Custo</label>
                            <input className="input-modal-add-product" placeholder="Insira o preço de custo..." type="number" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Fornecedor</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Outros</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Alergênicos</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Outros</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Categoria</label>
                            <input className="input-modal-add-product" placeholder="Exemplo.: Legumes e Verduras" type="text" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Mínima</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="text" name="" id="" />
                                <select className="select-modal-add-product" name="" id="">
                                    <option value="">Unidade de Uso</option>
                                    <option value="">Unidade de Compra</option>
                                </select>
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Atual</label>
                            <input className="input-modal-add-product" placeholder="Exemplo.: 30" type="text" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Status</label>
                            <select className="select-modal-add-product"  name="" id="">
                                <option value="">Ativo</option>
                                <option value="">Inativo</option>
                                <option value="">Descontinuado</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-modal-add-products">Salvar</button>
                </Modal>

                <Modal
                    isOpen={entranceProductModalIsOpen}
                    onRequestClose={()=>setEntranceProductModalIsOpen(!entranceProductModalIsOpen)}
                    contentLabel="Dar Entrada"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >   
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Dar Entrada</h2>
                            <button onClick={()=>setEntranceProductModalIsOpen(!entranceProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para adicionar um novo lote ao estoque.</p>
                    </div>
                    <div className="modal-products-form-entrance">
                        <div className="fields">
                            <label htmlFor="">Produto</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Outros</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Local de Armazenamento</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Câmara Fria</option>
                                <option value="">Freezer</option>
                                <option value="">Geladeira</option>
                                <option value="">Despensa/Estoque Seco</option>
                                <option value="">Bar/Adega</option>
                                <option value="">Descartáveis</option>
                                <option value="">Outro</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data da Fabricação</label>
                            <input className="input-modal-add-product" type="datetime-local" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Data de Validade</label>
                            <input className="input-modal-add-product" type="datetime-local" name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade de Compra</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="" id="" />
                                <input className="input-modal-add-product" placeholder="Exemplo.: caixas" type="text" name="" id="" />
                            </div>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Preço de Custo</label>
                            <input className="input-modal-add-product" placeholder="Insira o preço de custo..." type="number" name="" id="" />
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
                    onRequestClose={()=>setRemoveProductModalIsOpen(!removeProductModalIsOpen)}
                    contentLabel="Dar Baixa"
                    shouldCloseOnOverlayClick={true}
                    style={modalAddProductStyle}
                >   
                    <div className="modal-products-header">
                        <div className="top-container-modal-products">
                            <h2>Dar Baixa</h2>
                            <button onClick={()=>setRemoveProductModalIsOpen(!removeProductModalIsOpen)}>&times;</button>
                        </div>
                        <p className="text-under-top-container">Preencha o formulário para dar baixa do produto no estoque.</p>
                    </div>
                    <div className="modal-products-form-remove">
                        <div className="fields">
                            <label htmlFor="">Produto</label>
                            <select className="select-modal-add-product" name="" id="">
                                <option value="">Outros</option>
                            </select>
                        </div>
                        <div className="fields">
                            <label htmlFor="">Lote</label>
                            <input className="input-modal-add-product" type="text" placeholder="Insira o valor do lote..." name="" id="" />
                        </div>
                        <div className="fields">
                            <label htmlFor="">Quantidade Retirada por Compra</label>
                            <div className="fields-double">
                                <input className="input-modal-add-product" placeholder="Exemplo.: 12" type="number" name="" id="" />
                                <input className="input-modal-add-product" placeholder="Exemplo.: Caixas" type="text" name="" id="" />
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
                    onRequestClose={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                    contentLabel="Modal de Filtros"
                    shouldCloseOnOverlayClick={true}
                    style={modalFilterProductsStyle}
                >
                    <div className="container-filters">
                        <div className="top-container-filters">
                            <h1>Filtrar Por</h1>
                            <button onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}>&times;</button>
                        </div>
                        {filtersModal.map((filters_item,index)=>{
                            const icon = filterProductIsClicked === index ? <ChevronDown /> : <ChevronRight />;

                            return(
                                <>
                                    <button onClick={()=>setFilterProductIsClicked(index)} className="btn_filters_modal" key={index}>{filters_item} {icon}</button>

                                    {filterProductIsClicked === index && ('exibir itens')}
                                </>
                            )
                        })}
                    </div>
                </Modal>
            </main>
        </>
    );
}

export default Stock