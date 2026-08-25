import { Plus, CalendarFold, ClipboardCheck} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import './home.css'
import Header from "../../components/HeaderAndSidebar/Header"
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { getTables } from "../../services/tables";
import { getOrders } from "../../services/orders";
import { getReservations } from "../../services/reserves";
import { useNavigate } from "react-router-dom";

function Home() {
    const [tablesList,setTablesList] = useState([]);
    const [orderList, setOrderList]  = useState([]);
    const [bookTableList, setBookTableList]  = useState([]);
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const orderSize = String(orderList.length).padStart(2, "0");
    const bookSize = String(bookTableList.length).padStart(2, "0");
    const navigate = useNavigate();

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

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

    useEffect(()=>{
        async function loadTables(){
            try{
                const tables = await getTables();
                setTablesList(tables);
            } catch (error){
                console.error("Erro ao carregar mesas: ",error.message);
            }
        }
 
        loadTables();
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
                    <div id="tables-group" style={{display:'flex',flexDirection:'column',gap:30,alignItems:'center'}}>
                        <button onClick={()=>redirect('/create_table')} style={{fontSize:20,display:'flex',alignItems:'center',gap:5}}>
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
                                <p>Nenhuma mesa foi criada.</p>
                            ) : (
                                tablesList.map((table)=>(
                                    <div key={table.id} className={`table-card ${table.table_number % 2 === 0 ? 'blue' : 'orange'}`}>
                                        {table.table_number < 10 ? (
                                            <p><b>0{table.table_number}</b></p>
                                        ) : (
                                            <p><b>{table.table_number}</b></p>
                                        )}
                                        <p id="p-table-status"><b>{table.status}</b></p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Home;