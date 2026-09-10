import { useEffect, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Funnel, Plus, Search } from "lucide-react";
import { getUsers, createUsers } from "../../services/user";
import './users_page.css'
import { AuthContext } from "../../services/AuthContext";
import Modal from 'react-modal'

function UsersPage(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();
    const [formError,setFormError] = useState('');

    const [allUsers,setAllUsers] = useState([]);
    const {user} = useState(AuthContext);

    const [rolevalue,setRoleValue] = useState('');
    const [accessLevelValue,setAccessLevelValue] = useState('');
    const [employTypeValue,setEmployTypeValue] = useState('');
    const [shiftValue,setShiftValue] = useState('');

    const [usersEnums,setUsersEnums] = useState({
        roles: [],
        access_levels: [],
        employ_types: [],
        shifts: [],
    })

    const inputValues = [
        {label: 'Nome Completo', model: 'input', type: 'text', name: 'name_add_user'},
        {label: 'CPF', model: 'input', type: 'text', name: 'cpf_add_user'},
        {label: 'Email', model: 'input', type: 'email', name: 'email_add_user'},
        {label: 'Telefone', model: 'input', type: 'text', name: 'phone_add_user'},
        {label: 'Senha', model: 'input', type: 'password', name: 'pass_add_user', readOnly: true},
        {label: 'Cargo', model: 'select', name: 'role_add_user'},
        {label: 'Nível de Acesso', model: 'select', name: 'access_level_add_user'},
        {label: 'Modelo de Contrato', model: 'select', name: 'employ_add_user'},
        {label: 'Horário', model: 'select', name: 'shift_add_user'},
        {label: 'Data de Contratação', model: 'input', type: 'date', name: 'date_add_user'},
        {label: 'Carga Horária', model: 'input', type: 'number', name: 'hours_add_user'},
        {label: 'Salário', model: 'input', type: 'number', name: 'salary_add_user'},
        {label: 'Banco', model: 'input', type: 'text', name: 'bank_add_user'},
    ]

    async function handleGetUsers() {
        try{
            const users = await getUsers();
            setAllUsers(users);
        } catch (error){
            console.error("Erro ao carregar usuários.",error);
        }
    };

    async function handleCreateUser(e) {
        e.preventDefalt();
        setFormError('');
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('')),
            cpf: String(formData.get('')),
            email: String(formData.get('')),
            phone: String(formData.get('')),
            password: String(formData.get('')),
            role: rolevalue || usersEnums.roles[0],
            access_level: accessLevelValue || usersEnums.access_levels[0],
            employ_type: employTypeValue || usersEnums.employ_types[0],
            shift: shiftValue || usersEnums.shifts[0],
            hire_date: new Date(formData.get('')).toISOString(),
            weekly_hours: String(formData.get('')),
            salary: parseFloatString(formData.get('')),
            bankName: String(formData.get('')),
            active: String(formData.get('')),
            storeUnitId: user.storeUnitId
        }

        try{
            await createUsers(payload);
            await handleGetUsers();
            e.target.reset()
        } catch(error){
            console.log("Erro ao criar usuário.",error);
            setFormError("Erro ao criar usuário. Verifique os dados e tente novamente.")
        }
    }

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
                            <h1>Funcionários</h1>
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
                            <thead className="thead-style tr-th-group">
                                <th>NOME</th>
                                <th>CARGO</th>
                                <th>EMAIL</th>
                                <th>TELEFONE</th>
                                <th>NÍVEL DE ACESSO</th>
                                <th>INFORMAÇÕES</th>
                            </thead>
                            <tbody>
                                {allUsers.map((employees,index)=>(
                                    <>
                                        <tr className="tr-th-group" key={index}>
                                            <td>{employees.name}</td>
                                            <td>{employees.role}</td>
                                            <td>{employees.email}</td>
                                            <td>{employees.phone}</td>
                                            <td>{employees.access_level}</td>
                                            <td><button className="see-more-users">Ver mais</button></td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal>
                    <div>
                        <div>
                            <h2>Adicionar Funcionário</h2>
                            <button>&times;</button>
                        </div>
                        <p>Adicione funcionários e ou usuários à sua unidade.</p>
                    </div>
                    <form action="" onSubmit={handleCreateUser}>

                        {inputValues.map((item,index)=>{
                            item.model === 'input' ? (
                                <div className="fields">
                                    <label>{item.label}</label>
                                    <input name={item.name} type={item.type} />
                                </div>
                            ) : (
                                <div className="fields">
                                    <label>{item.label}</label>
                                    <select name={item.name}>
                                        <option>Outros</option>
                                    </select>
                                </div>
                            )
                        })}

                        <button type="submit">Salvar</button>
                    </form>
                </Modal>
            </main>
        </>
    );
}

export default UsersPage