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
    console.log("HEADER:", JSON.stringify(header));
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
const taxRuleGroupCache = new Map();

const getLanguageText = (node) => {
    if (!node) return "";
    if (typeof node === "string") return node;
    const lang = Array.isArray(node.language) ? node.language[0] : node.language;
    return lang?.["#text"] ?? "";
};

// ─── Tax helpers ───────────────────────────────────────────────

/**
 * Fetch all existing taxes and return the list.
 */
async function fetchAllTaxes() {
    const res = await fetch(`/Eval/api/taxes?display=full`, { headers });
    const xml = await res.text();
    const data = parser.parse(xml);
    const taxes = data?.prestashop?.taxes?.tax;
    return Array.isArray(taxes) ? taxes : taxes ? [taxes] : [];
}

/**
 * Fetch all existing tax rule groups and return the list.
 */
async function fetchAllTaxRuleGroups() {
    const res = await fetch(`/Eval/api/tax_rule_groups?display=full`, { headers });
    const xml = await res.text();
    const data = parser.parse(xml);
    const groups = data?.prestashop?.tax_rule_groups?.tax_rule_group;
    return Array.isArray(groups) ? groups : groups ? [groups] : [];
}

/**
 * Create a new tax with the given rate.
 * Returns the created tax id.
 */
async function createTax(rate) {
    const name = `Taxe ${rate}%`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <tax>
    <rate><![CDATA[${rate}]]></rate>
    <active><![CDATA[1]]></active>
    <name>
      <language id="1"><![CDATA[${name}]]></language>
    </name>
  </tax>
</prestashop>`;

    const res = await fetch(`/Eval/api/taxes`, {
        method: "POST",
        headers,
        body: xml,
    });

    const text = await res.text();
    console.log("CREATE TAX response:", text);

    if (!res.ok) {
        throw new Error(`Erreur création taxe ${rate}%: ${res.status} – ${text}`);
    }

    const parsed = parser.parse(text);
    return parsed?.prestashop?.tax?.id;
}

/**
 * Create a new tax rule group.
 * Returns the created group id.
 */
async function createTaxRuleGroup(rate) {
    const name = `FR Taxe (${rate}%)`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <tax_rule_group>
    <name><![CDATA[${name}]]></name>
    <active><![CDATA[1]]></active>
  </tax_rule_group>
</prestashop>`;

    const res = await fetch(`/Eval/api/tax_rule_groups`, {
        method: "POST",
        headers,
        body: xml,
    });

    const text = await res.text();
    console.log("CREATE TAX RULE GROUP response:", text);

    if (!res.ok) {
        throw new Error(`Erreur création tax_rule_group ${rate}%: ${res.status} – ${text}`);
    }

    const parsed = parser.parse(text);
    return parsed?.prestashop?.tax_rule_group?.id;
}

/**
 * Create a tax_rule linking a tax to a tax_rule_group for all countries (id_country = 0 means all).
 * For France specifically, id_country = 8.
 */
async function createTaxRule(taxRuleGroupId, taxId) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <tax_rule>
    <id_tax_rules_group><![CDATA[${taxRuleGroupId}]]></id_tax_rules_group>
    <id_tax><![CDATA[${taxId}]]></id_tax>
    <id_country><![CDATA[8]]></id_country>
    <id_state><![CDATA[0]]></id_state>
    <zipcode_from><![CDATA[0]]></zipcode_from>
    <zipcode_to><![CDATA[0]]></zipcode_to>
    <behavior><![CDATA[0]]></behavior>
  </tax_rule>
</prestashop>`;

    const res = await fetch(`/Eval/api/tax_rules`, {
        method: "POST",
        headers,
        body: xml,
    });

    const text = await res.text();
    console.log("CREATE TAX RULE response:", text);

    if (!res.ok) {
        throw new Error(`Erreur création tax_rule: ${res.status} – ${text}`);
    }

    return true;
}

/**
 * Find or create the tax rule group for a given tax rate (from CSV).
 * Steps:
 *   1. Look up existing taxes to find one matching `rate`
 *   2. If none found, create it
 *   3. Look up existing tax rule groups and their linked tax rules
 *   4. If a group already uses that tax, return its id
 *   5. Otherwise create a new group + tax_rule
 */
async function getOrCreateTaxRuleGroupId(rate) {
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum === 0) return 0;

    // Check cache
    if (taxRuleGroupCache.has(rateNum)) {
        return taxRuleGroupCache.get(rateNum);
    }

    // 1) Find or create the tax
    let taxId = null;
    const allTaxes = await fetchAllTaxes();
    console.log("ALL TAXES:", JSON.stringify(allTaxes));

    for (const t of allTaxes) {
        const existingRate = parseFloat(
            String(getLanguageText(t.rate) || t.rate).replace(",", ".")
        );
        if (Math.abs(existingRate - rateNum) < 0.01) {
            taxId = t.id ?? t["@_id"];
            break;
        }
    }

    if (!taxId) {
        console.log(`Taxe ${rateNum}% introuvable, création...`);
        taxId = await createTax(rateNum);
    }
    console.log(`Tax ID pour ${rateNum}%: ${taxId}`);

    // 2) Find an existing tax_rule_group already linked to this tax
    //    We check all tax_rules for a group that uses our taxId
    // const allGroups = await fetchAllTaxRuleGroups();

    // Try to find a group that matches by looking at tax_rules
    const taxRulesRes = await fetch(`/Eval/api/tax_rules?display=full`, { headers });
    const taxRulesXml = await taxRulesRes.text();
    const taxRulesData = parser.parse(taxRulesXml);
    const allTaxRules = (() => {
        const rules = taxRulesData?.prestashop?.tax_rules?.tax_rule;
        return Array.isArray(rules) ? rules : rules ? [rules] : [];
    })();

    console.log("ALL TAX RULES:", JSON.stringify(allTaxRules));

    // Find a group that has a tax_rule pointing to our taxId
    for (const rule of allTaxRules) {
        const ruleTaxId = String(rule.id_tax ?? "").trim();
        if (ruleTaxId === String(taxId)) {
            const groupId = String(rule.id_tax_rules_group ?? "").trim();
            if (groupId) {
                console.log(`Tax rule group ${groupId} trouvé pour taxe ${rateNum}%`);
                taxRuleGroupCache.set(rateNum, groupId);
                return groupId;
            }
        }
    }

    // 3) No existing group found → create one
    console.log(`Aucun tax_rule_group pour ${rateNum}%, création...`);
    const newGroupId = await createTaxRuleGroup(rateNum);
    console.log(`Nouveau tax_rule_group id: ${newGroupId}`);

    // 4) Create tax_rule linking the new group to the tax
    await createTaxRule(newGroupId, taxId);
    console.log(`Tax rule créé: group ${newGroupId} → tax ${taxId}`);

    taxRuleGroupCache.set(rateNum, newGroupId);
    return newGroupId;
}

// ─── Category helpers ─────────────────────────────────────────

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

// ─── Product creation ─────────────────────────────────────────

export async function createProduct(product) {
    const categoryId = await getOrCreateCategoryId(product.categorie, 2);
    const availableDate = toDateIso(product.date_availability_produit);

    // --- FIX 1: Resolve the correct tax rule group from the CSV tax rate ---
    const taxRate = parseFloat(product.taxe) || 0;
    const taxRuleGroupId = await getOrCreateTaxRuleGroupId(taxRate);

    // --- FIX 2: Calculate HT from TTC ---
    // CSV gives prix_ttc. PrestaShop <price> expects HT (excluding tax).
    // prix_ht = prix_ttc / (1 + taxe / 100)
    const prixTtc = parseFloat(product.prix_ttc) || 0;
    const prixHt = taxRate > 0
        ? (prixTtc / (1 + taxRate / 100)).toFixed(6)
        : prixTtc.toFixed(6);

    console.log(
        `PRIX: TTC=${prixTtc}, Taxe=${taxRate}%, HT calculé=${prixHt}, ` +
        `tax_rule_group=${taxRuleGroupId}`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <id_category_default><![CDATA[${categoryId}]]></id_category_default>
    <id_tax_rules_group><![CDATA[${taxRuleGroupId}]]></id_tax_rules_group>
    <name>
      <language id="1"><![CDATA[${product.nom}]]></language>
    </name>
    <link_rewrite>
      <language id="1"><![CDATA[${slugify(product.nom)}]]></language>
    </link_rewrite>
    <reference><![CDATA[${product.reference}]]></reference>
    <price><![CDATA[${prixHt}]]></price>
    <wholesale_price><![CDATA[${product.prix_achat}]]></wholesale_price>
    ${availableDate ? `<available_date><![CDATA[${availableDate}]]></available_date>` : ""}
    <product_type><![CDATA[standard]]></product_type>
    <state><![CDATA[1]]></state>
    <minimal_quantity><![CDATA[1]]></minimal_quantity>
    <additional_delivery_times><![CDATA[1]]></additional_delivery_times>
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