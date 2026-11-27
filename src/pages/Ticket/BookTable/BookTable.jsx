import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './book_table.css'
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { createReservation, getReservations } from "../../../services/reserves";
import { useNavigate } from "react-router-dom";
import AlertModals from "../../../components/SucessModals/AlertModals";
import { getReservationDateTime } from "../../../utils/reservationTime";

function formatLocalDateTime(date){
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function formatLocalDate(date){
    return `${formatLocalDateTime(date).slice(0, 10)}T00:00:00`;
}

function BookTable(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();

    const [orderTables,setOrderTables] = useState([]);
    const [reservations,setReservations] = useState([]);
    const [isLoadingReservationData, setIsLoadingReservationData] = useState(true);
    const [selectedTable,setSelectedTable] = useState(null);
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [desiredTime,setDesiredTime] = useState("");
    const [quantityPeople, setQuantityPeople] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);
    const [successPhrase, setSuccessPhrase] = useState('');
    const [formError, setFormError] = useState('');

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);


    useEffect(()=>{
            async function loadReservationData(){
                setFormError('');
                try{
                    const [tables, reservationsData] = await Promise.all([
                        getTables(),
                        getReservations(),
                    ]);
                    setOrderTables(tables);
                    setReservations(reservationsData);
                }catch(error){
                    console.error("Erro ao carregar mesas ou reservas.",error);
                    setFormError('Erro ao carregar mesas e reservas');
                    setAlertType('error');
                    setAlertModalIsOpen(true);
                } finally {
                    setIsLoadingReservationData(false);
                }
            }
            loadReservationData();
        },[])

    function getDesiredRange() {
        if (!desiredTime) return null;

        const startsAt = new Date(desiredTime);
        if (Number.isNaN(startsAt.getTime())) return null;
        const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
        return { startsAt, endsAt };
    }

    function isTableOccupied(table) {
        const range = getDesiredRange();
        if (!range) return false;

        return reservations.some((reservation) => {
            if (reservation.tableId !== table.id) return false;
            if (!["Pendente", "Confirmada"].includes(reservation.status)) return false;

            const reservationStart = getReservationDateTime(reservation, false);
            const reservationEnd = getReservationDateTime(reservation, true);
            return reservationStart && reservationEnd
                && reservationStart < range.endsAt
                && reservationEnd > range.startsAt;
        });
    }

    function getTableIssue(table) {
        if (table.capacity < Number(quantityPeople)) return "capacity";
        if (isTableOccupied(table)) return "occupied";
        return null;
    }

    async function handleCreateReservation(event){
        event.preventDefault();
        setSuccessPhrase('');
        setFormError('');
        setAlertType('');
        const peopleCount = Number(quantityPeople);
        if (!Number.isInteger(peopleCount) || peopleCount < 1) {
            setFormError("Informe um número inteiro de pessoas maior que zero.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }
        if (!selectedTable) {
            setFormError("Selecione uma mesa para fazer a reserva.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }
        if (!desiredTime) {
            setFormError("Selecione o horário e a data desejada.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        const tableIssue = getTableIssue(selectedTable);
        if (tableIssue) {
            const issueMessage = tableIssue === "capacity"
                ? `A mesa ${String(selectedTable.table_number).padStart(2, "0")} não comporta ${peopleCount} pessoas.`
                : `A mesa ${String(selectedTable.table_number).padStart(2, "0")} está ocupada nesse horário.`;
            setFormError(issueMessage);
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        const phone = clientPhone.replace(/\D/g, "");
        if (!/^\d{10,11}$/.test(phone)) {
            setFormError("Informe um telefone com DDD e 10 ou 11 dígitos.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }
        const startsAt = new Date(desiredTime);
        if (Number.isNaN(startsAt.getTime())) {
            setFormError("Selecione uma data e horário válidos.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }
        const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

        const payload = {
            name: clientName.trim(),
            phone,
            quantityPeople: peopleCount,
            startsAtDate: formatLocalDate(startsAt),
            startsAtHours: formatLocalDateTime(startsAt),
            endsAtDate: formatLocalDate(endsAt),
            endsAtHours: formatLocalDateTime(endsAt),
            tableId: selectedTable.id,
        };

        setIsSubmitting(true);
        try {
            await createReservation(payload);
            setSuccessPhrase("Reserva criada com sucesso!");
            setAlertType('success');
            setAlertModalIsOpen(true);
            setReservations((currentReservations) => [
                ...currentReservations,
                {
                    tableId: selectedTable.id,
                    quantityPeople: peopleCount,
                    status: "Pendente",
                    startsAtDate: payload.startsAtDate,
                    startsAtHours: payload.startsAtHours,
                    endsAtDate: payload.endsAtDate,
                    endsAtHours: payload.endsAtHours,
                },
            ]);
            setSelectedTable(null);
            setClientName("");
            setClientPhone("");
            setDesiredTime("");
            setQuantityPeople("1");
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            setFormError(error.message || "Erro ao criar reserva.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleMouseDown(e){
        const el = tablesListRef.current;
        if (!el) return;
        isDragging.current = true;
        el.classList.add('grabbing');
        startX.current = e.pageX - el.offsetLeft;
        scrollLeftStart.current = el.scrollLeft;
    }

    function handleMouseLeaveOrUp(){
        const el = tablesListRef.current;
        if (!el) return;
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
                    </div>
                        <form onSubmit={handleCreateReservation} autoComplete="off">
                            <div className="content-inputs">
                                <div className="align-client-table">
                                    <label htmlFor="reservation-client-name">Nome</label>
                                    <input id="reservation-client-name" className='input-client-order-reserve' type="text" name="name" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Digite o nome do cliente..." aria-label="Nome do cliente" required />
                                </div>
                                <div className="align-client-table">
                                    <label htmlFor="reservation-client-phone">Telefone</label>
                                    <input id="reservation-client-phone" className='input-client-order-reserve' type="tel" name="phone" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} placeholder="Digite o telefone do cliente..." aria-label="Telefone do cliente" autoComplete="tel" inputMode="tel" maxLength={20} required />
                                </div>
                                <div className="align-client-table">
                                    <label htmlFor="reservation-client-people">Número de Pessoas</label>
                                    <input
                                        id="reservation-client-people"
                                        className="input-client-order-reserve"
                                        type="number"
                                        name="quantityPeople"
                                        min="1"
                                        step="1"
                                        value={quantityPeople}
                                        onChange={(event) => setQuantityPeople(event.target.value)}
                                        placeholder="Ex.: 5"
                                        aria-label="Número de Pessoas"
                                        inputMode="numeric"
                                        required
                                    />
                                </div>
                                <div className="align-client-table">
                                    <label htmlFor="">Horário</label>
                                    <input
                                        className='input-client-order-reserve'
                                        type="datetime-local"
                                        name="startsAtHours"
                                        aria-label="Horário inicial"
                                        value={desiredTime}
                                        onChange={(event)=>setDesiredTime(event.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <p className="reservation-instruction">Selecione a mesa do cliente e faça sua reserva.</p>
                            <div id="sec-container">
                                <div 
                                    id="tables-list-order"
                                    ref={tablesListRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseLeave={handleMouseLeaveOrUp}
                                    onMouseUp={handleMouseLeaveOrUp}
                                    onMouseMove={handleMouseMove}
                                >
                                    {isLoadingReservationData ? (
                                        <p>Carregando mesas...</p>
                                    ) : orderTables.length > 0 ? (
                                        orderTables.map((table)=>{
                                            const isSelected = selectedTable?.id === table.id;
                                            const isOccupied = isTableOccupied(table);
                                            const hasInsufficientCapacity = Number(quantityPeople) > table.capacity;
                                            const isUnavailable = isOccupied || hasInsufficientCapacity;
                                            const tableTextColor = isSelected ? "white" : "black";

                                            return(
                                                <button 
                                                    type="button"
                                                    onClick={()=>setSelectedTable(table)}
                                                    className={`selected-table ${isSelected ? 'select' : isUnavailable ? 'occupied' : 'not-select'}`} 
                                                    key={table.id}
                                                >
                                                    <p style={{color: tableTextColor}}><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                                    <p style={{color: tableTextColor}}>
                                                        {isOccupied
                                                            ? "Ocupada"
                                                            : hasInsufficientCapacity
                                                                ? "Poucos lugares"
                                                                : "Livre"}
                                                    </p>
                                                </button>
                                            )
                                        })
                                    ) : (
                                        <p>Nenhuma mesa encontrada.</p>
                                    )}
                                </div>
                            </div>
                            <button disabled={isSubmitting || !selectedTable} type="submit" id='btn-select-table'>
                                {isSubmitting ? "Reservando..." : "Reservar"}
                            </button>
                        </form>
                </div>
            </main>
            <AlertModals
                phrase={successPhrase ? successPhrase : formError}
                isOpen={alertModalIsOpen}
                setIsOpen={setAlertModalIsOpen}
                type={alertType}
            ></AlertModals>
        </>
    );
}

export default BookTable