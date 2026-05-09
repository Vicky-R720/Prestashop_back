import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/prestashopApi";

function ProductDetailsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        async function loadProduct() {
            try {
                setIsLoading(true);
                const data = await getProductById(id);
                setProduct(data);
                setIsNew(
                    data.date_add
                        ? new Date(data.date_add) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        : false
                );
            } catch {
                setError("Impossible de charger le produit.");
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            loadProduct();
        }
    }, [id]);

    if (isLoading) {
        return <p>Chargement...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!product) {
        return <p>Produit introuvable.</p>;
    }

    
    const imageUrl = product.id_default_image
    ? `/Eval/api/images/products/${product.id}/${product.id_default_image}?ws_key=${import.meta.env.VITE_PRESTASHOP_API_KEY}`
    : "";

    return (
        <div>
            <h2>Détails du produit</h2>

            {imageUrl && <img src={imageUrl} alt={product.name} />}

            {product.on_sale === "1" && <span>En solde</span>}
            {isNew && <span>Nouveauté</span>}

            <p><strong>Nom:</strong> {product.name}</p>
            <p><strong>Marque:</strong> {product.manufacturer_name || "N/A"}</p>
            <p><strong>Reference:</strong> {product.reference}</p>
            <p><strong>Prix HT:</strong> {product.price_ht}</p>
            <p><strong>Prix TTC:</strong> {product.price_ttc}</p>
            <p><strong>Actif:</strong> {product.active === 1 ? "Oui" : "Non"}</p>
            <p><strong>Quantité:</strong> {product.quantity}</p>
            <p><strong>Etat:</strong> {product.condition}</p>

            <p><strong>Dimensions:</strong> {product.width} x {product.height} x {product.depth} cm</p>
            <p><strong>Poids:</strong> {product.weight} kg</p>

            <h4>Description courte</h4>
            <div dangerouslySetInnerHTML={{ __html: product.description_short }} />

            <h4>Description longue</h4>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
    );
}

export default ProductDetailsPage;