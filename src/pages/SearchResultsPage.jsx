import { useSearchParams } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import ProductGrid from "../components/ProductGrid";
import { mockProducts } from "../services/mockData";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const results = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <SectionHeader
        title={`Resultats pour "${query}"`}
        subtitle={`${results.length} produits trouves`}
      />
      {results.length === 0 ? (
        <p>Aucun produit ne correspond a votre recherche.</p>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
}
