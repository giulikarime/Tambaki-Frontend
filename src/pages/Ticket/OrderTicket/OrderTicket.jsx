import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './order_ticket.css';
import "../../../App.css";
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { useNavigate } from "react-router-dom";

function OpenTicket() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [orderTables, setOrderTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const [clientsTable, setClientsTable] = useState([]);

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

    useEffect(() => {
        async function loadTables() {
            try {
                const tables = await getTables();
                setOrderTables(tables);
            } catch (error) {
                console.error("Nenhuma mesa encontrada no servidor. ", error);
            }
        }
        loadTables();
    }, [])

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

    function handleAddCommand(e) {
        e.preventDefault();

        if (selectedTable === null) {
            alert("Selecione uma mesa primeiro!");
            return;
        }

        if (!modalClientName.trim()) {
            alert("Insira o nome do cliente!");
            return;
        }

        const tableObj = orderTables[selectedTable];
        const formattedTable = String(tableObj.table_number).padStart(2, "0");

        const newCommand = {
            id: Date.now(),
            clientName: modalClientName.trim(),
            table_number: formattedTable,
            label: `${modalClientName.trim()} - Mesa ${formattedTable}`
        }

        setClientsTable((prev) => [...prev, newCommand]);
        setModalClientName("");
        setIsModalOpen(false);
    }
    function handleSelectCommand(command) {
        navigate('/menu_ordering', { state: { command } });
    }


    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
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
                                    const isOccupied = table.status === "Ocupado" || table.status === "Reservado";
                                    const tableStatus = table.status === "Reservado" ? "Ocupado" : table.status;
                                    const isSelected = selectedTable === index;

                                    return (
                                        <button
                                            onClick={() => !isOccupied && setSelectedTable(index)}
                                            disabled={isOccupied}
                                            className={`selected-table ${isOccupied ? 'occupied' : (isSelected ? 'select' : 'not-select')}`}
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
                            {clientsTable.length > 0 ? (
                                clientsTable.map((client) => (
                                    <p key={client.id} onClick={() => handleSelectCommand(client)} style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        title="Clique para montar o pedido"
                                    >{client.label}</p>
                                ))
                            ) : (
                                <p>Nenhuma comanda na mesa.</p>
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
                                <button type="submit" className="btn-start-command">
                                    Iniciar comanda
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default OpenTicket