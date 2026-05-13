import { useMemo, useState } from "react";

import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import SectionHeader from "../components/SectionHeader";
import { mockProducts } from "../services/mockData";

const ITEMS_PER_PAGE = 6;

export default function ProductListingPage() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(mockProducts.length / ITEMS_PER_PAGE);

  const products = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return mockProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [page]);

  return (
    <div className="page">
      <SectionHeader
        title="Catalogue"
        subtitle="Un mix de bestsellers et de nouvelles sorties."
        action={<button className="button button--ghost">Filtrer</button>}
      />

      <div className="toolbar">
        <span>{mockProducts.length} produits</span>
        <div className="toolbar__actions">
          <button className="chip chip--active" type="button">
            Populaire
          </button>
          <button className="chip" type="button">
            Prix
          </button>
          <button className="chip" type="button">
            Nouveaute
          </button>
        </div>
      </div>

      <ProductGrid products={products} />

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
