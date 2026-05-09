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