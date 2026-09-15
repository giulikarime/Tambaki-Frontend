import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import {ChevronLeft,ChevronRight,ChevronDown,Funnel,Plus,Search,SquarePen,Trash} from "lucide-react";

import { getUsers, createUsers } from "../../services/users";
import './users_page.css'
import { AuthContext } from "../../services/AuthContext";
import Modal from 'react-modal'
import React, { Fragment } from 'react';

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
        {label: 'Nome Completo', model: 'input', type: 'text', name: 'name_add_user', placeholder: 'Digite um nome...', placeholderEdit: `name`},
        {label: 'CPF', model: 'input', type: 'text', name: 'cpf_add_user', placeholder: 'Exemplo.: 11122233344...', placeholderEdit: `cpf`},
        {label: 'Email', model: 'input', type: 'email', name: 'email_add_user', placeholder: 'Digite um email...', placeholderEdit: `email`},
        {label: 'Telefone', model: 'input', type: 'text', name: 'phone_add_user', placeholder: 'Exemplo.: 11998876655...', placeholderEdit: `phone`},
        {label: 'Senha', model: 'input', type: 'password', name: 'pass_add_user', readOnly: true, placeholder: 'Digite uma senha...', placeholderEdit: `password`},
        {label: 'Cargo', model: 'select', name: 'role_add_user', placeholderEdit: `role`},
        {label: 'Nível de Acesso', model: 'select', name: 'access_level_add_user', placeholderEdit: `access_level`},
        {label: 'Modelo de Contrato', model: 'select', name: 'employ_add_user', placeholderEdit: `employ_type`},
        {label: 'Horário', model: 'select', name: 'shift_add_user', placeholderEdit: `shift`},
        {label: 'Data de Contratação', model: 'input', type: 'date', name: 'date_add_user', placeholderEdit: `hire_date`},
        {label: 'Carga Horária', model: 'input', type: 'number', name: 'hours_add_user', placeholder: 'Exemplo.: 8', placeholderEdit: `weekly_hours`},
        {label: 'Salário', model: 'input', type: 'number', name: 'salary_add_user', placeholder: 'Exemplo.: 2750.60', placeholderEdit: `salary`},
        {label: 'Banco', model: 'input', type: 'text', name: 'bank_add_user', placeholder: 'Exemplo.: Bradesco...', placeholderEdit: `bankName`},
    ]

    //modais
    const [createUserModalIsOpen,setCreateUserModalIsOpen] = useState(false);
    const [editUserModalIsOpen,setEditUserModalIsOpen] = useState(false);
    const [enableEditMode,setEnableEditMode] = useState(false);
    const [selectedUser,setSelectedUser] = useState(null);

    const filtersModal = ["Cargo", "Nível de Acesso", "Modelo de Contrato", "Horário de Trabalho"];
    
    const filtersData = {
        "Cargo": ["Gerente", "Administração"],
        "Nível de Acesso": ["Master", "Senior", "Pleno", "Junior"],
        "Modelo de Contrato": ["CLT","PJ","Temporario"],
        "Horário de Trabalho": ["Noturno", "Manhã", "Tarde"],
    };

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Cargo": null,
        "Nível de Acesso": null,
        "Modelo de Contrato": null,
        "Horário de Trabalho": null
    });

    const [filterProductModalIsOpen, setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked, setFilterProductIsClicked] = useState(null);

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

    const modalFilterProductsStyle = {
        overlay: {
            backgroundColor: '#191444be',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'fixed',
            top: '0',
            right: '0',
            left: 'auto',
            bottom: '0',
            width: '300px',
            maxHeight: '100vh',
            padding: '20px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            margin: '0'
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
            maxHeight: '80vh',
            scrollbarWidth: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '65%',
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

    const fileRef = useRef(null);

    function handleButtonFile(){
        fileRef.current.click()
    }

    function handleInputFile(e){
        const file = e.target.files[0];
    }

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
                        <div style={{display:'flex',flexDirection:'column',gap:15}}>
                            <div style={{display:'flex',flexDirection:'row',gap: 15,alignItems:'center'}}>
                                <button className="btn-back-base" onClick={()=>navigate(-1)}><ChevronLeft></ChevronLeft></button>
                                <h1>Funcionários</h1>
                            </div>
                            <p style={{ color: '#777171ff' }}>Localize seus usuários e edite informações</p>
                        </div>
                        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:15}}>
                            <button onClick={()=>setCreateUserModalIsOpen(!createUserModalIsOpen)} id='btn-plus-stock'><Plus></Plus></button>
                            <button
                                onClick={()=>setFilterProductModalIsOpen(!filterProductModalIsOpen)}
                             id='btn-funnel-base' 
                             className="btn-stock-base">Filtrar <Funnel size={20}></Funnel></button>
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
                                            <td><button onClick={()=>{
                                                setEditUserModalIsOpen(!editUserModalIsOpen)
                                                setSelectedUser(employees)
                                                }} className="see-more-users">Ver mais</button></td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    isOpen={createUserModalIsOpen}
                    onRequestClose={()=>setCreateUserModalIsOpen(!createUserModalIsOpen)}
                    contentLabel="Criar Usuário"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    <div className="top-container">
                        <div className="group-one-top-container">
                            <h2>Adicionar Funcionário</h2>
                            <button onClick={()=>setCreateUserModalIsOpen(!createUserModalIsOpen)}>&times;</button>
                        </div>
                        <p style={{'font-size': 15,'color': '#777171ff'}}>Adicione funcionários e ou usuários à sua unidade.</p>
                    </div>
                    <form action="" onSubmit={handleCreateUser}>

                        <div className="container-form">
                            {inputValues.map((item,index)=>(
                                item.model === 'input' ? (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <input className="input-select-model" name={item.name} type={item.type} placeholder={item.placeholder} />
                                    </div>
                                ) : (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <select className="input-select-model" name={item.name}>
                                            <option>Outros</option>
                                        </select>
                                    </div>
                                )
                            ))}

                            <div className="fields">
                                <label htmlFor="">Contrato de Trabalho</label>
                                <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                    <input hidden onChange={handleInputFile} ref={fileRef} type="file" name="" id="" />
                                    <p>Adicionar arquivo</p>
                                </button>
                            </div>
                        </div>
                        <button className="btn-modal-submit" type="submit">Salvar</button>
                    </form>
                </Modal>

                <Modal
                    isOpen={editUserModalIsOpen}
                    onRequestClose={()=>{
                        setEditUserModalIsOpen(!editUserModalIsOpen)
                        setEnableEditMode(false);
                    }}
                    contentLabel="Editar Usuário"
                    shouldCloseOnOverlayClick={true}
                    style={modalStyle}
                >
                    {(()=>{
                        const principal_edit_text = enableEditMode ? `Edite ${selectedUser?.name}` : `${selectedUser?.name}`;
                        const enable_edit_text = enableEditMode ? `Desabilitar Edição` : `Habilitar Edição`;
                        const subtitle_edit_text = enableEditMode ? `Edite os dados de ${selectedUser?.name}` : "" ;

                        return(
                            <>
                            <div className="top-container">
                                <div className="group-one-top-container">
                                    <h2>{principal_edit_text}</h2>
                                    <button
                                        onClick={()=>setEnableEditMode(!enableEditMode)}
                                        style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'10px',fontSize:'18px'}}>{enable_edit_text}<SquarePen></SquarePen></button>
                                    <button onClick={()=>{
                                        setEditUserModalIsOpen(!editUserModalIsOpen)
                                        setEnableEditMode(false)
                                    }}>&times;</button>
                                </div>
                                <p style={{'font-size': 15,'color': '#777171ff'}}>{subtitle_edit_text}</p>
                            </div>
                            <form action="" onSubmit={handleCreateUser}>

                                <div className="container-form">
                                    {inputValues.map((item,index)=>(
                                        item.model === 'input' ? (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <input readOnly={!enableEditMode} className="input-select-model" name={item.name} type={item.type} placeholder={selectedUser?.[item.placeholderEdit]} />
                                            </div>
                                        ) : (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <select readOnly={!enableEditMode} className="input-select-model" name={item.name}>
                                                    <option>Outros</option>
                                                </select>
                                            </div>
                                        )
                                    ))}

                                    <div className="fields">
                                        <label htmlFor="">Contrato de Trabalho</label>
                                        <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                            <input hidden onChange={handleInputFile} ref={fileRef} type="file" name="" id="" />
                                            <p>{enableEditMode ? ("Adicionar arquivo") : ("Ver arquivo")}</p>
                                        </button>
                                    </div>
                                </div>
                                {enableEditMode ? (
                                    <div style={{display:'flex',flexDirection:'row',gap: 10}}>
                                        <button className="btn-modal-submit" type="submit">Salvar</button>
                                        <button className="btn-modal-submit"><Trash></Trash></button>
                                    </div>
                                ) : (
                                    ''
                                )}
                            </form>
                            </>
                        )
                    })()}
                </Modal>

                <Modal
                    isOpen={filterProductModalIsOpen}
                    onRequestClose={() => setFilterProductModalIsOpen(false)}
                    contentLabel="Modal de Filtros"
                    shouldCloseOnOverlayClick={true}
                    style={modalFilterProductsStyle}
                    >
                    <div className="container-filters">
                        <div className="top-container-filters">
                        <h1>Filtrar Por</h1>
                        <button onClick={() => setFilterProductModalIsOpen(false)}>&times;</button>
                        </div>

                        {filtersModal.map((filters_item, index) => {
                            const isExpanded = filterProductIsClicked === index;

                            return (
                                <React.Fragment key={filters_item}>
                                    <button 
                                        type="button"
                                        onClick={() => setFilterProductIsClicked(isExpanded ? null : index)} 
                                        className="btn_filters_modal"
                                    >
                                        {filters_item} 
                                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                                    </button>

                                    {isExpanded && (
                                        <ul className="container-filters-options-users">
                                            {(filtersData[filters_item] || []).map((option) => {
                                                const isSelected = selectedModalFilters[filters_item] === option;

                                                return (
                                                    <li key={option}>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleSelectModalFilter(filters_item, option)}
                                                            className={isSelected ? "filter-option-active" : ""}
                                                        >
                                                            {option} {isSelected && "✓"}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <button 
                        className="btn-clear-filters"
                        onClick={() => setSelectedModalFilters({
                                "Cargo": null,
                                "Nível de Acesso": null,
                                "Modelo de Contrato": null,
                                "Horário de Trabalho": null
                            })}
                        >Limpar Filtros do Modal</button>
                    </div>
                    </Modal>

            </main>
        </>
    );
}

export default UsersPage