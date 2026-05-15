import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

const headers = {
    Authorization: `Basic ${btoa(
        import.meta.env.VITE_PRESTASHOP_API_KEY + ":"
    )}`,
};

function getText(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v).trim();
    }
    if (Array.isArray(v)) return getText(v[0]);
    return v["#text"] ?? "";
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Recherche un client par email et vérifie le mot de passe.
 * PrestaShop Webservice ne fournit pas d'endpoint de login natif,
 * on récupère le customer par email et on compare le mot de passe.
 */
export async function loginCustomer(email, password) {
    // Rechercher le client par email
    const response = await fetch(
        `/Eval/api/customers?filter[email]=${encodeURIComponent(email)}&display=full`,
        { headers }
    );

    if (!response.ok) {
        throw new Error("Erreur lors de la connexion");
    }

    const data = parser.parse(await response.text());
    const customers = data?.prestashop?.customers?.customer;

    if (!customers) {
        throw new Error("Email ou mot de passe incorrect");
    }

    // Peut être un objet ou un tableau
    const customerList = Array.isArray(customers) ? customers : [customers];

    // Trouver le client correspondant
    const customer = customerList.find((c) => {
        const customerEmail = getText(c?.email);
        return customerEmail.toLowerCase() === email.toLowerCase();
    });

    if (!customer) {
        throw new Error("Email ou mot de passe incorrect");
    }

    // Vérifier le mot de passe (PrestaShop stocke le hash, mais en mode demo/test
    // le webservice retourne le passwd tel quel)
    const storedPassword = getText(customer?.passwd);
    if (storedPassword !== password) {
        throw new Error("Email ou mot de passe incorrect");
    }

    // Vérifier que le compte est actif
    const isActive = getText(customer?.active);
    if (isActive === "0") {
        throw new Error("Ce compte est desactive");
    }

    return {
        id: getText(customer?.id),
        firstname: getText(customer?.firstname),
        lastname: getText(customer?.lastname),
        email: getText(customer?.email),
        secureKey: getText(customer?.secure_key),
    };
}

/**
 * Crée un nouveau compte client via l'API PrestaShop.
 */
export async function registerCustomer({ firstname, lastname, email, password }) {
    // Vérifier d'abord si l'email existe déjà
    const checkResponse = await fetch(
        `/Eval/api/customers?filter[email]=${encodeURIComponent(email)}&display=[id]`,
        { headers }
    );

    if (checkResponse.ok) {
        const checkData = parser.parse(await checkResponse.text());
        const existing = checkData?.prestashop?.customers?.customer;
        if (existing) {
            throw new Error("Un compte avec cet email existe deja");
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <id_default_group>3</id_default_group>
    <id_lang>1</id_lang>
    <firstname>${escapeXml(firstname)}</firstname>
    <lastname>${escapeXml(lastname)}</lastname>
    <email>${escapeXml(email)}</email>
    <passwd>${escapeXml(password)}</passwd>
    <active>1</active>
    <is_guest>0</is_guest>
    <newsletter>0</newsletter>
    <optin>0</optin>
  </customer>
</prestashop>`;

    const response = await fetch("/Eval/api/customers", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur creation compte:", errorText);
        throw new Error("Impossible de creer le compte");
    }

    const data = parser.parse(await response.text());
    const newCustomer = data?.prestashop?.customer;

    return {
        id: getText(newCustomer?.id),
        firstname: getText(newCustomer?.firstname),
        lastname: getText(newCustomer?.lastname),
        email: getText(newCustomer?.email),
        secureKey: getText(newCustomer?.secure_key),
    };
}
