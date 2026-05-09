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

export async function getCommande() {

    const response = await fetch(`/Eval/api/orders`, {
        headers,
    });

    const xml = await response.text();

    const data = parser.parse(xml)

    const commandeList = data.prestashop.orders.order;

    const fullCommandes = await Promise.all(
        commandeList.map(async (c) => {
            const id = c["@_id"];

            const res = await fetch(`/Eval/api/orders/${id}`, { headers });

            const xmlDetail = await res.text();

            const detailData = parser.parse(xmlDetail);

            const commande = detailData.prestashop.order;

            const getText = (v) => {
                if (v === null || v === undefined) return "";
                if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                    return String(v);
                }
                if (Array.isArray(v)) return getText(v[0]);
                return v["#text"] ?? "";
            };

            return {
                id: getText(commande.id),
                reference: getText(commande.reference),
                id_customer: getText(commande.id_customer),
                current_state: getText(commande.current_state),
                payment: getText(commande.payment),
                valid: getText(commande.valid),
                date_add: getText(commande.date_add),
                delivery_date: getText(commande.delivery_date),
                total_paid_tax_incl: getText(commande.total_paid_tax_incl),
            };
        })
    )
    return fullCommandes;

};