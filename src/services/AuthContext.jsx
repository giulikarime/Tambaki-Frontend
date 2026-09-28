import { createContext, useState, useEffect } from "react";
import { login as loginService, logout as logoutService } from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ao carregar a aplicação, recupera a sessão salva no localStorage (se existir)
    useEffect(() => {
        const storedAccount = localStorage.getItem('account');
        if (storedAccount) {
            try {
                setAccount(JSON.parse(storedAccount));
            } catch (error) {
                console.error("Erro ao ler dados da conta salva.", error);
                localStorage.removeItem('account');
                localStorage.removeItem('accessToken');
            }
        }
        setLoading(false);
    }, []);

    async function login(email, password) {
        const data = await loginService({ email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('account', JSON.stringify(data.account));
        setAccount(data.account);
        return data;
    }

    async function logout() {
        await logoutService();
        setAccount(null);
    }

    return (
        <AuthContext.Provider value={{ user: account, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}