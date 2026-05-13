import SectionHeader from "../components/SectionHeader";
import { mockOrders, mockUser } from "../services/mockData";

export default function ProfilePage() {
  return (
    <div className="page">
      <SectionHeader
        title="Mon profil"
        subtitle="Gerer vos informations et vos commandes."
      />

      <div className="profile-grid">
        <div className="profile-card">
          <h3>{mockUser.name}</h3>
          <p>{mockUser.email}</p>
          <span className="badge">{mockUser.tier}</span>
          <div className="profile-meta">
            <div>
              <strong>{mockUser.points}</strong>
              <span>Points fidelite</span>
            </div>
            <div>
              <strong>{mockUser.memberSince}</strong>
              <span>Membre depuis</span>
            </div>
          </div>
          <button className="button button--ghost">Editer profil</button>
        </div>

        <div className="profile-card profile-card--wide">
          <h3>Adresse principale</h3>
          <p>{mockUser.address}</p>
          <div className="address-actions">
            <button className="button button--primary">Nouvelle adresse</button>
            <button className="button button--ghost">Mettre a jour</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Dernieres commandes</h3>
        <div className="orders">
          {mockOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div>
                <strong>{order.id}</strong>
                <span>{order.date}</span>
              </div>
              <div>
                <strong>{order.total.toFixed(2)} EUR</strong>
                <span className="status">{order.status}</span>
              </div>
              <button className="button button--small">Voir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
