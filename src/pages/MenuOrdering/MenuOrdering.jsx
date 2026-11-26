import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Utensils } from "lucide-react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import AlertModal from "../../components/AlertModal";
import { getMenu } from "../../services/menu";
import { addOrderItem, getOrderById } from "../../services/orders";
import './menu_ordering.css'

const CATEGORY_TABS = [
    { key: 'pratos', label: 'Pratos' },
    { key: 'bebidas', label: 'Bebidas' },
    { key: 'sobremesas', label: 'Sobremesas' },
];

function getTabKey(category) {
    if (category === 'Bebidas') return 'bebidas';
    if (category === 'Sobremesa') return 'sobremesas';
    return 'pratos';
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getImageUrl(item) {
    const raw = Array.isArray(item?.img) ? item.img[0] : item?.img;
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    return `${process.env.REACT_APP_API_URL}/${raw.startsWith('/') ? raw.slice(1) : raw}`;
}

function MenuOrdering() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    const [order, setOrder] = useState(null);
    const [menu, setMenu] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedTab, setSelectedTab] = useState('pratos');
    const [cart, setCart] = useState({});
    const [isSaving, setIsSaving] = useState(false);

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

        async function loadData() {
            setIsLoadingData(true);
            try {
                const [menuData, orderData] = await Promise.all([
                    getMenu(),
                    getOrderById(orderId),
                ]);
                setMenu(menuData.filter((item) => item.available !== false));
                setOrder(orderData);
            } catch (error) {
                console.error("Erro ao carregar cardápio e comanda:", error);
                showAlert(error.message || "Erro ao carregar cardápio e comanda.", "error");
            } finally {
                setIsLoadingData(false);
            }
        }
        loadData();
    }, [orderId, navigate])

    const visibleMenu = menu.filter((item) => getTabKey(item.category) === selectedTab);
    const cartItems = menu.filter((item) => cart[item.id]);
    const pendingTotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);
    const total = (order?.total_value ?? 0) + pendingTotal;

    function addToCart(menuId) {
        setCart((current) => ({ ...current, [menuId]: (current[menuId] || 0) + 1 }));
    }

    function removeFromCart(menuId) {
        setCart((current) => {
            const quantity = (current[menuId] || 0) - 1;
            const next = { ...current };
            if (quantity <= 0) {
                delete next[menuId];
            } else {
                next[menuId] = quantity;
            }
            return next;
        });
    }

    async function handleFinish() {
        const entries = Object.entries(cart);
        if (entries.length === 0) {
            showAlert("Adicione pelo menos um item à comanda.", "error");
            return;
        }

        setIsSaving(true);
        const remaining = { ...cart };
        try {
            for (const [menuId, quantity] of entries) {
                await addOrderItem(orderId, { menuId: Number(menuId), quantity });
                delete remaining[menuId];
            }
            showAlert("Pedido realizado com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao adicionar itens:", error);
            showAlert(error.message || "Erro ao adicionar itens.", "error");
        } finally {
            setCart(remaining);
            try {
                setOrder(await getOrderById(orderId));
            } catch (error) {
                console.error("Erro ao recarregar comanda:", error);
            }
            setIsSaving(false);
        }
    }

    function handleCloseOrder() {
        if (cartItems.length > 0) {
            showAlert("Há itens na lista que ainda não foram pedidos. Clique em Realizar pedido antes de finalizar a comanda.", "error");
            return;
        }
        navigate('/finish_ticket', { state: { orderId } });
    }

    const tableNumber = order?.table?.table_number;
    const ticketTitle = order
        ? `${order.nameClient}${tableNumber !== undefined ? ` - Mesa ${String(tableNumber).padStart(2, "0")}` : ''}`
        : 'Carregando...';
    const hasAnyItem = (order?.items?.length ?? 0) > 0 || cartItems.length > 0;

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main id="menu-ordering-page">
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="mo-container">
                    <div className="mo-top">
                        <button onClick={() => navigate('/order_ticket')} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                        <h1>CARDÁPIO</h1>
                    </div>

                    <div className="mo-tabs">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                type="button"
                                key={tab.key}
                                className={`mo-tab ${selectedTab === tab.key ? 'active' : ''}`}
                                onClick={() => setSelectedTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mo-layout">
                        <div className="mo-list">
                            {visibleMenu.length > 0 ? (
                                visibleMenu.map((item) => {
                                    const imageUrl = getImageUrl(item);
                                    const quantity = cart[item.id] || 0;

                                    return (
                                        <div
                                            className="mo-item"
                                            key={item.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => addToCart(item.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && addToCart(item.id)}
                                        >
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.name} className="mo-item-img" />
                                            ) : (
                                                <span className="mo-item-icon"><Utensils size={20} /></span>
                                            )}
                                            <div className="mo-item-info">
                                                <span className="mo-item-name">{item.name}</span>
                                                <span className="mo-item-price">{formatPrice(item.price)}</span>
                                            </div>
                                            <div className="mo-item-counter">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                                                >
                                                    -
                                                </button>
                                                <span>{quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); addToCart(item.id); }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : isLoadingData ? (
                                <p>Carregando itens do cardápio...</p>
                            ) : (
                                <p>Nenhum item nesta categoria.</p>
                            )}
                        </div>

                        <aside id="mo-ticket">
                            <div id="mo-ticket-tape"></div>
                            <h2>{ticketTitle}</h2>
                            <ul className="mo-ticket-list">
                                {(order?.items ?? []).map((item) => (
                                    <li key={`saved-${item.id}`} className="saved">
                                        <span>{item.quantity}x {item.menu?.name}</span>
                                        <span>{formatPrice(item.unit_price * item.quantity)}</span>
                                    </li>
                                ))}
                                {cartItems.map((item) => (
                                    <li key={`new-${item.id}`} className="pending">
                                        <span>{cart[item.id]}x {item.name}</span>
                                        <span>{formatPrice(item.price * cart[item.id])}</span>
                                    </li>
                                ))}
                                {!hasAnyItem && (
                                    <li className="empty">
                                        {isLoadingData ? "Carregando comanda..." : "Nenhum item ainda."}
                                    </li>
                                )}
                            </ul>
                            <p className="mo-ticket-total">Valor da comanda: <b>{formatPrice(total)}</b></p>
                            <div className="mo-ticket-actions"> <button id="mo-finish"
                                onClick={handleFinish} disabled={isSaving}>
                                {isSaving ? "Salvando..." : "Realizar pedido"}
                            </button>
                                <button id="mo-close-order" onClick={handleCloseOrder}
                                    disabled={isSaving}> Finalizar comanda
                                </button>
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

export default MenuOrdering
