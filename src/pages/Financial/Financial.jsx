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
import { getCosts, getCostsEnums, createCosts, editCosts } from '../../services/costs'
import AlertModals from "../../components/SucessModals/AlertModals";

function Financial(){

    const navigate = useNavigate();
    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);

    const presentDate = new Date();

    const month = new Date().toLocaleString('pt-BR', { month: 'long' });
    const year = presentDate.getFullYear();

    const cardsData = [
        {label: 'Custo de Mercadoria Vendida', value: 'R$ 38,2 k', subtitle: '4% vs. mês anterior', button: false, id: 'yellow', selected: 'CMV', action: ()=>setAddCMVModalIsOpen(!addCMVModalIsOpen)},
        {label: 'Custos Fixos e Variáveis', value: 'R$ 21,6 k', subtitle: '2% vs. mês anterior', button: true, id: 'orange', selected: 'Custos', action: ()=>setAddCostModalIsOpen(!addCostModalIsOpen)},
        {label: 'Lucro e Ponto de Equilíbrio', value: 'R$ 17,9 k', subtitle: 'Equilíbrio em 18 dias', button: true, id: 'blue', selected: 'Lucro', action: ()=>setAddProfitPointModalIsOpen(!addProfitPointModalIsOpen)},
        {label: 'Maiores Gastos dos Clientes', value: 'Rodízio', subtitle: '42% do faturamento', button: false, id: 'dark-blue', selected: 'Clientes', action: ()=>setAddClientCostModalIsOpen(!addClientCostModalIsOpen)}
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

    const [myCosts,setMyCosts] = useState([]);
    const [selectedCost,setSelectedCost] = useState('');

    async function handleGetCosts() {
        try {
            const cost_value = await getCosts();
            setMyCosts(cost_value);
        } catch (error) {
            console.error("Não foi possível carregar os custos.", error);
        }
    }

    useEffect(()=>{
        handleGetCosts();
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
                            <div className="groups-top-container">
                                <button
                                    className="btn-stock-base">Gerenciar Custos e Lucro
                                </button>
                                <button
                                    onClick={()=>setFilterModalIsOpen(!filterModalIsOpen)}
                                    className="btn-stock-base btn-funnel-base">Filtrar <Funnel size={20}></Funnel>
                                </button>
                            </div>
                        </div>
                        <p style={{ color: '#777171ff' }}>Unidade XYZ - {month.charAt(0).toUpperCase() + month.slice(1)} {year}</p>
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
                                    {card.button ? <button
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
                        {selectCard === 'CMV' ? (<CMV/>) : selectCard === 'Custos' ? (<Costs/>) : selectCard === 'Lucro' ? (<ProfitPoint/>) : selectCard === 'Clientes' ? (<ClientsCosts/>) : null}
                    </div>
                </div>

                <Modal
                    isOpen={addCostModalIsOpen}
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