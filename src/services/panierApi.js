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

export async function getPanierId() {
    const response = await fetch(`/Eval/api/carts`, { headers });
    const xml = await response.text();
    const data = parser.parse(xml);

    const panier = data?.prestashop?.carts?.cart;
    const list = Array.isArray(panier) ? panier: panier ? [panier] : [];

    return list.map((c) => {
        const id =
            c["@_id"] ??
            c.id ??
            (c["@_xlink:href"] ? c["@_xlink:href"].split("/").pop() : "");
        return String(id || "");
    });
}

export async function deleteAllPanier() {
    const ids = await getPanierId();
    const results = [];

    for (const id of ids){
        const res = await fetch(`/Eval/api/carts/${id}`, {
            method: "DELETE",
            headers,
        });

        results.push({id, ok: res.ok, status: res.status});
    }
    return results;
}