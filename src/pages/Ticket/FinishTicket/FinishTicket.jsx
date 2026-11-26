import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Header from "../../../components/HeaderAndSidebar/Header";
import Sidebar from "../../../components/HeaderAndSidebar/Sidebar";
import AlertModal from "../../../components/AlertModal";
import { closeOrder, getOrderById } from "../../../services/orders";
import './finish_ticket.css'

const PAYMENT_METHODS = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'];

function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseMoney(text) {
    const raw = String(text).trim();
    if (!raw) return { value: 0, valid: true };
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    const value = Number(normalized);
    return { value, valid: Number.isFinite(value) && value >= 0 };
}

function FinishTicket() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    const [order, setOrder] = useState(null);
    const [discountText, setDiscountText] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [alertPhrase, setAlertPhrase] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    function showAlert(phrase, type) {
        setAlertPhrase(phrase);
        setAlertType(type);
        setAlertModalIsOpen(true);
    }

    useEffect(() => {
        if (orderId === undefined) {
            navigate('/order_ticket', { replace: true });
            return;
        }

        async function loadOrder() {
            try {
                const orderData = await getOrderById(orderId);
                setOrder(orderData);
                if (orderData.status !== 'Aberta') {
                    setIsFinished(true);
                    showAlert("Esta comanda já foi finalizada.", "error");
                }
            } catch (error) {
                console.error("Erro ao carregar comanda:", error);
                showAlert(error.message || "Erro ao carregar comanda.", "error");
            }
        }
        loadOrder();
    }, [orderId, navigate])

    // Depois de finalizar, volta para Abrir Comanda quando o aviso for fechado
    useEffect(() => {
        if (isFinished && !alertModalIsOpen) {
            navigate('/order_ticket');
        }
    }, [isFinished, alertModalIsOpen, navigate])

    const groupedItems = Object.values(
        (order?.items ?? []).reduce((acc, item) => {
            const key = item.menuId ?? item.menu?.id;
            if (!acc[key]) {
                acc[key] = { key, name: item.menu?.name ?? 'Item', quantity: 0, total: 0 };
            }
            acc[key].quantity += item.quantity;
            acc[key].total += item.unit_price * item.quantity;
            return acc;
        }, {})
    );

    const subtotal = groupedItems.reduce((sum, item) => sum + item.total, 0);
    const parsedDiscount = parseMoney(discountText);
    const discount = parsedDiscount.valid ? parsedDiscount.value : 0;
    const discountTooBig = discount > subtotal;
    const total = Math.max(subtotal - discount, 0);

    async function handleFinalize() {
        if (!parsedDiscount.valid) {
            showAlert("Informe um desconto válido.", "error");
            return;
        }
        if (discountTooBig) {
            showAlert("O desconto não pode ser maior que o subtotal.", "error");
            return;
        }
        if (!paymentMethod) {
            showAlert("Selecione o método de pagamento.", "error");
            return;
        }

        setIsSaving(true);
        try {
            await closeOrder(orderId);
            setIsFinished(true);
            showAlert("Comanda finalizada!", "success");
        } catch (error) {
            console.error("Erro ao finalizar comanda:", error);
            showAlert(error.message || "Erro ao finalizar comanda.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    const tableNumber = order?.table?.table_number;
    const tableLine = order
        ? `${order.nameClient}${tableNumber !== undefined ? ` - Mesa ${String(tableNumber).padStart(2, "0")} selecionada` : ''} - ID: ${order.id}`
        : 'Carregando...';

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main id="finish-ticket-page">
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="ft-container">
                    <div className="ft-top">
                        <button
                            onClick={() => navigate('/menu_ordering', { state: { orderId } })}
                            className="btn-back-base"
                        >
                            <ChevronLeft></ChevronLeft>
                        </button>
                        <h1>Finalizando Comanda</h1>
                    </div>

                    <div className="ft-layout">
                        <section id="ft-card">
                            <h2>Comanda</h2>
                            <p className="ft-card-sub">{tableLine}</p>

                            <ul className="ft-items">
                                {groupedItems.length > 0 ? (
                                    groupedItems.map((item) => (
                                        <li key={item.key}>
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{formatPrice(item.total)}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="ft-empty">Nenhum item nesta comanda.</li>
                                )}
                            </ul>

                            <div className="ft-divider"></div>

                            <div className="ft-line">
                                <span>Sub Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="ft-line">
                                <span>Desconto</span>
                                <span>{formatPrice(discountTooBig ? 0 : discount)}</span>
                            </div>
                            <div className="ft-line ft-total">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            <button
                                id="ft-finalize"
                                onClick={handleFinalize}
                                disabled={isSaving || isFinished}
                            >
                                {isSaving ? "Finalizando..." : "Finalizar Comanda"}
                            </button>
                        </section>

                        <aside id="ft-options">
                            <label htmlFor="ft-discount">Inserir Desconto</label>
                            <input
                                id="ft-discount"
                                type="text"
                                inputMode="decimal"
                                placeholder="Insira um valor..."
                                value={discountText}
                                onChange={(e) => setDiscountText(e.target.value)}
                            />
                            {(!parsedDiscount.valid || discountTooBig) && (
                                <p className="ft-error">
                                    {!parsedDiscount.valid
                                        ? "Digite um valor válido, por exemplo 15,00."
                                        : "O desconto é maior que o subtotal."}
                                </p>
                            )}

                            <label htmlFor="ft-payment">Método de Pagamento</label>
                            <div className="ft-select-wrap">
                                <select
                                    id="ft-payment"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="">Selecione uma opção</option>
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} />
                            </div>
                        </aside>
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

export default FinishTicket