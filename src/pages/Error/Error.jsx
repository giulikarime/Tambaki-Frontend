import { useLocation, Link } from 'react-router-dom';

function Error(){
    
    const location = useLocation();
    const codigo = location.state?.codigo || 404;
    const mensagem = location.state?.mensagem || 'A página que você procura não existe.';

    return(
        <main>
            <h1>Erro {codigo}</h1>
            <p>{mensagem}</p>
            <Link to="/">Voltar para a página inicial</Link>
        </main>
    );
}

export default Error;