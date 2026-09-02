import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './book_table.css'
import { AlignCenter, ChevronLeft, TextAlignCenter } from "lucide-react";
import { getTables } from "../../../services/tables";
import Modal from 'react-modal'

function BookTable(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [orderTables,setOrderTables] = useState([]);
    const [selectedTable,setSelectedTable] = useState(null);
    const [clientsTable,setClientsTable] = useState([]);

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const [sucessReserveModalIsOpen,setSucessReserveModalIsOpen] = useState(false);

    const modalReserveStyle = {
        overlay:{
            backgroundColor: 'transparent',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content:{
            position: 'absolute',
            top: '12%',
            left:'50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '500px',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#c8ebffff',
            display:'flex',
            flexDirection:'column',
            gap:'20px',
            color: '#080e64ff',
        }
    }

    function close_modal_reserve(){
        setSucessReserveModalIsOpen(false);
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
                                <h1>Reservar Mesa</h1>
                            </div>
                        </div>
                        <div className="content-inputs">
                            <input className='input-client-order-reserve' type="text" placeholder="Insira o nome do cliente..." />
                            <input style={{width:'300px'}}  className='input-client-order-reserve' type="time" name="" id="" />
                        </div>
                        <p style={{color:'#777171ff'}}>Selecione a mesa do cliente e faça sua reserva.</p>
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
                    </div>
                    <button onClick={()=>setSucessReserveModalIsOpen(!sucessReserveModalIsOpen)} id='btn-select-table'>Reservar</button>
                </div>
                <Modal
                    isOpen={sucessReserveModalIsOpen}
                    contentLabel='Reserva feita com sucesso.'
                    style={modalReserveStyle}
                    onRequestClose={close_modal_reserve}
                    shouldCloseOnOverlayClick={true}
                >
                    <p>Reserva criada com sucesso!</p>
                </Modal>
            </main>
        </>
    );
}

export default BookTable