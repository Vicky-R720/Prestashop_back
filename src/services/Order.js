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

const ORDER_CONFIG = {
    idAddressDelivery: import.meta.env.VITE_ORDER_ADDRESS_DELIVERY || "",
    idAddressInvoice: import.meta.env.VITE_ORDER_ADDRESS_INVOICE || "",
    idCustomer: import.meta.env.VITE_ORDER_CUSTOMER_ID || "",
    idCarrier: import.meta.env.VITE_ORDER_CARRIER_ID || "",
    idCurrency: import.meta.env.VITE_ORDER_CURRENCY_ID || "1",
    idLang: import.meta.env.VITE_ORDER_LANG_ID || "1",
    idShopGroup: import.meta.env.VITE_ORDER_SHOP_GROUP_ID || "1",
    idShop: import.meta.env.VITE_ORDER_SHOP_ID || "1",
    currentState: import.meta.env.VITE_ORDER_STATE_ID || "1",
    module: import.meta.env.VITE_ORDER_MODULE || "ps_cashondelivery",
    payment: import.meta.env.VITE_ORDER_PAYMENT_LABEL || "Cash on delivery",
    secureKey: import.meta.env.VITE_ORDER_SECURE_KEY || "",
};

function getText(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v).trim();
    }
    if (Array.isArray(v)) return getText(v[0]);
    return v["#text"] ?? "";
}

function formatMoney(value) {
    const num = Number(value || 0);
    return num.toFixed(6);
}

function sanitizeCdata(value) {
    return String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>");
}

function buildOrderRows(items) {
    return items
        .map((item) => {
            const unitPrice = formatMoney(item.price);
            return `
      <order_row>
        <product_id><![CDATA[${item.id_product}]]></product_id>
        <product_attribute_id><![CDATA[${item.id_product_attribute || "0"}]]></product_attribute_id>
        <product_quantity><![CDATA[${item.quantity}]]></product_quantity>
        <product_name><![CDATA[${sanitizeCdata(item.name)}]]></product_name>
        <product_reference><![CDATA[${sanitizeCdata(item.reference || "")}]]></product_reference>
        <product_price><![CDATA[${unitPrice}]]></product_price>
        <id_customization><![CDATA[0]]></id_customization>
        <unit_price_tax_incl><![CDATA[${unitPrice}]]></unit_price_tax_incl>
        <unit_price_tax_excl><![CDATA[${unitPrice}]]></unit_price_tax_excl>
      </order_row>`;
        })
        .join("");
}

export async function createOrderFromCart({ cartId, items, total }) {
    if (!cartId) throw new Error("Panier manquant");
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Panier vide");
    }

    const totalProducts = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const totalValue = typeof total === "number" ? total : totalProducts;

    const totalProductsStr = formatMoney(totalProducts);
    const totalPaidStr = formatMoney(totalValue);

    const rowsXml = buildOrderRows(items);
    const reference = `WEB-${Date.now()}`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order>
    <id_address_delivery><![CDATA[${ORDER_CONFIG.idAddressDelivery}]]></id_address_delivery>
    <id_address_invoice><![CDATA[${ORDER_CONFIG.idAddressInvoice}]]></id_address_invoice>
    <id_cart><![CDATA[${cartId}]]></id_cart>
    <id_currency><![CDATA[${ORDER_CONFIG.idCurrency}]]></id_currency>
    <id_lang><![CDATA[${ORDER_CONFIG.idLang}]]></id_lang>
    <id_customer><![CDATA[${ORDER_CONFIG.idCustomer}]]></id_customer>
    <id_carrier><![CDATA[${ORDER_CONFIG.idCarrier}]]></id_carrier>
    <current_state><![CDATA[${ORDER_CONFIG.currentState}]]></current_state>
    <module><![CDATA[${ORDER_CONFIG.module}]]></module>
    <valid><![CDATA[1]]></valid>
    <id_shop_group><![CDATA[${ORDER_CONFIG.idShopGroup}]]></id_shop_group>
    <id_shop><![CDATA[${ORDER_CONFIG.idShop}]]></id_shop>
    <secure_key><![CDATA[${ORDER_CONFIG.secureKey}]]></secure_key>
    <payment><![CDATA[${sanitizeCdata(ORDER_CONFIG.payment)}]]></payment>
    <recyclable><![CDATA[0]]></recyclable>
    <gift><![CDATA[0]]></gift>
    <mobile_theme><![CDATA[0]]></mobile_theme>
    <total_discounts><![CDATA[0.000000]]></total_discounts>
    <total_discounts_tax_incl><![CDATA[0.000000]]></total_discounts_tax_incl>
    <total_discounts_tax_excl><![CDATA[0.000000]]></total_discounts_tax_excl>
    <total_paid><![CDATA[${totalPaidStr}]]></total_paid>
    <total_paid_tax_incl><![CDATA[${totalPaidStr}]]></total_paid_tax_incl>
    <total_paid_tax_excl><![CDATA[${totalPaidStr}]]></total_paid_tax_excl>
    <total_paid_real><![CDATA[0.000000]]></total_paid_real>
    <total_products><![CDATA[${totalProductsStr}]]></total_products>
    <total_products_wt><![CDATA[${totalProductsStr}]]></total_products_wt>
    <total_shipping><![CDATA[0.000000]]></total_shipping>
    <total_shipping_tax_incl><![CDATA[0.000000]]></total_shipping_tax_incl>
    <total_shipping_tax_excl><![CDATA[0.000000]]></total_shipping_tax_excl>
    <carrier_tax_rate><![CDATA[0.000]]></carrier_tax_rate>
    <total_wrapping><![CDATA[0.000000]]></total_wrapping>
    <total_wrapping_tax_incl><![CDATA[0.000000]]></total_wrapping_tax_incl>
    <total_wrapping_tax_excl><![CDATA[0.000000]]></total_wrapping_tax_excl>
    <round_mode><![CDATA[0]]></round_mode>
    <round_type><![CDATA[0]]></round_type>
    <conversion_rate><![CDATA[1.000000]]></conversion_rate>
    <reference><![CDATA[${reference}]]></reference>
    <associations>
      <order_rows>
        ${rowsXml}
      </order_rows>
    </associations>
  </order>
</prestashop>`;

    const response = await fetch("/Eval/api/orders", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(
            `Creation commande impossible: ${response.status} ${errText}`
        );
    }

    const data = parser.parse(await response.text());
    const id = getText(data?.prestashop?.order?.id);

    return { id };
}
