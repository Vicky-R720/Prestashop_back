import { get_order_state } from "../services/commande";
import { useState, useEffect } from "react";
import "../css/table.css";

function CommandesTable({ commandes }) {

    const [states, setStates] = useState({});
    useEffect(() => {

        async function loadStates() {

            const newStates = {};

            for (const c of commandes) {

                const stateName = await get_order_state(c.current_state);

                newStates[c.current_state] = stateName;
            }

            setStates(newStates);
        }

        if (commandes?.length > 0) {
            loadStates();
        }

    }, [commandes]);

    if (!commandes || commandes.length === 0) {
        return <p>Aucune commande disponible.</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Livraison</th>
                        <th>Total</th>
                        <th>Paiement</th>
                        <th>Etat</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>
                    {commandes.map((c) => {

                        const state =
                            states[c.current_state] || "Chargement...";

                        let statusClass = "pending";

                        if (
                            state.toLowerCase().includes("livré") ||
                            state.toLowerCase().includes("accepté")
                        ) {
                            statusClass = "success";
                        }

                        if (
                            state.toLowerCase().includes("annulé")
                        ) {
                            statusClass = "cancel";
                        }

                        return (
                            <tr key={c.id}>
                                <td>{c.delivery_address || "-"}</td>

                                <td className="price">
                                    {c.total_paid_tax_incl} €
                                </td>

                                <td>
                                    <span className="payment">
                                        {c.payment}
                                    </span>
                                </td>

                                <td>
                                    <span className={`status ${statusClass}`}>
                                        {state}
                                    </span>
                                </td>

                                <td>{c.date_add}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default CommandesTable;