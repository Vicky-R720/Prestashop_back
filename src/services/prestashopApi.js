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

export async function getProducts() {

    const response = await fetch(`/Eval/api/products`, {
        headers,
    });

    const xml = await response.text();

    const data = parser.parse(xml);

    const productList = data.prestashop.products.product;

    const fullProducts = await Promise.all(
        productList.map(async (p) => {

            const id = p["@_id"];

            const res = await fetch(`/Eval/api/products/${id}`, {
                headers,
            });

            const xmlDetail = await res.text();

            const detailData = parser.parse(xmlDetail);

            const product = detailData.prestashop.product;

            return {
                id: product.id,
                name: product.name?.language?.["#text"] || "N/A",
                reference: product.reference || "",
                price_ht: product.price,
                price_ttc: product.price,
                active: product.active,
            };
        })
    );

    return fullProducts;
}

export async function getProductById(id) {
    const response = await fetch(`/Eval/api/products/${id}`, {
        headers,
    });

    const xmlDetail = await response.text();
    const detailData = parser.parse(xmlDetail);
    const product = detailData.prestashop.product;

    // Helper simple pour extraire le texte
    const getText = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            return String(v);
        }
        if (Array.isArray(v)) return getText(v[0]);
        return v["#text"] ?? "";
    };

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
    };

}
