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

const getText = (v) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v);
    }
    if (Array.isArray(v)) return getText(v[0]);
    return v["#text"] ?? "";
};

const getDeliveryAddress = async (addressId) => {
    if (!addressId) return "";

    const addrRes = await fetch(`/Eval/api/addresses/${addressId}`, { headers });
    const addrXml = await addrRes.text();
    const addrData = parser.parse(addrXml);
    const address = addrData.prestashop.address;
    const address1 = getText(address.address1);
    const address2 = getText(address.address2);
    const city = getText(address.city);
    const postcode = getText(address.postcode);

    return [address1, address2, `${postcode} ${city}`]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", ");
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

            const addressId = getText(commande.id_address_delivery);
            const delivery_address = await getDeliveryAddress(addressId);

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
                id_address_delivery: addressId,
                delivery_address,
            };
        })
    )
    return fullCommandes;

};

export async function getCommandeById(id) {
    const res = await fetch(`/Eval/api/orders/${id}`, { headers });
    const xmlDetail = await res.text();
    const detailData = parser.parse(xmlDetail);
    const commande = detailData.prestashop.order;

    const addressId = getText(commande.id_address_delivery);
    const delivery_address = await getDeliveryAddress(addressId);

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
        id_address_delivery: addressId,
        delivery_address,
    };
}

export async function getOrdersId() {
    const response = await fetch(`/Eval/api/orders`, { headers });
    const xml = await response.text();
    const data = parser.parse(xml);

    const orders = data?.prestashop?.orders?.order;
    const list = Array.isArray(orders) ? orders : orders ? [orders] : [];

    return list.map((c) => {
        const id =
            c["@_id"] ??
            c.id ??
            (c["@_xlink:href"] ? c["@_xlink:href"].split("/").pop() : "");
        return String(id || "");
    });
}

export async function deleteAllOrders() {
    const ids = await getOrdersId();
    const results = [];

    for (const id of ids) {
        const res = await fetch(`/Eval/api/orders/${id}`, {
            method: "DELETE",
            headers,
        });

        results.push({ id, ok: res.ok, status: res.status });
    }

    return results;
}

export async function updateOrderState(orderId, stateId) {
    const xml = `
    <prestashop>
      <order_history>
        <id_order>${orderId}</id_order>
        <id_order_state>${stateId}</id_order_state>
      </order_history>
    </prestashop>
  `.trim();

    const res = await fetch("/Eval/api/order_histories", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!res.ok) {
        throw new Error("Failed to update order state");
    }
}

export async function getOrderStates(languageId = "1") {
    const res = await fetch("/Eval/api/order_states", { headers });
    const xml = await res.text();
    const data = parser.parse(xml);

    const states = data?.prestashop?.order_states?.order_state;
    const list = Array.isArray(states) ? states : states ? [states] : [];

    const ids = list.map((s) => {
        const id =
            s["@_id"] ??
            s.id ??
            (s["@_xlink:href"] ? s["@_xlink:href"].split("/").pop() : "");
        return String(id || "");
    }).filter(Boolean);

    const details = await Promise.all(
        ids.map(async (id) => {
            const detailRes = await fetch(`/Eval/api/order_states/${id}`, { headers });
            const detailXml = await detailRes.text();
            const detailData = parser.parse(detailXml);
            const state = detailData?.prestashop?.order_state;

            // name peut etre un tableau de <language>
            const nameNode = state?.name?.language;
            const nameList = Array.isArray(nameNode) ? nameNode : nameNode ? [nameNode] : [];
            const nameForLang = nameList.find((n) => String(n?.["@_id"]) === String(languageId));
            const name = getText(nameForLang ?? nameList[0]);

            return { id: getText(state?.id), name };
        })
    );

    return details;
}