import QuantityStepper from "./QuantityStepper";

export default function CartItem({ item, onRemove, onUpdate }) {
    return (
        <div className="cart-item">
            <img src={item.image} alt={item.name} />

            <div className="cart-item__info">
                <div>
                    <h4>{item.name}</h4>
                    <p className="cart-item__price-unit">
                        {item.price.toFixed(2)} EUR / unité
                    </p>
                </div>

                <div className="cart-item__actions">
                    <span className="price">
                        {(item.price * item.quantity).toFixed(2)} EUR
                    </span>

                    <QuantityStepper
                        value={item.quantity}
                        onChange={(value) => onUpdate(item.id_product, value)}
                    />

                    <button
                        className="link-button"
                        onClick={() => onRemove(item.id_product)}
                        type="button"
                    >
                        Retirer
                    </button>
                </div>
            </div>
        </div>
    );
}
