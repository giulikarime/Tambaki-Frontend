import './menu.css'

// Uso: <MenuCard img={...} name={...} description={...} price={...} />

function MenuCard({ img, name, description, price }) {
    return (
        <div className="menuFood-card">

            <div className="imgMenu">
                <img src={img} alt={name} />
            </div>

            <div className="menuCard-bottom">
                <h2 className="menuTitle">{name}</h2>
                <p className="menuDescription">{description}</p>
                <span className="menuPrice">
                    {price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </span>
            </div>

        </div>
    );
}

export default MenuCard