import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './open_all_tickets.css'
import { ChevronLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTables } from "../../../services/tables";
import { closeOrder, getOpenOrders } from "../../../services/orders";
import { getOpenReservations } from "../../../services/reserves";
import AlertModals from "../../../components/SucessModals/AlertModals";
import {
    getReservationDateTime,
    isPendingReservationOverdue,
} from "../../../utils/reservationTime";
import { getCached, hasCached } from "../../../services/cache";

function getCachedOrders() {
    const openOrders = getCached('orders:open');
    if (Array.isArray(openOrders)) return openOrders;

    const orders = getCached('orders:list');
    return Array.isArray(orders) ? orders.filter((order) => order.status === "Aberta") : [];
}

function getCachedReservations() {
    const openReservations = getCached('reservations:open');
    if (Array.isArray(openReservations)) return openReservations;

    const reservations = getCached('reservations:list');
    return Array.isArray(reservations)
        ? reservations.filter((reservation) => ["Pendente", "Confirmada"].includes(reservation.status))
        : [];
}

function hasCachedOpenTicketsData() {
    return hasCached('tables:list') &&
        (hasCached('orders:open') || hasCached('orders:list')) &&
        (hasCached('reservations:open') || hasCached('reservations:list'));
}

function OpenAllTickets(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate()

    const [tables,setTables] = useState(() => getCached('tables:list') ?? []);
    const [isLoadingOpenTickets, setIsLoadingOpenTickets] = useState(() => !hasCachedOpenTicketsData());
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedTable,setSelectedTable] = useState(null);
    const [orders,setOrders] = useState(getCachedOrders);
    const [reservations,setReservations] = useState(getCachedReservations);
    const [alertPhrase,setAlertPhrase] = useState("");
    const [alertType,setAlertType] = useState("success");
    const [alertModalIsOpen,setAlertModalIsOpen] = useState(false);
    const [closingOrderId,setClosingOrderId] = useState(null);
    const notifiedReservations = useRef(new Set());

    function showAlert(phrase, type){
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    async function loadOpenTickets(){
        if (!hasCachedOpenTicketsData()) setIsLoadingOpenTickets(true);
        try{
            const [tables, orders, reservations] = await Promise.all([
                getTables(),
                getOpenOrders(),
                getOpenReservations(),
            ]);
            setTables(tables);
            setOrders(orders);
            setReservations(reservations);
        } catch(error){
            console.error("Erro ao carregar comandas, reservas e mesas:", error);
            showAlert(error.message || "Erro ao carregar comandas e reservas.", "error");
        } finally {
            setIsLoadingOpenTickets(false);
        }
    }

    useEffect(()=>{
        loadOpenTickets();
    },[])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isLoadingOpenTickets) return;

        const warningLimit = currentTime.getTime() + 30 * 60 * 1000;
        const warnings = [];
        reservations.forEach((reservation) => {
            if (reservation.status !== "Pendente") return;

            const startsAt = getReservationDateTime(reservation, false);
            if (
                !startsAt ||
                startsAt <= currentTime ||
                startsAt.getTime() > warningLimit
            ) return;

            const openOrders = orders.filter(
                (order) => order.tableId === reservation.tableId && order.status === "Aberta",
            );
            if (!openOrders.length || notifiedReservations.current.has(reservation.id)) return;

            notifiedReservations.current.add(reservation.id);
            const reservationTime = startsAt.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            });
            openOrders.forEach((order) => {
                warnings.push(
                    `A reserva da Mesa ${String(
                        tables.find((table) => table.id === reservation.tableId)?.table_number ?? "",
                    ).padStart(2, "0")} começa às ${reservationTime}. Encerre a comanda de ${order.nameClient} antes do início.`,
                );
            });
        });

        if (warnings.length) {
            setAlertPhrase(warnings.join(" "));
            setAlertType("error");
            setAlertModalIsOpen(true);
        }
    }, [currentTime, isLoadingOpenTickets, orders, reservations, tables]);

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
                ["Pendente", "Confirmada"].includes(reservation.status) &&
                !isPendingReservationOverdue(reservation, currentTime)
            ))
            .map((reservation) => ({
                id: `reservation-${reservation.id}`,
                name: reservation.name,
                type: "Reserva",
                status: reservation.status,
            })),
    ];

    const activeTables = tables.filter((table) => {
        const hasOpenOrder = orders.some(
            (order) => order.tableId === table.id && order.status === "Aberta",
        );
        const hasReservationRecord = reservations.some((reservation) => (
            reservation.tableId === table.id &&
            ["Pendente", "Confirmada"].includes(reservation.status)
        ));
        const tableReservations = reservations.filter((reservation) => (
            reservation.tableId === table.id &&
            ["Pendente", "Confirmada"].includes(reservation.status) &&
            !isPendingReservationOverdue(reservation, currentTime)
        ));
        const hasActiveReservation = tableReservations.some((reservation) => {
            const endsAt = getReservationDateTime(reservation, true);
            return !endsAt || endsAt > currentTime;
        });

        return table.status === "Ocupado" ||
            hasOpenOrder ||
            hasActiveReservation ||
        (table.status === "Reservado" && !hasReservationRecord);
    });
    const selectedTableData = tables.find((table) => table.id === selectedTable);
    const hasOpenOrderForSelectedTable = selectedTable !== null && orders.some(
        (order) => order.tableId === selectedTable && order.status === "Aberta",
    );

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
            const hasActiveReservation = reservations.some((reservation) => (
                reservation.tableId === orderToClose.tableId &&
                ["Pendente", "Confirmada"].includes(reservation.status) &&
                !isPendingReservationOverdue(reservation, new Date()) &&
                (!getReservationDateTime(reservation, true) ||
                    getReservationDateTime(reservation, true) > new Date())
            ));

            setOrders(remainingOrders);
            setTables((currentTables) => currentTables.map((table) => (
                table.id === orderToClose.tableId
                    ? {
                        ...table,
                        status: hasOpenOrder
                            ? "Ocupado"
                            : hasActiveReservation
                                ? "Reservado"
                                : "Livre",
                    }
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
                            <h1>Comandas e Reservas Abertas</h1>
                        </div>
                        <p style={{ color: '#777171ff' }}>Selecione a mesa do cliente e edite suas comandas.</p>
                    </div>

                    <div className="tickets-container">
                        {isLoadingOpenTickets ? (
                            <p>Carregando mesas...</p>
                        ) : activeTables.length > 0 ? (
                            activeTables.map((table)=>{
                                    const hasOpenOrder = orders.some(
                                        (order) => order.tableId === table.id && order.status === "Aberta",
                                    );
                                    const hasActiveReservation = reservations.some((reservation) => (
                                        reservation.tableId === table.id &&
                                        ["Pendente", "Confirmada"].includes(reservation.status) &&
                                        !isPendingReservationOverdue(reservation, currentTime) &&
                                        (!getReservationDateTime(reservation, true) ||
                                            getReservationDateTime(reservation, true) > currentTime)
                                    ));
                                    const tableReservations = reservations.filter((reservation) => (
                                        reservation.tableId === table.id &&
                                        ["Pendente", "Confirmada"].includes(reservation.status) &&
                                        !isPendingReservationOverdue(reservation, currentTime)
                                    ));
                                    const hasReservationStartingSoon = tableReservations.some((reservation) => {
                                        if (reservation.status !== "Pendente") return false;
                                        const startsAt = getReservationDateTime(reservation, false);
                                        const endsAt = getReservationDateTime(reservation, true);
                                        return startsAt && endsAt &&
                                            startsAt > currentTime &&
                                            startsAt.getTime() <= currentTime.getTime() + 30 * 60 * 1000 &&
                                            endsAt > currentTime;
                                    });
                                    const hasReservationInProgress = tableReservations.some((reservation) => {
                                        if (reservation.status !== "Pendente") return false;
                                        const startsAt = getReservationDateTime(reservation, false);
                                        const endsAt = getReservationDateTime(reservation, true);
                                        return startsAt && endsAt &&
                                            startsAt <= currentTime && currentTime < endsAt;
                                    });
                                    const hasReservationRecord = tableReservations.length > 0;
                                    const shouldShowReservation = hasOpenOrder
                                        ? hasReservationStartingSoon || hasReservationInProgress
                                        : hasActiveReservation || (table.status === "Reservado" && !hasReservationRecord);
                                    const tableStatus = shouldShowReservation
                                        ? "Reservado"
                                        : hasOpenOrder || table.status === "Ocupado"
                                            ? "Ocupado"
                                            : table.status;
                                    const isSelected = selectedTable === table.id;

                                    return(
                                        <button 
                                            onClick={()=>setSelectedTable(table.id)}
                                            className={`selected-table ${isSelected ? 'select' : 'not-select'}`}
                                            key={table.id}
                                        >
                                            <p><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                            <p>{tableStatus === 'Ocupado' ? 'Em Uso' : 'Reserva'}</p>
                                        </button>
                                    )
                                })
                        ) : (
                            <p className="tickets-empty-message">Nenhuma mesa ocupada ou reservada.</p>
                        )}
                    </div>
                    <div className="clients-list">
                        <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
                            <h1>Clientes</h1>
                            {hasOpenOrderForSelectedTable && (
                                <button
                                    type="button"
                                    className="button-add-client"
                                    onClick={() => {
                                        if (!selectedTableData) return;
                                        navigate("/menu_ordering", {
                                            state: {
                                                draftOrder: {
                                                    nameClient: "",
                                                    tableId: selectedTableData.id,
                                                    tableNumber: selectedTableData.table_number,
                                                },
                                            },
                                        });
                                    }}
                                >
                                    <span>
                                        Adicionar Comanda a Mesa {selectedTableData?.table_number ?? ""}
                                    </span>
                                </button>
                            )}
                        </div>
                        <div className="client-records">
                            {clients.length > 0 ? (
                                clients.map((client)=>(
                                    <div className="client-record" key={client.id}>
                                        {client.orderId ? (
                                            <div className="container-client-card">
                                                <button
                                                type="button"
                                                className={`client-card`}
                                                onClick={() => navigate("/menu_ordering", {
                                                    state: { orderId: client.orderId },
                                                })}
                                                >
                                                    <span style={{display:'flex',flexDirection: 'row', alignItems: 'center', gap: 15}}>{client.name} - Comanda {client.orderId} <Edit></Edit></span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`client-card`}
                                                    onClick={() => navigate("/finish_ticket", {
                                                        state: { orderId: client.orderId },
                                                    })}
                                                >
                                                    <span>Fechar Comanda</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="container-client-card">
                                                <div className="client-card reservation-card">
                                                    <span>
                                                        {client.name} - Mesa {tables.find((table) => table.id === selectedTable)?.table_number} - Reserva
                                                    </span>
                                                </div>
                                                {client.status === "Pendente" ? (
                                                    <button
                                                        type="button"
                                                        className="client-card"
                                                        onClick={() => navigate("/menu_ordering", {
                                                            state: {
                                                                draftOrder: {
                                                                    nameClient: client.name,
                                                                    tableId: selectedTable,
                                                                    tableNumber: tables.find((table) => table.id === selectedTable)?.table_number,
                                                                },
                                                            },
                                                        })}
                                                    >
                                                        Iniciar Comanda
                                                    </button>
                                                ) : (
                                                    <div className="client-card">
                                                        Reserva Confirmada
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>
                                    {isLoadingOpenTickets
                                        ? "Carregando comandas e reservas..."
                                        : selectedTable === null
                                            ? "Selecione uma mesa para ver clientes."
                                            : "Nenhuma comanda ou reserva aberta nesta mesa."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <AlertModals
                phrase={alertPhrase}
                isOpen={alertModalIsOpen}
                setIsOpen={setAlertModalIsOpen}
                type={alertType}
            />
        </>
    );
}

export default OpenAllTickets