import { useState, useRef } from "react";

// Uso: <ModalMenu aberto={bool} onFechar={fn} onSalvar={fn} />
// Quando o formulário é enviado, "onSalvar" recebe { img, name, description, price }

function ModalMenu({ aberto, onFechar, onSalvar }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
  

    const imgRef = useRef(null); 

    function handleButtonClick() { // abre o seletor de arquivos do sistema
        imgRef.current.click();
    }


    if (!aberto) return null;

    function limparFormulario() {
        setName("");
        setDescription("");
        setPrice("");
        setPreview("");
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!name || !price) return; 

        onSalvar({
            img: preview || "https://placehold.co/400x300?text=Prato",
            name,
            description,
            price: Number(price),
        });

        limparFormulario();
        onFechar();
    }

    function handleFechar() {
        limparFormulario();
        onFechar();
    }

 

    return (
        
    );
}

export default ModalMenu