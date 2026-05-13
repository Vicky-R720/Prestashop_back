import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "../components/Breadcrumbs";
import ProductGallery from "../components/ProductGallery";
import ProductSpecs from "../components/ProductSpecs";
import RatingStars from "../components/RatingStars";
import { getProductById } from "../services/Produit.js";
import { ajouterAuPanier } from "../services/Panier.js";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [size, setSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getProductById(id).then((data) => {
            setProduct(data);
        });
    }, [id]);

    const handleQuantityChange = (event) => {
        const nextValue = Number(event.target.value);
        if (!Number.isFinite(nextValue) || nextValue <= 0) {
            setQuantity(1);
            return;
        }
        setQuantity(nextValue);
    };

    // ─── Ajouter au panier ─────────────────────────────────────
    async function handleAjouter() {
        setAjoutEnCours(true);
        setMessage("");

        try {
            await ajouterAuPanier(product.id, quantity);
            setMessage("✓ Ajouté au panier !");

            // Déclencher un événement pour mettre à jour le compteur Navbar
            window.dispatchEvent(new Event("cart-updated"));

            // Effacer le message après 2 secondes
            setTimeout(() => setMessage(""), 2000);
        } catch (err) {
            console.error("Erreur ajout panier:", err);
            setMessage("Erreur lors de l'ajout");
        }

        setAjoutEnCours(false);
    }

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
                    <div className="option-row">
                        <label className="option-row__label" htmlFor="size-input">
                            Taille
                        </label>
                        <input
                            id="size-input"
                            type="text"
                            value={size}
                            onChange={(event) => setSize(event.target.value)}
                            placeholder="S / M / L"
                        />
                    </div>
                    <div className="option-row">
                        <label className="option-row__label" htmlFor="qty-input">
                            Quantite
                        </label>
                        <input
                            id="qty-input"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={handleQuantityChange}
                        />
                    </div>
                    <div className="price-row">
                        <span className="price price--xl">
                            {Number(product.price_ttc).toFixed(2)} EUR
                        </span>
                        <button
                            className="button button--primary button--add"
                            type="button"
                            onClick={handleAjouter}
                            disabled={ajoutEnCours}
                        >
                            {ajoutEnCours ? "Ajout..." : "Ajouter"}
                        </button>
                    </div>

                    {message && (
                        <p className="cart-message">{message}</p>
                    )}

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
