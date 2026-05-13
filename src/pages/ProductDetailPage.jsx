import { useParams } from "react-router-dom";

import Breadcrumbs from "../components/Breadcrumbs";
import ProductGallery from "../components/ProductGallery";
import ProductSpecs from "../components/ProductSpecs";
import RatingStars from "../components/RatingStars";
import { useStore } from "../services/store.jsx";
import { getProductById } from "../services/Produit.js";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useStore();

    const [product, setProduct] = useState(null);

    useEffect(() => {
        getProductById(id).then((data) => {
            setProduct(data);
        });
    }, [id]);


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
                    <RatingStars
                        value={product.rating || 0}
                        count={product.reviews || 0}
                    />
                    <p>{product.description}</p>
                    <div className="price-row">
                        <span className="price price--xl">{Number(product.price_ttc).toFixed(2)} EUR</span>
                        <button
                            className="button button--primary"
                            onClick={() => addToCart(product.id, 1)}
                            type="button"
                        >
                            Ajouter au panieryy
                        </button>
                    </div>
                    <div className="color-row">
                        <span>Couleurs</span>
                        <div className="color-row__dots">
                            {product.colors?.map((color) => (
                                <span key={color} className="color-dot" title={color} />
                            ))}
                        </div>
                    </div>
                    <ProductSpecs specs={product.specs || []} />
                </div>
            </div>
        </div>
    );
}
