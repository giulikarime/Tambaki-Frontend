import { useEffect, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './open_all_tickets.css'
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTables } from "../../../services/tables";

function OpenAllTickets(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate()

    const [tables,setTables] = useState([])
    const [selectedTable,setSelectedTable] = useState(null);

    const [clients,setClients] = useState([]);

    async function handleAllTables(){
        try{
            const tables = await getTables();
            setTables(tables);
        } catch(error){
            console.error("Erro ao carregar mesas.");
            return;
        }
    }

    useEffect(()=>{
        handleAllTables();
    },[])

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-tickets">
                    <div id="top-container-tickets">
                        <div className="top-group-text">
                            <button onClick={()=>navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                            <h1>COMANDAS E RESERVAS ABERTAS</h1>
                        </div>
                        <p style={{ color: '#777171ff' }}>Selecione a mesa do cliente e edite suas comandas.</p>
                    </div>

                    <div className="tickets-container">
                        {tables.length > 0 ? (
                            tables.map((table,index)=>{
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
                            <p>Nenhuma mesa existente.</p>
                        )}
                    </div>
                    <div className="clients-list">
                        <h1>CLIENTES</h1>
                        <div>
                            {clients.length > 0 ? (
                                <p>Teste</p>
                            ) : (
                                <p>Nenhuma comanda aberta.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default OpenAllTickets