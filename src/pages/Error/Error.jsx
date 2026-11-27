import { useLocation, Link } from 'react-router-dom';
import './error.css';

function Error(){
    
    const location = useLocation();
    const codigo = location.state?.codigo || 404;
    const mensagem = location.state?.mensagem || 'A página que você procura não existe.';

    return(
        <main className="error-page">
            <section className="error-card" aria-labelledby="error-title">
                <p className="error-code">Erro {codigo}</p>
                <h1 id="error-title">Ops, algo deu errado</h1>
                <p className="error-message">{mensagem}</p>
                <Link className="error-home-link" to="/">Voltar para a página inicial</Link>
            </section>
        </main>
    );
}

export default Error;