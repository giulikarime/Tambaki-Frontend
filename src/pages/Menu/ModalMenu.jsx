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
        <div className="modal-fundo" onClick={handleFechar}>
            {}
            <form className="modal-conteudo" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Novo prato</h2>

                <div className="upload-imagem">
                    <div className="upload-preview" onClick={handleButtonClick}>
                        {preview ? <img src={preview} alt="Preview" /> : <span>Escolher foto</span>}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={imgRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>

                <label>
                    Nome do prato
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label>
                    Descrição
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </label>

                <label>
                    Preço (R$)
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </label>

                <div className="modal-botoes">
                    <button type="button" onClick={handleFechar}>Cancelar</button>
                    <button type="submit">Adicionar prato</button>
                </div>
            </form>
        </div>
    );
}

export default ModalMenu