import { Plus, CalendarFold, ClipboardCheck, SquarePen, Trash2} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import './home.css'
import Header from "../../components/HeaderAndSidebar/Header"
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { getTables, createTable, updateTable, deleteTable } from "../../services/tables";
import { getOrders } from "../../services/orders";
import { getReservations } from "../../services/reserves";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal'

function Home() {
    const [tablesList,setTablesList] = useState([]);
    const [orderList, setOrderList]  = useState([]);
    const [bookTableList, setBookTableList]  = useState([]);
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const orderSize = String(orderList.length).padStart(2, "0");
    const bookSize = String(bookTableList.length).padStart(2, "0");
    const navigate = useNavigate();
    const [editTableModalIsOpen, setEditTableModalIsOpen] = useState(false);
    const [createTableModalIsOpen, setCreateTableModalIsOpen] = useState(false);
    const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] = useState(false);
    const [editTableStatus,setEditTableStatus] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [formError, setFormError] = useState("");

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const modalCreateTableStyle = {
        overlay:{
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content:{
            position: 'absolute',
            top: '50%',
            left:'50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '500px',
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

    function redirect(url){
        navigate(url);
    }

    function handleMouseDown(e){
        const el = tablesListRef.current;
        isDragging.current = true;
        el.classList.add('grabbing');
        startX.current = e.pageX - el.offsetLeft;
        scrollLeftStart.current = el.scrollLeft;
    }

    function handleMouseLeaveOrUp(){
        const el = tablesListRef.current;
        isDragging.current = false;
        el.classList.remove('grabbing');
    }

    function handleMouseMove(e){
        if (!isDragging.current) return;
        e.preventDefault();
        const el = tablesListRef.current;
        const x = e.pageX - el.offsetLeft;
        const walk = x - startX.current;
        el.scrollLeft = scrollLeftStart.current - walk;
    }

    async function refreshTables(){
        try{
            const tables = await getTables();
            setTablesList(tables);
        } catch (error){
            console.error("Erro ao carregar mesas: ",error.message);
        }
    }

    useEffect(()=>{
        refreshTables();
    },[])

    useEffect(()=>{
        async function loadOrders(){
            try{
                const orders = await getOrders();
                const reserves = await getReservations();
                setBookTableList(reserves);
                setOrderList(orders);
            } catch(error){
                console.error("Erro ao carregar comandas: ",error.message);
            }
        }

        loadOrders();
    },[])

    async function handleCreateTable(e){
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const payload = {
            table_number: Number(formData.get('table_number')),
            capacity: Number(formData.get('table_max')),
            status: "Livre",
            unitId: 1
        };

        try{
            await createTable(payload);
            await refreshTables();
            setCreateTableModalIsOpen(false);
            e.target.reset();
        } catch(error){
            console.error("Erro ao criar mesa: ", error);
            setFormError("Não foi possível criar a mesa. Verifique os dados e tente novamente.");
        }
    }

    async function handleUpdateTable(e){
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const payload = {
            table_number: Number(formData.get('table_number')),
            capacity: Number(formData.get('table_max')),
        };

        try{
            await updateTable(selectedTable.id, payload);
            await refreshTables();
            setEditTableModalIsOpen(false);
            setEditTableStatus(false);
        } catch(error){
            console.error("Erro ao atualizar mesa: ", error);
            setFormError("Não foi possível atualizar a mesa. Verifique os dados e tente novamente.");
        }
    }

    async function handleDeleteTable() {
        if (!selectedTable) return;
        setConfirmDeleteModalIsOpen(true);
        setEditTableModalIsOpen(false);
        }

    async function confirmDeleteTable() {
    try {
        await deleteTable(selectedTable.id);
        await refreshTables();
        setEditTableModalIsOpen(false);
        setEditTableStatus(false);
        setSelectedTable(null);
        setConfirmDeleteModalIsOpen(false);
    } catch (error) {
        console.error("Erro ao excluir mesa: ", error);
        setFormError("Não foi possível excluir a mesa.");
    }
    }


    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} />
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} />
                <div id="principal-menu">
                    <div id="btn-group">
                        <button onClick={()=>redirect('/order_ticket')} style={{ backgroundColor: '#3c57afff', color: 'white' }} className="principal-btn">
                            <Plus color="white" style={{backgroundColor:'#6f7dc6',borderRadius:'10px'}} size={40}></Plus>
                            <h2>Abrir Comanda</h2>
                            <p>Selecione a mesa e os itens do cardápio para abrir uma comanda.</p>
                        </button>
                        <button onClick={()=>redirect('/open_all_tickets')} style={{ backgroundColor: '#f3b45c', color: 'black'}} className="principal-btn">
                            <CalendarFold color="black" size={30} style={{backgroundColor:'#dda761', borderRadius:'16px', padding:'8px'}}></CalendarFold>
                            <h2>Comandas e Reservas Abertas</h2>
                            {orderList.length === 0 && bookTableList.length === 0 ? (
                                <p>Nenhuma comanda ou reserva aberta.</p>
                            ) : (
                                <p>{orderSize} comandas abertas e {bookSize} reservas agendadas.</p>
                            )}
                        </button>
                        <button onClick={()=>redirect('/book_table')} style={{ backgroundColor: '#7eb5f8', color: 'black' }} className="principal-btn">
                            <ClipboardCheck color="black" size={30} style={{backgroundColor:'#a4c8fd', borderRadius:'16px', padding:'8px'}}></ClipboardCheck>
                            <h2>Reservar Mesa</h2>
                            <p>Reservar uma mesa para um cliente.</p>
                        </button>
                    </div>
                    <div id="tables-group">
                        <button onClick={()=>setCreateTableModalIsOpen(true)} style={{fontSize:20,display:'flex',alignItems:'center',gap:5}}>
                            <b>Mesas da unidade</b>
                            <Plus size={26}></Plus>
                        </button>
                        <div
                            id="tables-list"
                            ref={tablesListRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeaveOrUp}
                            onMouseUp={handleMouseLeaveOrUp}
                            onMouseMove={handleMouseMove}
                        >
                            {tablesList.length === 0 ? (
                                <div>
                                    <p>Nenhuma mesa foi criada.</p>
                                </div>
                            ) : (
                                tablesList.map((table)=>(
                                    <button 
                                        onClick={()=>{
                                            setSelectedTable(table);
                                            setEditTableModalIsOpen(true);
                                            setEditTableStatus(false);
                                            setFormError("");
                                        }} 
                                        key={table.id} 
                                        className={`table-card ${table.table_number % 2 === 0 ? 'blue' : 'orange'}`}
                                    >
                                        <p><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                        <p id="p-table-status"><b>{table.status}</b></p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                    <Modal
                        isOpen={createTableModalIsOpen}
                        onRequestClose={() => setCreateTableModalIsOpen(false)}
                        contentLabel="Criar Nova Mesa"
                        shouldCloseOnOverlayClick={true}
                        style={modalCreateTableStyle}
                    >
                        <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <h2>Adicionar Nova Mesa</h2>
                            <button onClick={()=> setCreateTableModalIsOpen(false)} style={{fontSize:'30px'}}>&times;</button>
                        </div>
                        <form className="form-modal-table" onSubmit={handleCreateTable}>
                            <div className='fields'>
                                <label htmlFor='table_number'>Número da Mesa</label>
                                <input className="input-modal-table" type="number" name="table_number" placeholder="Digite o número da mesa..." required />
                            </div>
                            <div className='fields'>
                                <label htmlFor='table_max'>Capacidade da Mesa</label>
                                <input className="input-modal-table" type="number" name="table_max" placeholder="Digite a capacidade de pessoas da mesa..." required />
                            </div>
                            {formError && <p style={{color:'#c0392b'}}>{formError}</p>}
                            <button className='btn-modal-table' type='submit'>Salvar</button>
                        </form>
                    </Modal>
                    <Modal
                        isOpen={editTableModalIsOpen}
                        onRequestClose={() => setEditTableModalIsOpen(false)}
                        contentLabel="Editar Mesa"
                        shouldCloseOnOverlayClick={true}
                        style={modalCreateTableStyle}
                    >
                        {editTableStatus ? (
                                <div className="edit-table-field">
                                    <h2>Edite Mesa {selectedTable?.table_number}</h2>
                                    <button onClick={()=>setEditTableStatus(!editTableStatus)}>Desabilitar Edição<SquarePen></SquarePen></button>
                                    <button onClick={()=> setEditTableModalIsOpen(false)} style={{fontSize:'30px'}}>&times;</button>
                                </div>
                            ) : (
                                <div className="edit-table-field">
                                    <h2>Mesa {selectedTable?.table_number}</h2>
                                    <button onClick={()=>setEditTableStatus(!editTableStatus)}>Habilitar Edição<SquarePen></SquarePen></button>
                                    <button onClick={()=> setEditTableModalIsOpen(false)} style={{fontSize:'30px'}}>&times;</button>
                                </div>
                        )}
                        <form className="form-modal-table" onSubmit={handleUpdateTable}>
                            {editTableStatus ? (
                            <div className="container-fields">
                                <div className='fields'>
                                    <label htmlFor='table_number'>Número da Mesa</label>
                                    <input className="input-modal-table" type="number" name="table_number" defaultValue={selectedTable?.table_number} required />
                                </div>
                                <div className='fields'>
                                    <label htmlFor='table_max'>Capacidade da Mesa</label>
                                    <input className="input-modal-table" type="number" name="table_max" defaultValue={selectedTable?.capacity} required />
                                </div>
                                {formError && <p style={{color:'#c0392b'}}>{formError}</p>}
                                <div className="delete-modal-table">
                                    <button className='btn-modal-table' type='submit'>Salvar</button>
                                    <button className='delete-btn-modal-table' type='button' onClick={handleDeleteTable}><Trash2></Trash2></button>
                                </div>
                            </div>
                            ) : (
                            <div className="container-fields">
                                <div className='fields'>
                                    <label htmlFor='table_number'>Número da Mesa</label>
                                    <input readOnly className="input-modal-table" type="number" name="table_number" value={selectedTable?.table_number ?? ""} />
                                </div>
                                <div className='fields'>
                                    <label htmlFor='table_max'>Capacidade da Mesa</label>
                                    <input readOnly className="input-modal-table" type="number" name="table_max" value={selectedTable?.capacity ?? ""} />
                                </div>
                            </div>
                            )}
                            
                        </form>
                    </Modal>
                    <Modal
                        isOpen={confirmDeleteModalIsOpen}
                        onRequestClose={()=>setConfirmDeleteModalIsOpen(false)}
                        contentLabel="Confirmar Delete de Mesa"
                        shouldCloseOnOverlayClick={true}
                        style={modalCreateTableStyle}
                    >
                        <h2>Tem certeza que deseja excluir a Mesa {selectedTable?.table_number}?</h2>
                        <div id="container-delete-btn">
                            <button className='btn-modal-table' onClick={confirmDeleteTable}>Sim, tenho certeza</button>
                            <button className='btn-modal-table' onClick={()=>{setConfirmDeleteModalIsOpen(!confirmDeleteModalIsOpen); setEditTableModalIsOpen(true)}}>Não</button>
                        </div>
                    </Modal>
                </div>
            </main>
        </>
    );
}

export default Home;