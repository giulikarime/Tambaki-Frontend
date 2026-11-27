import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './order_ticket.css';
import "../../../App.css";
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { getOrders } from "../../../services/orders";
import { getReservations } from "../../../services/reserves";
import { useNavigate } from "react-router-dom";
import AlertModals from "../../../components/SucessModals/AlertModals";
import {
    getReservationDateTime,
    isPendingReservationOverdue,
} from "../../../utils/reservationTime";

function OpenTicket() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [orderTables, setOrderTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [alertPhrase, setAlertPhrase] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const [clientName, setClientName] = useState("");

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const navigate = useNavigate();

    function showAlert(phrase, type) {
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    async function loadData() {
        setIsLoadingData(true);
        try {
            const [tables, ordersData, reservationsData] = await Promise.all([
                getTables(),
                getOrders(),
                getReservations(),
            ]);
            setOrderTables(
                [...tables].sort((a, b) => Number(a.table_number) - Number(b.table_number))
            );
            setOrders(ordersData);
            setReservations(reservationsData);
        } catch (error) {
            console.error("Erro ao carregar mesas, comandas e reservas:", error);
            showAlert(error.message || "Erro ao carregar mesas e reservas.", "error");
        } finally {
            setIsLoadingData(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30_000);
        return () => clearInterval(timer);
    }, []);

    const isTableAvailable = useCallback((table, at = new Date()) => {
        if (!table || table.status === "Ocupado") return false;

        const hasOpenOrder = orders.some(
            (order) => order.tableId === table.id && order.status === "Aberta",
        );
        const hasCurrentReservation = reservations.some((reservation) => {
            if (reservation.tableId !== table.id) return false;
            if (!["Pendente", "Confirmada"].includes(reservation.status)) return false;
            if (isPendingReservationOverdue(reservation, at)) return false;

            const startsAt = getReservationDateTime(reservation, false);
            const endsAt = getReservationDateTime(reservation, true);
            return startsAt && endsAt && startsAt <= at && at < endsAt;
        });

        return !hasOpenOrder && !hasCurrentReservation;
    }, [orders, reservations]);

    function handleMouseDown(e) {
        const el = tablesListRef.current;
        isDragging.current = true;
        el.classList.add('grabbing');
        startX.current = e.pageX - el.offsetLeft;
        scrollLeftStart.current = el.scrollLeft;
    }

    function handleMouseLeaveOrUp() {
        const el = tablesListRef.current;
        isDragging.current = false;
        el.classList.remove('grabbing');
    }

    function handleMouseMove(e) {
        if (!isDragging.current) return;
        e.preventDefault();
        const el = tablesListRef.current;
        const x = e.pageX - el.offsetLeft;
        const walk = x - startX.current;
        el.scrollLeft = scrollLeftStart.current - walk;
    }

    

    function handleStartOrder() {
        if (selectedTable === null) {
            showAlert("Selecione uma mesa primeiro!", "error");
            return;
        }

        const table = orderTables[selectedTable];
        if (!isTableAvailable(table, new Date())) {
            showAlert("Selecione uma mesa livre.", "error");
            return;
        }

        const nameClient = clientName.trim();
        if (!nameClient) {
            showAlert("Insira o nome do cliente.", "error");
            return;
        }

        navigate('/menu_ordering', {
            state: {
                draftOrder: {
                    nameClient,
                    tableId: table.id,
                    tableNumber: table.table_number,
                },
            },
        });
    }

    const availableTables = orderTables.filter((table) => isTableAvailable(table, currentTime));

    useEffect(() => {
        if (selectedTable === null) return;
        const selected = orderTables[selectedTable];
        if (!selected || !isTableAvailable(selected, currentTime)) {
            setSelectedTable(null);
        }
    }, [currentTime, isTableAvailable, orderTables, selectedTable]);

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main id="order-ticket-page">
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-order">
                    <div id='container'>
                        <div id="top-container">
                            <div className="groups-top-container">
                                <button onClick={() => navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                                <h1>Abrir Comanda</h1>
                            </div>
                        </div>
                        <input
                            id='input-client-order'
                            type="text"
                            placeholder="Insira o nome do cliente..."
                            value={clientName}
                            onChange={(event) => setClientName(event.target.value)}
                            required
                        />
                        <p style={{ color: '#777171ff' }}>Selecione a mesa do cliente e monte seu pedido.</p>
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
                            {isLoadingData ? (
                                <p>Carregando mesas...</p>
                            ) : availableTables.length > 0 ? (
                                availableTables.map((table) => {
                                    const tableIndex = orderTables.findIndex(
                                        (item) => item.id === table.id,
                                    );
                                    const isSelected = selectedTable === tableIndex;

                                    return (
                                        <button
                                            onClick={() => {
                                                if (!isTableAvailable(table, new Date())) {
                                                    showAlert("Esta mesa está ocupada ou reservada neste horário.", "error");
                                                    setSelectedTable(null);
                                                    return;
                                                }
                                                setSelectedTable(isSelected ? null : tableIndex);
                                            }}
                                            className={`selected-table ${isSelected ? 'select' : 'not-select'}`}
                                            key={table.id}
                                        >
                                            <p><b>{String(table.table_number).padStart(2, "0")}</b></p>
                                            <p>Livre</p>
                                        </button>
                                    )
                                })
                            ) : (
                                <p>Nenhuma mesa livre no momento.</p>
                            )}
                        </div>

                    </div>
                    <div className="actions-buttons" style={{ display: 'flex', gap: '16px' }}>
                        <button type="button"
                            onClick={handleStartOrder} id='btn-select-table'>
                            Iniciar comanda
                        </button>
                    </div>
                </div>
            </main >
            <AlertModals
                phrase={alertPhrase}
                isOpen={alertModalIsOpen}
                setIsOpen={setAlertModalIsOpen}
                type={alertType}
            />
        </>
    );
}

export default OpenTicket