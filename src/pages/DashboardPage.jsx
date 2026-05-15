import { useEffect, useState } from "react";
import { getCommandeBydate } from "../services/DashboardApi";

function DashboardPage() {

    const [date, setDate] = useState("");
    const [commandes, setCommandes] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!date) return;

        async function load() {
            setLoading(true);

            const data = await getCommandeBydate(date);
            console.log("Commandes du jour :", data);
            setCommandes(data || []);

            setLoading(false);
        }

        load();

    }, [date]);

    const nbCommandes = commandes.length;

    const montantTotal = commandes.reduce((sum, c) => {
        return sum + (parseFloat(c.total_paid_tax_incl) || 0);
    }, 0);

    return (
        <>
            {/* INPUT DATE */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            {/* STATS */}
            <section className="stats">

                <article className="card">
                    <p className="card__label">Commandes du jour</p>
                    <p className="card__value">
                        {loading ? "..." : nbCommandes}
                    </p>
                </article>

                <article className="card">
                    <p className="card__label">Montant total</p>
                    <p className="card__value">
                        {loading
                            ? "..."
                            : `${montantTotal.toFixed(2)} €`}
                    </p>
                </article>

            </section>
        </>
    );
}

export default DashboardPage;