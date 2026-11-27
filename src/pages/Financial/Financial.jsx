import { useEffect, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './financial.css'
import { ChevronLeft, Funnel, Plus} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CMV from "../../components/CMV/CMV";
import Costs from "../../components/Costs/Costs";
import ClientsCosts from "../../components/ClientsCosts/ClientsCosts";
import ProfitPoint from "../../components/ProfitPoint/ProfitPoint";
import Modal from 'react-modal'
import { getCosts, getCostsEnums, getFinancialProducts, createCosts, editCosts, deleteCosts } from '../../services/costs'
import { getOrders } from '../../services/orders';
import { getMenu } from '../../services/menu';
import AlertModals from "../../components/SucessModals/AlertModals";
import {
    calcularTendenciaMensal,
    formatCompactCurrency,
    somarCustosFixosEVariaveis,
} from "../../utils/costsUtils";
import {
    calcularFaturamento,
    calcularLucro,
    calcularPontoDeEquilibrioDias,
    somarCustoProdutos,
} from "../../utils/profitUtils";
import { calcularMaiorCategoriaClientes } from "../../utils/clientsCostsUtils";
import { calcularTendenciaCmvMensal, separarCmvPorMesesDeCustos, somarCmvDosCustos } from "../../utils/cmvUtils";
import { canEditResource, getAccessLevel } from "../../utils/access";
import { getCmvPlannings, saveCmvPlanning } from "../../services/cmvPlanning";

function Financial(){

    const navigate = useNavigate();
    const canEditCosts = canEditResource('costs');
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const presentDate = new Date();

    const month = new Date().toLocaleString('pt-BR', { month: 'long' });
    const year = presentDate.getFullYear();

    const [myCosts,setMyCosts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [myMenu, setMyMenu] = useState([]);
    const [cmvPlannings, setCmvPlannings] = useState([]);
    const [loadingCosts, setLoadingCosts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCmvPlannings, setLoadingCmvPlannings] = useState(true);
    const [isSavingCmvPlanning, setIsSavingCmvPlanning] = useState(false);
    const [costsLoaded, setCostsLoaded] = useState(false);
    const [ordersLoaded, setOrdersLoaded] = useState(false);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [selectedCost,setSelectedCost] = useState('');

    const totalCombinedCosts = somarCustosFixosEVariaveis(myCosts);
    const combinedCostsTrend = calcularTendenciaMensal(myCosts);
    const totalRevenue = calcularFaturamento(myOrders);
    const totalProductCost = somarCustoProdutos(myProducts);

    const cmvFromCosts = somarCmvDosCustos(myCosts);              // <- aqui, depois do totalProductCost
    const hasCostCmv = cmvFromCosts > 0;
    const totalCmv = hasCostCmv ? cmvFromCosts : totalProductCost;
    const cmvTrend = calcularTendenciaCmvMensal(
        myProducts, year, hasCostCmv ? separarCmvPorMesesDeCustos(myCosts, year) : null
    );

    const totalProfit = calcularLucro(totalRevenue, totalCombinedCosts);
    // ... resto igual

    async function handleGetCosts() {
        setLoadingCosts(true);
        try {
            const cost_value = await getCosts();
            setMyCosts(Array.isArray(cost_value) ? cost_value : []);
            setCostsLoaded(true);
        } catch (error) {
            console.error("Não foi possível carregar os custos.", error);
        } finally {
            setLoadingCosts(false);
        }
    }

    async function handleGetOrdersAndProducts() {
        setLoadingOrders(true);
        setLoadingProducts(true);

        const [ordersRes, productsRes, menuRes, cmvPlanningsRes] = await Promise.allSettled([
            getOrders(),
            getFinancialProducts(),
            getAccessLevel() === 'Master' ? getMenu() : Promise.resolve([]),
            getCmvPlannings(year),
        ]);

        if (ordersRes.status === 'fulfilled') {
            setMyOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
            setOrdersLoaded(true);
        } else {
            console.error("Não foi possível carregar as comandas.", ordersRes.reason);
        }
        setLoadingOrders(false);

        if (productsRes.status === 'fulfilled') {
            setMyProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
            setProductsLoaded(true);
        } else {
            console.error("Não foi possível carregar os produtos.", productsRes.reason);
        }
        setLoadingProducts(false);

        if (menuRes.status === 'fulfilled') {
            setMyMenu(Array.isArray(menuRes.value) ? menuRes.value : []);
        } else {
            console.error("Não foi possível carregar o cardápio.", menuRes.reason);
        }

        if (cmvPlanningsRes.status === 'fulfilled') {
            setCmvPlannings(Array.isArray(cmvPlanningsRes.value) ? cmvPlanningsRes.value : []);
        } else {
            console.error("Não foi possível carregar o planejamento de CMV.", cmvPlanningsRes.reason);
            setFormError(cmvPlanningsRes.reason?.message || "Não foi possível carregar o planejamento de CMV.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
        setLoadingCmvPlannings(false);
    }
    const breakEvenDays = calcularPontoDeEquilibrioDias({
        faturamento: totalRevenue,
        cmv: totalProductCost,
        costs: myCosts,
    });
    const topCategoryInfo = calcularMaiorCategoriaClientes(myOrders, myMenu);

    const profitSubtitle = loadingOrders
        ? 'Carregando dados...'
        : !ordersLoaded
            ? 'Indisponível no momento'
            : breakEvenDays === null
                ? 'Sem vendas suficientes'
                : breakEvenDays === 0
                    ? 'Sem custos fixos'
                    : `Equilíbrio em ${breakEvenDays} ${breakEvenDays === 1 ? 'dia' : 'dias'}`;

    const cardsData = [
        {
            label: 'Custo de Mercadoria Vendida',
            value: (loadingProducts || loadingCosts) ? '...' : (productsLoaded || costsLoaded) ? formatCompactCurrency(totalCmv) : '--',
            subtitle: loadingProducts ? 'Carregando dados...' : productsLoaded ? `${cmvTrend.percentChange}% vs. mês anterior` : 'Indisponível no momento',
            button: true,
            id: 'yellow',
            selected: 'CMV',
            action: ()=>setAddCMVModalIsOpen(!addCMVModalIsOpen),
        },
        {
            label: 'Custos Fixos e Variáveis',
            value: loadingCosts ? '...' : costsLoaded ? formatCompactCurrency(totalCombinedCosts) : '--',
            subtitle: loadingCosts ? 'Carregando dados...' : costsLoaded ? `${combinedCostsTrend.percentChange}% vs. mês anterior` : 'Indisponível no momento',
            button: true,
            id: 'orange',
            selected: 'Custos',
            action: ()=>setAddCostModalIsOpen(!addCostModalIsOpen),
        },
        {
            label: 'Lucro e Ponto de Equilíbrio',
            value: (loadingOrders || loadingCosts) ? '...' : (ordersLoaded && costsLoaded) ? formatCompactCurrency(totalProfit) : '--',
            subtitle: profitSubtitle,
            button: false,
            id: 'blue',
            selected: 'Lucro',
            action: ()=>setAddProfitPointModalIsOpen(!addProfitPointModalIsOpen),
        },
        {
            label: 'Maiores Gastos dos Clientes',
            value: loadingOrders ? '...' : ordersLoaded ? topCategoryInfo.categoryLabel : '--',
            subtitle: loadingOrders ? 'Carregando dados...' : ordersLoaded ? `${topCategoryInfo.percentage}% do faturamento` : 'Indisponível no momento',
            button: false,
            id: 'dark-blue',
            selected: 'Clientes',
            action: ()=>setAddClientCostModalIsOpen(!addClientCostModalIsOpen),
        }
    ];

    const costsLabelData = [
        {label: 'Custo', mode: 'input', type: 'text', placeholder: 'Ex.: Aluguel', placeholderEdit: 'name'},
        {label: 'Categoria', mode: 'select', placeholderEdit: 'costCategory'},
        {label: 'Valor', mode: 'input', type: 'number', placeholder: 'Ex.: 3500,00', placeholderEdit: 'amount', step: 0.01},
        {label: 'Tipo de Custo', mode: 'select', placeholderEdit: 'costType'},
    ]

    const [costEnums, setCostsEnums] = useState({
        costCategory: [],
        costType: []
    });

    useEffect(()=>{
        handleGetCosts();
        handleGetOrdersAndProducts();
    },[])

    useEffect(() => {
        async function get_enums() {
            try {
                const enums_costs = await getCostsEnums();
                setCostsEnums(enums_costs);
            } catch (error) {
                console.error("Erro ao carregar os dados dos formulários.", error);
            }
        }
        get_enums();
    }, []);

    const [addCostModalIsOpen, setAddCostModalIsOpen] = useState(false);
    const [addCMVModalIsOpen, setAddCMVModalIsOpen] = useState(false);
    const [addProfitPointModalIsOpen, setAddProfitPointModalIsOpen] = useState(false);
    const [addClientCostModalIsOpen, setAddClientCostModalIsOpen] = useState(false);

    const [selectCard,setSelectedCard] = useState('CMV');

    const [filterModalIsOpen,setFilterModalIsOpen] = useState(false);

    async function handleCreateCost(event) {
        event.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(event.target);
        const payload = {
            name: formData.get('name'),
            costCategory: formData.get('costCategory'),
            amount: Number(formData.get('amount')),
            costType: formData.get('costType'),
            date: new Date()
        };

        try {
            await createCosts(payload);
            await handleGetCosts();
            setAddCostModalIsOpen(false);
            event.target.reset();
            setFormSuccess("Custo criado com sucesso!");
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error) {
            setFormError(error.message || "Erro ao cadastrar o custo.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleCreateCmvPlanning(event) {
        event.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
            year: Number(formData.get('year')),
            month: Number(formData.get('month')),
            plannedAmount: Number(formData.get('plannedAmount')),
        };

        if (
            !Number.isInteger(payload.year) ||
            !Number.isInteger(payload.month) ||
            !Number.isFinite(payload.plannedAmount) ||
            payload.plannedAmount < 0
        ) {
            setFormError("Informe mês, ano e uma meta de CMV válida.");
            setAlertType('error');
            setAlertModalIsOpen(true);
            return;
        }

        setIsSavingCmvPlanning(true);
        try {
            const savedPlanning = await saveCmvPlanning(payload);
            setCmvPlannings((current) => [
                ...current.filter(
                    (planning) => planning.year !== savedPlanning.year || planning.month !== savedPlanning.month,
                ),
                ...(savedPlanning.year === year ? [savedPlanning] : []),
            ].sort((a, b) => a.month - b.month));
            setAddCMVModalIsOpen(false);
            form.reset();
            setFormSuccess("Planejamento de CMV salvo com sucesso!");
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error) {
            setFormError(error.message || "Erro ao salvar o planejamento de CMV.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        } finally {
            setIsSavingCmvPlanning(false);
        }
    }

    async function handleEditCost(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setAlertType('');

        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name') || selectedCost.name,
            costCategory: formData.get('costCategory') || selectedCost.costCategory,
            amount: Number(formData.get('amount')) || selectedCost.amount,
            costType: formData.get('costType') || selectedCost.costType,
            date: new Date()
        };

        try {
            await editCosts(payload,selectedCost.id);
            setEditCostModalIsOpen(false);
            e.target.reset();
            setFormSuccess("Custo editado com sucesso!");
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error) {
            setFormError(error.message || "Erro ao editar o custo.");
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteCosts(selectedCost) {
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        try {
            await deleteCosts(selectedCost.id);
            await handleGetCosts();
            setFormSuccess(`${selectedCost.name} deletado(a) com sucesso.`);
            setAlertType('success');
            setAlertModalIsOpen(true);
        } catch (error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    const modalStyle = {
        overlay: {
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'absolute',
            overflowY: 'auto',
            maxHeight: '90vh',
            minWidth: '20vw',
            scrollbarWidth: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }
    }

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div className="container">
                            <div style={{display:'flex',flexDirection:'row',gap: 15,alignItems:'center'}}>
                                <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft></ChevronLeft></button>
                                <h1>Dashboard Financeiro</h1>
                            </div>
                        </div>
                        <p style={{ color: '#777171ff' }}>Unidade Sabor&Cia - {month.charAt(0).toUpperCase() + month.slice(1)} {year}</p>
                    </div>
                    <div className="cards-dashboard">
                        {cardsData.map((card,index)=>(
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={()=>setSelectedCard(card.selected)}
                                key={index} 
                                className={`card-value ${card.id}`}>
                                <h2>{card.label}</h2>
                                <div className="card-value-container">
                                    <p className="subtitle-card">{card.value}</p>
                                    {card.button && canEditCosts ? <button
                                                    type="button"
                                                     className="btn-add-card-value"
                                                     onClick={(e)=>{
                                                        e.stopPropagation();
                                                        card.action();
                                                    }}
                                                     ><Plus></Plus></button> : ''}
                                </div>
                                <p>{card.subtitle}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        {selectCard === 'CMV' ? (
                            <CMV
                                products={myProducts}
                                orders={myOrders}
                                costs={myCosts}
                                plannings={cmvPlannings}
                                loading={loadingProducts || loadingOrders || loadingCmvPlannings || loadingCosts}
                            />
                        ) : selectCard === 'Custos' ? (
                            <Costs costs={myCosts} loading={loadingCosts} />
                        ) : selectCard === 'Lucro' ? (
                            <ProfitPoint orders={myOrders} costs={myCosts} products={myProducts} loading={loadingCosts || loadingOrders} />
                        ) : selectCard === 'Clientes' ? (
                            <ClientsCosts orders={myOrders} menu={myMenu} products={myProducts} loading={loadingOrders} />
                        ) : null}
                    </div>
                </div>

                <Modal
                    isOpen={canEditCosts && addCMVModalIsOpen}
                    onRequestClose={() => setAddCMVModalIsOpen(false)}
                    contentLabel="Planejamento mensal de CMV"
                    style={modalStyle}
                >
                    <div className="top-container">
                        <div className="group-one-top-container">
                            <h2>Planejamento mensal de CMV</h2>
                            <button
                                type="button"
                                onClick={() => setAddCMVModalIsOpen(false)}
                                style={{ fontSize: 30 }}
                            >&times;</button>
                        </div>
                        <p style={{ fontSize: 15, color: '#777171ff' }}>
                            Defina a meta mensal em reais para comparar com o CMV realizado.
                        </p>
                    </div>
                    <form className="form-add-costs" onSubmit={handleCreateCmvPlanning}>
                        <div className="container-form">
                            <div className="fields">
                                <label htmlFor="cmv-planning-month">Mês</label>
                                <select id="cmv-planning-month" className="input-select-model" name="month" defaultValue={presentDate.getMonth() + 1} required>
                                    {Array.from({ length: 12 }, (_, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {new Date(2000, index, 1).toLocaleString('pt-BR', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="fields">
                                <label htmlFor="cmv-planning-year">Ano</label>
                                <input id="cmv-planning-year" className="input-select-model" type="number" name="year" min="2000" max="3000" step="1" defaultValue={year} required />
                            </div>
                            <div className="fields">
                                <label htmlFor="cmv-planning-amount">Meta de CMV (R$)</label>
                                <input id="cmv-planning-amount" className="input-select-model" type="number" name="plannedAmount" min="0" step="0.01" placeholder="Ex.: 15000,00" required />
                            </div>
                            <div className="fields">
                                <label style={{ color: 'white' }} htmlFor="">.</label>
                                <button className="btn-modal-submit menu" type="submit" disabled={isSavingCmvPlanning}>
                                    {isSavingCmvPlanning ? "Salvando..." : "Salvar planejamento"}
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={canEditCosts && addCostModalIsOpen}
                    shouldCloseOnOverlayClick={true}
                    onRequestClose={()=>setAddCostModalIsOpen(!addCostModalIsOpen)}
                    contentLabel="Adicionar custo"
                    style={modalStyle}
                >
                    <div className="top-container">
                        <div className="group-one-top-container">
                            <h2>Adicionar Custo</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setAddCostModalIsOpen(false)
                                }}
                                style={{ fontSize: 30 }}
                            >&times;</button>
                        </div>
                        <p style={{'fontSize': 15,'color': '#777171ff'}}>Adicione os seus custos fixos e variáveis.</p>
                    </div>
                    <form className="form-add-costs" onSubmit={handleCreateCost}>
                        <div className="container-form">
                            {costsLabelData.map((item, index) => (
                                <div key={index}>
                                    {item.mode === "input" ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <input step={item.step} className="input-select-model" type={item.type} name={item.placeholderEdit} placeholder={item.placeholder} required />
                                        </div>
                                    ) : item.mode === 'textarea' ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <textarea className="input-select-model" name={item.placeholderEdit} placeholder={item.placeholder} ></textarea>
                                        </div>
                                    ) : item.mode === 'select' && item.placeholderEdit === 'costCategory' ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <select className="input-select-model" name={item.placeholderEdit}>
                                                {(costEnums?.costCategory ?? []).map((cat, i) => (
                                                    <option value={cat} key={i}>{String(cat.replaceAll('_', ' '))}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : item.mode === 'select' && item.placeholderEdit === 'costType' ? (
                                        <div className="fields">
                                            <label>{item.label}</label>
                                            <select className="input-select-model" name={item.placeholderEdit}>
                                                {(costEnums?.costType ?? []).map((type, i) => (
                                                    <option value={type} key={i}>{String(type.replaceAll('_', ' '))}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            <div className="fields">
                                <label style={{color: 'white'}} htmlFor="">.</label>
                                <button className="btn-modal-submit menu" type="submit">Salvar</button>
                            </div>
                        </div>
                    </form>
                </Modal>

                <AlertModals
                    phrase={formSuccess ? formSuccess : formError}
                    isOpen={alertModalIsOpen}
                    type={alertType}
                    setIsOpen={setAlertModalIsOpen}
                />
            </main>
        </>
    );
}

export default Financial;