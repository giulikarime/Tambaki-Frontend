import { useState } from "react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import './suppliers.css';
import { useNavigate } from "react-router-dom";


export default function Suppliers(){

return(
    <div className="suppliers">
        <Header/>
        <Sidebar/>
        <div className="suppliers-container">
            <h1>Fornecedores</h1>
        </div>
    </div>
)




}