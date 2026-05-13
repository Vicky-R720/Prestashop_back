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

export async function getCustomerById(id) {

    const response = await fetch(`/Eval/api/customers/${id}`, {
        headers,
    });

    const xml = await response.text();

    const data = parser.parse(xml);

    const customer = data.prestashop.customer;

    // Commandes du client
    const ordersResponse = await fetch(
        `/Eval/api/orders?filter[id_customer]=${id}`,
        {
            headers,
        }
    );

    const ordersXml = await ordersResponse.text();

    const ordersData = parser.parse(ordersXml);

    const orders = ordersData?.prestashop?.orders?.order || [];
    const orderList = Array.isArray(orders)
        ? orders
        : orders
            ? [orders]
            : [];

    const ordersCount = orderList.length;
    const orderTotals = await Promise.all(
        orderList.map(async (order) => {
            const orderId = getText(order?.["@_id"] ?? order?.id);
            if (!orderId) return 0;

            const orderResponse = await fetch(`/Eval/api/orders/${orderId}`, {
                headers,
            });

            const orderXml = await orderResponse.text();
            const orderData = parser.parse(orderXml);
            const orderDetail = orderData?.prestashop?.order;
            const total = parseFloat(getText(orderDetail?.total_paid_tax_incl));

            return Number.isFinite(total) ? total : 0;
        })
    );
    const totalSpent = orderTotals.reduce((sum, value) => sum + value, 0);

    // Adresse du client
    const addressResponse = await fetch(
        `/Eval/api/addresses?filter[id_customer]=${id}`,
        {
            headers,
        }
    );

    const addressXml = await addressResponse.text();

    const addressData = parser.parse(addressXml);

    const address =
        addressData?.prestashop?.addresses?.address;

    const firstname = getText(customer.firstname);
    const lastname = getText(customer.lastname);
    const addressId = Array.isArray(address)
        ? getText(address[0]?.["@_id"])
        : getText(address?.["@_id"]);

    return {
        id: getText(customer.id),
        firstname,
        lastname,
        fullName: `${firstname} ${lastname}`.trim(),
        email: getText(customer.email),
        createdAt: getText(customer.date_add),
        validatedOrders: ordersCount,
        totalSpent,
        addressId,
        active: getText(customer.active),
    };
}