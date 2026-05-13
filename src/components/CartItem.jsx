import QuantityStepper from "./QuantityStepper";

export default function CartItem({ item, onRemove, onUpdate }) {
  return (
    <div className="cart-item">
      <img src={item.product.images[0]} alt={item.product.name} />
      <div className="cart-item__info">
        <div>
          <h4>{item.product.name}</h4>
          <p>{item.product.description}</p>
        </div>
        <div className="cart-item__actions">
          <span className="price">{item.product.price.toFixed(2)} EUR</span>
          <QuantityStepper
            value={item.qty}
            onChange={(value) => onUpdate(item.product.id, value)}
          />
          <button
            className="link-button"
            onClick={() => onRemove(item.product.id)}
            type="button"
          >
            Retirer
          </button>
        </div>
      </div>
    </div>
  );
}
