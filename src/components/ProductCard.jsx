import { Link } from "react-router-dom";

import RatingStars from "./RatingStars";
import { useStore } from "../services/store.jsx";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <article className="product-card">
      <div className="product-card__media">
        <img src={product.images[0]} alt={product.name} />
        <span className="badge">{product.badge}</span>
        <button
          className={
            isWishlisted ? "wishlist-btn wishlist-btn--active" : "wishlist-btn"
          }
          onClick={() => toggleWishlist(product.id)}
          type="button"
          aria-label="Ajouter a la wishlist"
        >
          <HeartIcon />
        </button>
      </div>
      <div className="product-card__info">
        <div>
          <Link to={`/products/${product.id}`} className="product-card__name">
            {product.name}
          </Link>
          <RatingStars value={product.rating} count={product.reviews} />
        </div>
        <div className="product-card__footer">
          <span className="price">{product.price.toFixed(2)} EUR</span>
          <button
            className="button button--small"
            onClick={() => addToCart(product.id, 1)}
            type="button"
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.3-9-8.2C1 8.6 3 6 5.8 6c1.7 0 3.1.9 4 2.2C10.7 6.9 12.2 6 13.8 6 16.5 6 18.5 8.6 18 11.8 17 15.7 12 20 12 20z" />
    </svg>
  );
}
