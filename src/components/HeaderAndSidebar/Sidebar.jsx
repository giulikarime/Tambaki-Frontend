import { House, Utensils, HandCoins, PackageOpen, UserCheck} from "lucide-react"
import {useNavigate} from 'react-router-dom'
import './sidebar.css'

function Sidebar({ expanded,hasInteracted }){

    const navigate = useNavigate();

     function redirect(url){
        navigate(url);
    }

    const menuItems = [
        {icon: House, label: "Tela Inicial", url: '/dashboard'},
        {icon: HandCoins, label: "Financeiro", url: '/financial'},
        {icon: Utensils, label: "Cardápio", url: '/menu'},
        {icon: PackageOpen, label: "Estoque", url: '/stock'},
        {icon: UserCheck, label: "Usuários", url:'/users'},
    ]

    return(
        <div id="sidebar" className={`sidebar ${hasInteracted ? 'animate' : ''} ${expanded ? 'expanded' : ''}`}>
            <div id="sidebar-menu">
                {menuItems.map(({icon: Icon, label, url})=>(
                    <button onClick={()=>redirect(url)} className="sidebar-item" key={label}>
                        <Icon size={26} className="sidebar-icon"/>
                        <span className="sidebar-label">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Sidebar