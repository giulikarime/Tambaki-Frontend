import logo from '../../assets/Tambaki_Prototype.png'
import './logo_restaurant.css'

function LogoRestaurant() {
    return (
        <div id="group-logo">
            <img
                src={logo}
                alt="Logo Tambaki"
            />
            <div id="group-texts">
                <h2>Sabor & Cia</h2>
                <p>Doce Sabor LTDA</p>
            </div>
        </div>
    );
}

export default LogoRestaurant;