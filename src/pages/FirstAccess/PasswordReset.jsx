import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoRestaurant from "../../components/LogoRestaurant/LogoRestaurant"; 
import { m, LazyMotion, domAnimation } from "framer-motion";
import { Eye, EyeOff } from 'lucide-react';
import './CSS/pass-reset.css'
import Modal from 'react-modal'

function PasswordReset(){
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [type, setType] = useState('password');
    const [confirmType, setConfirmType] = useState('password');

    const [passwordConfirmationIsOpen, setPasswordConfirmationIsOpen] = useState(false);
    function close_modal(){
        setPasswordConfirmationIsOpen(false);
    }
    const modalPasswordStyle = {
        overlay:{
            backgroundColor: 'transparent',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content:{
            position: 'absolute',
            top: '10%',
            left:'50%',
            transform: 'translate(-50%,-50%)',
            bottom: 'auto',
            width: '500px',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: 'rgb(210, 255, 138)',
            display:'flex',
            flexDirection:'column',
            gap:'20px',
            color: '#00a31691'
        }
    }

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleToggle = () => {
        setType((prev) => (prev === 'password' ? 'text' : 'password'));
    };

    const handleConfirmToggle = () => {
        setConfirmType((prev) => (prev === 'password' ? 'text' : 'password'));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.password !== form.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ password: form.password });
            setPasswordConfirmationIsOpen(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    function redirect(url){
        navigate(url);
    }

    function back_redirect(){
        navigate('/');
    }

    return (
    <main>
        <div id="formulario-reset">
            <section id="form-format-reset">
                <div id="top-container-reset">
                    <h1>Redefinição de Senha</h1>

                    <form onSubmit={handleSubmit}>

                        <p className="p-y">Altere e confirme sua nova senha</p>

                        {error && <p className="error-message">{error}</p>}

                        <div className="form-input">
                            <input
                                type={type}
                                name="password"
                                id="password"
                                placeholder="Senha"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <span id="toggle-icon-password" className="toggle-icon" onClick={handleToggle}>
                                {type === 'password' ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>

                        <div className="form-input">
                            <input
                                type={confirmType}
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirme sua Senha"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span id="toggle-icon-confirm-password" className="toggle-icon" onClick={handleConfirmToggle}>
                                {confirmType === 'password' ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>

                        <button
                            id="confirm-password"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar Alteraçôes"}
                        </button>
                    </form>
                </div>

                <div id="logo-reset">
                    <LogoRestaurant/>
                </div>

            </section>
               <div id="waves" aria-hidden="true">
                    <LazyMotion features={domAnimation} strict>
                        <m.div
                            className="wave-track wave-back"
                            animate={{
                                x: ['0%', '-50%'],
                                y: [0, -12, 0],
                            }}
                            transition={{
                                x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' },
                                y: { repeat: Infinity, repeatType: 'mirror', duration: 7, ease: 'easeInOut' },
                            }}
                        >
                            <svg viewBox="0 0 2880 400" fill="none" preserveAspectRatio="none" className="wave-svg">
                                <path
                                    d="M 0 100 Q 360 20, 720 100 T 1440 100 Q 1800 20, 2160 100 T 2880 100 L 2880 400 L 0 400 Z"
                                    fill="#221E52"
                                    fillOpacity="0.45"
                                />
                            </svg>
                        </m.div>
                        <m.div
                            className="wave-track wave-front"
                            animate={{
                                x: ['-50%', '0%'],
                                y: [0, 10, 0],
                            }}
                            transition={{
                                x: { repeat: Infinity, repeatType: 'loop', duration: 13, ease: 'linear' },
                                y: { repeat: Infinity, repeatType: 'mirror', duration: 5, ease: 'easeInOut' },
                            }}
                        >
                            <svg viewBox="0 0 2880 400" fill="none" preserveAspectRatio="none" className="wave-svg">
                                <path
                                    d="M 0 80 Q 360 150, 720 80 T 1440 80 Q 1800 150, 2160 80 T 2880 80 L 2880 400 L 0 400 Z"
                                    fill="#15133C"
                                />
                            </svg>
                        </m.div>
                        <div className="wave-bottom-fill" />
                    </LazyMotion>
                </div>
        </div>
        <Modal
            isOpen={passwordConfirmationIsOpen}
            onRequestClose={close_modal}
            contentLabel="Alterei Senha"
            shouldCloseOnOverlayClick={true}
            style={modalPasswordStyle}
            className='modal-password-confirmation'
        >
            <p>Senha alterada com sucesso!</p>
        </Modal>

    </main>
    );
}

export default PasswordReset;