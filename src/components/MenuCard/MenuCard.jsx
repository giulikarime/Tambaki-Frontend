import './menu_card.css';

function getContrastColor(hexColor) {
    if (!hexColor) return '#000';
    const cleanHex = hexColor.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substr(2, 2), 16) || 0;
    const b = parseInt(cleanHex.substr(4, 2), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
}

function MenuCard({ item, onClick }) {
    let rawImg = '';
    if (Array.isArray(item?.img) && item.img.length > 0) {
        rawImg = item.img[0];
    } else if (typeof item?.img === 'string') {
        rawImg = item.img;
    }

    let imageUrl = '';
    if (rawImg) {
        if (rawImg.startsWith('http')) {
            imageUrl = rawImg;
        } else {
            const backendUrl = 'http://localhost:3000'; 
            imageUrl = `${backendUrl}/${rawImg.startsWith('/') ? rawImg.slice(1) : rawImg}`;
        }
    }

    return (
        <button type="button" className="menu-card menu-card-button" onClick={onClick}>
            <div className="menu-card-image-container">
                {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="menu-card-img" />
                ) : (
                    <div className="menu-card-no-image">Sem imagem</div>
                )}
            </div>

            <div className="menu-card-content">
                <div className="menu-card-header">
                    <h3 className="menu-card-title">{item?.name}</h3>
                    <span className="menu-card-price">
                        R$ {item?.price?.toFixed(2)}
                    </span>
                </div>

                <p className="menu-card-description">
                    {item?.description}
                </p>

                <div className="menu-card-tags">
                    {item?.tags?.map((tag, index) => (
                        <span 
                            key={index} 
                            className="menu-card-tag"
                            style={{
                                backgroundColor: tag.color || '#e0e0e0',
                                color: getContrastColor(tag.color)
                            }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            </div>
        </button>
    );
}

export default MenuCard;