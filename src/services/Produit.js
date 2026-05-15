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

export async function getProducts() {
    const response = await fetch(`/api/products`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`Products request failed: ${response.status}`);
    }

    const xml = await response.text();

    const data = parser.parse(xml);

    const productList = data?.prestashop?.products?.product;
    const list = Array.isArray(productList)
        ? productList
        : productList
        ? [productList]
        : [];

    const fullProducts = await Promise.all(
        list.map(async (p) => {

            const id = p["@_id"];

            const res = await fetch(`/api/products/${id}`, {
                headers,
            });

            if (!res.ok) {
                return null;
            }

            const xmlDetail = await res.text();

            const detailData = parser.parse(xmlDetail);

            const product = detailData.prestashop.product;

            return {
                id: getText(product.id),
                name: getText(product.name?.language) || "N/A",
                reference: getText(product.reference),
                price_ht: getText(product.price),
                price_ttc: getText(product.price),
                active: getText(product.active),
                id_default_image: getText(product.id_default_image),
            };
        })
    );

    return fullProducts.filter(Boolean);
}

export async function getProductById(id) {
    const response = await fetch(`/api/products/${id}`, {
        headers,
    });

    const xmlDetail = await response.text();
    const detailData = parser.parse(xmlDetail);
    const product = detailData.prestashop.product;

    // Dans getProductById()
    return {
        id: product.id,
        name: getText(product.name?.language) || "N/A",
        reference: getText(product.reference),
        price_ht: getText(product.price),
        price_ttc: getText(product.price),
        active: getText(product.active),

        id_default_image: getText(product.id_default_image),
        manufacturer_name: getText(product.manufacturer_name),
        quantity: getText(product.quantity),
        description_short: getText(product.description_short?.language),
        description: getText(product.description?.language),
        condition: getText(product.condition),
        width: getText(product.width),
        height: getText(product.height),
        depth: getText(product.depth),
        weight: getText(product.weight),
        on_sale: getText(product.on_sale),
        date_add: getText(product.date_add),

        images: [
        buildImageUrl({
            id: product.id,
            id_default_image: getText(product.id_default_image),
        })
    ],
    };

}

export async function getProduitId() {
    const response = await fetch(`/api/products`, { headers });
    const xml = await response.text();
    const data = parser.parse(xml);

    const produit = data?.prestashop?.products?.product;
    const list = Array.isArray(produit) ? produit: produit ? [produit] : [];

    return list.map((c) => {
        const id =
            c["@_id"] ??
            c.id ??
            (c["@_xlink:href"] ? c["@_xlink:href"].split("/").pop() : "");
        return String(id || "");
    });
}

export async function deleteAllProducts() {
    const ids = await getProduitId();
    const results = [];

    for (const id of ids){
        const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers,
        });

        results.push({id, ok: res.ok, status: res.status});
    }
    return results;
}

const STATIC_FALLBACK = "/placeholder.png";

const buildImageUrl = (p) => {
    if (p?.id && p?.id_default_image) {
        return `/api/images/products/${p.id}/${p.id_default_image}?ws_key=${import.meta.env.VITE_PRESTASHOP_API_KEY}`;
    }

    return STATIC_FALLBACK;
};