import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './order_ticket.css'
import "../../../App.css"
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { useNavigate } from "react-router-dom";

function OpenTicket(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [orderTables,setOrderTables] = useState([]);
    const [selectedTable,setSelectedTable] = useState(null);

    const [clientsTable,setClientsTable] = useState([]);

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const navigate = useNavigate();

    function redirect(url){
        navigate(url);
    }

    useEffect(()=>{
        async function loadTables(){
            try{
                const tables = await getTables();
                setOrderTables(tables);
            }catch(error){
                console.error("Nenhuma mesa encontrada no servidor. ",error);
            }
        }
        loadTables();
    },[])

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

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-order">
                    <div id='container'>
                        <div id="top-container">
                            <div className="groups-top-container">
                                <button onClick={()=>navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                                <h1>Abrir Comanda</h1>
                            </div>
                        </div>
                        <input id='input-client-order' type="text" placeholder="Insira o nome do cliente..." />
                        <p style={{color:'#777171ff'}}>Selecione a mesa do cliente e monte seu pedido.</p>
                    </div>
                    <div id="sec-container">
                        <div 
                            id="tables-list-order"
                            ref={tablesListRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeaveOrUp}
                            onMouseUp={handleMouseLeaveOrUp}
                            onMouseMove={handleMouseMove}
                        >
                            {orderTables.length > 0 ? (
                                orderTables.map((table,index)=>{
                                    const isOccupied = table.status === "Ocupado";
                                    const isSelected = selectedTable === index;

                                    return(
                                        <button 
                                            onClick={()=> !isOccupied && setSelectedTable(index)}
                                            disabled={isOccupied}
                                            className={`selected-table ${isOccupied ? 'occupied' : (isSelected ? 'select' : 'not-select')}`} 
                                            key={index}
                                        >
                                            <p><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                            <p>{table.status}</p>
                                        </button>
                                    )
                                })
                            ) : (
                                <p>Nenhuma mesa encontrada.</p>
                            )}
                        </div>
                        <div id="clients-list">
                            <div id='post-it-fix'></div>
                            {clientsTable.length > 0 ? (
                                clientsTable.map((client, idx)=>(
                                    <p key={idx}>{client}</p>
                                ))
                            ) : (
                                <p>Nenhuma comanda na mesa.</p>
                            )}
                        </div>
                    </div>
                    <button onClick={()=>redirect('/menu_ordering')} id='btn-select-table'>Selecionar Mesa</button>
                </div>
            </main>
        </>
    );
}

export default OpenTicket