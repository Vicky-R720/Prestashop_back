import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCustomer,
  loginCustomer,
  saveCustomerSession,
  getCustomerSession,
  clearCustomerSession,
} from "../services/CustomerSession"; // ✅ un seul import

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstname, setRegFirstname] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBirthday, setRegBirthday] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const session = getCustomerSession();
  if (session) {
    return (
      <div className="page auth">
        <div className="auth__panel">
          <div className="auth__connected">
            <div className="auth__avatar">
              {session.firstname?.[0]?.toUpperCase() || "U"}
            </div>
            <h2>Bonjour, {session.firstname} {session.lastname} 👋</h2>
            <p className="auth__connected-email">{session.email}</p>
            <div className="auth__connected-actions">
              <button className="button button--primary" onClick={() => navigate("/orders")}>
                📦 Mes commandes
              </button>
              <button className="button button--ghost" onClick={() => navigate("/profile")}>
                Mon profil
              </button>
              <button
                className="button button--ghost auth__logout-btn"
                onClick={() => {
                  clearCustomerSession();
                  window.dispatchEvent(new Event("auth-changed"));
                  window.location.reload();
                }}
              >
                Se deconnecter
              </button>
            </div>
          </div>
        </div>
        <div className="auth__visual">
          <h2>Bienvenue chez Prestashop Studio</h2>
          <p>Un espace inspire par les meilleures experiences ecommerce pour un parcours fluide et premium.</p>
          <div className="auth__stats">
            <div><strong>+12k</strong><span>Clients actifs</span></div>
            <div><strong>48h</strong><span>Livraison express</span></div>
            <div><strong>4.9</strong><span>Note moyenne</span></div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const customer = await loginCustomer(loginEmail, loginPassword);
      saveCustomerSession(customer);
      setSuccess("Connexion reussie ! Redirection...");
      window.dispatchEvent(new Event("auth-changed"));
      setTimeout(() => navigate("/orders"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!regFirstname.trim() || !regLastname.trim()) return setError("Veuillez remplir le prenom et le nom");
    if (!regEmail.trim()) return setError("Veuillez entrer un email");
    if (regPassword.length < 5) return setError("Le mot de passe doit contenir au moins 5 caracteres");

    setLoading(true);
    try {
      await createCustomer(regFirstname.trim(), regLastname.trim(), regEmail.trim(), regPassword, regBirthday || "0000-00-00");
      const customer = await loginCustomer(regEmail.trim(), regPassword);
      saveCustomerSession(customer);
      setSuccess("Compte cree avec succes ! Redirection...");
      window.dispatchEvent(new Event("auth-changed"));
      setTimeout(() => navigate("/orders"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth__panel">
        <div className="auth__tabs">
          <button className={mode === "login" ? "tab is-active" : "tab"} onClick={() => { setMode("login"); setError(""); setSuccess(""); }} type="button">
            Connexion
          </button>
          <button className={mode === "register" ? "tab is-active" : "tab"} onClick={() => { setMode("register"); setError(""); setSuccess(""); }} type="button">
            Creer un compte
          </button>
        </div>

        {error && <div className="auth__message auth__message--error">{error}</div>}
        {success && <div className="auth__message auth__message--success">{success}</div>}

        {mode === "login" ? (
          <form className="auth__form" onSubmit={handleLogin}>
            <label>Email
              <input type="email" placeholder="vous@mail.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loading} />
            </label>
            <label>Mot de passe
              <input type="password" placeholder="********" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={loading} />
            </label>
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form className="auth__form" onSubmit={handleRegister}>
            <div className="auth__form-row">
              <label>Prenom
                <input type="text" placeholder="Votre prenom" value={regFirstname} onChange={(e) => setRegFirstname(e.target.value)} required disabled={loading} />
              </label>
              <label>Nom
                <input type="text" placeholder="Votre nom" value={regLastname} onChange={(e) => setRegLastname(e.target.value)} required disabled={loading} />
              </label>
            </div>
            <label>Email
              <input type="email" placeholder="vous@mail.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required disabled={loading} />
            </label>
            <label>Mot de passe
              <input type="password" placeholder="Min. 5 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={5} disabled={loading} />
            </label>
            <label>Date de naissance <span style={{ color: "#999", fontSize: "0.85em" }}>(optionnel)</span>
              <input type="date" value={regBirthday} onChange={(e) => setRegBirthday(e.target.value)} disabled={loading} />
            </label>
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? "Creation en cours..." : "Creer un compte"}
            </button>
          </form>
        )}
      </div>
      <div className="auth__visual">
        <h2>Bienvenue chez Prestashop Studio</h2>
        <p>Un espace inspire par les meilleures experiences ecommerce pour un parcours fluide et premium.</p>
        <div className="auth__stats">
          <div><strong>+12k</strong><span>Clients actifs</span></div>
          <div><strong>48h</strong><span>Livraison express</span></div>
          <div><strong>4.9</strong><span>Note moyenne</span></div>
        </div>
      </div>
    </div>
  );
}