import { useParams } from "react-router-dom";

import Breadcrumbs from "../components/Breadcrumbs";
import ProductGallery from "../components/ProductGallery";
import ProductSpecs from "../components/ProductSpecs";
import RatingStars from "../components/RatingStars";
import ProductGrid from "../components/ProductGrid";
import { mockProducts } from "../services/mockData";
import { useStore } from "../services/store.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useStore();

  const product = mockProducts.find((item) => item.id === id);
  const related = mockProducts.filter((item) => item.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="page">
        <h2>Produit introuvable</h2>
        <p>Essayez une autre reference.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/products" },
          { label: product.name },
        ]}
      />

      <div className="product-detail">
        <ProductGallery images={product.images} name={product.name} />
        <div className="product-detail__info">
          <span className="badge">{product.badge}</span>
          <h2>{product.name}</h2>
          <RatingStars value={product.rating} count={product.reviews} />
          <p>{product.description}</p>
          <div className="price-row">
            <span className="price price--xl">{product.price.toFixed(2)} EUR</span>
            <button
              className="button button--primary"
              onClick={() => addToCart(product.id, 1)}
              type="button"
            >
              Ajouter au panier
            </button>
          </div>
          <div className="color-row">
            <span>Couleurs</span>
            <div className="color-row__dots">
              {product.colors.map((color) => (
                <span key={color} className="color-dot" title={color} />
              ))}
            </div>
          </div>
          <ProductSpecs specs={product.specs} />
        </div>
      </div>

      <section className="section">
        <h3>Produits associes</h3>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
