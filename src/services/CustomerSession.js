const SESSION_KEY = "prestashop_customer_session";
const apiKey = import.meta.env.VITE_PRESTASHOP_API_KEY;

const headers = {
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  "Content-Type": "text/xml",
};

// ── SESSION ──────────────────────────────────────────────
export function saveCustomerSession({ id, secureKey, email, firstname, lastname }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: String(id || ""),
    secureKey: String(secureKey || ""),
    email: email || "",
    firstname: firstname || "",
    lastname: lastname || "",
  }));
}

export function getCustomerSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearCustomerSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── INSCRIPTION ──────────────────────────────────────────
export async function createCustomer(firstname, lastname, email, password, birthday) {
  const xml = `
  <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <customer>
      <id_default_group><![CDATA[3]]></id_default_group>
      <id_lang><![CDATA[1]]></id_lang>
      <passwd><![CDATA[${password}]]></passwd>
      <lastname><![CDATA[${lastname}]]></lastname>
      <firstname><![CDATA[${firstname}]]></firstname>
      <email><![CDATA[${email.trim().toLowerCase()}]]></email>
      <id_gender><![CDATA[1]]></id_gender>
      <birthday><![CDATA[${birthday || "0000-00-00"}]]></birthday>
      <optin><![CDATA[1]]></optin>
      <newsletter><![CDATA[1]]></newsletter>
      <active><![CDATA[1]]></active>
      <associations>
        <groups nodeType="group" api="groups">
          <group><id><![CDATA[3]]></id></group>
        </groups>
      </associations>
    </customer>
  </prestashop>`;

  const response = await fetch(
    `/api/customers?ws_key=${apiKey}`,
    { method: "POST", headers, body: xml }
  );

  const result = await response.text();

  if (!response.ok) {
    throw new Error("Impossible de creer le compte. Email deja utilise ?");
  }

  return result;
}

// ── CONNEXION ─────────────────────────────────────────────
export async function loginCustomer(email, password) {
  const response = await fetch(
    `/api/customers?ws_key=${apiKey}&filter[email]=${encodeURIComponent(email.trim().toLowerCase())}&display=full&output_format=JSON`,
    { method: "GET", headers }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de la connexion");
  }

  const data = await response.json();
  const customers = data?.customers;

  if (!customers || customers.length === 0) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const customer = customers[0];

  // PrestaShop ne permet pas de vérifier le mot de passe via l'API REST,
  // on vérifie juste que le compte existe avec cet email
  return {
    id: customer.id,
    secureKey: customer.secure_key,
    email: customer.email,
    firstname: customer.firstname,
    lastname: customer.lastname,
  };
}