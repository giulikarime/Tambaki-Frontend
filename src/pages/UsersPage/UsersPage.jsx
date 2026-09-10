import { useEffect, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Funnel, Plus, Search } from "lucide-react";
import { getUsers } from "../../services/user";
import './users_page.css'

function UsersPage(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();

    const [allUsers,setAllUsers] = useState([]);

    async function handleGetUsers() {
        try{
            const users = await getUsers();
            setAllUsers(users);
        } catch (error){
            console.error("Erro ao carregar usuários.",error);
        }
    };

    useEffect(()=>{
        handleGetUsers();
    },[])

    return(
        <>
            <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} ></Header>
            <main>
                <Sidebar expanded={expanded} hasInteracted={hasInteracted} ></Sidebar>
                <div className="principal-menu-users">
                    <div className="top-container-users">
                        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:15}}>
                            <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft></ChevronLeft></button>
                            <h1>FUNCIONÁRIOS</h1>
                        </div>
                        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:15}}>
                            <button id='btn-plus-stock'><Plus></Plus></button>
                            <button id='btn-funnel-base' className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
                            <div style={{ position: "relative"}}>
                                <Search 
                                    style={{ 
                                    position: "absolute", 
                                    left: "16px", 
                                    top: "50%", 
                                    transform: "translateY(-50%)", 
                                    color: "#00000065" 
                                    }} 
                                    size={20} 
                                />
                                <input 
                                    type="search" 
                                    placeholder="Buscar usuários..." 
                                    style={{ 
                                    backgroundColor: "#cae2ff", 
                                    fontSize: "16px", 
                                    padding: "10px 20px", 
                                    paddingLeft: "50px",
                                    borderRadius: "50px", 
                                    width: "100%" ,
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="container-users">
                        <table>
                            <thead>
                                <th>NOME</th>
                                <th>CARGO</th>
                                <th>TELEFONE</th>
                                <th>EMAIL</th>
                                <th>NÍVEL DE ACESSO</th>
                                <th>INFORMAÇÕES</th>
                            </thead>
                            <tbody>
                                {allUsers.map((employees,index)=>(
                                    <tr key={index}>
                                        <td>{employees.name}</td>
                                        <td>{employees.role}</td>
                                        <td>{employees.email}</td>
                                        <td>{employees.phone}</td>
                                        <td>{employees.access_level}</td>
                                        <td><button>Ver mais</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}

export default UsersPage