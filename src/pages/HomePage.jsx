import { useEffect, useMemo, useState } from "react";

import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import SectionHeader from "../components/SectionHeader";
import { getProducts } from "../services/Produit";

const ITEMS_PER_PAGE = 5;

const STATIC_FALLBACK =
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=900&auto=format&fit=crop";

const buildImageUrl = (p) => {
    if (p?.id && p?.id_default_image) {
        return `/Eval/api/images/products/${p.id}/${p.id_default_image}?ws_key=${import.meta.env.VITE_PRESTASHOP_API_KEY}`;
    }
    return STATIC_FALLBACK;
};

const toUiProduct = (p) => ({
    id: String(p.id),
    name: p.name || "Produit",
    price: Number.parseFloat(
        String(p.price_ttc ?? p.price_ht ?? "0").replace(",", ".")
    ) || 0,
    images: [buildImageUrl(p)],
    badge: "New",
    rating: 4.6,
    reviews: 120,
    colors: ["Crimson", "Onyx"],
    description: p.description_short || "Description a venir",
    specs: [
        { label: "Reference", value: p.reference || "-" },
        { label: "Etat", value: p.condition || "-" },
        { label: "Poids", value: p.weight || "-" },
    ],
});

export default function ProductListingPage() {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        getProducts()
            .then((data) => {
                if (!isMounted) return;
                const mapped = (Array.isArray(data) ? data : []).map(toUiProduct);
                console.log("Fetched products:", mapped);
                setItems(mapped);
                setError("");
            })
            .catch((err) => {
                if (!isMounted) return;
                setItems([]);
                setError(err?.message || "Impossible de charger les produits.");
            })
            .finally(() => {
                if (!isMounted) return;
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

    const products = useMemo(() => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [items, page]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            queueMicrotask(() => setPage(1));
        }
    }, [page, totalPages]);

    return (
        <div className="page">
            <SectionHeader
                title="Liste des produits"
                subtitle="Un mix de bestsellers et de nouvelles sorties."
                action={<button className="button button--ghost">Filtrer</button>}
            />

            <div className="toolbar">
                <span>{items.length} produits</span>
                <div className="toolbar__actions">
                    <button className="chip chip--active" type="button">
                        Populaire
                    </button>
                    <button className="chip" type="button">
                        Prix
                    </button>
                    <button className="chip" type="button">
                        Nouveaute
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Chargement des produits...</p>
            ) : error ? (
                <p>{error}</p>
            ) : products.length === 0 ? (
                <p>Aucun produit disponible.</p>
            ) : (
                <ProductGrid products={products} />
            )}

            <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
    );
}