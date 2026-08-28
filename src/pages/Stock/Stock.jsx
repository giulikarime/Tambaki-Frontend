import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './stock.css'
import '../../App.css'
import { ChevronLeft, Plus, Funnel } from "lucide-react";

function Stock(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const filter_btn = ["Todos","Estoque Saudável","Próximo de Acabar","Em Falta","Perto do Vencimento"];
    const [filterBtnIsClicked,setFilterBtnIsClicked] = useState(0);

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu">
                    <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                        <div id="top-container">
                            <div className="groups-top-container">
                                <button className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                                <h1>Estoque</h1>
                            </div>

                            <div className="groups-top-container">
                                <button id='btn-plus-stock'><Plus></Plus></button>
                                <button className="btn-stock-base">Dar Entrada</button>
                                <button className="btn-stock-base">Dar Baixa</button>
                                <button id='btn-funnel-base' className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                            </div>
                        </div>
                        <p style={{color:'#777171ff'}}>X itens monitorados - x em falta - x próximos de acabar</p>
                    </div>
                    <div id="filters-container">
                        {filter_btn.map((name,index)=>(
                            <button key={index} onClick={()=>setFilterBtnIsClicked(index)} className={`btn-filters ${filterBtnIsClicked === index ? 'clicked' : 'notClicked'}`}>{name}</button>
                        ))}
                    </div>
                </div>  
            </main>
        </>
    );
}

export default Stock