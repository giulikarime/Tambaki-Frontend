import { House, Utensils, HandCoins, PackageOpen, UserCheck, Store } from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom'
import './sidebar.css'
import { useState } from "react";

function Sidebar({ expanded, hasInteracted }) {

    const navigate = useNavigate();

    const location = useLocation();

    function redirect(url) {
        navigate(url);
    }

    const menuItems = [
        { icon: House, label: "Tela Inicial", url: '/home' },
        { icon: HandCoins, label: "Financeiro", url: '/dashboard' },
        { icon: Utensils, label: "Cardápio", url: '/menu' },
        { icon: PackageOpen, label: "Estoque", url: '/stock' },
        { icon: Store, label: "Fornecedor", url: '/suppliers' },
        { icon: UserCheck, label: "Usuários", url: '/users' },
    ]

    return (
        <div id="sidebar" className={`sidebar ${hasInteracted ? 'animate' : ''} ${expanded ? 'expanded' : ''}`}>
            <div id="sidebar-menu">
                {menuItems.map(({icon: Icon, label, url},id) => {
                    const isActive = location.pathname === url;
                    
                    return(
                        <button 
                            onClick={() => {
                                redirect(url)
                                setButtonIsClicked(id)
                            }} 
                            className={`sidebar-item ${isActive ? 'bg-true' : 'bg-false'}`}
                            key={id}>
                            <Icon size={26} className="sidebar-icon" />
                            <span className="sidebar-label">{label}</span>
                        </button>
                    )
                    })}
            </div>
        </div>
    );
}

export default Sidebar