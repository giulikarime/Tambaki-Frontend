import { useEffect, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './open_all_tickets.css'
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTables } from "../../../services/tables";
import { closeOrder, getOrders } from "../../../services/orders";
import { getReservations } from "../../../services/reserves";
import AlertModal from "../../../components/AlertModal";

function OpenAllTickets(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate()

    const [tables,setTables] = useState([])
    const [selectedTable,setSelectedTable] = useState(null);
    const [orders,setOrders] = useState([]);
    const [reservations,setReservations] = useState([]);
    const [alertPhrase,setAlertPhrase] = useState("");
    const [alertType,setAlertType] = useState("success");
    const [alertModalIsOpen,setAlertModalIsOpen] = useState(false);
    const [selectedOrderId,setSelectedOrderId] = useState(null);
    const [closingOrderId,setClosingOrderId] = useState(null);

    function showAlert(phrase, type){
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    async function loadOpenTickets(){
        try{
            const [tables, orders, reservations] = await Promise.all([
                getTables(),
                getOrders(),
                getReservations(),
            ]);
            setTables(tables);
            setOrders(orders);
            setReservations(reservations);
        } catch(error){
            console.error("Erro ao carregar comandas, reservas e mesas:", error);
            showAlert(error.message || "Erro ao carregar comandas e reservas.", "error");
        }
    }

    useEffect(()=>{
        loadOpenTickets();
    },[])

    const clients = selectedTable === null ? [] : [
        ...orders
            .filter((order) => order.tableId === selectedTable && order.status === "Aberta")
            .map((order) => ({
                id: `order-${order.id}`,
                orderId: order.id,
                name: order.nameClient,
                type: "Comanda",
            })),
        ...reservations
            .filter((reservation) => (
                reservation.tableId === selectedTable &&
                ["Pendente", "Confirmada"].includes(reservation.status)
            ))
            .map((reservation) => ({
                id: `reservation-${reservation.id}`,
                name: reservation.name,
                type: "Reserva",
            })),
    ];

    async function handleCloseOrder(orderId){
        const orderToClose = orders.find((order) => order.id === orderId);
        if (!orderToClose) return;

        setClosingOrderId(orderId);
        try {
            await closeOrder(orderId);
            const remainingOrders = orders.filter((order) => order.id !== orderId);
            const hasOpenOrder = remainingOrders.some(
                (order) => order.tableId === orderToClose.tableId && order.status === "Aberta"
            );

            setOrders(remainingOrders);
            setTables((currentTables) => currentTables.map((table) => (
                table.id === orderToClose.tableId
                    ? { ...table, status: hasOpenOrder ? "Ocupado" : "Livre" }
                    : table
            )));
            setSelectedOrderId(null);
            showAlert("Comanda fechada com sucesso.", "success");
        } catch (error) {
            console.error("Erro ao fechar comanda:", error);
            showAlert(error.message || "Erro ao fechar comanda.", "error");
        } finally {
            setClosingOrderId(null);
        }
    }

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
                            <button className="add-order-button" onClick={()=>navigate("/order_ticket")}>
                                Adicionar Comanda
                            </button>
                        </div>
                        <p style={{ color: '#777171ff' }}>Selecione a mesa do cliente e edite suas comandas.</p>
                    </div>

                    <div className="tickets-container">
                        {tables.length > 0 ? (
                            tables.map((table)=>{
                                    const isOccupied = table.status === "Ocupado" || table.status === "Reservado";
                                    const tableStatus = table.status === "Reservado" ? "Ocupado" : table.status;
                                    const isSelected = selectedTable === table.id;

                                    return(
                                        <button 
                                            onClick={()=>setSelectedTable(table.id)}
                                            className={`selected-table ${isSelected ? 'select' : (isOccupied ? 'occupied' : 'not-select')}`} 
                                            key={table.id}
                                        >
                                            <p><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                            <p>{tableStatus}</p>
                                        </button>
                                    )
                                })
                        ) : (
                            <p>Nenhuma mesa existente.</p>
                        )}
                    </div>
                    <div className="clients-list">
                        <h1>CLIENTES</h1>
                        <div className="client-records">
                            {clients.length > 0 ? (
                                clients.map((client)=>(
                                    <div className="client-record" key={client.id}>
                                        {client.orderId ? (
                                            <button
                                                type="button"
                                                className={`client-card ${selectedOrderId === client.orderId ? "selected" : ""}`}
                                                onClick={() => setSelectedOrderId(
                                                    selectedOrderId === client.orderId ? null : client.orderId
                                                )}
                                            >
                                                <span>{client.name} - Mesa {tables.find((table) => table.id === selectedTable)?.table_number}</span>
                                            </button>
                                        ) : (
                                            <div className="client-card reservation-card">
                                                <span>{client.name} - Mesa {tables.find((table) => table.id === selectedTable)?.table_number} - Reserva</span>
                                            </div>
                                        )}
                                        {selectedOrderId === client.orderId && client.orderId && (
                                            <button
                                                type="button"
                                                className="close-order-button"
                                                disabled={closingOrderId === client.orderId}
                                                onClick={() => handleCloseOrder(client.orderId)}
                                            >
                                                {closingOrderId === client.orderId ? "Fechando..." : "Fechar Comanda"}
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>{selectedTable === null ? "Selecione uma mesa para ver clientes." : "Nenhuma comanda ou reserva aberta nesta mesa."}</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <AlertModal
                phrase={alertPhrase}
                isOpen={alertModalIsOpen}
                setIsOpen={setAlertModalIsOpen}
                type={alertType}
            />
        </>
    );
}

export default OpenAllTickets