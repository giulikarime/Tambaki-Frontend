import { useEffect, useRef, useState } from "react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import './book_table.css'
import { ChevronLeft } from "lucide-react";
import { getTables } from "../../../services/tables";
import { createReservation, getReservations } from "../../../services/reserves";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../../components/AlertModal";

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
    const [desiredTime,setDesiredTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertPhrase, setAlertPhrase] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const tablesListRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    function showAlert(phrase, type){
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    useEffect(()=>{
            async function loadReservationData(){
                try{
                    const [tables, reservationsData] = await Promise.all([
                        getTables(),
                        getReservations(),
                    ]);
                    setOrderTables(tables);
                    setReservations(reservationsData);
                }catch(error){
                    console.error("Erro ao carregar mesas ou reservas.",error);
                    showAlert(error.message || "Erro ao carregar mesas e reservas.", "error");
                } finally {
                    setIsLoadingReservationData(false);
                }
            }
            loadReservationData();
        },[])

    function getReservationDateTime(reservation, isEnd) {
        const dateValue = isEnd ? reservation.endsAtDate : reservation.startsAtDate;
        const timeValue = isEnd ? reservation.endsAtHours : reservation.startsAtHours;

        if (!dateValue || !timeValue) return null;

        const dateMatch = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
        const timeMatch = String(timeValue).match(/T(\d{2}):(\d{2})|^(\d{2}):(\d{2})/);
        if (!dateMatch) return null;

        const hours = timeMatch ? Number(timeMatch[1] ?? timeMatch[3]) : 0;
        const minutes = timeMatch ? Number(timeMatch[2] ?? timeMatch[4]) : 0;
        return new Date(
            Number(dateMatch[1]),
            Number(dateMatch[2]) - 1,
            Number(dateMatch[3]),
            hours,
            minutes,
            0,
            0,
        );
    }

    function getDesiredRange() {
        if (!desiredTime) return null;

        const [hours, minutes] = desiredTime.split(":").map(Number);
        const startsAt = new Date();
        startsAt.setHours(hours, minutes, 0, 0);
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

    function getRecommendedTable() {
        return orderTables.find((table) => table.capacity >= 1 && !isTableOccupied(table)) || null;
    }

    async function handleCreateReservation(event){
        event.preventDefault();
        if (!selectedTable) {
            showAlert("Selecione uma mesa para fazer a reserva.", "error");
            return;
        }
        if (!desiredTime) {
            showAlert("Selecione o horário desejado.", "error");
            return;
        }

        if (isTableOccupied(selectedTable)) {
            const recommendedTable = getRecommendedTable();
            showAlert(
                recommendedTable
                    ? `Mesa ${String(selectedTable.table_number).padStart(2, "0")} ocupada. Recomendamos a mesa ${String(recommendedTable.table_number).padStart(2, "0")}.`
                    : "Esta mesa está ocupada nesse horário e não há outra mesa livre.",
                "error",
            );
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);
        const [hours, minutes] = formData.get("startsAtHours").split(":").map(Number);
        const startsAt = new Date();
        startsAt.setHours(hours, minutes, 0, 0);
        const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

        const payload = {
            name: formData.get("name").trim(),
            quantityPeople: 1,
            startsAtDate: formatLocalDate(startsAt),
            startsAtHours: formatLocalDateTime(startsAt),
            endsAtDate: formatLocalDate(endsAt),
            endsAtHours: formatLocalDateTime(endsAt),
            tableId: selectedTable.id,
        };

        setIsSubmitting(true);
        try {
            await createReservation(payload);
            showAlert("Reserva criada com sucesso!", "success");
            setReservations((currentReservations) => [
                ...currentReservations,
                {
                    tableId: selectedTable.id,
                    status: "Pendente",
                    startsAtDate: payload.startsAtDate,
                    startsAtHours: payload.startsAtHours,
                    endsAtDate: payload.endsAtDate,
                    endsAtHours: payload.endsAtHours,
                },
            ]);
            setSelectedTable(null);
            setDesiredTime("");
            form.reset();
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            showAlert(error.message || "Erro ao criar reserva.", "error");
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
                                <input className='input-client-order-reserve' type="text" name="name" placeholder="Insira o nome do cliente..." aria-label="Nome do cliente" required />
                                <input
                                    className='input-client-order-reserve'
                                    style={{width:'300px'}}
                                    type="time"
                                    name="startsAtHours"
                                    aria-label="Horário inicial"
                                    value={desiredTime}
                                    onChange={(event)=>setDesiredTime(event.target.value)}
                                    required
                                />
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
                                            const tableTextColor = isSelected ? "white" : "black";

                                            return(
                                                <button 
                                                    type="button"
                                                    onClick={()=>setSelectedTable(table)}
                                                    className={`selected-table ${isSelected ? 'select' : isOccupied ? 'occupied' : 'not-select'}`} 
                                                    key={table.id}
                                                >
                                                    <p style={{color: tableTextColor}}><b>{String(table.table_number).padStart(2,"0")}</b></p>
                                                    <p style={{color: tableTextColor}}>{isOccupied ? "Ocupada" : "Livre"}</p>
                                                </button>
                                            )
                                        })
                                    ) : (
                                        <p>Nenhuma mesa encontrada.</p>
                                    )}
                                </div>
                            </div>
                            {desiredTime && selectedTable && isTableOccupied(selectedTable) && (() => {
                                const recommendedTable = getRecommendedTable();
                                return (
                                    <div className="reservation-recommendation">
                                        <span>
                                            Mesa {String(selectedTable.table_number).padStart(2,"0")} ocupada às {desiredTime}.
                                        </span>
                                        {recommendedTable ? (
                                            <button
                                                type="button"
                                                onClick={()=>setSelectedTable(recommendedTable)}
                                            >
                                                Usar mesa {String(recommendedTable.table_number).padStart(2,"0")}
                                            </button>
                                        ) : (
                                            <span>Nenhuma mesa livre neste horário.</span>
                                        )}
                                    </div>
                                );
                            })()}
                            <button disabled={isSubmitting || !selectedTable} type="submit" id='btn-select-table'>
                                {isSubmitting ? "Reservando..." : "Reservar"}
                            </button>
                        </form>
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

export default BookTable