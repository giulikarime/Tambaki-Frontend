import { useState } from "react";

function SelectInputMode({options, value, onChange, className}){

    //Mudança do select para input
    const [isCustomSelectMode, setIsCustomSelectMode] = useState(false); //Verificar se a costumização está ativada
    const [customSelectValue, setCustomSelectValue] = useState(""); //Valor da costumização

    function handleSelectChange(e){
        const selected = e.target.value;
        if(selected === '__OUTRO__'){
            setIsCustomSelectMode(true);
            setCustomSelectValue("");
        } else {
            setCustomSelectValue(selected);
        }
    }

    if(isCustomSelectMode){
        return(
            <input 
                className={className}
                type="text"
                autoFocus
                value={customSelectValue}
                placeholder="Digite um novo valor"
                onChange={(e=>setCustomSelectValue(e.target.value))}
            />
        );
    }
    
    return(
        <select onChange={handleSelectChange} value={value ?? ""} className={className} name='' id=''>
            {options.map((item,index)=>(
                <option key={index} value={item}>{item.replaceAll('_',' ')}</option>
            ))}
            <option value="__OUTRO__">Outro</option>
        </select>
    );
}

export default SelectInputMode;