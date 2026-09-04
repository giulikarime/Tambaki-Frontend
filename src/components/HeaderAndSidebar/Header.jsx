import { Menu, Bell, User, Settings, LogOut, User2Icon, Search} from "lucide-react"
import logo from '../../assets/Tambaki_Prototype.png'
import { useEffect, useState } from "react"
import './header.css'
import Modal from 'react-modal'
import React from 'react';
import { useNavigate } from "react-router-dom"

function Header({ expanded, setExpand,setHasInteracted }){

    const [userName, setUserName] = useState("");
    const [notificationModalIsOpen, setNotificationModalIsOpen] = React.useState(false);
    const [userModalIsOpen, setUserModalIsOpen] = React.useState(false);
    const [notifications,setNotifications] = useState([]);
    const [preferences, setPreferences] = useState(() => {
    const sidebar_boolean = localStorage.getItem('sidebar_boolean');
        return sidebar_boolean ? JSON.parse(sidebar_boolean) : false;
    });
    const navigate = useNavigate();

     function redirect(url){
        navigate(url);
    }

    useEffect(() => {
        setExpand(preferences);
    })

    useEffect(() => {
        localStorage.setItem('sidebar_boolean', JSON.stringify(preferences));
        setExpand(preferences)
    }, [preferences,setExpand]);

    const notificationStyles = {
        overlay: {
            backgroundColor: 'transparent',
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
        },
        content: {
            position: 'absolute',
            top: '70px', 
            right: '80px',
            left: 'auto',
            bottom: 'auto',
            width: '320px',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
        },
    };

    const userStyles = {
    overlay: {
        backgroundColor: 'transparent',
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
    },
    content: {
        position: 'absolute',
        top: '65px',
        right: '20px',
        left: 'auto',
        bottom: 'auto',
        width: '200px',
        borderRadius: '10px',
        border: 'none',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        backgroundColor: '#fff',
    },
};

    useEffect(() => {
        const account = JSON.parse(localStorage.getItem("account"));
        if (account?.name) {
            setUserName(account.name);
        }
    }, []);


    function closeModalNotification() {
        setNotificationModalIsOpen(false);
    }

    function closeModalUser() {
        setUserModalIsOpen(false);
    }

    return(
        <header>
            <div id="group-one">
                <button onClick={() => {
                    const newValue = !expanded;
                    setExpand(newValue);
                    setPreferences(newValue);
                    setHasInteracted(true);
                }}>
                    <Menu color="#fff" className='icon-header' style={{width:'42px',height:'42px'}}></Menu>
                </button>
                <img style={{ width: '40px', height: '40px' }} src={logo} alt="" />
                <h1 style={{ fontSize: '20px' }}>Olá, {userName} </h1>
            </div>

            <div style={{ position: "relative", width: "30%" }}>
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
                    placeholder="Buscar por pratos, bebidas, usuários..." 
                    style={{ 
                    backgroundColor: "#ffffffa9", 
                    fontSize: "16px", 
                    padding: "10px 20px", 
                    paddingLeft: "50px",
                    borderRadius: "50px", 
                    width: "100%" ,
                    }} 
                />
            </div>
            <div id="group-two">
                <button onClick={()=>setNotificationModalIsOpen(true)}><Bell className='icon-header' color="#fff"></Bell></button>
                <button onClick={()=>setUserModalIsOpen(true)}><User2Icon className='icon-header' color="#fff"></User2Icon></button>
            </div>
            <Modal
                isOpen={notificationModalIsOpen}
                onRequestClose={closeModalNotification}
                contentLabel="Notificações"
                style={notificationStyles}
                shouldCloseOnOverlayClick={true}
                id='modal-notification'
            >
                <h3 className="notif-title">Notificações</h3>
                <ul className="notif-list">
                    {notifications.length === 0 ? 
                    (<li className="notif-empty">Não há notificações por agora.</li>

                    ) : (
                        notifications.map((n) => (
                        <li key={n.id} className="notif-item">
                            <span className="notif-dot" style={{ backgroundColor: n.color }}></span>
                            <div className="notif-content">
                                <p className="notif-header">
                                    <strong>{n.category}</strong> • {n.time}
                                </p>
                                <p className="notif-text">{n.text}</p>
                            </div>
                        </li>
                    ))
                    )}
                </ul>
            </Modal>
            <Modal
                isOpen={userModalIsOpen}
                onRequestClose={closeModalUser}
                contentLabel="Modal Usuário"
                style={userStyles}
                shouldCloseOnOverlayClick={true}
                id='modal-user-profile'
            >
                <ul style={{}} className="user-menu">
                    <li>
                        <button className="btn-user-modal" onClick={()=>redirect('/perfil')}><User color='black'></User>Perfil</button>
                    </li>
                    <li>
                        <button className="btn-user-modal" onClick={()=>redirect('/configuration')}><Settings color='black'></Settings>Configurações</button>
                    </li>
                    <li>
                        <button className="btn-user-modal" style={{color:'red'}} onClick={()=>redirect('/logout')}><LogOut color='red'></LogOut>Sair</button>
                    </li>
                </ul>
            </Modal>
        </header>
    );
}

export default Header;