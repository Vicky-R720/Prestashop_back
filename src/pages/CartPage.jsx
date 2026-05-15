import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import CartItem from "../components/CartItem";
import { getPanier, changerQuantite, retirerDuPanier, viderPanier } from "../services/Panier";
import { getProductById } from "../services/Produit";

const STATIC_FALLBACK = "/placeholder.png";

/** Construit l'URL d'image d'un produit */
function buildImageUrl(product) {
    if (product?.id && product?.id_default_image) {
        return `/api/images/products/${product.id}/${product.id_default_image}?ws_key=${import.meta.env.VITE_PRESTASHOP_API_KEY}`;
    }
    return STATIC_FALLBACK;
}

export default function CartPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ─── Charger le panier ─────────────────────────────────────
    async function chargerPanier() {
        setLoading(true);
        try {
            const panier = await getPanier();

            if (!panier || panier.items.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            // Récupérer les détails de chaque produit
            const detailed = await Promise.all(
                panier.items.map(async (row) => {
                    try {
                        const product = await getProductById(row.id_product);
                        return {
                            id_product: row.id_product,
                            id_product_attribute: row.id_product_attribute,
                            quantity: row.quantity,
                            name: product.name || "Produit",
                            reference: product.reference || "",
                            price: parseFloat(product.price_ttc) || 0,
                            image: buildImageUrl(product),
                            description: product.description_short || "",
                        };
                    } catch {
                        return null;
                    }
                })
            );

            setItems(detailed.filter(Boolean));
        } catch (err) {
            console.error("Erreur chargement panier:", err);
            setItems([]);
        }
        setLoading(false);
    }

    useEffect(() => {
        chargerPanier();
    }, []);

    // ─── Modifier la quantité ──────────────────────────────────
    async function handleUpdate(idProduct, newQty) {
        await changerQuantite(idProduct, newQty);
        await chargerPanier();
    }

    // ─── Retirer un produit ────────────────────────────────────
    async function handleRemove(idProduct) {
        await retirerDuPanier(idProduct);
        await chargerPanier();
    }

    // ─── Vider le panier ───────────────────────────────────────
    async function handleClear() {
        await viderPanier();
        setItems([]);
    }

    // ─── Calculs ───────────────────────────────────────────────
    const sousTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const total = sousTotal;

    // ─── Rendu ─────────────────────────────────────────────────
    return (
        <div className="page">
            <SectionHeader
                title="Votre panier"
                subtitle="Finalisez votre selection en toute confiance."
            />

            {loading ? (
                <p>Chargement du panier...</p>
            ) : items.length === 0 ? (
                <div className="cart-layout">
                    <div className="cart-list">
                        <div className="cart-empty">
                            <p>Votre panier est vide.</p>
                            <button
                                className="button button--primary"
                                onClick={() => navigate("/products")}
                            >
                                Voir le catalogue
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-list">
                        {items.map((item) => (
                            <CartItem
                                key={item.id_product}
                                item={item}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                            />
                        ))}

                        <button
                            className="button button--ghost"
                            onClick={handleClear}
                            type="button"
                        >
                            Vider le panier
                        </button>
                    </div>

                    <aside className="summary">
                        <h3>Résumé</h3>
                        <div className="summary__row">
                            <span>Sous-total</span>
                            <strong>{sousTotal.toFixed(2)} EUR</strong>
                        </div>
                        <div className="summary__row">
                            <span>Livraison</span>
                            <strong>Gratuit</strong>
                        </div>
                        <div className="summary__total">
                            <span>Total</span>
                            <strong>{total.toFixed(2)} EUR</strong>
                        </div>
                        <button
                            className="button button--primary"
                            onClick={() => navigate("/checkout")}
                            type="button"
                        >
                            Commander
                        </button>
                        <button
                            className="button button--ghost"
                            onClick={() => navigate("/products")}
                        >
                            Continuer shopping
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
}
