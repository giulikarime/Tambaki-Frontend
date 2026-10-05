import { useEffect, useRef, useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import {ChevronLeft,Funnel,Plus,Search,SquarePen,Trash, X} from "lucide-react";
import './users_page.css'
import Modal from 'react-modal'
import { uploadFile } from "../../services/upload";
import { getUsers, createUsers, editUsers, deleteUsers, getUserEnums } from "../../services/user";
import FiltersModal from "../../components/FiltersModal/FiltersModal";
import { getLoggedUser } from "../../services/auth";
import AlertModals from "../../components/SucessModals/AlertModals";

function UsersPage(){

    const [expanded, setExpand] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();
    const [formError,setFormError] = useState('');
    const [formSuccess,setFormSuccess] = useState('');
    const [alertType,setAlertType] = useState('');
    const [alertModalIsOpen,setAlertModalIsOpen] = useState('');
    const [documentUrl,setDocumentUrl] = useState('');
    const [fileName,setFileName] = useState('Nenhum arquivo selecionado.')
    const [newDocumentUrlUser,setNewDocumentUrlUser] = useState(fileName)
    const [editUserStatus,setEditUserStatus] = useState(false);

    const [allUsers,setAllUsers] = useState([]);
    const user = getLoggedUser();

    const [rolevalue,setRoleValue] = useState('');
    const [accessLevelValue,setAccessLevelValue] = useState('');
    const [employTypeValue,setEmployTypeValue] = useState('');
    const [shiftValue,setShiftValue] = useState('');

    const [usersEnums,setUsersEnums] = useState({
        access_level: [],
        employ_type: [],
        shift: [],
    })

    const inputValues = [
        { label: 'Nome Completo', model: 'input', type: 'text', name: 'name_add_user', placeholder: 'Digite um nome...', placeholderEdit: 'name', schema: 'name' },
        { label: 'CPF', model: 'input', type: 'text', name: 'cpf_add_user', placeholder: 'Exemplo.: 11122233344...', placeholderEdit: 'cpf', schema: 'cpf' },
        { label: 'Email', model: 'input', type: 'email', name: 'email_add_user', placeholder: 'Digite um email...', placeholderEdit: 'email', schema: 'email' },
        { label: 'Telefone', model: 'input', type: 'text', name: 'phone_add_user', placeholder: 'Exemplo.: 11998876655...', placeholderEdit: 'phone', schema: 'phone' },
        { label: 'Senha', model: 'input', type: 'password', name: 'pass_add_user', readOnly: true, placeholder: 'Digite uma senha...', placeholderEdit: 'password', isPassword: true, schema: 'password' },
        { label: 'Cargo', model: 'input', type: 'text', name: 'role_add_user', placeholderEdit: 'role', schema: 'role' },
        { label: 'Nível de Acesso', model: 'select', name: 'access_level_add_user', placeholderEdit: 'access_level', user_enum: usersEnums.access_level, enum: true, schema: 'access_level' },
        { label: 'Modelo de Contrato', model: 'select', name: 'employ_add_user', placeholderEdit: 'employ_type', user_enum: usersEnums.employ_type, enum: true, schema: 'employ_type' },
        { label: 'Horário', model: 'select', name: 'shift_add_user', placeholderEdit: 'shift', user_enum: usersEnums.shift, enum: true, schema: 'shift' },
        { label: 'Data de Contratação', model: 'input', type: 'date', name: 'date_add_user', placeholderEdit: 'hire_date', schema: 'hire_date' },
        { label: 'Carga Horária', model: 'input', type: 'number', name: 'hours_add_user', placeholder: 'Exemplo.: 8', placeholderEdit: 'weekly_hours', schema: 'weekly_hours' },
        { label: 'Salário', model: 'input', type: 'number', name: 'salary_add_user', placeholder: 'Exemplo.: 2750.60', placeholderEdit: 'salary', step: '0.01', schema: 'salary' },
        { label: 'Banco', model: 'input', type: 'text', name: 'bank_add_user', placeholder: 'Exemplo.: Bradesco...', placeholderEdit: 'bankName', schema: 'bankName' },
    ];

    //modais
    const [createUserModalIsOpen,setCreateUserModalIsOpen] = useState(false);
    const [editUserModalIsOpen,setEditUserModalIsOpen] = useState(false);
    const [enableEditMode,setEnableEditMode] = useState(false);
    const [selectedUser,setSelectedUser] = useState(null);

    const filtersModal = ["Nível de Acesso", "Modelo de Contrato", "Horário de Trabalho"];
    
    const filtersData = {
        "Nível de Acesso": usersEnums.access_level,
        "Modelo de Contrato": usersEnums.employ_type,
        "Horário de Trabalho": usersEnums.shift,
    };

    const [selectedModalFilters, setSelectedModalFilters] = useState({
        "Nível de Acesso": null,
        "Modelo de Contrato": null,
        "Horário de Trabalho": null
    });

    useEffect(()=>{
        async function get_enums() {
            try {
                const enums_users = await getUserEnums();
                setUsersEnums(enums_users || {});
            } catch (error) {
                console.error("Erro ao carregar os dados dos formularios.", error);
            }
        }

        get_enums();
    },[])

    const [filterProductModalIsOpen, setFilterProductModalIsOpen] = useState(false);
    const [filterProductIsClicked, setFilterProductIsClicked] = useState(null);

    const handleSelectModalFilter = (category, option) => {
        setSelectedModalFilters(prev => ({
            ...prev,
            [category]: prev[category] === option ? null : option
        }));
    };

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

    async function handleFileClick(event) {
        const file = event.target.files[0];

        if(!file){
            setFileName('Nenhum arquivo selecionado');
        }

        setFileName(file.name);

        try {
            const url = await uploadFile(file);
            setDocumentUrl(url);
        } catch (error) {
            console.error("Erro ao enviar arquivo: ", error);
            setFormError('Não foi possível enviar o arquivo.');
        }
    }

    async function handleRemoveFile() {
         try {
            if (documentUrl) {
                await deleteFile(documentUrl);
            }
        } catch (error) {
            console.error("Erro ao remover o arquivo do servidor: ", error);
        } finally {
            setFileName('Nenhum arquivo selecionado.');
            setDocumentUrl(null);
            setFormError(null);

            if (fileRef.current) {
                fileRef.current.value = '';
            }
        }
    }

    async function handleGetUsers() {
        try{
            const users = await getUsers();
            setAllUsers(users);
        } catch (error){
            console.error("Erro ao carregar usuários.",error);
        }
    }

    async function handleCreateUser(e) {
        e.preventDefault('');
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('name_add_user')),
            cpf: String(formData.get('cpf_add_user')),
            email: String(formData.get('email_add_user')),
            phone: String(formData.get('phone_add_user')),
            password: String(formData.get('pass_add_user')),
            role: formData.get('role_add_user') || usersEnums.roles[0],
            access_level: formData.get('access_level_add_user') || usersEnums.access_level[0],
            employ_type: formData.get('employ_add_user') || usersEnums.employ_type[0],
            shift: formData.get('shift_add_user') || usersEnums.shift[0],
            hire_date: new Date(formData.get('date_add_user')).toISOString(),
            weekly_hours: parseInt(formData.get('hours_add_user')),
            salary: parseFloat(formData.get('salary_add_user')),
            bankName: String(formData.get('bank_add_user')),
            active: true,
            employe_document: documentUrl,
            storeUnitId: user?.storeUnitId
        }

        try{
            await createUsers(payload);
            await handleGetUsers();
            setFormSuccess("Funcionário criado com sucesso!");
            setCreateUserModalIsOpen(false);
            setAlertType('success');
            setAlertModalIsOpen(true);
            e.target.reset()
        } catch(error){
            console.error(error.message);
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleEditUser(e) {
        e.preventDefault('');
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        const formData = new FormData(e.target);
        const payload = {
            name: String(formData.get('name_add_user')) || selectedUser.name,
            cpf: String(formData.get('cpf_add_user')) || selectedUser.cpf,
            email: String(formData.get('email_add_user')) || selectedUser.email,
            phone: String(formData.get('phone_add_user')) || selectedUser.phone,
            password: String(formData.get('pass_add_user')) || selectedUser.password,
            role: formData.get('role_add_user') || selectedUser.role,
            access_level: formData.get('access_level_add_user')  || selectedUser.access_level,
            employ_type: formData.get('employ_add_user') || selectedUser.employ_type,
            shift: formData.get('shift_add_user') || selectedUser.shift,
            hire_date: new Date(formData.get('date_add_user')).toISOString() || selectedUser.hire_date,
            weekly_hours: parseInt(formData.get('hours_add_user')) || selectedUser.weekly_hours,
            salary: parseFloat(formData.get('salary_add_user')) || selectedUser.salary,
            bankName: String(formData.get('bank_add_user')) || selectedUser.bankName,
            active: true,
            employe_document: documentUrl || selectedUser.employe_document,
            storeUnitId: user?.storeUnitId
        }

        try{
            await editUsers(payload);
            await handleGetUsers();
            setEditUserModalIsOpen(false);
            setFormSuccess(`Funcionário(a) ${selectedUser.name} editado com sucesso!`);
            setAlertType('success');
            setAlertModalIsOpen(true);
            setSelectedUser(null);
            e.target.reset()
        } catch(error){
            console.error(error.message);
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    async function handleDeleteUser(){
        setFormError('');
        setFormSuccess('');
        setAlertType('');
        try {
            await deleteUsers(selectedUser.id);
            await handleGetUsers();
            setEditUserModalIsOpen(false);
            setEditUserStatus(false);
            setAlertType('success');
            setFormSuccess(`${selectedUser.name} deletado com sucesso!`);
            setAlertModalIsOpen(true);
            setSelectedUser(null);
        } catch (error) {
            setFormError(error.message);
            setAlertType('error');
            setAlertModalIsOpen(true);
        }
    }

    useEffect(()=>{
        handleGetUsers();
    },[])

    useEffect(() => {
            if (editUserModalIsOpen && selectedUser) {
                setNewDocumentUrlUser(selectedUser.employe_document);
            }
            }, [editUserModalIsOpen, selectedUser]);

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
                        <table className="table">
                            <thead className="thead-style tr-th-group">
                                <tr>
                                    <th className='name'>NOME</th>
                                    <th className='role'>CARGO</th>
                                    <th className='email-users'>EMAIL</th>
                                    <th className='phone-users'>TELEFONE</th>
                                    <th className='access_level'>NÍVEL DE ACESSO</th>
                                    <th className='info-users'>INFORMAÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((employees,index)=>(
                                    <tr className="tr-th-group" key={index}>
                                            <td>{employees.name}</td>
                                            <td>{employees.role}</td>
                                            <td>{employees.email}</td>
                                            <td>{employees.phone}</td>
                                            <td>{employees.access_level}</td>
                                            <td><button onClick={()=>{
                                                setEditUserModalIsOpen(true)
                                                setSelectedUser(employees)
                                                }} className="see-more-users">Ver mais</button></td>
                                        </tr>
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
                        <p style={{'fontSize': 15,'color': '#777171ff'}}>Adicione funcionários e ou usuários à sua unidade.</p>
                    </div>
                    <form action="" onSubmit={handleCreateUser}>

                        <div className="container-form">
                            {inputValues.map((item,index)=>(
                                item.model === 'input' ? (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <input step={item.step} className="input-select-model" name={item.name} type={item.type} placeholder={item.placeholder} />
                                    </div>
                                ) : (
                                    <div key={index} className="fields">
                                        <label>{item.label}</label>
                                        <select className="input-select-model" name={item.name} id="">
                                            {item.enum ? 
                                            item.user_enum?.map((u_enum,i)=>(
                                                <option value={u_enum} key={i}>{u_enum.replaceAll('_',' ')}</option>
                                            )) : ('')}
                                        </select>
                                    </div>
                                )
                            ))}

                            <div className="fields">
                                <label htmlFor="">Contrato de Trabalho</label>
                                <button type="button" onClick={handleButtonFile} className="btn-modal-file-users">
                                    <input hidden onChange={handleFileClick} ref={fileRef} type="file" name="" id="" />
                                    <p>Adicionar arquivo</p>
                                </button>
                                <div className='file_name_style'>
                                    <p style={{fontSize: 14, whiteSpace: 'nowrap'}}>{fileName}</p>
                                    {fileName === "Nenhum arquivo selecionado." ? "" : <button type="button" onClick={handleRemoveFile}>
                                        <X color={'#3553b5'} size={15}></X>
                                    </button>}
                                </div>
                            </div>
                        </div>
                        <button className="btn-modal-submit" type="submit">Salvar</button>
                    </form>
                </Modal>

                <Modal
                    isOpen={editUserModalIsOpen}
                    onRequestClose={()=>{
                        setEditUserModalIsOpen(false)
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
                                        setEditUserModalIsOpen(false)
                                        setEnableEditMode(false)
                                    }}>&times;</button>
                                </div>
                                <p style={{'fontSize': 15,'color': '#777171ff'}}>{subtitle_edit_text}</p>
                            </div>
                            <form action="" onSubmit={handleEditUser}>

                                <div className="container-form">
                                    {inputValues.map((item,index)=>(
                                        item.type === 'date' ? (
                                            <div 
                                                key={index} 
                                                className="fields"
                                            >
                                                <label>{item.label}</label>
                                                <input
                                                defaultValue={
                                                    selectedUser?.[item.schema]
                                                        ? new Date(selectedUser[item.schema]).toISOString().split('T')[0]
                                                        : ''
                                                }    
                                                readOnly={!enableEditMode} className="input-select-model" name={item.name} type={item.type} 
                                                    placeholder={ item.isPassword? '••••••••' : selectedUser?.[item.placeholderEdit]} />
                                            </div>
                                        ) :
                                        item.model === 'input' ?  (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <input readOnly={!enableEditMode} className="input-select-model" name={item.name} type={item.type} 
                                                    placeholder={ item.isPassword? '••••••••' : selectedUser?.[item.placeholderEdit]} />
                                            </div>
                                        ) : (
                                            <div key={index} className="fields">
                                                <label>{item.label}</label>
                                                <select className="input-select-model" name={item.name} id="">
                                                    {item.enum ? 
                                                    item.user_enum?.map((u_enum,i)=>(
                                                        <option value={u_enum} key={i}>{u_enum.replaceAll('_',' ')}</option>
                                                    )) : ('')}
                                                </select>
                                            </div>
                                        )
                                    ))}

                                    <div className="fields">
                                        <label htmlFor="">Contrato de Trabalho</label>
                                        <button type="button"
                                            onClick={editUserStatus ? handleButtonClick : () => {
                                                        if (selectedUser?.employe_document) {
                                                            window.open(selectedUser.employe_document, '_blank', 'noopener,noreferrer');
                                                        } else {
                                                            setFormError('Nenhum arquivo cadastrado para esse funcionário.');
                                                        }
                                                }}
                                            className="btn-modal-file-users">
                                            <input hidden onChange={handleFileClick} ref={fileRef} type="file" name="" id="" />
                                            <p>{enableEditMode ? ("Adicionar arquivo") : ("Ver arquivo")}</p>
                                        </button>
                                        <div className='file_name_style'>
                                            <p style={{fontSize: 14, whiteSpace: 'nowrap'}}>{newDocumentUrlUser? newDocumentUrlUser.split('/').pop() : fileName}</p>
                                            {newDocumentUrlUser ? (
                                                !editUserStatus ? "" : <button type="button" onClick={()=>setNewDocumentUrlUser(null)}>
                                                    <X color={'#3553b5'} size={15}></X>
                                                </button>
                                            ) : ''}
                                        </div>
                                    </div>
                                </div>
                                {enableEditMode ? (
                                    <div style={{display:'flex',flexDirection:'row',gap: 10}}>
                                        <button className="btn-modal-submit" type="submit">Salvar</button>
                                        <button className="btn-modal-submit trash" type="button" onClick={handleDeleteUser}><Trash></Trash></button>
                                    </div>
                                ) : (
                                    ''
                                )}
                            </form>
                            </>
                        )
                    })()}
                </Modal>

                <FiltersModal
                    isOpen={filterProductModalIsOpen}
                    setIsOpen={setFilterProductModalIsOpen}
                    filtersTitle={filtersModal}
                    filtersData={filtersData}
                    selectedFilters={selectedModalFilters}
                    setSelectedFilters={selectedModalFilters}>
                </FiltersModal>

                <AlertModals
                    phrase={formSuccess ? formSuccess : formError}
                    isOpen={alertModalIsOpen}
                    setIsOpen={setAlertModalIsOpen}
                    type={alertType}
                />

            </main>
        </>
    );
}

export default UsersPage