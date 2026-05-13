import CartItem from "../components/CartItem";
import SectionHeader from "../components/SectionHeader";
import { useStore } from "../services/store.jsx";

export default function CartPage() {
  const { cartItems, cartSubtotal, removeFromCart, updateQty } = useStore();

  return (
    <div className="page">
      <SectionHeader
        title="Votre panier"
        subtitle="Finalisez votre selection en toute confiance."
      />

      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.length === 0 ? (
            <p>Votre panier est vide.</p>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onRemove={removeFromCart}
                onUpdate={updateQty}
              />
            ))
          )}
        </div>
        <aside className="summary">
          <h3>Resume</h3>
          <div className="summary__row">
            <span>Sous-total</span>
            <strong>{cartSubtotal.toFixed(2)} EUR</strong>
          </div>
          <div className="summary__row">
            <span>Livraison</span>
            <strong>Gratuit</strong>
          </div>
          <div className="summary__total">
            <span>Total</span>
            <strong>{cartSubtotal.toFixed(2)} EUR</strong>
          </div>
          <button className="button button--primary">Commander</button>
          <button className="button button--ghost">Continuer shopping</button>
        </aside>
      </div>
    </div>
  );
}
