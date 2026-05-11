import { deleteAllOrders } from "../services/commandeApi";

function ResetPage() {
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
        </div>
    );
}
export default ResetPage;