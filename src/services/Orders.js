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

const stateCache = new Map();
const carrierCache = new Map();

function getText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value).trim();
    }
    if (Array.isArray(value)) return getText(value[0]);
    return value["#text"] ?? "";
}

function toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

async function fetchOrderList(customerId) {
    const response = await fetch(
        `/Eval/api/orders?filter[id_customer]=${customerId}&sort=[id_DESC]`,
        { headers }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Impossible de recuperer les commandes: ${errorText}`);
    }

    const data = parser.parse(await response.text());
    const list = data?.prestashop?.orders?.order;

    return toArray(list)
        .map((order) => getText(order["@_id"] ?? order.id))
        .filter(Boolean);
}

async function fetchOrderDetail(orderId) {
    const response = await fetch(`/Eval/api/orders/${orderId}`, { headers });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Impossible de recuperer la commande ${orderId}: ${errorText}`);
    }

    const data = parser.parse(await response.text());
    return data?.prestashop?.order;
}

async function fetchOrderStateName(stateId) {
    if (!stateId) return "";
    if (stateCache.has(stateId)) return stateCache.get(stateId);

    const response = await fetch(`/Eval/api/order_states/${stateId}`, { headers });
    if (!response.ok) {
        stateCache.set(stateId, "");
        return "";
    }

    const data = parser.parse(await response.text());
    const name = getText(data?.prestashop?.order_state?.name?.language);
    stateCache.set(stateId, name);
    return name;
}

async function fetchCarrierName(carrierId) {
    if (!carrierId) return "";
    if (carrierCache.has(carrierId)) return carrierCache.get(carrierId);

    const response = await fetch(`/Eval/api/carriers/${carrierId}`, { headers });
    if (!response.ok) {
        carrierCache.set(carrierId, "");
        return "";
    }

    const data = parser.parse(await response.text());
    const name = getText(data?.prestashop?.carrier?.name);
    carrierCache.set(carrierId, name);
    return name;
}

function countItems(order) {
    const rows = order?.associations?.order_rows?.order_row;
    return toArray(rows).reduce(
        (sum, row) => sum + (parseInt(getText(row?.product_quantity), 10) || 0),
        0
    );
}

export async function getOrdersForCustomer(customerId) {
    if (!customerId) return [];

    const orderIds = await fetchOrderList(customerId);
    if (orderIds.length === 0) return [];

    console.log(customerId);
    const orders = await Promise.all(orderIds.map(fetchOrderDetail));

    return await Promise.all(
        orders.map(async (order) => {
            const totalPaid = parseFloat(
                getText(order?.total_paid_tax_incl || order?.total_paid)
            );

            const stateId = getText(order?.current_state);
            const carrierId = getText(order?.id_carrier);

            return {
                id: getText(order?.id),
                reference: getText(order?.reference),
                date: getText(order?.date_add),
                total: Number.isFinite(totalPaid) ? totalPaid : 0,
                payment: getText(order?.payment),
                status: await fetchOrderStateName(stateId),
                carrier: await fetchCarrierName(carrierId),
                itemsCount: countItems(order),
            };
        })
    );
}
