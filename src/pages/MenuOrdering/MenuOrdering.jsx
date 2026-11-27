import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Utensils } from "lucide-react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import AlertModals from "../../components/SucessModals/AlertModals";
import { getMenu, getMenuEnums } from "../../services/menu";
import {
    addOrderItem,
    createOrder,
    getOrderById,
    updateOrderItem,
} from "../../services/orders";
import { formatMenuCategoryLabel } from "../../utils/clientsCostsUtils";
import './menu_ordering.css'

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
    const isDraggingTabs = useRef(false);
    const hasDraggedTabs = useRef(false);
    const dragStartX = useRef(0);
    const initialScrollLeft = useRef(0);

    const navigate = useNavigate();
    const location = useLocation();
    const routeOrderId = location.state?.orderId;
    const draftOrder = location.state?.draftOrder;
    const [activeOrderId, setActiveOrderId] = useState(routeOrderId ?? null);
    const [draftClientName, setDraftClientName] = useState(draftOrder?.nameClient ?? "");

    const [order, setOrder] = useState(null);
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedTab, setSelectedTab] = useState('');
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

    function handleTabsMouseDown(event) {
        if (event.button !== 0) return;
        isDraggingTabs.current = true;
        hasDraggedTabs.current = false;
        dragStartX.current = event.clientX;
        initialScrollLeft.current = event.currentTarget.scrollLeft;
    }

    function handleTabsMouseMove(event) {
        if (!isDraggingTabs.current) return;
        const distance = event.clientX - dragStartX.current;
        if (Math.abs(distance) > 4) {
            hasDraggedTabs.current = true;
            event.currentTarget.classList.add('dragging');
            event.preventDefault();
            event.currentTarget.scrollLeft = initialScrollLeft.current - distance;
        }
    }

    function handleTabsMouseUp(event) {
        if (!isDraggingTabs.current) return;
        isDraggingTabs.current = false;
        event.currentTarget.classList.remove('dragging');
        if (hasDraggedTabs.current) {
            window.setTimeout(() => {
                hasDraggedTabs.current = false;
            }, 0);
        }
    }

    function selectCategory(category) {
        if (hasDraggedTabs.current) {
            hasDraggedTabs.current = false;
            return;
        }
        setSelectedTab(category);
    }

    useEffect(() => {
        if (routeOrderId === undefined && !draftOrder) {
            navigate('/order_ticket', { replace: true });
            return;
        }

        async function loadData() {
            setIsLoadingData(true);
            try {
                const [menuData, menuEnums] = await Promise.all([
                    getMenu(),
                    getMenuEnums(),
                ]);
                const orderData = routeOrderId === undefined
                    ? null
                    : await getOrderById(routeOrderId);
                const categoryEnums = menuEnums.category;
                setCategories(categoryEnums);
                setSelectedTab((current) =>
                    categoryEnums.includes(current) ? current : categoryEnums[0] ?? '',
                );
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
    }, [routeOrderId, draftOrder, navigate])

    const visibleMenu = menu.filter((item) => item.category === selectedTab);
    const cartItems = menu.filter((item) => cart[item.id]);
    const pendingTotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);
    const total = (order?.total_value ?? 0) + pendingTotal;
    const normalizedDraftClientName = draftClientName.trim();

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

    function getSavedQuantity(menuId) {
        return (order?.items ?? []).reduce((total, item) => (
            item.menuId === menuId || item.menu?.id === menuId
                ? total + item.quantity
                : total
        ), 0);
    }

    async function removeOrderItem(menuId) {
        const pendingQuantity = cart[menuId] || 0;
        if (pendingQuantity > 0) {
            removeFromCart(menuId);
            return;
        }

        const savedItem = [...(order?.items ?? [])].reverse().find(
            (item) => item.menuId === menuId || item.menu?.id === menuId,
        );
        if (!savedItem || activeOrderId === null || isSaving) return;

        setIsSaving(true);
        try {
            const response = await updateOrderItem(activeOrderId, savedItem.id, {
                quantity: savedItem.quantity - 1,
            });
            setOrder(response.order);
        } catch (error) {
            console.error("Erro ao remover item da comanda:", error);
            showAlert(error.message || "Erro ao remover item da comanda.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleFinish() {
        const entries = Object.entries(cart);
        if (entries.length === 0) {
            if (activeOrderId !== null) {
                navigate("/open_all_tickets");
                return;
            }
            showAlert("Adicione pelo menos um item à comanda.", "error");
            return;
        }
        if (activeOrderId === null && !normalizedDraftClientName) {
            showAlert("Informe o nome da pessoa antes de realizar o pedido.", "error");
            return;
        }

        setIsSaving(true);
        const remaining = { ...cart };
        let orderIdToUpdate = activeOrderId;
        try {
            if (orderIdToUpdate === null) {
                const response = await createOrder({
                    nameClient: normalizedDraftClientName,
                    tableId: draftOrder.tableId,
                    service_type: "Mesa",
                });
                if (!response.order?.id) {
                    throw new Error("A comanda não foi criada.");
                }
                orderIdToUpdate = response.order.id;
                setActiveOrderId(orderIdToUpdate);
                setOrder(response.order);
            }

            for (const [menuId, quantity] of entries) {
                await addOrderItem(orderIdToUpdate, { menuId: Number(menuId), quantity });
                delete remaining[menuId];
            }
            showAlert("Pedido realizado com sucesso!", "success");
            navigate("/open_all_tickets");
        } catch (error) {
            console.error("Erro ao adicionar itens:", error);
            showAlert(error.message || "Erro ao adicionar itens.", "error");
        } finally {
            setCart(remaining);
            if (orderIdToUpdate !== null) {
                try {
                    setOrder(await getOrderById(orderIdToUpdate));
                } catch (error) {
                    console.error("Erro ao recarregar comanda:", error);
                }
            }
            setIsSaving(false);
        }
    }

    function handleCloseOrder() {
        if (cartItems.length > 0) {
            showAlert("Há itens na lista que ainda não foram pedidos. Clique em Realizar pedido antes de finalizar a comanda.", "error");
            return;
        }
        if (activeOrderId === null) {
            showAlert("Adicione itens e clique em Realizar pedido antes de finalizar a comanda.", "error");
            return;
        }
        navigate('/finish_ticket', { state: { orderId: activeOrderId } });
    }

    const tableNumber = order?.table?.table_number ?? draftOrder?.tableNumber;
    const clientName = order?.nameClient ?? normalizedDraftClientName;
    const ticketTitle = clientName
        ? `${clientName}${tableNumber !== undefined ? ` - Mesa ${String(tableNumber).padStart(2, "0")}` : ''}`
        : `Nova Comanda${tableNumber !== undefined ? ` - Mesa ${String(tableNumber).padStart(2, "0")}` : ''}`;
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

                    <div
                        className="mo-tabs"
                        onMouseDown={handleTabsMouseDown}
                        onMouseMove={handleTabsMouseMove}
                        onMouseUp={handleTabsMouseUp}
                        onMouseLeave={handleTabsMouseUp}
                    >
                        {categories.map((category) => (
                            <button
                                type="button"
                                key={category}
                                className={`mo-tab ${selectedTab === category ? 'active' : ''}`}
                                onClick={() => selectCategory(category)}
                            >
                                {formatMenuCategoryLabel(category)}
                            </button>
                        ))}
                    </div>

                    <div className="mo-layout">
                        <div className="mo-list">
                            {visibleMenu.length > 0 ? (
                                visibleMenu.map((item) => {
                                    const imageUrl = getImageUrl(item);
                                    const quantity = getSavedQuantity(item.id) + (cart[item.id] || 0);

                                    return (
                                        <div
                                            className="mo-item"
                                            key={item.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => !isSaving && addToCart(item.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && !isSaving && addToCart(item.id)}
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
                                                    disabled={isSaving || quantity === 0}
                                                    onClick={(e) => { e.stopPropagation(); removeOrderItem(item.id); }}
                                                >
                                                    -
                                                </button>
                                                <span>{quantity}</span>
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
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
                            {activeOrderId === null && draftOrder && !draftOrder.nameClient?.trim() && (
                                <div className="mo-client-name">
                                    <label htmlFor="mo-client-name-input">Nome da pessoa</label>
                                    <input
                                        id="mo-client-name-input"
                                        type="text"
                                        value={draftClientName}
                                        onChange={(event) => setDraftClientName(event.target.value)}
                                        placeholder="Insira o nome..."
                                        autoComplete="off"
                                    />
                                </div>
                            )}
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
                            </div>
                        </aside>
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

export default MenuOrdering
