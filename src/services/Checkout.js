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

const DEFAULTS = {
    currencyId: "1",
    langId: "1",
    shopId: "1",
    shopGroupId: "1",
    carrierId: "2",
    orderStateId: "13",
    paymentModule: "ps_cashondelivery",
    paymentLabel: "Cash on delivery",
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

function formatAmount(value) {
    if (!Number.isFinite(value)) return "0.000000";
    return value.toFixed(6);
}

async function parseIdFromResponse(response) {
    const data = parser.parse(await response.text());
    const node = data?.prestashop;
    if (!node) return "";

    const entityKey = Object.keys(node).find((key) => key !== "@_xmlns:xlink");
    if (!entityKey) return "";

    return getText(node[entityKey]?.id);
}

export async function getCountries() {
    const response = await fetch(
        "/api/countries?display=[id,name]&filter[active]=1",
        { headers }
    );

    if (!response.ok) {
        return [];
    }

    const data = parser.parse(await response.text());
    const list = data?.prestashop?.countries?.country;
    const items = Array.isArray(list) ? list : list ? [list] : [];

    return items
        .map((country) => ({
            id: getText(country.id ?? country["@_id"]),
            name: getText(country.name?.language),
        }))
        .filter((country) => country.id && country.name);
}

export async function getCustomerById(id) {
    const response = await fetch(`/api/customers/${id}`, { headers });

    if (!response.ok) {
        throw new Error("Impossible de recuperer le client");
    }

    const data = parser.parse(await response.text());
    const customer = data?.prestashop?.customer;

    return {
        id: getText(customer?.id),
        secureKey: getText(customer?.secure_key),
        firstname: getText(customer?.firstname),
        lastname: getText(customer?.lastname),
        email: getText(customer?.email),
    };
}

export async function createCustomer({
    firstname,
    lastname,
    email,
    password,
    isGuest,
    langId = DEFAULTS.langId,
    shopId = DEFAULTS.shopId,
    shopGroupId = DEFAULTS.shopGroupId,
}) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <firstname>${escapeXml(firstname)}</firstname>
    <lastname>${escapeXml(lastname)}</lastname>
    <email>${escapeXml(email)}</email>
    <passwd>${escapeXml(password)}</passwd>
    <id_lang>${escapeXml(langId)}</id_lang>
    <id_shop>${escapeXml(shopId)}</id_shop>
    <id_shop_group>${escapeXml(shopGroupId)}</id_shop_group>
    <active>1</active>
    <is_guest>${isGuest ? "1" : "0"}</is_guest>
    <newsletter>0</newsletter>
    <optin>0</optin>
  </customer>
</prestashop>`;

    const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur creation client:", errorText);
        throw new Error("Impossible de creer le client");
    }

    const id = await parseIdFromResponse(response);
    const customer = await getCustomerById(id);

    return {
        id: customer.id,
        secureKey: customer.secureKey,
    };
}

export async function createAddress({
    idCustomer,
    alias,
    firstname,
    lastname,
    address1,
    address2,
    postcode,
    city,
    idCountry,
    phone,
    company,
    vatNumber,
}) {
    const optional = (tag, value) => {
        if (!value) return "";
        return `<${tag}>${escapeXml(value)}</${tag}>`;
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <address>
    <id_customer>${escapeXml(idCustomer)}</id_customer>
    <id_country>${escapeXml(idCountry)}</id_country>
    <alias>${escapeXml(alias)}</alias>
    <firstname>${escapeXml(firstname)}</firstname>
    <lastname>${escapeXml(lastname)}</lastname>
    <address1>${escapeXml(address1)}</address1>
    ${optional("address2", address2)}
    <postcode>${escapeXml(postcode)}</postcode>
    <city>${escapeXml(city)}</city>
    ${optional("phone", phone)}
    ${optional("company", company)}
    ${optional("vat_number", vatNumber)}
    <active>1</active>
  </address>
</prestashop>`;

    const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur creation adresse:", errorText);
        throw new Error("Impossible de creer l'adresse");
    }

    return await parseIdFromResponse(response);
}

export async function createOrder({
    cartId,
    customerId,
    addressId,
    secureKey,
    orderRows,
    totalProducts,
    totalPaid,
    currencyId = DEFAULTS.currencyId,
    langId = DEFAULTS.langId,
    shopId = DEFAULTS.shopId,
    shopGroupId = DEFAULTS.shopGroupId,
    carrierId = DEFAULTS.carrierId,
    currentStateId = DEFAULTS.orderStateId,
    paymentModule = DEFAULTS.paymentModule,
    paymentLabel = DEFAULTS.paymentLabel,
}) {
    const rowsXml = orderRows
        .map(
            (row) => `
      <order_row>
        <product_id>${escapeXml(row.productId)}</product_id>
        <product_attribute_id>${escapeXml(row.productAttributeId || "0")}</product_attribute_id>
        <product_quantity>${escapeXml(row.quantity)}</product_quantity>
        <product_name>${escapeXml(row.name)}</product_name>
        <product_reference>${escapeXml(row.reference || "")}</product_reference>
        <product_price>${formatAmount(row.price)}</product_price>
        <id_customization>0</id_customization>
        <unit_price_tax_incl>${formatAmount(row.price)}</unit_price_tax_incl>
        <unit_price_tax_excl>${formatAmount(row.price)}</unit_price_tax_excl>
      </order_row>`
        )
        .join("");

    const totals = {
        totalDiscounts: "0.000000",
        totalPaid: formatAmount(totalPaid),
        totalProducts: formatAmount(totalProducts),
        totalShipping: "0.000000",
        totalWrapping: "0.000000",
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order>
    <id_address_delivery>${escapeXml(addressId)}</id_address_delivery>
    <id_address_invoice>${escapeXml(addressId)}</id_address_invoice>
    <id_cart>${escapeXml(cartId)}</id_cart>
    <id_currency>${escapeXml(currencyId)}</id_currency>
    <id_lang>${escapeXml(langId)}</id_lang>
    <id_customer>${escapeXml(customerId)}</id_customer>
    <id_carrier>${escapeXml(carrierId)}</id_carrier>
    <current_state>${escapeXml(currentStateId)}</current_state>
    <module>${escapeXml(paymentModule)}</module>
    <valid>1</valid>
    <id_shop_group>${escapeXml(shopGroupId)}</id_shop_group>
    <id_shop>${escapeXml(shopId)}</id_shop>
    <secure_key>${escapeXml(secureKey)}</secure_key>
    <payment>${escapeXml(paymentLabel)}</payment>
    <recyclable>0</recyclable>
    <gift>0</gift>
    <mobile_theme>0</mobile_theme>
    <total_discounts>${totals.totalDiscounts}</total_discounts>
    <total_discounts_tax_incl>${totals.totalDiscounts}</total_discounts_tax_incl>
    <total_discounts_tax_excl>${totals.totalDiscounts}</total_discounts_tax_excl>
    <total_paid>${totals.totalPaid}</total_paid>
    <total_paid_tax_incl>${totals.totalPaid}</total_paid_tax_incl>
    <total_paid_tax_excl>${totals.totalPaid}</total_paid_tax_excl>
    <total_paid_real>0.000000</total_paid_real>
    <total_products>${totals.totalProducts}</total_products>
    <total_products_wt>${totals.totalProducts}</total_products_wt>
    <total_shipping>${totals.totalShipping}</total_shipping>
    <total_shipping_tax_incl>${totals.totalShipping}</total_shipping_tax_incl>
    <total_shipping_tax_excl>${totals.totalShipping}</total_shipping_tax_excl>
    <carrier_tax_rate>0.000</carrier_tax_rate>
    <total_wrapping>${totals.totalWrapping}</total_wrapping>
    <total_wrapping_tax_incl>${totals.totalWrapping}</total_wrapping_tax_incl>
    <total_wrapping_tax_excl>${totals.totalWrapping}</total_wrapping_tax_excl>
    <round_mode>0</round_mode>
    <round_type>0</round_type>
    <conversion_rate>1.000000</conversion_rate>
    <associations>
      <order_rows>
        ${rowsXml}
      </order_rows>
    </associations>
  </order>
</prestashop>`;

    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/xml",
        },
        body: xml,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur creation commande:", errorText);
        throw new Error("Impossible de creer la commande");
    }

    return await parseIdFromResponse(response);
}
