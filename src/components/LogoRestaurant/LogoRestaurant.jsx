import logo from '../../assets/Tambaki_Prototype.png'

function LogoRestaurant() {
    return (
        <div id="group-logo">
            <img
                src={logo}
                alt="Logo Tambaki"
            />
            <div id="group-texts">
                <h2>Unidade X</h2>
                <p>Restaurante</p>
            </div>
        </div>
    );
}

export default LogoRestaurant;