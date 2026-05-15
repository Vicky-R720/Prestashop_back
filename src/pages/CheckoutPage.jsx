import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import { getPanier, creerPanierPourCommande, viderPanier } from "../services/Panier";
import { getProductById } from "../services/Produit";
import { createAddress, createCustomer, createOrder, getCountries } from "../services/Checkout";
import { getCustomerSession, saveCustomerSession } from "../services/CustomerSession";

const DEFAULT_COUNTRY_FALLBACK = [{ id: "8", name: "France" }];
const DEFAULT_PAYMENT_LABEL = "Paiement a la livraison";
const DEFAULT_DELIVERY_LABEL = "Livraison gratuite";

const emptyForm = {
  alias: "",
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  company: "",
  vatNumber: "",
  address1: "",
  address2: "",
  postcode: "",
  city: "",
  countryId: "",
  phone: "",
};

function generatePassword() {
  const random = Math.random().toString(36).slice(2, 10);
  return `guest_${random}`;
}

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [cartRows, setCartRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [createAccount, setCreateAccount] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // 🆕 Récupération de la session
  const session = getCustomerSession();
  const isLoggedIn = !!session;

  const sousTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // 🆕 Pré-remplir le formulaire si connecté
  useEffect(() => {
    if (isLoggedIn) {
      setForm((prev) => ({
        ...prev,
        firstname: session.firstname || "",
        lastname: session.lastname || "",
        email: session.email || "",
      }));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    async function loadCountries() {
      try {
        const list = await getCountries();
        if (list.length > 0) {
          setCountries(list);
          setForm((prev) => ({ ...prev, countryId: prev.countryId || list[0].id }));
          return;
        }
      } catch (err) {
        console.error("Erreur chargement pays:", err);
      }
      setCountries(DEFAULT_COUNTRY_FALLBACK);
      setForm((prev) => ({ ...prev, countryId: prev.countryId || DEFAULT_COUNTRY_FALLBACK[0].id }));
    }
    loadCountries();
  }, []);

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      try {
        const panier = await getPanier();
        if (!panier || panier.items.length === 0) {
          setItems([]); setCartRows([]); setLoading(false); return;
        }
        const detailed = await Promise.all(
          panier.items.map(async (row) => {
            const product = await getProductById(row.id_product);
            return {
              id_product: row.id_product,
              id_product_attribute: row.id_product_attribute || "0",
              quantity: row.quantity,
              name: product.name || "Produit",
              reference: product.reference || "",
              price: parseFloat(product.price_ttc) || 0,
            };
          })
        );
        setItems(detailed);
        setCartRows(panier.items);
      } catch (err) {
        console.error("Erreur chargement checkout:", err);
        setItems([]); setCartRows([]);
      }
      setLoading(false);
    }
    loadCart();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const required = ["alias", "firstname", "lastname", "email", "address1", "postcode", "city", "countryId"];
    for (const key of required) {
      if (!form[key]) return "Merci de completer tous les champs obligatoires.";
    }
    if (!isLoggedIn && createAccount && !form.password) {
      return "Merci de renseigner un mot de passe pour creer un compte.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(""); setError("");

    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    if (items.length === 0) { setError("Votre panier est vide."); return; }

    setSubmitting(true);

    try {
      let customerId, secureKey;

      if (isLoggedIn) {
        // ✅ Client connecté : on utilise directement sa session
        customerId = session.id;
        secureKey = session.secureKey;
      } else {
        // ✅ Client non connecté : on crée un compte (invité ou réel)
        const password = createAccount ? form.password : generatePassword();
        const customer = await createCustomer({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          password,
          isGuest: !createAccount,
        });

        customerId = customer.id;
        secureKey = customer.secureKey;

        if (createAccount) {
          saveCustomerSession({
            id: customer.id,
            secureKey: customer.secureKey,
            email: form.email,
            firstname: form.firstname,
            lastname: form.lastname,
          });
        }
      }

      const addressId = await createAddress({
        idCustomer: customerId,
        alias: form.alias,
        firstname: form.firstname,
        lastname: form.lastname,
        address1: form.address1,
        address2: form.address2,
        postcode: form.postcode,
        city: form.city,
        idCountry: form.countryId,
        phone: form.phone,
        company: form.company,
        vatNumber: form.vatNumber,
      });

      const cartId = await creerPanierPourCommande(cartRows, customerId, addressId);

      const orderRows = items.map((item) => ({
        productId: item.id_product,
        productAttributeId: item.id_product_attribute || "0",
        quantity: item.quantity,
        name: item.name,
        reference: item.reference,
        price: item.price,
      }));

      await createOrder({
        cartId,
        customerId,
        addressId,
        secureKey,
        orderRows,
        totalProducts: sousTotal,
        totalPaid: sousTotal,
      });

      await viderPanier();
      setItems([]); setCartRows([]);
      setForm((prev) => ({ ...emptyForm, countryId: countries[0]?.id || prev.countryId }));
      setMessage("Commande enregistree. Merci pour votre achat.");
    } catch (err) {
      console.error("Erreur commande:", err);
      setError("La commande n'a pas pu etre validee. Merci de reessayer.");
    }

    setSubmitting(false);
  }

  return (
    <div className="page">
      <SectionHeader
        title="Validation de commande"
        subtitle="Finalisez votre achat avec le paiement a la livraison."
      />

      {loading ? (
        <p>Chargement du panier...</p>
      ) : items.length === 0 ? (
        <div className="cart-layout">
          <div className="cart-list">
            <div className="cart-empty">
              <p>Votre panier est vide.</p>
              <button className="button button--primary" onClick={() => navigate("/products")}>
                Voir le catalogue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="checkout-layout">
          <section className="checkout-panel">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-section">
                <h3>Informations client</h3>

                {/* 🆕 Bandeau si connecté */}
                {isLoggedIn && (
                  <div className="checkout-pill" style={{ marginBottom: "1rem" }}>
                    <strong>✅ Connecté en tant que {session.firstname} {session.lastname}</strong>
                    <span>{session.email}</span>
                  </div>
                )}

                <div className="form-grid">
                  <label className="form-field">
                    Alias
                    <input name="alias" value={form.alias} onChange={handleChange} required />
                  </label>
                  <label className="form-field">
                    Prenom
                    <input
                      name="firstname"
                      value={form.firstname}
                      onChange={handleChange}
                      required
                      // 🆕 lecture seule si connecté
                      readOnly={isLoggedIn}
                      style={isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    />
                  </label>
                  <label className="form-field">
                    Nom
                    <input
                      name="lastname"
                      value={form.lastname}
                      onChange={handleChange}
                      required
                      readOnly={isLoggedIn}
                      style={isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    />
                  </label>
                  <label className="form-field">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      readOnly={isLoggedIn}
                      style={isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    />
                  </label>
                  <label className="form-field">
                    Societe (optionnel)
                    <input name="company" value={form.company} onChange={handleChange} />
                  </label>
                  <label className="form-field">
                    Numero de TVA (optionnel)
                    <input name="vatNumber" value={form.vatNumber} onChange={handleChange} />
                  </label>
                </div>

                {/* 🆕 Option créer un compte uniquement si non connecté */}
                {!isLoggedIn && (
                  <>
                    <label className="form-check">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                      />
                      <span>Creer un compte pour suivre vos commandes</span>
                    </label>
                    {createAccount && (
                      <label className="form-field form-field--full">
                        Mot de passe
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    )}
                  </>
                )}
              </div>

              <div className="checkout-section">
                <h3>Adresse de livraison</h3>
                <div className="form-grid">
                  <label className="form-field form-field--full">
                    Adresse
                    <input name="address1" value={form.address1} onChange={handleChange} required />
                  </label>
                  <label className="form-field form-field--full">
                    Complement d'adresse (optionnel)
                    <input name="address2" value={form.address2} onChange={handleChange} />
                  </label>
                  <label className="form-field">
                    Code postal
                    <input name="postcode" value={form.postcode} onChange={handleChange} required />
                  </label>
                  <label className="form-field">
                    Ville
                    <input name="city" value={form.city} onChange={handleChange} required />
                  </label>
                  <label className="form-field">
                    Pays
                    <select name="countryId" value={form.countryId} onChange={handleChange} required>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    Telephone (optionnel)
                    <input name="phone" value={form.phone} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Mode de livraison</h3>
                <div className="checkout-pill">
                  <strong>{DEFAULT_DELIVERY_LABEL}</strong>
                  <span>Frais de livraison offerts</span>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Paiement</h3>
                <div className="checkout-pill">
                  <strong>{DEFAULT_PAYMENT_LABEL}</strong>
                  <span>Vous payez directement au livreur.</span>
                </div>
              </div>

              {message && <div className="checkout-message is-success">{message}</div>}
              {error && <div className="checkout-message is-error">{error}</div>}

              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? "Validation en cours..." : "Commander"}
              </button>
            </form>
          </section>

          <aside className="summary">
            <h3>Resume</h3>
            <div className="summary__row"><span>Sous-total</span><strong>{sousTotal.toFixed(2)} EUR</strong></div>
            <div className="summary__row"><span>Livraison</span><strong>Gratuit</strong></div>
            <div className="summary__row"><span>Paiement</span><strong>{DEFAULT_PAYMENT_LABEL}</strong></div>
            <div className="summary__total"><span>Total</span><strong>{sousTotal.toFixed(2)} EUR</strong></div>
          </aside>
        </div>
      )}
    </div>
  );
}