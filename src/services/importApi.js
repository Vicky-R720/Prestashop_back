import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

const headers = {
    Authorization: `Basic ${btoa(import.meta.env.VITE_PRESTASHOP_API_KEY + ":")}`,
    "Content-Type": "application/xml",
};

const toNumber = (value) => {
    if (!value) return "0";
    return String(value).replace("%", "").replace(",", ".").trim();
};

function parseCsvLine(line, sep = ",") {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === sep && !inQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

function detectSeparator(headerLine) {
    const semicolons = (headerLine.match(/;/g) || []).length;
    const commas = (headerLine.match(/,/g) || []).length;
    return semicolons > commas ? ";" : ",";
}

export function parseCsvProduits(csvText) {
    const lines = csvText
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const [header, ...rows] = lines;
    console.log("HEADER:", JSON.stringify(header));        // ← ajoute
    console.log("ROWS[0]:", JSON.stringify(rows[0])); 

    const sep = detectSeparator(header);
    console.log("SEP:", sep);  
    const cols = parseCsvLine(header, sep).map((c) => c.trim());
    console.log("COLS:", cols); 

    
    return rows.map((row) => {

        const cleanRow = row.startsWith('"') && row.endsWith('"')
            ? row.slice(1, -1).replace(/""/g, '"')
            : row;
        console.log("CLEAN ROW:", JSON.stringify(cleanRow));
        const values = parseCsvLine(cleanRow, sep);
        const obj = Object.fromEntries(cols.map((c, i) => [c, values[i] ?? ""]));
        console.log("ROW OBJ:", obj);
        return {
            date_availability_produit: obj.date_availability_produit,
            nom: obj.nom,
            reference: obj.reference,
            prix_ttc: toNumber(obj.prix_ttc),
            taxe: toNumber(obj.Taxe),
            categorie: obj.categorie,
            prix_achat: toNumber(obj.prix_achat),
        };
    });
}

const toDateIso = (dmy) => {
    if (!dmy || !dmy.includes("/")) return "";
    const [dd, mm, yyyy] = dmy.split("/");
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm}-${dd}`;
};

const slugify = (s) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const categoryCache = new Map();

const getLanguageText = (node) => {
    if (!node) return "";
    if (typeof node === "string") return node;
    const lang = Array.isArray(node.language) ? node.language[0] : node.language;
    return lang?.["#text"] ?? "";
};

async function createCategory(name, parentId = 2) {
    console.log("CREATE CATEGORY:", name);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <category>
    <id_parent><![CDATA[${parentId}]]></id_parent>
    <active><![CDATA[1]]></active>
    <name>
      <language id="1"><![CDATA[${name}]]></language>
    </name>
    <link_rewrite>
      <language id="1"><![CDATA[${slugify(name)}]]></language>
    </link_rewrite>
  </category>
</prestashop>`;

    const res = await fetch(`/Eval/api/categories`, {
        method: "POST",
        headers,
        body: xml,
    });

    const text = await res.text();
    return { ok: res.ok, status: res.status, xml: text };
}

async function getOrCreateCategoryId(name, parentId = 2) {
    if (!name) return parentId;
    console.log("getOrCreateCategoryId name:", name);
    if (categoryCache.has(name)) return categoryCache.get(name);
    const res = await fetch(`/Eval/api/categories?display=[id,name]`, { headers });
    const xml = await res.text();
    const data = parser.parse(xml);
    const categories = data?.prestashop?.categories?.category;
    const list = Array.isArray(categories) ? categories : categories ? [categories] : [];
    

    const target = name.trim().toLowerCase();
    const found = list.find((c) => {
        const n = getLanguageText(c?.name).trim().toLowerCase();
        return n === target;
    });

    if (found) {
        const id = found.id ?? found["@_id"] ?? parentId;
        categoryCache.set(name, id);
        return id;
    }

    await createCategory(name, parentId);

    const res2 = await fetch(`/Eval/api/categories?display=[id,name]`, { headers });
    const xml2 = await res2.text();
    const data2 = parser.parse(xml2);
    const categories2 = data2?.prestashop?.categories?.category;
    const list2 = Array.isArray(categories2) ? categories2 : categories2 ? [categories2] : [];

    const found2 = list2.find((c) => {
        const n = getLanguageText(c?.name).trim().toLowerCase();
        return n === target;
    });

    const id2 = found2?.id ?? found2?.["@_id"] ?? parentId;
    categoryCache.set(name, id2);
    return id2;
}

export async function createProduct(product) {
    const categoryId = await getOrCreateCategoryId(product.categorie, 2);
    const availableDate = toDateIso(product.date_availability_produit);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <id_category_default><![CDATA[${categoryId}]]></id_category_default>
    <name>
      <language id="1"><![CDATA[${product.nom}]]></language>
    </name>
    <link_rewrite>
      <language id="1"><![CDATA[${slugify(product.nom)}]]></language>
    </link_rewrite>
    <reference><![CDATA[${product.reference}]]></reference>
    <price><![CDATA[${product.prix_ttc}]]></price>
    <wholesale_price><![CDATA[${product.prix_achat}]]></wholesale_price>
    ${availableDate ? `<available_date><![CDATA[${availableDate}]]></available_date>` : ""}
    <visibility><![CDATA[both]]></visibility>
    <available_for_order><![CDATA[1]]></available_for_order>
    <show_price><![CDATA[1]]></show_price>
    <indexed><![CDATA[1]]></indexed>
    <active><![CDATA[1]]></active>
    <associations>
      <categories>
        <category><id><![CDATA[${categoryId}]]></id></category>
      </categories>
    </associations>
  </product>
</prestashop>`;

    console.log("PRODUCT:", JSON.stringify(product));
    console.log("availableDate:", availableDate);
    console.log("XML envoyé:", xml);

    const res = await fetch(`/Eval/api/products`, {
        method: "POST",
        headers,
        body: xml,
    });

    return { ok: res.ok, status: res.status, xml: await res.text() };
}

export async function importProduits(csvText) {
    const produits = parseCsvProduits(csvText);
    const results = [];

    for (const p of produits) {
        const result = await createProduct(p);
        results.push({ ref: p.reference, ...result });
    }

    return results;
}