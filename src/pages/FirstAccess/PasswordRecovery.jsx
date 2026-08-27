import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoRestaurant from "../../components/LogoRestaurant/LogoRestaurant";
import { login } from "../../services/auth";
import { m, LazyMotion, domAnimation } from "framer-motion";
import "./CSS/pass-recor.css";


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

            <div id="formulario">
                <section id="form-format">
                <div id="logo">
                    <LogoRestaurant />
                </div>
                    <h1> Recuperação de Senha</h1>

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

                        <button id="enviar"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar instruções para email"}
                        </button>

                           <button id="voltar"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Voltando..." : "Voltar"}
                        </button>

                    </form>
                </section>

                
            
                
                <div id="waves" aria-hidden="true">
                    <LazyMotion features={domAnimation} strict>
                        {}
                        <m.div
                            className="wave-track wave-back"
                            animate={{
                                x: ['0%', '-50%'],
                                y: [0, -12, 0],
                            }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: 'loop',
                                    duration: 20,
                                    ease: 'linear',
                                },
                                y: {
                                    repeat: Infinity,
                                    repeatType: 'mirror',
                                    duration: 7,
                                    ease: 'easeInOut',
                                },
                            }}
                        >
                            <svg
                                viewBox="0 0 2880 400"
                                fill="none"
                                preserveAspectRatio="none"
                                className="wave-svg"
                            >
                                <path
                                    d="M 0 100
                                   Q 360 20, 720 100
                                   T 1440 100
                                   Q 1800 20, 2160 100
                                   T 2880 100
                                   L 2880 400
                                   L 0 400 Z"
                                    fill="#221E52"
                                    fillOpacity="0.45"
                                />
                            </svg>
                        </m.div>
                        {}
                        <m.div
                            className="wave-track wave-front"
                            animate={{
                                x: ['-50%', '0%'],
                                y: [0, 10, 0],
                            }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: 'loop',
                                    duration: 13,
                                    ease: 'linear',
                                },
                                y: {
                                    repeat: Infinity,
                                    repeatType: 'mirror',
                                    duration: 5,
                                    ease: 'easeInOut',
                                },
                            }}
                        >
                            <svg
                                viewBox="0 0 2880 400"
                                fill="none"
                                preserveAspectRatio="none"
                                className="wave-svg"
                            >
                                <path
                                    d="M 0 80
                                   Q 360 150, 720 80
                                   T 1440 80
                                   Q 1800 150, 2160 80
                                   T 2880 80
                                   L 2880 400
                                   L 0 400 Z"
                                    fill="#15133C"
                                />
                            </svg>
                        </m.div>
                        {}
                        <div className="wave-bottom-fill" />
                    </LazyMotion>
                </div>
        </div>
        </main>
    );
}

export default Login;