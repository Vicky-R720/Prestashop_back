import { Link } from "react-router-dom";


function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo__mark">PS</div>
        <div>
          <p className="logo__name">Prestashop</p>
          <p className="logo__tag">Backoffice</p>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          <Link to="/">Dashboard</Link>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <path d="M4 6l3-3h10l3 3" />
            </svg>
          </span>
          <Link to="/products">Produits</Link>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 6h14l-1.5 12a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8z" />
              <path d="M9 10a3 3 0 0 0 6 0" />
            </svg>
          </span>
          <Link to="/commande">commande</Link>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4" />
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
            </svg>
          </span>
          <Link to="/reset">reset</Link>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20V10" />
              <path d="M10 20V4" />
              <path d="M16 20v-6" />
              <path d="M22 20V8" />
            </svg>
          </span>
          Analytics
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
              <path d="M4 12h2" />
              <path d="M18 12h2" />
              <path d="M12 4V2" />
              <path d="M12 22v-2" />
              <path d="M5.6 5.6 4.2 4.2" />
              <path d="M18.4 18.4 19.8 19.8" />
              <path d="M5.6 18.4 4.2 19.8" />
              <path d="M18.4 5.6 19.8 4.2" />
            </svg>
          </span>
          Settings
        </button>
      </nav>

      <div className="profile">
        <div className="profile__avatar">AM</div>
        <div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
