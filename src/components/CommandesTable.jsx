import { Link } from "react-router-dom";

function CommandesTable({ commandes }) {
    if (!commandes || commandes.length === 0) {
        return <p>Aucune commande disponible.</p>;
    }

    return (
        <table border="1" width="100%">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reference</th>
                    <th>Nouveau Client</th>
                    <th>Livraison</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Paiement</th>
                    <th>Etat</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {commandes.map((c) => (
                    <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.reference}</td>
                        <td>{c.valid === "1" ? "Oui" : "Non"}</td>
                        <td>{c.delivery_address || "-"}</td>
                        <td>{c.id_customer}</td>
                        <td>{c.total_paid_tax_incl}</td>
                        <td>{c.payment}</td>
                        <td>{c.current_state}</td>
                        <td>{c.date_add}</td>
                        <td>
                            <Link to={`/orders/${c.id}`}>Voir</Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default CommandesTable;