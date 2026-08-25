import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SeaLogin from "../../components/SeaLogin/SeaLogin";
import LogoRestaurant from "../../components/LogoRestaurant/LogoRestaurant";
import { login } from "../../services/auth";
import "./CSS/login.css";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(form);

            // Guarda o token para usar nas próximas requisições
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("account", JSON.stringify(result.account));

            navigate("/dashboard"); // ajuste para a rota certa do seu app
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <SeaLogin />

            <div id="formulario">
                <section>
                    <h1> Bem vindo(a) <br />de volta</h1>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="E-mail"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <p>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>


                        <a href="/esqueci-senha">Esqueci minha senha</a>
                    </form>
                </section>

                <div id="imgTambaki-left">
                    <LogoRestaurant />
                </div>

            </div>
        </main>
    );
}

export default Login;