import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './perfil.css'
import { ChevronLeft, Dot, LockIcon, User2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Perfil(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div id="principal-menu-perfil">
                    <div className="groups-top-container">
                        <button onClick={()=>navigate(-1)} className="btn-back-base"><ChevronLeft></ChevronLeft></button>
                        <h1>Meu Perfil</h1>
                    </div>

                    <div id="card-perfil">
                        <div id="icon-about-me">
                            <div id="icon">
                                <User2Icon  color={'rgb(15, 21, 58)'} size={70}></User2Icon>
                            </div>
                            <div id="about-me">
                                <h2>Nome</h2>
                                <div id="group-about-me">
                                    <p>Cargo</p>
                                    <Dot color={'rgb(77, 75, 75)'}></Dot>
                                    <p>Unidade X</p>
                                </div>
                            </div>
                        </div>
                        <div id="gerenciamento">
                            <LockIcon color={'rgb(77, 75, 75)'} size={45}></LockIcon>
                            <p>Seu perfil é gerenciado pela unidade X. Alterações de cargo e permissões são autorizadas pelo responsável administrativo.</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Perfil