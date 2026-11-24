import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './order_ticket.css';
import "../../../App.css";
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { useNavigate } from "react-router-dom";
import { createOrder, getOrders } from "../../../services/orders";
import AlertModal from "../../../components/AlertModal";

function OpenTicket() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [orderTables, setOrderTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const [openOrders, setOpenOrders] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [alertPhrase, setAlertPhrase] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const [clientName, setClientName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalClientName, setModalClientName] = useState("");

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const navigate = useNavigate();

    function redirect(url) {
        navigate(url);
    }

    function showAlert(phrase, type) {
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    async function loadData() {
        try {
            const [tables, orders] = await Promise.all([getTables(), getOrders()]);
            setOrderTables(
                [...tables].sort((a, b) => Number(a.table_number) - Number(b.table_number))
            );
            setOpenOrders(orders.filter((order) => order.status === "Aberta"));
        } catch (error) {
            console.error("Erro ao carregar mesas e comandas:", error);
            showAlert(error.message || "Erro ao carregar mesas e comandas.", "error");
        }
    }

    useEffect(() => {
        loadData();
    }, [])

    function orderLabel(order) {
        const number = order.table?.table_number
            ?? orderTables.find((table) => table.id === order.tableId)?.table_number;
        return `${order.nameClient} - Mesa ${String(number).padStart(2, "0")}`;
    }

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

    async function handleAddCommand(e) {
        e.preventDefault();

        if (selectedTable === null) {
            alert("Selecione uma mesa primeiro!");
            return;
        }

        const clientNameTrimmed = modalClientName.trim();
        if (!clientNameTrimmed) {
            alert("Insira o nome do cliente!");
            return;
        }

        const tableObj = orderTables[selectedTable];

        setIsSaving(true);
        try {
            await createOrder({
                nameClient: clientNameTrimmed,
                tableId: tableObj.id,
                service_type: "Mesa",
            });
            setModalClientName("");
            setIsModalOpen(false);
            setSelectedTable(null);
            await loadData();
        } catch (error) {
            console.error("Erro ao abrir comanda:", error);
            showAlert(error.message || "Erro ao abrir comanda.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    function handleSelectCommand(order) {
        navigate('/menu_ordering', { state: { orderId: order.id } });
    }


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
                        <input id='input-client-order' type="text" placeholder="Insira o nome do cliente..." />
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
                            {orderTables.length > 0 ? (
                                orderTables.map((table, index) => {
                                    const isReserved = table.status === "Reservado";
                                    const isBusy = table.status === "Ocupado";
                                    const tableStatus = isReserved ? "Ocupado" : table.status;
                                    const isSelected = selectedTable === index;

                                    return (
                                        <button
                                            onClick={() => !isReserved && setSelectedTable(index)}
                                            disabled={isReserved}
                                            className={`selected-table ${isReserved ? 'occupied' : (isSelected ? 'select' : (isBusy ? 'busy' : 'not-select'))}`}
                                            key={index}
                                        >
                                            <p><b>{String(table.table_number).padStart(2, "0")}</b></p>
                                            <p>{tableStatus}</p>
                                        </button>
                                    )
                                })
                            ) : (
                                <p>Nenhuma mesa encontrada.</p>
                            )}
                        </div>
                        <div id="clients-list">
                            <div id='post-it-fix'></div>
                            {openOrders.length > 0 ? (
                                openOrders.map((order) => (
                                    <p
                                        key={order.id}
                                        onClick={() => handleSelectCommand(order)}
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        title="Clique para montar o pedido"
                                    >
                                        {orderLabel(order)}
                                    </p>
                                ))
                            ) : (
                                <p>Nenhuma comanda aberta.</p>
                            )}
                        </div>
                    </div>
                    <div className="actions-buttons" style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => redirect('/menu_ordering')} id='btn-select-table'>
                            Selecionar Mesa
                        </button>
                        <button
                            type="button"
                            id='btn-add-command'
                            onClick={() => {
                                if (selectedTable === null) {
                                    alert("Selecione uma mesa primeiro!");
                                    return;
                                }
                                setIsModalOpen(true);
                            }}
                        >
                            Adicionar Comanda
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal de Adicionar Comanda */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="modal-close"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h2>Adicionar comanda</h2>
                        <form onSubmit={handleAddCommand}>
                            <label htmlFor="modal-name">Nome</label>
                            <div className="modal-input-group">
                                <input
                                    id="modal-name"
                                    type="text"
                                    placeholder="Insira um nome..."
                                    value={modalClientName}
                                    onChange={(e) => setModalClientName(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn-start-command" disabled={isSaving}>
                                    Iniciar comanda
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <AlertModal
                phrase={alertPhrase}
                isOpen={alertModalIsOpen}
                setIsOpen={setAlertModalIsOpen}
                type={alertType}
            />
        </>
    );
}

export default OpenTicket