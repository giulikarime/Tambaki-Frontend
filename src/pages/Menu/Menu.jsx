import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import MenuCard from "./MenuCard";
import ModalMenu from "./ModalMenu";
import {Plus} from "lucide-react";
import './menu.css'

function Menu() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [addMenuModalIsOpen, setAddMenuModalIsOpen] = useState(false);
    const [dishes, setDishes] = useState([
        {
            id: 1,
            img: "https://i.pinimg.com/1200x/a7/4c/fb/a74cfb0b2ddcdece75fd3a26ab2bc6c7.jpg",
            name: "Peixe Empanado",
            description: "Acompanha arroz, feijão e salada.",
            price: 40.0,
        },
        {
            id: 2,
            img: "https://i.pinimg.com/736x/76/68/53/766853a7890437dfc7683a499a0f1b46.jpg",
            name: "Moqueca de Peixe",
            description: "Peixe, leite de coco, dendê e coentro.",
            price: 40.0,
        },
        {
            id: 3,
            img: "https://i.pinimg.com/736x/5b/ba/18/5bba1864e65d71a4c12746592eb04150.jpg",
            name: "Camarão na Moranga",
            description: "Camarão cremoso servido na abóbora.",
            price: 40.0,
        }
    ]);

    // Chama pelo ModalMenu quando o usuário clica em "Adicionar prato"
    function addDish(dish) {
        setDishes((current) => [...current, { ...dish, id: Date.now() }]);
    }

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <section className="principal-container-cardapio">
                    <div id="menu-header">
                        <h1>Cardápio</h1>
                        <button className="botao-adicionar" onClick={() => setAddMenuModalIsOpen(true)}>
                            <Plus></Plus>
                        </button>
                    </div>
                    <div id="menu-header-bottom"></div>

                    <div id="container-cards">
                        {dishes.map((dish) => (
                            <MenuCard
                                key={dish.id}
                                img={dish.img}
                                name={dish.name}
                                description={dish.description}
                                price={dish.price}
                            />
                        ))}
                    </div>
                </section>
            </main>

            <ModalMenu
                aberto={addMenuModalIsOpen}
                onFechar={() => setAddMenuModalIsOpen(false)}
                onSalvar={addDish}
            />
        </>
    );
}

export default Menu