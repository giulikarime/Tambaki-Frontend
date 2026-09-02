import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './menu.css'

function Menu(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const filterMenu_btn = ["Todos", "Cardápio do dia", "Almoço","Bebidas","Sobremesas"];
    const [filterMenuBtnIsClicked,setFilterMenuBtnIsClicked] = useState(0);
    
    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <section className="principal-container-cardapio">
                    <div id="menuHeader">
                        <h1>Cardápio</h1>
                        <div id="filters-container">
                            {filterMenu_btn.map((name,index)=>(
                                <button key={index} onClick={()=>setFilterMenuBtnIsClicked(index)} className={`btn-filtersMenu ${filterMenuBtnIsClicked === index ? 'clicked' : 'notClicked'}`}>{name}</button>
                            ))}
                            <button id="filter-items">Filtrar Itens</button>
                            <button id="add-item">+</button>
                        </div>
                    </div>
                    <div id="container-cards">

                        <div className="menuFood-card">
                            <img className="imgMenu" src="https://i.pinimg.com/736x/a7/4c/fb/a74cfb0b2ddcdece75fd3a26ab2bc6c7.jpg" alt="peixe empanado"></img>
                            <div className="menuCard-bottom">
                                <h2 className="menuTitle">Peixe Empanado</h2>
                                <p className="menuDescription">Acompanha arroz, feijão e salada.</p>
                                <h3 className="menuPrice">R$40,00</h3>
                            </div>
                        </div>

                        <div className="menuFood-card">
                            <img className="imgMenu" src="https://i.pinimg.com/1200x/dd/bb/7f/ddbb7fba9b7798655fe4068f8a424d75.jpg" alt="camarão na moranga"></img>
                            <div className="menuCard-bottom">
                            <h2 className="menuTitle">Camarão na Moranga e abublé</h2>
                            <p className="menuDescription">Peixe, leite de coco, dendê e coentro.</p>
                            <h3 className="menuPrice">R$40,00</h3>
                            </div>
                        </div>

                        <div className="menuFood-card">
                            <img className="imgMenu" src="https://i.pinimg.com/736x/a7/4c/fb/a74cfb0b2ddcdece75fd3a26ab2bc6c7.jpg" alt="peixe empanado"></img>
                            <div className="menuCard-bottom">
                                <h2 className="menuTitle">Peixe Empanado</h2>
                                <p className="menuDescription">Acompanha arroz, feijão e salada.</p>
                                <h3 className="menuPrice">R$40,00</h3>
                            </div>
                        </div>

                        <div className="menuFood-card">
                            <img className="imgMenu" src="https://i.pinimg.com/1200x/dd/bb/7f/ddbb7fba9b7798655fe4068f8a424d75.jpg" alt="camarão na moranga"></img>
                            <div className="menuCard-bottom">
                            <h2 className="menuTitle">Camarão na Moranga e abublé</h2>
                            <p className="menuDescription">Peixe, leite de coco, dendê e coentro.</p>
                            <h3 className="menuPrice">R$40,00</h3>
                            </div>
                        </div>

                        
                    </div>
                 </section>
            </main>
        </>

       



    );
}

export default Menu