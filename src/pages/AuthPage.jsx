import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  return (
    <div className="page auth">
      <div className="auth__panel">
        <div className="auth__tabs">
          <button
            className={mode === "login" ? "tab is-active" : "tab"}
            onClick={() => setMode("login")}
            type="button"
          >
            Connexion
          </button>
          <button
            className={mode === "register" ? "tab is-active" : "tab"}
            onClick={() => setMode("register")}
            type="button"
          >
            Creer un compte
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth__form">
            <label>
              Email
              <input type="email" placeholder="vous@mail.com" />
            </label>
            <label>
              Mot de passe
              <input type="password" placeholder="********" />
            </label>
            <button className="button button--primary" type="button">
              Se connecter
            </button>
            <button className="link-button" type="button">
              Mot de passe oublie ?
            </button>
          </form>
        ) : (
          <form className="auth__form">
            <label>
              Nom complet
              <input type="text" placeholder="Votre nom" />
            </label>
            <label>
              Email
              <input type="email" placeholder="vous@mail.com" />
            </label>
            <label>
              Mot de passe
              <input type="password" placeholder="********" />
            </label>
            <button className="button button--primary" type="button">
              Creer un compte
            </button>
          </form>
        )}
      </div>
      <div className="auth__visual">
        <h2>Bienvenue chez Prestashop Studio</h2>
        <p>
          Un espace inspire par les meilleures experiences ecommerce pour un
          parcours fluide et premium.
        </p>
        <div className="auth__stats">
          <div>
            <strong>+12k</strong>
            <span>Clients actifs</span>
          </div>
          <div>
            <strong>48h</strong>
            <span>Livraison express</span>
          </div>
          <div>
            <strong>4.9</strong>
            <span>Note moyenne</span>
          </div>
        </div>
      </div>
    </div>
  );
}
