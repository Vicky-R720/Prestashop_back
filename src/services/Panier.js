import { XMLParser } from "fast-xml-parser";

// ─── Config ────────────────────────────────────────────────────
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

const headers = {
    Authorization: `Basic ${btoa(
        import.meta.env.VITE_PRESTASHOP_API_KEY + ":"
    )}`,
};

const CART_KEY = "prestashop_cart_id";

// ─── Helpers ───────────────────────────────────────────────────

/** Extrait le texte d'un noeud XML parsé */
function getText(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v).trim();
    }
    if (Array.isArray(v)) return getText(v[0]);
    return v["#text"] ?? "";
}

/** Sauvegarde l'id du panier dans le localStorage */
function saveCartId(id) {
    localStorage.setItem(CART_KEY, id);
}

/** Récupère l'id du panier depuis le localStorage */
function getCartId() {
    return localStorage.getItem(CART_KEY);
}

// ─── Créer / Mettre à jour en créant un nouveau panier ─────────

function buildCartXml(items = [], extraFields = "") {
        const rowsXml = items
                .filter((item) => item.quantity > 0)
                .map(
                        (item) => `
                <cart_row>
                    <id_product>${item.id_product}</id_product>
                    <id_product_attribute>${item.id_product_attribute || "0"}</id_product_attribute>
                    <quantity>${item.quantity}</quantity>
                </cart_row>`
                )
                .join("");

        return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <cart>
        <id_currency>1</id_currency>
        <id_lang>1</id_lang>
        ${extraFields}
        ${
                rowsXml
                        ? `<associations>
            <cart_rows>${rowsXml}</cart_rows>
        </associations>`
                        : ""
        }
    </cart>
</prestashop>`;
}

/** Crée un nouveau panier avec les items fournis via POST */
async function sauvegarderPanier(items = []) {
        const xml = buildCartXml(items);

    const response = await fetch("/api/carts", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Erreur création panier:", errText);
        throw new Error("Impossible de sauvegarder le panier");
    }

    const data = parser.parse(await response.text());
    const id = getText(data.prestashop.cart.id);

    saveCartId(id);
    return id;
}

/** Crée un panier lie a un client et une adresse (pour la commande) */
export async function creerPanierPourCommande(
    items = [],
    idCustomer,
    idAddressDelivery,
    idAddressInvoice = idAddressDelivery
) {
    const extraFields = `
    <id_customer>${idCustomer}</id_customer>
    <id_address_delivery>${idAddressDelivery}</id_address_delivery>
    <id_address_invoice>${idAddressInvoice}</id_address_invoice>`;

    const xml = buildCartXml(items, extraFields);

    const response = await fetch("/api/carts", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Erreur creation panier commande:", errText);
        throw new Error("Impossible de creer le panier de commande");
    }

    const data = parser.parse(await response.text());
    const id = getText(data.prestashop.cart.id);

    saveCartId(id);
    return id;
}

// ─── Récupérer le panier ───────────────────────────────────────

/** Récupère le contenu du panier depuis l'API */
export async function getPanier() {
    const cartId = getCartId();
    if (!cartId) return null;

    const response = await fetch(`/api/carts/${cartId}`, { headers });

    if (!response.ok) {
        // Le panier n'existe plus, on nettoie
        localStorage.removeItem(CART_KEY);
        return null;
    }

    const data = parser.parse(await response.text());
    const cart = data.prestashop.cart;

    // Extraire les lignes du panier
    const rows = cart.associations?.cart_rows?.cart_row;
    let items = [];

    if (rows) {
        const list = Array.isArray(rows) ? rows : [rows];
        items = list.map((row) => ({
            id_product: getText(row.id_product),
            id_product_attribute: getText(row.id_product_attribute),
            quantity: parseInt(getText(row.quantity), 10) || 0,
        }));
    }

    return {
        id: getText(cart.id),
        items: items,
    };
}

// ─── Ajouter un produit au panier ──────────────────────────────

/** Ajoute un produit au panier (crée un nouveau panier) */
export async function ajouterAuPanier(idProduct, quantity = 1) {
    const panier = await getPanier();
    const items = panier ? panier.items : [];

    const existing = items.find((item) => item.id_product === String(idProduct));

    if (existing) {
        existing.quantity += quantity;
    } else {
        items.push({
            id_product: String(idProduct),
            id_product_attribute: "0",
            quantity: quantity,
        });
    }

    await sauvegarderPanier(items);
    return await getPanier();
}

// ─── Modifier la quantité d'un produit ─────────────────────────

/** Change la quantité d'un produit dans le panier */
export async function changerQuantite(idProduct, nouvelleQuantite) {
    const panier = await getPanier();
    if (!panier) return null;

    const items = panier.items.map((item) => {
        if (item.id_product === String(idProduct)) {
            return { ...item, quantity: nouvelleQuantite };
        }
        return item;
    });

    // Filtrer les quantités à 0
    const filtered = items.filter((item) => item.quantity > 0);

    await sauvegarderPanier(filtered);
    return await getPanier();
}

// ─── Retirer un produit du panier ──────────────────────────────

/** Retire complètement un produit du panier */
export async function retirerDuPanier(idProduct) {
    return await changerQuantite(idProduct, 0);
}

// ─── Vider le panier ───────────────────────────────────────────

/** Vide tous les produits du panier */
export async function viderPanier() {
    await sauvegarderPanier([]);
}

// ─── Compter les articles ──────────────────────────────────────

/** Retourne le nombre total d'articles dans le panier */
export async function compterArticles() {
    const panier = await getPanier();
    if (!panier) return 0;

    return panier.items.reduce((total, item) => total + item.quantity, 0);
}
