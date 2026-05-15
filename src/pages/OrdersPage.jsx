import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerSession, clearCustomerSession } from "../services/CustomerSession";
import SectionHeader from "../components/SectionHeader";
import { getCommandeByCustomer } from "../services/commande";
import CommandesTable from "../components/CommandeTable";

/* ── Mapping état → style visuel ───────────────────────── */
const STATE_STYLES = {
  /* Termes FR courants dans PrestaShop */
  "en attente de paiement":       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⏳" },
  "paiement accepte":             { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "paiement accepté":             { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "preparation en cours":         { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "📦" },
  "préparation en cours":         { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "📦" },
  "en cours de livraison":        { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "🚚" },
  "livre":                        { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "livré":                        { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "annule":                       { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: "❌" },
  "annulé":                       { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: "❌" },
  "rembourse":                    { color: "#6b7280", bg: "rgba(107,114,128,0.12)",icon: "↩️" },
  "remboursé":                    { color: "#6b7280", bg: "rgba(107,114,128,0.12)",icon: "↩️" },
  /* EN fallbacks */
  "awaiting check payment":       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⏳" },
  "awaiting bank wire payment":   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⏳" },
  "payment accepted":             { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "processing in progress":       { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "📦" },
  "shipped":                      { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "🚚" },
  "delivered":                    { color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: "✅" },
  "canceled":                     { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: "❌" },
  "refund":                       { color: "#6b7280", bg: "rgba(107,114,128,0.12)",icon: "↩️" },
};

const DEFAULT_STYLE = { color: "#6b667a", bg: "rgba(107,102,122,0.1)", icon: "📋" };

function getStatusStyle(status) {
  if (!status) return DEFAULT_STYLE;
  const key = status.toLowerCase().trim();
  return STATE_STYLES[key] || DEFAULT_STYLE;
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === "0000-00-00 00:00:00") return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(value) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}

/* ── Composant stepper visuel pour le suivi ──────────── */
const TRACKING_STEPS = [
  { key: "placed",    label: "Commande passee",    icon: "🛒" },
  { key: "confirmed", label: "Paiement confirme",  icon: "✅" },
  { key: "preparing", label: "En preparation",     icon: "📦" },
  { key: "shipped",   label: "Expedie",            icon: "🚚" },
  { key: "delivered",  label: "Livre",             icon: "🏠" },
];

function getStepIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase().trim();

  if (["annule", "annulé", "canceled"].some(k => s.includes(k))) return -1;
  if (["rembourse", "remboursé", "refund"].some(k => s.includes(k))) return -1;
  if (["livre", "livré", "delivered"].some(k => s.includes(k))) return 4;
  if (["livraison", "shipped", "en cours de livraison"].some(k => s.includes(k))) return 3;
  if (["preparation", "préparation", "processing"].some(k => s.includes(k))) return 2;
  if (["accepte", "accepté", "accepted", "payment"].some(k => s.includes(k))) return 1;
  return 0;
}

function TrackingStepper({ status }) {
  const current = getStepIndex(status);
  const isCancelled = current === -1;

  if (isCancelled) {
    return (
      <div className="tracking-cancelled">
        <span className="tracking-cancelled__icon">❌</span>
        <span>Commande annulee / remboursee</span>
      </div>
    );
  }

  return (
    <div className="tracking-stepper">
      {TRACKING_STEPS.map((step, i) => {
        const isDone = i <= current;
        const isActive = i === current;
        return (
          <div
            key={step.key}
            className={`tracking-step ${isDone ? "tracking-step--done" : ""} ${isActive ? "tracking-step--active" : ""}`}
          >
            <div className="tracking-step__dot">
              <span>{step.icon}</span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`tracking-step__line ${isDone ? "tracking-step__line--done" : ""}`} />
            )}
            <span className="tracking-step__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Page principale ─────────────────────────────────── */
export default function OrdersPage() {
  const navigate = useNavigate();
  const session = getCustomerSession();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    if (!session) return;
    
    // Si la session est corrompue (manque l'ID), on nettoie et on recharge
    if (!session.id) {
      clearCustomerSession();
      window.location.reload();
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        const data2 = await getCommandeByCustomer(session.id);
        console.log(session.id);
        setCommandes(data2);
        if (!cancelled) {
          setOrders(data2);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [session?.id]);

  /* Pas connecté → rediriger */
  if (!session) {
    return (
      <div className="page">
        <div className="orders-empty">
          <span className="orders-empty__icon">🔒</span>
          <h2>Connexion requise</h2>
          <p>Veuillez vous connecter pour voir vos commandes.</p>
          <button
            className="button button--primary"
            onClick={() => navigate("/auth")}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <SectionHeader
        title="Mes commandes"
        subtitle={`Suivi de vos commandes, ${session.firstname}`}
      />

      
        <div className="orders-loading">
          <div/>
          <CommandesTable commandes={commandes} />
        </div>

      {/* {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <span className="orders-empty__icon">📭</span>
          <h2>Aucune commande</h2>
          <p>Vous n&apos;avez pas encore passe de commande.</p>
          <button
            className="button button--primary"
            onClick={() => navigate("/products")}
          >
            Decouvrir nos produits
          </button>
        </div>
      )} */}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const style = getStatusStyle(order.status);
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className={`order-card-v2 ${isExpanded ? "order-card-v2--expanded" : ""}`}
              >

                {/* Détails dépliables */}
                {isExpanded && (
                  <div className="order-card-v2__details">
                    <TrackingStepper status={order.status} />

                    <div className="order-card-v2__info-grid">
                      <div className="order-info-pill">
                        <span className="order-info-pill__icon">💳</span>
                        <div>
                          <span className="order-info-pill__label">Paiement</span>
                          <strong>{order.payment || "—"}</strong>
                        </div>
                      </div>
                      <div className="order-info-pill">
                        <span className="order-info-pill__icon">🚚</span>
                        <div>
                          <span className="order-info-pill__label">Transporteur</span>
                          <strong>{order.carrier || "—"}</strong>
                        </div>
                      </div>
                      <div className="order-info-pill">
                        <span className="order-info-pill__icon">📦</span>
                        <div>
                          <span className="order-info-pill__label">Articles</span>
                          <strong>{order.itemsCount} article{order.itemsCount > 1 ? "s" : ""}</strong>
                        </div>
                      </div>
                      <div className="order-info-pill">
                        <span className="order-info-pill__icon">🆔</span>
                        <div>
                          <span className="order-info-pill__label">N° commande</span>
                          <strong>{order.id}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
