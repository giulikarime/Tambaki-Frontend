import { useState } from "react";

function SelectInputMode({ options, value, onChange, className }) {
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customText, setCustomText] = useState("");

    function handleSelectChange(e) {
        const selected = e.target.value;
        if (selected === '__OUTRO__') {
            setIsCustomMode(true);
            setCustomText("");
            onChange({ type: 'CUSTOM', id: null, text: "" });
        } else {
            onChange({ type: 'EXISTING', id: parseInt(selected), text: null });
        }
    }

    function handleCustomChange(e) {
        const text = e.target.value;
        setCustomText(text);
        onChange({ type: 'CUSTOM', id: null, text });
    }

    if (isCustomMode) {
        return (
            <input
                className={className}
                type="text"
                autoFocus
                value={customText}
                placeholder="Digite um novo valor"
                onChange={handleCustomChange}
            />
        );
    }

    return (
        <select
            className={className}
            value={value?.type === 'EXISTING' ? (value.id ?? "") : ""}
            onChange={handleSelectChange}
        >
            <option value="" disabled>Selecione uma opção</option>
            {options.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name?.replaceAll('_', ' ')}</option>
            ))}
            <option value="__OUTRO__">Outro</option>
        </select>
    );
}

export default SelectInputMode;