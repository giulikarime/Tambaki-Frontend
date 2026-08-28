import { useEffect, useState } from "react";
import { ChevronRight, Search, MonitorSmartphone, Accessibility, Clock, RotateCcw, Info } from "lucide-react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './configuration.css';
function Configuration() {

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    return (
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>

                <div id="config-back">
                    <p>Configuração</p>
                    <button className="btn-principal">
                        <ChevronRight color="black" />
                    </button>
                </div>

                <div id="config-container">
                    <div id="search">
                        <input className="search-input" type="search" placeholder="Pesquisar configuração" />
                        <button className="btn-principal">
                            <Search color="black" />
                        </button>
                    </div>

                    <div id="devices">
                        <MonitorSmartphone color="black" />
                        <p>Dispositivos Conectados</p>
                        <button className="btn-principal">
                            <ChevronRight color="black" />
                        </button>
                    </div>

                    <div id="acessibility">
                        <Accessibility color="black" />
                        <p>Acessibilidade</p>
                        <button className="btn-principal">
                            <ChevronRight color="black" />
                        </button>
                    </div>

                    <div id="hour-language">
                        <Clock color="black" />
                        <p>Hora e idioma</p>
                        <button className="btn-principal">
                            <ChevronRight color="black" />
                        </button>
                    </div>

                    <div id="reload">
                        <RotateCcw color="black" />
                        <p>Redefinir configurações</p>
                        <button className="btn-principal">
                            <ChevronRight color="black" />
                        </button>
                    </div>

                    <div id="about">
                        <Info color="black" />
                        <button className="btn-principal">
                            <ChevronRight color="black" />
                        </button>
                    </div>


                </div>

            </main>
        </>
    );
}

export default Configuration