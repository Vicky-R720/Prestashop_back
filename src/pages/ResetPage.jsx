import { deleteAllOrders } from "../services/commandeApi";
import { deleteAllPanier } from "../services/panierApi";
import { deleteAllProducts } from "../services/prestashopApi";

function ResetPage() {

    const handleResetAll = async () => {
        if (!confirm("Supprimer TOUTES les donnees (paniers, commandes, produits) ?")) return;

        const paniers = await deleteAllPanier();
        const commandes = await deleteAllOrders();
        const produits = await deleteAllProducts();

        console.log({ paniers, commandes, produits });
    };
    
    return (
        <div>
            <h2>Reset commandes</h2>
            <button
                type="button"
                onClick={async () => {
                    if (!confirm("Supprimer TOUTES les commandes ?")) return;
                    const results = await deleteAllOrders();
                    console.log(results);
                }}
            >
                Reset commandes
            </button>

            <h2>Reset paniers</h2>
            <button
                type="button"
                onClick={async () => {
                    if (!confirm("Supprimer TOUTES les paniers ?")) return;
                    const results = await deleteAllPanier();
                    console.log(results);
                }}
            >
                Reset paniers
            </button>

            <h2>Reset produits</h2>
            <button
                type="button"
                onClick={async () => {
                    if (!confirm("Supprimer TOUTES les produits ?")) return;
                    const results = await deleteAllProducts();
                    console.log(results);
                }}
            >
                Reset produits
            </button>
            <h2>Reset tout</h2>
            <button
                type="button"
                onClick={handleResetAll}
            >
                Reset tout
            </button>
        </div>
    );
}
export default ResetPage;